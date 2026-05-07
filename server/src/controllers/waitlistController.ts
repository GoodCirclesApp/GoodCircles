import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendWaitlistConfirmEmail, sendWaitlistOverflowEmail } from '../services/waitlistEmailService';

const COUNT_FLOOR  = 2847;
const WAITLIST_CAP = parseInt(process.env.WAITLIST_CAP ?? '10000', 10);

let cachedCount: number | null = null;
let cacheExpiresAt = 0;

function generateInviteCode(role: string): string {
  const prefix = role.substring(0, 1).toUpperCase() === 'M' && role === 'MUNICIPAL'
    ? 'MUN'
    : role.substring(0, 3).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GC-${prefix}-${suffix}`;
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'gc-salt').digest('hex').substring(0, 16);
}

const BaseSchema = z.object({
  email:      z.string().email(),
  role:       z.enum(['NEIGHBOR', 'MERCHANT', 'NONPROFIT', 'CDFI', 'MUNICIPAL']),
  zipCode:    z.string().optional(),
  city:       z.string().optional(),
  state:      z.string().optional(),
  referrer:   z.string().optional(),
  utmSource:  z.string().optional(),
  utmCampaign: z.string().optional(),

  // NEIGHBOR
  preferredCauseHint: z.string().optional(),

  // MERCHANT
  businessName: z.string().optional(),
  website:      z.string().optional(),
  category:     z.string().optional(),

  // NONPROFIT
  orgName: z.string().optional(),
  ein:     z.string().optional(),

  // CDFI
  cdfiCertNumber: z.string().optional(),
  lendingRegions: z.array(z.string()).optional(),

  // MUNICIPAL
  jurisdiction:      z.string().optional(),
  decisionMakerRole: z.string().optional(),
  interestArea:      z.string().optional(),
  requestBriefing:   z.boolean().optional(),
});

export const submitWaitlist = async (req: Request, res: Response) => {
  const parsed = BaseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const data = parsed.data;
  const ip   = (req.ip ?? req.socket.remoteAddress ?? '').replace('::ffff:', '');

  // Check for duplicate email
  const existing = await prisma.waitlistEntry.findUnique({ where: { email: data.email } });
  if (existing) {
    return res.json({ position: existing.position + COUNT_FLOOR, inviteCode: existing.inviteCode, alreadyRegistered: true });
  }

  // Check cap — route to overflow if full
  const currentCount = await prisma.waitlistEntry.count();
  if (currentCount >= WAITLIST_CAP) {
    // Add to overflow (idempotent — ignore duplicate email)
    try {
      await prisma.waitlistOverflow.upsert({
        where:  { email: data.email },
        update: {},
        create: { email: data.email, role: data.role },
      });
      sendWaitlistOverflowEmail({ email: data.email, role: data.role })
        .catch(err => console.error('[Waitlist] Overflow email error:', err));
    } catch {
      // Silently swallow — overflow capture is best-effort
    }
    return res.json({ overflow: true });
  }

  const inviteCode = generateInviteCode(data.role);

  const launchPerks = buildLaunchPerks(data.role);

  let entry;
  try {
    entry = await prisma.waitlistEntry.create({
      data: {
        email:             data.email,
        role:              data.role,
        inviteCode,
        zipCode:           data.zipCode,
        city:              data.city,
        state:             data.state,
        referrer:          data.referrer,
        utmSource:         data.utmSource,
        utmCampaign:       data.utmCampaign,
        ipHash:            ip ? hashIp(ip) : undefined,
        preferredCauseHint: data.preferredCauseHint,
        businessName:      data.businessName,
        website:           data.website,
        category:          data.category,
        orgName:           data.orgName,
        ein:               data.ein,
        cdfiCertNumber:    data.cdfiCertNumber,
        lendingRegions:    data.lendingRegions ?? [],
        jurisdiction:      data.jurisdiction,
        decisionMakerRole: data.decisionMakerRole,
        interestArea:      data.interestArea,
        requestBriefing:   data.requestBriefing ?? false,
        launchPerks,
      },
    });
  } catch (err: any) {
    // Race condition on unique email — return existing entry
    if (err.code === 'P2002') {
      const dup = await prisma.waitlistEntry.findUnique({ where: { email: data.email } });
      if (dup) return res.json({ position: dup.position + COUNT_FLOOR, inviteCode: dup.inviteCode, alreadyRegistered: true });
    }
    console.error('[Waitlist] Create error:', err.message);
    return res.status(500).json({ error: 'Failed to save your spot. Please try again.' });
  }

  // Invalidate count cache
  cachedCount = null;

  const displayPosition = entry.position + COUNT_FLOOR;

  // Send confirmation email (non-blocking)
  sendWaitlistConfirmEmail({
    email:      entry.email,
    role:       entry.role,
    position:   displayPosition,
    inviteCode: entry.inviteCode,
  }).catch(err => console.error('[Waitlist] Email error:', err));

  return res.json({ position: displayPosition, inviteCode: entry.inviteCode, overflow: false });
};

export const getCount = async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cachedCount !== null && now < cacheExpiresAt) {
    return res.json({ count: Math.max(cachedCount, COUNT_FLOOR) });
  }

  try {
    const count = await prisma.waitlistEntry.count();
    cachedCount = count;
    cacheExpiresAt = now + 60_000; // 60s cache
    return res.json({ count: Math.max(count, COUNT_FLOOR) });
  } catch {
    return res.json({ count: COUNT_FLOOR });
  }
};

export const listForAdmin = async (req: Request, res: Response) => {
  const { role, page = '1', limit = '50', csv } = req.query as Record<string, string>;

  const where = role ? { role } : {};
  const skip  = (parseInt(page) - 1) * parseInt(limit);

  const [entries, total] = await Promise.all([
    prisma.waitlistEntry.findMany({
      where,
      orderBy: { position: 'asc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.waitlistEntry.count({ where }),
  ]);

  if (csv === 'true') {
    const headers = 'position,role,email,inviteCode,businessName,orgName,city,state,zipCode,requestBriefing,createdAt';
    const rows = entries.map(e =>
      [e.position, e.role, e.email, e.inviteCode, e.businessName ?? '', e.orgName ?? '',
       e.city ?? '', e.state ?? '', e.zipCode ?? '', e.requestBriefing, e.createdAt.toISOString()]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist.csv"');
    return res.send([headers, ...rows].join('\n'));
  }

  return res.json({ entries, total, page: parseInt(page), limit: parseInt(limit) });
};

export const listOverflow = async (req: Request, res: Response) => {
  const entries = await prisma.waitlistOverflow.findMany({ orderBy: { createdAt: 'asc' } });
  const { csv } = req.query as Record<string, string>;
  if (csv === 'true') {
    const headers = 'email,role,createdAt';
    const rows = entries.map(e =>
      [e.email, e.role, e.createdAt.toISOString()]
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="waitlist-overflow.csv"');
    return res.send([headers, ...rows].join('\n'));
  }
  return res.json({ entries, total: entries.length, cap: WAITLIST_CAP });
};

function buildLaunchPerks(role: string): object {
  switch (role) {
    case 'NEIGHBOR':
      return { doubleCreditsMonths: 1, description: 'One month of double-impact credits at launch' };
    case 'MERCHANT':
      return { foundingMerchant: true, priorityListing: true, earlyAccess: true, description: 'Founding Merchant designation, priority city listing, and early catalog setup access before public launch' };
    case 'NONPROFIT':
      return { preVerified: true, priorityListing: true, description: 'Pre-verified and priority-listed at launch' };
    case 'CDFI':
    case 'MUNICIPAL':
      return { privateBriefing: true, description: 'Private pre-launch briefing with founding team' };
    default:
      return {};
  }
}

// Meridian early-access elections (2026-07-06).
//
// PUBLIC surface (rate-limited):
//   GET  /api/election/seeds          — active seed nonprofits + businesses
//                                       (names/categories ONLY — never counts)
//   POST /api/election/submit         — email → zip → ONE nonprofit election +
//                                       1–10 business votes (+ optional
//                                       moderated suggestion)
//   GET  /api/election/verify/:token  — email verification; elections/votes
//                                       COUNT only after this
//
// ADMIN surface (PLATFORM / PLATFORM_VIEWER):
//   demand rankings, suggestion moderation, CSV exports, weekly digest.
//
// HONESTY RULES enforced here: no public endpoint ever returns counts,
// rankings, or any traction signal. All demand data is admin-only.
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { sendElectionVerifyEmail, sendElectionWeeklyDigest } from '../services/electionEmailService';

const MARKETING_SITE = process.env.MARKETING_SITE_URL ?? 'https://goodcircles.org';

// Common disposable-email domains (blocked from elections — verification
// integrity). Not exhaustive; extend as abuse appears.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org',
  'tempmail.dev', 'throwawaymail.com', 'yopmail.com', 'getnada.com',
  'dispostable.com', 'trashmail.com', 'maildrop.cc', 'mintemail.com',
  'mohmal.com', 'fakeinbox.com', 'spamgourmet.com', 'mailnesia.com',
  'tempinbox.com', 'emailondeck.com', 'burnermail.io', 'mytemp.email',
]);

function isDisposable(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  return DISPOSABLE_DOMAINS.has(domain);
}

function generateInviteCode(role: string): string {
  const prefix = role.substring(0, 3).toUpperCase();
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GC-${prefix}-${suffix}`;
}

function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + 'gc-salt').digest('hex').substring(0, 16);
}

// ── PUBLIC: seed lists (dropdown data — names only, alphabetized) ───────────

export const getSeeds = async (_req: Request, res: Response) => {
  try {
    const [nonprofits, businesses] = await Promise.all([
      prisma.seedNonprofit.findMany({
        where: { active: true },
        select: { id: true, name: true, category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.seedBusiness.findMany({
        where: { active: true },
        select: { id: true, name: true, category: true, area: true },
        orderBy: { name: 'asc' },
      }),
    ]);
    // Deliberately NO counts of any kind in this payload.
    return res.json({ nonprofits, businesses });
  } catch (err: any) {
    console.error('[Election] getSeeds error:', err.message);
    return res.status(500).json({ error: 'Could not load the ballot. Please try again.' });
  }
};

// ── PUBLIC: submit an election ───────────────────────────────────────────────

const SubmitSchema = z.object({
  email: z.string().email().max(254),
  firstName: z.string().max(80).optional(),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a 5-digit ZIP code'),
  nonprofitId: z.string().uuid(),
  businessIds: z.array(z.string().uuid()).min(1, 'Pick at least 1 business').max(10, 'Pick at most 10 businesses'),
  suggestion: z
    .object({
      type: z.enum(['nonprofit', 'business']),
      rawName: z.string().min(2).max(160),
      note: z.string().max(500).optional(),
    })
    .optional(),
});

export const submitElection = async (req: Request, res: Response) => {
  const parsed = SubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();
  const ip = (req.ip ?? req.socket.remoteAddress ?? '').replace('::ffff:', '');

  if (isDisposable(email)) {
    return res.status(400).json({ error: 'Please use a personal or work email address (temporary email services are not accepted).' });
  }

  const businessIds = [...new Set(data.businessIds)];
  if (businessIds.length < 1 || businessIds.length > 10) {
    return res.status(400).json({ error: 'Pick between 1 and 10 businesses.' });
  }

  try {
    // Dropdowns are the ONLY entry path: every id must exist and be active.
    const nonprofit = await prisma.seedNonprofit.findFirst({ where: { id: data.nonprofitId, active: true } });
    if (!nonprofit) return res.status(400).json({ error: 'Choose a nonprofit from the list.' });
    const bizCount = await prisma.seedBusiness.count({ where: { id: { in: businessIds }, active: true } });
    if (bizCount !== businessIds.length) {
      return res.status(400).json({ error: 'One of your business picks is no longer available — refresh and try again.' });
    }

    let entry = await prisma.waitlistEntry.findUnique({ where: { email } });

    // One election per VERIFIED email — hard stop.
    if (entry?.verifiedAt && entry.electedNonprofitId) {
      return res.status(409).json({
        error: 'This email has already made its election. One election per member keeps it fair.',
        alreadyElected: true,
      });
    }

    const verifyToken = crypto.randomBytes(24).toString('hex');

    if (!entry) {
      entry = await prisma.waitlistEntry.create({
        data: {
          email,
          role: 'NEIGHBOR',
          inviteCode: generateInviteCode('NEIGHBOR'),
          firstName: data.firstName || undefined,
          zipCode: data.zip,
          city: 'Meridian',
          state: 'MS',
          referrer: 'meridian-election',
          ipHash: ip ? hashIp(ip) : undefined,
        },
      });
    }

    // Record the (pending) election + votes. Existing rows: only election
    // fields + still-empty profile fields are touched — never core waitlist
    // data (email, role, position, inviteCode, createdAt stay untouched).
    await prisma.$transaction([
      prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: {
          electedNonprofitId: nonprofit.id,
          verifyToken,
          firstName: entry.firstName ?? (data.firstName || undefined),
          zipCode: entry.zipCode ?? data.zip,
        },
      }),
      prisma.memberBusinessVote.deleteMany({ where: { waitlistEntryId: entry.id } }),
      prisma.memberBusinessVote.createMany({
        data: businessIds.map((seedBusinessId) => ({ waitlistEntryId: entry!.id, seedBusinessId })),
      }),
      ...(data.suggestion
        ? [
            prisma.entitySuggestion.create({
              data: {
                waitlistEntryId: entry.id,
                type: data.suggestion.type,
                rawName: data.suggestion.rawName.trim(),
                note: data.suggestion.note?.trim() || undefined,
              },
            }),
          ]
        : []),
    ]);

    // Verification email (non-blocking) — election COUNTS only after verify.
    sendElectionVerifyEmail({
      email,
      firstName: entry.firstName ?? data.firstName,
      nonprofitName: nonprofit.name,
      token: verifyToken,
    }).catch((err) => console.error('[Election] Verify email error:', err));

    return res.json({ ok: true, nonprofitName: nonprofit.name, pendingVerification: true });
  } catch (err: any) {
    console.error('[Election] submit error:', err.message);
    return res.status(500).json({ error: 'Could not record your election. Please try again.' });
  }
};

// ── PUBLIC: verify link from the email ──────────────────────────────────────

export const verifyElection = async (req: Request, res: Response) => {
  const token = String(req.params.token ?? '');
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return res.redirect(302, `${MARKETING_SITE}/meridian/?verified=0`);
  }
  try {
    const entry = await prisma.waitlistEntry.findUnique({ where: { verifyToken: token } });
    if (!entry) return res.redirect(302, `${MARKETING_SITE}/meridian/?verified=0`);
    await prisma.waitlistEntry.update({
      where: { id: entry.id },
      data: {
        verifiedAt: entry.verifiedAt ?? new Date(),
        emailConfirmedAt: entry.emailConfirmedAt ?? new Date(),
        verifyToken: null, // single-use
      },
    });
    return res.redirect(302, `${MARKETING_SITE}/meridian/?verified=1`);
  } catch (err: any) {
    console.error('[Election] verify error:', err.message);
    return res.redirect(302, `${MARKETING_SITE}/meridian/?verified=0`);
  }
};

// ── ADMIN: demand rankings (PRIVATE — counts live only here) ────────────────

export const nonprofitDemand = async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const seeds = await prisma.seedNonprofit.findMany({
      where: category ? { category } : undefined,
      orderBy: { name: 'asc' },
    });
    const counts = await prisma.waitlistEntry.groupBy({
      by: ['electedNonprofitId'],
      where: { electedNonprofitId: { not: null }, verifiedAt: { not: null } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.electedNonprofitId as string, c._count._all]));
    const ranked = seeds
      .map((s) => ({ id: s.id, name: s.name, category: s.category, city: s.city, active: s.active, verifiedElections: countMap.get(s.id) ?? 0 }))
      .sort((a, b) => b.verifiedElections - a.verifiedElections || a.name.localeCompare(b.name));
    return res.json({ nonprofits: ranked });
  } catch (err: any) {
    console.error('[Election] nonprofitDemand error:', err.message);
    return res.status(500).json({ error: 'Failed to load demand data' });
  }
};

export const businessDemand = async (req: Request, res: Response) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const area = typeof req.query.area === 'string' ? req.query.area : undefined;
    const seeds = await prisma.seedBusiness.findMany({
      where: { ...(category ? { category } : {}), ...(area ? { area } : {}) },
      orderBy: { name: 'asc' },
    });
    const counts = await prisma.memberBusinessVote.groupBy({
      by: ['seedBusinessId'],
      where: { member: { verifiedAt: { not: null } } },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map((c) => [c.seedBusinessId, c._count._all]));
    const ranked = seeds
      .map((s) => ({ id: s.id, name: s.name, category: s.category, area: s.area, ownershipType: s.ownershipType, active: s.active, verifiedVotes: countMap.get(s.id) ?? 0 }))
      .sort((a, b) => b.verifiedVotes - a.verifiedVotes || a.name.localeCompare(b.name));
    return res.json({ businesses: ranked });
  } catch (err: any) {
    console.error('[Election] businessDemand error:', err.message);
    return res.status(500).json({ error: 'Failed to load demand data' });
  }
};

// ── ADMIN: suggestion moderation ─────────────────────────────────────────────

export const listSuggestions = async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : 'pending';
    const suggestions = await prisma.entitySuggestion.findMany({
      where: { status },
      orderBy: { createdAt: 'asc' },
      include: { member: { select: { firstName: true, zipCode: true } } },
    });
    return res.json({
      suggestions: suggestions.map((s) => ({
        id: s.id,
        type: s.type,
        rawName: s.rawName,
        note: s.note,
        status: s.status,
        createdAt: s.createdAt,
        memberFirstName: s.member?.firstName ?? null,
        memberZip: s.member?.zipCode ?? null,
      })),
    });
  } catch (err: any) {
    console.error('[Election] listSuggestions error:', err.message);
    return res.status(500).json({ error: 'Failed to load suggestions' });
  }
};

const ApproveSchema = z.object({
  // Admin supplies/curates the final fields — promotion is a deliberate
  // manual act, never automatic.
  name: z.string().min(2).max(160).optional(), // defaults to cleaned rawName
  category: z.string().min(2).max(60),
  city: z.string().max(80).optional(), // nonprofit
  area: z.string().max(80).optional(), // business
  ownershipType: z.string().max(40).optional(), // business
  source: z.string().max(300).optional(),
});

export const approveSuggestion = async (req: Request, res: Response) => {
  const parsed = ApproveSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  try {
    const suggestion = await prisma.entitySuggestion.findUnique({ where: { id: String(req.params.id) } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    if (suggestion.status !== 'pending') return res.status(409).json({ error: `Already ${suggestion.status}` });

    const name = (parsed.data.name ?? suggestion.rawName).trim();
    if (suggestion.type === 'nonprofit') {
      await prisma.seedNonprofit.upsert({
        where: { name },
        update: { active: true },
        create: {
          name,
          category: parsed.data.category,
          city: parsed.data.city ?? 'Meridian',
          source: parsed.data.source ?? 'member-suggestion (admin approved)',
        },
      });
    } else {
      await prisma.seedBusiness.upsert({
        where: { name },
        update: { active: true },
        create: {
          name,
          category: parsed.data.category,
          area: parsed.data.area,
          ownershipType: parsed.data.ownershipType ?? 'independent',
          source: parsed.data.source ?? 'member-suggestion (admin approved)',
        },
      });
    }
    await prisma.entitySuggestion.update({ where: { id: suggestion.id }, data: { status: 'approved' } });
    return res.json({ ok: true, promotedName: name });
  } catch (err: any) {
    console.error('[Election] approveSuggestion error:', err.message);
    return res.status(500).json({ error: 'Failed to approve suggestion' });
  }
};

export const rejectSuggestion = async (req: Request, res: Response) => {
  try {
    const suggestion = await prisma.entitySuggestion.findUnique({ where: { id: String(req.params.id) } });
    if (!suggestion) return res.status(404).json({ error: 'Suggestion not found' });
    if (suggestion.status !== 'pending') return res.status(409).json({ error: `Already ${suggestion.status}` });
    await prisma.entitySuggestion.update({ where: { id: suggestion.id }, data: { status: 'rejected' } });
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('[Election] rejectSuggestion error:', err.message);
    return res.status(500).json({ error: 'Failed to reject suggestion' });
  }
};

// ── ADMIN: CSV exports ───────────────────────────────────────────────────────

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

// kind=nonprofit|business, type=outreach|full.
// outreach: counts + elector FIRST NAMES only (safe to hand to an outreach
// volunteer). full: includes emails — clearly marked ADMIN-CONFIDENTIAL.
export const exportDemandCsv = async (req: Request, res: Response) => {
  const kind = req.query.kind === 'business' ? 'business' : 'nonprofit';
  const type = req.query.type === 'full' ? 'full' : 'outreach';
  try {
    const lines: string[] = [];
    if (type === 'full') {
      lines.push('# ADMIN-CONFIDENTIAL — contains member emails. Do not share outside Good Circles admin.');
    }
    if (kind === 'nonprofit') {
      const seeds = await prisma.seedNonprofit.findMany({
        orderBy: { name: 'asc' },
        include: {
          electors: {
            where: { verifiedAt: { not: null } },
            select: { firstName: true, email: true, zipCode: true },
          },
        },
      });
      const ranked = [...seeds].sort((a, b) => b.electors.length - a.electors.length || a.name.localeCompare(b.name));
      if (type === 'outreach') {
        lines.push('nonprofit,category,city,verified_elections,elector_first_names');
        for (const s of ranked) {
          const names = s.electors.map((e) => e.firstName).filter(Boolean).join('; ');
          lines.push([csvCell(s.name), csvCell(s.category), csvCell(s.city), s.electors.length, csvCell(names)].join(','));
        }
      } else {
        lines.push('nonprofit,category,city,verified_elections,elector_first_names,elector_emails');
        for (const s of ranked) {
          const names = s.electors.map((e) => e.firstName).filter(Boolean).join('; ');
          const emails = s.electors.map((e) => e.email).join('; ');
          lines.push([csvCell(s.name), csvCell(s.category), csvCell(s.city), s.electors.length, csvCell(names), csvCell(emails)].join(','));
        }
      }
    } else {
      const seeds = await prisma.seedBusiness.findMany({
        orderBy: { name: 'asc' },
        include: {
          votes: {
            where: { member: { verifiedAt: { not: null } } },
            include: { member: { select: { firstName: true, email: true } } },
          },
        },
      });
      const ranked = [...seeds].sort((a, b) => b.votes.length - a.votes.length || a.name.localeCompare(b.name));
      if (type === 'outreach') {
        lines.push('business,category,area,ownership_type,verified_votes,voter_first_names');
        for (const s of ranked) {
          const names = s.votes.map((v) => v.member.firstName).filter(Boolean).join('; ');
          lines.push([csvCell(s.name), csvCell(s.category), csvCell(s.area), csvCell(s.ownershipType), s.votes.length, csvCell(names)].join(','));
        }
      } else {
        lines.push('business,category,area,ownership_type,verified_votes,voter_first_names,voter_emails');
        for (const s of ranked) {
          const names = s.votes.map((v) => v.member.firstName).filter(Boolean).join('; ');
          const emails = s.votes.map((v) => v.member.email).join('; ');
          lines.push([csvCell(s.name), csvCell(s.category), csvCell(s.area), csvCell(s.ownershipType), s.votes.length, csvCell(names), csvCell(emails)].join(','));
        }
      }
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="meridian-${kind}-demand-${type}.csv"`);
    return res.send(lines.join('\n'));
  } catch (err: any) {
    console.error('[Election] exportDemandCsv error:', err.message);
    return res.status(500).json({ error: 'Failed to export' });
  }
};

// ── Weekly admin digest (called from server.ts on a 7-day interval) ─────────

export async function runElectionWeeklyDigest(): Promise<void> {
  try {
    const last = await prisma.electionDigestLog.findFirst({ orderBy: { sentAt: 'desc' } });
    const WEEK = 7 * 24 * 60 * 60 * 1000;
    if (last && Date.now() - last.sentAt.getTime() < WEEK - 60 * 60 * 1000) return; // sent within the last week

    const [npCounts, bizCounts, pendingSuggestions, totalVerified] = await Promise.all([
      prisma.waitlistEntry.groupBy({
        by: ['electedNonprofitId'],
        where: { electedNonprofitId: { not: null }, verifiedAt: { not: null } },
        _count: { _all: true },
      }),
      prisma.memberBusinessVote.groupBy({
        by: ['seedBusinessId'],
        where: { member: { verifiedAt: { not: null } } },
        _count: { _all: true },
      }),
      prisma.entitySuggestion.count({ where: { status: 'pending' } }),
      prisma.waitlistEntry.count({ where: { verifiedAt: { not: null }, electedNonprofitId: { not: null } } }),
    ]);

    const npIds = npCounts.map((c) => c.electedNonprofitId as string);
    const bizIds = bizCounts.map((c) => c.seedBusinessId);
    const [nps, bizs] = await Promise.all([
      prisma.seedNonprofit.findMany({ where: { id: { in: npIds } }, select: { id: true, name: true } }),
      prisma.seedBusiness.findMany({ where: { id: { in: bizIds } }, select: { id: true, name: true } }),
    ]);
    const npName = new Map(nps.map((n) => [n.id, n.name]));
    const bizName = new Map(bizs.map((b) => [b.id, b.name]));

    const topNonprofits = npCounts
      .map((c) => ({ name: npName.get(c.electedNonprofitId as string) ?? 'Unknown', count: c._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const topBusinesses = bizCounts
      .map((c) => ({ name: bizName.get(c.seedBusinessId) ?? 'Unknown', count: c._count._all }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const sent = await sendElectionWeeklyDigest({ topNonprofits, topBusinesses, pendingSuggestions, totalVerified });
    if (sent) {
      await prisma.electionDigestLog.create({
        data: { meta: { totalVerified, pendingSuggestions, topNonprofit: topNonprofits[0]?.name ?? null } },
      });
      console.log('[Election] Weekly digest sent.');
    }
  } catch (err: any) {
    console.error('[Election] Weekly digest error:', err.message);
  }
}

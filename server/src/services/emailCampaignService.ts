import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { transport, withLogo, type EmailAttachment } from './emailTransport';
import { wrap, FROM_ADDRESSES } from './emailLayoutService';
import { requireSecret } from '../utils/secrets';

const APP_URL = process.env.APP_URL || 'https://goodcircles.org';
const UNSUB_SECRET = requireSecret('JWT_SECRET', 'dev-unsub-secret');
const DAILY_CEILING = Number(process.env.EMAIL_DAILY_CEILING || 100);
const SEND_BATCH = 10; // recipients per throttle batch

/**
 * emailCampaignService — the campaign/recipient layer.
 *
 * Every email send is recorded as an EmailCampaign + EmailRecipient so all platform
 * email (automated triggers + admin/mass campaigns) lives in one trackable model,
 * with suppression enforcement, CAN-SPAM gating, and Resend delivery-webhook
 * correlation. Imports emailTransport (not emailService) to avoid an import cycle.
 */

export function parseFrom(raw: string): { name: string; address: string } {
  const m = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim() || 'Good Circles', address: m[2].trim() };
  return { name: 'Good Circles', address: raw.trim() };
}

/** True if the address has hard-bounced/complained or unsubscribed from all categories. */
export async function isSuppressed(emailAddress: string): Promise<boolean> {
  try {
    const [supp, unsub] = await Promise.all([
      prisma.emailSuppression.findUnique({ where: { emailAddress } }),
      prisma.emailUnsubscribe.findUnique({ where: { emailAddress_category: { emailAddress, category: null as any } } }).catch(() => null),
    ]);
    return !!supp || !!unsub;
  } catch {
    return false; // fail open — never block a send because the suppression check errored
  }
}

export interface RecordSendParams {
  triggerSource?: string;
  type?: string;            // defaults to AUTOMATED
  fromAddress: string;      // full "Name <email>" form
  subject: string;
  bodyHtml: string;
  emailAddress: string;
  toName?: string;
  userId?: string | null;
  layoutVariant?: 'TRANSACTIONAL' | 'MARKETING';
}

/** Create an AUTOMATED campaign + its single recipient (status SENDING/PENDING). Best-effort. */
export async function recordSend(p: RecordSendParams): Promise<{ campaignId: string; recipientId: string } | null> {
  try {
    const { name, address } = parseFrom(p.fromAddress);
    const campaign = await prisma.emailCampaign.create({
      data: {
        type: p.type ?? 'AUTOMATED',
        status: 'SENDING',
        subject: p.subject,
        bodyHtml: p.bodyHtml,
        fromAddress: address,
        fromName: name,
        layoutVariant: p.layoutVariant ?? 'TRANSACTIONAL',
        triggerSource: p.triggerSource,
        recipientCount: 1,
        startedAt: new Date(),
        recipients: {
          create: {
            userId: p.userId ?? undefined,
            emailAddress: p.emailAddress,
            toName: p.toName,
            status: 'PENDING',
          },
        },
      },
      include: { recipients: true },
    });
    return { campaignId: campaign.id, recipientId: campaign.recipients[0].id };
  } catch (err) {
    console.warn('[emailCampaign] recordSend failed (continuing):', err);
    return null;
  }
}

/** Mark the recipient + campaign terminal state after the transport call returns. */
export async function finalizeSend(
  ids: { campaignId: string; recipientId: string },
  result: { ok: boolean; resendId?: string | null; error?: string },
): Promise<void> {
  try {
    // Always record the provider id + timestamp so delivery webhooks can correlate.
    await prisma.emailRecipient.update({
      where: { id: ids.recipientId },
      data: {
        resendId: result.resendId ?? undefined,
        errorMessage: result.error,
        sentAt: result.ok ? new Date() : undefined,
      },
    });
    // Advance to SENT/FAILED ONLY if a delivery webhook hasn't already moved it past
    // PENDING (a fast delivered/opened can land before this runs — don't clobber it).
    await prisma.emailRecipient.updateMany({
      where: { id: ids.recipientId, status: 'PENDING' },
      data: { status: result.ok ? 'SENT' : 'FAILED' },
    });
    await prisma.emailCampaign.update({
      where: { id: ids.campaignId },
      data: {
        status: result.ok ? 'SENT' : 'FAILED',
        sentAt: new Date(),
        sentCount: result.ok ? { increment: 1 } : undefined,
      },
    });
  } catch (err) {
    console.warn('[emailCampaign] finalizeSend failed (continuing):', err);
  }
}

/** Record a recipient that was skipped because the address is suppressed. */
export async function recordSuppressedSkip(ids: { campaignId: string; recipientId: string }): Promise<void> {
  try {
    await prisma.emailRecipient.update({ where: { id: ids.recipientId }, data: { status: 'SUPPRESSED' } });
    await prisma.emailCampaign.update({ where: { id: ids.campaignId }, data: { status: 'SENT' } });
  } catch { /* best-effort */ }
}

// ── Resend delivery webhook ───────────────────────────────────────────────────
const EVENT_MAP: Record<string, { status: string; at: string; counter: string }> = {
  'email.delivered':  { status: 'DELIVERED',  at: 'deliveredAt',  counter: 'deliveredCount' },
  'email.opened':     { status: 'OPENED',     at: 'openedAt',     counter: 'openedCount' },
  'email.clicked':    { status: 'CLICKED',    at: 'clickedAt',    counter: 'clickedCount' },
  'email.bounced':    { status: 'BOUNCED',    at: 'bouncedAt',    counter: 'bouncedCount' },
  'email.complained': { status: 'COMPLAINED', at: 'complainedAt', counter: 'complainedCount' },
};

const STATUS_RANK: Record<string, number> = { PENDING: 0, SENT: 1, DELIVERED: 2, OPENED: 3, CLICKED: 4 };

export async function handleDeliveryEvent(parsed: any): Promise<void> {
  const type: string = parsed?.type;
  // Most events use data.email_id; fall back to data.id defensively.
  const resendId: string | undefined = parsed?.data?.email_id ?? parsed?.data?.id;
  const mapping = EVENT_MAP[type];

  // Diagnostic: surfaces exactly what Resend sends (event type, id, and — when the id
  // is missing — the data keys, so a differing field name is immediately visible).
  console.log(`[EmailWebhook] received type=${type ?? 'NONE'} email_id=${resendId ?? 'NONE'} mapped=${!!mapping}`);
  if (!resendId) console.warn('[EmailWebhook] no id in payload; data keys:', Object.keys(parsed?.data ?? {}));
  if (!mapping || !resendId) return;

  const recipient = await prisma.emailRecipient.findFirst({ where: { resendId } });
  if (!recipient) { console.warn(`[EmailWebhook] no recipient matched resendId=${resendId}`); return; }

  // Per-event idempotency: each event type is counted at most once (its timestamp field
  // is null until first seen). Prevents double-counting on Resend retries/replays.
  if ((recipient as any)[mapping.at]) { console.log(`[EmailWebhook] ${type} already recorded for ${recipient.id}`); return; }

  // Status only moves forward (sent→delivered→opened→clicked); bounce/complaint always win.
  let newStatus = recipient.status;
  if (type === 'email.bounced' || type === 'email.complained') newStatus = mapping.status;
  else if ((STATUS_RANK[mapping.status] ?? 0) > (STATUS_RANK[recipient.status] ?? 0)) newStatus = mapping.status;

  await prisma.emailRecipient.update({
    where: { id: recipient.id },
    data: { status: newStatus, [mapping.at]: new Date() } as any,
  });
  await prisma.emailCampaign.update({
    where: { id: recipient.campaignId },
    data: { [mapping.counter]: { increment: 1 } } as any,
  });
  console.log(`[EmailWebhook] applied ${type} → recipient=${recipient.id} status=${newStatus}`);

  if (type === 'email.bounced') {
    await prisma.emailSuppression.upsert({
      where: { emailAddress: recipient.emailAddress },
      create: { emailAddress: recipient.emailAddress, reason: 'HARD_BOUNCE' },
      update: {},
    });
  }
  if (type === 'email.complained') {
    await prisma.emailSuppression.upsert({
      where: { emailAddress: recipient.emailAddress },
      create: { emailAddress: recipient.emailAddress, reason: 'COMPLAINED' },
      update: {},
    });
    await prisma.emailUnsubscribe.upsert({
      where: { emailAddress_category: { emailAddress: recipient.emailAddress, category: null as any } },
      create: { emailAddress: recipient.emailAddress, category: null, reason: 'complaint' },
      update: {},
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// E4/E5/E6 — campaign send engine, mass-recipient resolution, CAN-SPAM, dashboard
// ─────────────────────────────────────────────────────────────────────────────

const FROM_BY_ALIAS: Record<string, string> = {
  hello:         FROM_ADDRESSES.marketing,
  notifications: FROM_ADDRESSES.transactional,
  support:       FROM_ADDRESSES.support,
  founder:       FROM_ADDRESSES.founder,
};

export interface CreateCampaignInput {
  type: 'INDIVIDUAL' | 'ROLE_BASED' | 'SYSTEM_WIDE' | 'SEGMENT';
  subject: string;
  bodyHtml: string;                 // inner body (blocks rendered); wrapped at send time
  fromAlias?: keyof typeof FROM_BY_ALIAS;
  replyTo?: string;
  layoutVariant?: 'TRANSACTIONAL' | 'MARKETING';
  accentRole?: string;
  targetRole?: string;              // for ROLE_BASED
  targetSegmentJson?: any;          // for SEGMENT (minimal: { role?, activeSince? })
  recipientEmail?: string;          // for INDIVIDUAL
  recipientName?: string;
  recipientUserId?: string;
  templateId?: string;
  scheduledFor?: string | Date | null;
  attachmentIds?: string[];         // library attachments to attach
  createdById?: string;
}

interface ResolvedRecipient {
  userId?: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  businessName?: string | null;
  orgName?: string | null;
}

// Personalization tokens resolved per recipient.
function personalize(text: string, r: ResolvedRecipient): string {
  return text
    .replace(/\{\{\s*firstName\s*\}\}/g, r.firstName || 'there')
    .replace(/\{\{\s*lastName\s*\}\}/g, r.lastName || '')
    .replace(/\{\{\s*email\s*\}\}/g, r.email)
    .replace(/\{\{\s*role\s*\}\}/g, r.role || '')
    .replace(/\{\{\s*businessName\s*\}\}/g, r.businessName || '')
    .replace(/\{\{\s*orgName\s*\}\}/g, r.orgName || '');
}

// ── Unsubscribe tokens (signed) ──────────────────────────────────────────────
export function makeUnsubToken(email: string): string {
  const payload = Buffer.from(email).toString('base64url');
  const sig = crypto.createHmac('sha256', UNSUB_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function verifyUnsubToken(token: string): string | null {
  const [payload, sig] = (token || '').split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', UNSUB_SECRET).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    return Buffer.from(payload, 'base64url').toString('utf8');
  } catch { return null; }
}
export async function applyUnsubscribe(email: string, category: string | null = null): Promise<boolean> {
  try {
    await prisma.emailUnsubscribe.upsert({
      where: { emailAddress_category: { emailAddress: email, category: category as any } },
      create: { emailAddress: email, category, reason: 'user' },
      update: {},
    });
    return true;
  } catch { return false; }
}

// ── Recipient resolution ─────────────────────────────────────────────────────
async function loadSuppressedSet(): Promise<Set<string>> {
  const [supp, unsub] = await Promise.all([
    prisma.emailSuppression.findMany({ select: { emailAddress: true } }),
    prisma.emailUnsubscribe.findMany({ where: { category: null }, select: { emailAddress: true } }),
  ]);
  return new Set([...supp.map(s => s.emailAddress), ...unsub.map(u => u.emailAddress)]);
}

export async function resolveRecipients(input: { type: string; targetRole?: string | null; targetSegmentJson?: any; recipientEmail?: string; recipientName?: string; recipientUserId?: string }): Promise<ResolvedRecipient[]> {
  if (input.type === 'INDIVIDUAL') {
    if (!input.recipientEmail) return [];
    return [{ userId: input.recipientUserId, email: input.recipientEmail, firstName: input.recipientName }];
  }
  const where: any = { isActive: true };
  if (input.type === 'ROLE_BASED' && input.targetRole) where.role = input.targetRole;
  if (input.type === 'SEGMENT' && input.targetSegmentJson?.role) where.role = input.targetSegmentJson.role;
  if (input.type === 'SEGMENT' && input.targetSegmentJson?.activeSince) where.createdAt = { gte: new Date(input.targetSegmentJson.activeSince) };

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true, email: true, firstName: true, lastName: true, role: true,
      merchant: { select: { businessName: true } },
      nonprofit: { select: { orgName: true } },
    },
  });
  const suppressed = await loadSuppressedSet();
  return users
    .filter(u => u.email && !suppressed.has(u.email))
    .map(u => ({
      userId: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role,
      businessName: u.merchant?.businessName ?? null, orgName: u.nonprofit?.orgName ?? null,
    }));
}

// ── Render a campaign body for one recipient (personalize + wrap + unsubscribe) ─
function renderFor(campaign: { bodyHtml: string; layoutVariant: string }, r: ResolvedRecipient): string {
  const body = personalize(campaign.bodyHtml, r);
  const isMarketing = campaign.layoutVariant === 'MARKETING';
  const unsubscribeUrl = isMarketing ? `${APP_URL}/api/email/unsubscribe?token=${makeUnsubToken(r.email)}` : undefined;
  return wrap({ body, footerVariant: isMarketing ? 'MARKETING' : 'TRANSACTIONAL', unsubscribeUrl });
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function createCampaign(input: CreateCampaignInput) {
  const fromAddress = FROM_BY_ALIAS[input.fromAlias || (input.layoutVariant === 'MARKETING' ? 'hello' : 'notifications')];
  const { name, address } = parseFrom(fromAddress);
  const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : null;

  const campaign = await prisma.emailCampaign.create({
    data: {
      type: input.type,
      status: scheduledFor && scheduledFor.getTime() > Date.now() ? 'SCHEDULED' : 'DRAFT',
      subject: input.subject,
      bodyHtml: input.bodyHtml,
      fromAddress: address,
      fromName: name,
      replyTo: input.replyTo,
      layoutVariant: input.layoutVariant || 'MARKETING',
      accentRole: input.accentRole,
      targetRole: input.targetRole,
      targetSegmentJson: input.targetSegmentJson ?? undefined,
      templateId: input.templateId,
      scheduledFor,
      createdById: input.createdById,
    },
  });

  if (input.attachmentIds?.length) {
    await prisma.emailAttachment.updateMany({
      where: { id: { in: input.attachmentIds }, isLibraryItem: true },
      data: { campaignId: campaign.id },
    });
  }
  if (input.type === 'INDIVIDUAL' && input.recipientEmail) {
    await prisma.emailRecipient.create({
      data: { campaignId: campaign.id, userId: input.recipientUserId, emailAddress: input.recipientEmail, toName: input.recipientName, status: 'PENDING' },
    });
    await prisma.emailCampaign.update({ where: { id: campaign.id }, data: { recipientCount: 1 } });
  }
  return campaign;
}

// ── Pre-flight + send ─────────────────────────────────────────────────────────
async function sentToday(): Promise<number> {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return prisma.emailRecipient.count({ where: { sentAt: { gte: start } } });
}

export async function sendCampaign(campaignId: string): Promise<{ ok: boolean; sent: number; error?: string }> {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId }, include: { recipients: true } });
  if (!campaign) return { ok: false, sent: 0, error: 'Campaign not found' };
  if (campaign.status === 'SENDING' || campaign.status === 'SENT') return { ok: false, sent: 0, error: `Campaign already ${campaign.status}` };

  const massType = campaign.type !== 'INDIVIDUAL';

  if (massType && campaign.layoutVariant === 'MARKETING' && !process.env.EMAIL_PHYSICAL_ADDRESS) {
    return { ok: false, sent: 0, error: 'Mass marketing send blocked: set EMAIL_PHYSICAL_ADDRESS (CAN-SPAM) before sending.' };
  }

  let resolved: ResolvedRecipient[];
  if (campaign.type === 'INDIVIDUAL') {
    resolved = campaign.recipients.map(r => ({ userId: r.userId ?? undefined, email: r.emailAddress, firstName: r.toName }));
  } else {
    resolved = await resolveRecipients({ type: campaign.type, targetRole: campaign.targetRole, targetSegmentJson: campaign.targetSegmentJson });
  }
  if (resolved.length === 0) return { ok: false, sent: 0, error: 'No eligible recipients (all suppressed/unsubscribed or empty segment).' };

  const already = await sentToday();
  if (already + resolved.length > DAILY_CEILING) {
    return { ok: false, sent: 0, error: `Daily send ceiling (${DAILY_CEILING}) would be exceeded: ${already} sent today + ${resolved.length} this campaign. Raise EMAIL_DAILY_CEILING or schedule across days.` };
  }

  await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: 'SENDING', startedAt: new Date(), recipientCount: resolved.length } });

  const attachments: EmailAttachment[] = []; // library-binary inline attach is a P1 follow-up
  const fromFull = `${campaign.fromName} <${campaign.fromAddress}>`;
  let sent = 0;

  for (let i = 0; i < resolved.length; i += SEND_BATCH) {
    const batch = resolved.slice(i, i + SEND_BATCH);
    await Promise.all(batch.map(async (r) => {
      const rec = campaign.type === 'INDIVIDUAL'
        ? campaign.recipients.find(x => x.emailAddress === r.email)
        : await prisma.emailRecipient.create({ data: { campaignId, userId: r.userId, emailAddress: r.email, toName: r.firstName, status: 'PENDING' } });
      if (!rec) return;

      const html = renderFor(campaign, r);
      const subject = personalize(campaign.subject, r);
      const result = await transport(fromFull, { to: r.email, subject, html, replyTo: campaign.replyTo ?? undefined }, withLogo(attachments));
      // Record provider id + metadata always; advance status only if a webhook hasn't
      // already moved it past PENDING (forward-only — avoids clobbering a fast delivered).
      await prisma.emailRecipient.update({
        where: { id: rec.id },
        data: {
          resendId: result.id,
          errorMessage: result.error,
          sentAt: result.ok ? new Date() : undefined,
          personalizationJson: { firstName: r.firstName, businessName: r.businessName, orgName: r.orgName } as any,
        },
      });
      await prisma.emailRecipient.updateMany({
        where: { id: rec.id, status: 'PENDING' },
        data: { status: result.ok ? 'SENT' : 'FAILED' },
      });
      if (result.ok) sent++;
    }));
    if (i + SEND_BATCH < resolved.length) await new Promise(res => setTimeout(res, 1000)); // ~10/sec throttle
  }

  await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: 'SENT', sentAt: new Date(), sentCount: sent } });
  return { ok: true, sent };
}

// ── Test send (one render to an arbitrary address; not recorded as a campaign) ─
export async function testSend(input: { subject: string; bodyHtml: string; layoutVariant?: 'TRANSACTIONAL' | 'MARKETING'; fromAlias?: keyof typeof FROM_BY_ALIAS }, to: string): Promise<boolean> {
  const fromFull = FROM_BY_ALIAS[input.fromAlias || (input.layoutVariant === 'MARKETING' ? 'hello' : 'notifications')];
  const r: ResolvedRecipient = { email: to, firstName: 'Test' };
  const html = renderFor({ bodyHtml: input.bodyHtml, layoutVariant: input.layoutVariant || 'MARKETING' }, r);
  const result = await transport(fromFull, { to, subject: `[TEST] ${personalize(input.subject, r)}`, html }, withLogo());
  return result.ok;
}

// ── Preview (recipient count + sample personalized renders) ───────────────────
export async function previewCampaign(input: { type: string; targetRole?: string | null; targetSegmentJson?: any; subject: string; bodyHtml: string; layoutVariant?: 'TRANSACTIONAL' | 'MARKETING'; recipientEmail?: string; recipientName?: string }): Promise<{ recipientCount: number; samples: Array<{ to: string; subject: string; html: string }> }> {
  const resolved = await resolveRecipients(input as any);
  const samples = resolved.slice(0, 5).map(r => ({
    to: r.email,
    subject: personalize(input.subject, r),
    html: renderFor({ bodyHtml: input.bodyHtml, layoutVariant: input.layoutVariant || 'MARKETING' }, r),
  }));
  return { recipientCount: resolved.length, samples };
}

// ── Dashboard queries ─────────────────────────────────────────────────────────
export async function listCampaigns(filter?: { type?: string; status?: string }) {
  const where: any = {};
  if (filter?.type) where.type = filter.type;
  if (filter?.status) where.status = filter.status;
  return prisma.emailCampaign.findMany({
    where, orderBy: { createdAt: 'desc' }, take: 100,
    include: { _count: { select: { recipients: true } } },
  });
}
export async function getCampaign(id: string) {
  return prisma.emailCampaign.findUnique({
    where: { id },
    include: { recipients: { orderBy: { sentAt: 'desc' }, take: 500 }, attachments: true },
  });
}

// ── Reply-linking: tie an inbound email to a recent campaign recipient ─────────
export async function linkInboundReply(inboundId: string, fromAddress: string): Promise<void> {
  try {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recipient = await prisma.emailRecipient.findFirst({
      where: { emailAddress: fromAddress, sentAt: { gte: ninetyDaysAgo } },
      orderBy: { sentAt: 'desc' },
    });
    if (recipient) await prisma.emailRecipient.update({ where: { id: recipient.id }, data: { linkedInboundEmailId: inboundId } });
  } catch (err) {
    console.warn('[emailCampaign] linkInboundReply failed:', err);
  }
}

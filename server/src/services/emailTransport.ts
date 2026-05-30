import { Resend } from 'resend';
import { getLogoAttachment } from './emailLayoutService';

/**
 * emailTransport — the low-level Resend send, shared by emailService (single sends)
 * and emailCampaignService (mass sends) without an import cycle. Always inline-embeds
 * the brand logo as a CID attachment so it renders with remote images blocked.
 */

export interface EmailAttachment {
  filename: string;
  content: string;        // base64-encoded
  contentType?: string;
  contentId?: string;     // set for inline (CID) images
}

/** Prepend the CID brand logo to any caller-supplied attachments. */
export function withLogo(attachments?: EmailAttachment[]): EmailAttachment[] {
  const logo = getLogoAttachment();
  const all: EmailAttachment[] = [];
  if (logo) all.push({ filename: logo.filename, content: logo.content, contentType: 'image/png', contentId: logo.contentId });
  if (attachments?.length) all.push(...attachments);
  return all;
}

export async function transport(
  from: string,
  options: { to: string; subject: string; html: string; replyTo?: string },
  attachments: EmailAttachment[],
): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.group('[EMAIL SIMULATION] RESEND_API_KEY not configured');
    console.log(`From: ${from}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Attachments: ${attachments.map(a => a.filename + (a.contentId ? ` (inline:${a.contentId})` : '')).join(', ') || 'none'}`);
    console.groupEnd();
    return { ok: true, id: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const payload: any = { from, to: [options.to], subject: options.subject, html: options.html };
    if (options.replyTo) payload.reply_to = options.replyTo;
    if (attachments.length) {
      payload.attachments = attachments.map(a => ({
        filename: a.filename, content: a.content, content_type: a.contentType, content_id: a.contentId,
      }));
    }
    const { data, error } = await resend.emails.send(payload);
    if (error) { console.error('[Email] Resend error:', error); return { ok: false, error: String((error as any)?.message ?? error) }; }
    console.log(`[Email] Sent successfully to ${options.to} — ID: ${data?.id}`);
    return { ok: true, id: data?.id };
  } catch (err: any) {
    console.error('[Email] Unexpected error:', err);
    return { ok: false, error: String(err?.message ?? err) };
  }
}

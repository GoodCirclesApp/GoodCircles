import { Resend } from 'resend';

/**
 * emailTransport — the low-level Resend send, shared by emailService (single sends)
 * and emailCampaignService (mass sends) without an import cycle. The brand logo is a
 * hosted HTTPS image rendered by emailLayoutService, NOT an attachment.
 */

export interface EmailAttachment {
  filename: string;
  content: string;        // base64-encoded
  contentType?: string;
  contentId?: string;     // set for inline (CID) images
}

/**
 * Pass-through for caller-supplied attachments. (The logo is no longer attached —
 * it is a hosted inline image — so this just normalizes to an array. Kept as the
 * single chokepoint where real document attachments will be added.)
 */
export function withLogo(attachments?: EmailAttachment[]): EmailAttachment[] {
  return attachments?.length ? [...attachments] : [];
}

export async function transport(
  from: string,
  options: { to: string; subject: string; html: string; replyTo?: string; headers?: Record<string, string> },
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
    // Custom headers (e.g. RFC 8058 List-Unsubscribe / List-Unsubscribe-Post on
    // marketing sends — compliance audit E4).
    if (options.headers && Object.keys(options.headers).length) payload.headers = options.headers;
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

import { Request, Response } from 'express';
import { Resend } from 'resend';
import { prisma } from '../lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? '';
const REPLY_FROM = 'GoodCircles Support <support@goodcircles.org>';

function parseFrom(raw: string): { name: string | null; address: string } {
  const m = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim() || null, address: m[2].trim() };
  return { name: null, address: raw.trim() };
}

export async function receiveWebhook(req: Request, res: Response) {
  try {
    // req.body is a Buffer from express.raw()
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);

    // Verify Svix signature (non-blocking — log but never drop the email)
    if (WEBHOOK_SECRET) {
      try {
        const svixId        = req.headers['svix-id'] as string;
        const svixTimestamp = req.headers['svix-timestamp'] as string;
        const svixSignature = req.headers['svix-signature'] as string;
        if (svixId && svixTimestamp && svixSignature) {
          resend.webhooks.verify({
            payload:       rawBody,
            headers:       { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
            webhookSecret: WEBHOOK_SECRET,
          });
        }
      } catch (verifyErr) {
        console.warn('[InboundEmail] signature verification failed (continuing):', verifyErr);
      }
    }

    let parsed: any = {};
    try { parsed = JSON.parse(rawBody); } catch { /* ignore */ }

    // Only process inbound emails
    if (parsed?.type !== 'email.received') {
      return res.status(200).json({ ok: true });
    }

    const { from, to, subject, email_id } = parsed.data ?? {};

    const { name: fromName, address: fromAddress } = parseFrom(from ?? '');
    const toAddress = Array.isArray(to) ? to[0] : (to ?? 'support@goodcircles.org');

    // Fetch full body via the receiving API (added in Resend SDK v4+)
    let textBody: string | null = null;
    let htmlBody: string | null = null;
    if (email_id) {
      try {
        const { data: full, error: fetchErr } = await resend.emails.receiving.get(email_id);
        if (fetchErr) {
          console.error('[InboundEmail] receiving.get error:', fetchErr);
        } else {
          textBody = full?.text ?? null;
          htmlBody = full?.html ?? null;
          console.log('[InboundEmail] body fetched — text:', textBody?.length ?? 0, 'html:', htmlBody?.length ?? 0);
        }
      } catch (err) {
        console.error('[InboundEmail] could not fetch body:', err);
      }
    }

    await prisma.inboundEmail.create({
      data: {
        resendId:    email_id ?? null,
        fromAddress,
        fromName,
        toAddress,
        subject:     subject ?? '(no subject)',
        textBody,
        htmlBody,
      },
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[InboundEmail] webhook error:', err);
    res.status(500).json({ error: 'Failed to store email.' });
  }
}

export async function listEmails(req: Request, res: Response) {
  try {
    const emails = await prisma.inboundEmail.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        fromAddress: true,
        fromName: true,
        subject: true,
        isRead: true,
        isReplied: true,
        createdAt: true,
      },
    });
    res.json({ emails });
  } catch (err) {
    console.error('[InboundEmail] list error:', err);
    res.status(500).json({ error: 'Failed to list emails.' });
  }
}

export async function getEmail(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const email = await prisma.inboundEmail.findUnique({ where: { id } });
    if (!email) return res.status(404).json({ error: 'Not found.' });

    if (!email.isRead) {
      await prisma.inboundEmail.update({ where: { id }, data: { isRead: true } });
    }

    res.json({ email: { ...email, isRead: true } });
  } catch (err) {
    console.error('[InboundEmail] get error:', err);
    res.status(500).json({ error: 'Failed to fetch email.' });
  }
}

export async function replyToEmail(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const { body: replyBody } = req.body ?? {};

    if (!replyBody?.trim()) {
      return res.status(400).json({ error: 'Reply body is required.' });
    }

    const email = await prisma.inboundEmail.findUnique({ where: { id } });
    if (!email) return res.status(404).json({ error: 'Not found.' });

    const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;

    const result = await resend.emails.send({
      from:    REPLY_FROM,
      to:      email.fromAddress,
      subject,
      text:    replyBody.trim(),
    });

    if (result.error) {
      console.error('[InboundEmail] reply send error:', result.error);
      return res.status(500).json({ error: 'Failed to send reply.' });
    }

    await prisma.inboundEmail.update({
      where: { id },
      data:  { isReplied: true, repliedAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[InboundEmail] reply error:', err);
    res.status(500).json({ error: 'Failed to send reply.' });
  }
}

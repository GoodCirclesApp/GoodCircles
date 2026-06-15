import { Request, Response } from 'express';
import { Resend } from 'resend';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../services/emailService';
import { linkInboundReply } from '../services/emailCampaignService';
import { wrap, heading, paragraph, FROM_ADDRESSES } from '../services/emailLayoutService';

const resend = new Resend(process.env.RESEND_API_KEY);
const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? '';

function parseFrom(raw: string): { name: string | null; address: string } {
  const m = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim() || null, address: m[2].trim() };
  return { name: null, address: raw.trim() };
}

export async function receiveWebhook(req: Request, res: Response) {
  try {
    // req.body is a Buffer from express.raw()
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);

    // Verify Svix signature. When RESEND_WEBHOOK_SECRET is configured we HARD-REJECT
    // unsigned/forged requests (401) so the inbound store cannot be poisoned. When the
    // secret is unset we preserve prior behavior so a not-yet-provisioned prod inbox
    // keeps working (verification activates as soon as the secret is set).
    if (WEBHOOK_SECRET) {
      const svixId        = req.headers['svix-id'] as string;
      const svixTimestamp = req.headers['svix-timestamp'] as string;
      const svixSignature = req.headers['svix-signature'] as string;
      if (!svixId || !svixTimestamp || !svixSignature) {
        console.warn('[InboundEmail] rejected: missing Svix signature headers');
        return res.status(401).json({ error: 'Missing signature' });
      }
      try {
        resend.webhooks.verify({
          payload:       rawBody,
          headers:       { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
          webhookSecret: WEBHOOK_SECRET,
        });
      } catch (verifyErr) {
        console.warn('[InboundEmail] rejected: signature verification failed:', verifyErr);
        return res.status(401).json({ error: 'Invalid signature' });
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

    const created = await prisma.inboundEmail.create({
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

    // Reply-linking: if this address recently received a campaign, tie it back so the
    // admin sees "this person replied to your outreach" (best-effort, non-blocking).
    await linkInboundReply(created.id, fromAddress);

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
    const email = await prisma.inboundEmail.findUnique({
      where:   { id },
      include: { replies: { orderBy: { sentAt: 'asc' } } },
    });
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

export async function deleteEmail(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    await prisma.inboundEmail.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error('[InboundEmail] delete error:', err);
    res.status(500).json({ error: 'Failed to delete email.' });
  }
}

export async function deleteReadEmails(_req: Request, res: Response) {
  try {
    const { count } = await prisma.inboundEmail.deleteMany({ where: { isRead: true } });
    res.json({ ok: true, deleted: count });
  } catch (err) {
    console.error('[InboundEmail] deleteRead error:', err);
    res.status(500).json({ error: 'Failed to delete read emails.' });
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

    // Render the reply through the shared brand layout (CID logo, on-brand shell)
    // and route it through sendEmail so it is tracked like every other send.
    const safeBody = replyBody.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    const html = wrap({
      body: heading('Good Circles Support') + paragraph(safeBody),
      footerVariant: 'TRANSACTIONAL',
    });
    const ok = await sendEmail({
      to: email.fromAddress,
      toName: email.fromName || '',
      subject,
      html,
      from: FROM_ADDRESSES.support,
      replyTo: 'support@goodcircles.org',
      meta: { triggerSource: 'SUPPORT_REPLY', layoutVariant: 'TRANSACTIONAL' },
    });

    if (!ok) {
      console.error('[InboundEmail] reply send failed');
      return res.status(500).json({ error: 'Failed to send reply.' });
    }

    await prisma.inboundEmail.update({
      where: { id },
      data:  { isReplied: true, repliedAt: new Date() },
    });

    await prisma.inboundEmailReply.create({
      data: { emailId: id, body: replyBody.trim() },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[InboundEmail] reply error:', err);
    res.status(500).json({ error: 'Failed to send reply.' });
  }
}

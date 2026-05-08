import { Request, Response } from 'express';
import { Resend } from 'resend';
import { prisma } from '../lib/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);
const REPLY_FROM = 'GoodCircles Support <support@goodcircles.org>';

function parseFrom(raw: string): { name: string | null; address: string } {
  const m = raw.match(/^(.*?)\s*<([^>]+)>$/);
  if (m) return { name: m[1].trim() || null, address: m[2].trim() };
  return { name: null, address: raw.trim() };
}

export async function receiveWebhook(req: Request, res: Response) {
  try {
    const { from, to, subject, text, html } = req.body ?? {};

    const { name: fromName, address: fromAddress } = parseFrom(from ?? '');
    const toAddress = Array.isArray(to) ? to[0] : (to ?? 'support@goodcircles.org');

    await prisma.inboundEmail.create({
      data: {
        fromAddress,
        fromName,
        toAddress,
        subject: subject ?? '(no subject)',
        textBody: text ?? null,
        htmlBody: html ?? null,
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
    const { id } = req.params;
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
    const { id } = req.params;
    const { body: replyBody } = req.body ?? {};

    if (!replyBody?.trim()) {
      return res.status(400).json({ error: 'Reply body is required.' });
    }

    const email = await prisma.inboundEmail.findUnique({ where: { id } });
    if (!email) return res.status(404).json({ error: 'Not found.' });

    const subject = email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`;

    const result = await resend.emails.send({
      from: REPLY_FROM,
      to: email.fromAddress,
      subject,
      text: replyBody.trim(),
    });

    if (result.error) {
      console.error('[InboundEmail] reply send error:', result.error);
      return res.status(500).json({ error: 'Failed to send reply.' });
    }

    await prisma.inboundEmail.update({
      where: { id },
      data: { isReplied: true, repliedAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[InboundEmail] reply error:', err);
    res.status(500).json({ error: 'Failed to send reply.' });
  }
}

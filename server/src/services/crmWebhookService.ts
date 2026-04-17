import { prisma } from '../lib/prisma';
import crypto from 'crypto';

export class CrmWebhookService {
  static async save(nonprofitId: string, url: string, events: string[]) {
    const secret = crypto.randomBytes(32).toString('hex');
    return prisma.crmWebhook.upsert({
      where: { nonprofitId },
      create: { nonprofitId, url, secret, events },
      update: { url, events, isActive: true },
    });
  }

  static async get(nonprofitId: string) {
    return prisma.crmWebhook.findUnique({ where: { nonprofitId } });
  }

  static async deactivate(nonprofitId: string) {
    return prisma.crmWebhook.updateMany({ where: { nonprofitId }, data: { isActive: false } });
  }

  // HMAC-signed fire — non-blocking, failures logged but never thrown
  static async fire(nonprofitId: string, event: string, payload: Record<string, unknown>) {
    const hook = await prisma.crmWebhook.findUnique({ where: { nonprofitId } });
    if (!hook || !hook.isActive || !hook.events.includes(event)) return;

    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const sig = crypto.createHmac('sha256', hook.secret).update(body).digest('hex');

    try {
      const res = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GoodCircles-Event': event,
          'X-GoodCircles-Signature': `sha256=${sig}`,
        },
        body,
        signal: AbortSignal.timeout(8000),
      });
      await prisma.crmWebhook.update({ where: { nonprofitId }, data: { lastFiredAt: new Date() } });
      if (!res.ok) console.warn(`[CRM Webhook] ${nonprofitId} returned ${res.status} for event ${event}`);
    } catch (err) {
      console.error(`[CRM Webhook] Failed to fire ${event} for nonprofit ${nonprofitId}:`, err);
    }
  }
}

import { prisma } from '../lib/prisma';

/**
 * dataRetentionService — bounded retention for high-volume / low-value rows that
 * would otherwise grow forever (compliance audit finding H). Deliberately
 * CONSERVATIVE: it only prunes records that are safe to drop without breaking
 * referential integrity or losing legally-retained financial/tax data.
 *
 * Windows are env-overridable so retention can be tuned without a redeploy.
 * Anything touching money, tax, receipts, or the immutable Local Dollar Graph is
 * intentionally NOT pruned here. See DATA_PRACTICES.md for the documented policy.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_MS);
}

function envDays(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export interface RetentionResult {
  processedWebhookEvents: number;
  unconvertedAffiliateClicks: number;
}

export async function runDataRetention(): Promise<RetentionResult> {
  const result: RetentionResult = { processedWebhookEvents: 0, unconvertedAffiliateClicks: 0 };

  // 1) Webhook idempotency keys — safe to drop well past any provider retry window.
  try {
    const cutoff = daysAgo(envDays('RETAIN_WEBHOOK_EVENTS_DAYS', 90));
    const { count } = await prisma.processedWebhookEvent.deleteMany({ where: { receivedAt: { lt: cutoff } } });
    result.processedWebhookEvents = count;
  } catch (err) {
    console.error('[Retention] processedWebhookEvent prune failed:', err);
  }

  // 2) Affiliate clicks that never converted — analytics/anti-abuse only, and they
  //    carry a (nullable) userId. Clicks WITH a conversion are retained (the
  //    conversion references them and is revenue-relevant).
  try {
    const cutoff = daysAgo(envDays('RETAIN_UNCONVERTED_CLICKS_DAYS', 180));
    const { count } = await prisma.affiliateClick.deleteMany({
      where: { clickedAt: { lt: cutoff }, conversion: { is: null } },
    });
    result.unconvertedAffiliateClicks = count;
  } catch (err) {
    console.error('[Retention] affiliateClick prune failed:', err);
  }

  return result;
}

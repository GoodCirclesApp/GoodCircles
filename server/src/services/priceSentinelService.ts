import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

const OUTLIER_THRESHOLD = 1.25; // flag if price > 125% of category median

export class PriceSentinelService {
  static async checkListing(listingId: string, price: number, category: string): Promise<void> {
    const peers = await prisma.productService.findMany({
      where: { category, isActive: true, id: { not: listingId } },
      select: { price: true },
    });

    if (peers.length < 3) return; // not enough data for a meaningful benchmark

    const prices = peers.map(p => Number(p.price)).sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];

    const suggestedMax = median * OUTLIER_THRESHOLD;

    if (price > suggestedMax) {
      // Resolve any existing open flag first
      await prisma.priceSentinelFlag.updateMany({
        where: { listingId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() },
      });

      await prisma.priceSentinelFlag.create({
        data: {
          listingId,
          flagReason: 'ABOVE_CATEGORY_MEDIAN',
          suggestedMax: new Decimal(suggestedMax.toFixed(2)),
          marketMedian: new Decimal(median.toFixed(2)),
        },
      });
    } else {
      // Price is within bounds — resolve any stale flags
      await prisma.priceSentinelFlag.updateMany({
        where: { listingId, isResolved: false },
        data: { isResolved: true, resolvedAt: new Date() },
      });
    }
  }

  static async getFlags(listingId?: string) {
    return prisma.priceSentinelFlag.findMany({
      where: listingId ? { listingId, isResolved: false } : { isResolved: false },
      include: { listing: { select: { name: true, category: true, merchant: { select: { businessName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async resolveFlag(flagId: string) {
    return prisma.priceSentinelFlag.update({
      where: { id: flagId },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}

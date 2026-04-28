import { prisma } from '../lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { CdfiPackagingService } from './cdfiPackagingService';

const DAF_SPLIT = new Decimal('0.50');

export class AffiliateService {

  // ── Programs ────────────────────────────────────────────────────────────

  static getPrograms(includeInactive = false) {
    return prisma.affiliateProgram.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: { _count: { select: { listings: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static createProgram(data: {
    name: string;
    platform: string;
    trackingId: string;
    baseCommRate?: number;
    logoUrl?: string;
  }) {
    return prisma.affiliateProgram.create({ data });
  }

  static updateProgram(id: string, data: Partial<{
    name: string;
    trackingId: string;
    baseCommRate: number;
    logoUrl: string;
    isActive: boolean;
  }>) {
    return prisma.affiliateProgram.update({ where: { id }, data });
  }

  // ── Listings ─────────────────────────────────────────────────────────────

  static getActiveListings(category?: string, excludeCategories: string[] = []) {
    return prisma.affiliateListing.findMany({
      where: {
        isActive: true,
        program: { isActive: true },
        ...(category ? { category } : {}),
        // Priority Engine: suppress affiliate listings in categories already covered by native products
        ...(excludeCategories.length > 0 ? { category: { notIn: excludeCategories } } : {}),
      },
      include: {
        program: { select: { name: true, platform: true, logoUrl: true } },
        _count: { select: { clicks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static getAllListings() {
    return prisma.affiliateListing.findMany({
      include: {
        program: { select: { name: true, platform: true } },
        _count: { select: { clicks: true, conversions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static createListing(data: {
    programId: string;
    externalId?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    price: number;
    affiliateUrl: string;
    category: string;
    commRate?: number;
    createdBy: string;
  }) {
    return prisma.affiliateListing.create({ data });
  }

  static updateListing(id: string, data: Partial<{
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    affiliateUrl: string;
    category: string;
    commRate: number;
    isActive: boolean;
  }>) {
    return prisma.affiliateListing.update({ where: { id }, data });
  }

  // ── Click tracking ────────────────────────────────────────────────────────

  static async recordClick(listingId: string, userId?: string, userRole?: string) {
    const listing = await prisma.affiliateListing.findUnique({
      where: { id: listingId },
      select: { affiliateUrl: true, isActive: true },
    });
    if (!listing?.isActive) throw new Error('Affiliate listing not found or inactive');

    const click = await prisma.affiliateClick.create({
      data: { listingId, userId: userId ?? null, userRole: userRole ?? null },
    });

    return { affiliateUrl: listing.affiliateUrl, clickId: click.id };
  }

  // ── Conversions ───────────────────────────────────────────────────────────

  static async recordConversion(data: {
    listingId: string;
    clickId?: string;
    saleAmount: number;
    externalRef?: string;
  }) {
    const listing = await prisma.affiliateListing.findUnique({
      where: { id: data.listingId },
      include: { program: { select: { baseCommRate: true } } },
    });
    if (!listing) throw new Error('Affiliate listing not found');

    const commRate = listing.commRate ?? listing.program.baseCommRate;
    const sale = new Decimal(data.saleAmount);
    const commTotal = sale.mul(commRate);
    const dafShare = commTotal.mul(DAF_SPLIT);
    const platformShare = commTotal.sub(dafShare);

    const conversion = await prisma.affiliateConversion.create({
      data: {
        listingId: data.listingId,
        clickId: data.clickId ?? null,
        saleAmount: sale,
        commRate,
        commTotal,
        dafShare,
        platformShare,
        externalRef: data.externalRef ?? null,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // Allocate 5% of commTotal to CDFI first-loss pool (fire-and-forget)
    CdfiPackagingService.allocateFirstLossContribution(
      conversion.id,
      Number(commTotal),
    ).catch(err => console.error('[Affiliate] First-loss allocation error:', err));

    return conversion;
  }

  static getConversions() {
    return prisma.affiliateConversion.findMany({
      include: {
        listing: { select: { title: true, program: { select: { name: true, platform: true } } } },
        click: { select: { userId: true, userRole: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  static async getStats() {
    const [confirmed, pending, totalClicks, totalConversions] = await Promise.all([
      prisma.affiliateConversion.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { commTotal: true, dafShare: true, platformShare: true, saleAmount: true },
      }),
      prisma.affiliateConversion.aggregate({
        where: { status: 'PENDING' },
        _sum: { commTotal: true },
      }),
      prisma.affiliateClick.count(),
      prisma.affiliateConversion.count({ where: { status: 'CONFIRMED' } }),
    ]);

    return {
      totalSaleVolume:     Number(confirmed._sum.saleAmount    ?? 0),
      totalCommissions:    Number(confirmed._sum.commTotal     ?? 0),
      dafBalance:          Number(confirmed._sum.dafShare      ?? 0),
      platformRevenue:     Number(confirmed._sum.platformShare ?? 0),
      pendingCommissions:  Number(pending._sum.commTotal       ?? 0),
      totalClicks,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) : 0,
    };
  }
}

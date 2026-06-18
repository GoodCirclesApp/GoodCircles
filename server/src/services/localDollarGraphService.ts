import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger';

type Money = Decimal | number | string;

export interface EdgeInput {
  transactionId: string;
  occurredAt: Date;
  source?: 'settlement' | 'reconciled';

  neighborId: string;
  consumerState?: string | null;
  merchantId: string;
  merchantType?: string | null;
  productCategory?: string | null;
  censusTractId?: string | null;
  isQIA?: boolean;
  regionId?: string | null;
  nonprofitId: string;
  nonprofitName?: string | null;
  nonprofitEin?: string | null;
  nteeCode?: string | null;
  waivedToInitiativeId?: string | null;
  waivedToFundId?: string | null;

  grossAmount: Money;
  discountAmount: Money;
  cogs: Money;
  merchantNet: Money;
  nonprofitShare: Money;
  platformFee: Money;
  waivedContribution: Money;
  creditIssued: Money;

  paymentMethod: string;
  discountWaived?: boolean;
  discountMode?: string | null;
}

function periodOf(d: Date): string {
  return d.toISOString().slice(0, 7); // YYYY-MM
}

// Pure, total: maps a settlement snapshot into an edge row. Never throws.
export function buildEdge(input: EdgeInput): Prisma.LocalDollarEdgeCreateInput {
  return {
    transactionId: input.transactionId,
    occurredAt: input.occurredAt,
    period: periodOf(input.occurredAt),
    source: input.source ?? 'settlement',
    neighborId: input.neighborId,
    consumerState: input.consumerState ?? null,
    merchantId: input.merchantId,
    merchantType: input.merchantType ?? null,
    productCategory: input.productCategory ?? null,
    censusTractId: input.censusTractId ?? null,
    isQIA: input.isQIA ?? false,
    regionId: input.regionId ?? null,
    nonprofitId: input.nonprofitId,
    nonprofitName: input.nonprofitName ?? null,
    nonprofitEin: input.nonprofitEin ?? null,
    nteeCode: input.nteeCode ?? null,
    waivedToInitiativeId: input.waivedToInitiativeId ?? null,
    waivedToFundId: input.waivedToFundId ?? null,
    grossAmount: input.grossAmount,
    discountAmount: input.discountAmount,
    cogs: input.cogs,
    merchantNet: input.merchantNet,
    nonprofitShare: input.nonprofitShare,
    platformFee: input.platformFee,
    waivedContribution: input.waivedContribution,
    creditIssued: input.creditIssued,
    paymentMethod: input.paymentMethod,
    isInternal: input.paymentMethod === 'INTERNAL',
    discountWaived: input.discountWaived ?? false,
    discountMode: input.discountMode ?? null,
  };
}

function num(d: Decimal | null | undefined): number {
  return d ? Number(d) : 0;
}

export class LocalDollarGraphService {
  /**
   * Record an edge — best-effort, fire-and-forget. NEVER throws and NEVER blocks
   * the caller (called post-commit from settlement). Idempotent: the unique
   * transactionId means a redelivered/duplicate settlement is silently a no-op,
   * and a missed write is healed by reconcile().
   */
  static record(input: EdgeInput): void {
    void prisma.localDollarEdge
      .create({ data: buildEdge(input) })
      .catch((err: any) => {
        if (err?.code === 'P2002') return; // already recorded — append-only, leave the original
        logger.warn('[LDG] edge write failed', {
          transactionId: input.transactionId,
          detail: String(err?.message ?? err),
        });
      });
  }

  /**
   * Self-healing completeness: build edges for any Transactions that have none yet
   * (created by a path that didn't call record(), or where a post-commit write was
   * lost). Reconstructs the snapshot from the current related rows and tags the edge
   * source="reconciled". Bounded; safe to run repeatedly. Returns rows written.
   */
  static async reconcile(limit = 500): Promise<number> {
    // Find transaction ids that have no edge yet (scalable LEFT JOIN, not a NOT IN).
    const missing = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT t."id"
      FROM "Transaction" t
      LEFT JOIN "LocalDollarEdge" e ON e."transactionId" = t."id"
      WHERE e."id" IS NULL
      ORDER BY t."createdAt" ASC
      LIMIT ${limit}
    `);
    if (missing.length === 0) return 0;

    const txs = await prisma.transaction.findMany({
      where: { id: { in: missing.map((m) => m.id) } },
      include: { merchant: true, nonprofit: true, productService: true },
    });

    let written = 0;
    for (const t of txs) {
      const discountAmount = num(t.discountAmount);
      const waived = t.discountWaived === true;
      const isCredit = !waived && t.discountMode === 'PLATFORM_CREDITS';
      const input: EdgeInput = {
        transactionId: t.id,
        occurredAt: t.createdAt,
        source: 'reconciled',
        neighborId: t.neighborId,
        consumerState: t.consumerState,
        merchantId: t.merchantId,
        merchantType: t.merchant?.businessType ?? null,
        productCategory: t.productService?.category ?? null,
        censusTractId: t.merchant?.censusTractId ?? null,
        isQIA: t.merchant?.isQualifiedInvestmentArea ?? false,
        regionId: t.merchant?.regionId ?? null,
        nonprofitId: t.nonprofitId,
        nonprofitName: t.nonprofit?.orgName ?? null,
        nonprofitEin: t.nonprofit?.ein ?? null,
        waivedToInitiativeId: t.waivedToInitiativeId,
        waivedToFundId: t.waivedToFundId,
        grossAmount: t.grossAmount,
        discountAmount: t.discountAmount,
        // COGS isn't stored on Transaction — use the current product cost (reconciled snapshot).
        cogs: t.productService?.cogs ?? 0,
        merchantNet: t.merchantNet,
        nonprofitShare: t.nonprofitShare,
        platformFee: t.platformFee,
        // Derivable exactly from stored fields: the discount went to exactly one place.
        waivedContribution: waived ? discountAmount : 0,
        creditIssued: isCredit ? discountAmount : 0,
        paymentMethod: t.paymentMethod,
        discountWaived: waived,
        discountMode: t.discountMode,
      };
      try {
        await prisma.localDollarEdge.create({ data: buildEdge(input) });
        written++;
      } catch (err: any) {
        if (err?.code !== 'P2002') {
          logger.warn('[LDG] reconcile write failed', { transactionId: t.id, detail: String(err?.message ?? err) });
        }
      }
    }
    return written;
  }

  // ── Traversals: every data product is a query over the one graph ──

  /** Headline aggregates — the "where every local dollar goes" rollup. */
  static async summary(period?: string) {
    const where: Prisma.LocalDollarEdgeWhereInput = period ? { period } : {};
    const [agg, internalAgg, qiaAgg, tracts, nonprofits] = await Promise.all([
      prisma.localDollarEdge.aggregate({
        where,
        _count: { _all: true },
        _sum: { grossAmount: true, discountAmount: true, merchantNet: true, nonprofitShare: true, platformFee: true, waivedContribution: true },
      }),
      prisma.localDollarEdge.aggregate({ where: { ...where, isInternal: true }, _sum: { grossAmount: true } }),
      prisma.localDollarEdge.aggregate({ where: { ...where, isQIA: true }, _sum: { grossAmount: true } }),
      prisma.localDollarEdge.findMany({ where: { ...where, censusTractId: { not: null } }, select: { censusTractId: true }, distinct: ['censusTractId'] }),
      prisma.localDollarEdge.findMany({ where, select: { nonprofitId: true }, distinct: ['nonprofitId'] }),
    ]);
    const gross = num(agg._sum.grossAmount);
    const internalGross = num(internalAgg._sum.grossAmount);
    return {
      period: period ?? 'all-time',
      edges: agg._count._all,
      grossMapped: gross,
      consumerSaved: num(agg._sum.discountAmount),
      toMerchants: num(agg._sum.merchantNet),
      toNonprofits: num(agg._sum.nonprofitShare) + num(agg._sum.waivedContribution),
      platformFee: num(agg._sum.platformFee),
      localRetentionPct: gross > 0 ? Math.round((internalGross / gross) * 1000) / 10 : 0, // % of dollars kept in the local closed loop
      qiaVolume: num(qiaAgg._sum.grossAmount),
      tractsTouched: tracts.length,
      nonprofitsFunded: nonprofits.length,
    };
  }

  /** Civic / CDFI traversal: dollars + donations by census tract (QIA-flagged). */
  static async topTracts(limit = 10, period?: string) {
    const where: Prisma.LocalDollarEdgeWhereInput = { censusTractId: { not: null }, ...(period ? { period } : {}) };
    const rows = await prisma.localDollarEdge.groupBy({
      by: ['censusTractId', 'isQIA'],
      where,
      _sum: { grossAmount: true, nonprofitShare: true },
      _count: { _all: true },
      orderBy: { _sum: { grossAmount: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({
      censusTractId: r.censusTractId,
      isQIA: r.isQIA,
      gross: num(r._sum.grossAmount),
      donations: num(r._sum.nonprofitShare),
      transactions: r._count._all,
    }));
  }

  /** Nonprofit traversal: donations routed by elected nonprofit. */
  static async topNonprofits(limit = 10, period?: string) {
    const where: Prisma.LocalDollarEdgeWhereInput = period ? { period } : {};
    const rows = await prisma.localDollarEdge.groupBy({
      by: ['nonprofitId', 'nonprofitName'],
      where,
      _sum: { nonprofitShare: true, waivedContribution: true },
      _count: { _all: true },
      orderBy: { _sum: { nonprofitShare: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({
      nonprofitId: r.nonprofitId,
      nonprofitName: r.nonprofitName,
      donations: num(r._sum.nonprofitShare) + num(r._sum.waivedContribution),
      transactions: r._count._all,
    }));
  }

  /** Merchant traversal: gross + margin by product category. */
  static async byCategory(limit = 12, period?: string) {
    const where: Prisma.LocalDollarEdgeWhereInput = { productCategory: { not: null }, ...(period ? { period } : {}) };
    const rows = await prisma.localDollarEdge.groupBy({
      by: ['productCategory'],
      where,
      _sum: { grossAmount: true, merchantNet: true, cogs: true, nonprofitShare: true },
      _count: { _all: true },
      orderBy: { _sum: { grossAmount: 'desc' } },
      take: limit,
    });
    return rows.map((r) => ({
      category: r.productCategory,
      gross: num(r._sum.grossAmount),
      merchantNet: num(r._sum.merchantNet),
      cogs: num(r._sum.cogs),
      donations: num(r._sum.nonprofitShare),
      transactions: r._count._all,
    }));
  }
}

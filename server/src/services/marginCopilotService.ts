import { prisma } from '../lib/prisma';
import { calculateDistribution } from './transactionService';
import { aiConfigured, generateText } from '../lib/aiClient';

// A merchant's COGS is the single most guarded number in their business, and Good
// Circles is one of the only platforms that legitimately holds it. Margin Copilot
// reasons over the merchant's OWN cost/sales data. The moat is the data, not the
// reasoning — so the core analysis is DETERMINISTIC (works pre-launch with no AI
// key); Claude only adds a readable narrative when ANTHROPIC_API_KEY is set.

const TARGET_GROSS_MARGIN = 0.35; // a "healthy" target: (price - cogs) / price

export interface ProductLite { id: string; name: string; category: string; price: number; cogs: number; }
export interface SalesAgg { units: number; gross: number; merchantNet: number; nonprofitShare: number; }
export type SalesMap = Record<string, SalesAgg>;

export interface Finding {
  productId: string;
  name: string;
  category: string;
  price: number;
  cogs: number;
  grossMarginPct: number; // (price - cogs) / price, as a percentage
  status: 'LOSS' | 'LOW' | 'HEALTHY';
  units: number; // units sold to date
  currentNet: number; // merchant net per sale at current price
  currentDonation: number; // nonprofit share per sale at current price
  suggestedPrice: number | null;
  perSaleNetUplift: number;
  perSaleDonationUplift: number;
  periodNetUplift: number; // perSaleNetUplift * units sold to date
  periodDonationUplift: number;
}

export interface Totals {
  productCount: number;
  flaggedCount: number;
  lossCount: number;
  potentialPeriodNet: number;
  potentialPeriodDonation: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pure: from the merchant's products + their sales aggregates, find pricing
 * opportunities. Uses the canonical calculateDistribution so the projected uplift
 * is consistent with how the platform actually splits a sale.
 */
export function computeFindings(products: ProductLite[], sales: SalesMap): Finding[] {
  const findings: Finding[] = products.map((p) => {
    const price = p.price;
    const cogs = p.cogs;
    const grossMarginPct = price > 0 ? (price - cogs) / price : 0;
    const cur = calculateDistribution(price, cogs, false, false, 'PRICE_REDUCTION', 0);
    const currentNet = Number(cur.merchantNet);
    const currentDonation = Number(cur.nonprofitShare);
    const units = sales[p.id]?.units ?? 0;

    let status: Finding['status'] = 'HEALTHY';
    if (Number(cur.profit) <= 0) status = 'LOSS';
    else if (grossMarginPct < TARGET_GROSS_MARGIN) status = 'LOW';

    let suggestedPrice: number | null = null;
    let perSaleNetUplift = 0;
    let perSaleDonationUplift = 0;
    if (status !== 'HEALTHY' && cogs > 0) {
      const target = round2(cogs / (1 - TARGET_GROSS_MARGIN)); // price hitting the target gross margin
      if (target > price) {
        suggestedPrice = target;
        const proj = calculateDistribution(target, cogs, false, false, 'PRICE_REDUCTION', 0);
        perSaleNetUplift = round2(Number(proj.merchantNet) - currentNet);
        perSaleDonationUplift = round2(Number(proj.nonprofitShare) - currentDonation);
      }
    }

    return {
      productId: p.id,
      name: p.name,
      category: p.category,
      price: round2(price),
      cogs: round2(cogs),
      grossMarginPct: Math.round(grossMarginPct * 1000) / 10,
      status,
      units,
      currentNet: round2(currentNet),
      currentDonation: round2(currentDonation),
      suggestedPrice,
      perSaleNetUplift,
      perSaleDonationUplift,
      periodNetUplift: round2(perSaleNetUplift * units),
      periodDonationUplift: round2(perSaleDonationUplift * units),
    };
  });

  const rank: Record<Finding['status'], number> = { LOSS: 0, LOW: 1, HEALTHY: 2 };
  return findings.sort(
    (a, b) =>
      rank[a.status] - rank[b.status] ||
      b.periodNetUplift - a.periodNetUplift ||
      b.perSaleNetUplift - a.perSaleNetUplift,
  );
}

function deterministicNarrative(totals: Totals, flaggedCount: number): string {
  if (totals.productCount === 0) {
    return 'Add products with their cost of goods (COGS) and Margin Copilot will spot pricing opportunities here.';
  }
  if (flaggedCount === 0) {
    return 'Every active product is priced at a healthy margin — nothing to fix right now.';
  }
  const loss = totals.lossCount > 0 ? `${totals.lossCount} product(s) are selling at or below cost. ` : '';
  const opp =
    totals.potentialPeriodNet > 0
      ? `Re-pricing the ${flaggedCount} flagged product(s) to a healthy margin would recover about $${totals.potentialPeriodNet.toFixed(2)} in net profit across sales to date, and lift the community donation those sales generate by about $${totals.potentialPeriodDonation.toFixed(2)}.`
      : `Review the ${flaggedCount} flagged product(s) below.`;
  return `${loss}${opp}`;
}

export class MarginCopilotService {
  static async buildContext(merchantId: string): Promise<{ products: ProductLite[]; sales: SalesMap }> {
    const products = await prisma.productService.findMany({
      where: { merchantId, isActive: true },
      select: { id: true, name: true, category: true, price: true, cogs: true },
    });
    const productList: ProductLite[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      cogs: Number(p.cogs),
    }));

    const grouped = await prisma.transaction.groupBy({
      by: ['productServiceId'],
      where: { merchantId },
      _count: { _all: true },
      _sum: { grossAmount: true, merchantNet: true, nonprofitShare: true },
    });
    const sales: SalesMap = {};
    for (const g of grouped) {
      if (!g.productServiceId) continue;
      sales[g.productServiceId] = {
        units: g._count._all,
        gross: Number(g._sum.grossAmount ?? 0),
        merchantNet: Number(g._sum.merchantNet ?? 0),
        nonprofitShare: Number(g._sum.nonprofitShare ?? 0),
      };
    }
    return { products: productList, sales };
  }

  static async analyze(merchantId: string) {
    const { products, sales } = await this.buildContext(merchantId);
    const findings = computeFindings(products, sales);

    const flagged = findings.filter((f) => f.status !== 'HEALTHY');
    const opportunities = flagged.filter((f) => f.suggestedPrice !== null);
    const totals: Totals = {
      productCount: products.length,
      flaggedCount: flagged.length,
      lossCount: findings.filter((f) => f.status === 'LOSS').length,
      potentialPeriodNet: round2(opportunities.reduce((s, f) => s + f.periodNetUplift, 0)),
      potentialPeriodDonation: round2(opportunities.reduce((s, f) => s + f.periodDonationUplift, 0)),
    };

    let narrative: string;
    if (aiConfigured() && flagged.length > 0) {
      const system =
        `You are Margin Copilot, an advisor for a local merchant on Good Circles. Reason ONLY over the merchant's own product data provided. Be concrete, brief, and encouraging. Good Circles routes 10% of each sale's NET PROFIT to the customer's chosen nonprofit, so improving a thin margin also raises the merchant's community donation — frame that as a benefit, not a cost. Give a short prioritized plan (3-5 bullets max), naming specific products and the dollar upside. Plain text, no markdown headers.`;
      const user = `Flagged products (margin %, suggested price, and per-period upside if adopted):\n${JSON.stringify(
        flagged.slice(0, 12),
      )}\n\nTotals: ${JSON.stringify(totals)}.`;
      narrative = (await generateText(system, user, 800)) ?? deterministicNarrative(totals, flagged.length);
    } else {
      narrative = deterministicNarrative(totals, flagged.length);
    }

    return { aiUsed: aiConfigured(), narrative, findings, totals };
  }
}

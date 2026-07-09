// ─────────────────────────────────────────────────────────────────────────────
// Good Circles — canonical unit economics (SINGLE SOURCE OF TRUTH).
//
// Every per-$100 money figure on the marketing site MUST come from here so the
// numbers can never drift apart again (this file resolves the prior $3-vs-$5
// contradiction to the locked canonical of ~$4 to a nonprofit per $100 at a 40%
// average merchant margin).
//
// The underlying SPLIT RATES (nonprofit 10% / platform 1% / merchant 89% of net
// profit; consumer discount 10%) are the same ones enforced server-side in
// server/src/lib/splitRates.ts — that file is the rate source of truth; THIS file
// is the source of truth for the DISPLAY dollar figures the marketing site shows.
//
// Canonical worked example (locked 2026-07-09): a $100 local purchase at a ~40%
// average margin → ~$40 profit. Standardizing on a $50 cost basis makes the
// example land exactly on the canonical $4 (it is the midpoint of the two old
// conflicting examples: How-It-Works used a $40 cost → $5, /sell used a $60 cost
// → $3; $50 → $40 profit → $4).
// ─────────────────────────────────────────────────────────────────────────────

/** Split rates, as fractions of merchant NET PROFIT (mirror of splitRates.ts). */
export const RATES = {
  shopperDiscountOfList: 0.10, // consumer saves ~10% off list
  nonprofitOfProfit: 0.10, // 10% of profit funds the chosen nonprofit
  platformOfProfit: 0.01, // 1% platform fee on profit
  merchantOfProfit: 0.89, // merchant keeps 89% of profit
  avgMerchantMargin: 0.40, // ~40% average merchant margin (profit / list)
} as const;

/**
 * The canonical "$100 of local spending" line items — the parallel facts shown on
 * the homepage / How-It-Works / Local Giving Index (not a strict sum; each is a
 * fact about $100 of local spend).
 */
export const PER_100 = {
  spent: 100, // reference: $100 of local spending
  shopperSaves: 10, // ~$10 back to the shopper (~10% savings)
  nonprofit: 4, // ~$4 to the chosen nonprofit (10% of profit at a 40% margin)
  platform: 0.4, // ~$0.40 platform fee (1% of profit)
  // Local recirculation (Civic Economics; site-canonical $53 vs $14 — 52.9% / 13.6%).
  localRecirculation: 53, // ~$53 of every $100 stays local at an independent
  chainRecirculation: 14, // ~$14 of every $100 stays local at a national chain
  get localSwing() {
    return this.localRecirculation - this.chainRecirculation; // ~$39 swing
  },
} as const;

/**
 * The canonical worked example that SUMS (used by the How-It-Works and /sell money
 * tables). A $100-list item at a 40% margin with a $50 cost: the shopper takes 10%
 * off and pays $90; the $40 profit splits 10/1/89 → $4 nonprofit, $0.40 platform,
 * $35.60 merchant profit share (so the merchant keeps $85.60 = $50 cost + $35.60).
 * This is the midpoint that resolves the old $40-cost→$5 vs $60-cost→$3 conflict.
 */
export const WORKED_EXAMPLE = {
  list: 100,
  shopperSaves: 10,
  paid: 90, // list − shopper discount
  cost: 50,
  profit: 40, // paid − cost  (== 40% of list)
  nonprofit: 4, // 10% of profit
  platform: 0.4, // 1% of profit
  merchantProfitShare: 35.6, // 89% of profit
  merchantKeeps: 85.6, // paid − nonprofit − platform (== cost + merchant profit share)
} as const;

/** Local Giving Index base case: one household routing ~$200/mo of local spend. */
export const HOUSEHOLD = {
  monthlyLocalSpend: 200,
  annualList: 2400, // $200/mo × 12
  // Derived per-year figures (annualList / 100 × the per-$100 line).
  get saved() {
    return Math.round((this.annualList / 100) * PER_100.shopperSaves); // ~$240
  },
  get toNonprofit() {
    return Math.round((this.annualList / 100) * PER_100.nonprofit); // ~$96
  },
  get keptLocal() {
    return Math.round((this.annualList / 100) * PER_100.localSwing); // ~$936 (39% × $2,400)
  },
} as const;

export interface ScalingRow {
  households: number;
  saved: number;
  toNonprofit: number;
  keptLocal: number;
}

/** Scaling scenarios for the Index (modeled projections — gate behind [REVIEW]). */
export const SCALING: ScalingRow[] = [1000, 10000, 50000].map((households) => ({
  households,
  saved: households * HOUSEHOLD.saved,
  toNonprofit: households * HOUSEHOLD.toNonprofit,
  keptLocal: households * HOUSEHOLD.keptLocal,
}));

/** AmazonSmile reference facts (third-party sourced; the COMPARISON is [REVIEW]). */
export const AMAZONSMILE = {
  ratePercent: 0.5, // ~0.5% per purchase
  lifetimeMillions: 449, // ~$449M donated globally
  ended: 'February 2023',
  ranFrom: 2013,
  // ~8× is a modeled comparison of the per-dollar giving rate — gate in [REVIEW].
  giveMultipleVsGoodCircles: 8,
} as const;

/** Canonical one-sentence positioning (use verbatim; matches Organization schema). */
export const POSITIONING =
  "Good Circles is a community marketplace where shoppers save about 10%, 10% of the merchant's profit funds a nonprofit the shopper chooses, and the local business keeps 89% of its profit.";

/** Sources to cite wherever these figures appear. */
export const ECON_SOURCES = {
  localMultiplier:
    'Civic Economics local multiplier studies (independents recirculate ~53% locally vs ~14% for chains); corroborated by AMIBA and the Institute for Local Self-Reliance.',
  amazonSmile:
    'AmazonSmile gave ~0.5% per purchase and ~$449M globally before ending February 2023 (NPR; Charity Navigator).',
} as const;

// ── Formatting helpers ───────────────────────────────────────────────────────
/** Compact USD, e.g. 936000 → "$936,000", 2400000 → "$2.4M". */
export function usd(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${(Math.round(m * 10) / 10).toString()}M`;
  }
  return `$${n.toLocaleString('en-US')}`;
}

/** Plain dollars with optional cents, e.g. 4 → "$4", 0.4 → "$0.40". */
export function dollars(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

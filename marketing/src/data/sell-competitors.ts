// Single source of truth for the merchant-acquisition ("/sell") funnel.
//
// GOOD CIRCLES MATH — mirrors the production engine exactly
// (server/src/services/transactionService.ts calculateDistribution +
//  server/src/lib/splitRates.ts), verified 2026-06-22:
//   • consumer pays list × 0.90 (the ~10% saving is a real price reduction the
//     merchant funds — default discountMode = PRICE_REDUCTION);
//   • net profit  = (0.90 × list) − COGS;
//   • of net profit: nonprofit 10%, platform 1%, merchant keeps 89% (residual);
//   • the customer discount AND the nonprofit donation are both deductible through
//     the commercial co-venture, so both reduce the merchant's taxable income;
//   • NO merchant card cost (the customer pays credit card processing if they use a
//     card), NO platform commission on the sale, and NO ad spend (demand comes from
//     nonprofit supporters). Comparisons run to AFTER-TAX profit + total local value.
//
// ACCURACY CONTRACT (see src/data/site.ts): shoppers save ~10%; a nonprofit gets
// 10% of the merchant's NET PROFIT; merchants keep 89% of profit on a 1% fee.
//
// HONESTY NOTE: Good Circles does NOT out-earn every competitor on raw per-sale
// cash. It clearly wins vs high-extraction platforms (delivery apps, Groupon,
// Amazon, lead-gen). Against genuinely low-fee channels (Etsy base, Mercari,
// a merchant's own store) the merchant's take-home is comparable or slightly
// lower — the difference is REDISTRIBUTED to the customer (~10% saving) and the
// community (the charitable share), instead of vanishing to a platform. Pages
// must frame each competitor on the truthful axis. Never claim a universal
// per-sale win.

export const CONSUMER_DISCOUNT = 0.1; // ~10% the customer saves (lowers taxable revenue)
export const NONPROFIT_RATE = 0.1; // 10% of net profit → chosen nonprofit (deductible)
export const PLATFORM_RATE = 0.01; // 1% of net profit → Good Circles
export const MERCHANT_PROFIT_RATE = 0.89; // of net profit → merchant
export const DEFAULT_TAX_RATE = 0.25; // illustrative combined marginal rate (editable)
// No merchant card cost on Good Circles — the customer pays credit card processing
// if they choose to pay by card. No platform commission on the sale, no ad spend.

export const round2 = (n: number) => Math.round(n * 100) / 100;

export interface GcResult {
  listPrice: number;
  customerPays: number;
  customerSaves: number;
  netProfit: number;
  donation: number;
  platformFee: number;
  preTaxProfit: number;
  tax: number;
  afterTaxProfit: number;
  communityFunded: number;
  afterTaxCostOfGiving: number;
  totalLocalValue: number;
}

/** Good Circles per-sale accounting. Revenue is the list price; the customer
 *  discount and the deductible nonprofit donation both reduce taxable income.
 *  No card-processing or ad cost to the merchant. */
export function goodCircles(price: number, cogs: number, taxRate: number = DEFAULT_TAX_RATE): GcResult {
  const customerSaves = round2(price * CONSUMER_DISCOUNT);
  const customerPays = round2(price - customerSaves);
  const netProfit = round2(customerPays - cogs);
  const donation = round2(netProfit * NONPROFIT_RATE);
  const platformFee = round2(netProfit * PLATFORM_RATE);
  const preTaxProfit = round2(customerPays - cogs - donation - platformFee);
  const afterTaxProfit = round2(preTaxProfit * (1 - taxRate));
  const tax = round2(preTaxProfit - afterTaxProfit);
  const afterTaxCostOfGiving = round2((customerSaves + donation) * (1 - taxRate));
  const totalLocalValue = round2(afterTaxProfit + customerSaves + donation);
  return {
    listPrice: price, customerPays, customerSaves, netProfit, donation, platformFee,
    preTaxProfit, tax, afterTaxProfit, communityFunded: donation, afterTaxCostOfGiving, totalLocalValue,
  };
}

export interface CompResult {
  fee: number; marketing: number; preTaxProfit: number; tax: number;
  afterTaxProfit: number; totalLocalValue: number;
}

/** Competitor per-sale accounting at an all-in fee rate (+ optional ad spend). */
export function competitor(
  price: number, cogs: number, feePct: number,
  taxRate: number = DEFAULT_TAX_RATE, marketingPct: number = 0,
): CompResult {
  const fee = round2(price * (feePct / 100));
  const marketing = round2(price * (marketingPct / 100));
  const preTaxProfit = round2(price - cogs - fee - marketing);
  const afterTaxProfit = round2(preTaxProfit * (1 - taxRate));
  const tax = round2(preTaxProfit - afterTaxProfit);
  return { fee, marketing, preTaxProfit, tax, afterTaxProfit, totalLocalValue: afterTaxProfit };
}

// --- Lead-generation model (Thumbtack, Angi) -------------------------------
// Pay-per-lead, no commission: you buy shared leads and are charged whether or
// not you win. Cost to win ONE job = cost-per-lead ÷ close-rate, and the lead
// fees for the jobs you LOST are pure waste. This cost is independent of job
// value, so it is brutal on lower-value jobs and can exceed the job entirely.
export interface LeadGenResult {
  winCost: number; // total lead spend to win one job
  leadsPerWin: number; // leads paid for per job won
  wastedOnLosses: number; // lead spend on the jobs you didn't win
  preTaxProfit: number;
  tax: number;
  afterTaxProfit: number;
  totalLocalValue: number;
}
export function leadGen(
  jobValue: number, cogs: number, costPerLead: number, closeRatePct: number,
  taxRate: number = DEFAULT_TAX_RATE,
): LeadGenResult {
  const leadsPerWin = closeRatePct > 0 ? round2(100 / closeRatePct) : 0;
  const winCost = round2(costPerLead * leadsPerWin);
  const preTaxProfit = round2(jobValue - cogs - winCost);
  const afterTaxProfit = round2(preTaxProfit * (1 - taxRate));
  const tax = round2(preTaxProfit - afterTaxProfit);
  return {
    winCost, leadsPerWin, wastedOnLosses: round2(winCost - costPerLead),
    preTaxProfit, tax, afterTaxProfit, totalLocalValue: afterTaxProfit,
  };
}

// Lead-gen calculator presets (reported ranges — pros set their own; sources:
// help.thumbtack.com/article/pay-for-leads; Angi has no official price list,
// figures are reported). Verified 2026-06-22.
export const LEAD_GEN_PLATFORMS = [
  { key: "thumbtack", label: "Thumbtack", cpl: 30, close: 20, note: "pay per lead, shared with ~4–5 pros, charged win or lose (reported CPL ~$8–$200+ by trade)" },
  { key: "angi", label: "Angi", cpl: 45, close: 20, note: "leads + membership/ads on annual contracts (reported CPL ~$15–$120)" },
  { key: "other", label: "Other lead-gen (HomeAdvisor, etc.)", cpl: 35, close: 20, note: "pay per shared lead — set your own numbers" },
];

// --- Subscription / booking model (Vagaro, StyleSeat, Booksy) --------------
// Salon/local-services booking software: a monthly subscription + payment
// processing, and (StyleSeat/Booksy) a one-time NEW-CLIENT fee of ~30% of the
// first appointment (capped). Cheap for REPEAT clients; the real cost is the
// recurring subscription plus acquiring NEW clients. Good Circles brings new
// local clients at no acquisition fee, no subscription, no merchant card cost.
export interface SubConfig {
  monthlySub: number; procPct: number; procFixed: number;
  newClientPct: number; newClientCap: number; bookingsPerMonth: number;
}
export interface SubResult {
  processing: number; subPerBooking: number; newClientFee: number;
  preTaxReturning: number; afterTaxReturning: number; totalValueReturning: number;
  preTaxNew: number; afterTaxNew: number; totalValueNew: number;
  subscriptionPerYear: number;
}
export function subscriptionBooking(
  price: number, cogs: number, cfg: SubConfig, taxRate: number = DEFAULT_TAX_RATE,
): SubResult {
  const processing = round2(price * (cfg.procPct / 100) + cfg.procFixed);
  const subPerBooking = cfg.bookingsPerMonth > 0 ? round2(cfg.monthlySub / cfg.bookingsPerMonth) : round2(cfg.monthlySub);
  const newClientFee = round2(Math.min(price * (cfg.newClientPct / 100), cfg.newClientCap));
  const preTaxReturning = round2(price - cogs - processing - subPerBooking);
  const afterTaxReturning = round2(preTaxReturning * (1 - taxRate));
  const preTaxNew = round2(preTaxReturning - newClientFee);
  const afterTaxNew = round2(preTaxNew * (1 - taxRate));
  return {
    processing, subPerBooking, newClientFee,
    preTaxReturning, afterTaxReturning, totalValueReturning: afterTaxReturning,
    preTaxNew, afterTaxNew, totalValueNew: afterTaxNew,
    subscriptionPerYear: round2(cfg.monthlySub * 12),
  };
}
// Reported terms verified 2026-06-22 (vagaro.com/pro/pricing, help.styleseat.com,
// biz.booksy.com/en-us/pricing). New-client fees are one-time per client.
export const SUBSCRIPTION_PLATFORMS = [
  { key: "vagaro", label: "Vagaro", monthlySub: 30, procPct: 2.6, procFixed: 0.1, newClientPct: 0, newClientCap: 0, note: "$30/mo (+$10/employee, cap $90); 2.6% + $0.10 processing; no new-client fee" },
  { key: "styleseat", label: "StyleSeat", monthlySub: 35, procPct: 2.6, procFixed: 0.3, newClientPct: 30, newClientCap: 50, note: "$35/mo; 2.6% + $0.30 processing; 30% new-client fee on the first visit (capped $50)" },
  { key: "booksy", label: "Booksy", monthlySub: 29.99, procPct: 2.69, procFixed: 0.3, newClientPct: 30, newClientCap: 100, note: "$29.99/mo (+$20/team member); ~2.69% + $0.30 processing; Boost 30% new-client fee (capped $100)" },
  { key: "other", label: "Other booking app", monthlySub: 30, procPct: 2.6, procFixed: 0.3, newClientPct: 0, newClientCap: 0, note: "monthly subscription + processing — set your own numbers" },
];

// Honest, margin-aware verdict (the win depends on competitor fee AND the
// merchant's margin — break-even is fee > ~23% − 11%×(COGS/price)):
//   "win"            — high-fee/punitive: GC keeps more across realistic margins
//                      (delivery apps at 25–30%, Groupon, lead-gen, ~20% resale)
//   "depends"        — mid-fee (~13–20%): thin margins favor GC, fat margins favor them
//   "redistribution" — already low-fee (≤~12%): take-home is similar; GC's win is
//                      that the margin goes to the customer + community, not a platform
export type Verdict = "win" | "depends" | "redistribution";

export interface Competitor {
  key: string;
  /** Brand name as displayed. */
  name: string;
  category: "Goods" | "Food delivery" | "Services" | "Resale" | "Freelance" | "Booking" | "Own store";
  /** Typical all-in % the intermediary keeps (processing included) — prefills the calculator. */
  typicalFeePct: number;
  /** Short label for the headline take in the master table. */
  takeLabel: string;
  /** How the model works, plain English. */
  model: string;
  /** Verified detail string for the per-page "Sources" block. */
  detail: string;
  source: string;
  verified: string; // YYYY-MM-DD
  /** Honest margin-aware verdict for the segmentation copy. */
  verdict: Verdict;
  /** Whether a dedicated /sell/<key>/ deep-dive page exists yet (controls internal linking). */
  hasPage?: boolean;
}

// All figures verified 2026-06-22 (US sellers; marketplace fees are often
// category-dependent — ranges are stated, not collapsed into false precision).
export const COMPETITORS: Competitor[] = [
  {
    key: "doordash",
    name: "DoorDash",
    category: "Food delivery",
    typicalFeePct: 30,
    takeLabel: "15–30% per order",
    model: "Per-order commission by plan (Basic 15% / Plus 25% / Premier 30%); pickup 6%.",
    detail:
      "Marketplace commission tiers Basic 15% / Plus 25% / Premier 30% (pickup 6%); payment processing is bundled into the commission on Marketplace orders. Most restaurants run Plus or Premier for visibility.",
    source: "merchants.doordash.com/en-us/blog/doordash-pricing-products",
    verified: "2026-06-22",
    verdict: "win",
    hasPage: true,
  },
  {
    key: "ubereats",
    name: "Uber Eats",
    category: "Food delivery",
    typicalFeePct: 30,
    takeLabel: "20–30% per order",
    model: "Per-order commission by plan (Lite 20% / Plus 25% / Premium 30%; self-delivery 15%).",
    detail:
      "Marketplace commission Lite 20% (raised from 15% in 2026) / Plus 25% / Premium 30%; self-delivery 15%. The 2.5% + $0.29 rate applies to own-site Webshop orders, not Marketplace.",
    source: "merchants.ubereats.com/us/en/pricing/",
    verified: "2026-06-22",
    verdict: "win",
    hasPage: true,
  },
  {
    key: "grubhub",
    name: "Grubhub",
    category: "Food delivery",
    typicalFeePct: 25,
    takeLabel: "~15–30% per order",
    model: "Marketing commission (5–20%) + delivery (~10%) + processing.",
    detail:
      "Grubhub does not publish named-tier percentages; the ~15–30% range is built from its official components (5–20% marketing + ~10% delivery + processing).",
    source: "get.grubhub.com/faq/what-fees-does-grubhub-charge-restaurants/",
    verified: "2026-06-22",
    verdict: "win",
    hasPage: true,
  },
  {
    key: "groupon",
    name: "Groupon",
    category: "Services",
    typicalFeePct: 75,
    takeLabel: "~75% of list value",
    model: "Customer buys a deep-discount voucher, then Groupon splits the voucher revenue (~50/50).",
    detail:
      "The merchant typically discounts ~50% AND then splits the voucher revenue with Groupon (commonly ~50/50, negotiable), so the merchant often nets only ~25% of the original list value — frequently below cost.",
    source: "groupon.com/merchant/frequently-asked-questions",
    verified: "2026-06-22",
    verdict: "win",
    hasPage: true,
  },
  {
    key: "amazon",
    name: "Amazon",
    category: "Goods",
    typicalFeePct: 15,
    takeLabel: "~15% referral",
    model: "Referral fee 5–45% by category (most 15%) + $39.99/mo Pro plan; FBA extra if used.",
    detail:
      "Referral fee 5–45% by category, most categories 15%, $0.30 minimum; +$39.99/mo Professional plan (or $0.99/item Individual); FBA fulfilment fees on top if Amazon ships. Processing is bundled.",
    source: "sell.amazon.com/pricing",
    verified: "2026-06-22",
    verdict: "depends",
    hasPage: true,
  },
  {
    key: "ebay",
    name: "eBay",
    category: "Goods",
    typicalFeePct: 13.6,
    takeLabel: "~13.25% + $0.40",
    model: "Final value fee ~13.25% (most categories) + $0.40 per order; +1.65% international.",
    detail:
      "Final value fee 13.25% for most categories (range ~9–15%) + $0.40 per order; +1.65% for international buyers; optional Promoted Listings add a seller-set 1–20%.",
    source: "ebay.com/help/selling/fees-credits-invoices/selling-fees",
    verified: "2026-06-22",
    verdict: "depends",
    hasPage: true,
  },
  {
    key: "walmart",
    name: "Walmart Marketplace",
    category: "Goods",
    typicalFeePct: 12,
    takeLabel: "~6–15% referral",
    model: "Referral fee 2.35–20% by category (most goods 6–15%); no monthly or listing fee.",
    detail:
      "Referral fee ranges 2.35–20% by category; most goods fall in 6–15%. No monthly, listing, or setup fee; processing is bundled.",
    source: "marketplacelearn.walmart.com (Referral fee schedule)",
    verified: "2026-06-22",
    verdict: "redistribution",
    hasPage: true,
  },
  {
    key: "poshmark",
    name: "Poshmark",
    category: "Resale",
    typicalFeePct: 20,
    takeLabel: "20% ($15+)",
    model: "Flat $2.95 under $15; 20% commission on sales of $15 and over.",
    detail: "Flat $2.95 on sales under $15; 20% commission on sales $15 and over. No listing, monthly, or separate processing fee.",
    source: "poshmark.com seller terms",
    verified: "2026-06-22",
    verdict: "win",
    hasPage: true,
  },
  {
    key: "mercari",
    name: "Mercari",
    category: "Resale",
    typicalFeePct: 10,
    takeLabel: "10% selling fee",
    model: "10% selling fee; no separate seller processing or cashout fee (since Jan 2025).",
    detail:
      "10% selling fee on item price + buyer-paid shipping. Seller payment-processing and cashout fees were eliminated Jan 6, 2025 (a 3.6% Buyer Protection fee is charged to the buyer, not the seller).",
    source: "mercari.com/us/help_center/article/169",
    verified: "2026-06-22",
    verdict: "redistribution",
    hasPage: true,
  },
  {
    key: "etsy",
    name: "Etsy",
    category: "Goods",
    typicalFeePct: 9.95,
    takeLabel: "~10% (up to ~25% w/ ads)",
    model: "$0.20 listing + 6.5% transaction + 3% + $0.25 processing; Offsite Ads 12–15% when attributed.",
    detail:
      "$0.20 listing + 6.5% transaction fee + (3% + $0.25) US payment processing = ~10% all-in on a $100 sale. Offsite Ads add 12–15% on ad-attributed orders (mandatory above $10k/yr in sales).",
    source: "etsy.com/sell",
    verified: "2026-06-22",
    verdict: "redistribution",
    hasPage: true,
  },
  {
    key: "fiverr",
    name: "Fiverr",
    category: "Freelance",
    typicalFeePct: 20,
    takeLabel: "20% to the seller",
    model: "Flat 20% seller commission (plus a buyer-side service fee).",
    detail: "Flat 20% commission on the freelancer's earnings (including tips); buyers pay an additional ~5.5% service fee.",
    source: "fiverr.com (Payment Terms of Service)",
    verified: "2026-06-22",
    verdict: "depends",
    hasPage: true,
  },
  {
    key: "upwork",
    name: "Upwork",
    category: "Freelance",
    typicalFeePct: 12,
    takeLabel: "~10–13% to the freelancer",
    model: "Variable freelancer service fee (0–15% per contract; reported blended ~10–13%); plus a client-side marketplace fee.",
    detail:
      "The freelancer service fee became variable (0–15% per contract) in May 2025, with a reported blended rate around 10–13%; clients also pay a marketplace fee (~5% on Basic) plus a one-time contract-initiation fee.",
    source: "support.upwork.com (Freelancer Service Fee)",
    verified: "2026-06-22",
    verdict: "redistribution",
    hasPage: true,
  },
  {
    key: "ownstore",
    name: "Your own store (Shopify / Square)",
    category: "Own store",
    typicalFeePct: 3,
    takeLabel: "~2.9% + $0.30 card only",
    model: "Card processing only (~2.9% + $0.30); plus a monthly platform subscription.",
    detail:
      "A self-hosted store (Shopify/Square) charges roughly card processing (~2.9% + $0.30) plus a monthly subscription. Low fees — but you bring 100% of the traffic and there is no built-in customer discount or community funding.",
    source: "shopify.com/pricing, squareup.com/us/en/pricing",
    verified: "2026-06-22",
    verdict: "redistribution",
  },
];

/** Lightweight config the calculator serialises into the page (no functions). */
export const CALC_PLATFORMS = COMPETITORS.map((c) => ({
  key: c.key,
  label: c.name,
  pct: c.typicalFeePct,
  note: c.takeLabel,
}));

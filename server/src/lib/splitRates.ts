import { Decimal } from '@prisma/client/runtime/library';

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the Good Circles money split.
//
// The consumer discount is 10% of MSRP. The merchant / nonprofit / platform split
// is computed on NET PROFIT (effective revenue − COGS):
//   nonprofit 10%  ·  platform 1%  ·  merchant 89%.
//
// Every production split site (transactionService.calculateDistribution and the
// display/preview/seed helpers) MUST import these constants instead of inlining
// 0.10 / 0.01 / 0.89 literals, so the rates can never drift apart again.
// (Replaces the dead legacy 79/10/11 model that used to live in stripeService.)
// ─────────────────────────────────────────────────────────────────────────────

export const GC_DISCOUNT_RATE = 0.10;   // consumer discount, of MSRP
export const NONPROFIT_RATE = 0.10;     // of net profit
export const PLATFORM_RATE = 0.01;      // of net profit
export const MERCHANT_PROFIT_RATE = 0.89; // of net profit

// Load-time guard: the three profit shares must total exactly 100%. If anyone edits
// a rate and breaks conservation, the server fails fast instead of silently leaking.
if (Math.abs(NONPROFIT_RATE + PLATFORM_RATE + MERCHANT_PROFIT_RATE - 1) > 1e-9) {
  throw new Error('[splitRates] NONPROFIT_RATE + PLATFORM_RATE + MERCHANT_PROFIT_RATE must equal 1');
}

// Cent precision + rounding policy. decimal.js ROUND_HALF_UP = 4 — the conventional
// money rounding mode, and it matches the existing Math.round on the Stripe charge.
export const CENTS_DP = 2;
const ROUND_HALF_UP = 4; // Decimal.Rounding literal for HALF_UP

/** Round a Decimal to whole cents using HALF_UP (the documented money rounding policy). */
export function roundCents(d: Decimal): Decimal {
  return d.toDecimalPlaces(CENTS_DP, ROUND_HALF_UP);
}

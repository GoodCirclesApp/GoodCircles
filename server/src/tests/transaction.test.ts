import { describe, it, expect } from 'vitest';
import { calculateDistribution } from '../services/transactionService';
import { PricingService } from '../services/pricingService';
import { GC_DISCOUNT_RATE, NONPROFIT_RATE, PLATFORM_RATE, MERCHANT_PROFIT_RATE } from '../lib/splitRates';

describe('Transaction Engine — Financial Calculations', () => {

  // ─── Standard Purchase (Price Reduction Mode) ────────────────────────

  describe('Standard Purchase — Price Reduction', () => {
    it('should calculate correct 10/10/1 split on a $100 item with $40 COGS', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // Discount = $100 * 0.10 = $10  →  effectiveRevenue = $90
      // Net profit = $90 - $40 = $50
      // Nonprofit share = $50 * 0.10 = $5
      // Platform fee   = $50 * 0.01 = $0.50
      // Merchant profit share = $50 * 0.89 = $44.50
      // Merchant net = $40 (COGS) + $44.50 = $84.50
      // Balance check: $5 + $0.50 + $84.50 = $90 ✓

      expect(Number(dist.msrp)).toBe(100);
      expect(Number(dist.cogs)).toBe(40);
      expect(Number(dist.profit)).toBe(50);
      expect(Number(dist.neighborDiscount)).toBe(10);
      expect(Number(dist.nonprofitShare)).toBeCloseTo(5, 2);
      expect(Number(dist.neighborPays)).toBe(90);
      expect(Number(dist.merchantNet)).toBeCloseTo(84.50, 2);
    });

    it('should calculate correctly for a $45 grocery item with $25 COGS', () => {
      const dist = calculateDistribution(45, 25, false, false, 'PRICE_REDUCTION', 0);

      // Discount = $4.50  →  effectiveRevenue = $40.50
      // Net profit = $40.50 - $25 = $15.50
      // Nonprofit = $15.50 * 0.10 = $1.55
      expect(Number(dist.profit)).toBeCloseTo(15.5, 2);
      expect(Number(dist.nonprofitShare)).toBeCloseTo(1.55, 2);
      expect(Number(dist.neighborPays)).toBeCloseTo(40.50, 2);
    });

    it('should produce zero net profit at the COGS = discounted-price boundary', () => {
      // The split is ALWAYS computed on the discounted base (price × 0.9), regardless of
      // waive/mode, so the zero-profit boundary is COGS == price × 0.9.
      const dist = calculateDistribution(50, 45, false, false, 'PRICE_REDUCTION', 0);

      // effectiveRevenue = $45, netProfit = $45 - $45 = $0
      // Merchant net = $45 COGS + $0 profit = $45; neighbor pays $45
      expect(Number(dist.profit)).toBe(0);
      expect(Number(dist.nonprofitShare)).toBe(0);
      expect(Number(dist.neighborPays)).toBe(45);
      expect(Number(dist.merchantNet)).toBe(45);
    });

    it('should handle high-margin item ($200 price, $20 COGS)', () => {
      const dist = calculateDistribution(200, 20, false, false, 'PRICE_REDUCTION', 0);

      // Discount = $20  →  effectiveRevenue = $180
      // Net profit = $180 - $20 = $160
      // Nonprofit = $160 * 0.10 = $16
      // Platform  = $160 * 0.01 = $1.60
      // Merchant net = $20 + ($160 * 0.89) = $20 + $142.40 = $162.40
      expect(Number(dist.nonprofitShare)).toBeCloseTo(16, 2);
      expect(Number(dist.neighborPays)).toBe(180);
      expect(Number(dist.merchantNet)).toBeCloseTo(162.40, 2);
    });
  });

  // ─── Internal vs Card Payment ────────────────────────────────────────

  describe('Internal vs Card Payment', () => {
    it('should charge the same platform fee (1% of net profit) regardless of payment method', () => {
      const internal = calculateDistribution(100, 40, false, true, 'PRICE_REDUCTION', 0);
      const card = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // No internal/balance processing fee exists anymore — platform fee is purely the 1% profit share.
      expect(Number(internal.platformFee)).toBeCloseTo(50 * 0.01, 2);
      expect(Number(card.platformFee)).toBeCloseTo(50 * 0.01, 2);
      expect(Number(internal.platformFee)).toBeCloseTo(Number(card.platformFee), 2);
    });
  });

  // ─── Waived Discount ─────────────────────────────────────────────────

  describe('Waived Discount', () => {
    it('should charge full price and route the 10% to the initiative when waived', () => {
      const dist = calculateDistribution(100, 40, true, false, 'PRICE_REDUCTION', 0);

      // Discount = $10; neighbor pays full price ($100); the $10 becomes the waived contribution.
      expect(Number(dist.neighborDiscount)).toBe(10);
      expect(Number(dist.neighborPays)).toBe(100);
      expect(Number(dist.waivedContribution)).toBe(10);
      expect(Number(dist.creditIssued)).toBe(0);
    });

    it('should NOT change the merchant/nonprofit/platform split when waived (conservation)', () => {
      const waived = calculateDistribution(100, 40, true, false, 'PRICE_REDUCTION', 0);
      const standard = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // The split is always on the discounted base, so the three parties are unaffected by the
      // neighbor's choice to waive. Only neighborPays and the waived contribution differ.
      expect(Number(waived.merchantNet)).toBeCloseTo(Number(standard.merchantNet), 2);
      expect(Number(waived.nonprofitShare)).toBeCloseTo(Number(standard.nonprofitShare), 2);
      expect(Number(waived.platformFee)).toBeCloseTo(Number(standard.platformFee), 2);
      // The extra the neighbor paid ($100 vs $90) is exactly the initiative contribution.
      expect(Number(waived.neighborPays) - Number(standard.neighborPays)).toBeCloseTo(
        Number(waived.waivedContribution), 2
      );
    });
  });

  // ─── Platform Credits Mode ───────────────────────────────────────────

  describe('Platform Credits Mode', () => {
    it('should charge full price and issue the 10% as credit in credit mode', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PLATFORM_CREDITS', 0);

      // In credit mode the neighbor pays full MSRP and the 10% is returned as closed-loop credit.
      expect(Number(dist.neighborPays)).toBe(100);
      expect(Number(dist.creditIssued)).toBe(10);
      expect(Number(dist.waivedContribution)).toBe(0);
    });

    it('should NOT change the merchant/nonprofit/platform split in credit mode (conservation)', () => {
      const credit = calculateDistribution(100, 40, false, false, 'PLATFORM_CREDITS', 0);
      const reduction = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // Same split as price-reduction; the neighbor's extra $10 is returned to them as credit,
      // it does not inflate the merchant's take.
      expect(Number(credit.merchantNet)).toBeCloseTo(Number(reduction.merchantNet), 2);
    });
  });

  // ─── Credit Redemption ───────────────────────────────────────────────

  describe('Credit Redemption', () => {
    it('should reduce neighbor payment by applied credits', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 5);

      // Standard neighbor pays = $90, minus $5 credits = $85
      expect(Number(dist.neighborPays)).toBe(85);
      expect(Number(dist.appliedCredits)).toBe(5);
    });

    it('should floor neighbor payment at $0 when credits exceed amount', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 200);

      // Credits ($200) exceed neighbor pays ($90), so floor at $0
      expect(Number(dist.neighborPays)).toBe(0);
    });

    it('should not affect merchant net when credits are applied', () => {
      const withCredits = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 5);
      const withoutCredits = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // Merchant net should be the same regardless of credit application
      // Credits are funded by the platform, not the merchant
      expect(Number(withCredits.merchantNet)).toBeCloseTo(Number(withoutCredits.merchantNet), 2);
    });
  });

  // ─── Combination: Credits + Waived Discount ──────────────────────────

  describe('Combination Scenarios', () => {
    it('should handle credits + waived discount together', () => {
      const dist = calculateDistribution(100, 40, true, false, 'PRICE_REDUCTION', 10);

      // Waived: neighbor pays $100. Credits: -$10. Net: $90
      expect(Number(dist.neighborPays)).toBe(90);
      expect(Number(dist.appliedCredits)).toBe(10);
    });

    it('should handle credits + internal payment', () => {
      const dist = calculateDistribution(100, 40, false, true, 'PRICE_REDUCTION', 10);

      // Standard neighbor pays = $90, minus $10 credits = $80 (no internal fee)
      expect(Number(dist.neighborPays)).toBe(80);
    });
  });

  // ─── Conservation Invariant ──────────────────────────────────────────

  describe('Conservation Invariant', () => {
    // Card payment (no internal fee) and no applied credits, so everything distributed plus
    // value returned to the neighbor must exactly equal what the neighbor pays.
    const cases = [
      { label: 'price reduction',     args: [100, 40, false, false, 'PRICE_REDUCTION', 0] as const },
      { label: 'waived → initiative', args: [100, 40, true,  false, 'PRICE_REDUCTION', 0] as const },
      { label: 'platform credits',    args: [100, 40, false, false, 'PLATFORM_CREDITS', 0] as const },
      { label: 'high margin waived',  args: [200, 20, true,  false, 'PRICE_REDUCTION', 0] as const },
      { label: 'odd amounts waived',  args: [33.33, 15.17, true, false, 'PRICE_REDUCTION', 0] as const },
    ];

    cases.forEach(({ label, args }) => {
      it(`distributed value equals what the neighbor pays (${label})`, () => {
        const dist = calculateDistribution(args[0], args[1], args[2], args[3], args[4], args[5]);
        const distributed =
          Number(dist.merchantNet) +
          Number(dist.nonprofitShare) +
          Number(dist.platformFee) +
          Number(dist.waivedContribution) +
          Number(dist.creditIssued);
        expect(distributed).toBeCloseTo(Number(dist.neighborPays), 2);
      });
    });
  });

  // ─── Rounding / Penny Leakage ────────────────────────────────────────

  describe('Rounding & Penny Leakage', () => {
    it('should not lose or create pennies on odd amounts', () => {
      const dist = calculateDistribution(33.33, 15.17, false, false, 'PRICE_REDUCTION', 0);

      const msrp = Number(dist.msrp);
      const discount = Number(dist.neighborDiscount);
      const nonprofit = Number(dist.nonprofitShare);
      const platform = Number(dist.platformFee);
      const merchantNet = Number(dist.merchantNet);

      // Verify: discount + nonprofit + platform + merchantNet should ~= msrp
      // (allowing for rounding in the profit split model)
      const totalDistributed = discount + nonprofit + platform + merchantNet;
      expect(Math.abs(totalDistributed - msrp)).toBeLessThan(0.02);
    });

    it('should handle $0.01 minimum transaction', () => {
      const dist = calculateDistribution(0.01, 0.005, false, false, 'PRICE_REDUCTION', 0);
      expect(Number(dist.neighborPays)).toBeGreaterThanOrEqual(0);
      expect(Number(dist.nonprofitShare)).toBeGreaterThanOrEqual(0);
    });

    it('should handle large transaction ($10,000)', () => {
      const dist = calculateDistribution(10000, 3000, false, false, 'PRICE_REDUCTION', 0);

      // effectiveRevenue = $9,000, netProfit = $9,000 - $3,000 = $6,000
      // Nonprofit = $6,000 * 0.10 = $600
      expect(Number(dist.nonprofitShare)).toBeCloseTo(600, 0);
      expect(Number(dist.neighborPays)).toBe(9000);
    });
  });
});

// ─── PricingService Tests ──────────────────────────────────────────────

describe('PricingService — Cart Breakdown', () => {
  const sampleCart = [
    { id: '1', name: 'Widget', price: 50, cogs: 20, quantity: 2 },
    { id: '2', name: 'Service', price: 100, cogs: 30, quantity: 1 },
  ];

  it('should calculate correct totals for multi-item cart with card payment', () => {
    const breakdown = PricingService.calculateBreakdown(sampleCart, 'CARD', false, 'PRICE_REDUCTION', 0);

    // Total MSRP = (50*2) + (100*1) = $200
    expect(Number(breakdown.subtotal)).toBe(200);
    // Total discount = $200 * 0.10 = $20
    expect(Number(breakdown.discount_total)).toBeCloseTo(20, 1);
    // Processing fee should be positive for CARD
    expect(Number(breakdown.processing_fee_total)).toBeGreaterThan(0);
    // Savings vs card should be 0 (already using card)
    expect(Number(breakdown.savings_vs_card)).toBe(0);
  });

  it('should show savings when using internal payment', () => {
    const breakdown = PricingService.calculateBreakdown(sampleCart, 'INTERNAL', false, 'PRICE_REDUCTION', 0);

    // No processing fee for internal
    expect(Number(breakdown.processing_fee_total)).toBe(0);
    // Should show savings vs card
    expect(Number(breakdown.savings_vs_card)).toBeGreaterThan(0);
  });

  it('should apply credits across cart items', () => {
    const breakdown = PricingService.calculateBreakdown(sampleCart, 'INTERNAL', false, 'PRICE_REDUCTION', 10);

    expect(Number(breakdown.applied_credits_total)).toBeGreaterThan(0);
    // Consumer total should be less than without credits
    const noCredits = PricingService.calculateBreakdown(sampleCart, 'INTERNAL', false, 'PRICE_REDUCTION', 0);
    expect(Number(breakdown.consumer_total)).toBeLessThan(Number(noCredits.consumer_total));
  });
});

// ─── Σ-Conservation (EXACT cents) ───────────────────────────────────────
// Tightens the legacy tolerance-based ('toBeCloseTo') conservation checks into
// exact integer-cent equality, and pins the canonical rates so nobody can silently
// re-introduce the old 79/10/11 model. Pure math — runs with no DB.

describe('Σ-Conservation (exact cents)', () => {
  const cents = (x: unknown) => Math.round(Number(x) * 100);
  const isWholeCents = (x: unknown) => Math.abs(Number(x) * 100 - Math.round(Number(x) * 100)) < 1e-6;
  const modes = ['PRICE_REDUCTION', 'PLATFORM_CREDITS'] as const;

  // Deterministic PRNG (mulberry32) so any fuzz failure reproduces from the same seed.
  function mulberry32(seed: number) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it('pins the canonical rates and they sum to 1 (regression guard vs 79/10/11)', () => {
    expect(GC_DISCOUNT_RATE).toBe(0.10);
    expect(NONPROFIT_RATE).toBe(0.10);
    expect(PLATFORM_RATE).toBe(0.01);
    expect(MERCHANT_PROFIT_RATE).toBe(0.89);
    expect(NONPROFIT_RATE + PLATFORM_RATE + MERCHANT_PROFIT_RATE).toBeCloseTo(1, 9);
  });

  it('every output field is a whole number of cents (all modes, waived & not)', () => {
    for (const mode of modes) {
      for (const waived of [false, true]) {
        const d = calculateDistribution(45, 25, waived, false, mode, 0);
        for (const f of [d.msrp, d.cogs, d.neighborDiscount, d.nonprofitShare, d.platformFee,
                         d.merchantNet, d.neighborPays, d.waivedContribution, d.creditIssued, d.appliedCredits]) {
          expect(isWholeCents(f)).toBe(true);
        }
      }
    }
  });

  it('parts sum EXACTLY to the neighbor pre-credit obligation (all modes)', () => {
    const samples: Array<[number, number]> = [[45, 25], [33.33, 15.17], [100, 40], [9.99, 3.33], [199.95, 87.61]];
    for (const [price, cogs] of samples) {
      for (const mode of modes) {
        for (const waived of [false, true]) {
          // 0 credits → neighborPays IS the pre-credit obligation.
          const d = calculateDistribution(price, cogs, waived, false, mode, 0);
          const distributed = cents(d.merchantNet) + cents(d.nonprofitShare) + cents(d.platformFee)
            + cents(d.waivedContribution) + cents(d.creditIssued);
          expect(distributed).toBe(cents(d.neighborPays));
        }
      }
    }
  });

  it('fuzz: no penny created or lost across 5000 deterministic inputs', () => {
    const rand = mulberry32(0x600dc1ac);
    for (let i = 0; i < 5000; i++) {
      const price = Math.round((1 + rand() * 9999) * 100) / 100;       // $1 .. $10,000
      const cogs = Math.round(rand() * price * 0.85 * 100) / 100;      // ≤ 85% of price → net profit stays positive
      const mode = modes[Math.floor(rand() * modes.length)];
      const waived = rand() < 0.5;
      const d = calculateDistribution(price, cogs, waived, false, mode, 0);

      const distributed = cents(d.merchantNet) + cents(d.nonprofitShare) + cents(d.platformFee)
        + cents(d.waivedContribution) + cents(d.creditIssued);
      expect(distributed).toBe(cents(d.neighborPays));            // exact conservation
      expect(cents(d.nonprofitShare)).toBeGreaterThanOrEqual(0);
      expect(cents(d.platformFee)).toBeGreaterThanOrEqual(0);
      expect(cents(d.merchantNet)).toBeGreaterThanOrEqual(0);
      expect(isWholeCents(d.merchantNet)).toBe(true);
      expect(isWholeCents(d.nonprofitShare)).toBe(true);
      expect(isWholeCents(d.platformFee)).toBe(true);
    }
  });

  it('the sub-cent remainder lands on the merchant (documented residual party)', () => {
    // 33.33 / 15.17 → netProfit 14.83 → nonprofit 1.483→1.48, platform 0.1483→0.15; merchant carries the rest.
    const d = calculateDistribution(33.33, 15.17, false, false, 'PRICE_REDUCTION', 0);
    expect(cents(d.nonprofitShare)).toBe(148);
    expect(cents(d.platformFee)).toBe(15);
    // merchant profit share (merchantNet − cogs) + nonprofit + platform === net profit, exactly.
    expect(cents(d.merchantNet) - cents(d.cogs) + cents(d.nonprofitShare) + cents(d.platformFee)).toBe(cents(d.profit));
  });
});

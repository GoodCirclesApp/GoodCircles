import { describe, it, expect } from 'vitest';
import { calculateDistribution } from '../services/transactionService';
import { PricingService } from '../services/pricingService';

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

    it('should produce zero net profit when discount is waived and COGS = price', () => {
      // With PRICE_REDUCTION and price=COGS, the listing API rejects the listing
      // (price × 0.9 < cogs). The zero-profit case is only reachable when the
      // discount is waived, leaving effectiveRevenue = full MSRP = COGS.
      const dist = calculateDistribution(50, 50, true, false, 'PRICE_REDUCTION', 0);

      // effectiveRevenue = $50 (no reduction), netProfit = $0
      // Merchant net = $50 COGS + $0 profit = $50
      expect(Number(dist.profit)).toBe(0);
      expect(Number(dist.nonprofitShare)).toBe(0);
      expect(Number(dist.neighborPays)).toBe(50);
      expect(Number(dist.merchantNet)).toBe(50);
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
    it('should add 0.5% internal fee for balance payments', () => {
      const dist = calculateDistribution(100, 40, false, true, 'PRICE_REDUCTION', 0);

      // Neighbor pays $90, internal fee = $90 * 0.005 = $0.45
      expect(Number(dist.internalFee)).toBeCloseTo(0.45, 2);
      // Platform fee = 1% of net profit ($50) + internal fee = $0.50 + $0.45 = $0.95
      const basePlatformFee = 50 * 0.01; // $0.50 (net profit after discount)
      expect(Number(dist.platformFee)).toBeCloseTo(basePlatformFee + 0.45, 2);
    });

    it('should have zero internal fee for card payments', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);
      expect(Number(dist.internalFee)).toBe(0);
    });
  });

  // ─── Waived Discount ─────────────────────────────────────────────────

  describe('Waived Discount', () => {
    it('should not apply discount when waived', () => {
      const dist = calculateDistribution(100, 40, true, false, 'PRICE_REDUCTION', 0);

      // Discount = $10 but neighbor still pays full price ($100)
      // The $10 goes to community initiative instead
      expect(Number(dist.neighborDiscount)).toBe(10);
      expect(Number(dist.neighborPays)).toBe(100);
    });

    it('should calculate full merchant net when discount is waived', () => {
      const waived = calculateDistribution(100, 40, true, false, 'PRICE_REDUCTION', 0);
      const standard = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // Merchant net should be higher when discount is waived
      // because the discount doesn't come out of their share
      expect(Number(waived.merchantNet)).toBeGreaterThan(Number(standard.merchantNet));
    });
  });

  // ─── Platform Credits Mode ───────────────────────────────────────────

  describe('Platform Credits Mode', () => {
    it('should charge full price in credit mode', () => {
      const dist = calculateDistribution(100, 40, false, false, 'PLATFORM_CREDITS', 0);

      // In credit mode, neighbor pays full MSRP
      // Credits are issued separately (not deducted at POS)
      expect(Number(dist.neighborPays)).toBe(100);
    });

    it('should give merchant full revenue in credit mode', () => {
      const credit = calculateDistribution(100, 40, false, false, 'PLATFORM_CREDITS', 0);
      const reduction = calculateDistribution(100, 40, false, false, 'PRICE_REDUCTION', 0);

      // Merchant should get more in credit mode
      expect(Number(credit.merchantNet)).toBeGreaterThan(Number(reduction.merchantNet));
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

      // Standard neighbor pays = $90, minus $10 credits = $80
      // Internal fee on $80 = $0.40
      expect(Number(dist.neighborPays)).toBe(80);
      expect(Number(dist.internalFee)).toBeCloseTo(0.40, 2);
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

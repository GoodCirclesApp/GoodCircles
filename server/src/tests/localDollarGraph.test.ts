import { describe, it, expect } from 'vitest';
import { calculateDistribution } from '../services/transactionService';
import { buildEdge, EdgeInput } from '../services/localDollarGraphService';

// DB-free: proves the Local Dollar Graph edge faithfully and conservatively encodes
// the settlement split (no penny created or lost), and that derived fields are correct.

function edgeFromDistribution(grossAmount: number, cogs: number, opts: Partial<EdgeInput> & { paymentMethod?: string; discountWaived?: boolean; discountMode?: 'PRICE_REDUCTION' | 'PLATFORM_CREDITS' } = {}) {
  const d = calculateDistribution(grossAmount, cogs, opts.discountWaived ?? false, opts.paymentMethod === 'INTERNAL', opts.discountMode ?? 'PRICE_REDUCTION', 0);
  const input: EdgeInput = {
    transactionId: 'tx-test',
    occurredAt: new Date('2026-09-15T12:00:00Z'),
    neighborId: 'n1',
    merchantId: 'm1',
    nonprofitId: 'np1',
    grossAmount: d.msrp,
    discountAmount: d.neighborDiscount,
    cogs: d.cogs,
    merchantNet: d.merchantNet,
    nonprofitShare: d.nonprofitShare,
    platformFee: d.platformFee,
    waivedContribution: d.waivedContribution,
    creditIssued: d.creditIssued,
    paymentMethod: opts.paymentMethod ?? 'CARD',
    discountWaived: opts.discountWaived ?? false,
    discountMode: opts.discountMode ?? 'PRICE_REDUCTION',
    ...opts,
  };
  return buildEdge(input);
}

const n = (v: unknown) => Number(v);

describe('Local Dollar Graph — edge integrity', () => {
  it('conserves money: gross == discount + merchantNet + nonprofitShare + platformFee (to the cent)', () => {
    for (const [gross, cogs] of [[100, 40], [19.99, 7.5], [5000, 4999.99], [12.34, 0], [250, 125.55]] as const) {
      const e = edgeFromDistribution(gross, cogs);
      const sum = n(e.discountAmount) + n(e.merchantNet) + n(e.nonprofitShare) + n(e.platformFee);
      expect(Math.round(sum * 100)).toBe(Math.round(n(e.grossAmount) * 100));
    }
  });

  it('derives period (YYYY-MM) and isInternal from payment method', () => {
    const card = edgeFromDistribution(100, 40, { paymentMethod: 'CARD' });
    expect(card.period).toBe('2026-09');
    expect(card.isInternal).toBe(false);
    const internal = edgeFromDistribution(100, 40, { paymentMethod: 'INTERNAL' });
    expect(internal.isInternal).toBe(true);
  });

  it('routes the discount to waivedContribution when waived, and nowhere when kept', () => {
    const waived = edgeFromDistribution(100, 40, { discountWaived: true });
    expect(n(waived.waivedContribution)).toBeGreaterThan(0);
    expect(n(waived.waivedContribution)).toBe(n(waived.discountAmount));
    expect(n(waived.creditIssued)).toBe(0);

    const kept = edgeFromDistribution(100, 40, { discountWaived: false, discountMode: 'PRICE_REDUCTION' });
    expect(n(kept.waivedContribution)).toBe(0);
    expect(n(kept.creditIssued)).toBe(0);
  });

  it('routes the discount to creditIssued in PLATFORM_CREDITS mode', () => {
    const credit = edgeFromDistribution(100, 40, { discountMode: 'PLATFORM_CREDITS' });
    expect(n(credit.creditIssued)).toBeGreaterThan(0);
    expect(n(credit.creditIssued)).toBe(n(credit.discountAmount));
  });

  it('defaults source to "settlement" and carries snapshot dimensions through', () => {
    const e = buildEdge({
      transactionId: 't', occurredAt: new Date('2026-01-02T00:00:00Z'),
      neighborId: 'n', merchantId: 'm', nonprofitId: 'np',
      merchantType: 'RETAIL', censusTractId: '28049000100', isQIA: true, regionId: 'r1',
      nonprofitName: 'Food Bank', nonprofitEin: '12-3456789',
      grossAmount: 10, discountAmount: 1, cogs: 4, merchantNet: 4.5, nonprofitShare: 0.5, platformFee: 0, waivedContribution: 0, creditIssued: 1,
      paymentMethod: 'CARD',
    });
    expect(e.source).toBe('settlement');
    expect(e.censusTractId).toBe('28049000100');
    expect(e.isQIA).toBe(true);
    expect(e.nonprofitName).toBe('Food Bank');
    expect(e.period).toBe('2026-01');
  });
});

import { describe, it, expect } from 'vitest';
import { computeFindings, ProductLite, SalesMap } from '../services/marginCopilotService';

// DB-free: the deterministic margin engine — the part that delivers value pre-launch
// with no AI key. Verifies status classification, suggested re-pricing, the net +
// donation uplift, and prioritized sorting.

const products: ProductLite[] = [
  { id: 'healthy', name: 'Healthy item', category: 'Retail', price: 10, cogs: 5 },   // 50% margin
  { id: 'loss', name: 'Below-cost item', category: 'Food', price: 10, cogs: 9.5 },   // sells below cost after discount
  { id: 'low', name: 'Thin item', category: 'Food', price: 10, cogs: 8 },            // 20% margin
];
const sales: SalesMap = { low: { units: 10, gross: 100, merchantNet: 88.9, nonprofitShare: 1 } };

describe('Margin Copilot — deterministic engine', () => {
  const findings = computeFindings(products, sales);
  const byId = Object.fromEntries(findings.map((f) => [f.productId, f]));

  it('flags a below-cost product as LOSS and a thin-margin product as LOW; leaves healthy alone', () => {
    expect(byId.loss.status).toBe('LOSS');
    expect(byId.low.status).toBe('LOW');
    expect(byId.healthy.status).toBe('HEALTHY');
  });

  it('suggests a higher price for flagged products and none for healthy', () => {
    expect(byId.low.suggestedPrice).not.toBeNull();
    expect(byId.low.suggestedPrice!).toBeGreaterThan(byId.low.price);
    expect(byId.healthy.suggestedPrice).toBeNull();
  });

  it('projects a positive net-profit AND donation uplift from re-pricing', () => {
    expect(byId.low.perSaleNetUplift).toBeGreaterThan(0);
    expect(byId.low.perSaleDonationUplift).toBeGreaterThan(0); // raising margin raises the nonprofit's 10% too
  });

  it('scales the per-period uplift by units sold', () => {
    expect(byId.low.periodNetUplift).toBeCloseTo(byId.low.perSaleNetUplift * 10, 2);
  });

  it('prioritizes LOSS, then LOW, then HEALTHY', () => {
    const order = findings.map((f) => f.status);
    expect(order.indexOf('LOSS')).toBeLessThan(order.indexOf('LOW'));
    expect(order.indexOf('LOW')).toBeLessThan(order.indexOf('HEALTHY'));
  });
});

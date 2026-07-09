import { describe, it, expect } from 'vitest';
import { getTaxCalculator, NoopTaxCalculator, type TaxQuoteRequest } from '../services/tax/taxCalculator';

const req: TaxQuoteRequest = {
  destination: { state: 'MS', postalCode: '39301', country: 'US' },
  lineItems: [
    { reference: 'tx_1', amountCents: 10000 },
    { reference: 'tx_2', amountCents: 2500 },
  ],
};

describe('tax scaffolding — default NoopTaxCalculator', () => {
  it('defaults to the no-op provider when TAX_PROVIDER is unset', () => {
    const calc = getTaxCalculator();
    expect(calc.name).toBe('none');
  });

  it('computes zero tax but reports the jurisdiction', async () => {
    const q = await new NoopTaxCalculator().quote(req);
    expect(q.provider).toBe('none');
    expect(q.computed).toBe(false);
    expect(q.totalTaxCents).toBe(0);
    expect(q.jurisdiction).toBe('US-MS');
    expect(q.lines).toHaveLength(2);
    expect(q.lines.every((l) => l.taxCents === 0 && l.rate === 0)).toBe(true);
    // Taxable base is preserved per line for downstream persistence.
    expect(q.lines[0].taxableCents).toBe(10000);
  });

  it('returns null jurisdiction when no state is provided', async () => {
    const q = await new NoopTaxCalculator().quote({ destination: {}, lineItems: [] });
    expect(q.jurisdiction).toBeNull();
    expect(q.totalTaxCents).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  GC_DISCOUNT_RATE,
  NONPROFIT_RATE,
  PLATFORM_RATE,
  MERCHANT_PROFIT_RATE,
} from '../lib/splitRates';

// Claim-consistency gate (compliance audit — Phase 5 CI). The single source of
// truth for the money split (splitRates.ts) must agree with the numbers published
// on the marketing site. If a rate changes, the published copy must change with it
// (and vice versa) — this test fails when they drift.

// vitest runs from the repo root, so resolve the marketing site from cwd.
const REPO_ROOT = process.cwd();
function readSite(rel: string): string {
  return readFileSync(path.join(REPO_ROOT, 'marketing', 'src', 'pages', rel), 'utf8');
}

describe('claim consistency — computed splits', () => {
  it('the profit split constants conserve to 100%', () => {
    expect(NONPROFIT_RATE + PLATFORM_RATE + MERCHANT_PROFIT_RATE).toBeCloseTo(1, 9);
  });

  it('matches the canonical 10/10/1 model with a 10% consumer discount', () => {
    expect(GC_DISCOUNT_RATE).toBe(0.10);
    expect(NONPROFIT_RATE).toBe(0.10);
    expect(PLATFORM_RATE).toBe(0.01);
    expect(MERCHANT_PROFIT_RATE).toBe(0.89);
  });
});

describe('claim consistency — published copy matches the constants', () => {
  const merchantPct = `${Math.round(MERCHANT_PROFIT_RATE * 100)}%`; // 89%
  const platformPct = `${Math.round(PLATFORM_RATE * 100)}%`;        // 1%
  const nonprofitPct = `${Math.round(NONPROFIT_RATE * 100)}%`;      // 10%

  for (const page of ['sell/index.astro', 'sell/marketplace-fees-comparison.astro']) {
    it(`${page} states the merchant keeps ${merchantPct} of profit`, () => {
      expect(readSite(page)).toContain(merchantPct);
    });
    it(`${page} states the ${platformPct} platform fee`, () => {
      expect(readSite(page)).toContain(platformPct);
    });
  }

  it('the /sell page references the 10% nonprofit/discount figure', () => {
    expect(readSite('sell/index.astro')).toContain(nonprofitPct);
  });

  it('the /sell page avoids the locked-forbidden fee wording', () => {
    const src = readSite('sell/index.astro').toLowerCase();
    for (const forbidden of ['no commission', 'free to sell', 'raise your price']) {
      expect(src).not.toContain(forbidden);
    }
  });
});

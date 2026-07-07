// Affiliate system tests (2026-07-06 fixes).
//
// Two tiers:
//  1. DB-free: the AFFILIATE_MARKETPLACE_ENABLED kill switch (controller-level,
//     stubbed req/res) — always runs.
//  2. DB-backed lifecycle tests (guest click with null userId; PENDING
//     conversion; confirm → CONFIRMED + CDFI allocation exactly once; VOID
//     excluded from stats). Per repo policy the DB is NOT mocked — these run
//     only when DATABASE_URL points at a LOCAL dev database (e.g. the PGlite
//     wire-protocol rig) and are skipped otherwise, so `npm test` stays green
//     on machines without a dev DB and can never touch production.
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock ONLY the CDFI side-effect boundary (external money-movement service —
// not the DB) so we can count allocation calls.
vi.mock('../services/cdfiPackagingService', () => ({
  CdfiPackagingService: { allocateFirstLossContribution: vi.fn().mockResolvedValue(undefined) },
}));

import { getListings } from '../controllers/affiliateController';

const mockRes = () => {
  const res: any = { statusCode: 200, body: undefined };
  res.status = (c: number) => { res.statusCode = c; return res; };
  res.json = (b: any) => { res.body = b; return res; };
  return res;
};

describe('Affiliate kill switch (AFFILIATE_MARKETPLACE_ENABLED)', () => {
  it('GET /listings returns [] when the flag is unset/false, regardless of DB', async () => {
    const prev = process.env.AFFILIATE_MARKETPLACE_ENABLED;
    delete process.env.AFFILIATE_MARKETPLACE_ENABLED;
    const res = mockRes();
    await getListings({ query: {} } as any, res as any);
    expect(res.body).toEqual([]);
    process.env.AFFILIATE_MARKETPLACE_ENABLED = 'false';
    const res2 = mockRes();
    await getListings({ query: {} } as any, res2 as any);
    expect(res2.body).toEqual([]);
    if (prev === undefined) delete process.env.AFFILIATE_MARKETPLACE_ENABLED;
    else process.env.AFFILIATE_MARKETPLACE_ENABLED = prev;
  });
});

// ── DB-backed lifecycle tests (local dev DB only) ────────────────────────────

const dbUrl = process.env.DATABASE_URL ?? '';
const isLocalDb = /127\.0\.0\.1|localhost/.test(dbUrl);

describe.skipIf(!isLocalDb)('Affiliate lifecycle (dev DB)', () => {
  let prisma: any;
  let AffiliateService: any;
  let CdfiPackagingService: any;
  let listingId: string;

  beforeAll(async () => {
    ({ prisma } = await import('../lib/prisma'));
    ({ AffiliateService } = await import('../services/affiliateService'));
    ({ CdfiPackagingService } = await import('../services/cdfiPackagingService'));

    const program = await prisma.affiliateProgram.create({
      data: { name: `Test Program ${Date.now()}`, platform: 'CUSTOM', trackingId: `test-${Date.now()}`, baseCommRate: 0.05, isActive: true },
    });
    const listing = await prisma.affiliateListing.create({
      data: {
        programId: program.id, title: 'Test Product', price: 100,
        affiliateUrl: 'https://example.com/p?tag=test', category: 'Test', commRate: 0.1,
        isActive: true, createdBy: 'test',
      },
    });
    listingId = listing.id;
  });

  afterAll(async () => { await prisma.$disconnect(); });

  it('records a guest click with null userId/userRole', async () => {
    const { clickId, affiliateUrl } = await AffiliateService.recordClick(listingId, undefined, undefined);
    expect(affiliateUrl).toContain('example.com');
    const click = await prisma.affiliateClick.findUnique({ where: { id: clickId } });
    expect(click.userId).toBeNull();
    expect(click.userRole).toBeNull();
  });

  it('creates conversions as PENDING with no confirmedAt and NO CDFI allocation', async () => {
    const conv = await AffiliateService.recordConversion({ listingId, saleAmount: 100 });
    expect(conv.status).toBe('PENDING');
    expect(conv.confirmedAt).toBeNull();
    expect(Number(conv.commTotal)).toBeCloseTo(10);   // 10% of $100
    expect(Number(conv.dafShare)).toBeCloseTo(5);     // 50%
    expect(Number(conv.cdfiShare)).toBeCloseTo(0.5);  // 5%
    expect(Number(conv.platformShare)).toBeCloseTo(4.5); // 45%
    expect(CdfiPackagingService.allocateFirstLossContribution).not.toHaveBeenCalled();
  });

  it('confirm flips PENDING → CONFIRMED and triggers the CDFI allocation exactly once', async () => {
    const conv = await AffiliateService.recordConversion({ listingId, saleAmount: 200 });
    const confirmed = await AffiliateService.confirmConversion(conv.id);
    expect(confirmed.status).toBe('CONFIRMED');
    expect(confirmed.confirmedAt).not.toBeNull();
    expect(CdfiPackagingService.allocateFirstLossContribution).toHaveBeenCalledTimes(1);
    expect(CdfiPackagingService.allocateFirstLossContribution).toHaveBeenCalledWith(conv.id, Number(confirmed.cdfiShare));
    // second confirm must fail and must NOT re-allocate
    await expect(AffiliateService.confirmConversion(conv.id)).rejects.toThrow(/not PENDING/);
    expect(CdfiPackagingService.allocateFirstLossContribution).toHaveBeenCalledTimes(1);
  });

  it('VOID conversions are excluded from all stats', async () => {
    const conv = await AffiliateService.recordConversion({ listingId, saleAmount: 400 });
    const before = await AffiliateService.getStats();
    const voided = await AffiliateService.voidConversion(conv.id);
    expect(voided.status).toBe('VOID');
    const after = await AffiliateService.getStats();
    // voiding removed it from pending sums; it appears in no confirmed figure
    expect(after.pendingCommissions).toBeCloseTo(before.pendingCommissions - Number(conv.commTotal));
    expect(after.voidCount).toBe(before.voidCount + 1);
    expect(after.totalCommissions).toBeCloseTo(before.totalCommissions);
    // a voided conversion cannot be confirmed
    await expect(AffiliateService.confirmConversion(conv.id)).rejects.toThrow(/not PENDING/);
  });
});

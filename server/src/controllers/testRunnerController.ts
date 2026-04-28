/**
 * Server-Side Integrity Test Runner
 *
 * Finds real users from the DB for each role, mints JWT tokens directly
 * (no password / no rate-limiter), then exercises every major API workflow
 * via self-HTTP calls.  Every failure captures the exact HTTP status, the
 * full JSON error body, and which workflow step broke — giving developers
 * and AI tools enough context to diagnose and fix issues immediately.
 */

import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateTokens } from '../utils/tokenUtils';

// ── Self-HTTP base URL ────────────────────────────────────────────────────────
// The server calls its own endpoints so that auth middleware, rate limiting,
// and all other middleware are exercised exactly as a real client would hit them.
const SELF = `http://127.0.0.1:${process.env.PORT || 3000}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StepResult {
  step: string;
  method: string;
  path: string;
  expectedStatus: number;
  actualStatus: number;
  durationMs: number;
  passed: boolean;
  errorMessage?: string;
  responseSnippet?: string; // first 500 chars of response body on failure
}

export interface WorkflowResult {
  id: string;
  suite: string;
  name: string;
  role: string;
  userEmail: string;
  passed: boolean;
  steps: StepResult[];
  failedStep?: string;
  errorSummary?: string;
  totalDurationMs: number;
}

export interface TestRunReport {
  ranAt: string;
  durationMs: number;
  totalWorkflows: number;
  passed: number;
  failed: number;
  rolesCovered: string[];
  workflows: WorkflowResult[];
  setupErrors: string[];
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function hit(
  token: string,
  method: string,
  path: string,
  body?: object,
  expectedStatus = 200,
): Promise<StepResult> {
  const t0 = Date.now();
  let actualStatus = 0;
  let errorMessage: string | undefined;
  let responseSnippet: string | undefined;

  try {
    const res = await fetch(`${SELF}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(15_000),
      body: body ? JSON.stringify(body) : undefined,
    });
    actualStatus = res.status;

    if (res.status !== expectedStatus) {
      const text = await res.text().catch(() => '');
      responseSnippet = text.slice(0, 500);
      // Try to extract a clean message from JSON error bodies
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed.error || parsed.message || parsed.detail || text.slice(0, 200);
      } catch {
        errorMessage = text.slice(0, 200) || `HTTP ${res.status}`;
      }
    }
  } catch (err: any) {
    errorMessage = `Network/timeout error: ${err.message}`;
  }

  return {
    step: `${method} ${path}`,
    method,
    path,
    expectedStatus,
    actualStatus,
    durationMs: Date.now() - t0,
    passed: actualStatus === expectedStatus && !errorMessage,
    errorMessage,
    responseSnippet,
  };
}

// ── Workflow runner ───────────────────────────────────────────────────────────

async function workflow(
  id: string,
  suite: string,
  name: string,
  user: { id: string; email: string; role: string },
  steps: (token: string) => Promise<StepResult[]>,
): Promise<WorkflowResult> {
  const { accessToken: token } = generateTokens(user);
  const t0 = Date.now();
  let stepResults: StepResult[] = [];

  try {
    stepResults = await steps(token);
  } catch (err: any) {
    stepResults.push({
      step: 'runner-exception',
      method: '', path: '', expectedStatus: 0, actualStatus: 0, durationMs: 0,
      passed: false,
      errorMessage: `Unhandled exception in test runner: ${err.message}`,
    });
  }

  const firstFail = stepResults.find(s => !s.passed);
  return {
    id,
    suite,
    name,
    role: user.role,
    userEmail: user.email,
    passed: !firstFail,
    steps: stepResults,
    failedStep: firstFail ? firstFail.step : undefined,
    errorSummary: firstFail ? firstFail.errorMessage : undefined,
    totalDurationMs: Date.now() - t0,
  };
}

// ── Main controller ───────────────────────────────────────────────────────────

// Resolve a real DB user for a role with a cascade of fallbacks, then
// fall through to a synthetic actor so the suite always runs.
async function resolveActor(
  role: string,
  finders: Array<() => Promise<{ id: string; email: string; role: string } | null>>,
  setupErrors: string[],
): Promise<{ id: string; email: string; role: string }> {
  for (const find of finders) {
    const u = await find().catch(() => null);
    if (u) return u;
  }
  // No real user found — mint a synthetic actor so the suite still runs.
  // The JWT will be valid; endpoints that look up the user by ID in the DB
  // will return 404/500, which is itself a meaningful test result.
  setupErrors.push(
    `No ${role} user found in DB — running suite with synthetic actor (endpoint errors are real failures)`,
  );
  return { id: `synthetic-${role.toLowerCase()}-test`, email: `synthetic-${role.toLowerCase()}@test.internal`, role };
}

export const runSystemTests = async (req: Request, res: Response) => {
  const startAll = Date.now();
  const setupErrors: string[] = [];

  // ── Resolve one actor per role (real DB user preferred; synthetic fallback) ─
  const [neighbor, merchantActor, nonprofitActor, platform] = await Promise.all([
    resolveActor('NEIGHBOR', [
      () => prisma.user.findFirst({ where: { role: 'NEIGHBOR', isActive: true }, select: { id: true, email: true, role: true } }),
      () => prisma.user.findFirst({ where: { role: 'NEIGHBOR' }, select: { id: true, email: true, role: true } }),
    ], setupErrors),

    resolveActor('MERCHANT', [
      () => prisma.merchant.findFirst({ where: { isVerified: true }, include: { user: { select: { id: true, email: true, role: true } } } })
            .then(m => m?.user ?? null),
      () => prisma.merchant.findFirst({ include: { user: { select: { id: true, email: true, role: true } } } })
            .then(m => m?.user ?? null),
      () => prisma.user.findFirst({ where: { role: 'MERCHANT' }, select: { id: true, email: true, role: true } }),
    ], setupErrors),

    resolveActor('NONPROFIT', [
      () => prisma.nonprofit.findFirst({ where: { isVerified: true }, include: { user: { select: { id: true, email: true, role: true } } } })
            .then(n => n?.user ?? null),
      () => prisma.nonprofit.findFirst({ include: { user: { select: { id: true, email: true, role: true } } } })
            .then(n => n?.user ?? null),
      () => prisma.user.findFirst({ where: { role: 'NONPROFIT' }, select: { id: true, email: true, role: true } }),
    ], setupErrors),

    resolveActor('PLATFORM', [
      () => prisma.user.findFirst({ where: { role: 'PLATFORM', isActive: true }, select: { id: true, email: true, role: true } }),
      () => prisma.user.findFirst({ where: { role: 'PLATFORM' }, select: { id: true, email: true, role: true } }),
    ], setupErrors),
  ]);

  const results: WorkflowResult[] = [];

  // ══════════════════════════════════════════════════════════════════════════
  // PUBLIC SUITE — no authentication required
  // ══════════════════════════════════════════════════════════════════════════

  // Use a throw-away token (non-existent user) just so the helper compiles;
  // PUBLIC tests override with no-auth requests via the pub() helper below.
  async function pub(method: string, path: string, expectedStatus = 200): Promise<StepResult> {
    const t0 = Date.now();
    let actualStatus = 0;
    let errorMessage: string | undefined;
    let responseSnippet: string | undefined;
    try {
      const res = await fetch(`${SELF}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(15_000),
      });
      actualStatus = res.status;
      if (res.status !== expectedStatus) {
        const text = await res.text().catch(() => '');
        responseSnippet = text.slice(0, 500);
        try { const p = JSON.parse(text); errorMessage = p.error || p.message || text.slice(0, 200); }
        catch { errorMessage = text.slice(0, 200) || `HTTP ${res.status}`; }
      }
    } catch (err: any) {
      errorMessage = `Network/timeout: ${err.message}`;
    }
    return {
      step: `${method} ${path}`,
      method, path, expectedStatus, actualStatus,
      durationMs: Date.now() - t0,
      passed: actualStatus === expectedStatus && !errorMessage,
      errorMessage, responseSnippet,
    };
  }

  results.push({
    id: 'pub-marketplace-search', suite: 'Public', name: 'Marketplace search (unauthenticated)',
    role: 'PUBLIC', userEmail: 'anonymous', passed: false,
    steps: [], failedStep: undefined, errorSummary: undefined, totalDurationMs: 0,
  });
  const pubSearchStep = await pub('GET', '/api/marketplace/search');
  results[results.length - 1].steps = [pubSearchStep];
  results[results.length - 1].passed = pubSearchStep.passed;
  results[results.length - 1].errorSummary = pubSearchStep.errorMessage;
  results[results.length - 1].totalDurationMs = pubSearchStep.durationMs;

  results.push({
    id: 'pub-affiliate-listings', suite: 'Public', name: 'Affiliate listings (unauthenticated)',
    role: 'PUBLIC', userEmail: 'anonymous', passed: false,
    steps: [], failedStep: undefined, errorSummary: undefined, totalDurationMs: 0,
  });
  const pubAffStep = await pub('GET', '/api/affiliate/listings');
  results[results.length - 1].steps = [pubAffStep];
  results[results.length - 1].passed = pubAffStep.passed;
  results[results.length - 1].errorSummary = pubAffStep.errorMessage;
  results[results.length - 1].totalDurationMs = pubAffStep.durationMs;

  results.push({
    id: 'pub-search-query', suite: 'Public', name: 'Unified search endpoint',
    role: 'PUBLIC', userEmail: 'anonymous', passed: false,
    steps: [], failedStep: undefined, errorSummary: undefined, totalDurationMs: 0,
  });
  const pubSearchQ = await pub('GET', '/api/search?q=food');
  results[results.length - 1].steps = [pubSearchQ];
  results[results.length - 1].passed = pubSearchQ.passed;
  results[results.length - 1].errorSummary = pubSearchQ.errorMessage;
  results[results.length - 1].totalDurationMs = pubSearchQ.durationMs;

  results.push({
    id: 'pub-auth-blocked', suite: 'Public', name: 'Profile endpoint blocks unauthenticated',
    role: 'PUBLIC', userEmail: 'anonymous', passed: false,
    steps: [], failedStep: undefined, errorSummary: undefined, totalDurationMs: 0,
  });
  const pubAuthBlock = await pub('GET', '/api/auth/profile', 401);
  results[results.length - 1].steps = [pubAuthBlock];
  results[results.length - 1].passed = pubAuthBlock.passed;
  results[results.length - 1].errorSummary = pubAuthBlock.errorMessage;
  results[results.length - 1].totalDurationMs = pubAuthBlock.durationMs;

  // ══════════════════════════════════════════════════════════════════════════
  // NEIGHBOR SUITE
  // ══════════════════════════════════════════════════════════════════════════

  {
    results.push(await workflow('nb-profile', 'Neighbor', 'Load own profile', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/auth/profile'),
    ]));

    results.push(await workflow('nb-wallet', 'Neighbor', 'Wallet balance accessible', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/wallet/balance'),
    ]));

    results.push(await workflow('nb-marketplace', 'Neighbor', 'Browse marketplace', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/marketplace/search'),
      await hit(tok, 'GET', '/api/marketplace/categories'),
    ]));

    results.push(await workflow('nb-search', 'Neighbor', 'Search for products', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/search?q=food'),
    ]));

    results.push(await workflow('nb-impact', 'Neighbor', 'Impact data loads', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/neighbor/impact'),
    ]));

    results.push(await workflow('nb-elected-np', 'Neighbor', 'Elected nonprofit info', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/neighbor/nonprofit'),
    ]));

    results.push(await workflow('nb-feed', 'Neighbor', 'Activity feed loads', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/feed'),
    ]));

    results.push(await workflow('nb-leaderboard', 'Neighbor', 'Leaderboard loads', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/leaderboard'),
    ]));

    results.push(await workflow('nb-initiatives', 'Neighbor', 'Community initiatives list', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/neighbor/initiatives'),
    ]));

    results.push(await workflow('nb-product-journey', 'Neighbor', 'Browse → product detail journey', neighbor, async (tok) => {
      const searchStep = await hit(tok, 'GET', '/api/marketplace/search');
      if (!searchStep.passed) return [searchStep];
      const categoriesStep = await hit(tok, 'GET', '/api/marketplace/categories');
      return [searchStep, categoriesStep];
    }));

    results.push(await workflow('nb-iso-admin', 'Neighbor', 'Admin portal blocked (role isolation)', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/admin/stats', undefined, 403),
    ]));

    results.push(await workflow('nb-iso-nonprofit', 'Neighbor', 'Nonprofit portal blocked (role isolation)', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/stats', undefined, 403),
    ]));

    results.push(await workflow('nb-iso-merchant', 'Neighbor', 'Merchant portal blocked (role isolation)', neighbor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/dashboard/metrics', undefined, 403),
    ]));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCHANT SUITE
  // ══════════════════════════════════════════════════════════════════════════

  {
    results.push(await workflow('mc-profile', 'Merchant', 'Load own profile', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/auth/profile'),
    ]));

    results.push(await workflow('mc-dashboard', 'Merchant', 'Dashboard metrics load', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/dashboard/metrics'),
    ]));

    results.push(await workflow('mc-listings', 'Merchant', 'Product listings load', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/listings'),
    ]));

    results.push(await workflow('mc-transactions', 'Merchant', 'Transaction history loads', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/transactions'),
    ]));

    results.push(await workflow('mc-impact', 'Merchant', 'Impact summary loads', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/impact'),
    ]));

    results.push(await workflow('mc-bookings', 'Merchant', 'Bookings endpoint loads', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/bookings'),
    ]));

    results.push(await workflow('mc-revenue-chart', 'Merchant', 'Revenue chart data loads', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/merchant/dashboard/revenue-chart'),
    ]));

    results.push(await workflow('mc-iso-admin', 'Merchant', 'Admin portal blocked (role isolation)', merchantActor, async (tok) => [
      await hit(tok, 'GET', '/api/admin/stats', undefined, 403),
    ]));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NONPROFIT SUITE
  // ══════════════════════════════════════════════════════════════════════════

  {
    results.push(await workflow('np-profile', 'Nonprofit', 'Load own profile', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/auth/profile'),
    ]));

    results.push(await workflow('np-stats', 'Nonprofit', 'Nonprofit stats load', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/stats'),
    ]));

    results.push(await workflow('np-analytics', 'Nonprofit', 'Nonprofit analytics load', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/analytics'),
    ]));

    results.push(await workflow('np-transactions', 'Nonprofit', 'Donation transaction history', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/transactions'),
    ]));

    results.push(await workflow('np-referral-info', 'Nonprofit', 'Referral info and bonuses', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/referral-info'),
    ]));

    results.push(await workflow('np-initiatives', 'Nonprofit', 'Initiatives list loads', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/initiatives'),
    ]));

    results.push(await workflow('np-payouts', 'Nonprofit', 'Payout records load', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/nonprofit/payouts'),
    ]));

    results.push(await workflow('np-iso-admin', 'Nonprofit', 'Admin portal blocked (role isolation)', nonprofitActor, async (tok) => [
      await hit(tok, 'GET', '/api/admin/stats', undefined, 403),
    ]));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PLATFORM ADMIN SUITE
  // ══════════════════════════════════════════════════════════════════════════

  {
    results.push(await workflow('pl-profile', 'Platform Admin', 'Admin profile loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/auth/profile'),
    ]));

    results.push(await workflow('pl-stats', 'Platform Admin', 'System stats load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/stats'),
    ]));

    results.push(await workflow('pl-users', 'Platform Admin', 'User list loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/users'),
    ]));

    results.push(await workflow('pl-financials', 'Platform Admin', 'Financial overview loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/financials'),
    ]));

    results.push(await workflow('pl-health', 'Platform Admin', 'System health loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/system-health'),
    ]));

    results.push(await workflow('pl-audit-log', 'Platform Admin', 'Audit log loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/audit-log'),
    ]));

    results.push(await workflow('pl-flags', 'Platform Admin', 'Feature flags load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/flags'),
    ]));

    results.push(await workflow('pl-demo-mode', 'Platform Admin', 'Demo mode setting loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/demo-mode'),
    ]));

    results.push(await workflow('pl-cdfi', 'Platform Admin', 'CDFI applicant list loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/cdfi'),
    ]));

    results.push(await workflow('pl-sentinel', 'Platform Admin', 'Price sentinel flags load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/sentinel-flags'),
    ]));

    results.push(await workflow('pl-aff-programs', 'Platform Admin', 'Affiliate programs load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/affiliate/programs'),
    ]));

    results.push(await workflow('pl-aff-stats', 'Platform Admin', 'Affiliate stats load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/affiliate/stats'),
    ]));

    results.push(await workflow('pl-aff-listings', 'Platform Admin', 'Affiliate listings (admin view)', platform, async (tok) => [
      await hit(tok, 'GET', '/api/affiliate/listings/admin'),
    ]));

    results.push(await workflow('pl-transactions', 'Platform Admin', 'Transaction monitoring loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/transactions'),
    ]));

    results.push(await workflow('pl-users-journey', 'Platform Admin', 'User list → user detail journey', platform, async (tok) => {
      const listStep = await hit(tok, 'GET', '/api/admin/users');
      if (!listStep.passed) return [listStep];
      // Fetch the detail of the first user returned
      const detailRes = await fetch(`${SELF}/api/admin/users`, {
        headers: { Authorization: `Bearer ${tok}` },
      }).then(r => r.json()).catch(() => null);
      const firstId = Array.isArray(detailRes) ? detailRes[0]?.id : detailRes?.users?.[0]?.id;
      if (!firstId) {
        return [listStep, { step: 'GET /api/admin/users/:id', method: 'GET', path: '/api/admin/users/:id',
          expectedStatus: 200, actualStatus: 0, durationMs: 0, passed: false,
          errorMessage: 'Could not extract user ID from user list response to test detail endpoint' }];
      }
      const detailStep = await hit(tok, 'GET', `/api/admin/users/${firstId}`);
      return [listStep, detailStep];
    }));

    results.push(await workflow('pl-community-fund', 'Platform Admin', 'Community fund oversight loads', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/community-fund'),
    ]));

    results.push(await workflow('pl-nonprofits-pending', 'Platform Admin', 'Pending nonprofit verifications load', platform, async (tok) => [
      await hit(tok, 'GET', '/api/admin/nonprofits/pending'),
    ]));
  }

  // ── Compile report ────────────────────────────────────────────────────────

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const rolesCovered = [...new Set(results.map(r => r.role))];

  const report: TestRunReport = {
    ranAt: new Date().toISOString(),
    durationMs: Date.now() - startAll,
    totalWorkflows: results.length,
    passed,
    failed,
    rolesCovered,
    workflows: results,
    setupErrors,
  };

  res.json(report);
};

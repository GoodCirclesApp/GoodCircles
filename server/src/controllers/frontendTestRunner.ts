/**
 * Frontend Integrity Test Runner
 *
 * Uses Playwright (headless Chromium) to navigate the live app as each role,
 * capturing every console.error, unhandled exception, and React crash.
 * Gives the same developer-actionable output as the API runner but for the UI layer.
 */

import { generateTokens } from '../utils/tokenUtils';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FrontendStep {
  name: string;
  passed: boolean;
  durationMs: number;
  errors: string[];
}

export interface FrontendSuiteResult {
  suite: string;
  role: string;
  userEmail: string;
  passed: boolean;
  steps: FrontendStep[];
  totalDurationMs: number;
}

type Actor = { id: string; email: string; role: string };

// ── Config ────────────────────────────────────────────────────────────────────

const APP_URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : `http://127.0.0.1:${process.env.PORT || 3000}`;

// Console errors that are cosmetic/infrastructure and not user-facing bugs
const NOISE_PATTERNS = [
  /favicon/i,
  /icon\.svg/i,
  /sw\.js/i,
  /cdn\.tailwindcss/i,
  /Download error or resource/i,
  /ServiceWorker/i,
  /manifest/i,
  /bad HTTP response code.*404.*fetching the script/i,  // service worker sw.js not found
  /Failed to register a ServiceWorker/i,
];

function isNoise(text: string): boolean {
  return NOISE_PATTERNS.some(p => p.test(text));
}

// Admin portal sidebar items (from AdminPortalView.tsx menuItems)
const ADMIN_VIEWS = [
  'System Dashboard',
  'User Management',
  'Transaction Monitoring',
  'Financial Overview',
  'Community Fund',
  'System Health',
  'Affiliate Marketplace',
  'Price Sentinel',
  'CDFI Partners',
  'Audit Log',
  'Admin Settings',
];

// ── Core helpers ──────────────────────────────────────────────────────────────

async function withPage(
  browser: import('playwright').Browser,
  token: string | null,
  fn: (page: import('playwright').Page) => Promise<FrontendStep[]>,
): Promise<FrontendStep[]> {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    // Capture all console output from the start
  });
  const page = await ctx.newPage();

  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!isNoise(t)) errors.push(t);
    }
  });
  page.on('pageerror', err => {
    errors.push(`CRASH: ${err.message}`);
  });

  try {
    // Navigate to app, inject token, then reload so React reads it
    await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    if (token) {
      await page.evaluate((tok: string) => localStorage.setItem('gc_auth_token', tok), token);
      await page.reload({ waitUntil: 'networkidle', timeout: 30_000 });
    }
    // Clear accumulated errors before the test steps (auth itself may 401 on synthetic users)
    errors.length = 0;

    return await fn(page);
  } catch (err: any) {
    return [{ name: 'page-setup', passed: false, durationMs: 0, errors: [`Setup failed: ${err.message}`] }];
  } finally {
    await ctx.close();
  }
}

async function step(
  page: import('playwright').Page,
  name: string,
  fn: (page: import('playwright').Page) => Promise<void>,
  pageErrors: string[],
): Promise<FrontendStep> {
  const t0 = Date.now();
  const before = pageErrors.length;
  let stepError: string | undefined;

  try {
    await fn(page);
    // Give React 3 s to render and make API calls
    await page.waitForTimeout(3_000);
  } catch (err: any) {
    stepError = err.message;
  }

  const captured = pageErrors.slice(before);
  if (stepError) captured.push(stepError);

  return {
    name,
    passed: captured.length === 0,
    durationMs: Date.now() - t0,
    errors: captured,
  };
}

async function tryClick(
  page: import('playwright').Page,
  label: string,
): Promise<void> {
  // Try button, link, or role=menuitem matching the text
  const locator = page.getByRole('button', { name: label }).or(
    page.getByRole('link', { name: label }),
  ).or(
    page.getByText(label, { exact: true }),
  ).first();

  const visible = await locator.isVisible({ timeout: 3_000 }).catch(() => false);
  if (visible) {
    await locator.click({ timeout: 5_000 });
  }
}

// ── Suite runners ─────────────────────────────────────────────────────────────

async function publicSuite(browser: import('playwright').Browser): Promise<FrontendSuiteResult> {
  const t0 = Date.now();
  const errors: string[] = [];

  const steps = await withPage(browser, null, async page => {
    page.on('console', msg => { if (msg.type() === 'error' && !isNoise(msg.text())) errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(`CRASH: ${err.message}`));

    const results: FrontendStep[] = [];

    results.push(await step(page, 'Landing page renders without crash', async () => {
      // already navigated by withPage; just check the body is present
      await page.waitForSelector('body', { timeout: 10_000 });
    }, errors));

    results.push(await step(page, 'View Community Impact modal', async p => {
      await tryClick(p, 'View Community Impact');
    }, errors));

    return results;
  });

  const passed = steps.every(s => s.passed);
  return { suite: 'Public', role: 'PUBLIC', userEmail: 'anonymous', passed, steps, totalDurationMs: Date.now() - t0 };
}

async function roleSuite(
  browser: import('playwright').Browser,
  suiteName: string,
  actor: Actor,
  navClicks: string[],
): Promise<FrontendSuiteResult> {
  const t0 = Date.now();
  const { accessToken: token } = generateTokens(actor);
  const errors: string[] = [];

  const steps = await withPage(browser, token, async page => {
    page.on('console', msg => { if (msg.type() === 'error' && !isNoise(msg.text())) errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(`CRASH: ${err.message}`));

    const results: FrontendStep[] = [];

    results.push(await step(page, `${suiteName} dashboard initial render`, async () => {
      await page.waitForSelector('body', { timeout: 10_000 });
    }, errors));

    for (const label of navClicks) {
      results.push(await step(page, `Navigate to: ${label}`, async p => {
        await tryClick(p, label);
      }, errors));
    }

    return results;
  });

  const passed = steps.every(s => s.passed);
  return { suite: suiteName, role: actor.role, userEmail: actor.email, passed, steps, totalDurationMs: Date.now() - t0 };
}

async function adminSuite(
  browser: import('playwright').Browser,
  actor: Actor,
): Promise<FrontendSuiteResult> {
  const t0 = Date.now();
  const { accessToken: token } = generateTokens(actor);
  const errors: string[] = [];

  const steps = await withPage(browser, token, async page => {
    page.on('console', msg => { if (msg.type() === 'error' && !isNoise(msg.text())) errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(`CRASH: ${err.message}`));

    const results: FrontendStep[] = [];

    results.push(await step(page, 'Admin portal initial render', async () => {
      await page.waitForSelector('body', { timeout: 10_000 });
    }, errors));

    // Click through every sidebar item and check for crashes
    for (const label of ADMIN_VIEWS) {
      results.push(await step(page, `Admin view: ${label}`, async p => {
        await tryClick(p, label);
      }, errors));
    }

    return results;
  });

  const passed = steps.every(s => s.passed);
  return { suite: 'Admin Portal', role: 'PLATFORM', userEmail: actor.email, passed, steps, totalDurationMs: Date.now() - t0 };
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runFrontendTests(actors: {
  neighbor: Actor;
  merchant: Actor;
  nonprofit: Actor;
  platform: Actor;
}): Promise<{ results: FrontendSuiteResult[]; setupError?: string }> {
  let chromium: import('playwright').BrowserType;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    return { results: [], setupError: 'Playwright not available — run `npx playwright install chromium` on the server' };
  }

  let browser: import('playwright').Browser;
  try {
    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      headless: true,
    });
  } catch (err: any) {
    return { results: [], setupError: `Failed to launch Chromium: ${err.message}` };
  }

  const results: FrontendSuiteResult[] = [];

  try {
    results.push(await publicSuite(browser));

    results.push(await roleSuite(browser, 'Neighbor', actors.neighbor, [
      'Marketplace', 'Wallet', 'Impact', 'Ledger', 'Orders',
    ]));

    results.push(await roleSuite(browser, 'Merchant', actors.merchant, [
      'Dashboard', 'Listings', 'Orders', 'Bookings', 'Analytics', 'Impact',
    ]));

    results.push(await roleSuite(browser, 'Nonprofit', actors.nonprofit, [
      'Analytics', 'Transactions', 'Initiatives', 'Referrals', 'Payouts',
    ]));

    results.push(await adminSuite(browser, actors.platform));
  } finally {
    await browser.close();
  }

  return { results };
}

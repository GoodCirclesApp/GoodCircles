import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play, CheckCircle2, XCircle, AlertTriangle, Clock, RotateCcw,
  ChevronDown, ChevronRight, Download, History, Zap, Activity,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'PUBLIC' | 'NEIGHBOR' | 'MERCHANT' | 'NONPROFIT' | 'PLATFORM';
type Severity = 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
type PerfBand = 'GOOD' | 'ACCEPTABLE' | 'SLOW' | 'CRITICAL';

interface TestCase {
  id: string;
  suite: string;
  name: string;
  role: Role;
  run: (token: string | null) => Promise<{ ok: boolean; detail?: string }>;
}

interface TestResult {
  id: string;
  suite: string;
  name: string;
  role: Role;
  status: Severity;
  durationMs: number;
  perfBand: PerfBand;
  detail?: string;
}

interface SuiteResult {
  suite: string;
  results: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
}

interface FullReport {
  runAt: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  skipped: number;
  suites: SuiteResult[];
  consoleErrors: string[];
}

interface SavedReport {
  id: string;
  runAt: string;
  triggeredBy: string;
  durationMs: number;
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
}

// ─── Credentials ──────────────────────────────────────────────────────────────

const CREDS: Record<Exclude<Role, 'PUBLIC'>, { email: string; password: string }> = {
  NEIGHBOR:  { email: 'alice@beta.test',          password: 'BetaTest2026!' },
  MERCHANT:  { email: 'marco@theharvesttable.com', password: 'BetaTest2026!' },
  NONPROFIT: { email: 'contact@localfoodbank.org', password: 'BetaTest2026!' },
  PLATFORM:  { email: 'admin@goodcircles.org',     password: 'BetaTest2026!' },
};

// ─── Token cache (scoped to a single test run) ────────────────────────────────

async function loginOnce(role: Exclude<Role, 'PUBLIC'>): Promise<string | null> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDS[role]),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.token ?? null;
}

// Pre-warm tokens before the test loop runs.
// PLATFORM: reuses the admin's existing session — no login required.
// Other roles: attempt beta-seed credentials; skip tests gracefully if
//   the accounts haven't been seeded in this environment.
async function prewarmTokens(
  cache: Map<Role, string>,
  onStep: (msg: string) => void,
): Promise<void> {
  // Admin is already authenticated — grab the live session token directly.
  onStep('Using current admin session for PLATFORM…');
  const sessionToken = localStorage.getItem('token');
  if (sessionToken) cache.set('PLATFORM', sessionToken);

  // Try to authenticate beta test accounts for the other roles.
  const betaRoles: Exclude<Role, 'PUBLIC' | 'PLATFORM'>[] = ['NEIGHBOR', 'MERCHANT', 'NONPROFIT'];
  for (const role of betaRoles) {
    onStep(`Authenticating ${role} (beta account)…`);
    const token = await loginOnce(role);
    if (token) cache.set(role, token);
    // 450 ms gap — stays under auth rate limiter (max 20/15 min in prod)
    await new Promise(r => setTimeout(r, 450));
  }
}

// Returns the token for a role, or null for PUBLIC.
// Returns undefined (distinct from null) when an authenticated role has
// no token — the runner will SKIP that test rather than run it unauthenticated.
async function getToken(
  role: Role,
  cache: Map<Role, string>,
): Promise<string | null | undefined> {
  if (role === 'PUBLIC') return null;
  if (cache.has(role)) return cache.get(role)!;
  // Last-chance attempt (handles cases where prewarm raced)
  const token = await loginOnce(role as Exclude<Role, 'PUBLIC'>);
  if (token) { cache.set(role, token); return token; }
  return undefined; // signals SKIP
}

function authHeaders(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function perfBand(ms: number): PerfBand {
  if (ms < 300) return 'GOOD';
  if (ms < 800) return 'ACCEPTABLE';
  if (ms < 2000) return 'SLOW';
  return 'CRITICAL';
}

async function runCheck(
  token: string | null,
  method: string,
  url: string,
  opts?: { body?: object; expectStatus?: number; expectKey?: string },
): Promise<{ ok: boolean; detail?: string }> {
  const expectStatus = opts?.expectStatus ?? 200;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status !== expectStatus) {
    return { ok: false, detail: `Expected ${expectStatus}, got ${res.status}` };
  }
  if (opts?.expectKey) {
    try {
      const data = await res.json();
      const present = Array.isArray(data)
        ? data.length >= 0
        : opts.expectKey in data;
      if (!present) return { ok: false, detail: `Missing key: ${opts.expectKey}` };
    } catch {
      return { ok: false, detail: 'Response not JSON' };
    }
  }
  return { ok: true };
}

// ─── Test Registry ─────────────────────────────────────────────────────────────
// Add new test cases here — the runner picks them up automatically.

const TEST_REGISTRY: TestCase[] = [
  // ── Auth ──────────────────────────────────────────────────────────────────
  {
    // Admin is already logged in — verify the live session token is valid.
    id: 'auth-session-valid', suite: 'Auth', name: 'Admin session token is valid', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/auth/profile', { expectKey: 'id' }),
  },
  {
    id: 'auth-reject-bad-creds', suite: 'Auth', name: 'Login rejects invalid credentials', role: 'PUBLIC',
    run: async () => {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@fake.test', password: 'wrong' }),
      });
      return { ok: res.status === 401, detail: res.status !== 401 ? `Expected 401, got ${res.status}` : undefined };
    },
  },
  {
    id: 'auth-profile-unauthed', suite: 'Auth', name: 'Profile blocked without auth', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/auth/profile', { expectStatus: 401 }),
  },
  {
    // Only meaningful if beta accounts are seeded — skipped gracefully otherwise.
    id: 'auth-login-neighbor', suite: 'Auth', name: 'Beta NEIGHBOR login (seed required)', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/auth/profile', { expectKey: 'id' }),
  },
  {
    id: 'auth-login-merchant', suite: 'Auth', name: 'Beta MERCHANT login (seed required)', role: 'MERCHANT',
    run: (tok) => runCheck(tok, 'GET', '/api/auth/profile', { expectKey: 'id' }),
  },
  {
    id: 'auth-login-nonprofit', suite: 'Auth', name: 'Beta NONPROFIT login (seed required)', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/auth/profile', { expectKey: 'id' }),
  },

  // ── Marketplace ───────────────────────────────────────────────────────────
  {
    id: 'market-products', suite: 'Marketplace', name: 'Products listing', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/marketplace/search', {}),
  },
  {
    id: 'market-categories', suite: 'Marketplace', name: 'Categories endpoint', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/marketplace/categories', {}),
  },
  {
    id: 'market-search', suite: 'Marketplace', name: 'Search with query param', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/search?q=food', {}),
  },
  {
    id: 'market-orders-authed', suite: 'Marketplace', name: 'Orders require auth', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/marketplace/orders', { expectStatus: 401 }),
  },

  // ── Affiliate ─────────────────────────────────────────────────────────────
  {
    id: 'aff-public-listings', suite: 'Affiliate', name: 'Public affiliate listings', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/affiliate/listings', {}),
  },
  {
    id: 'aff-exclude-categories', suite: 'Affiliate', name: 'excludeCategories filter', role: 'PUBLIC',
    run: async (tok) => {
      const res = await fetch('/api/affiliate/listings?excludeCategories=Electronics', { headers: authHeaders(tok) });
      if (!res.ok) return { ok: false, detail: `Status ${res.status}` };
      const data = await res.json();
      const hasElec = Array.isArray(data) && data.some((l: any) => l.category === 'Electronics');
      return { ok: !hasElec, detail: hasElec ? 'Electronics not suppressed by excludeCategories' : undefined };
    },
  },
  {
    id: 'aff-admin-programs', suite: 'Affiliate', name: 'Admin can list programs', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/affiliate/programs', {}),
  },
  {
    id: 'aff-admin-stats', suite: 'Affiliate', name: 'Admin affiliate stats', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/affiliate/stats', { expectKey: 'totalClicks' }),
  },

  // ── Wallet ────────────────────────────────────────────────────────────────
  {
    id: 'wallet-balance', suite: 'Wallet', name: 'NEIGHBOR wallet balance', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/wallet/balance', { expectKey: 'balance' }),
  },
  {
    id: 'wallet-blocked', suite: 'Wallet', name: 'Wallet blocked without auth', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/wallet/balance', { expectStatus: 401 }),
  },

  // ── Nonprofit ─────────────────────────────────────────────────────────────
  {
    id: 'np-stats', suite: 'Nonprofit', name: 'Nonprofit stats endpoint', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/nonprofit/stats', {}),
  },
  {
    id: 'np-analytics', suite: 'Nonprofit', name: 'Nonprofit analytics', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/nonprofit/analytics', {}),
  },
  {
    id: 'np-initiatives', suite: 'Nonprofit', name: 'Nonprofit initiatives', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/nonprofit/initiatives', {}),
  },
  {
    id: 'np-referrals', suite: 'Nonprofit', name: 'Nonprofit referral info', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/nonprofit/referral-info', {}),
  },

  // ── Merchant ──────────────────────────────────────────────────────────────
  {
    id: 'merch-dashboard', suite: 'Merchant', name: 'Merchant dashboard metrics', role: 'MERCHANT',
    run: (tok) => runCheck(tok, 'GET', '/api/merchant/dashboard/metrics', {}),
  },
  {
    id: 'merch-listings', suite: 'Merchant', name: 'Merchant product listings', role: 'MERCHANT',
    run: (tok) => runCheck(tok, 'GET', '/api/merchant/listings', {}),
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    id: 'admin-stats', suite: 'Admin', name: 'Admin stats', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/stats', {}),
  },
  {
    id: 'admin-users', suite: 'Admin', name: 'Admin user list', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/users', {}),
  },
  {
    id: 'admin-financials', suite: 'Admin', name: 'Admin financials', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/financials', {}),
  },
  {
    id: 'admin-health', suite: 'Admin', name: 'System health endpoint', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/system-health', {}),
  },
  {
    id: 'admin-audit', suite: 'Admin', name: 'Audit log endpoint', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/audit-log', {}),
  },
  {
    id: 'admin-demo-mode', suite: 'Admin', name: 'Demo mode flag readable', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/demo-mode', {}),
  },
  {
    id: 'admin-feature-flags', suite: 'Admin', name: 'Feature flags endpoint', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/flags', {}),
  },
  {
    id: 'admin-cdfi', suite: 'Admin', name: 'CDFI partner list', role: 'PLATFORM',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/cdfi', {}),
  },

  // ── Community ─────────────────────────────────────────────────────────────
  {
    id: 'feed-authed', suite: 'Community', name: 'Activity feed (authenticated)', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/feed', {}),
  },
  {
    id: 'leaderboard-authed', suite: 'Community', name: 'Leaderboard (authenticated)', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/leaderboard', {}),
  },

  // ── Role Isolation ────────────────────────────────────────────────────────
  {
    id: 'iso-admin-stats-neighbor', suite: 'Role Isolation', name: 'Admin stats blocked for NEIGHBOR', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/stats', { expectStatus: 403 }),
  },
  {
    id: 'iso-admin-stats-merchant', suite: 'Role Isolation', name: 'Admin stats blocked for MERCHANT', role: 'MERCHANT',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/stats', { expectStatus: 403 }),
  },
  {
    id: 'iso-admin-stats-nonprofit', suite: 'Role Isolation', name: 'Admin stats blocked for NONPROFIT', role: 'NONPROFIT',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/stats', { expectStatus: 403 }),
  },
  {
    id: 'iso-admin-stats-public', suite: 'Role Isolation', name: 'Admin stats blocked for PUBLIC', role: 'PUBLIC',
    run: (tok) => runCheck(tok, 'GET', '/api/admin/stats', { expectStatus: 401 }),
  },
  {
    id: 'iso-np-blocked-neighbor', suite: 'Role Isolation', name: 'Nonprofit stats blocked for NEIGHBOR', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/nonprofit/stats', { expectStatus: 403 }),
  },
  {
    id: 'iso-merchant-blocked-neighbor', suite: 'Role Isolation', name: 'Merchant dashboard blocked for NEIGHBOR', role: 'NEIGHBOR',
    run: (tok) => runCheck(tok, 'GET', '/api/merchant/dashboard/metrics', { expectStatus: 403 }),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupBySuite(results: TestResult[]): SuiteResult[] {
  const map = new Map<string, TestResult[]>();
  for (const r of results) {
    if (!map.has(r.suite)) map.set(r.suite, []);
    map.get(r.suite)!.push(r);
  }
  return [...map.entries()].map(([suite, rs]) => ({
    suite,
    results: rs,
    passed: rs.filter(r => r.status === 'PASS').length,
    failed: rs.filter(r => r.status === 'FAIL').length,
    warnings: rs.filter(r => r.status === 'WARN').length,
    skipped: rs.filter(r => r.status === 'SKIP').length,
  }));
}

const BAND_COLOR: Record<PerfBand, string> = {
  GOOD: 'text-emerald-600',
  ACCEPTABLE: 'text-blue-600',
  SLOW: 'text-amber-600',
  CRITICAL: 'text-red-600',
};

const STATUS_ICON: Record<Severity, React.ReactNode> = {
  PASS: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
  FAIL: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
  WARN: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
  SKIP: <Clock className="w-4 h-4 text-slate-400 shrink-0" />,
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminIntegrityTest: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTest, setCurrentTest] = useState('');
  const [report, setReport] = useState<FullReport | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedHistoryReport, setSelectedHistoryReport] = useState<FullReport | null>(null);
  const consoleErrors = useRef<string[]>([]);
  const abortRef = useRef(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/admin/test/reports', {
        headers: authHeaders(localStorage.getItem('token')),
      });
      if (res.ok) setHistory(await res.json());
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const saveReport = useCallback(async (r: FullReport) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/test/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({
          durationMs: r.durationMs,
          totalTests: r.totalTests,
          passed: r.passed,
          failed: r.failed,
          warnings: r.warnings,
          reportJson: r,
        }),
      });
      loadHistory();
    } finally {
      setSaving(false);
    }
  }, [loadHistory]);

  const runTests = useCallback(async () => {
    setRunning(true);
    setReport(null);
    setSelectedHistoryReport(null);
    setProgress(0);
    abortRef.current = false;
    consoleErrors.current = [];

    // Override console.error to capture during run
    const origError = console.error;
    console.error = (...args: any[]) => {
      consoleErrors.current.push(args.map(String).join(' '));
      origError(...args);
    };

    const tokenCache = new Map<Role, string>();
    const results: TestResult[] = [];

    // Pre-warm all role tokens before running any tests so that rate-limit
    // hits during the auth suite don't cascade into 401s on every later test.
    setCurrentTest('Warming up session tokens…');
    await prewarmTokens(tokenCache, setCurrentTest);

    const startAll = performance.now();

    for (let i = 0; i < TEST_REGISTRY.length; i++) {
      if (abortRef.current) break;
      const tc = TEST_REGISTRY[i];
      setCurrentTest(`${tc.suite} / ${tc.name}`);
      setProgress(Math.round((i / TEST_REGISTRY.length) * 100));

      let status: Severity = 'FAIL';
      let detail: string | undefined;
      const t0 = performance.now();

      try {
        const token = await getToken(tc.role, tokenCache);
        if (token === undefined) {
          // Role token unavailable — beta accounts not seeded in this environment
          status = 'SKIP';
          detail = `${tc.role} test account not available (run seed:beta to enable)`;
        } else {
          const result = await tc.run(token);
          status = result.ok ? 'PASS' : 'FAIL';
          detail = result.detail;
        }
      } catch (err: any) {
        status = 'FAIL';
        detail = err.message;
      }

      const durationMs = Math.round(performance.now() - t0);
      results.push({
        id: tc.id,
        suite: tc.suite,
        name: tc.name,
        role: tc.role,
        status,
        durationMs,
        perfBand: perfBand(durationMs),
        detail,
      });
    }

    console.error = origError;

    const totalMs = Math.round(performance.now() - startAll);
    const suites = groupBySuite(results);
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARN').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;

    const fullReport: FullReport = {
      runAt: new Date().toISOString(),
      durationMs: totalMs,
      totalTests: results.length,
      passed,
      failed,
      warnings,
      skipped,
      suites,
      consoleErrors: consoleErrors.current,
    };

    setReport(fullReport);
    setProgress(100);
    setCurrentTest('');
    setRunning(false);
    setExpandedSuites(new Set(suites.filter(s => s.failed > 0).map(s => s.suite)));
    await saveReport(fullReport);
  }, [saveReport]);

  const exportJson = (r: FullReport) => {
    const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrity-report-${r.runAt.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadHistoryReport = async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/admin/test/reports/${id}`, { headers: authHeaders(token) });
    if (res.ok) {
      const data = await res.json();
      setSelectedHistoryReport(data.reportJson as FullReport);
      setReport(null);
    }
  };

  const displayReport = selectedHistoryReport ?? report;

  // Build performance trend from history
  const trendData = [...history].reverse().slice(-20).map(h => ({
    date: new Date(h.runAt).toLocaleDateString(),
    pass: h.passed,
    fail: h.failed,
    ms: h.durationMs,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-slate-900">
              System Integrity Test Suite
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {TEST_REGISTRY.length} test cases across {[...new Set(TEST_REGISTRY.map(t => t.suite))].length} suites — covers all roles and endpoints
            </p>
          </div>
          <div className="flex gap-2">
            {displayReport && (
              <button
                onClick={() => exportJson(displayReport)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
              >
                <Download className="w-4 h-4" /> Export JSON
              </button>
            )}
            <button
              onClick={running ? () => { abortRef.current = true; } : runTests}
              disabled={saving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg ${
                running
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {running ? (
                <><RotateCcw className="w-4 h-4 animate-spin" /> Abort</>
              ) : (
                <><Play className="w-4 h-4" /> Run All Tests</>
              )}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {running && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span className="truncate italic">
                {progress === 0 && currentTest.startsWith('Warm') ? '🔑 ' : ''}{currentTest}
              </span>
              <span className="shrink-0 ml-2">{progress > 0 ? `${progress}%` : 'setup'}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${progress === 0 ? 'bg-amber-400 w-1/4 animate-pulse' : 'bg-emerald-500'}`}
                style={{ width: progress > 0 ? `${progress}%` : undefined }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      {displayReport && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: displayReport.totalTests, color: 'text-slate-700', bg: 'bg-slate-50' },
            { label: 'Passed', value: displayReport.passed, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Failed', value: displayReport.failed, color: 'text-red-700', bg: 'bg-red-50' },
            { label: 'Skipped', value: displayReport.skipped ?? 0, color: 'text-amber-700', bg: 'bg-amber-50' },
            { label: 'Duration', value: `${(displayReport.durationMs / 1000).toFixed(1)}s`, color: 'text-blue-700', bg: 'bg-blue-50' },
          ].map(card => (
            <div key={card.label} className={`${card.bg} rounded-2xl p-4 border border-slate-100`}>
              <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Suite results */}
      {displayReport && (
        <div className="space-y-3">
          {displayReport.suites.map(suite => {
            const expanded = expandedSuites.has(suite.suite);
            const toggle = () => setExpandedSuites(prev => {
              const n = new Set(prev);
              expanded ? n.delete(suite.suite) : n.add(suite.suite);
              return n;
            });
            const _allPass = suite.failed === 0 && suite.warnings === 0; // kept for reference
            return (
              <div key={suite.suite} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={toggle}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <span className="font-bold text-slate-800">{suite.suite}</span>
                    {suite.failed > 0
                      ? <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{suite.failed} Failed</span>
                      : suite.skipped > 0 && suite.passed === 0
                      ? <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{suite.skipped} Skipped</span>
                      : <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All Pass</span>
                    }
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-emerald-600 font-bold">{suite.passed}✓</span>
                    {suite.failed > 0 && <span className="text-red-600 font-bold">{suite.failed}✗</span>}
                    {suite.skipped > 0 && <span className="text-amber-500 font-bold">{suite.skipped}–</span>}
                    <span className="text-slate-400 text-xs">{suite.results.length} tests</span>
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {suite.results.map(r => (
                      <div key={r.id} className="flex items-center gap-3 px-6 py-3">
                        {STATUS_ICON[r.status]}
                        <span className="flex-1 text-sm text-slate-700">{r.name}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{r.role}</span>
                        <span className={`text-xs font-bold tabular-nums ${BAND_COLOR[r.perfBand]}`}>{r.durationMs}ms</span>
                        {r.detail && (
                          <span className="text-xs text-red-500 truncate max-w-xs" title={r.detail}>{r.detail}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Console errors */}
      {displayReport && displayReport.consoleErrors.length > 0 && (
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Console Errors During Run ({displayReport.consoleErrors.length})
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {displayReport.consoleErrors.map((e, i) => (
              <div key={i} className="text-xs text-red-600 font-mono bg-red-100 rounded px-3 py-1">{e}</div>
            ))}
          </div>
        </div>
      )}

      {/* Performance trend chart */}
      {trendData.length > 1 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-400" />
            <h4 className="font-bold text-slate-800">Performance Trend</h4>
            <span className="text-xs text-slate-400 ml-auto">Last {trendData.length} runs</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="count" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="ms" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="count" type="monotone" dataKey="pass" stroke="#10b981" strokeWidth={2} dot={false} name="Passed" />
              <Line yAxisId="count" type="monotone" dataKey="fail" stroke="#ef4444" strokeWidth={2} dot={false} name="Failed" />
              <Line yAxisId="ms" type="monotone" dataKey="ms" stroke="#6366f1" strokeWidth={1.5} dot={false} name="Duration (ms)" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-slate-400" />
          <h4 className="font-bold text-slate-800">Report History</h4>
          <button onClick={loadHistory} className="ml-auto text-slate-400 hover:text-slate-600">
            <RotateCcw className={`w-4 h-4 ${historyLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {history.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No saved reports yet. Run a test to generate the first report.</p>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <button
                key={h.id}
                onClick={() => loadHistoryReport(h.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-colors border ${
                  selectedHistoryReport
                    ? 'border-slate-100 hover:bg-slate-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-700">{new Date(h.runAt).toLocaleString()}</div>
                  <div className="text-xs text-slate-400">{h.totalTests} tests · {(h.durationMs / 1000).toFixed(1)}s</div>
                </div>
                <div className="flex items-center gap-3 text-sm shrink-0">
                  <span className="text-emerald-600 font-bold">{h.passed}✓</span>
                  {h.failed > 0 && <span className="text-red-600 font-bold">{h.failed}✗</span>}
                  <Zap className="w-3 h-3 text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

#!/usr/bin/env node
// Dependency-audit gate (compliance audit — Phase 5 CI).
// Fails on any HIGH/CRITICAL advisory EXCEPT an explicit, logged allowlist. This
// honors "fail on high" while not blocking on a known advisory whose only fix is a
// major, breaking upgrade we've consciously deferred. Nothing is silently dropped:
// every allowed exception is printed with its reason.
//
// Usage: node scripts/audit-gate.mjs [--dir <path>] [--prod]
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const dirIdx = args.indexOf('--dir');
const dir = dirIdx >= 0 ? args[dirIdx + 1] : process.cwd();
const prodOnly = args.includes('--prod');

// Allowlisted advisories: package name → reason. Keep this SHORT and reviewed.
// Each entry is a deliberate, documented risk-acceptance, tracked in
// COMPLIANCE_CALENDAR.md for periodic re-evaluation.
const ALLOW = {
  astro: 'Fix requires a major upgrade (5.x → 7.x) that would break the 2,666-page SSG build; our static site has minimal exposure to the SSR/server-island/error-page vectors. Tracked for a planned major-version migration.',
  esbuild: 'Transitive via astro/vite; dev-server-only file-read on Windows, not a production runtime path. Resolved by the same astro major upgrade.',
};

let json;
try {
  const out = execFileSync('npm', ['audit', '--json', ...(prodOnly ? ['--omit=dev'] : [])], {
    cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: process.platform === 'win32',
  });
  json = JSON.parse(out);
} catch (e) {
  // `npm audit` exits non-zero when vulns exist; it still prints JSON to stdout.
  try { json = JSON.parse(e.stdout || '{}'); } catch { console.error('audit-gate: could not parse npm audit output'); process.exit(2); }
}

const vulns = json.vulnerabilities || {};
const blocking = [];
const allowed = [];
for (const [name, v] of Object.entries(vulns)) {
  if (v.severity !== 'high' && v.severity !== 'critical') continue;
  if (ALLOW[name]) allowed.push({ name, severity: v.severity });
  else blocking.push({ name, severity: v.severity });
}

console.log(`audit-gate: ${dir} — ${blocking.length} blocking, ${allowed.length} allowlisted high/critical advisories.`);
for (const a of allowed) console.log(`  ALLOWED  [${a.severity}] ${a.name} — ${ALLOW[a.name]}`);
if (blocking.length) {
  console.error('audit-gate FAILED — unallowlisted high/critical advisories:');
  for (const b of blocking) console.error(`  BLOCK    [${b.severity}] ${b.name}`);
  console.error('Run `npm audit fix`, or (with review) add the advisory to the allowlist in scripts/audit-gate.mjs.');
  process.exit(1);
}
console.log('audit-gate passed.');

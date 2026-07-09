#!/usr/bin/env node
// Security-headers guard (compliance audit — Phase 5 CI).
// Fails if the marketing site's Netlify `_headers` file is missing or does not
// declare the baseline security headers. Prevents a regression that would ship the
// static site without CSP / clickjacking / MIME-sniffing protection.
import { readFileSync } from 'node:fs';
import path from 'node:path';

const HEADERS_FILE = path.join(process.cwd(), 'marketing', 'public', '_headers');

const REQUIRED = [
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Strict-Transport-Security',
  'Content-Security-Policy',
];

let src;
try {
  src = readFileSync(HEADERS_FILE, 'utf8');
} catch {
  console.error(`Security-headers check FAILED: ${HEADERS_FILE} not found.`);
  process.exit(1);
}

const missing = REQUIRED.filter((h) => !new RegExp(`^\\s*${h}\\s*:`, 'im').test(src));
if (missing.length) {
  console.error('Security-headers check FAILED — missing header(s) in marketing/public/_headers:');
  for (const h of missing) console.error(`  - ${h}`);
  process.exit(1);
}

// CSP must at least lock down framing + object embedding.
const csp = (src.match(/Content-Security-Policy\s*:\s*(.+)/i) || [])[1] || '';
const cspMustHave = ["frame-ancestors", "object-src"];
const cspMissing = cspMustHave.filter((d) => !csp.includes(d));
if (cspMissing.length) {
  console.error(`Security-headers check FAILED — CSP missing directive(s): ${cspMissing.join(', ')}`);
  process.exit(1);
}

console.log(`Security-headers check passed: all ${REQUIRED.length} baseline headers present.`);

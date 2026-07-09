#!/usr/bin/env node
// PCI SAQ-A guard (compliance audit — Phase 5 CI).
// Fails the build if raw cardholder data appears to touch our servers, which would
// break SAQ-A eligibility. Two checks across the backend payment surface:
//   1) No card-data field names (PAN/CVV/expiry/cardholder) in schema or payment code.
//   2) No logging of a raw request body on a payment/webhook route.
// This is a heuristic tripwire, not a proof — it exists to catch an accidental
// regression (e.g. someone adding a `cardNumber` column or `console.log(req.body)`).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// Files/dirs to scan. Kept narrow to the payment surface + schema.
const TARGET_DIRS = [
  'server/src/controllers',
  'server/src/services',
  'server/src/routes',
];
const EXTRA_FILES = ['prisma/schema.prisma'];

function walk(dir) {
  const out = [];
  let entries;
  try { entries = readdirSync(path.join(ROOT, dir)); } catch { return out; }
  for (const name of entries) {
    const rel = path.join(dir, name);
    let st;
    try { st = statSync(path.join(ROOT, rel)); } catch { continue; }
    if (st.isDirectory()) out.push(...walk(rel));
    else if (/\.(ts|tsx|prisma)$/.test(name)) out.push(rel);
  }
  return out;
}

const files = [
  ...TARGET_DIRS.flatMap((d) => walk(d)),
  ...EXTRA_FILES,
];

// 1) Card-data field names. Word-boundaried to avoid false hits like "discard".
const CARD_FIELD = /\b(card[_]?number|cardnumber|pan|cvv|cvc|card[_]?verification|expiry|exp[_]?month|exp[_]?year|cardholder)\b/i;
// Allow-list: obviously-unrelated matches (JWT "expiry", UI card components live
// outside the scanned dirs). We only scan backend payment dirs + schema, so hits
// there are meaningful.

// 2) Logging a raw request body.
const BODY_LOG = /(console\.(log|info|debug|error)|logger\.\w+)\s*\([^)]*req\.body/;

const violations = [];
for (const rel of files) {
  const abs = path.join(ROOT, rel);
  let src;
  try { src = readFileSync(abs, 'utf8'); } catch { continue; }
  const lines = src.split(/\r?\n/);
  lines.forEach((line, i) => {
    // Skip comments to reduce noise.
    const code = line.replace(/\/\/.*$/, '');
    if (CARD_FIELD.test(code)) violations.push({ rel, line: i + 1, kind: 'card-field', text: line.trim().slice(0, 120) });
    if (BODY_LOG.test(code)) violations.push({ rel, line: i + 1, kind: 'req.body-logging', text: line.trim().slice(0, 120) });
  });
}

if (violations.length) {
  console.error('PCI guard FAILED — potential cardholder-data exposure:');
  for (const v of violations) console.error(`  [${v.kind}] ${v.rel}:${v.line}  ${v.text}`);
  console.error('\nCard data must never touch our servers (Stripe hosted Checkout / Elements only).');
  console.error('If this is a false positive, narrow the pattern or move the code out of the payment surface.');
  process.exit(1);
}

console.log(`PCI guard passed: scanned ${files.length} backend/schema files, no cardholder-data patterns.`);

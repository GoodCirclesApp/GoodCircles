#!/usr/bin/env node
// freshness-report.mjs — GEO content-freshness report (read-only).
//
// Walks marketing/src/pages/**/*.astro, finds each page's last-updated signal
// (`dateModified`, `lastUpdated`, or a visible "Updated <Month Year>"), and prints
// a table sorted OLDEST-FIRST so the team can see which pages are stalest and hit
// the 7–14-day refresh cadence. Pages with no parseable date are listed as "no-date".
//
// Usage:  node scripts/freshness-report.mjs   (run from the repo root)
// No external deps. Only READS files.

import fs from 'node:fs';
import path from 'node:path';

const PAGES_DIR = path.join('marketing', 'src', 'pages');
const NOW = new Date();
const MONTHS = ['january','february','march','april','may','june','july',
  'august','september','october','november','december'];

// Recursively collect all .astro files under a directory.
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith('.astro')) out.push(full);
  }
  return out;
}

// Pull every date-like signal out of a file's text and return the most RECENT one
// (a page often carries datePublished + dateModified; the freshest wins), plus how
// it was found. Returns { date: Date|null, raw: string|null }.
function extractDate(text) {
  const found = []; // { date, raw }

  // Pattern 1: ISO dates in `dateModified`/`lastUpdated`, quoted or braced.
  //   dateModified: '2026-06-12'   dateModified: "2026-06-25"   lastUpdated="2026-07-09"
  const isoRe = /(?:dateModified|lastUpdated)\s*[:=]\s*['"]?(\d{4}-\d{2}-\d{2})['"]?/gi;
  for (const m of text.matchAll(isoRe)) {
    const d = new Date(m[1] + 'T00:00:00');
    if (!isNaN(d)) found.push({ date: d, raw: m[1] });
  }

  // Pattern 2: visible "Updated <Month> <Year>" (e.g. eyebrow="Updated July 2026").
  const textRe = /Updated\s+([A-Z][a-z]+)\s+(\d{4})/g;
  for (const m of text.matchAll(textRe)) {
    const monthIdx = MONTHS.indexOf(m[1].toLowerCase());
    if (monthIdx === -1) continue;
    const d = new Date(Date.UTC(Number(m[2]), monthIdx, 1));
    if (!isNaN(d)) found.push({ date: d, raw: `Updated ${m[1]} ${m[2]}` });
  }

  if (!found.length) return { date: null, raw: null };
  // Most recent signal is the page's effective freshness.
  found.sort((a, b) => b.date - a.date);
  return found[0];
}

// Age bucket flag from a date.
function flagFor(date) {
  const days = Math.floor((NOW - date) / 86400000);
  if (days <= 14) return `FRESH  (${days}d)`;
  if (days <= 30) return `AGING  (${days}d)`;
  return `STALE  (${days}d)`;
}

// --- Run ------------------------------------------------------------------
if (!fs.existsSync(PAGES_DIR)) {
  console.error(`Pages directory not found: ${PAGES_DIR}\nRun this from the repo root.`);
  process.exit(1);
}

const rows = [];      // dated pages
const undated = [];   // no-date pages
for (const file of walk(PAGES_DIR)) {
  const { date, raw } = extractDate(fs.readFileSync(file, 'utf8'));
  const rel = file.split(path.sep).join('/');
  if (date) rows.push({ rel, date, raw, flag: flagFor(date) });
  else undated.push({ rel });
}

rows.sort((a, b) => a.date - b.date); // oldest first

// Print a simple aligned table.
const pad = (s, n) => String(s).padEnd(n);
console.log(`\nGEO freshness report — ${rows.length} dated, ${undated.length} no-date ` +
  `(as of ${NOW.toISOString().slice(0, 10)})\n`);
console.log(`${pad('PATH', 66)}${pad('LAST-UPDATED', 22)}AGE FLAG`);
console.log('-'.repeat(100));
for (const r of rows) console.log(`${pad(r.rel, 66)}${pad(r.raw, 22)}${r.flag}`);
for (const u of undated) console.log(`${pad(u.rel, 66)}${pad('—', 22)}no-date`);
console.log('');

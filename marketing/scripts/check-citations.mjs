// Citation & currency QA gate (runs in `npm run build` after the SEO gate).
// Fails the build if (1) any resource page contains a known STALE figure from the
// watch-list, or (2) a page using the "Sources & tools" standard lacks a dated
// `Last verified` stamp. This makes the hub's accuracy claim defensible at scale:
// the SEO gate proves links resolve; this gate proves cited figures aren't stale.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STALE_FIGURES } from './figure-watchlist.mjs';

const DIST = fileURLToPath(new URL('../dist/resources/', import.meta.url));
if (!existsSync(DIST)) {
  console.log('Citation/currency check: no dist/resources — skipping.');
  process.exit(0);
}
function walk(d, o = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p, o);
    else if (n.endsWith('.html')) o.push(p);
  }
  return o;
}

const pages = walk(DIST);
const errors = [];
let sourcedPages = 0;
for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const rel = 'resources/' + relative(DIST, f).replace(/\\/g, '/');
  for (const s of STALE_FIGURES) {
    if (s.pattern.test(html)) errors.push(`${rel}: STALE figure — ${s.label} (use "${s.current}")`);
  }
  // Pages adopting the new "Sources & tools" standard must carry a Last-verified date.
  if (/Sources &amp; tools/.test(html)) {
    sourcedPages++;
    if (!/Last verified \d{4}-\d{2}-\d{2}/.test(html))
      errors.push(`${rel}: has a "Sources & tools" block but no "Last verified YYYY-MM-DD" date`);
  }
}

if (errors.length) {
  console.error(`\nCitation/currency check FAILED — ${errors.length} issue(s):\n`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`Citation/currency check passed: ${pages.length} resource pages, 0 stale figures, ${sourcedPages} sourced pages all dated.`);

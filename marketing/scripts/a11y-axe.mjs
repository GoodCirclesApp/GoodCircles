#!/usr/bin/env node
// Accessibility gate (compliance audit — Phase 5 CI): runs axe-core (WCAG 2.1
// A/AA) against a representative built page from each template and FAILS on any
// definite violation. Structural rules (lang, alt, labels, names, roles,
// duplicate-id, headings, landmarks) run fully in jsdom; layout-dependent rules
// (color-contrast) cannot be computed without a browser and are reported as
// "needs browser review", not failed.
//
// Requires axe-core + jsdom. In CI, install them ad-hoc before running:
//   npm install --no-save axe-core@4 jsdom@24
// Usage: node scripts/a11y-axe.mjs [distDir]
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] || 'dist');

// Representative pages — one per template family. Missing pages are skipped (so a
// rename doesn't hard-fail the gate), but we require a minimum coverage count.
const CANDIDATES = [
  'index.html',
  'causes/index.html',
  'for-nonprofits/index.html',
  'for-nonprofits/for-churches/index.html',
  'how-it-works/index.html',
  'sell/index.html',
  'meridian/index.html',
  'learn/index.html',
  'learn/passive-nonprofit-funding/index.html',
  'compare/good-circles-vs-national-marketplaces/index.html',
  'shop-local/mississippi/jackson/index.html',
  'answers/index.html',
  'privacy/index.html',
  'terms/index.html',
  'partners/cdfi/index.html',
  'faq/index.html',
];

async function main() {
  let JSDOM, axeSrc;
  try {
    ({ JSDOM } = await import('jsdom'));
    axeSrc = readFileSync(path.join(DIST, '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');
  } catch (e) {
    console.error('a11y gate: axe-core/jsdom not installed. Run: npm install --no-save axe-core@4 jsdom@24');
    console.error(String(e?.message || e));
    process.exit(2);
  }

  const pages = CANDIDATES.filter((p) => existsSync(path.join(DIST, p)));
  if (pages.length < 8) {
    console.error(`a11y gate: only ${pages.length} representative pages found under ${DIST} — did the site build?`);
    process.exit(2);
  }

  const violations = {};
  const incomplete = {};
  let scanned = 0;

  for (const rel of pages) {
    const html = readFileSync(path.join(DIST, rel), 'utf8');
    const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://goodcircles.org/' });
    const { window } = dom;
    try {
      window.eval(axeSrc);
      const res = await window.axe.run(window.document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        resultTypes: ['violations', 'incomplete'],
      });
      for (const v of res.violations) {
        const e = violations[v.id] || (violations[v.id] = { impact: v.impact, help: v.help, pages: new Set(), sample: v.nodes[0]?.html?.slice(0, 120) });
        e.pages.add(rel);
      }
      for (const v of res.incomplete) {
        const e = incomplete[v.id] || (incomplete[v.id] = { pages: new Set(), help: v.help });
        e.pages.add(rel);
      }
      scanned++;
    } finally {
      window.close();
    }
  }

  const vk = Object.keys(violations);
  console.log(`a11y gate: scanned ${scanned} representative pages (WCAG 2.1 A/AA).`);
  if (Object.keys(incomplete).length) {
    console.log('  needs browser review (not failed): ' + Object.keys(incomplete).join(', '));
  }
  if (vk.length) {
    console.error('a11y gate FAILED — definite WCAG violations:');
    for (const id of vk) {
      const e = violations[id];
      console.error(`  [${e.impact}] ${id} — ${e.help} (${e.pages.size} pages) e.g. ${[...e.pages][0]}`);
      if (e.sample) console.error(`      ${e.sample.replace(/\s+/g, ' ')}`);
    }
    process.exit(1);
  }
  console.log('a11y gate passed: 0 definite WCAG 2.1 A/AA violations.');
}

main().catch((e) => { console.error('a11y gate error:', e); process.exit(2); });

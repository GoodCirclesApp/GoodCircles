#!/usr/bin/env node
// build-lang-switch.mjs — inject a VISIBLE language switcher into every guide that
// has a translated counterpart (detected via its hreflang alternates).
//
// Why: the Spanish pages were reachable only via <link rel="alternate" hreflang>
// (search engines) — a human browsing in English had no visible way to reach them.
// This adds a "Leer en espanol ->" pill on English pages that have a Spanish version,
// and a "Read in English ->" pill on Spanish pages.
//
// Idempotent via <!--langswitch-->...<!--/langswitch--> markers. Permanent build step.
// Run AFTER hreflang has been injected (i.e. after _es.mjs) — and after the byline
// injector, so the final order is: langswitch, byline, answer.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../public/resources/', import.meta.url));
const ORIGIN = 'https://goodcircles.org';

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e === 'index.html') out.push(p);
  }
  return out;
}

const STRIP = /<!--langswitch-->[\s\S]*?<!--\/langswitch-->\s*/g;
const toPath = (u) => u.startsWith(ORIGIN) ? u.slice(ORIGIN.length) : u;

let injected = 0, cleared = 0;
for (const file of walk(ROOT)) {
  let html = readFileSync(file, 'utf8');
  const had = STRIP.test(html); STRIP.lastIndex = 0;
  // Remove any prior switcher so this is a clean re-render.
  html = html.replace(STRIP, '');

  const isEs = /<html[^>]*\blang="es"/.test(html);
  // Pull hreflang alternates.
  const alts = {};
  for (const m of html.matchAll(/<link\s+rel="alternate"\s+hreflang="([a-z-]+)"\s+href="([^"]+)"/g)) {
    alts[m[1]] = m[2];
  }
  const selfCanon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '';

  // Target = the OTHER language's URL.
  const targetAbs = isEs ? alts['en'] : alts['es'];
  let block = null;
  if (targetAbs && targetAbs !== selfCanon) {
    const href = toPath(targetAbs);
    block = isEs
      ? `<!--langswitch--><div class="langswitch"><a href="${href}" hreflang="en" lang="en">\u{1F310} Read in English →</a></div><!--/langswitch-->`
      : `<!--langswitch--><div class="langswitch"><a href="${href}" hreflang="es" lang="es">\u{1F310} Leer en español →</a></div><!--/langswitch-->`;
  }

  if (block) {
    // Insert before the byline if present, else before the answer box.
    if (html.includes('<!--byline-->')) html = html.replace('<!--byline-->', block + '\n  <!--byline-->');
    else if (html.includes('<div class="answer">')) html = html.replace('<div class="answer">', block + '\n  <div class="answer">');
    else continue;
    writeFileSync(file, html, 'utf8');
    injected++;
  } else if (had) {
    // No counterpart now, but had a stale switcher — write the cleaned version.
    writeFileSync(file, html, 'utf8');
    cleared++;
  }
}
console.log(`lang-switch: injected ${injected} switchers, cleared ${cleared} stale`);

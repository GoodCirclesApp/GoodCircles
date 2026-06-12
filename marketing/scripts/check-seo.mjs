// SEO regression gate — runs after `astro build` (wired into npm run build).
// Fails the build if any page violates the invariants from the architecture
// report §5/§7/§8 and the accuracy contract's schema rules.
//
// Per page: exactly one non-empty <h1>; non-empty <title> and meta
// description; absolute self-referencing canonical; og:title === <title>;
// absolute og:image; all JSON-LD parses; FAQPage question text appears
// verbatim in the visible HTML; no internal *.html links; every internal
// link resolves to a built file. Site-wide: noindex pages never appear in
// the sitemap, and every indexable page does.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const SITE = 'https://goodcircles.org';

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function visibleText(html) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ');
}

const pages = walk(DIST);
const sitemap = existsSync(join(DIST, 'sitemap-0.xml'))
  ? readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8')
  : '';
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));

const errors = [];
const err = (page, msg) => errors.push(`${relative(DIST, page).replace(/\\/g, '/')}: ${msg}`);

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const rel = relative(DIST, page).replace(/\\/g, '/');

  // one non-empty h1
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)];
  if (h1s.length !== 1) err(page, `expected exactly 1 <h1>, found ${h1s.length}`);
  else if (!visibleText(h1s[0][1]).trim()) err(page, 'empty <h1>');

  // title + description
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  if (!title.trim()) err(page, 'missing <title>');
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  if (!desc.trim()) err(page, 'missing meta description');

  // canonical (absolute, on-site, trailing-slash form)
  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1] || '';
  if (!canonical.startsWith(SITE)) err(page, `bad canonical: ${canonical}`);
  else if (!canonical.endsWith('/') && !/\.[a-z0-9]+$/.test(canonical))
    err(page, `canonical not trailing-slash form: ${canonical}`);

  // og:title === title, og:image absolute
  const ogTitle = (html.match(/property="og:title" content="([^"]*)"/) || [])[1] || '';
  if (decode(ogTitle) !== decode(title)) err(page, `og:title differs from <title>`);
  const ogImage = (html.match(/property="og:image" content="([^"]*)"/) || [])[1] || '';
  if (!ogImage.startsWith('https://')) err(page, `og:image not absolute: ${ogImage}`);

  // JSON-LD parses; FAQPage questions verbatim in visible text
  const text = visibleText(html);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ld;
    try {
      ld = JSON.parse(m[1]);
    } catch {
      err(page, 'invalid JSON-LD');
      continue;
    }
    if (ld['@type'] === 'FAQPage') {
      for (const q of ld.mainEntity || []) {
        if (!text.includes(decode(q.name))) err(page, `FAQ question not in visible text: "${q.name}"`);
      }
    }
  }

  // internal links: no .html, and every one resolves to a built file
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const href = m[1];
    if (href.startsWith('/api') || href.startsWith('/account')) continue;
    if (href.endsWith('.html')) {
      err(page, `internal .html link: ${href}`);
      continue;
    }
    if (/\.[a-z0-9]+$/i.test(href)) {
      if (!existsSync(join(DIST, href))) err(page, `broken asset link: ${href}`);
    } else {
      const target = join(DIST, href, 'index.html');
      const alt = join(DIST, `${href.replace(/\/$/, '')}.html`);
      if (!existsSync(target) && !existsSync(alt)) err(page, `broken internal link: ${href}`);
    }
  }

  // sitemap <-> noindex consistency
  const noindex = /name="robots" content="noindex/.test(html);
  const url = canonical;
  if (noindex && sitemapUrls.has(url)) err(page, 'noindex page present in sitemap');
  if (!noindex && rel !== '404.html' && !sitemapUrls.has(url))
    err(page, `indexable page missing from sitemap: ${url}`);
}

if (errors.length) {
  console.error(`\nSEO check FAILED — ${errors.length} issue(s):\n`);
  for (const e of errors) console.error('  ✗ ' + e);
  process.exit(1);
}
console.log(`SEO check passed: ${pages.length} pages, ${sitemapUrls.size} sitemap URLs, 0 issues.`);

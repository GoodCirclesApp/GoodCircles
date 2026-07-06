// IndexNow submitter (Ahrefs fix sprint 2026-07-05) — instant Bing/ChatGPT
// (and other IndexNow-consuming engines) indexing for goodcircles.org.
//
// Runs after `astro build` in the Netlify deploy (see netlify.toml). Reads the
// built sitemap, diffs it against the committed snapshot of already-submitted
// URLs (scripts/indexnow-submitted.json), and POSTs only NEW urls to
// api.indexnow.org. With no snapshot present it submits the full sitemap
// (first run). NEVER fails the build: every error is caught and logged.
//
// Key file: marketing/public/<KEY>.txt (served at the site root), required by
// the IndexNow protocol to prove ownership.
//
// To also submit URLs whose CONTENT changed (not just new paths), run locally:
//   INDEXNOW_FORCE=1 node scripts/indexnow-submit.mjs      (resubmit all)
// After a local run, the refreshed snapshot is written; commit it so Netlify
// deploys keep diffing against the latest submitted set.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KEY = '0911613a5401f0be7b599dc47c8839d8';
const HOST = 'goodcircles.org';
const SITEMAP = fileURLToPath(new URL('../dist/sitemap-0.xml', import.meta.url));
const SNAPSHOT = fileURLToPath(new URL('./indexnow-submitted.json', import.meta.url));
const ON_NETLIFY = !!process.env.NETLIFY;

try {
  if (!existsSync(SITEMAP)) {
    console.log('[indexnow] no sitemap at', SITEMAP, '— skipping.');
    process.exit(0);
  }
  const xml = readFileSync(SITEMAP, 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  let submitted = [];
  if (existsSync(SNAPSHOT) && !process.env.INDEXNOW_FORCE) {
    try { submitted = JSON.parse(readFileSync(SNAPSHOT, 'utf8')); } catch { submitted = []; }
  }
  const known = new Set(submitted);
  const fresh = urls.filter((u) => !known.has(u));
  if (!fresh.length) {
    console.log(`[indexnow] sitemap has ${urls.length} URLs — nothing new to submit.`);
    process.exit(0);
  }
  console.log(`[indexnow] submitting ${fresh.length} URL(s) (${urls.length} in sitemap, ${known.size} previously submitted)…`);
  // Protocol allows up to 10,000 URLs per POST.
  for (let i = 0; i < fresh.length; i += 10000) {
    const batch = fresh.slice(i, i + 10000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: batch,
      }),
      signal: AbortSignal.timeout(30000),
    });
    console.log(`[indexnow] batch ${i / 10000 + 1}: HTTP ${res.status} ${res.statusText || ''} (${batch.length} URLs)`);
    if (res.status >= 400) {
      console.log('[indexnow] non-success response — leaving snapshot unchanged so the next run retries.');
      process.exit(0);
    }
  }
  // Success: refresh the snapshot. On Netlify the filesystem is throwaway, so
  // only write it locally (commit it to persist the submitted set).
  if (!ON_NETLIFY) {
    writeFileSync(SNAPSHOT, JSON.stringify(urls, null, 0));
    console.log('[indexnow] snapshot updated —', SNAPSHOT, '(commit it).');
  } else {
    console.log('[indexnow] done (snapshot not written on CI).');
  }
} catch (e) {
  console.log('[indexnow] error (non-fatal):', String(e).slice(0, 200));
}
process.exit(0);

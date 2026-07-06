// External-link checker (Ahrefs fix sprint 2026-07-05). Extracts every external
// href from dist/ with its source pages, HTTP-checks each unique URL (HEAD with
// GET fallback), and writes external-links-report.md sorted worst-first.
// ProPublica per-funder org pages (~2k, one templated pattern) are sampled
// rather than exhaustively checked. Read-only against the site; network-only.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const OUT = fileURLToPath(new URL('../../external-links-report.md', import.meta.url));
const SKIP = /goodcircles\.org|fonts\.(googleapis|gstatic)\.com|googletagmanager\.com/;
const PP = /^https:\/\/projects\.propublica\.org\/nonprofits\/organizations\/\d+$/;

const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith('.html')) pages.push(p);
  }
})(DIST);

const map = new Map(); // url -> Set(sources)
let ppSample = [];
for (const p of pages) {
  const rel = relative(DIST, p).split('\\').join('/');
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    const url = m[1].replace(/&amp;/g, '&');
    if (SKIP.test(url)) continue;
    if (PP.test(url)) { if (ppSample.length < 5 && !ppSample.includes(url)) ppSample.push(url); continue; }
    if (!map.has(url)) map.set(url, new Set());
    map.get(url).add(rel);
  }
}
for (const u of ppSample) { map.set(u, new Set(['(sampled — one of ~2,063 templated ProPublica funder links)'])); }

const urls = [...map.keys()];
console.log(`checking ${urls.length} unique external URLs…`);

async function status(url) {
  const opts = { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (compatible; GoodCirclesLinkCheck/1.0)' } };
  try {
    let r = await fetch(url, { ...opts, method: 'HEAD' });
    if (r.status === 405 || r.status === 403 || r.status === 400) r = await fetch(url, { ...opts, method: 'GET' });
    return { code: r.status, final: r.url };
  } catch (e) {
    try {
      const r = await fetch(url, { ...opts, method: 'GET' });
      return { code: r.status, final: r.url };
    } catch (e2) {
      return { code: 0, final: '', err: String(e2.cause?.code || e2.name || e2.message).slice(0, 60) };
    }
  }
}

const results = new Map();
let i = 0;
async function worker() {
  while (i < urls.length) {
    const u = urls[i++];
    results.set(u, await status(u));
    if (results.size % 100 === 0) console.log(`  ${results.size}/${urls.length}`);
  }
}
await Promise.all(Array.from({ length: 12 }, worker));

const rows = urls.map((u) => {
  const r = results.get(u);
  const srcs = [...map.get(u)];
  let verdict;
  if (r.code === 0) verdict = `UNREACHABLE (${r.err})`;
  else if (r.code === 404 || r.code === 410) verdict = `DEAD (${r.code})`;
  else if (r.code >= 500) verdict = `SERVER ERROR (${r.code})`;
  else if (r.code === 403 || r.code === 429 || r.code === 401 || r.code === 400 || r.code === 405) verdict = `BLOCKED/BOT-WALL (${r.code}) — likely fine in a browser`;
  else if (r.code >= 200 && r.code < 400) verdict = `OK (${r.code})`;
  else verdict = `CHECK (${r.code})`;
  return { url: u, verdict, code: r.code, srcs };
});
const rank = (v) => (v.startsWith('DEAD') ? 0 : v.startsWith('UNREACHABLE') ? 1 : v.startsWith('SERVER') ? 2 : v.startsWith('BLOCKED') ? 3 : v.startsWith('CHECK') ? 4 : 5);
rows.sort((a, b) => rank(a.verdict) - rank(b.verdict) || a.url.localeCompare(b.url));

const counts = {};
for (const r of rows) counts[r.verdict.split(' (')[0]] = (counts[r.verdict.split(' (')[0]] || 0) + 1;

let md = `# External links report — goodcircles.org\n\nGenerated ${new Date().toISOString().slice(0, 10)} from the built site (marketing/dist). ${urls.length} unique external URLs checked (HEAD/GET, 15s timeout). The ~2,063 templated ProPublica funder links share one URL pattern and were sampled (5 checks) rather than enumerated.\n\n`;
md += `**Summary:** ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · ')}\n\n`;
md += `Verdicts: DEAD = returned 404/410 (fix or remove). UNREACHABLE = DNS/TLS/timeout failure (often parked or gone — verify by hand). BLOCKED/BOT-WALL = the server rejects automated checks (403/429 etc.) but the link usually works for real visitors — human-review only if Ahrefs also flags it. OK = 2xx/3xx.\n\n`;
for (const r of rows) {
  if (r.verdict.startsWith('OK')) continue;
  md += `## ${r.verdict}\n${r.url}\n- Linked from (${r.srcs.length}): ${r.srcs.slice(0, 8).join(', ')}${r.srcs.length > 8 ? ', …' : ''}\n\n`;
}
md += `\n## OK (${counts['OK'] || 0} URLs)\n\nAll remaining URLs returned 2xx/3xx and are not listed individually.\n`;
writeFileSync(OUT, md);
console.log('summary:', counts);
console.log('report:', OUT);

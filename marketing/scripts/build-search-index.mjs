// Builds a compact client-side search index for the resource hub by walking
// public/resources/**/index.html and extracting title, description, headings, and
// a search blob per page. Wired into `npm run build` (runs before astro build so
// the JSON is copied into dist). Output: public/resources/search-index.json.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../public/resources/', import.meta.url));
const OUT = join(ROOT, 'search-index.json');

const SECTIONS = {
  'start-a-nonprofit': 'Start a Nonprofit', 'governance-compliance': 'Governance & Compliance',
  grants: 'Grants', 'program-design': 'Program Design', fundraising: 'Fundraising',
  'passive-funding': 'Passive Funding', marketing: 'Marketing', 'donor-development': 'Donor Development',
  operations: 'Operations & Finance', hr: 'HR & Employment', tools: 'Tools', templates: 'Templates',
  answers: 'Answers', states: 'States', glossary: 'Glossary',
};

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (name === 'index.html') out.push(p);
  }
  return out;
}
function decode(s) {
  return String(s).replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&mdash;/g, '—');
}
const tags = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const grab = (re, h) => { const m = h.match(re); return m ? m[1] : ''; };

const files = walk(ROOT);
const records = [];
for (const f of files) {
  const rel = relative(ROOT, f).replace(/\\/g, '/');
  const url = '/resources/' + rel.replace(/index\.html$/, '');
  if (url === '/resources/search/') continue; // don't index the search page itself
  // Skip the 600+ individual funder PROFILE pages (they have a dedicated per-state
  // filter); keep the funder hub + per-state index pages in search.
  if (/^\/resources\/funders\/[^/]+\/[^/]+\/$/.test(url)) continue;
  const html = readFileSync(f, 'utf8');
  if (/name="robots" content="noindex/.test(html)) continue;
  const title = tags(grab(/<title>([\s\S]*?)<\/title>/, html)).replace(/\s*·\s*Good Circles\s*$/, '');
  const desc = decode(grab(/name="description" content="([^"]*)"/, html));
  const h1 = tags(grab(/<h1[^>]*>([\s\S]*?)<\/h1>/, html));
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => tags(m[1])).join(' ');
  const seg = rel.split('/')[0];
  const section = SECTIONS[seg] || 'Resources';
  const es = /\/es\/$/.test(url);
  const blob = (title + ' ' + desc + ' ' + h1 + ' ' + h2s).toLowerCase();
  records.push({ u: url, t: title || h1, d: desc, s: es ? section + ' (Español)' : section, b: blob });
}
// stable order: by section then title
records.sort((a, b) => (a.s + a.t).localeCompare(b.s + b.t));
writeFileSync(OUT, JSON.stringify(records));
console.log(`search index: ${records.length} pages -> ${relative(ROOT, OUT)}`);

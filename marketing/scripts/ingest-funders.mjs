// Funder-data ingest (run locally; NOT wired into the Netlify build — produces a
// committed dataset). Builds a comprehensive grantmaking-foundation dataset for
// Mississippi + Deep-South states from the free, public ProPublica Nonprofit
// Explorer API (IRS Form 990 public-domain data). Caches every response so reruns
// are reproducible and polite to the API. Output: scripts/funders-data.json.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const CACHE = join(HERE, '.cache');
mkdirSync(CACHE, { recursive: true });
const API = 'https://projects.propublica.org/nonprofits/api/v2';
const STATES = ['MS', 'AL', 'AR', 'LA', 'TN'];
const QUERIES = ['foundation', 'trust', 'charitable'];
const PAGES = 8;            // search pages per (state,query)
const RATE_MS = 320;        // polite delay between live calls
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, key) {
  const cf = join(CACHE, key + '.json');
  if (existsSync(cf)) { try { return JSON.parse(readFileSync(cf, 'utf8')); } catch {} }
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 25000);
      const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'GoodCircles-resource-hub/1.0 (nonprofit resource directory)' } });
      clearTimeout(t);
      if (res.status === 429) { await sleep(2000); continue; }
      if (!res.ok) { await sleep(RATE_MS); return null; }
      const j = await res.json();
      writeFileSync(cf, JSON.stringify(j));
      await sleep(RATE_MS);
      return j;
    } catch (e) { await sleep(800); }
  }
  return null;
}

// 1) DISCOVER grantmaking foundations (NTEE T*) across the target states.
const found = new Map(); // ein -> {ein,name,city,state,ntee}
for (const st of STATES) {
  for (const q of QUERIES) {
    for (let p = 0; p < PAGES; p++) {
      const url = `${API}/search.json?q=${encodeURIComponent(q)}&state%5Bid%5D=${st}&page=${p}`;
      const s = await getJson(url, `search_${st}_${q}_${p}`);
      if (!s || !s.organizations || !s.organizations.length) break;
      for (const o of s.organizations) {
        const ntee = o.ntee_code || '';
        if (!ntee.startsWith('T')) continue;          // grantmaking / philanthropy
        const ein = String(o.ein);
        if (!found.has(ein)) found.set(ein, { ein, name: o.name, city: o.city, state: o.state, ntee });
      }
      if (p + 1 >= Math.ceil((s.total_results || 0) / (s.per_page || 25))) break;
    }
  }
  console.log(`discovered after ${st}: ${found.size} grantmaking orgs`);
}

// 2) ENRICH each with the org endpoint (financials, type, multi-year filings).
const FCODE = { // IRS foundation codes -> plain label
  '02': 'Private operating foundation', '03': 'Private operating foundation (exempt)',
  '04': 'Private non-operating foundation', '09': 'Suspense', '10': 'Church',
  '11': 'School', '12': 'Hospital', '13': 'Supporting organization', '14': 'Public safety org',
  '15': 'Public charity (publicly supported)', '16': 'Public charity (publicly supported)',
  '17': 'Public charity (publicly supported)', '18': 'Public charity (gross-receipts test)',
  '21': 'Public charity (509(a)(3))', '22': 'Public charity', '23': 'Public charity', '24': 'Public charity',
};
const funders = [];
let n = 0;
for (const [ein] of found) {
  const o = await getJson(`${API}/organizations/${ein}.json`, `org_${ein}`);
  n++;
  if (!o || !o.organization) continue;
  const org = o.organization;
  const fils = (o.filings_with_data || []).slice(0, 6).map((f) => ({
    year: f.tax_prd_yr, revenue: f.totrevenue, expenses: f.totfuncexpns, assets: f.totassetsend,
    contribPaid: f.contrpdpbns != null ? f.contrpdpbns : (f.grntspd != null ? f.grntspd : null),
  })).filter((f) => f.year);
  if (!fils.length) continue; // skip orgs with no financial data (thin)
  const fc = String(org.foundation_code || '').padStart(2, '0');
  funders.push({
    ein: String(org.ein), name: org.name, city: org.city, state: org.state, zip: org.zipcode,
    ntee: org.ntee_code || found.get(String(org.ein))?.ntee || '', foundationCode: fc,
    foundationLabel: FCODE[fc] || (org.foundation_code ? 'Foundation/charity' : ''),
    subsection: org.subsection, ruling: org.ruling_date,
    ppUrl: `https://projects.propublica.org/nonprofits/organizations/${org.ein}`,
    filings: fils,
  });
  if (n % 25 === 0) console.log(`enriched ${n}/${found.size} (kept ${funders.length})`);
}

funders.sort((a, b) => (b.filings[0]?.assets || 0) - (a.filings[0]?.assets || 0));
writeFileSync(join(HERE, 'funders-data.json'), JSON.stringify(funders));
const byState = {};
for (const f of funders) byState[f.state] = (byState[f.state] || 0) + 1;
console.log(`\nDONE: ${funders.length} funders with financial data. By state:`, byState);

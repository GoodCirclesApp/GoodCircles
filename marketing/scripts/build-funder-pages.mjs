// Builds the funder research database from scripts/funders-data.json (IRS 990 data
// via ProPublica). Offline/deterministic. Generates: a profile page per funder at
// /resources/funders/<state>/<slug>/, a per-state index, and the /resources/funders/
// hub. SEO/GEO-optimized: unique titles/meta, NGO + FAQPage + BreadcrumbList +
// Dataset JSON-LD, scannable key-facts, strong internal linking. Gate-compliant.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
const SITE = 'https://goodcircles.org';
const OG = `${SITE}/resources/og.png`;
const PUBLIC = fileURLToPath(new URL('../public', import.meta.url));
const HERE = fileURLToPath(new URL('.', import.meta.url));
const DATE = '2026-06-17';
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const STATES = { MS: 'mississippi', AL: 'alabama', AR: 'arkansas', LA: 'louisiana', TN: 'tennessee', GA: 'georgia', FL: 'florida', NC: 'north-carolina', SC: 'south-carolina', KY: 'kentucky', VA: 'virginia', TX: 'texas', OK: 'oklahoma' };
const STATEN = { MS: 'Mississippi', AL: 'Alabama', AR: 'Arkansas', LA: 'Louisiana', TN: 'Tennessee', GA: 'Georgia', FL: 'Florida', NC: 'North Carolina', SC: 'South Carolina', KY: 'Kentucky', VA: 'Virginia', TX: 'Texas', OK: 'Oklahoma' };
const NTEE = {
  T20: ['private grantmaking foundation', 'a private foundation that makes grants to other organizations and causes'],
  T21: ['corporate foundation', 'a company-sponsored foundation that directs corporate philanthropy'],
  T22: ['private independent foundation', 'an independent private foundation, often family-funded, that makes grants'],
  T23: ['private operating foundation', 'a private foundation that mainly runs its own charitable programs'],
  T30: ['public foundation', 'a publicly supported foundation that raises money and makes grants'],
  T31: ['community foundation', 'a community foundation that pools donations to fund local causes'],
  T40: ['voluntarism promotion organization', 'an organization that promotes giving and volunteering'],
  T50: ['philanthropy & charity organization', 'a philanthropy, charity, or voluntarism organization'],
  T70: ['fundraising organization', 'a federated or fundraising organization that raises and distributes funds'],
  T90: ['named trust or fund', 'a charitable trust or named fund'],
  T99: ['grantmaking / philanthropy organization', 'a grantmaking or philanthropy organization'],
  T12: ['fund-raising & fund distribution organization', 'an organization that raises and distributes charitable funds'],
  T11: ['philanthropy support organization', 'an organization that supports philanthropy and grantmaking'],
};
function focus(ntee) { const k = (ntee || '').slice(0, 3); return NTEE[k] || ['grantmaking foundation', 'a grantmaking or philanthropic organization']; }
function slug(s) { return String(s).toLowerCase().replace(/\b(inc|incorporated|the)\b/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70); }
function money(n) {
  if (n == null || isNaN(n)) return '—';
  n = Number(n); const a = Math.abs(n); const sg = n < 0 ? '-' : '';
  if (a >= 1e9) return sg + '$' + (a / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
  if (a >= 1e6) return sg + '$' + (a / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (a >= 1e3) return sg + '$' + Math.round(a / 1e3) + 'K';
  return sg + '$' + Math.round(a);
}
function tier(assets) { assets = Number(assets) || 0; if (assets >= 1e8) return 'one of the largest'; if (assets >= 1e7) return 'a large'; if (assets >= 1e6) return 'a mid-sized'; return 'a smaller'; }

const SHARE = `<div class="sharebar"><span class="lbl">Share</span><a href="javascript:void(0)" onclick="gcShare('facebook')" aria-label="Share on Facebook"><svg viewBox="0 0 24 24"><path d="M13 22v-8h3l1-4h-4V8c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v3H6v4h3v8z"/></svg>Facebook</a><a href="javascript:void(0)" onclick="gcShare('x')" aria-label="Share on X"><svg viewBox="0 0 24 24"><path d="M18 2h3l-7 8 8 12h-6l-5-7-6 7H2l8-9L2 2h6l4 6zm-1 18h2L8 4H6z"/></svg>X</a><a href="javascript:void(0)" onclick="gcShare('linkedin')" aria-label="Share on LinkedIn"><svg viewBox="0 0 24 24"><path d="M4 4a2 2 0 110 4 2 2 0 010-4zM3 9h3v12H3zM9 9h3v2c.5-1 2-2 4-2 3 0 4 2 4 5v7h-3v-6c0-2-1-3-2-3s-2 1-2 3v6H9z"/></svg>LinkedIn</a><a href="javascript:void(0)" onclick="gcShare('email')" aria-label="Share by email"><svg viewBox="0 0 24 24"><path d="M2 5h20v14H2zm2 2v.5l8 5 8-5V7l-8 5z"/></svg>Email</a><button onclick="gcCopy(this)" aria-label="Copy link"><svg viewBox="0 0 24 24"><path d="M9 7h9v12H9zM5 3h9v2H7v10H5z"/></svg><span class="t">Copy link</span></button></div>`;
function head(title, canon, desc, ld) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website"><meta property="og:url" content="${canon}"><meta property="og:image" content="${OG}">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#7851A9">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/resources/resources.css">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head><body>
<nav class="nav"><div class="wrap"><a class="brand" href="/resources/"><img src="/brand/gc-main-white.svg" alt="Good Circles"></a><div class="links"><a href="/resources/">Resources</a><a href="/resources/funders/">Funders</a><a href="/resources/grants/funder-directory/">Directory</a><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits" style="padding:9px 16px">For nonprofits</a></div></div></nav>`;
}
const FOOT = `<footer><div class="wrap">
  <div class="ftag">Save. Give. Stay local.</div>
  <div class="fnav"><a href="/resources/">Resources</a> · <a href="/resources/funders/">Funder database</a> · <a href="https://goodcircles.org/for-nonprofits">For nonprofits</a> · <a href="https://goodcircles.org">goodcircles.org</a></div>
  <p class="muted">goodcircles.org · The community marketplace · Launching September 2026</p>
</div></footer>
<script src="/resources/share.js"></script>
</body></html>
`;
const ATTRIB = `<div class="callout"><h4>Sources &amp; tools</h4><p style="margin:0 0 6px">This is a <b>research profile</b> built from public records — not an endorsement, and not an application portal. Always confirm current priorities, deadlines, and how to apply with the funder before reaching out.</p><ul><li><a href="REPLACE_PP" target="_blank" rel="noopener">IRS Form 990 filings on ProPublica Nonprofit Explorer</a> — see every year of this organization's public tax filings.</li><li><a href="https://apps.irs.gov/app/eos/" target="_blank" rel="noopener">IRS Tax Exempt Organization Search</a> — confirm exempt status and pull determination letters.</li><li><a href="/resources/grants/grant-prospect-research/">How to research a funder</a> · <a href="/resources/grants/how-to-find-grants/">How to find grants</a></li></ul><p class="muted" style="margin-top:8px">Source: the organization's IRS Form 990 filings (public record) via ProPublica Nonprofit Explorer. Figures are from its most recent available filing and may not reflect current activity. Last verified ${DATE}.</p></div>`;

function renderFunder(f) {
  const stslug = STATES[f.state] || 'other'; const stname = STATEN[f.state] || f.state;
  const sl = f.slug;
  const canon = `${SITE}/resources/funders/${stslug}/${sl}/`;
  const [focusShort, focusLong] = focus(f.ntee);
  const fy = f.filings[0] || {};
  const title = `${f.name} — Grants, Financials & 990 (${esc(f.city)}, ${f.state}) · Good Circles`;
  const desc = `${f.name} is ${focusShort} in ${f.city}, ${f.state} (EIN ${f.ein}). See its IRS Form 990 financials — about ${money(fy.assets)} in assets, ${money(fy.revenue)} revenue (FY${fy.year}) — and how to research this funder.`.slice(0, 250);
  const addr = { '@type': 'PostalAddress', addressLocality: f.city, addressRegion: f.state, postalCode: f.zip || undefined, addressCountry: 'US' };
  const ngo = { '@context': 'https://schema.org', '@type': 'NGO', name: f.name, identifier: { '@type': 'PropertyValue', propertyID: 'EIN', value: f.ein }, address: addr, url: f.ppUrl, areaServed: stname, nonprofitStatus: 'Nonprofit501c3' };
  const faqs = [
    { q: `What is ${f.name}?`, a: `${f.name} is ${focusLong} based in ${f.city}, ${f.state}. Its IRS employer identification number (EIN) is ${f.ein}.` },
    { q: `Where is ${f.name} located?`, a: `${f.name} is located in ${f.city}, ${f.state}${f.zip ? ' ' + f.zip : ''}.` },
    { q: `How large is ${f.name}?`, a: `According to its most recent IRS Form 990 (fiscal year ${fy.year}), ${f.name} reported about ${money(fy.assets)} in total assets, ${money(fy.revenue)} in revenue, and ${money(fy.expenses)} in expenses. For a grantmaking foundation, total expenses largely reflect the grants and charitable activity it funds.` },
    { q: `Does ${f.name} accept grant applications?`, a: appAdvice(f, focusShort) },
    { q: `What is ${f.name}'s EIN?`, a: `${f.name}'s EIN (employer identification number) is ${f.ein}. You can use it to look up the organization on the IRS Tax Exempt Organization Search or on ProPublica Nonprofit Explorer.` },
  ];
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })) };
  const crumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Good Circles', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE}/resources/` }, { '@type': 'ListItem', position: 3, name: 'Funders', item: `${SITE}/resources/funders/` }, { '@type': 'ListItem', position: 4, name: stname, item: `${SITE}/resources/funders/${stslug}/` }, { '@type': 'ListItem', position: 5, name: f.name, item: canon } ] };
  const factRows = [
    ['Type', f.foundationLabel || focusShort],
    ['Focus (NTEE)', `${focusShort}${f.ntee ? ` (${f.ntee})` : ''}`],
    ['Location', `${f.city}, ${f.state}`],
    ['Total assets', money(fy.assets)],
    ['Annual revenue', money(fy.revenue)],
    ['Annual expenses', money(fy.expenses)],
    ['Fiscal year', fy.year || '—'],
    ['EIN', f.ein],
  ].map((r) => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td></tr>`).join('');
  const hist = f.filings.map((x) => `<tr><td>${x.year}</td><td style="text-align:right">${money(x.revenue)}</td><td style="text-align:right">${money(x.expenses)}</td><td style="text-align:right">${money(x.assets)}</td></tr>`).join('');
  const faqHtml = faqs.map((x) => `<div class="faq"><h4>${esc(x.q)}</h4><p>${esc(x.a)}</p></div>`).join('\n');
  return head(title, canon, desc, [ngo, faqLd, crumb]) + `
<div class="wrap"><header class="hero">
  <div class="crumb"><a href="/resources/">Resources</a> › <a href="/resources/funders/">Funders</a> › <a href="/resources/funders/${stslug}/">${stname}</a> › ${esc(f.name)}</div>
  <div class="eyebrow">${esc(stname)} · Funder profile</div>
  <h1>${esc(f.name)}</h1>
  <div class="dateline">${esc(f.city)}, ${f.state} · EIN ${esc(f.ein)} · IRS Form 990 data (FY${fy.year})</div>
</header>
<article>
  <div class="answer"><b>${esc(f.name)}</b> is ${esc(tier(fy.assets))} ${esc(focusShort)} in ${esc(f.city)}, ${esc(f.state)}. Based on its most recent public IRS Form 990 (fiscal year ${fy.year}), it reported about <b>${money(fy.assets)}</b> in total assets and <b>${money(fy.expenses)}</b> in annual expenses. This free profile summarizes what the public record shows and how to research it further.</div>

  <h2 id="key-facts">Key facts</h2>
  <table class="tbl"><tbody>${factRows}</tbody></table>

  <h2 id="overview">About ${esc(f.name)}</h2>
  <p>${esc(f.name)} is registered with the IRS as ${esc(f.foundationLabel ? f.foundationLabel.toLowerCase() : focusShort)} and classified under NTEE code <b>${esc(f.ntee || 'T (philanthropy)')}</b> — ${esc(focusLong)}. It is based in ${esc(f.city)}, ${esc(f.state)}. Foundations like this are an important part of the local funding landscape; reviewing a funder's Form 990 is the best way to see what and whom it actually funds before you reach out.</p>

  <h2 id="apply">Does ${esc(f.name)} accept applications?</h2>
  <p>${esc(appAdvice(f, focusShort))}</p>

  <h2 id="financials">IRS Form 990 financial history</h2>
  <table class="tbl"><thead><tr><th>Fiscal year</th><th style="text-align:right">Revenue</th><th style="text-align:right">Expenses</th><th style="text-align:right">Total assets</th></tr></thead><tbody>${hist}</tbody></table>
  <p class="muted">Figures from the organization's public IRS Form 990 filings (most recent first). For a grantmaking foundation, annual expenses largely reflect grants made plus operating costs.</p>

  <div class="gcbox"><span class="tagpill">Funding that doesn't depend on a grant cycle</span><h3>Diversify beyond grants with recurring, unrestricted support</h3><p>Researching funders is smart — but grants are competitive and slow. <b>Good Circles</b> builds a base of <b>recurring, unrestricted</b> funding alongside your grant strategy: supporters pick your cause once, then a share of their everyday local spending funds you automatically — about <b>10% of each merchant's net profit</b>, conservatively <b>~$72 per active supporter per year</b> (an estimate), free for your nonprofit. Good Circles launches in ${esc(stname === 'Mississippi' ? 'Mississippi' : 'the South')} first (September 2026).</p><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits">Claim a Founding Nonprofit spot →</a></div>

  ${ATTRIB.replace('REPLACE_PP', esc(f.ppUrl))}

  ${SHARE}

  <h2 id="faq">FAQ</h2>
  ${faqHtml}

  <div class="related"><b>Related:</b><br>
    <a href="/resources/funders/${stslug}/">All ${esc(stname)} foundations</a>
    <a href="/resources/grants/funder-directory/">Curated funder directory</a>
    <a href="/resources/grants/how-to-write-a-grant-proposal/">How to write a grant proposal</a>
    <a href="/resources/grants/grant-prospect-research/">Grant prospect research</a>
  </div>
</article></div>` + FOOT;
}
function appAdvice(f, focusShort) {
  const fc = f.foundationCode;
  if (['T31', 'T30'].includes((f.ntee || '').slice(0, 3)) || ['15', '16', '17', '18'].includes(fc))
    return `As a ${focusShort}, ${f.name} is more likely than a private foundation to accept applications or run open grant programs — but policies vary. Check its website or recent Form 990 for an application process before applying.`;
  return `${f.name} appears to be a private foundation. Many private foundations make grants by invitation and do not accept unsolicited proposals, while others do — the public record alone can't confirm it. Review the funder's website and recent Form 990 (linked below) to see whether and how it accepts applications before reaching out.`;
}

function renderStateIndex(st, list) {
  const stslug = STATES[st]; const stname = STATEN[st];
  const canon = `${SITE}/resources/funders/${stslug}/`;
  const title = `${stname} Grantmaking Foundations — ${list.length} Funders & 990 Data · Good Circles`;
  const desc = `A free, searchable directory of ${list.length} ${stname} grantmaking foundations with IRS Form 990 financials — assets, revenue, focus area, and location. Research funders for your nonprofit.`;
  const totalAssets = list.reduce((s, f) => s + (Number(f.filings[0]?.assets) || 0), 0);
  const collection = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${stname} Grantmaking Foundations`, description: desc, url: canon, isPartOf: { '@type': 'WebSite', name: 'Good Circles', url: SITE } };
  const dataset = { '@context': 'https://schema.org', '@type': 'Dataset', name: `${stname} grantmaking foundations (IRS 990 data)`, description: `${list.length} grantmaking foundations and philanthropic organizations in ${stname}, with IRS Form 990 financials.`, url: canon, isAccessibleForFree: true, creator: { '@type': 'Organization', name: 'Good Circles' }, keywords: [`${stname} foundations`, `${stname} grants`, 'grantmaking foundations', 'nonprofit funders', 'IRS 990'], dateModified: DATE };
  const crumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Good Circles', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE}/resources/` }, { '@type': 'ListItem', position: 3, name: 'Funders', item: `${SITE}/resources/funders/` }, { '@type': 'ListItem', position: 4, name: stname, item: canon } ] };
  const rows = list.map((f) => { const fy = f.filings[0] || {}; const [fs] = focus(f.ntee); return `<tr><td><a href="/resources/funders/${stslug}/${f.slug}/">${esc(f.name)}</a></td><td>${esc(f.city)}</td><td>${esc(fs)}</td><td style="text-align:right" data-v="${Number(fy.assets) || 0}">${money(fy.assets)}</td></tr>`; }).join('\n');
  return head(title, canon, desc, [collection, dataset, crumb]) + `
<div class="wrap"><header class="hero">
  <div class="crumb"><a href="/resources/">Resources</a> › <a href="/resources/funders/">Funders</a> › ${stname}</div>
  <div class="eyebrow">${stname} · Funder database</div>
  <h1>${stname} grantmaking foundations</h1>
  <div class="dateline">${list.length} foundations · IRS Form 990 data · ${money(totalAssets)} in combined assets</div>
</header>
<article>
  <div class="answer">A free, searchable directory of <b>${list.length} grantmaking foundations and philanthropic organizations in ${stname}</b>, each with its IRS Form 990 financials. Click any funder for a full profile — assets, revenue, focus, and how to research it. This complements our <a href="/resources/grants/funder-directory/">curated funder directory</a> (which adds application details for select funders).</div>
  <input type="search" id="ff" placeholder="Filter ${stname} funders by name, city, or focus…" aria-label="Filter funders" style="width:100%;font-family:'Fira Sans';font-size:1rem;border:2px solid var(--line);border-radius:12px;padding:11px 14px;color:var(--ink);box-sizing:border-box;margin:14px 0 8px">
  <p id="ffc" style="font-family:'Montserrat';font-weight:800;color:var(--purple);font-size:.84rem;margin:0 0 4px"></p>
  <table class="tbl"><thead><tr><th>Foundation</th><th>City</th><th>Focus</th><th style="text-align:right">Assets</th></tr></thead><tbody id="fft">${rows}</tbody></table>

  <div class="gcbox" style="margin-top:18px"><span class="tagpill">Free for ${stname} nonprofits</span><h3>Build recurring, unrestricted funding alongside grants</h3><p><b>Good Circles</b> helps ${stname} nonprofits earn from everyday local spending — about 10% of each merchant's net profit, conservatively ~$72 per active supporter per year (an estimate), recurring and free for your nonprofit.</p><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits">See how it works →</a></div>

  ${SHARE}
  <div class="related"><b>Related:</b><br>
    <a href="/resources/funders/">All states</a>
    <a href="/resources/grants/funder-directory/">Curated funder directory</a>
    <a href="/resources/grants/how-to-find-grants/">How to find grants</a>
    ${st === 'MS' ? '<a href="/resources/states/mississippi/">Mississippi nonprofit playbook</a>' : '<a href="/resources/states/">State-specific guides</a>'}
  </div>
</article></div>
<script>
(function(){var q=document.getElementById('ff'),c=document.getElementById('ffc');
var rows=[].slice.call(document.querySelectorAll('#fft tr'));
function run(){var t=(q.value||'').toLowerCase(),n=0;rows.forEach(function(r){var ok=r.textContent.toLowerCase().indexOf(t)>=0;r.style.display=ok?'':'none';if(ok)n++;});c.textContent=n+' of '+rows.length+' funders';}
q.addEventListener('input',run);run();})();
</script>
${FOOT}`;
}

function renderHub(byState, total) {
  const canon = `${SITE}/resources/funders/`;
  const title = `Nonprofit Funder Database — ${total} Grantmaking Foundations (IRS 990 Data) · Good Circles`;
  const desc = `A free database of ${total} grantmaking foundations across the Deep South — Mississippi, Alabama, Arkansas, Louisiana, and Tennessee — with IRS Form 990 financials, focus areas, and research links.`;
  const collection = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Nonprofit Funder Database', description: desc, url: canon, isPartOf: { '@type': 'WebSite', name: 'Good Circles', url: SITE } };
  const dataset = { '@context': 'https://schema.org', '@type': 'Dataset', name: 'Deep South grantmaking foundations (IRS 990 data)', description: desc, url: canon, isAccessibleForFree: true, creator: { '@type': 'Organization', name: 'Good Circles' }, keywords: ['grantmaking foundations', 'nonprofit funders', 'Mississippi foundations', 'Deep South grants', 'IRS 990'], dateModified: DATE };
  const crumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [ { '@type': 'ListItem', position: 1, name: 'Good Circles', item: SITE }, { '@type': 'ListItem', position: 2, name: 'Resources', item: `${SITE}/resources/` }, { '@type': 'ListItem', position: 3, name: 'Funders', item: canon } ] };
  const cards = Object.keys(STATES).filter((st) => byState[st]).map((st) => `<a class="dlcard" href="/resources/funders/${STATES[st]}/"><div class="ic">${st}</div><div><h4>${STATEN[st]} foundations →</h4><p>${byState[st]} grantmaking foundations in ${STATEN[st]} with IRS Form 990 data.</p></div></a>`).join('\n');
  return head(title, canon, desc, [collection, dataset, crumb]) + `
<div class="wrap"><header class="hero">
  <div class="crumb"><a href="/resources/">Resources</a> › Funders</div>
  <div class="eyebrow">Funder research database</div>
  <h1>Nonprofit funder database</h1>
  <div class="dateline">${total} grantmaking foundations · IRS Form 990 data · free, no login</div>
</header>
<article>
  <div class="answer">A free, searchable database of <b>${total} grantmaking foundations</b> across the Deep South — built entirely from public <b>IRS Form 990</b> records. Each funder has a profile with its financials, focus area, location, and links to research it. Looking to apply? Pair this with our <a href="/resources/grants/funder-directory/">curated funder directory</a> (application details for select funders) and the <a href="/resources/grants/how-to-find-grants/">how-to-find-grants guide</a>.</div>
  <h2 id="states">Browse foundations by state</h2>
${cards}
  <div class="callout"><h4>How this database works</h4><p style="margin:0">Built from the free <a href="https://projects.propublica.org/nonprofits/" target="_blank" rel="noopener">ProPublica Nonprofit Explorer</a> API (public IRS Form 990 data). Each profile is a research starting point, not an endorsement or application portal — always confirm current priorities and how to apply with the funder. Refreshed periodically. <span class="muted">Last verified ${DATE}.</span></p></div>

  <div class="gcbox"><span class="tagpill">Free for nonprofits</span><h3>Diversify beyond grants with Good Circles</h3><p>Supporters pick your cause once, then a share of their everyday local spending funds you automatically — about 10% of each merchant's net profit, conservatively ~$72 per active supporter per year (an estimate), recurring and free for your nonprofit.</p><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits">Claim a Founding Nonprofit spot →</a></div>

  ${SHARE}
  <div class="related"><b>Related:</b><br>
    <a href="/resources/grants/funder-directory/">Curated funder directory</a>
    <a href="/resources/grants/">All grant guides</a>
    <a href="/resources/grants/how-to-get-grant-ready/">Get grant-ready</a>
  </div>
</article></div>` + FOOT;
}

// ---- build ----
const funders = JSON.parse(readFileSync(join(HERE, 'funders-data.json'), 'utf8')).filter((f) => STATES[f.state] && f.filings && f.filings.length);
// Normalize whitespace in IRS names/cities (fixed-width source often has double spaces),
// so FAQ JSON-LD text matches the gate's whitespace-collapsed visible text.
for (const f of funders) { f.name = String(f.name).replace(/\s+/g, ' ').trim(); f.city = String(f.city || '').replace(/\s+/g, ' ').trim(); }
// assign unique slugs within each state
const byStateList = {};
for (const f of funders) { (byStateList[f.state] = byStateList[f.state] || []).push(f); }
let n = 0;
const byStateCount = {};
for (const st of Object.keys(byStateList)) {
  const list = byStateList[st].sort((a, b) => (Number(b.filings[0]?.assets) || 0) - (Number(a.filings[0]?.assets) || 0));
  const used = new Set();
  for (const f of list) { let s = slug(f.name) || 'funder'; let i = 2; while (used.has(s)) s = slug(f.name) + '-' + i++; used.add(s); f.slug = s; }
  for (const f of list) { const dir = join(PUBLIC, 'resources', 'funders', STATES[st], f.slug); mkdirSync(dir, { recursive: true }); writeFileSync(join(dir, 'index.html'), renderFunder(f)); n++; }
  const sdir = join(PUBLIC, 'resources', 'funders', STATES[st]); mkdirSync(sdir, { recursive: true }); writeFileSync(join(sdir, 'index.html'), renderStateIndex(st, list));
  byStateCount[st] = list.length;
}
const hubDir = join(PUBLIC, 'resources', 'funders'); mkdirSync(hubDir, { recursive: true }); writeFileSync(join(hubDir, 'index.html'), renderHub(byStateCount, n));
console.log(`built ${n} funder profiles + ${Object.keys(byStateCount).length} state indexes + hub. By state:`, byStateCount);

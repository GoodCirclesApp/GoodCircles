// E-E-A-T deployment: injects an author (+ optional expert-reviewer) byline into
// every sourced editorial guide, and upgrades the Article author schema to point at
// the editorial-standards page. Idempotent (marker-delimited) so it can be re-run
// after assigning reviewers. Run locally, then `npm run build` and commit.
//
// TO ASSIGN A NAMED EXPERT REVIEWER: add an entry to REVIEWERS keyed by the guide's
// path, create the reviewer's profile page (Person schema) under /resources/experts/<slug>/,
// then re-run this script and `npm run build`. NEVER add a reviewer who has not
// actually reviewed the guide — fabricated review bylines are an E-E-A-T violation.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('../public/resources/', import.meta.url));
const STANDARDS = '/resources/editorial-standards/';

// path -> { name, cred, url (profile), date } — populate as real experts review guides.
const REVIEWERS = {
  // '/resources/governance-compliance/form-990-explained/': { name: 'Jane Doe', cred: 'CPA', url: '/resources/experts/jane-doe/', date: '2026-07-01' },
};

function walk(d, o = []) { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p, o); else if (n === 'index.html') o.push(p); } return o; }

const files = walk(ROOT);
let injected = 0, reviewed = 0;
for (const f of files) {
  let html = readFileSync(f, 'utf8');
  // Only editorial prose guides: an Article with the Good Circles author + a Sources block + an answer box.
  const isGuide = html.includes('"@type":"Article"') && /"author":\{"@type":"Organization","name":"Good Circles"/.test(html)
    && (/Sources &amp; tools/.test(html) || /Fuentes y herramientas/.test(html)) && html.includes('<div class="answer">');
  // Remove any prior byline (idempotent re-run).
  html = html.replace(/<!--byline-->[\s\S]*?<!--\/byline-->\n*\s*/g, '');
  if (!isGuide) { writeFileSync(f, html); continue; }

  const es = /<html lang="es"/.test(html);
  const canon = (html.match(/rel="canonical" href="https:\/\/goodcircles\.org([^"]*)"/) || [])[1] || '';
  const dateM = html.match(/Last verified (\d{4}-\d{2}-\d{2})/) || html.match(/Verificado por última vez (\d{4}-\d{2}-\d{2})/);
  const date = dateM ? dateM[1] : '';
  const rev = REVIEWERS[canon];

  let byline;
  if (es) {
    byline = `<!--byline--><div class="byline"><span class="byl-ck">✓</span> Por el <a href="${STANDARDS}">equipo editorial de Good Circles</a> · verificado con fuentes primarias`
      + (rev ? ` · <span class="byl-rev">Revisado por <a href="${rev.url}">${rev.name}, ${rev.cred}</a></span>` : '')
      + (date ? ` · Verificado por última vez ${date}` : '') + `</div><!--/byline-->\n\n  `;
  } else {
    byline = `<!--byline--><div class="byline"><span class="byl-ck">✓</span> By the <a href="${STANDARDS}">Good Circles editorial team</a> · fact-checked against primary sources`
      + (rev ? ` · <span class="byl-rev">Reviewed by <a href="${rev.url}">${rev.name}, ${rev.cred}</a></span>` : '')
      + (date ? ` · Last verified ${date}` : '') + `</div><!--/byline-->\n\n  `;
  }
  // Insert the byline right before the opening answer box.
  html = html.replace('<div class="answer">', byline + '<div class="answer">');
  // Upgrade the Article author to the credited editorial team (author page = editorial standards).
  html = html.replace(
    /"author":\{"@type":"Organization","name":"Good Circles"\}/g,
    `"author":{"@type":"Organization","name":"Good Circles Editorial Team","url":"https://goodcircles.org${STANDARDS}"}`
  );
  // When a named reviewer exists, add them to the Article JSON-LD as a contributor.
  if (rev) {
    html = html.replace(
      /("@type":"Article",)/,
      `$1"contributor":{"@type":"Person","name":"${rev.name.replace(/"/g, '')}","jobTitle":"${rev.cred.replace(/"/g, '')}","url":"https://goodcircles.org${rev.url}"},`
    );
    reviewed++;
  }
  writeFileSync(f, html);
  injected++;
}
console.log(`E-E-A-T bylines: injected ${injected} guides (${reviewed} with a named reviewer).`);

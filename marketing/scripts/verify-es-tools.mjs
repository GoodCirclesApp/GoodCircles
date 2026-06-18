#!/usr/bin/env node
// verify-es-tools.mjs — prove each Spanish tool's calculator is logic-identical to the English
// one: tokenize both inline scripts and assert the CODE segments (everything outside string
// literals) are byte-for-byte identical, the string-literal COUNT matches, and the set of
// DOM ids the script binds is unchanged. Pure structural proof — no execution needed.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const TOOLS = fileURLToPath(new URL('../public/resources/tools/', import.meta.url));
const SLUGS = ['attribution-vs-contribution-aid','board-composition-matrix','donor-retention-ltv-calculator','functional-expense-allocator','gift-range-chart-generator','grant-readiness-assessment','indirect-cost-calculator','lobbying-limit-501h-calculator','operating-reserve-calculator','passive-funding-calculator','public-support-test-calculator','wcag-accessibility-quick-audit'];

function tokenize(code) {
  const segs = []; let i = 0, last = 0; const n = code.length;
  const pushCode = (a, b) => { if (b > a) segs.push({ type: 'code', text: code.slice(a, b) }); };
  while (i < n) {
    const c = code[i];
    if (c === '"' || c === "'" || c === '`') {
      pushCode(last, i); const q = c; const start = i; i++;
      while (i < n) { if (code[i] === '\\') { i += 2; continue; } if (code[i] === q) { i++; break; } i++; }
      segs.push({ type: 'str', text: code.slice(start, i) }); last = i;
    } else if (c === '/' && code[i + 1] === '/') { while (i < n && code[i] !== '\n') i++; }
    else if (c === '/' && code[i + 1] === '*') { i += 2; while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++; i += 2; }
    else i++;
  }
  pushCode(last, n);
  return segs;
}
const inlineScript = (html) => (html.match(/<script>([\s\S]*?)<\/script>/) || [])[1] || '';
const ids = (s) => [...s.matchAll(/(?:getElementById|\$)\(\s*['"]([A-Za-z0-9_-]+)['"]\s*\)/g)].map((m) => m[1]).sort();
const code = (s) => tokenize(s).filter((x) => x.type === 'code').map((x) => x.text).join('\x01');
const strs = (s) => tokenize(s).filter((x) => x.type === 'str');

let allPass = true;
for (const slug of SLUGS) {
  const enF = join(TOOLS, slug, 'index.html'), esF = join(TOOLS, slug, 'es', 'index.html');
  if (!existsSync(esF)) { console.log(`✗ ${slug}: ES page missing`); allPass = false; continue; }
  const en = inlineScript(readFileSync(enF, 'utf8')), es = inlineScript(readFileSync(esF, 'utf8'));
  const codeEq = code(en) === code(es);
  const enS = strs(en), esS = strs(es);
  const countEq = enS.length === esS.length;
  const idsEq = JSON.stringify(ids(en)) === JSON.stringify(ids(es));
  // how many string literals actually changed (= were translated)
  let changed = 0; for (let i = 0; i < Math.min(enS.length, esS.length); i++) if (enS[i].text !== esS[i].text) changed++;
  const pass = codeEq && countEq && idsEq;
  allPass = allPass && pass;
  console.log(`${pass ? '✓' : '✗'} ${slug.padEnd(34)} code-identical=${codeEq} literals=${enS.length}(${countEq ? 'eq' : 'DIFF ' + esS.length}) translated=${changed} ids=${idsEq ? 'eq' : 'DIFF'}`);
  if (!codeEq) {
    const ec = code(en).split('\x01'), sc = code(es).split('\x01');
    for (let i = 0; i < Math.max(ec.length, sc.length); i++) if (ec[i] !== sc[i]) { console.log(`    first code diff @seg ${i}:\n    EN: ${JSON.stringify((ec[i] || '').slice(0, 90))}\n    ES: ${JSON.stringify((sc[i] || '').slice(0, 90))}`); break; }
  }
}
console.log(allPass ? '\n✓ ALL tools: calculator logic provably identical (only string literals translated)' : '\n✗ FAILURES above');
process.exit(allPass ? 0 : 1);

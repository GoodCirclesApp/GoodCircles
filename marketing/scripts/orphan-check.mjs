import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = 'dist';
function walk(d, o = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p, o);
    else if (n.endsWith('.html')) o.push(p);
  }
  return o;
}
function norm(u) {
  u = u.split('#')[0].split('?')[0];
  if (!u) return null;
  if (!/\.[a-z0-9]+$/i.test(u) && !u.endsWith('/')) u += '/';
  return u;
}
function ownPath(f) {
  let r = '/' + relative(DIST, f).split('\\').join('/');
  r = r.replace(/index\.html$/, '').replace(/\.html$/, '/');
  if (!r.endsWith('/')) r += '/';
  return r;
}

const pages = walk(DIST);
const linked = new Set();
for (const f of pages) {
  const html = readFileSync(f, 'utf8');
  const self = ownPath(f);
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const t = norm(m[1]);
    if (t && t !== self) linked.add(t);
  }
}
const sm = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
const indexable = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => norm(new URL(m[1]).pathname));
const orphans = indexable.filter((p) => !linked.has(p));
console.log('indexable pages:', indexable.length, '| internal link targets:', linked.size);
console.log('ORPHANS (indexable, not linked from any other page):', orphans.length);
orphans.forEach((o) => console.log('  ' + o));

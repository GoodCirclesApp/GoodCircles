// Normalize internal links to the canonical trailing-slash form (Ahrefs audit
// 2026-07-05: ~2,600 pages flagged for internal 301 hops). Rewrites hrefs in
// marketing source (src/**/*.astro|ts|tsx) and the static resource bundle
// (public/resources/**/*.html): "/path" -> "/path/" and
// "https://goodcircles.org/path" -> ".../path/".
// Skips: root "/", paths with a file extension (.xml/.json/.png/...), /api and
// /account (server routes), and anything containing "#" or "?".
// Usage: node scripts/normalize-trailing-slash.mjs [--check]
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CHECK = process.argv.includes('--check');

function needsSlash(path) {
  if (!path.startsWith('/')) return false;
  if (path === '/' || path.endsWith('/')) return false;
  if (path.includes('#') || path.includes('?')) return false;
  if (path.startsWith('/api') || path.startsWith('/account')) return false;
  const last = path.split('/').pop();
  if (/\.[a-z0-9]+$/i.test(last)) return false; // file, not a page route
  return true;
}

function fix(content) {
  let changes = 0;
  const norm = (p) => { changes++; return p + '/'; };
  // href="..." | href='...' | href=\"...\" (inside TS string literals)
  content = content
    .replace(/(href=\\?")(\/[^"#?\\]*)(\\?")/g, (m, a, p, b) => (needsSlash(p) ? a + norm(p) + b : m))
    .replace(/(href=\\?')(\/[^'#?\\]*)(\\?')/g, (m, a, p, b) => (needsSlash(p) ? a + norm(p) + b : m))
    // object-literal props: href: '/path' (data arrays for nav/cards/related)
    .replace(/(href:\s*)(['"])(\/[^'"#?]*)(\2)/g, (m, a, q, p) => (needsSlash(p) ? a + q + norm(p) + q : m))
    // component props like secondaryHref="/how-it-works"
    .replace(/((?:secondaryHref|ctaHref)=)(['"])(\/[^'"#?]*)(\2)/g, (m, a, q, p) => (needsSlash(p) ? a + q + norm(p) + q : m))
    // absolute internal URLs in href/link contexts
    .replace(/(https:\/\/goodcircles\.org)(\/[A-Za-z0-9\-/]*[A-Za-z0-9-])(?=["'\\)\s<])/g, (m, host, p) =>
      needsSlash(p) ? host + norm(p) : m
    );
  return { content, changes };
}

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(name))) out.push(p);
  }
  return out;
}

const files = [
  ...walk(join(ROOT, 'src'), ['.astro', '.ts', '.tsx']),
  ...walk(join(ROOT, 'public', 'resources'), ['.html']),
];

let totalChanges = 0;
let touched = 0;
for (const f of files) {
  const before = readFileSync(f, 'utf8');
  const { content, changes } = fix(before);
  if (changes) {
    totalChanges += changes;
    touched++;
    if (!CHECK) writeFileSync(f, content);
    else console.log(`${f.replace(ROOT, '')}: ${changes}`);
  }
}
console.log(`${CHECK ? '[check] ' : ''}${totalChanges} link(s) normalized across ${touched} file(s) (${files.length} scanned).`);

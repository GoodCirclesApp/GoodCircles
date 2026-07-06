// One-shot dist auditor for the Ahrefs fix sprint (2026-07-05): reports
// non-trailing-slash internal hrefs, internal 404 targets, support.goodcircles.org
// links, short meta descriptions on indexable pages, and JSON-LD required-property
// problems. Read-only; used to verify fixes before commit.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const pages = [];
(function walk(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (n.endsWith('.html')) pages.push(p);
  }
})(DIST);

const noSlash = {}, missing = {}, support = [], shortMeta = [], ldErrors = [];
const dec = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  const rel = relative(DIST, p).split('\\').join('/');
  const checkHref = (h, tag) => {
    if (h === '/' || h.startsWith('/api') || h.startsWith('/account')) return;
    const last = h.split('/').pop();
    if (/\.[a-z0-9]+$/i.test(last)) {
      if (!existsSync(join(DIST, h))) (missing[tag + h] = missing[tag + h] || []).push(rel);
      return;
    }
    if (!h.endsWith('/')) (noSlash[tag + h] = noSlash[tag + h] || []).push(rel);
    else if (!existsSync(join(DIST, h, 'index.html'))) (missing[tag + h] = missing[tag + h] || []).push(rel);
  };
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) checkHref(m[1], '');
  for (const m of html.matchAll(/href="https:\/\/goodcircles\.org(\/[^"#?]*)"/g)) checkHref(m[1], 'ABS ');
  if (html.includes('support.goodcircles.org')) support.push(rel);

  const noindex = /name="robots" content="noindex/.test(html);
  const desc = dec((html.match(/name="description" content="([^"]*)"/) || [])[1] || '');
  if (!noindex && rel !== '404.html' && desc.length < 70) shortMeta.push(desc.length + ' ' + rel);

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let ld;
    try { ld = JSON.parse(m[1]); } catch { ldErrors.push('PARSE ' + rel); continue; }
    const errs = [];
    const check = (o) => {
      if (!o || typeof o !== 'object') return;
      const t = o['@type'];
      if (t === 'FAQPage' && !(Array.isArray(o.mainEntity) && o.mainEntity.length)) errs.push('FAQPage missing mainEntity');
      if (t === 'Question' && (!o.name || !o.acceptedAnswer)) errs.push('Question missing name/acceptedAnswer');
      if (t === 'Article' && !o.headline) errs.push('Article missing headline');
      if (t === 'BreadcrumbList' && !(Array.isArray(o.itemListElement) && o.itemListElement.length)) errs.push('BreadcrumbList missing itemListElement');
      if (t === 'ListItem' && (o.position == null || !o.name)) errs.push('ListItem missing position/name');
      if (t === 'HowTo' && (!o.name || !o.step)) errs.push('HowTo missing name/step');
      if (t === 'HowToStep' && !o.name && !o.text) errs.push('HowToStep missing name/text');
      if (t === 'Dataset' && (!o.name || !o.description)) errs.push('Dataset missing name/description');
      if (t === 'Organization' && !o.name) errs.push('Organization missing name');
      if (t === 'Person' && !o.name) errs.push('Person missing name');
      if (t === 'WebSite' && (!o.name || !o.url)) errs.push('WebSite missing name/url');
      if (t === 'NGO' && !o.name) errs.push('NGO missing name');
      if (t === 'Course' && (!o.name || !o.description || !o.provider)) errs.push('Course missing name/description/provider');
      if (t === 'QAPage' && !o.mainEntity) errs.push('QAPage missing mainEntity');
      if (t === 'Answer' && !o.text) errs.push('Answer missing text');
      if (t === 'ImageObject' && !o.url && !o.contentUrl) errs.push('ImageObject missing url');
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (Array.isArray(v)) v.forEach(check);
        else if (v && typeof v === 'object') check(v);
      }
    };
    check(ld);
    if (errs.length) ldErrors.push(rel + ': ' + [...new Set(errs)].join('; '));
  }
}

const top = (o, n) =>
  Object.entries(o).sort((a, b) => b[1].length - a[1].length).slice(0, n)
    .map(([k, v]) => `${k} (${v.length} pages, e.g. ${v[0]})`);
console.log('== non-trailing-slash internal hrefs:', Object.keys(noSlash).length);
console.log(top(noSlash, 15).join('\n'));
console.log('== missing internal targets (404s):', Object.keys(missing).length);
console.log(top(missing, 15).join('\n'));
console.log('== pages linking support.goodcircles.org:', support.length);
console.log(support.slice(0, 5).join('\n'));
console.log('== short metas (<70, indexable):', shortMeta.length);
console.log(shortMeta.join('\n'));
console.log('== JSON-LD issues:', ldErrors.length);
console.log([...new Set(ldErrors)].slice(0, 25).join('\n'));

#!/usr/bin/env node
// _build_es_batch3.mjs — assemble Spanish counterparts for batch-3 guides from the
// structured translations in scripts/.es-batch3.json, and inject hreflang alternates
// into the English originals. One-off (re-runnable) builder for §6 deeper localization.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const RES = fileURLToPath(new URL('../public/resources/', import.meta.url));
const DATA = JSON.parse(readFileSync(fileURLToPath(new URL('./.es-batch3.json', import.meta.url)), 'utf8')).result;
const DATE = '2026-06-17';
const DATE_ES = '17 de junio de 2026';
const ORIGIN = 'https://goodcircles.org';

const PILLAR = {
  'start-a-nonprofit': 'Crear una organización',
  'governance-compliance': 'Gobernanza y cumplimiento',
  'operations': 'Operaciones y finanzas',
  'fundraising': 'Recaudación de fondos',
  'program-design': 'Diseño de programas',
  'marketing': 'Marketing y comunicaciones',
  'passive-funding': 'Financiación pasiva',
};

// --- text helpers -----------------------------------------------------------
const ENT = (s) => String(s == null ? '' : s)
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#0?39;/g, "'").replace(/&#x27;/gi, "'").replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&');                       // decode entities the model added
const escText = (s) => ENT(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => escText(s).replace(/"/g, '&quot;');
const asHtml = (s) => ENT(s);                    // decode -> use as raw inline HTML
const stripTags = (s) => ENT(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const jsonld = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

const SHAREBAR = '<div class="sharebar"><span class="lbl">Compartir</span><a href="javascript:void(0)" onclick="gcShare(\'facebook\')" aria-label="Compartir en Facebook"><svg viewBox="0 0 24 24"><path d="M13 22v-8h3l1-4h-4V8c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v3H6v4h3v8z"/></svg>Facebook</a><a href="javascript:void(0)" onclick="gcShare(\'x\')" aria-label="Compartir en X"><svg viewBox="0 0 24 24"><path d="M18 2h3l-7 8 8 12h-6l-5-7-6 7H2l8-9L2 2h6l4 6zm-1 18h2L8 4H6z"/></svg>X</a><a href="javascript:void(0)" onclick="gcShare(\'linkedin\')" aria-label="Compartir en LinkedIn"><svg viewBox="0 0 24 24"><path d="M4 4a2 2 0 110 4 2 2 0 010-4zM3 9h3v12H3zM9 9h3v2c.5-1 2-2 4-2 3 0 4 2 4 5v7h-3v-6c0-2-1-3-2-3s-2 1-2 3v6H9z"/></svg>LinkedIn</a><a href="javascript:void(0)" onclick="gcShare(\'email\')" aria-label="Compartir por correo"><svg viewBox="0 0 24 24"><path d="M2 5h20v14H2zm2 2v.5l8 5 8-5V7l-8 5z"/></svg>Correo</a><button onclick="gcCopy(this)" aria-label="Copiar enlace"><svg viewBox="0 0 24 24"><path d="M9 7h9v12H9zM5 3h9v2H7v10H5z"/></svg><span class="t">Copiar enlace</span></button></div>';

// Unwrap internal /resources/... links whose target does not exist (model hallucinations).
function neutralizeBrokenLinks(html) {
  return html.replace(/<a\s+href="(\/resources\/[^"#?]*?)"[^>]*>(.*?)<\/a>/gis, (m, href, label) => {
    if (href === '/resources/es/') return m;               // hub is built separately this run
    const rel = href.replace(/^\//, '').replace(/\/$/, '');
    const file = join(RES, rel.replace(/^resources\//, ''), 'index.html');
    return existsSync(file) ? m : label;                   // keep if resolves, else drop the link
  });
}

let built = 0, hreflanged = 0;
for (const { slug, content: c } of DATA) {
  const parts = slug.replace(/^\/resources\//, '').replace(/\/$/, '').split('/');
  const pillar = parts[0];
  const pillarEs = PILLAR[pillar] || pillar;
  const enUrl = ORIGIN + slug;
  const esUrl = enUrl + 'es/';
  const title = `${ENT(c.h1)} · Good Circles`;

  // ---- JSON-LD ----
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', inLanguage: 'es',
    headline: stripTags(c.h1), description: stripTags(c.metaDescription),
    datePublished: DATE, dateModified: DATE,
    author: { '@type': 'Organization', name: 'Good Circles Editorial Team', url: `${ORIGIN}/resources/editorial-standards/` },
    publisher: { '@type': 'Organization', name: 'Good Circles', logo: { '@type': 'ImageObject', url: `${ORIGIN}/resources/og.png` } },
    mainEntityOfPage: esUrl,
  };
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'es',
    mainEntity: c.faqs.map((f) => ({ '@type': 'Question', name: stripTags(f.q), acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) } })),
  };
  const crumbLd = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Good Circles', item: ORIGIN },
      { '@type': 'ListItem', position: 2, name: 'Recursos', item: `${ORIGIN}/resources/` },
      { '@type': 'ListItem', position: 3, name: pillarEs, item: `${ORIGIN}/resources/${pillar}/` },
      { '@type': 'ListItem', position: 4, name: stripTags(c.crumbLeaf), item: esUrl },
    ],
  };

  // ---- TOC ----
  const toc = c.toc.map((t) => `  <li><a href="#${t.id}">${escText(t.label)}</a></li>`).join('\n')
    + '\n  <li><a href="#faq">Preguntas frecuentes</a></li>';

  // ---- sections ----
  const sections = c.sections.map((s) => `  <h2 id="${s.id}">${escText(s.h2)}</h2>\n${asHtml(s.html)}`).join('\n\n');

  // ---- sources ----
  const free = c.freeResources.map((r) => `<li><a href="${escAttr(r.url)}" target="_blank" rel="noopener">${escText(r.name)}</a> — ${escText(r.what)}</li>`).join('');
  const paid = (c.paidResources || []).map((r) => `<li><a href="${escAttr(r.url)}" target="_blank" rel="noopener">${escText(r.name)}</a> — ${escText(r.what)} <i>Vale la pena cuando ${escText(r.worthItWhen)}</i></li>`).join('');
  const paidBlock = paid ? `\n<p style="font-weight:800;margin:10px 0 2px">De pago — opcionales que ahorran trabajo</p>\n<ul>${paid}</ul>` : '';

  // ---- FAQ ----
  const faqHtml = c.faqs.map((f) => `<div class="faq"><h4>${escText(f.q)}</h4><p>${asHtml(f.a)}</p></div>`).join('\n');

  const cta = escText(c.gcbox.ctaLabel || 'Reclama un lugar de Organización Fundadora →');

  let html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escText(title)}</title>
<meta name="description" content="${escAttr(c.metaDescription)}">
<link rel="canonical" href="${esUrl}">
<link rel="alternate" hreflang="en" href="${enUrl}">
<link rel="alternate" hreflang="es" href="${esUrl}">
<link rel="alternate" hreflang="x-default" href="${enUrl}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(c.ogDescription)}">
<meta property="og:locale" content="es_ES">
<meta property="og:type" content="article"><meta property="og:url" content="${esUrl}"><meta property="og:image" content="${ORIGIN}/resources/og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#7851A9">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/resources/resources.css">
<script type="application/ld+json">${jsonld(article)}</script>
<script type="application/ld+json">${jsonld(faqLd)}</script>
<script type="application/ld+json">${jsonld(crumbLd)}</script>
</head><body>
<nav class="nav"><div class="wrap"><a class="brand" href="/resources/"><img src="/brand/gc-main-white.svg" alt="Good Circles"></a><div class="links"><a href="/resources/">Recursos</a><a href="/resources/${pillar}/">${escText(pillarEs)}</a><a href="${enUrl}">English</a><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits" style="padding:9px 16px">Para organizaciones</a></div></div></nav>
<div class="wrap"><header class="hero">
  <div class="crumb"><a href="/resources/">Recursos</a> › <a href="/resources/${pillar}/">${escText(pillarEs)}</a> › ${escText(c.crumbLeaf)}</div>
  <div class="eyebrow">${escText(c.eyebrow)}</div>
  <h1>${escText(c.h1)}</h1>
  <div class="dateline">Actualizado el ${DATE_ES} · Good Circles · ~${c.readMin} min de lectura · <a href="${enUrl}">Read in English</a></div>
</header>
<article>
  <div class="answer">${asHtml(c.answerHtml)}</div>

  <div class="toc"><b>Qué incluye</b>
<ol>
${toc}
</ol>
</div>

${sections}

  <div class="gcbox"><span class="tagpill">${escText(c.gcbox.tagpill)}</span><h3>${escText(c.gcbox.h3)}</h3><p>${asHtml(c.gcbox.p)}</p><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits">${cta}</a></div>

  <div class="callout"><h4>Fuentes y herramientas</h4>
<p style="font-weight:800;margin:6px 0 2px">Primero, gratis</p>
<ul>${free}</ul>${paidBlock}
<p class="muted" style="margin-top:8px">Verificado por última vez ${DATE}. Las cifras y normas cambian — verifica en la fuente antes de actuar.</p></div>

  ${SHAREBAR}

  <h2 id="faq">Preguntas frecuentes</h2>
${faqHtml}

  <div class="related"><b>Más recursos:</b><br>
  <a href="/resources/es/">Todos los recursos en español</a>
  <a href="/resources/${pillar}/">${escText(pillarEs)} (en inglés)</a>
  <a href="https://goodcircles.org/for-nonprofits">Good Circles para organizaciones</a>
</div>
</article></div>
<footer><div class="wrap">
  <div class="ftag">Ahorra. Dona. Apoya lo local.</div>
  <div class="fnav"><a href="/resources/">Recursos</a> · <a href="/resources/${pillar}/">${escText(pillarEs)}</a> · <a href="https://goodcircles.org/for-nonprofits">Para organizaciones</a> · <a href="https://goodcircles.org">goodcircles.org</a></div>
  <p class="muted">goodcircles.org · El mercado comunitario · Lanzamiento en septiembre de 2026</p>
</div></footer>
<script src="/resources/share.js"></script>
</body></html>
`;

  html = neutralizeBrokenLinks(html);

  // ---- write ES page ----
  const outDir = join(RES, slug.replace(/^\/resources\//, '').replace(/\/$/, ''), 'es');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
  built++;

  // ---- inject hreflang into the English original ----
  const enFile = join(RES, slug.replace(/^\/resources\//, '').replace(/\/$/, ''), 'index.html');
  let en = readFileSync(enFile, 'utf8');
  if (!/hreflang="es"/.test(en)) {
    const canon = `<link rel="canonical" href="${enUrl}">`;
    if (en.includes(canon)) {
      en = en.replace(canon, `${canon}\n<link rel="alternate" hreflang="en" href="${enUrl}">\n<link rel="alternate" hreflang="es" href="${esUrl}">\n<link rel="alternate" hreflang="x-default" href="${enUrl}">`);
      writeFileSync(enFile, en, 'utf8');
      hreflanged++;
    } else {
      console.warn('  ! canonical not found in', enFile);
    }
  }
}
console.log(`es-batch3: built ${built} Spanish pages, injected hreflang into ${hreflanged} English pages`);

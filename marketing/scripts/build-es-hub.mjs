#!/usr/bin/env node
// build-es-hub.mjs — generate the Spanish resources hub at /resources/es/ by scanning
// every translated guide (*/es/index.html), grouped by pillar. Also links the English
// hub (/resources/) to it via hreflang. Permanent build step — re-run after adding ES pages.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const RES = fileURLToPath(new URL('../public/resources/', import.meta.url));
const ORIGIN = 'https://goodcircles.org';
const DATE = '2026-06-17', DATE_ES = '17 de junio de 2026';

// Pillar order + Spanish display names.
const PILLARS = [
  ['start-a-nonprofit', 'Crear una organización'],
  ['governance-compliance', 'Gobernanza y cumplimiento'],
  ['grants', 'Subvenciones'],
  ['fundraising', 'Recaudación de fondos'],
  ['donor-development', 'Desarrollo de donantes'],
  ['program-design', 'Diseño de programas'],
  ['operations', 'Operaciones y finanzas'],
  ['marketing', 'Marketing y comunicaciones'],
  ['passive-funding', 'Financiación pasiva'],
  ['tools', 'Herramientas interactivas'],
  ['states', 'Guías por estado'],
];
const PNAME = Object.fromEntries(PILLARS);
const escText = (s) => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsonld = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e); const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e === 'index.html') out.push(p);
  }
  return out;
}

// Collect every ES guide page (path ends in /es/index.html), excluding the hub itself.
const HUB_DIR = join(RES, 'es');
const guides = [];
for (const file of walk(RES)) {
  const dir = file.slice(0, -'index.html'.length);
  if (!/[\\/]es[\\/]$/.test(dir)) continue;                  // only .../es/ pages
  if (join(dir).replace(/[\\/]$/, '') === HUB_DIR) continue; // skip the hub page itself
  const rel = relative(RES, dir).replace(/\\/g, '/').replace(/\/es\/?$/, '');
  if (rel === 'tools') continue;                             // the tools hub is a hub, not a guide
  const pillar = rel.split('/')[0];
  const html = readFileSync(file, 'utf8');
  const h1 = (html.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || rel;
  guides.push({ pillar, url: `/resources/${rel}/es/`, h1 });
}

// Group + order.
const byPillar = new Map();
for (const g of guides) {
  if (!byPillar.has(g.pillar)) byPillar.set(g.pillar, []);
  byPillar.get(g.pillar).push(g);
}
let cardsHtml = '';
let total = 0;
for (const [slug, name] of PILLARS) {
  const list = (byPillar.get(slug) || []).sort((a, b) => a.h1.localeCompare(b.h1, 'es'));
  if (!list.length) continue;
  total += list.length;
  const items = list.map((g) => `      <li><a href="${g.url}">${escText(g.h1)}</a></li>`).join('\n');
  const pillarHref = existsSync(join(RES, slug, 'index.html')) ? `/resources/${slug}/` : '/resources/';
  cardsHtml += `  <section class="card">
    <h2><a href="${pillarHref}">${escText(name)}</a> <span class="muted" style="font-weight:600;font-size:.8rem">(${list.length})</span></h2>
    <ul class="guidelist">
${items}
    </ul>
  </section>\n`;
}

const itemListLd = {
  '@context': 'https://schema.org', '@type': 'CollectionPage', inLanguage: 'es',
  name: 'Recursos gratuitos para organizaciones sin fines de lucro (en español)',
  description: `Guías prácticas y gratuitas en español para fundar, gobernar, financiar y hacer crecer una organización sin fines de lucro en EE. UU. ${total} guías y creciendo.`,
  url: `${ORIGIN}/resources/es/`,
  isPartOf: { '@type': 'WebSite', name: 'Good Circles', url: ORIGIN },
  mainEntity: { '@type': 'ItemList', numberOfItems: total, itemListElement: guides.slice(0, 60).map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: ORIGIN + g.url, name: g.h1 })) },
};
const crumbLd = {
  '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Good Circles', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: 'Resources', item: `${ORIGIN}/resources/` },
    { '@type': 'ListItem', position: 3, name: 'Recursos en español', item: `${ORIGIN}/resources/es/` },
  ],
};

const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Recursos en español para organizaciones sin fines de lucro · Good Circles</title>
<meta name="description" content="Guías gratuitas en español para fundar, gobernar, financiar y hacer crecer tu organización sin fines de lucro en EE. UU.: 501(c)(3), juntas, subvenciones, recaudación y más.">
<link rel="canonical" href="${ORIGIN}/resources/es/">
<link rel="alternate" hreflang="en" href="${ORIGIN}/resources/">
<link rel="alternate" hreflang="es" href="${ORIGIN}/resources/es/">
<link rel="alternate" hreflang="x-default" href="${ORIGIN}/resources/">
<meta property="og:title" content="Recursos en español para organizaciones sin fines de lucro · Good Circles">
<meta property="og:description" content="Guías gratuitas en español: cómo fundar una 501(c)(3), gobernar tu junta, conseguir subvenciones, recaudar fondos y construir ingresos duraderos.">
<meta property="og:locale" content="es_ES">
<meta property="og:type" content="website"><meta property="og:url" content="${ORIGIN}/resources/es/"><meta property="og:image" content="${ORIGIN}/resources/og.png">
<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#7851A9">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Fira+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/resources/resources.css">
<script type="application/ld+json">${jsonld(itemListLd)}</script>
<script type="application/ld+json">${jsonld(crumbLd)}</script>
</head><body>
<nav class="nav"><div class="wrap"><a class="brand" href="/resources/"><img src="/brand/gc-main-white.svg" alt="Good Circles"></a><div class="links"><a href="/resources/">Recursos</a><a href="/resources/es/">Español</a><a href="https://goodcircles.org/resources/">English</a><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits" style="padding:9px 16px">Para organizaciones</a></div></div></nav>
<div class="wrap"><header class="hero">
  <div class="crumb"><a href="/resources/">Resources</a> › Recursos en español</div>
  <div class="eyebrow">Centro de recursos · En español</div>
  <h1>Recursos gratuitos para organizaciones sin fines de lucro</h1>
  <div class="dateline">Guías prácticas en español · Good Circles · Actualizado el ${DATE_ES}</div>
  <p class="lede">Guías claras y gratuitas para <b>fundar, gobernar, financiar y hacer crecer</b> tu organización sin fines de lucro en Estados Unidos. Escritas para fundadores que recién empiezan, verificadas con fuentes primarias (IRS, estados y autoridades del sector). <a href="https://goodcircles.org/resources/">Read this hub in English →</a></p>
</header>
<article>
  <div class="answer">¿Recién empiezas? Lee primero <a href="/resources/start-a-nonprofit/how-to-start-a-nonprofit/es/">cómo iniciar una organización sin fines de lucro</a> y <a href="/resources/start-a-nonprofit/how-to-get-501c3-status/es/">cómo obtener el estatus 501(c)(3)</a>. Abajo encontrarás ${total} guías en español, organizadas por tema. Todas son gratuitas y se actualizan con regularidad.</div>

  <div class="cardgrid">
${cardsHtml}  </div>

  <div class="gcbox"><span class="tagpill">Financiación que dura</span><h3>Construye ingresos recurrentes para tu organización</h3><p>Las organizaciones nuevas se agotan persiguiendo donaciones únicas. Good Circles le da a tu organización ingresos recurrentes y sin restricciones con casi nada de tiempo del personal: los simpatizantes eligen tu causa una vez y luego una parte de su gasto local cotidiano te financia automáticamente, alrededor de <b>$72 por simpatizante activo al año</b> (estimación), y unirse es gratis. Lanzamiento en Misisipi en septiembre de 2026.</p><a class="btn btn-gold" href="https://goodcircles.org/for-nonprofits">Reclama un lugar de Organización Fundadora →</a></div>

  <div class="related"><b>Más:</b><br>
  <a href="/resources/">Centro de recursos completo (en inglés)</a>
  <a href="/resources/states/mississippi/es/">Guía de Misisipi (en español)</a>
  <a href="https://goodcircles.org/for-nonprofits">Good Circles para organizaciones</a>
</div>
</article></div>
<footer><div class="wrap">
  <div class="ftag">Ahorra. Dona. Apoya lo local.</div>
  <div class="fnav"><a href="/resources/">Recursos</a> · <a href="/resources/es/">Español</a> · <a href="https://goodcircles.org/for-nonprofits">Para organizaciones</a> · <a href="https://goodcircles.org">goodcircles.org</a></div>
  <p class="muted">goodcircles.org · El mercado comunitario · Lanzamiento en septiembre de 2026</p>
</div></footer>
</body></html>
`;

if (!existsSync(HUB_DIR)) (await import('node:fs')).mkdirSync(HUB_DIR, { recursive: true });
writeFileSync(join(HUB_DIR, 'index.html'), html, 'utf8');

// Link the English hub to the Spanish hub via hreflang.
const enHub = join(RES, 'index.html');
if (existsSync(enHub)) {
  let en = readFileSync(enHub, 'utf8');
  if (!/hreflang="es"/.test(en)) {
    const canon = (en.match(/<link rel="canonical" href="[^"]*">/) || [])[0];
    if (canon) {
      en = en.replace(canon, `${canon}\n<link rel="alternate" hreflang="en" href="${ORIGIN}/resources/">\n<link rel="alternate" hreflang="es" href="${ORIGIN}/resources/es/">\n<link rel="alternate" hreflang="x-default" href="${ORIGIN}/resources/">`);
      writeFileSync(enHub, en, 'utf8');
      console.log('es-hub: linked English hub -> Spanish hub via hreflang');
    }
  }
}
console.log(`es-hub: built /resources/es/ with ${total} guides across ${[...byPillar.keys()].length} pillars`);

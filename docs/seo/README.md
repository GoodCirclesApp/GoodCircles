# Good Circles — SEO/GEO engineering docs

The marketing site lives in **`marketing/`** (Astro 5, static output). The architecture decision
and migration plan are in [ADR-001](./ADR-001-marketing-site-architecture.md). The strategy,
copy decks, and reference page designs live outside the repo in
`Desktop/Claude deliverables/SEO&GEO/`.

## Layout

```
marketing/
├─ astro.config.mjs          site = https://goodcircles.org · sitemap integration
├─ public/                   robots.txt · _redirects (www→bare 301) · og.png · manifest · brand SVGs
└─ src/
   ├─ layouts/Base.astro     THE head manager: title/meta/canonical/OG + Organization & WebSite
   │                         JSON-LD on every page; pass page schema via the `jsonLd` prop
   ├─ layouts/Legal.astro    privacy/terms/cookies wrapper
   ├─ components/            Nav, Footer, Hero, FaqSection (zero-JS .astro)
   ├─ components/react/      interactive islands ported from the SPA
   │                         (RoleFlow = role mirror → story forms → confirmation; ImpactDemo)
   ├─ data/site.ts           SITE_URL, brand entity JSON-LD, accuracy-contract notes
   ├─ lib/api.ts             POST /api/waitlist (unchanged from landing/)
   ├─ lib/analytics.ts       GA4 sign_up event tagged by audience (no-ops without PUBLIC_GA4_ID)
   └─ pages/                 index, privacy, terms, cookies, 404
```

## Rules that must hold on every page

1. **Accuracy contract** — see ADR-001. Always "~"/"about" on the 10% savings; donation is 10% of
   the merchant's **net profit**, never of the sale price; merchants keep 89% **of profit**.
2. One `<h1>`, unique `<title>` (≤60 chars) and meta description (≤155), self-referencing
   canonical (Base does this from the `path` prop), answer-first 40–60-word opening paragraph.
3. FAQPage JSON-LD question text must equal the visible question text **character for character**
   — generate both from one array (see `FaqSection.astro`).
4. Brand is "Good Circles" (two words) in all user-visible copy and schema.
5. New routes are picked up by the sitemap automatically at build; no manual sitemap edits.

## How to work on it

```bash
cd marketing
npm install
npm run dev       # local dev
npm run build     # astro build + the SEO regression gate (scripts/check-seo.mjs)
npm run check:seo # re-run the gate against an existing dist/
```

`scripts/check-seo.mjs` fails the build if any page violates: exactly one non-empty H1,
non-empty title/description, absolute trailing-slash canonical, og:title === title, absolute
og:image, parseable JSON-LD, FAQPage questions verbatim in the visible text, no internal
`.html` links, no broken internal links, and sitemap ↔ noindex consistency. CI
(`.github/workflows/marketing-seo.yml`) runs the same gate plus Lighthouse budgets
(`lighthouserc.json`: SEO ≥ 0.95 hard, a11y ≥ 0.9 hard, perf/best-practices warn).

## Content model — how to add things

- **Add a city:** append an entry to `CITIES` in `src/data/cities.ts` (slug, name, title ≤60,
  description ≤155, badge, h1, 40–60-word `answerHtml`, a genuinely unique `introHtml` with one
  true local detail, 3 seeded nonprofits, nearby slugs, 2–3 FAQs, region). The page, breadcrumbs,
  and internal links generate automatically. It ships `noindex` and out of the sitemap until you
  set `realSeededEntries >= 6` (only REAL directory entries count — never illustrative tiles).
- **Flip a city live:** set `realSeededEntries` from live merchant/nonprofit directory data,
  replace the illustrative tiles section with real listings, and only then add `ItemList` /
  `LocalBusiness` schema (never emit LocalBusiness for placeholder tiles).
- **Add a learn article:** append to `LEARN_ARTICLES` in `src/data/learn.ts` (the `articleHtml`
  renders verbatim in the `.gc-learn` style scope; keep the answer block as the first element
  and make FAQ `<h4>` text match `faqJsonLd` exactly).
- **Add a core page:** copy the shape of `src/pages/shoppers.astro` — PageHero with an
  answer-first block, one FAQS array feeding both `FaqList` and `faqJsonLd`, one
  audience-tagged CTA (`data-cta-audience`), related-links row.
- **Add a state:** new folder under `src/pages/shop-local/[state]/` mirroring the Mississippi
  pair, a new STATE/CITIES module, and (at multi-state scale) split the sitemap per state.

## Instrumentation runbook (owner actions)

1. **GA4:** create the property, set `PUBLIC_GA4_ID` in the Netlify build environment. Events
   ship automatically: `sign_up` (audience = NEIGHBOR/MERCHANT/NONPROFIT/CDFI/MUNICIPAL or
   REQUEST_CITY) and `cta_click` (audience + page).
2. **Google Search Console:** verify the bare domain (DNS TXT is cleanest), submit
   `https://goodcircles.org/sitemap-index.xml`.
3. **Bing Webmaster Tools:** import from GSC (one click) or verify + submit the same sitemap.
4. Watch GSC for the priority clusters (report §12): "amazonsmile alternative", "shop local and
   give back", "passive fundraising", city queries.

## Environment

- `PUBLIC_GA4_ID` (optional) — GA4 measurement ID; enables analytics + signup conversion events.
- The waitlist API base is hardcoded to the Railway production URL in `src/lib/api.ts` (same as
  the old landing); override not currently needed.

## Cutover to production (owner approval required)

See ADR-001 "Migration path": flip `netlify.toml` build/publish to `marketing/`, remove the SPA
catch-all redirect, set bare-domain primary + www 301 in Netlify, submit
`https://goodcircles.org/sitemap-index.xml` to Google Search Console and Bing Webmaster Tools.

## Roadmap (per the architecture report §12)

- **PR 2 (Phase 1):** `/amazonsmile-alternative`, `/shoppers`, `/for-nonprofits`, `/for-business`,
  `/how-it-works`, `/compare/best-amazonsmile-alternatives` — copy from PageCopy/CorePages decks.
- **PR 3 (Phase 2):** programmatic `/shop-local/[state]/[city]/` engine from `src/data/cities.ts`,
  MS hub + 21 cities + `/request-your-city`; `noindex,follow` until a city has ≥6 seeded entries
  + a unique intro.
- **PR 4 (Phase 3):** `/learn` hub + 10 answer pages (Article + FAQPage schema, dated).
- **PR 5 (Phases 4–5):** entity/freshness polish; CI: Lighthouse budgets, link check, schema
  validation, build-time assert (h1 + title + canonical per route).

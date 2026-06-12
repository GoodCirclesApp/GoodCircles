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
npm run build     # static build to dist/  (the verification gate)
```

After a build, verify like a crawler (no JS): the built `dist/**/index.html` must contain the
H1, the answer-first copy, and the FAQ text. Quick check:
`grep -o '<title>.*</title>' dist/index.html` and `grep -c 'application/ld+json' dist/index.html`.

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

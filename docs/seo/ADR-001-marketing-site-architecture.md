# ADR-001: Decouple the marketing site and rebuild it static-first on Astro

**Status:** Accepted (owner approved, 2026-06-12)
**Context docs:** `Desktop/Claude deliverables/SEO&GEO/` — GoodCircles_SEO_Architecture (35-page audit + architecture), Implementation Pack, PageCopy, CorePages, CityPages, city-pages/ + learn/ reference HTML.

## Context

goodcircles.org was served by `landing/` — a client-only React + Vite SPA with one route and a
Netlify `/* → /index.html` catch-all. Crawlers received an empty HTML shell: no per-route URLs,
no canonical, no robots.txt/sitemap, broken `og:image`, no structured data, soft-404s on every
path, and dead legal links. The SEO architecture report graded the site "pre-SEO" and the full
page/keyword plan (flagship AmazonSmile-alternative page, three audience pillars, a programmatic
city engine, and a learn hub) requires ~40+ real, indexable URLs now and thousands later.

## Decision

1. **Decouple.** The public marketing/SEO site is a separate static app (`marketing/`) from the
   authenticated marketplace (Express/Prisma/Stripe on Railway). The marketplace's business
   logic, payments, data model, and auth are untouched; app/account/API routes stay `noindex`
   and disallowed in robots.txt.
2. **Astro 5, static output.** Every route ships real, zero-JS HTML at build time. React is used
   only as islands for the interactive signup flow (the five audience story forms, the impact
   demo, the confirmation screen), ported as-is from the SPA so conversion behavior and the
   existing `POST /api/waitlist` integration are preserved. Astro's `getStaticPaths` will drive
   the programmatic `/shop-local/[state]/[city]/` engine from a typed data file (Phase 2).
3. **No interim prerender.** react-snap is unmaintained and flaky with React 19; the Astro
   homepage port + Phase-0 fixes landed immediately, so a throwaway bridge wasn't worth building.
4. **Canonical host = bare domain** `https://goodcircles.org`; `www` 301s to it
   (`marketing/public/_redirects`). Every page emits a self-referencing canonical and absolute
   OG URLs.
5. **Brand entity** is "Good Circles" (two words) everywhere on the marketing site, per the
   GEO/entity-consistency strategy. Site-wide Organization + WebSite JSON-LD is emitted by the
   base layout; page-level FAQPage/Article/Breadcrumb schema is passed per page and must match
   visible H-tag text verbatim.

## Migration path

- `marketing/` builds alongside `landing/`; Netlify deploy previews verify each PR.
- **Cutover (requires owner approval, after PR 1–2 minimum):** change `netlify.toml` to
  `command = "cd marketing && npm install && npm run build"`, `publish = "marketing/dist"`, and
  **remove the SPA `/* → /index.html` catch-all** (Astro is multi-page; Netlify then serves
  `404.html` with a real 404 status). Set the primary domain to the bare host in Netlify and
  confirm DNS, then submit sitemaps to Google Search Console + Bing Webmaster Tools.
- `landing/` is deleted in a cleanup PR once the cutover is confirmed stable.

## Consequences

- Crawlers, social scrapers, and AI assistants get full HTML per route; Lighthouse SEO and CWV
  improve (the old single 406 KB render-blocking bundle becomes per-island deferred chunks;
  fonts are self-hosted with `font-display: swap`).
- Two package.json trees exist during the transition (`landing/`, `marketing/`).
- Phased build per the report roadmap: Phase 1 core pages → Phase 2 city engine →
  Phase 3 learn hub → Phase 4 GEO polish → Phase 5 CI regression checks.

## Accuracy contract (binding on every page and schema string)

Shoppers save **~10% on local purchases** (always "~"/"about"); a chosen nonprofit receives
**10% of the merchant's net profit** per sale (≈$72/yr per supporter; ≈$36k/yr from 500);
merchants keep **89% of profit** (1% fee on profit); external bridge items carry **no discount**
(~50% of commission funds a shared DAF pool). Launch **September 2026**, Jackson MS metro first.
Founding caps: **first 200 merchants, first 50 nonprofits**. Never publish the unverified
internal stats ($8.6B leakage, "#2 most generous state"). Verified against `constants.ts`
(`GC_DISCOUNT_RATE`/`DONATION_RATE`/`PLATFORM_FEE_RATE`) and `utils/financeEngine.ts`
(donation computed on net profit) on 2026-06-12.

# Verification results (Phase 7) — 2026-06-13

Build: `PUBLIC_NM9T5_AFFILIATE_ID=nm9t5club npm run build` → **312 pages, SEO gate 0 issues.**

## 1. Build
`npm run build` runs `astro build` + `scripts/check-seo.mjs`. Result: **312 pages built, 290 in
sitemap, 0 SEO-gate issues.** The gate enforces per page: exactly one non-empty H1; non-empty
title + meta description; absolute self-referencing trailing-slash canonical; og:title == title;
absolute og:image; all JSON-LD parses; FAQPage question text present verbatim in the visible HTML;
no internal `.html` links; no broken internal links; sitemap ↔ noindex consistency.

## 2. Rendered-HTML crawl of the 15 new partnership pages
All 15 confirmed to contain: `<title>`, meta description, self-referencing canonical, valid
JSON-LD blocks, and ≥1 affiliate-tagged outbound link
(`href="https://thenomore9to5club.org/...am_id=..." rel="sponsored noopener" data-affiliate="nm9t5"`).
Result: **ALL 15 OK.**

Pages: `/learn/start-a-local-business`, `/learn/veterans-starting-a-local-business`,
`/learn/content-creators-selling-locally`, `/learn/corporate-pros-going-independent`,
`/learn/parents-building-financial-freedom`, `/learn/should-you-quit-your-job-to-start-a-business`,
`/learn/no-more-9-to-5-club-vs-traditional-business-coaching`,
`/learn/best-resources-for-veteran-entrepreneurs-2026`,
`/learn/best-coaching-programs-for-aspiring-entrepreneurs`,
`/answers/what-is-the-no-more-9-to-5-club`, `/answers/how-do-i-start-a-side-business-while-employed`,
`/answers/best-marketplaces-for-local-businesses`, `/answers/what-is-a-community-marketplace`,
`/partners/no-more-9-to-5-club`, `/for-business/get-ready-to-launch`.

## 3. JSON-LD validation
Every JSON-LD block on all 312 pages was parsed programmatically during the build gate and the
crawl above — **0 parse errors.** Types present across the new pages: `Organization`, `WebSite`,
`Article` (with a `mentions` → No More 9 to 5 Club on partnership pages), `FAQPage`, `WebPage`
(with `isPartOf` + `mentions` on `/partners/...` and `/for-business/get-ready-to-launch`).
*Manual confirmation recommended:* paste one Article+FAQPage block and one WebPage(mentions)
block into https://validator.schema.org/ post-deploy (expected: 0 errors). The blocks are standard
schema.org shapes and parse cleanly.

## 4. Affiliate helper test (rendered output)
`nm9t5Link('/memberships', { medium: 'cta', campaign: 'partners-page', content: 'memberships' })`
rendered on `/partners/no-more-9-to-5-club` as:
```
https://thenomore9to5club.org/memberships?am_id=nm9t5club&utm_source=goodcircles&utm_medium=cta&utm_campaign=partners-page&utm_content=memberships
```
- `am_id` present ✓ · `utm_source=goodcircles` ✓ · `utm_medium` ✓ · `utm_campaign` ✓
- exactly one `?` ✓ · no `&&` ✓
The exact spec example `nm9t5Link('/memberships', { medium:'cta', campaign:'veteran-landing' })`
produces the same shape with `utm_campaign=veteran-landing` and no `utm_content` (omitted when not
passed). `am_id` is only emitted when `PUBLIC_NM9T5_AFFILIATE_ID` is set — env-driven, never hardcoded.

## 5. Lighthouse (Chrome headless, lighthouse@12)
| Page | SEO | Performance | Best Practices |
|---|---|---|---|
| /learn/start-a-local-business | **100** | 85 | **100** |
| /learn/veterans-starting-a-local-business | **100** | 92 | **100** |
SEO ≥ 95 requirement: **met (100).** Performance is gated as a warning in `lighthouserc.json`;
the main drag is the third-party GA/gtag script — acceptable for content pages.

## 6. robots.txt / llms.txt / sitemap
Present in `dist/` and will return 200 at the site root after deploy:
- `robots.txt` — now explicitly Allows GPTBot, ClaudeBot, anthropic-ai, PerplexityBot,
  Google-Extended, Applebot-Extended, Bingbot; Sitemap line present.
- `llms.txt` — updated with the NM9t5 partnership section + new key pages (< 8 KB).
- `sitemap-index.xml` / `sitemap-0.xml` — regenerated; 290 URLs incl. all new pages.
*(Live 200 check to run post-deploy.)*

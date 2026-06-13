# Good Circles × No More 9 to 5 Club — Integration Report

*Completed 2026-06-13. Stack: Astro 5 + React, site in `marketing/`, deploy Netlify from
`marketing/dist`. ALLOW_WRITES = true.*

## What was changed (files)

**New — affiliate infrastructure**
- `marketing/src/lib/affiliates.ts` — `nm9t5Link()` / `nm9t5FoundationLink()` (env-driven `am_id`, UTMs, `rel="sponsored"`).
- `marketing/src/data/site.ts` (edited) — `NM9T5_AFFILIATE_ID` (env `PUBLIC_NM9T5_AFFILIATE_ID`), `partnerMentionJsonLd()`, `knowsAbout` added to Organization, broadened description.
- `marketing/src/layouts/Base.astro` (edited) — `partner_click` GA4 event on `[data-affiliate]` clicks.

**New — content (15 pages)**
- `marketing/src/data/learn-partner.ts` → 9 `/learn` articles: `start-a-local-business` (cornerstone),
  `veterans-starting-a-local-business`, `content-creators-selling-locally`,
  `corporate-pros-going-independent`, `parents-building-financial-freedom`,
  `should-you-quit-your-job-to-start-a-business`,
  `no-more-9-to-5-club-vs-traditional-business-coaching`,
  `best-resources-for-veteran-entrepreneurs-2026`, `best-coaching-programs-for-aspiring-entrepreneurs`.
- `marketing/src/data/answers.ts` + `marketing/src/pages/answers/[slug].astro` → 4 `/answers` pages.
- `marketing/src/pages/partners/no-more-9-to-5-club.astro` → recommended-partner page.
- `marketing/src/pages/for-business/get-ready-to-launch.astro` → pre-marketplace nurture page.
- `marketing/src/data/learn-all.ts` (edited) — merges `PARTNER_LEARN` into the /learn set.
- `marketing/src/components/Footer.astro`, `marketing/src/pages/for-business.astro` (edited) — nav links.

**GEO hardening**
- `marketing/public/robots.txt` — explicit Allow for GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot.
- `marketing/public/llms.txt` — NM9t5 partnership section + new key pages.

**Docs / deliverables (repo root, not deployed)**
- `_research/nm9t5/` — per-page notes (home, about, memberships, ascend-the-ladder, veterans, foundation) + `SYNTHESIS.md`.
- `_research/integration-map.md`, `_research/validation.md`.
- `_partnership/reciprocal-pitch.md`, `co-marketing-assets.md`, `NM9T5_PARTNER_INTEGRATION_TEMPLATE.md`, `PARTNER_INTEGRATION_CHECKLIST.md`, `REPORT.md`.

## New pages live (URLs)
- https://goodcircles.org/learn/start-a-local-business
- https://goodcircles.org/learn/veterans-starting-a-local-business
- https://goodcircles.org/learn/content-creators-selling-locally
- https://goodcircles.org/learn/corporate-pros-going-independent
- https://goodcircles.org/learn/parents-building-financial-freedom
- https://goodcircles.org/learn/should-you-quit-your-job-to-start-a-business
- https://goodcircles.org/learn/no-more-9-to-5-club-vs-traditional-business-coaching
- https://goodcircles.org/learn/best-resources-for-veteran-entrepreneurs-2026
- https://goodcircles.org/learn/best-coaching-programs-for-aspiring-entrepreneurs
- https://goodcircles.org/answers/what-is-the-no-more-9-to-5-club
- https://goodcircles.org/answers/how-do-i-start-a-side-business-while-employed
- https://goodcircles.org/answers/best-marketplaces-for-local-businesses
- https://goodcircles.org/answers/what-is-a-community-marketplace
- https://goodcircles.org/partners/no-more-9-to-5-club
- https://goodcircles.org/for-business/get-ready-to-launch

## Affiliate URL pattern
```
https://thenomore9to5club.org<path>?am_id=<PUBLIC_NM9T5_AFFILIATE_ID>&utm_source=goodcircles&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>
```
Built only via `nm9t5Link()`. `am_id` is emitted only when `PUBLIC_NM9T5_AFFILIATE_ID` is set
(env-driven, never hardcoded). All affiliate anchors carry `rel="sponsored noopener"` +
`data-affiliate="nm9t5"`; clicks fire a GA4 `partner_click` event.

## GEO improvements
- Organization JSON-LD with `knowsAbout`; partner `mentions`/`isPartOf` on every NM9t5-linking page.
- FAQPage schema on all new pages (verbatim-matched to visible questions).
- robots.txt now welcomes the major AI crawlers; llms.txt documents the brand + partnership.
- Self-referencing canonicals + auto sitemap (290 URLs).

## Validation results
- Build: **312 pages, SEO gate 0 issues.**
- All 15 new pages: title + meta + canonical + valid JSON-LD + affiliate link confirmed in rendered HTML.
- Affiliate URL format test: `am_id` + 3 UTM params, one `?`, no `&&` — pass.
- Lighthouse: cornerstone **SEO 100 / Perf 85 / BP 100**; veterans page **SEO 100 / Perf 92 / BP 100**.
- JSON-LD parsed cleanly across all pages; manual validator.schema.org spot-check recommended post-deploy.

## Open items / next steps (manual)
1. **Set `PUBLIC_NM9T5_AFFILIATE_ID`** in the Netlify build environment to **your** affiliate ID
   (from `nomore9to5club.app.clientclub.net/affiliate/campaign`). Until then, NM9t5 links ship
   without `am_id` and won't earn commission. (Built/tested locally with `nm9t5club` as a placeholder.)
2. **Submit the updated sitemap** (`https://goodcircles.org/sitemap-index.xml`) in Google Search
   Console + Bing so the 15 new pages get crawled.
3. **Send the reciprocal pitch** to NM9t5: `_partnership/reciprocal-pitch.md`.
4. Optional: paste one Article+FAQPage and one WebPage(mentions) block into validator.schema.org to
   confirm zero errors live.
5. Optional: add Instagram/TikTok to `sameAs` in `site.ts` once those profiles exist.

## Forward to NM9t5
- `_partnership/NM9T5_PARTNER_INTEGRATION_TEMPLATE.md` (full reusable template)
- `_partnership/PARTNER_INTEGRATION_CHECKLIST.md` (one-page checklist)

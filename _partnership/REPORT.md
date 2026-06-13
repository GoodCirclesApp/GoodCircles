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

## Affiliate URL pattern — per-campaign (corrected 2026-06-13)
NM9t5 issues a **unique link per campaign** (each has its own path AND its own `am_id`) — there is
no single universal ID. Links are built only from the campaign registry in
`marketing/src/lib/affiliates.ts` via `nm9t5Link('<campaignKey>', utm)`, which preserves that
campaign's `am_id` and adds UTMs. Pages with no campaign (free Roadmap survey `/`, the veterans
training page, the Foundation) use `nm9t5PlainLink()`/`nm9t5FoundationLink()` — **no `am_id`**, by
design. Campaign→page mapping currently live:

| Campaign (am_id) | Commission | Used on |
|---|---|---|
| 30-day trial (`GoodCircles`) | 33% | default primary CTA across most pages |
| Launchpad (`timothy3898`) | 33% | cornerstone stage 2, get-ready-to-launch |
| Professional membership (`timothy7599`) | 10% | corporate-pros page |
| Delegation & Scaling (`timothy5319`) | 10% | cornerstone stage 6 |
| *plain (no am_id)* | — | free roadmap, veterans training, Foundation |

Registry also includes (unused-but-ready): `basic`, `bma`, `dfy`, `vaLender`, `summit` (50%),
`proEvent`, `basicEvent`. All affiliate anchors carry `rel="sponsored noopener"` +
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
1. **Affiliate links are live and earning** — each campaign uses its own real `am_id` from your
   dashboard; nothing to set. Optional: if you want specific campaigns featured on specific pages
   (e.g. the 50% Lifestyle Summit, or VA Lender on veteran content, or BMA/DFY on scaling content),
   tell me and I'll remap — the registry in `affiliates.ts` makes it a one-line change per spot.
2. **Submit the updated sitemap** (`https://goodcircles.org/sitemap-index.xml`) in Google Search
   Console + Bing so the 15 new pages get crawled.
3. **Send the reciprocal pitch** to NM9t5: `_partnership/reciprocal-pitch.md`.
4. Optional: paste one Article+FAQPage and one WebPage(mentions) block into validator.schema.org to
   confirm zero errors live.
5. Optional: add Instagram/TikTok to `sameAs` in `site.ts` once those profiles exist.

## Forward to NM9t5
- `_partnership/NM9T5_AFFILIATE_GROWTH_FRAMEWORK.md` (member-facing playbook — manual + website tracks, any affiliate, their own codes)
- `_partnership/NM9T5_AI_PROMPT_PACK.md` (copy-paste AI prompts so affiliates can do it with AI assistance)
- `_partnership/NM9T5_PARTNER_INTEGRATION_TEMPLATE.md` (full technical template for a developer/AI agent)
- `_partnership/PARTNER_INTEGRATION_CHECKLIST.md` (one-page quality checklist)

# Changelog

## GEO / AI-Search offensive — 2026-07-09

Built the AI-search / GEO infrastructure and content per the strategy docs. Foundational fixes (AI-crawler access, Bing, base schema, funnel) were already shipped and only verified. No fabricated data; comparative/projection claims are `[REVIEW]`-gated (see `REVIEW.md`); open real-number/legal items in `TODO.md`; human runbook in `docs/RUNBOOK.md`.

### Phase 1 — Technical foundation & canonical data
- **Canonical economics in one config** (`marketing/src/data/economics.ts`, new). Resolves the $3 (/sell) vs $5 (How-It-Works) contradiction to the locked **$4 per $100** (10% of a ~$40 profit); per $100 = ~$10 saved / ~$4 nonprofit / ~$0.40 platform / $53 local vs $14 chain.
  - *Before:* How-It-Works nonprofit **$5** ($40-cost example); /sell nonprofit **$3** ($60-cost). *After:* both **$4** (standardized $50-cost example). Files: `how-it-works.astro`, `meridian.astro`, `sell/index.astro`, `sell/marketplace-fees-comparison.astro`, `sell/own-store.astro`.
- **Answer-first layout** (`marketing/src/layouts/AnswerPage.astro`, new): renders the direct answer first in the DOM, auto-emits Article + FAQPage + BreadcrumbList (and optional Dataset/ItemList via `extraJsonLd`), with visible + machine-readable `lastUpdated` and sources.
- **Schema helpers** (`marketing/src/lib/faq.ts`): added `articleJsonLd`, `itemListJsonLd`, `datasetJsonLd`, `productJsonLd`, `reviewsJsonLd`/`aggregateRatingJsonLd`, `localBusinessJsonLd`.
- **`[REVIEW]` gate** (`marketing/src/components/Review.astro`, new): gated comparative/projection claims render only in preview (`PUBLIC_SHOW_REVIEW=true`); production emits a marker comment and keeps them out of the indexed state.
- **Sitewide schema (B3):** Organization schema now carries the canonical one-sentence description (`data/site.ts`, sourced from `economics.ts`); `sameAs` TODOs for LinkedIn/Crunchbase/Wikidata; `Testimonials.astro` (Review/AggregateRating, ready for real testimonials).
- **AI-referral analytics (B9):** `AiReferral.astro` (new, wired in `Base.astro`) tags ChatGPT/Perplexity/Gemini/Copilot/Claude referrals as a distinct `ai_referral` GA4 event + `ai_source` user property; `analytics.ts` attributes AI-sourced signups.
- **Crawlers + llms (B10/B8):** `robots.txt` adds OAI-SearchBot, ChatGPT-User, Claude-SearchBot; `llms.txt` updated with the canonical per-$100 figures and the new pages.

### Phase 2 — Ring-1 beachhead
- **AmazonSmile hub** (`amazonsmile-alternative.astro`) rebuilt on the answer-first layout with a **data-file-driven** comparison table (`data/amazonsmile-competitors.ts`, new): Good Circles, ShopRaise, Givebacks, iGive, RaiseRight, eBay for Charity. Emits Article + FAQPage + ItemList; AmazonSmile total corrected to the sourced ~$449M; "~8× giving rate" `[REVIEW]`-gated; unverified competitor rates shown as "varies" (TODO to fill).
- **Local Giving Index** (`/research/local-giving-index/`, new) — flagship research asset: hero stat, "Every $100" breakdown, inline SVG chart, scaling table, methodology, downloadable **CSV**, cite-this block; Article + Dataset + FAQPage schema. Localized `[city]` editions for Jackson & Meridian (community totals withheld until real household counts — `TODO.md`). All GC-specific dollar outputs + AmazonSmile comparison `[REVIEW]`-gated.
- **Ring-1 answer pages** (new, answer-first): `what-replaced-amazonsmile`, `apps-that-donate-to-charity-when-you-shop`, `support-a-nonprofit-without-spending-extra`. Registered in the Learn hub + `llms.txt`.

### Phase 3 — Rings 2–3 + programmatic guard
- **Thin-content guard** (`marketing/src/lib/thin-content.ts`, new) wired into the programmatic `/shop-local/mississippi/[slug]/` and `/causes/[slug]/` pages: a page below the content/entity threshold is rendered but `noindex` (prevents thin doorway pages). Current rich pages are unaffected (verified no new noindex).
- **Local Giving Index cross-links** added from city pages (localized edition where one exists, else the hub).
- **Ring-2 (Mississippi) + Ring-3 (concept) answer pages** (new, answer-first) — see the Ring-2/3 set under `marketing/src/pages/learn/`.

### Phase 4 — Campaign assets (turnkey, nothing posted)
- `docs/campaigns/`: `consensus-kit.md` (Reddit/Quora templates + subreddit list + 3 YouTube scripts), `digital-pr-kit.md` (Index press release + pitches + HARO + guest posts), `roundup-insertion-kit.md`, `entity-kit.md` (Wikidata/Crunchbase/GBP/Bing Places prefilled + NAP sheet).

### Phase 5 — Measurement & operations
- `docs/campaigns/geo-scoreboard.csv` (weekly, seeded with the battle-map prompts × engines), `prompt-tracking-checklist.md`, `editorial-calendar.md` (freshness cadence + publish backlog), and `scripts/freshness-report.mjs` (lists pages by last-modified).

### Phase 6 — Verify & hand off
- `REVIEW.md` (gated-claim manifest), `TODO.md` (real numbers/accounts/legal), this changelog, and `docs/RUNBOOK.md` (week-by-week human runbook).
- Verification: whole-site build green at each step (check-seo + check-citations, 0 issues); schema validated in rendered output; `$3/$5` per-$100 figures gone from the pillars; gated claims confirmed hidden in production; AI-referral event present sitewide.

# GEO / AI-Search — Open TODOs (real numbers, accounts, legal)

Items the build can't resolve — they need a real number, an account, or a human/legal decision. Nothing here was invented; each is a placeholder or a flagged assumption.

## Unit economics — confirm the canonical basis
- [ ] **Canonical margin vs the production math.** The site now standardizes on **~$4 to a nonprofit per $100** at a "~40% margin", implemented with a **$50-cost** worked example (`marketing/src/data/economics.ts`). Note: the production engine (`server/src/lib/splitRates.ts`, mirrored in `marketing/src/data/sell-competitors.ts`) computes the nonprofit share on **net profit after the 10% shopper discount**, so at a *strict* 40% margin ($60 cost) it yields **~$3**, not $4. The $4 figure corresponds to a ~$50-cost / ~higher-margin example (or to computing the share on pre-discount gross margin). **Confirm the intended basis** so marketing and the ledger agree. (Locked to $4 per your decision; this is the reconciliation note.)
- [ ] **$72 vs $96 per supporter/year.** The established site uses "$72/active supporter/year" (≈ $150/mo spend); the Local Giving Index base case uses $200/mo → $96. Both are labeled with their assumption. Confirm which spend assumption is canonical, or keep both as distinct scenarios.

## Competitor figures (AmazonSmile hub)
- [ ] **Verify per-competitor giving rates** in `marketing/src/data/amazonsmile-competitors.ts` (ShopRaise, Givebacks, iGive, RaiseRight). They are currently shown as "varies" with `rateVerified: false`. Fill in real, current, sourced rates and flip `rateVerified: true`. Do **not** invent a rate.

## Local Giving Index — localized editions
- [ ] **Household counts** for the launch markets in `marketing/src/data/local-giving-index.ts` (`households: null`). Set from a citable source (US Census / ACS) for Jackson metro and Meridian/Lauderdale County. Until set, each city page shows the per-$100 + per-household math but withholds the community-scale total (by design — no estimate from an unconfirmed number).
- [ ] **Named research author** for the Index (author authority aids citation). Currently authored by the Organization.

## Entity / knowledge graph (Organization `sameAs`)
- [ ] Create/claim and add to `marketing/src/data/site.ts` `sameAs`: **LinkedIn company page, Crunchbase org, Wikidata item** (placeholders documented in the file and in `docs/campaigns/entity-kit.md`). Also confirm the public **NAP** (name/address/phone) — do not use a personal/home address.

## [REVIEW] claim sign-off (then reveal)
- [ ] Legal/marketing sign-off on the gated comparative + projection claims listed in **`REVIEW.md`** (the "~8× AmazonSmile" lines and the modeled Index projections). After sign-off, set `PUBLIC_SHOW_REVIEW=true` at build (or hard-unwrap the approved blocks) to publish them. They are hidden in the production build until then.

## Analytics / ops
- [ ] Create the GA4 **saved segment / exploration** on the `ai_referral` event (or the `ai_source` user property) so AI traffic + signups show as their own channel (how-to in `docs/RUNBOOK.md`). Confirm `PUBLIC_GA4_ID` is set in the production env.
- [ ] Submit the updated sitemap to **Bing Webmaster Tools** and **Google Search Console** (the new /research/ + /learn/ pages).
- [ ] Add a machine-readable `dateModified`/"Updated <Month Year>" to the P0 pages the freshness report flags as undated (`/how-it-works/`, `/for-business/`, `/for-nonprofits/`, `/sell/`, `/meridian/`, `/faq/`). Run `node scripts/freshness-report.mjs` to see the current list.

## Campaign assets (see docs/campaigns/*)
- [ ] Fill the human-task placeholders in the campaign kits: real journalist/outlet contacts, target roundup articles, subreddit verification, and the Wikidata/Crunchbase/GBP/Bing Places account creation (all marked `[TODO]` in those files).

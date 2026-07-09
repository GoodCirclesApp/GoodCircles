# Good Circles — GEO / AI-Search Runbook (human actions)

This sequences the real-world actions the build can't perform. Every asset referenced was generated in this repo. Do the **Week 0 gate** first — it unblocks everything indexable.

Legend: 🔒 = needs your sign-off/decision · 🌐 = off-site account/posting · 📊 = measurement.

---

## Week 0 — Gate: sign-off + accounts (do first)

1. 🔒 **Clear `REVIEW.md`.** Read the gated comparative/projection claims (the "~8× AmazonSmile" lines and the modeled Local Giving Index projections). For each you approve, either (a) build with `PUBLIC_SHOW_REVIEW=true` to publish it, or (b) hard-unwrap the `<Review>` block in the named file. Until then those specific lines are hidden in production (the sourced facts around them already ship).
2. 🔒 **Confirm the canonical margin note** in `TODO.md` (the $4-vs-$3 basis) so marketing and the ledger agree.
3. 🌐 **Create/claim the entity profiles** using `docs/campaigns/entity-kit.md` (prefilled copy): Wikidata, Crunchbase, LinkedIn company page, Google Business Profile, Bing Places. Then add the resulting URLs to `marketing/src/data/site.ts` `sameAs` and redeploy.
4. 🌐 **Verify Bing + Google indexation.** Submit `https://goodcircles.org/sitemap-index.xml` in Bing Webmaster Tools and Google Search Console (AI retrieval leans on Bing). Confirm the new `/research/` and `/learn/` pages are discoverable.
5. 📊 **Stand up analytics.** Confirm `PUBLIC_GA4_ID` is set in production. In GA4, create a saved segment/exploration on the **`ai_referral`** event (or the **`ai_source`** user property) so ChatGPT/Perplexity/Gemini/Copilot traffic + signups report as their own channel. (The site already fires the event — see `marketing/src/components/AiReferral.astro`.)

## Week 1 — Beachhead live + baseline

6. 📊 **Capture the baseline.** Run every prompt in `docs/campaigns/geo-scoreboard.csv` (14 battle-map prompts × Perplexity / Google AI Mode / ChatGPT) using `docs/campaigns/prompt-tracking-checklist.md`. Record who is cited today — that's your game clock.
7. 🌐 **Publish the 3 YouTube videos** from `docs/campaigns/consensus-kit.md` (scripts + titles + descriptions): "the $100 math", "Best AmazonSmile alternatives 2026", "How local businesses can fund nonprofits". Link each to the relevant page.
8. 🌐 **Begin genuine Reddit/Quora participation** with the value-first templates in `docs/campaigns/consensus-kit.md` — answer real questions, disclose affiliation, link only where useful. Verify the target subreddits first (marked `[TODO: verify]`).

## Week 2 — Research drop + PR

9. 🔒→🌐 **Pitch the Local Giving Index.** Once its projections are signed off (step 1), send the press release + pitches in `docs/campaigns/digital-pr-kit.md` to local MS press, nonprofit-sector outlets, and podcasts. Fill the journalist list first (it's a template).
10. 🌐 **Roundup insertion.** Use `docs/campaigns/roundup-insertion-kit.md` to ask authors of existing "AmazonSmile alternative" / "shop local" articles to add Good Circles, with the sourced differentiator.

## Ongoing — cadence + measurement

11. 📊 **Weekly scoreboard (every Friday).** Re-run the prompts, update `geo-scoreboard.csv`, compute Citation Rate / Mention Rate / Share-of-Voice vs ShopRaise/Givebacks/iGive, and reallocate effort to whatever is gaining. Ritual in `prompt-tracking-checklist.md`.
12. ✍️ **Freshness cadence (7–14 days).** Follow `docs/campaigns/editorial-calendar.md`: refresh the hub, the Local Giving Index, and the pillars; publish 1–2 new answer pages/week from the backlog. Run `node scripts/freshness-report.mjs` to see the stalest pages, and add machine-readable dates to the P0 pages it flags as undated.
13. 🔒 **Fill the TODOs** in `TODO.md` as data arrives: verified competitor rates, launch-market household counts (unlocks the city-level community totals), a named Index author.
14. **Quarterly:** re-version the Local Giving Index with real platform data post-launch; each drop is a PR + citation event (repeat Week 2).

---

### Where each asset lives
- Campaign kits: `docs/campaigns/consensus-kit.md`, `digital-pr-kit.md`, `roundup-insertion-kit.md`, `entity-kit.md`
- Measurement: `docs/campaigns/geo-scoreboard.csv`, `prompt-tracking-checklist.md`, `editorial-calendar.md`, `scripts/freshness-report.mjs`
- Gated claims manifest: `REVIEW.md` · Open data/legal items: `TODO.md` · What shipped: `CHANGELOG.md` (GEO section)
- Canonical figures: `marketing/src/data/economics.ts` (never hard-type money elsewhere)

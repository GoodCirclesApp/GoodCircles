# `[REVIEW]` — claims manifest

The claims below were **reviewed and signed off by the owner on 2026-07-09** and the `<Review>` gates were **hard-unwrapped**, so they now render in production. This file is retained as the record of what was reviewed and on what basis, and as the process for any *future* gated claim.

The `[REVIEW]` mechanism (`marketing/src/components/Review.astro`) remains available: wrap a new comparative/competitor claim or modeled projection in `<Review id="…" basis="…" need="…">…</Review>` and it will be hidden in production (marker comment only) until built with `PUBLIC_SHOW_REVIEW=true` or hard-unwrapped after sign-off. Add a row here when you do.

## Published (signed off 2026-07-09)

| id | file | claim | basis / source | status |
|---|---|---|---|---|
| `asmile-8x` | `learn/what-replaced-amazonsmile.astro` | "~8× the per-dollar giving rate" vs AmazonSmile | NPR / Charity Navigator (0.5%, ~$449M) vs GC model $4/$100 (4% of spend ÷ 0.5% = 8×) | ✅ published |
| `asmile-hub-8x` | `amazonsmile-alternative.astro` | "~8× the per-dollar giving rate" vs AmazonSmile | Same | ✅ published |
| `lgi-amazonsmile` | `research/local-giving-index/index.astro` | AmazonSmile contrast ("~8×", "$4/$100 vs 0.5%") | Same | ✅ published |
| `lgi-household` | `research/local-giving-index/index.astro` | Per-household/yr projection ($240 / $96 / $936) | Modeled: $200/mo base, ~40% margin, 10%/10% split, 53%/14% recirculation | ✅ published (labeled "Modeled projection") |
| `lgi-scaling` | `research/local-giving-index/index.astro` | Scaling table (1k/10k/50k → community totals) | Per-household × households | ✅ published (labeled "Modeled projection") |
| `lgi-jackson-household` / `lgi-meridian-household` | `research/local-giving-index/[city].astro` | Per-household/yr projection per city | Modeled, $200/mo base | ✅ published (labeled "Modeled projection") |
| `ms-lowfee-takerate` | `learn/low-fee-marketplace-for-mississippi-businesses.astro` | Take-rate comparison (15–30% of sale vs 1% of profit) | Platform fee schedules vs GC 1%-of-profit | ✅ published |

## Still deferred (renders only when data exists — not yet a live claim)
- `lgi-<city>-community` (in `[city].astro`) — the "if 1 in 20 households…" community total renders **only** once a real household count is set in `data/local-giving-index.ts` (currently a flagged placeholder). When you add the count, that block becomes a live modeled projection — re-wrap it in `<Review>` for a fresh sign-off if you want the gate, or publish directly.

### Honesty notes retained on-page
- Modeled projections keep the visible **"(Modeled projection.)"** label; the AmazonSmile/ take-rate comparisons keep a **"(Comparative estimate — see methodology.)"** note.
- The **$4-per-$100** figure's margin basis is still flagged in `TODO.md` (the production ledger yields ~$3 at a strict 40% margin because the merchant funds the 10% discount before the split).

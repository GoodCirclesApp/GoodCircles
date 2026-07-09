# `[REVIEW]` — gated claims manifest

Every comparative claim about a named competitor (esp. AmazonSmile) and every modeled dollar projection is **built but gated**: it renders only in a preview build (`PUBLIC_SHOW_REVIEW=true`) and is **kept out of the production/indexed state** until sign-off (production emits a marker comment instead). This table is the sign-off checklist. Well-sourced third-party facts (the local multiplier ~$53 vs ~$14; AmazonSmile 0.5% / ~$449M / ended Feb 2023) are **not** gated — they ship.

**To publish an approved item:** either build with `PUBLIC_SHOW_REVIEW=true` (reveals all gated blocks), or hard-unwrap the specific `<Review>…</Review>` block in the named file.

| id | file | claim (gated) | basis / source | action needed |
|---|---|---|---|---|
| `asmile-8x` | `marketing/src/pages/learn/what-replaced-amazonsmile.astro` | "~8× the per-dollar giving rate" vs AmazonSmile | NPR / Charity Navigator (0.5%, ~$449M) vs GC model ~$4/$100 | Legal/marketing sign-off on the comparative + the "8×" multiple |
| `asmile-hub-8x` | `marketing/src/pages/amazonsmile-alternative.astro` | "~8× the per-dollar giving rate" vs AmazonSmile | Same as above | Same |
| `lgi-amazonsmile` | `marketing/src/pages/research/local-giving-index/index.astro` | AmazonSmile contrast ("~8×", "$4 per $100 vs 0.5%") | NPR / Charity Navigator vs GC model | Sign-off on comparative + multiple |
| `lgi-household` | `marketing/src/pages/research/local-giving-index/index.astro` | Per-household/year projection ($240 / $96 / $936) | Modeled: $200/mo base case, ~40% margin, 10%/10% split, 53%/14% recirculation | Approve as **modeled projection** + confirm base-case assumptions |
| `lgi-scaling` | `marketing/src/pages/research/local-giving-index/index.astro` | Scaling table (1k/10k/50k households → community totals) | Per-household figures × households | Approve as **modeled projection** |
| `lgi-jackson-household` | `marketing/src/pages/research/local-giving-index/[city].astro` (Jackson) | Per-household/year projection for Jackson | Modeled, $200/mo base case | Approve as modeled projection |
| `lgi-meridian-household` | `marketing/src/pages/research/local-giving-index/[city].astro` (Meridian) | Per-household/year projection for Meridian | Modeled, $200/mo base case | Approve as modeled projection |
| `ms-lowfee-takerate` | `marketing/src/pages/learn/low-fee-marketplace-for-mississippi-businesses.astro` | Take-rate comparison (DoorDash/Etsy/Amazon 15–30% of sale vs GC 1% of profit) | Platform fee schedules (sourced) vs GC 1%-of-profit (canonical) | Confirm the competitor take-rate framing + the ~$0.40/$100 figure |

### Not yet gated (will be, when data is added)
- `lgi-<city>-community` (in `[city].astro`) — the "if 1 in 20 households…" community total renders **only** once a real household count is set in `data/local-giving-index.ts` (currently a flagged placeholder, not a projection). When the count is added, that block is a `<Review>` and belongs in this table.

### Notes
- The **$4-per-$100** nonprofit figure itself is treated as canonical (per owner decision) and is **not** gated, but its margin basis is flagged for confirmation in `TODO.md` (the production ledger yields ~$3 at a strict 40% margin because the merchant funds the 10% discount before the split).
- Preview locally: `cd marketing && PUBLIC_SHOW_REVIEW=true npm run build` (reveals every gated block for review).

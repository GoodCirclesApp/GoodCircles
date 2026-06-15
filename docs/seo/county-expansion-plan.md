# Good Circles — National County-Level Expansion Plan (all 3,143 counties)

*How to scale the "coming soon" geo engine from ~160 major-city pages to every U.S. county
(3,143 counties + county-equivalents: parishes, boroughs, census areas, independent cities) — for
both Good Circles demand capture and the NM9t5 affiliate funnel — **without** the thin-content /
doorway-page penalty that would sink a young domain. Prepared 2026-06-15. Companion to
`seo-operations-calendar.md`.*

---

## 1. The one risk that governs everything

Publishing thousands of near-template pages at once on a **days-old, low-authority domain** is the
textbook trigger for a **sitewide quality/doorway demotion** — it can drag down the pages that are
already working. We have 20 pages still "crawled, not indexed" *today*. So the plan is built around
one principle:

> **Generation is fast and safe; INDEXING is slow and paced.** We can build all 3,143 county pages
> in days, but we let Google *index* them in controlled waves over many months, gated by Search
> Console health — and that pacing is the strategy, not a limitation.

---

## 2. Hard prerequisite — a verified dataset (no fabricated data)

A county page is only non-thin if it contains **real, unique local data**. That requires a vetted
source; we will **not** invent town names, county seats, or populations.

- **Source:** U.S. Census Bureau (public domain) — the County Gazetteer (FIPS, name, proper type,
  land area) + the place-to-county relationship file (incorporated cities/towns per county) +
  population estimates. Optionally a vetted npm dataset built from these.
- **Fields per county:** FIPS, county name + **proper local type** (County / Parish / Borough /
  Census Area / Independent City — use the correct term for local resonance and accuracy), state,
  **county seat**, **list of the real towns/cities in it**, rounded population, region.
- **Validation:** spot-check a sample per state before any page is allowed to flip to `index`.

**Until this dataset is sourced and validated, no county pages get built.** This is the gate.

---

## 3. The anti-thin-content model: "county as a hub of its real towns"

Each county page's uniqueness comes from **real structured data**, not a reworded sentence:

- **A directory of the actual towns/cities in that county** (each linking to its city page if one
  exists, or to a "request your town" CTA). This list is genuinely unique per county and useful.
- County seat, state, region, rounded population — true data points woven into the intro.
- When real merchant/nonprofit/request data exists for the area, it's shown (same as seeded cities).

This makes a county page a **real local directory**, the same reason the existing city pages aren't
thin. We do **not** attempt 3,143 hand-written "unique local hooks" (infeasible and fabrication-
prone) — the town list + structured facts carry the uniqueness.

---

## 4. URL / information architecture (no churn to existing pages)

Keep existing city pages exactly where they are (don't move live URLs — that risks their equity).
Add a **county tier** that links down to its cities:

```
/shop-local/                                  national hub (exists)
/shop-local/[state]/                          state hub (exists)
/shop-local/[state]/county/[county]/          ★ NEW — county hub (lists its towns)
/shop-local/[state]/[city]/                   city pages (exist; unchanged)
```

- The `county/` segment prevents any route collision with existing city slugs.
- Linking: **state → its counties → each county's towns**, and **county ↔ neighboring counties**.
  Cities link **up** to their county. This distributes crawl equity and prevents islands.
- (A deeper `state → county → city` nesting is "purer" but would require redirecting every existing
  city URL — not worth the risk. The `county/` sibling path achieves the hierarchy without churn.)

---

## 5. Indexability gating (the safety valve)

Mirror the Mississippi-city guardrail, scaled:

1. **Every county page ships `noindex,follow` and is EXCLUDED from the sitemap by default.** It's
   live for direct visitors, internal navigation, the request form, and the NM9t5 CTA — but it is
   **not competing for the index**, so it **cannot** cause a doorway penalty.
2. A county flips to **`index` (and enters the sitemap)** only when it clears a **content threshold**:
   ≥ ~3 real towns listed + the structured local facts present (+ real seed data where available).
3. **Flip in waves**, never all at once (see timeline). Watch Search Console between waves; if
   indexation stalls or quality signals dip, **pause and diagnose** before continuing.

Net effect: nationwide *functional* coverage quickly (capture + affiliate everywhere), with
*search* coverage released only as fast as the domain can safely absorb.

---

## 6. NM9t5 partnership on every county page

Each county page carries the same affiliate integration we built for cities:

- The localized **`StartBusinessCta`** block — "Thinking of starting a business in [County]?" — with
  internal links to the seller cluster + the per-campaign NM9t5 affiliate CTA (`rel="sponsored"`,
  tracked, with `utm_content=[county-fips]` for per-county analytics).
- `partnerMentionJsonLd()` added to the page's structured data.

So the affiliate surface scales to all 3,143 counties in lockstep — and because the CTA is one
relevant block on a page whose value is the local directory, it doesn't add thin-content risk.

---

## 7. Schema

- `BreadcrumbList` (Shop Local → State → County) + `FAQPage` (county-specific Q&A) always.
- `partnerMentionJsonLd` (NM9t5) always.
- `ItemList` of the county's towns; `LocalBusiness`/`ItemList` of real merchants only once seeded
  (never for placeholders).

---

## 8. Build / performance notes

- ~3,143 county pages + ~existing pages ≈ ~3,500+ static pages. Astro builds this fine; **watch
  Netlify build time** and split the sitemap per state. If build time approaches limits, generate
  in state batches or move to incremental builds.
- Generate **state-by-state** so the rollout is controllable and reviewable.

---

## 9. Safe rollout timeline (honest)

The engineering is the fast part; **indexing pacing is the real schedule.**

| Stage | What happens | Realistic timing |
|---|---|---|
| **Data** | Source + validate the Census county/place dataset | ~1–2 weeks (your go) |
| **Engine** | Build the county template + hubs + NM9t5 block; generate ALL counties as `noindex`, excluded from sitemap, state-by-state | ~1–2 weeks after data |
| **Wave 0 — prove it** | Flip the **launch state's counties (Mississippi, ~82)** to `index`; confirm they index cleanly in GSC | ~2–4 weeks, **after** the current 312 pages are indexing well |
| **Waves 1…n — national** | Flip ~**3–6 states per month** to `index`, prioritized by (a) where Good Circles operates, (b) population/search demand, (c) `request-your-area` signals; monitor GSC each wave; pause if quality dips | rolling, **~8–14 months** |
| **Long tail** | Lowest-population/rural counties indexed last as authority grows; counties with real local data/requests promoted sooner | through **~12–18 months** |

**So:** all 3,143 county pages can be **live (functional, capturing demand, running NM9t5 CTAs)
within ~1 month of sourcing the data**, while **safe full *indexed* coverage is a ~12–18 month
wave-based rollout** paced by Search Console — gated, never dumped.

**Accelerators that shorten it:** authority (PR/backlinks), the September launch (real MS data
unlocks the first indexed wave), and rising `request-your-area` demand (signals which counties to
index next). These are why the off-page/PR work matters more than raw page count.

---

## 10. Guardrails (do no harm)

- Default `noindex` + sitemap exclusion until the content threshold is met. **Never bulk-index.**
- Hold Wave 0 until the **existing 312 pages are indexing healthily** (don't stack a 3,000-page bet
  on an unproven base).
- Real data only — no fabricated towns/seats/populations.
- Pace by GSC feedback; **pause on any quality-signal dip**.
- Don't move existing city URLs.
- Every change still ships through the SEO regression gate.

---

## 11. What I'll build, per phase (on your go)

1. **Phase A (after you source/approve the dataset):** the county data module + `county/[county]`
   route + state→county hub links + the NM9t5 `StartBusinessCta` + schema; generate **all counties
   `noindex`, sitemap-excluded**, state-by-state. Verify with the SEO gate + orphan checker.
2. **Phase B (post-launch, paced):** add an `isCountyIndexable()` threshold + flip Wave 0 (MS), then
   roll state waves on the cadence above, monitoring GSC.

**What I need from you:** approval to source the Census dataset (or provide a preferred dataset),
and the go-ahead to start Phase A **after** the current pages are indexing (so we're building on a
proven base, not gambling on an unproven one).

# Good Circles — SEO/GEO Operations Calendar (recurring tasks + safe sequencing)

*Companion to [120-day-growth-calendar.md](./120-day-growth-calendar.md) (strategy + projections)
and [county-expansion-plan.md](./county-expansion-plan.md) (the 3,143-county national rollout).
This doc integrates a recommended agency task list into our actual stack, marks what's already done,
and sequences the rest so nothing harms a young domain. Prepared 2026-06-15.*

---

## 0. Read this first — stack reality & tool translation

The recommended list assumes **WordPress + RankMath** and a **storefront local business**. Good
Circles is a **static Astro site** (built in code, deployed on Netlify) that is **pre-launch**
(Sept 2026) on a **domain that's days old**. That changes how — and how fast — to apply these.

| Recommended tool/task | Our reality | What we use instead |
|---|---|---|
| **RankMath / Yoast** (titles, meta, H1, focus keyword, schema, sitemap, redirects) | Not applicable — there's no CMS plugin | All handled **in code**: `Base.astro` (titles/meta/canonical/OG), per-page data, JSON-LD helpers, the auto sitemap, and `_redirects`. The **SEO CI gate** (`marketing/scripts/check-seo.mjs`) enforces one H1 + title + meta + canonical + valid schema + no broken links on **every deploy** — it's our always-on auditor. |
| **Ahrefs / Screaming Frog crawls** | Optional paid add-on | The build-time gate already crawls the whole site for indexability/broken-links/schema each deploy. Ahrefs adds backlink data + competitor analysis if you buy it — slot into the monthly task. |
| **SurferSEO** content scoring | Optional paid add-on | Use GSC query data to guide content; add Surfer later if budget allows. |
| **GBP / citations** (local SEO) | **Gated** — needs a consistent business **NAP** (name/address/phone) | Good Circles has **no public street address yet** (also blocks marketing-email compliance). **Get a virtual mailbox / PO box first** — GBP and citations stall without a stable NAP. |

**Bottom line:** the *technical* half of this list is already implemented and auto-audited. The
*new value* is in **local SEO (GBP + citations)**, **a formal recurring cadence**, **data-driven
on-page tuning**, and **authority building** — all of which must wait for the right inputs (indexing,
NAP, GSC data) to avoid wasted churn.

---

## 1. The "do no harm" guardrails (why sequence matters)

The single biggest risk with this list is **doing optimization-churn on a not-yet-indexed domain.**
Rules we follow:

1. **Index the baseline before you tune it.** The site just deployed; ~20 pages are "crawled, not
   indexed." Re-writing titles/H1s/keywords now creates ranking volatility with no data behind it.
   **On-page tuning is DATA-DRIVEN — it starts only after GSC shows impressions** (≈ weeks 3–4+).
2. **Keyword insertion = natural, never stuffing.** One focus keyword per page, in the title, H1,
   and first paragraph, used naturally. Exact-match stuffing gets a young domain demoted. (We're
   already answer-first and keyworded — restraint, not more keywords, is the move.)
3. **Citations at natural velocity, NAP-consistent.** ~25/month is fine; blasting hundreds at once
   reads as spam. Identical name/address/phone everywhere matters more than volume. **Requires the
   business address first.**
4. **New pages in waves, never in bulk.** The big combinatorial sets (cause × city, "best
   alternative in [state]") stay **deferred until the current 312 pages are indexed and ranking** —
   dumping them now risks a sitewide doorway/thin-content demotion.
5. **Change deliberately, measure before/after.** Don't churn the same page repeatedly; make a
   change, give it 2–4 weeks, read the result.
6. **Protect what's live.** Every change still ships through the SEO gate; no edits to the
   marketplace backend for SEO.

---

## 2. Your task list → status map

✅ Done · 🔁 Recurring (scheduled below) · ➕ New (added) · ⛔ Gated (needs a prerequisite) · 🔧 In-code equivalent

| Task | Status | Notes |
|---|---|---|
| SEO audit (technical + analytics) | ✅ / 🔁 | Done = the architecture report; re-audit quarterly |
| Keyword mapping / competitive analysis | ✅ / 🔁 | Done = report §6 keyword→page map; refresh quarterly |
| Insert keywords via RankMath | 🔧 / 🔁 | In-code (already keyworded); data-driven tuning later. RankMath N/A |
| RankMath adjustments (meta, image title/alt) | 🔧 | In-code; alt text present on images. RankMath N/A |
| Google Business Profile audit | ⛔ / ➕ | Create GBP first (needs NAP); then audit |
| GMB optimization opportunities | ➕ | After GBP is live |
| Monthly Ahrefs crawls (index/crawl) | 🔁 | Gate covers basics; Ahrefs optional |
| Build/correct silo + internal links | ✅ / 🔁 | Hub-and-spoke already built; audit quarterly |
| Biweekly Google Search Console check | 🔁 | New recurring (indexing + performance) |
| Existing-page content optimization | 🔁 | Data-driven, monthly |
| SurferSEO optimization | 🔁 | Optional paid; adopt if budget allows |
| Content creation / update pages | 🔁 | The /learn + blog cadence |
| On-page tuning (title/H1/keyword/img) | 🔁 | **Data-driven only** (guardrail #1) |
| Build citations (25/mo) | ⛔ / ➕ | Needs NAP; then ramp at natural velocity |
| Conversion tracking (GA4 + Tag Manager) | ✅ / ➕ | GA4 events live (sign_up by audience, cta_click, partner_click); formalize GA4 **conversions** + optional GTM |
| Focus keyword per page | 🔧 / ➕ | Effectively present; formalize a keyword-map doc |
| Blog research + editorial calendar | 🔁 / ➕ | Start a simple editorial calendar |
| Technical crawls (robots/index) | ✅ / 🔁 | Gate + GSC |
| Service schema on service/blog pages | ➕ | Add `Service`/`Offer` to pillars (Article already on /learn) — safe in-code win |
| Broken-link checks | ✅ / 🔁 | Gate (build-time) + live spot-check biweekly |
| Citations/NAP consistency check | ⛔ / 🔁 | After NAP set |
| GBP posts (research + insights) | ➕ | After GBP |
| GBP competitor audit | ➕ | After GBP |
| Updated single-post layout | 🔧 | Learn template already strong; optional polish |
| Build new pages/posts | 🔁 | In waves (guardrail #4) |
| Ensure schema on all pages | ✅ / 🔁 | Gate validates every deploy |

---

## 3. Recurring operations cadence

| Cadence | Tasks |
|---|---|
| **Every deploy (automated)** | SEO CI gate: one H1, title/meta length, canonical, valid JSON-LD, FAQ-verbatim, **broken-link check**, sitemap ↔ noindex consistency |
| **Biweekly** | GSC **indexing** check (Pages report) + **request indexing** for new/priority URLs · GSC **Performance** glance (new impressions/queries) · live broken-link spot-check |
| **Monthly** | Full crawl review (gate + optional Ahrefs/Screaming Frog) · GSC Performance deep-read → pick 1–3 pages to tune **on data** · publish **1–2 new /learn or blog posts** (from query gaps) · update editorial calendar · **GBP post + insights** (once live) · **+ up to 25 citations** at natural velocity (once NAP set) · refresh one dated/"2026" page |
| **Quarterly** | SEO **re-audit** (technical + analytics) · **keyword map + competitor** refresh · **silo / internal-link audit** · **schema coverage** review · prune/improve thin or non-indexing pages |

---

## 4. 120-day schedule (folded into the launch-aligned phases)

> Day ~90 ≈ the **September 2026 launch**. Pre-launch builds authority + indexing; launch converts;
> post-launch compounds. Full projections: see `120-day-growth-calendar.md`.

### Month 1 (Days 1–30) — Baseline, instrument, prerequisites *(no on-page churn yet)*
- **[You]** Get a **business address** (virtual mailbox/PO box) → unblocks GBP + citations + email.
- **[You]** Create **Google Business Profile** (service-area business; no public storefront) → first audit.
- **[You]** GSC: **request indexing** for the ~10 priority pages; **biweekly** indexing checks begin.
- **[Me]** **Add `Service`/`Offer` schema** to the four pillar pages (safe in-code win) + a **formal keyword-map doc**.
- **[Me]** **Silo / internal-link audit** (hub-and-spoke is built; verify no orphans, tighten clusters).
- **[Me]** Formalize **GA4 conversions** (mark sign_up + cta_click as conversions) — optional GTM.
- **[You]** Begin **citations slowly** (5–10 foundational, NAP-consistent) once the address exists.
- **[You/Me]** Start **PR Wave 1** (local MS press) — authority is what frees the "crawled, not indexed" pages.

### Month 2 (Days 31–60) — Authority + first data-driven tuning
- **[Me]** First **on-page tuning** using real GSC queries (titles/H1/first-para on 1–3 pages that show impressions).
- **[Me]** **Content cadence**: 1–2 new /learn or answer pages/week from query gaps; start the **editorial calendar**.
- **[You/Me]** **PR Waves 2–3** (trades → "best AmazonSmile alternatives" roundups) — the biggest indexing/GEO lever.
- **[You]** **Citations → ~25/month** at steady velocity; **GBP posts** begin; monthly crawl.

### Month 3 (Days 61–90) — Launch run-up & launch
- **[Both]** **Seed MS city pages** with real merchants/nonprofits → flip `noindex→index` (the launch flywheel).
- **[Me]** Add `ItemList`/`LocalBusiness` schema to seeded city pages; **launch press push**.
- **[Me]** **Measured programmatic expansion** *only if* the current pages are indexing well (cause×city in batches).
- **[Both/Me]** **County engine — Phase A** (per `county-expansion-plan.md`): *after* you source the
  Census dataset **and** the existing 312 pages are indexing healthily, generate all 3,143 county
  pages **`noindex`, sitemap-excluded**, state-by-state (functional + NM9t5 CTAs everywhere, zero
  index-competition risk). Not before both gates are met.
- **[Both]** **SEO re-audit**; **GBP competitor audit**; verify conversion tracking through the launch.

### Month 4 (Days 91–120) — Compound & convert
- **[Me]** **CRO** on top-traffic pages (data-driven); expand winning clusters; prune losers.
- **[Both]** Scale citations + local backlinks (founding merchants/nonprofits, chambers) now you have launch clips.
- **[Me]** **County engine — Wave 0:** flip the **Mississippi counties (~82)** to `index` and confirm
  clean indexing in GSC before any further states. This proves the model on the smallest, most
  relevant wave.
- **[Me]** **Quarterly re-audit + keyword refresh + silo + schema review**; set the months-5–12 cadence.

### Beyond 120 days — county national rollout (months 4–18)
- **[Me]** Flip counties to `index` in **waves of ~3–6 states/month**, prioritized by where Good
  Circles operates, population/demand, and `request-your-area` signals; monitor GSC each wave and
  **pause on any quality dip**. Full safe indexed coverage ≈ **12–18 months** (see
  `county-expansion-plan.md` §9). Generation is fast; indexing is deliberately paced.

---

## 5. Prerequisites & who does what

**Blocked until you act:**
- **Business NAP/address** (virtual mailbox/PO box) → unblocks **GBP, citations, NAP checks**, and marketing email.
- **GBP creation** (your Google account) → unblocks all GBP tasks.
- **GSC request-indexing** (your login) → biweekly.
- **County dataset** → approve sourcing the U.S. Census county/place data (or provide a preferred set)
  before the county engine (Phase A) can be built. See `county-expansion-plan.md` §2.
- **Tool budget decision**: Ahrefs / SurferSEO are optional; the gate + GSC cover the essentials free.

**I can execute in-code now (safe, no churn) — just say go:**
1. `Service`/`Offer` schema on the four pillar pages.
2. A formal **keyword-map doc** in `docs/seo/` (focus keyword per page).
3. **Internal-link / silo audit** with fixes.
4. **GA4 conversion** flags on the signup + CTA events.

**What we deliberately are NOT doing yet (and why):**
- Speculative title/keyword rewrites (no data yet → volatility).
- Bulk new pages / combinatorial city sets (doorway risk until indexed).
- **Bulk-indexing the 3,143 county pages** — they generate as `noindex` and flip to `index` only in
  paced, GSC-monitored waves after the base is proven (see `county-expansion-plan.md`).
- High-volume citation blasts (unnatural velocity).

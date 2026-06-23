# Merchant-Acquisition Funnel (`/sell`) — Architecture & Build Plan

> Goal: attract vendors currently selling on competitor marketplaces by showing,
> honestly and with verified numbers, how Good Circles' 1%-of-profit model plus
> its commercial-co-venture (charitable) structure changes their economics — and
> redirects what other platforms extract into customer savings (~10%) and
> community funding (10% of profit to a local nonprofit). Phased build; quality
> over quantity. This doc is the source of truth for continuing across sessions.

## The honest economics (non-negotiable — read first)

Good Circles per-sale accounting (mirrors `server/src/services/transactionService.ts`
+ `server/src/lib/splitRates.ts`), run all the way to AFTER-TAX. **Methodology revised
2026-06-22 with the owner — do not regress:**

- Revenue is the **list price**. The ~10% customer discount and the 10% nonprofit
  donation are BOTH deductible through the commercial co-venture, so both reduce
  taxable income (shown as: revenue at list, then deduct discount + donation — clean,
  no double-count).
- Net profit = `(0.90 × list) − COGS`; of it nonprofit **10%**, platform **1%**,
  merchant **89%**. Pre-tax profit = `0.89 × net profit`.
- **No merchant card cost** (the customer pays credit card processing if they use a
  card), **no platform commission on the sale**, **no ad spend** (demand comes from
  nonprofit supporters). Competitors carry an editable ad-spend line; GC = $0.
- After-tax profit = pre-tax × (1 − tax rate). The donation is deductible as a §162
  business (cause-marketing) expense — against business AND self-employment income,
  no §170 caps — so $X of community impact costs ~$X × (1 − rate).

**Headline metric = TOTAL LOCAL VALUE CREATED per sale** = after-tax profit + customer
savings + community funding. GC wins on this in every case. On the merchant's *personal
after-tax cash*, the win is margin-dependent: with no competitor ad spend, GC beats fees
above ~`19.9% − 11%×(COGS/price)`; once ad spend counts, GC wins almost everywhere.

**LOCKED WORDING (owner, 2026-06-22):** "a 1% fee on profit", "no ad spend", "no credit
card processing costs", "the giving is tax-deductible". NEVER "no commission" / "no
percentage-of-sale commission" / "no fees" / "free to sell" applied to Good Circles.
NEVER suggest the merchant raise their list price. Tax claims carry "not tax advice —
confirm with your CPA"; the §162 deductibility language still needs the tax attorney's
sign-off (SALT/CCV) before any further expansion. Three honest tiers (field `verdict`
in `src/data/sell-competitors.ts`):

| verdict | who | story |
|---|---|---|
| `win` | DoorDash/UberEats/Grubhub (25–30%), Groupon, Poshmark, pay-per-lead (Thumbtack/Angi) | GC keeps more per sale across realistic margins |
| `depends` | Amazon (15%), eBay (~13.6%), Fiverr (20%, low-COGS) | thin margins favor GC, fat margins favor them — calculator shows the line |
| `redistribution` | Etsy base (~10%), Mercari (10%), Walmart (12%), own store (~3%) | take-home similar; the win is that the margin goes to customer + community, not a platform |

**Never claim a universal per-sale win.** This is the exact trust risk the
2026-06 fabricated-data integrity pass cleaned up. The interactive calculator
(merchant's own price + COGS) is the centerpiece precisely because it tells the
truth for their numbers.

Tax framing: per owner decision (2026-06-22) the charitable 10% is described as
"a charitable contribution that may be tax-deductible — consult your tax advisor."
No quantified tax-savings claims until the SALT/CCV questions resolve.

## Information architecture

- `/sell/` — hub (`src/pages/sell/index.astro`)
- `/sell/marketplace-fees-comparison/` — consolidated SEO/GEO flagship (master fee table + calculator + 3-tier segmentation + end-state thesis)
- `/sell/<competitor>/` — one switch page per competitor
- Calculator embedded on all of the above via `src/components/WhatYouKeepCalculator.astro`

End-state line every page references: *provide every good and service below
today's market cost, turn the savings into household spending power, passively
fund local nonprofits, and grow the seller's bottom line.*

## Files (shipped this session)

- `src/data/sell-competitors.ts` — **single source of truth**: GC math
  (`goodCircles`, `competitorTakeHome`, `gcMatchPrice`), `COMPETITORS[]` (fees,
  models, sources, verified dates, `verdict`), `CALC_PLATFORMS` (calculator config).
- `src/components/WhatYouKeepCalculator.astro` — vanilla `is:inline` calculator
  (no `href="/…"` literals inside the script — the SEO gate scans raw HTML).
- `src/pages/sell/index.astro` — hub.
- `src/pages/sell/marketplace-fees-comparison.astro` — consolidated.
- `src/pages/sell/doordash.astro` — `win` exemplar (restaurants).
- `src/pages/sell/etsy.astro` — `redistribution` exemplar (the honest hard case).
- Wired: `Nav.astro` (Sell link), `Footer.astro` (2 links), `public/llms.txt` (Sell section).

## Keyword map (one focus keyword per page; validate against GSC)

| Page | Focus keyword | Secondary |
|---|---|---|
| `/sell/` | low-fee marketplace for local businesses | sell local online, keep more profit |
| `/sell/marketplace-fees-comparison/` | marketplace seller fees comparison | lowest fee selling platform, seller fees 2026 |
| `/sell/doordash/` | doordash fee alternative for restaurants | restaurant commission alternative |
| `/sell/etsy/` | etsy fees alternative | sell handmade without etsy fees, etsy offsite ads |
| `/sell/amazon/` (backlog) | amazon seller fee alternative | sell without amazon fees |
| `/sell/groupon/` (backlog) | groupon alternative for small business | stop losing money on groupon |
| `/sell/ubereats/`, `/sell/grubhub/` (backlog) | uber eats / grubhub commission alternative | |
| `/sell/ebay/`, `/sell/poshmark/`, `/sell/mercari/` (backlog) | [platform] seller fees alternative | |
| `/sell/thumbtack/`, `/sell/angi/` (backlog) | thumbtack/angi alternative for contractors | pay per lead alternative |

> GSC note: Claude cannot read the owner's browser or Search Console (private),
> and `goodcircles.com` is the lapsed FWM domain (not owned) — the live site is
> `goodcircles.org`. Prioritize/validate these keywords against a GSC top-query
> export when available.

## To add a competitor page (the repeatable pattern)

1. Confirm/refresh the entry in `COMPETITORS` (fee %, model, `verdict`, `source`,
   `verified` date). Re-verify the competitor's fees against their own page and
   update `verified`.
2. Copy `doordash.astro` (for `win`) or `etsy.astro` (for `depends`/
   `redistribution`) to `src/pages/sell/<key>.astro`. Set `hasPage: true`.
3. Use a worked example via `goodCircles(price, cogs)`; for the close cases also
   use `competitorTakeHome` + `gcMatchPrice`. Keep every claim on the honest tier.
4. Embed `<WhatYouKeepCalculator defaultKey="<key>" …/>`.
5. Reuse accuracy-contract phrasing verbatim ("about 10%", "10% of the merchant's
   profit", "keep 89% / 1% fee on profit", "free to join", "First 200 …
   Founding Merchants"); single MERCHANT CTA → `/#mirror-section`.
6. Article + FAQPage + BreadcrumbList JSON-LD (FAQ questions must appear verbatim
   in visible text — pass the same array to `faqJsonLd()` and `<FaqList>`).
7. Add internal links **only** to pages that exist (the SEO gate fails on broken
   internal links). Link new pages from the hub + consolidated when shipped.
8. `cd marketing && npm run build` — must pass `check-seo.mjs` (and `check-citations.mjs`).

## Backlog (next sessions, in priority order)

1. Groupon page (`win`, most dramatic math — voucher discount + ~50/50 split → often a loss).
2. Uber Eats + Grubhub pages (pair with DoorDash; or fold into a food-delivery cluster).
3. Amazon page (`depends` — lead with thin-margin win + the FBA/returns drag).
4. eBay, Poshmark, Mercari (resale cluster).
5. Thumbtack / Angi (services lead-gen — needs a lead-cost calculator variant: cost-per-lead × close-rate, not a %).
6. Fiverr / Upwork (freelance), StyleSeat / Vagaro / Booksy (local booking — subscription + new-client fees model).
7. Calculator v2: lead-gen model (CPL × close rate) + subscription model; optional category presets for typical margins.
8. After founding merchants exist: real testimonials / case studies per vertical.

## Sources (all competitor fees verified 2026-06-22)

Amazon sell.amazon.com/pricing · Etsy etsy.com/sell · eBay ebay.com selling-fees ·
Walmart marketplacelearn.walmart.com · Poshmark seller terms · Mercari help_center/article/169 ·
DoorDash merchants.doordash.com pricing · Uber Eats merchants.ubereats.com/us/en/pricing ·
Grubhub get.grubhub.com · Groupon groupon.com/merchant FAQ · Fiverr Payment ToS ·
Shopify/Square pricing. Re-verify quarterly; update `verified` per entry.

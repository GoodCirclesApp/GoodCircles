# Tax Compliance Implementation Plan

**Status:** Planning only — no implementation until SALT advisor signs off the Confirmation Register in `Good_Circles_Tax_Treatment_Matrix.xlsx`.

**Authoritative source documents (in `Claude deliverables/Good Circles/09_tax_architecture/`):**
- `Good_Circles_Tax_Architecture_Overview.pdf` (read)
- `Good_Circles_Tax_Routing_Spec.pdf` (read)
- `Good_Circles_Tax_Compliance_Build_Plan.pdf` (read)
- `Good_Circles_Tax_Treatment_Matrix.xlsx` — **NOT yet read** (xlsx; not parseable by current tooling). Treated as authoritative on category → regime/rate/path/confirm_status mapping.
- `Good_Circles_Merchant_Agreement_Facilitator_Clause.docx` — **NOT yet read** (docx; not parseable). Treated as authoritative on merchant terms; the implementation must reflect "tax additive, never deducted from 89/10/1."

**Repo root for citations below:** the GoodCircles repo (Express 5 / Prisma / React 19 stack per `CLAUDE.md`).

**Companion plan:** `docs/qr-cash-flow-implementation-plan.md` — covers the in-person cash transaction flow (transaction-bound QR tokens, merchant wallet 11% debit, no-tax-on-checkout per Path B, anti-abuse refund mechanics). Shares this plan's schema additions, invariants, and SALT gates.

---

## 1. Existing-codebase baseline (what's already built that this plan must respect)

Reading the current code, the following load-bearing assumptions exist that the new tax architecture must integrate with, not contradict:

| Surface | Current behavior | File |
|---|---|---|
| Checkout preview | `previewCheckout` accepts `items[]` (productServiceId + quantity), discount mode, credits; returns `PricingService.calculateBreakdown` | `server/src/controllers/checkoutController.ts` |
| Pricing math | `PricingService.calculateBreakdown` sums per-item `calculateDistribution` from `transactionService.ts`; computes subtotal, discount, nonprofit, platform fee, merchant net, processing fee (CARD only), savings vs card | `server/src/services/pricingService.ts` |
| 10/10/1 split | `calculateDistribution` operates on `(msrp, cogs, discountWaived, isInternal, discountMode, creditsToApply)` and returns `{msrp, cogs, profit, neighborPays, neighborDiscount, nonprofitShare, platformFee, merchantNet, waivedContribution, creditIssued, appliedCredits}`. Split is on **net profit** (effective revenue − COGS), not gross revenue | `server/src/services/transactionService.ts:21-76` |
| Transaction model | `Transaction` row carries `grossAmount`, `discountAmount`, `nonprofitShare`, `platformFee`, `merchantNet`, `paymentMethod`, `discountWaived`, `discountMode`, `appliedCredits`, `consumerState`. **No** per-line items — one transaction ↔ one `productServiceId` | `prisma/schema.prisma:348-384` |
| Listing/product model | `ProductService` carries free-text `category`, `type`, `name`, `price`, `cogs`, `upc`. **No** structured taxonomy reference, no tax flags | `prisma/schema.prisma:327-346` |
| Merchant model | `Merchant` carries free-text `businessType`, plus census tract / QIA flags, Stripe account id, region | `prisma/schema.prisma:104-157` |
| QR consumer-ID checkout | `processQrCheckout` requires a `productServiceId`; calls `TransactionService.processTransaction` with `paymentMethod: 'INTERNAL'` — wallet-style, not the intended cash flow | `server/src/controllers/merchantController.ts:664-712` |
| Stripe split | `createCheckoutSession` calculates merchant/nonprofit splits but does **not** pass `application_fee_amount`, `transfer_data`, or destination charges to Stripe — the split is currently only enforced internally in the wallet ledger, not in Stripe Connect | `server/src/services/stripeService.ts:43-87` |
| Booking model | `Booking` has scheduledDate/Time, durationMinutes, status enum, links to `Transaction`. **No** quote price, milestones, residential flag, contractor-tax threshold flag | `prisma/schema.prisma:522-548` |
| Federal tax-reporting service | `TaxReportingService` already exists, but only for **1099-K and INFORM Act** flagging — completely separate from sales tax | `server/src/services/taxReportingService.ts` |
| Consumer state capture | `extractStateFromAddress` already pulls a 2-letter US state from a user's free-text address; written to `Transaction.consumerState` for CCV audit | `server/src/services/transactionService.ts:16-19, 167-189` |

**Implication:** the new sales-tax architecture lands on top of a pricing engine that already exists, computes the split on **net profit** (not gross), and ties one transaction to one product. Both facts shape the integration.

---

## 2. Mapping the routing spec onto the existing codebase

### 2.1 The four routing paths → modules

| Path | What routes here | Integration point in existing code |
|---|---|---|
| **A — Collect at checkout** | Goods, prepared food, TPP repair, enumerated services, rentals, taxable digital, admissions*, lodging* | Extends `previewCheckout` → `PricingService` → `TransactionService.processTransaction`. Adds an additive tax line **after** the existing 89/10/1 calculation, never inside it. New: `TaxRoutingService.resolve(line)` returns `{path, rate, jurisdiction}`; `PricingService.calculateBreakdown` consumes it. |
| **B — Job / quote** | Real-property trades (roofing, HVAC, plumbing, electrical, remodeling, flooring, fencing/hardscape; painting/landscaping*) | **Not currently supported.** `Booking` is for scheduled appointments, not variable-price jobs. New: `Job` (or `Quote`) model with `contract_price`, `residential_flag`, `over_10k_flag`, milestones. New routes: `POST /api/jobs/quote`, `POST /api/jobs/:id/accept`, `POST /api/jobs/:id/milestone`. Reuses `TransactionService` for the payment movement, with `paymentMethod` extended to support job-flow payments. The job flow must **not** call any tax calculation function; this is enforced by Invariant 2. |
| **C — Exempt service** | Professional services (legal, accounting, medical, A&E, financial, real estate, insurance); personal-care services* | `TaxRoutingService.resolve()` returns `path: 'C'` → checkout adds zero tax for that line. Per-line routing in `PricingService.calculateBreakdown` lets goods on the same order route through Path A independently. |
| **D — Hold / conservative** | Any `confirm_pending` category, any unmapped category | `TaxRoutingService.resolve()` returns `path: 'D'`. Two sub-behaviors: goods-like → default to taxable + flag; service-like → block checkout + queue for ops review. Surfaces in a new admin queue (extension of admin portal). |

*Asterisked categories follow Path D until SALT sign-off.

### 2.2 Data model → Prisma additions

The spec's six logical records map to new Prisma models (none of these exist today):

| Spec record | New Prisma model | Notes / fields |
|---|---|---|
| Category Taxonomy | `TaxCategory` | `code` (PK, e.g. `RETAIL_GOODS`), `itemType`, `regime`, `defaultPath` (A/B/C/D), `confirmStatus` (CONFIRMED / CONFIRM_PENDING), `rateKey`, `realPropertyFlag`, `effectiveDate`. Seeded from the matrix workbook. |
| Owned MS Rate Table | `TaxRate` | `rateKey` (PK part), `jurisdiction` (MS, MS-state, MS-CITYNAME, etc.), `rate` (Decimal), `authority` (e.g. `Miss. Code Ann. §27-65-17`), `effectiveDate`, `endDate?`. Multi-state-ready via the jurisdiction column. |
| Item Tax Profile | Extend `ProductService` | Add `taxCategoryCode` (FK → `TaxCategory.code`), `taxCategoryOverride` (nullable, audited), `realPropertyFlag` (derived but storable for explicit overrides). |
| Transaction Tax Record | `TransactionTaxLine` | `id`, `transactionId` (FK), `lineRef` (product/job reference), `path` ('A'/'B'/'C'/'D'), `taxableBase` (Decimal), `rateApplied` (Decimal), `taxCollected` (Decimal), `jurisdiction`, `certificateRef?`. **One transaction can have many tax lines** — this is the unit of audit. |
| Collection Ledger | `TaxCollectionLedger` | `id`, `jurisdiction`, `period` (e.g. `2026-09`), `taxCollected` (sum), `remittanceStatus` ('OPEN' / 'FILED' / 'REMITTED'), `filedAt?`, `tapReference?`. Source for TAP returns. |
| Job Record (Path B) | `Job` (or `Quote`) + `JobMilestone` | `Job`: `id`, `merchantId`, `consumerId`, `taxCategoryCode`, `contractPrice`, `residentialFlag`, `over10kFlag`, `status`, `acceptedAt?`. `JobMilestone`: `id`, `jobId`, `amount`, `dueAt`, `paidAt?`, `transactionId?`. |

Exemption certificates need their own store as well:

| Concept | New Prisma model | Notes |
|---|---|---|
| Exemption / resale certificate | `ExemptionCertificate` | `id`, `userId` (buyer), `type` ('RESALE' / 'NONPROFIT' / 'GOVERNMENT' / 'OTHER'), `certificateNumber`, `documentUrl`, `validFrom`, `validUntil?`, `verifiedAt?`, `verifiedBy?`. Linked via `certificateRef` on `TransactionTaxLine`. |

### 2.3 The four invariants → enforcement points

| Invariant | Enforcement in code |
|---|---|
| **1. Additive tax** — must never reduce the 89/10/1 amounts | `calculateDistribution` (`transactionService.ts:21-76`) stays untouched in its inputs/outputs. The tax line is **appended** at the `PricingService` / `processTransaction` layer, after the distribution is computed. A unit test asserts `nonprofitShare`, `platformFee`, `merchantNet` are equal in both `tax=0` and `tax>0` runs of an identical cart. CI gate on that test. |
| **2. No checkout tax on Path B** | The Path B job flow is a separate code path that never calls `TaxCalculationService.compute()`. A guard in `TaxCalculationService` rejects any input with `path === 'B'` and throws. Audit-logged. |
| **3. No unconfirmed automation** | `TaxRoutingService.resolve()` reads `TaxCategory.confirmStatus`. If `CONFIRM_PENDING`, it forces `path: 'D'` regardless of `defaultPath`. Enforced at the resolver, not at the call sites. |
| **4. Every tax dollar traceable** | Per-line `TransactionTaxLine` write is part of the same Prisma `$transaction` as the `Transaction` write — atomicity guaranteed. A nightly reconciliation job sums `TransactionTaxLine` per `(jurisdiction, period)` and compares to `TaxCollectionLedger.taxCollected`; mismatch raises an alert. |

---

## 3. Epic sequencing reconciled with current architecture

Build plan epics, in the recommended order, with where they touch existing code and what changes.

### Phase 0 — Pre-build gate (SALT)

**HARD GATE.** Nothing in Phases 1-5 ships to production until:

1. Mississippi SALT advisor signs off the Confirmation Register in the matrix workbook
2. The matrix is committed to the repo (as JSON/CSV derived from the xlsx) and marked the canonical source for seed data
3. Marketplace Facilitator registration is filed with MS DOR; TAP account active
4. Merchant agreement updated to reflect the facilitator clause (currently in `Merchant_Agreement_Facilitator_Clause.docx` — not yet read)

### Phase 1 — Foundation (P0)

| Epic | What it changes | Existing-code touch points |
|---|---|---|
| **Epic 1 — Category taxonomy & classification** | New `TaxCategory` model; admin CRUD; seed from matrix; `ProductService.taxCategoryCode` FK; merchant-category-at-onboarding requirement; unmapped → Path D queue | `prisma/schema.prisma`, merchant onboarding (`merchantController.ts` profile + listing create), admin portal (`views/AdminPortalView.tsx`) |
| **Epic 2 — Owned rate table + calculation** | New `TaxRate` model; seed MS rate table; new `TaxRoutingService` (resolver) and `TaxCalculationService` (lookup); effective-dated rate reads | New service files; no breaking changes to existing services |

### Phase 2 — Launch revenue path (P0)

| Epic | What it changes | Existing-code touch points |
|---|---|---|
| **Epic 3 — Path A: checkout collection** | `PricingService.calculateBreakdown` extended to call `TaxRoutingService.resolve` + `TaxCalculationService.compute` per line; returns new `tax_total` + `tax_lines[]` fields; `TransactionService.processTransaction` writes `TransactionTaxLine` rows in the same `$transaction` | `checkoutController.ts`, `pricingService.ts`, `transactionService.ts`, `prisma/schema.prisma` (new `TransactionTaxLine`) |
| **Epic 7 — Collection ledger & TAP remittance** | `TaxCollectionLedger` aggregations populated by a post-commit handler; admin export of MS return figures; manual TAP filing first, automation later | New service `TaxRemittanceService`; admin portal report; no other code touched |

### Phase 3 — Complete the four paths (P0 except where noted)

| Epic | What it changes | Existing-code touch points |
|---|---|---|
| **Epic 4 — Path B: job flow** | New `Job` and `JobMilestone` models; quote → accept → optional deposit → milestone → settle flow; **no** tax line on the resulting `Transaction`; informational note rendered to contractor | New `jobController.ts`, `jobService.ts`, `jobRoutes.ts`; reuses `TransactionService.processTransaction` for milestone payments; merchant portal view extension; **does not** replace the `Booking` model (Booking is for scheduled-appointment services, Job is for variable-price real-property work) |
| **Epic 5 — Path C: exempt service + per-line routing** | `PricingService.calculateBreakdown` already iterates per-item; routing per-line falls out naturally once Epic 1 is done. Per-line routing within a mixed order is the new behavior | `pricingService.ts` (verify per-line independence in tests) |

### Phase 4 — Safety net (P0/P1, runs in parallel from start)

| Epic | What it changes | Existing-code touch points |
|---|---|---|
| **Epic 6 — Path D: hold / conservative default** | Categories with `confirmStatus = CONFIRM_PENDING` and unmapped categories blocked from automated tax assertions; ops queue surfaces in admin portal | `TaxRoutingService` (one branch); admin queue view; no checkout changes if Epic 1 is correct |
| **Epic 9 — Invariants, monitoring, audit** | Invariant guards in `TaxCalculationService` and `TransactionService`; nightly reconciliation cron; alert routing | New `taxInvariantGuard.ts` (called from compute + write paths); new scheduled job; alert integration with existing admin notification surface |

### Phase 5 — Before scale (P1/P2)

| Epic | What it changes | Existing-code touch points |
|---|---|---|
| **Epic 8 — Exemptions, refunds, reversals** | `ExemptionCertificate` model; upload + verify flow; tax-line zero-rating; refund proportional tax reversal extends existing `TransactionRefund` flow | New `exemptionController.ts`; `TransactionRefund` flow extended to also reverse `TransactionTaxLine` rows and ledger aggregation |
| **Epic 10 — Multi-state readiness** | Rate-source abstraction; free-feed ingestion (SST, state DOR, Census TIGER); per-state nexus tracking | New `RateFeedIngestionService`; abstract `TaxRate` reads behind an interface; new `NexusTracker` cron |

---

## 4. Conflicts and duplications with existing code

These are the places where the spec rubs against what's already built — each needs a deliberate decision before implementation:

### 4.1 The 89/10/1 split is computed on NET PROFIT, not GROSS

`calculateDistribution` (`transactionService.ts:43-46`) calculates the split on `effectiveRevenue - cogs`, not on gross. The matrix workbook and the architecture overview both speak of "the discounted price the customer pays" as the taxable base. Those are **different numbers**: the taxable base for Path A is the discounted price *before* COGS subtraction.

**Conflict:** none on the tax side (taxable base is correctly defined as discounted price). But documentation should make clear: tax is computed on discounted price; 89/10/1 is computed on net profit. They are independent calculations on the same line item. The invariant test must use a non-zero COGS to actually catch a regression.

### 4.2 `TaxReportingService` name collision

A service already called `TaxReportingService` exists for 1099-K and INFORM Act federal reporting (`server/src/services/taxReportingService.ts`). Naming the new sales-tax services `TaxRoutingService`, `TaxCalculationService`, `TaxRemittanceService`, `TaxCollectionLedgerService` avoids collision and clarifies that the new work is **sales tax**, not federal income reporting.

### 4.3 Free-text `Merchant.businessType` and `ProductService.category`

Today both are free-text. Migrating to a structured `TaxCategory` reference must be additive (keep the free-text field, add the FK) so existing data isn't broken. A migration job classifies existing listings (best-effort) and flags ambiguities into the Path D ops queue.

### 4.4 One-to-one `Transaction` ↔ `ProductService`

The current `Transaction` table has `productServiceId` as a non-null scalar — there is no concept of multi-line orders at the DB level. The `PricingService` iterates over items but ultimately creates one transaction per item (or implicitly assumes a single-item flow in `processTransaction`).

**Conflict:** Spec requires per-line tax routing within a single payment. Options:
- (a) Continue to create one `Transaction` per line (simplest, preserves current model; the "payment" is then a parent grouping).
- (b) Add a `TransactionGroup` parent so a single Stripe Checkout Session can group N transactions (cleaner).
- (c) Add line-items to `Transaction` and demote `productServiceId` to a per-line field.

Recommendation: **(b)** for minimal disruption — introduce `TransactionGroup` only for the aggregate payment, keep `Transaction` as a per-line record. This is also a blocking question for the user (see Section 7).

### 4.5 Stripe Connect split is not yet implemented

`createCheckoutSession` calculates merchant/nonprofit amounts but never passes them to Stripe (no `application_fee_amount`, no `transfer_data`). This is a pre-existing gap, not introduced by this plan, but it sits in the same code path that needs to grow tax-line support. Sequence the Stripe Connect split work alongside Epic 3 to avoid double-touching the same files.

### 4.6 Booking ≠ Job

The existing `Booking` model is for scheduled-appointment services with fixed pricing. Path B jobs are variable-price quotes with milestones. They are **not** the same thing and should not share a model. Don't extend `Booking` — create `Job` separately. A Path B contractor likely doesn't need `Booking` at all; a Path A appointment-style merchant (haircut, dentist) will use both `Booking` and Path A tax routing.

### 4.7 QR consumer-ID flow vs. Path A checkout

The QR flow (`processQrCheckout`) is a parallel path into `TransactionService.processTransaction`, currently broken for the intended "cash" use case (separate conversation). Once Path A tax is wired in `processTransaction`, the QR flow inherits it automatically — but the cash-payment design needs to be reconciled first or the tax line will be calculated on an incorrect basis.

### 4.8 The `TaxReportingService.trackTransaction` runs post-commit

The existing service is called non-blockingly after commit (`transactionService.ts:302-305`). The new `TaxCollectionLedgerService` write must be **inside the Prisma `$transaction`** to satisfy Invariant 4 (atomicity). Don't follow the existing pattern of post-commit hooks for sales tax — it's the wrong durability model.

---

## 5. Integration points (concrete files to touch)

| Spec element | File(s) to touch or create |
|---|---|
| Path resolution at checkout | `server/src/services/taxRoutingService.ts` (new), called from `server/src/services/pricingService.ts:28-46` |
| Tax computation per line | `server/src/services/taxCalculationService.ts` (new), called from `pricingService.ts` |
| Tax line written with transaction | `server/src/services/transactionService.ts:111-298` (inside the `$transaction` block) |
| Collection ledger aggregation | `server/src/services/taxCollectionLedgerService.ts` (new), called inside the same `$transaction` |
| Category taxonomy CRUD | `server/src/controllers/adminController.ts` (extend; admin endpoints under `/api/admin/tax/categories`) |
| Rate table CRUD | Same admin controller, `/api/admin/tax/rates` |
| Path B job flow | `server/src/controllers/jobController.ts` (new), `server/src/services/jobService.ts` (new), `server/src/routes/jobRoutes.ts` (new) |
| Exemption certificate handling | `server/src/controllers/exemptionController.ts` (new), `server/src/services/exemptionService.ts` (new) |
| Invariant guard | `server/src/services/taxInvariantGuard.ts` (new), called from `taxCalculationService` and `transactionService` |
| TAP remittance reporting | `server/src/services/taxRemittanceService.ts` (new), admin-portal view extension |
| Frontend checkout tax line | `views/CheckoutView.tsx` (or wherever the cart UI sits — verify file name during impl) |
| Frontend merchant onboarding category select | `views/MerchantOnboardingView.tsx` and the merchant profile edit view |
| Frontend admin tax dashboard | `views/AdminPortalView.tsx` (extend) |
| Schema additions | `prisma/schema.prisma` — new models `TaxCategory`, `TaxRate`, `TransactionTaxLine`, `TaxCollectionLedger`, `Job`, `JobMilestone`, `ExemptionCertificate`; extend `ProductService` |
| Seed scripts | New `prisma/seed/tax-categories.ts` and `prisma/seed/tax-rates-ms.ts` (sourced from the matrix workbook) |

---

## 6. SALT-gated items (explicit)

**Canonical source:** `prisma/seed/tax-confirmation-register.json` — 23 items total as of 2026-05-25 (12 from the original matrix workbook + 11 surfaced during the implementation-plan resolution and a documentation completeness audit). The Register is the authoritative agenda for the SALT consult.

The Register splits into two kinds of items:
- **Category-affecting** (#1–#12 from the original matrix, plus parts of #5, #6): determine which of the 31 CONFIRM-pending categories may flip to `CONFIRMED` and onto Paths A/B/C. Until each is resolved the affected categories remain on Path D.
- **Cross-cutting** (#13–#23 added during planning): touch every transaction regardless of category — credit treatment, cash-flow facilitator status, refund mechanics, receipt format, acknowledgment allocation, agreement clause language, contractor liability, milestone tax timing.

Per the spec, the following remain on Path D until a Mississippi SALT advisor signs off the Confirmation Register. **None of these categories may be enabled for automated collection at launch.**

| Open dependency (from routing spec §10) | Categories affected | Default until resolved |
|---|---|---|
| Facilitator collection duty for admissions, lodging, transportation | Admissions, amusement, lodging, ride-share/transportation | Path D (block + queue) |
| Exempt status of personal-care services + taxability of their retail products | Salon, barbershop, spa, nail, massage; retail products sold by same | Service line → Path D; product line → Path D (will move to A on confirmation) |
| Taxability of specified digital products and SaaS | Digital goods, subscriptions, SaaS | Path D |
| Residential and ≤$10k treatment of building trades; painting/landscaping classification | Roofing, HVAC, plumbing, electrical, remodeling, flooring, fencing, painting, landscaping | Path D (real-property variants block from Path A) |
| Municipal prepared-food/lodging levies by city | Any line whose destination city has a local levy | Path D for prepared food + lodging until municipal list signed off |

Of the 57 categories in the matrix, **26 confirmed** rows may proceed to Path A/B/C wiring at launch; **31 CONFIRM rows** must stay on Path D until SALT sign-off.

I have not yet seen the matrix workbook (xlsx not parseable). The exact 26-vs-31 split must be confirmed by reading the actual Confirmation Register before seed data is generated.

---

## 7. Risks and blocking questions

### Risks worth surfacing now

1. **Audit liability transfer.** Owning rate data means owning rate-accuracy liability. MS DOR's 2025 grocery-rate reduction (7% → 5%) is the live example. Mitigation: effective-dated `TaxRate` rows, annual SALT review, default-to-taxable on ambiguity (already in spec).
2. **Per-line tax in a single-product transaction model.** Without the `TransactionGroup` decision (4.4), per-line routing within mixed carts becomes awkward. Cleanest fix is the new parent model; choosing it late forces a schema rewrite.
3. **Invariant 1 enforcement requires test discipline.** "89/10/1 untouched by tax" is easy to break with a one-line refactor. Needs a property-based test (random cart, tax on/off, asserts split unchanged) gated in CI.
4. **Job-flow scope creep.** Path B implies a full quote → milestone → settle workflow. The spec scopes it cleanly (no tax line, just data capture), but the UX surface area is large. Scope: at launch, capture quote and trigger milestone payments via existing `processTransaction`; do not build elaborate revision/approval UX.
5. **Exemption certificate verification.** Spec says "validate and store" but doesn't define how. For launch, accept uploaded image + manual ops verification before the certificate is usable; do not attempt automated cross-checking with state databases.
6. **The QR cash flow is unresolved.** That conversation is in flight separately. Path A computation is correct against the *cash basis* the merchant enters, but only if the merchant-entered amount is the post-discount price the customer actually paid. The cash flow's data model must commit to that before Path A goes live.
7. **No `docs/` directory exists yet.** This file is creating it. Confirm the location is acceptable (vs. `.claude/`, the `Context/` folder, or another path).

### Blocking questions (need answers before implementation begins)

Each question below describes (a) what the current code looks like, (b) what the spec requires, (c) the options to resolve, (d) my recommendation and reasoning, and (e) why the answer blocks downstream work.

**1. Multi-line orders and the `TransactionGroup` decision. — RESOLVED 2026-05-24.**
Decision: `TransactionGroup` parent model (option a). Receipt presentation groups line items by `(path, rate)` — e.g., "Goods (7%)", "Groceries (5%)", "Exempt services" — with subtotal + tax per group and one consolidated final total below. Multi-merchant orders are a launch capability: a single Stripe Checkout Session can fund multiple merchant Connect accounts via Stripe's separate-charges-and-transfers pattern. Three distinct receipt renderings derive from the same `TransactionGroup` data: (a) consumer-combined receipt grouped by `(path, rate)`, (b) per-merchant order summary filtered to that merchant's lines with customer fulfillment info and per-line donation/nonprofit attribution for IRS Pub 1771 acknowledgment, (c) per-nonprofit donation summary filtered to that nonprofit's lines with donor info and DMS-export-ready attribution.

Implementation implications captured in §2.2 (data model) and §4 (conflicts):
- New `TransactionGroup` model: `id`, `consumerId`, `nonprofitId` (elected), `buyerDestination`, `groupSubtotal`, `groupTaxTotal`, `groupDiscountTotal`, `appliedCredits`, `processingFee`, `groupTotal`, `stripeCheckoutSessionId`, `status`, `createdAt`.
- `Transaction` gains `transactionGroupId` FK, `taxCategoryCode`, `path`. Existing 89/10/1 fields remain per-line.
- Multi-merchant Stripe wiring (separate charges + transfers, not single destination charge) is now part of Epic 3 scope — see question 3 below, which is now interrelated.
- Discount and processing-fee allocation across merchants pro-rates by line value within the group.

**Original analysis (kept for record):**
The existing `Transaction` model (`prisma/schema.prisma:348-384`) has a non-null `productServiceId` scalar — every persisted transaction is bound to exactly one product or service. The `PricingService.calculateBreakdown` iterates across multiple cart items in memory, but when those items reach the database they become separate transactions or share a single one ambiguously; the model does not represent a multi-line order. The routing spec, however, explicitly requires per-line independent tax routing within a single customer payment: a cart could contain a taxable retail good (Path A) and an exempt professional service (Path C) settled in one Stripe Checkout Session, and each line must resolve to its own path. There are three structural options to reconcile this. Option (a) introduces a new `TransactionGroup` parent model that represents the customer's single payment, with multiple `Transaction` rows hanging off it as line items; existing transactional logic stays intact and the group is purely a billing aggregator. Option (b) keeps one-transaction-per-line and simply tags each related `Transaction` row with the same Stripe Checkout Session ID for grouping, with no new model. Option (c) refactors `Transaction` itself to demote `productServiceId` to a nullable field and adds a new `TransactionLineItem` child model — the cleanest long-term shape but a heavier rewrite. I recommend option (a) because it introduces only one new table, doesn't disrupt the 89/10/1 calculation pathway, and provides a clean place to store aggregate-payment data (Stripe Session ID, total tax across the group, the shared buyer destination). This question blocks the schema design for `TransactionTaxLine`: option (b) hangs it directly off `Transaction`; option (a) lets some tax data live at the group level since jurisdiction is consistent across lines from one buyer; option (c) changes the entire data shape.

**2. Service conversion flow: Booking → Quote → (one-shot payment | Job + milestones). — RESOLVED 2026-05-24.**
Decision: Replace the original Job-vs-Booking dichotomy with a unified service-conversion state machine. `Booking` remains the entry point for all service flows (fixed-price and variable-price); for variable-price flows it leads to a `Quote`; an accepted Quote either settles as a one-shot payment or transitions to a `Job` with milestone billing. Schema additions:

- **`Booking`** (existing, extended): add `consultFee` (Decimal, default 0) and `consultPaymentTransactionId?`. Even phone/email inquiries become $0 zero-duration Booking records so quote lineage is intact (per resolved sub-decision: Booking required first).
- **`Quote`** (new): `id`, `merchantId`, `consumerId`, `bookingId` (required), `parentQuoteId?`, `status` (DRAFT / ISSUED / ACCEPTED / DECLINED / EXPIRED / SUPERSEDED), `taxCategoryCode`, `realPropertyFlag`, `residentialFlag`, `over10kFlag`, `contractPrice`, `validUntil`, `acceptedAt?`, `declinedReason?`, `expectedFlow` (ONE_SHOT_PAYMENT / JOB).
- **`QuoteLineItem`** (new): `id`, `quoteId`, `description`, `quantity`, `unitPrice`, `lineSubtotal`. Custom quotes carry ad-hoc line items not present in the merchant's catalog.
- **`Job`** (new): `id`, `merchantId`, `consumerId`, `originatingQuoteId`, `currentQuoteId` (updates on accepted revisions), `status` (NOT_STARTED / IN_PROGRESS / AWAITING_REVISION / COMPLETED / CANCELLED), `startedAt?`, `completedAt?`, `cancelReason?`.
- **`JobMilestone`** (new): `id`, `jobId`, `sequence`, `description`, `amount`, `dueAt?`, `status` (SCHEDULED / INVOICED / PAID / CANCELLED), `transactionId?`, `invoicedAt?`, `paidAt?`.
- **`ProductService`** (existing, extended): add `pricingModel` (`FIXED` | `CUSTOM_QUOTE`) so the consumer booking UI branches between straight-to-checkout and consult-quote flows.

Sub-decisions resolved in the same round:
- **Quote origination:** Booking required first. Even phone/email inquiries become a $0 zero-duration Booking record so lineage and attribution are intact.
- **Revision model:** Each revision creates a new immutable `Quote` row with `parentQuoteId` pointing at the prior version. `Job.currentQuoteId` updates when the revision is accepted. Supports side-by-side "original vs current contract" rendering and clean change-order audit.
- **Milestone tax timing (Path A):** Each milestone is its own taxable event; tax is computed on the milestone amount at the rate effective on the milestone's payment date. Each milestone payment writes its own `TransactionTaxLine`. Handles mid-contract rate changes correctly and satisfies Invariant 4 (every tax dollar traceable to a jurisdiction+period entry).
- **Milestone tax timing (Path B):** No `TransactionTaxLine` ever written for a Path B milestone. Contractor self-remits MS contractor's tax (3.5%, >$10k, non-residential) on the contract per the existing MS DOR regime. Invariant 2 enforces this — Path B milestones must not call `taxCalculationService.compute()`.

Tax routing across the conversion flow:

| Event | Path A | Path B | Path C |
|---|---|---|---|
| Consult charge ($0 or fixed) | Tax on top at category rate | Generally Path C if the consult is professional; else category-based | $0 tax |
| One-shot quote payment | Tax on top on quote total (post-10%-discount) | Never reaches this flow | $0 tax |
| Each JobMilestone payment | New `TransactionTaxLine` per milestone at that day's rate | **No tax line** — contractor self-remits | N/A |
| Final billing | Tax on remaining balance | No tax line | N/A |

**Original analysis (kept for record):**
The existing `Booking` model (`prisma/schema.prisma:522-548`) is built for scheduled-appointment services like haircuts or dental visits — it carries `scheduledDate`, `scheduledTime`, `durationMinutes`, and inherits its price from the linked `ProductService`. It has no concept of variable pricing, no milestones, and no contractor-specific fields. The routing spec's Path B (real-property trades like roofing or HVAC) needs a different shape entirely: `contract_price`, `residential_flag`, `over_10k_flag`, and an ordered series of milestone payments instead of one settlement at booking. I am recommending we treat these as genuinely distinct concepts with separate Prisma models: appointments live on `Booking`, variable-price jobs live on a new `Job` model with a related `JobMilestone` child. The alternative would be to extend `Booking` with optional contractor fields and a separate variable-pricing branch, but that conflates two transaction shapes and forces every existing `Booking` call site to start branching on "is this an appointment or a job?" This question is blocking because the Job model's existence affects merchant onboarding (a roofing contractor's signup flow is fundamentally different from a salon's), the merchant portal UI (the job-quote view does not fit in the appointment-calendar view), and the payment flow (milestones vs. one-time payment at booking) — each of those workstreams needs to know whether Job is a new sibling concept or a flavor of Booking before any UI design begins.

**3. Stripe Connect destination-charge wiring and sequencing with Epic 3. — RESOLVED 2026-05-24.**
Decision: Fold the Stripe Connect destination-charge rewiring into Epic 3 as a single consolidated post-SALT change. Both the multi-merchant separate-charges-and-transfers topology and the tax-line emission ship together, behind the SALT hard gate. No pre-SALT partial work on `stripeService.ts` — the files get opened once, reviewed once, regression-tested once.

Implications:
- Epic 3 scope grows to include: (a) new `TransactionGroup` parent + per-line `Transaction` rows, (b) multi-merchant Stripe Connect via separate-charges-and-transfers (one PaymentIntent → per-merchant `Transfer` calls after capture), (c) per-line `TransactionTaxLine` emission inside the same Prisma `$transaction`, (d) consumer/merchant/nonprofit receipt rollups.
- The wallet-ledger split remains authoritative for internal accounting pre-launch (no change); the Stripe rail becomes authoritative for settlement only after the consolidated change ships.
- **Timeline risk flagged:** if SALT confirmation arrives close to the September 2026 launch date, this consolidated change-set is large and concentrated. Mitigation options if SALT slips: (i) hold the launch; (ii) ship the wallet-ledger split as today, defer Stripe Connect rewiring to a post-launch patch, accept the manual-reconciliation burden in the meantime. Option (ii) is a fallback only — the team should target SALT sign-off 4+ weeks before launch to avoid forcing the choice.

**Original analysis (kept for record):**
The existing `createCheckoutSession` in `stripeService.ts:43-87` calculates the merchant, nonprofit, and platform split amounts internally but does not pass them to Stripe — there is no `application_fee_amount`, no `transfer_data`, no destination-charge configuration. The 89/10/1 split currently exists only in the internal wallet ledger, not in Stripe Connect's books. This means at launch, even without sales tax, the platform is reconciling merchant payouts manually from the database rather than letting Stripe enforce the split at the payment rail. Wiring proper Connect destination charges is a P0 blocker for launch independent of any tax work — but it touches the exact same `pricingService.ts`, `transactionService.ts`, and `stripeService.ts` files that Epic 3 (Path A checkout collection) also needs to touch. Doing both in one coordinated change means one review cycle on a known set of files; doing them sequentially means re-opening the same files twice with merge-conflict risk and double the regression-test surface. I recommend folding the Stripe Connect destination-charge wiring into Epic 3 as a prerequisite story rather than running it as a separate workstream. The question is blocking because it changes the launch-path sequencing: Epic 3 either depends on Connect work landing first, or absorbs it, or runs concurrently with constant rebasing.

**4. Category-override audit policy at the listing level. — RESOLVED 2026-05-24.**
Decision: Middle path. Within-regime overrides apply immediately with audit log (e.g., RETAIL_GOODS → PREPARED_FOOD, both Path A at 7%); cross-regime overrides queue for ops review before going live (e.g., RETAIL_GOODS → PROFESSIONAL_SERVICE, which moves the line from Path A to Path C and stops tax collection).

Implementation notes:
- "Cross-regime" defined as: change of `path` (A/B/C/D), change of `realPropertyFlag`, or change of `rate` band (7% / 5% / 3.5% / 0%).
- Every override (in-regime or cross-regime) writes an audit row with `actorId`, `previousCategoryCode`, `newCategoryCode`, `reason?`, `timestamp`.
- Cross-regime overrides set the listing into a `PENDING_REVIEW` state; the listing continues to transact under the *previous* category until ops approves the change (no gap in tax collection during review).
- Ops queue surfaces under the admin portal (same surface as the Path D unmapped-category queue from Epic 6, just a different filter).

**Original analysis (kept for record):**
Story S1.3 in the build plan allows a merchant to override the tax category at the individual listing level — useful for mixed catalogs, such as a salon that sells retail shampoo or a coffee shop that sells branded mugs. The spec says these overrides must be "logged and auditable" but doesn't specify whether they require human review before going live. The policy decision has three plausible shapes. The first is auto-approval with audit log only: the merchant changes the category, the listing transacts under the new category immediately, and ops can audit later. The second is mandatory ops review: every override queues for an ops reviewer before the listing becomes transactable under the new category, which is safe but slow. The third is a middle path: within-regime overrides apply immediately (RETAIL_GOODS to PREPARED_FOOD, for example, both Path A goods), while cross-regime overrides queue for ops because they flip the actual taxability (RETAIL_GOODS to PROFESSIONAL_SERVICE moves Path A to Path C, which means the listing stops collecting tax entirely). I recommend the third option because it concentrates ops attention on the changes that actually affect collection, while letting harmless reclassification flow without bottleneck. This question is blocking because it changes both the listing-edit flow on the merchant side and the admin queue UX on the ops side — engineering needs to know which override scenarios block the listing from activating versus simply log and proceed.

**5. Tax-line visibility surfaces for the consumer. — RESOLVED 2026-05-24.**
Decision: Tax visibility on all four surfaces — cart preview, confirmation screen (pre-pay), receipt screen (post-pay), and confirmation email. The checkout (confirmation screen) and the receipt both render the **full per-item breakdown**, with subtotals per (path, rate) group as established in Q1, and the consolidated final total below. The confirmation email mirrors the receipt verbatim.

Surface-by-surface rendering rules:
- **Cart preview:** tax appears as an estimate (buyer destination may not be fully resolved while the cart is open). On mobile, the cart can collapse the per-group breakdown to a single "Estimated tax" line for space; on desktop, render the same per-(path, rate) groups as the checkout when room allows.
- **Confirmation screen (pre-pay):** full per-item breakdown; per-(path, rate) group subtotals with rate label and tax line; discount, applied credits, processing fee (if CARD), and consolidated final total. Nothing hidden behind tooltips.
- **Receipt screen (post-pay):** identical structure to the confirmation screen, plus payment confirmation and the donation attribution per nonprofit.
- **Confirmation email:** mirrors the receipt exactly. Same per-item breakdown, same per-group subtotals, same final total, same donation attribution.

Engineering surfaces touched: cart view component, confirmation/checkout view, receipt view, and the transactional-email template service. All four must be updated in the same change-set to avoid drift between what the consumer sees on screen vs. in their inbox.

**Original analysis (kept for record):**
The routing spec states that the tax line "is shown to the buyer." In practice the customer interacts with several surfaces during a single transaction: the cart preview while shopping, the final confirmation screen immediately before paying, the post-payment receipt screen, and the confirmation email that follows. The tax line could appear on any subset of these four. I recommend it appear on all four. The cart preview shows it as an estimate (since the buyer destination may not be fully resolved if the customer hasn't confirmed their address); the confirmation screen and the receipt show the final, settled tax amount; the confirmation email mirrors the receipt verbatim. Mobile cart real estate is tight, so the cart-preview line might collapse to a single combined tax row rather than per-jurisdiction breakdown, but it should still appear. The alternative — showing tax only at the final confirmation screen — risks surprising the customer with an unexpected addition to the total at the moment of payment, which is the worst failure mode for tax transparency. This question is blocking because each surface lives in a different view file (cart in one component, receipt in another, email in the transactional-email service), and engineering needs the full target list at the start to avoid the classic "Oh, the email template wasn't updated" gap at launch.

**6. TAP filing automation roadmap. — RESOLVED 2026-05-24.**
Decision: Manual CSV upload at launch. Compilation (the period aggregation from `TransactionTaxLine` → `TaxCollectionLedger` → return-ready CSV) is fully automated inside the platform; the final upload to MS DOR TAP is a deliberate human hand-off by an ops person each filing period. No browser scripting against TAP; no paid managed-filing service. Rewrite S7.3 scope accordingly: "Filing-ready CSV export from `TaxCollectionLedger`, downloaded by ops each filing period and manually uploaded to TAP. Period-status tracking (OPEN / EXPORTED / FILED / REMITTED) lives in the admin portal."

Implementation notes:
- CSV format mirrors MS DOR TAP's accepted upload schema for sales-tax returns (verify exact column layout against current TAP documentation before launch).
- Admin portal exposes: (a) per-period summary view sourced from `TaxCollectionLedger`, (b) "Export filing CSV" button that generates and downloads the file, (c) "Mark filed" / "Mark remitted" actions that update `remittanceStatus` after the human uploads to TAP.
- Filing-deadline reminders: scheduled reminder fires N days before each MS DOR filing deadline (typically the 20th of the following month) so ops doesn't miss a window.
- Automation aspiration moved to Epic 10 (multi-state), where Streamlined Sales Tax member states publish APIs that justify the integration cost.

**Original analysis (kept for record):**
Story S7.3 is currently P1 with the wording "manual first; automate where supported." The Mississippi DOR Taxpayer Access Point (TAP) is a web portal, not an API — it accepts manual logins, form-by-form filing, and for certain return types it accepts CSV uploads. There is no documented programmatic filing API. Automation, if pursued seriously, would mean either Playwright-style browser scripting (which is fragile against UI changes and arguably violates TAP's terms of service) or going through a paid filing partner like Avalara Returns (which violates the owned-stack principle that is the whole point of this architecture). I recommend dropping the "automate where supported" language from S7.3 entirely for the MS launch and rewriting the story scope as "filing-ready CSV export from `TaxCollectionLedger`, downloaded by an ops person each filing period, manually uploaded to TAP." Move the automation aspiration into Epic 10 (multi-state readiness) as a per-state evaluation, because some Streamlined Sales Tax member states do publish APIs and that's where automation actually pays off. This question is blocking because it shapes the admin-export UX: a system built toward "this will be automated someday" has different affordances and quality bars than a system built toward "this is a deliberate human hand-off every filing period."

**7. Matrix workbook ingestion form for the repo. — RESOLVED 2026-05-24.**
Decision: JSON files committed to the repo as canonical seed data. Original xlsx remains the human-facing source. Conversion completed autonomously via Python stdlib (zipfile + xml.etree) — no third-party dependencies installed.

Files produced (2026-05-24):
- `prisma/seed/tax-categories.json` — 57 categories with `categoryCode`, `confirmStatus`, `defaultPath`, `rateKey`, regime, rate, authority, notes
- `prisma/seed/tax-rates-ms.json` — 9 owned MS rate rows
- `prisma/seed/tax-confirmation-register.json` — 12 SALT questions, each with `status: PENDING_SALT_REVIEW`
- `Context/tax-matrix-extracted/*.json` — raw per-sheet extracts (six sheets) for traceability
- `Context/tax-matrix-extract.py`, `Context/tax-matrix-normalize.py` — one-off utility scripts (can be deleted or kept for re-runs)

Counts confirmed against Regime Legend live counts:
- Total categories mapped: **57** (matches workbook)
- Rows needing confirmation (CONFIRM): **31** (matches workbook)
- Confirmed rows: **26** (matches workbook)
- Contractor's-tax (real-property) categories: 8 — all CONFIRM-pending
- Exempt (professional/personal) categories: 7 — 5 confirmed (Path C), 2 pending (Path D)

Default-path distribution **before SALT sign-off**:
- Path A (collect at checkout): **21 categories** — confirmed retail goods, groceries at 5%, confirmed repair services
- Path B (real-property job flow): **0 categories** — all 8 real-property trades are CONFIRM-pending pending residential/≤$10k treatment
- Path C (exempt service): **5 categories** — confirmed professional services
- Path D (held): **31 categories**

**Critical launch implication:** Roofing, HVAC, plumbing, electrical, remodeling, flooring, painting, and fencing all currently route to Path D and cannot transact through the platform until SALT sign-off on the residential/threshold question (Confirmation Register #5). Since the variable-pricing-service conversation that initiated this whole architecture centered on exactly those trades, **SALT confirmation of Confirmation Register #5 should be the highest-priority item on the SALT advisor's worklist.**

**Original analysis (kept for record):**
The category taxonomy and the Mississippi rate table both come from `Good_Circles_Tax_Treatment_Matrix.xlsx`, which I cannot read with current tooling. For engineering to seed the `TaxCategory` and `TaxRate` tables, the workbook needs to exist in the repository in a form that code can consume. Option (a) is to export the matrix to JSON files committed alongside the seed scripts (`prisma/seed/tax-categories.json`, `prisma/seed/tax-rates-ms.json`) with the original xlsx kept in `Context/` as the human-facing source. Option (b) is to export to CSV files ingested by the seed script. Option (c) is to build an admin import that uploads the xlsx and parses it server-side at runtime. I recommend option (a). JSON is the most code-friendly form, it diffs cleanly in pull requests (which matters every time SALT confirms a row and `confirm_status` flips from `CONFIRM_PENDING` to `CONFIRMED`), and a tiny one-time conversion script can produce JSON from the xlsx without standing infrastructure. Option (c) would be overkill for data that changes maybe twice a year. This question is blocking for two reasons: without an answer, the Epic 1 seed step has no input format defined; and I personally need to be able to read the matrix contents (in any text-parseable form) before I can write a more precise plan that names the specific 26 confirmed categories that ship at launch versus the 31 that stay on Path D.

**8. SALT sign-off artifact and the ops process behind it. — RESOLVED 2026-05-24.**
Decision: Two-artifact protocol. The SALT advisor consult happens via video call; the user takes notes during the call and relays the resolved positions to engineering. The artifacts that follow:

1. **Email-confirmation memo (audit artifact).** After the call, the user emails the SALT advisor a written summary of every position confirmed (e.g., "Residential roofing ≤$10k → contractor's tax not applicable; SaaS → taxable at 7%; personal-care services → exempt with taxable retail products; ..."). The advisor replies "I confirm the positions summarized above are consistent with my advice." That email reply is saved as PDF in `Context/salt-signoffs/<date>-salt-confirmation.pdf`. This is the audit-defensible artifact for MS DOR.
2. **Pull request updating the matrix (technical artifact).** A PR updates `prisma/seed/tax-categories.json` to flip `confirmStatus` from `CONFIRM_PENDING` to `CONFIRMED` on the relevant rows, and updates `prisma/seed/tax-confirmation-register.json` to flip `status` from `PENDING_SALT_REVIEW` to `RESOLVED` with the resolution recorded inline. The PR's commit message references the corresponding PDF in `Context/salt-signoffs/` so git history ties to the audit artifact.

Together, the PR makes the change technical, reviewable, and grep-able from git blame; the email-confirmation PDF satisfies a MS DOR auditor who wants to see an artifact the advisor signed off on. Either one alone is weaker than both together.

Implementation note: confirm Context/salt-signoffs/ as the canonical location before the first sign-off lands. Create it on first use.

**Original analysis (kept for record):**
When the SALT advisor confirms a row in the Confirmation Register, the project needs a durable record of what was confirmed, by whom, and when. The artifact could take several forms: a signed memo PDF dropped into a folder, a pull request updating the matrix with the SALT advisor as co-author or reviewer, a signed letter retained separately, or some combination. I recommend two artifacts working together. The first is a pull request that updates the matrix JSON to flip `confirm_status` from `CONFIRM_PENDING` to `CONFIRMED` for the relevant rows, with the SALT advisor's name and the confirmation date in the commit message and a reference to the signed memo. The second is the original signed memo (PDF) committed to `Context/salt-signoffs/` for retention. The PR makes the change technical, reviewable, and tied to a code change that goes through normal review; the memo holds up in a Mississippi DOR audit because it is the actual signed artifact from a credentialed advisor. This question is blocking because it defines the ops handoff between SALT and engineering — without a defined artifact, "SALT sign-off" stays an abstract gate and confirmed rows trickle in informally, which is exactly the audit risk the spec is trying to prevent.

**9. Facilitator-clause re-acceptance for existing merchants. — RESOLVED 2026-05-24.**
Decision: Not applicable. No merchants have signed contracts or accepted any terms of service yet — the beta accounts seeded in the database (marco@theharvesttable.com, lisa@fixitlocal.com, etc., per CLAUDE.md §15) are test fixtures, not live merchants under contract. The merchant agreement including the facilitator clause is being finalized as part of the pre-onboarding refinement pass; every merchant will accept the canonical agreement at first-onboarding.

Implementation notes:
- The existing `Merchant.agreementAcceptedAt` and `Merchant.agreementVersion` fields (`prisma/schema.prisma:118-119`) are already in place to track acceptance — they just haven't been populated because no merchants are live yet.
- At first onboarding, both fields are populated with the canonical agreement version (e.g., `v1.0-2026-09`) and timestamp. New listings and transactions check `agreementAcceptedAt` is non-null before allowing tax-bearing activity.
- No re-acceptance modal, no migration flow, no blocked-listing-until-accepted UX at launch — those become relevant only when the agreement is amended *after* live merchants exist. That's a future-work problem, not a launch problem.
- The seed beta accounts should have `agreementAcceptedAt = NULL` until they're either purged before launch or converted to real merchant accounts (in which case they go through real onboarding and accept the real agreement).

**Original analysis (kept for record):**
The merchant agreement is being updated to include the marketplace-facilitator clause (in `Good_Circles_Merchant_Agreement_Facilitator_Clause.docx`, which I have not been able to read). The clause asserts that Good Circles, as marketplace facilitator, collects and remits sales tax on facilitated sales, and that this tax is added on top of the 89/10/1 split rather than carved out of it. Merchants who signed up under the previous terms have not agreed to that yet. Two options exist for getting them under the new terms. The first is to require all existing merchants to actively re-accept the updated terms before any of their listings can transact with sales tax collected — a modal at next login, an email driving back to the dashboard, blocked listing edits until acceptance. The second is to rely on a "terms update applies on next listing edit or next agreement re-acceptance event" pattern, assuming such a pattern already exists in the codebase (I have not verified that it does). I recommend the first option for the pre-launch beta merchant cohort, because the population is small enough that an explicit re-acceptance is operationally trivial, and the change is structural enough (it determines whether sales tax is collected on their sales at all) to warrant explicit consent. The second option becomes appropriate for downstream agreement tweaks once volume grows. This question is blocking because sales tax legally cannot be collected if the merchant has not agreed to the marketplace-facilitator terms; confirming the re-acceptance flow now means the engineering work lands in time for launch instead of becoming a panic patch when MS DOR registration completes.

**10. Taxable base under `PLATFORM_CREDITS` discount mode. — RESOLVED 2026-05-24.**
Decision: Treat platform credits as gift-card-equivalent. The taxable base for Path A computations is the post-discount price (90% of MSRP) in **both** `PRICE_REDUCTION` and `PLATFORM_CREDITS` modes. The 10% credit accrual is not a tax event. When credits are later redeemed on a future purchase, the credits function as a payment instrument; the taxable base of the redemption purchase is the full retail price of those goods, not reduced by the credit.

Mechanics:
- `taxCalculationService.compute()` consumes the post-discount base ($90 in this example) regardless of which discount-delivery mode the consumer is in.
- `CreditLedger` writes a `CREDIT` entry for the 10% accrual in `PLATFORM_CREDITS` mode (already exists in schema, `prisma/schema.prisma:82-102`). No `TransactionTaxLine` row is associated with the credit accrual.
- The 89/10/1 split still computes on net profit of effective revenue ($90 − COGS); tax does not enter the split (Invariant 1).
- Future redemption: a separate transaction is created on which `taxCalculationService.compute()` is called normally on the full retail base; the redeemed credit is applied as payment *after* tax, reducing `neighborPays` but not the taxable base. This matches how the existing `appliedCredits` field on `Transaction` works (`prisma/schema.prisma:371`).

Cross-mode equivalence verified by worked example:
| Path | At origin: cash paid | At origin: tax | Credit earned | At redemption ($10 on $10 goods): cash | At redemption: tax | Total tax on $100 of retail value |
|---|---:|---:|---:|---:|---:|---:|
| PRICE_REDUCTION | $90 | $6.30 | n/a | n/a | n/a | $6.30 (consumer never redeems anything) |
| PLATFORM_CREDITS | $100 | $6.30 | $10 | $0 (credit covers it) | $0.70 | $7.00 on $110 of cumulative retail face value |

The PLATFORM_CREDITS path ends up with slightly more tax collected ($7.00 vs $6.30) because the consumer ultimately purchases $110 of retail face value over the two transactions ($100 + $10), with $10 of "deferred consumer purchasing power" sourced from the credit. Equivalent tax-per-retail-dollar across both modes; no double-taxation on the same dollar.

Items added to the SALT Confirmation Register for explicit advisor sign-off (since platform-credit-as-gift-card isn't as established in MS jurisprudence as actual gift cards):
- **#13 — Platform-credit accrual.** Confirm MS DOR treats a 10% platform credit accrued at the time of a retail sale as analogous to a gift card sale (no tax event at accrual).
- **#14 — Platform-credit redemption.** Confirm credits act as payment instruments on redemption and do not reduce the taxable base of the redeeming purchase.
- **#15 — Escheat / unclaimed property.** Confirm MS unclaimed-property treatment for expired or long-unused credit balances; informs the platform balance sheet and TOS expiration language.

**Original analysis (kept for record):**
The system supports two consumer-discount delivery modes via `User.discountMode` (`prisma/schema.prisma:25`): `PRICE_REDUCTION`, in which the consumer pays 90% of MSRP at the till and the 10% benefit is a direct price reduction, and `PLATFORM_CREDITS`, in which the consumer pays the full 100% of MSRP at the till and the 10% benefit accrues as platform credits in their wallet for use on a future transaction. For Path A sales tax, the routing spec says the taxable base is "the discounted price the customer pays" — unambiguous in `PRICE_REDUCTION` mode (90% of MSRP), ambiguous in `PLATFORM_CREDITS` mode. I recommend that tax be computed on the price actually charged at the till in each mode: 90% of MSRP in `PRICE_REDUCTION` mode, 100% of MSRP in `PLATFORM_CREDITS` mode. The reasoning is that in `PLATFORM_CREDITS` mode the consumer literally paid 100% — the credit accrual is a subsequent platform-funded promotion, not a contemporaneous discount at the point of sale. From Mississippi DOR's perspective, the merchant collected sales tax on the amount the consumer actually paid; what happens later in the consumer's wallet is a platform mechanic, not a price reduction on the original sale. This is the conservative interpretation and the one a SALT advisor is most likely to endorse, because the alternative (taxing on 90% even when 100% changed hands) requires treating the future credit as a same-transaction discount, which it isn't. This question is blocking because it determines the actual input to `taxCalculationService.ts` — specifically whether the function consumes `effectiveRevenue` (which is 90% in either mode) or `chargedAmount` (which differs between modes). Worth confirming with the SALT advisor as part of the matrix sign-off; it could legitimately be added as a row in the Confirmation Register.

---

## 8. Things in the spec that may be infeasible or need clarification

| Item | Concern |
|---|---|
| Spec says "automate where supported" for TAP filing | MS DOR TAP is a web portal, not an API. Automation likely means scripted submission (Playwright-style) or, more practically, a CSV/PDF export from `TaxCollectionLedger` that ops uploads. The spec wording should be relaxed to "filing-ready export at launch; UI automation deferred." |
| Spec says taxable base is "the price after the 10% discount" | This is unambiguous for Path A retail. But for `PRICE_REDUCTION` mode (consumer pays 90% upfront) and `PLATFORM_CREDITS` mode (consumer pays 100% upfront; 10% accrues as credit later), the taxable base is the same number only when the *transaction*-time price is what's charged. Need to confirm: in `PLATFORM_CREDITS` mode, is tax computed on 100% (what's charged) or 90% (what's effectively kept)? Recommendation: tax on the price actually charged at the till (100% in CREDITS mode); the 10% credit is a subsequent platform-funded promotion, not a price reduction for tax purposes. Worth a SALT confirmation. |
| Path B "informational note shown to the contractor" about contractor's tax | What is the platform's liability if a contractor doesn't self-remit and MS DOR later audits? The spec assumes liability sits with the contractor under the contractor's-tax statute, but a marketplace-facilitator argument could be advanced. Worth explicit SALT confirmation, with the merchant agreement carrying the disclaimer. |
| Annual review workflow (S9.3, P2) | "Annual" is the documented cadence, but the 2025 grocery rate cut shipped mid-year. Suggest moving to "annual + on-notification" (a watch on MS DOR rate-change announcements) before launch, not P2. |

---

## 9. What ships in Phase 0 (planning only, no code)

For the duration of the SALT engagement, the only artifacts to be produced and version-controlled are:

1. **This document.**
2. **`docs/tax-compliance-ticket-to-module-map.md`** (sibling file; the row-by-row story → file mapping).
3. **`Context/`-resident SALT engagement memo** (out of scope here; the user owns the engagement).
4. **A JSON or CSV export of the matrix workbook**, kept in the repo as the canonical category list once SALT sign-off lands. Do NOT generate this from speculation about the matrix; wait until I can read the xlsx (export to CSV) or you paste its contents.

When SALT sign-off happens, the hard gate lifts and Phase 1 begins.

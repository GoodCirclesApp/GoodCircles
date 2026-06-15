# Good Circles — Enterprise Architecture & Iteration Roadmap

*Companion to [ENTERPRISE_AUDIT_2026-06.md](./ENTERPRISE_AUDIT_2026-06.md). Defines the target
("to-be") architecture to meet or exceed enterprise quality across every dimension, and a phased,
do-no-harm remediation roadmap to and beyond the September 2026 launch. Prepared 2026-06-15.*

Guiding principles: **(1)** Fix the cheap, high-severity security/correctness defects first — most
are surgical. **(2)** Make money and data integrity provable (single source of truth, cent-exact,
idempotent, migration-safe) before any live transaction. **(3)** Don't churn what's working; every
change ships behind tests/CI. **(4)** Separate *buildable-now* from *prerequisite-gated* (Stripe
Connect, live keys, SALT consult, business/service registration) — build the code now, flip on at
go-live. **(5)** The marketing surface is already enterprise-grade (B); keep it that way.

---

## 1. Target architecture by layer

### 1.1 Secrets & configuration
- **One validated config module** loaded at boot (zod-parsed `env`), exporting typed values. App
  **fails fast** if any required secret is missing or weak — no `|| 'default_secret'` fallbacks
  anywhere (`tokenUtils.ts`, unsubscribe HMAC, webhook secrets).
- Secrets from the platform secret store (Railway), min-entropy enforced, documented rotation. Move
  JWT to RS256 so verification keys can be distributed without sharing the signing key.

### 1.2 Authentication & authorization
- Keep JWT access(15m)/refresh(7d) + bcrypt-12. Add a **central authorization layer**: every route
  declares required role(s) and ownership rule; a shared guard enforces object-ownership so an
  endpoint cannot be shipped without an explicit access decision (kills IDOR classes like the refund
  route and the Tax-ID/PII exposure). Default-deny.
- Redact confidential fields (merchant COGS, Tax IDs) from any non-owner/non-admin response by DTO,
  not by ad-hoc field-picking.

### 1.3 Webhooks (one standard)
- A single `verifyWebhook(provider)` middleware that **hard-rejects** (400/401) on missing/invalid
  signature — applied uniformly to the primary Stripe webhook (already good), the **catalog Stripe
  webhook (currently unverified)**, and the Resend inbound/delivery webhooks (currently "continue on
  failure"). Mandatory secret in production. Idempotent by event id.

### 1.4 Money & ledger (the core)
- **Single source of truth** for the split (89% merchant / 10% nonprofit of net profit / 1% platform)
  in one module; delete the dead, incorrect 79/10/11-of-charge code in `stripeService`.
- **Decimal everywhere**, **quantized to cents** at settlement boundaries, with a conservation
  invariant test: Σ(payouts) + platform retention == amount captured, to the cent.
- **Idempotency** on every money event (Stripe event id dedupe; idempotency keys on writes).
- **Disbursement (PREREQ — Stripe Connect):** destination charges with `on_behalf_of` +
  `application_fee_amount`, or separate `transfers.create`; `payouts` scheduling; Connect onboarding
  + KYC status tracking. Persist the Stripe charge/payment-intent id on `Transaction` **now** (that
  part is buildable) so refunds and reconciliation have something to act on.
- **Refunds:** real multi-party reversal once Connect is live; the model/auth/plumbing built now.

### 1.5 Data architecture
- **Migration baseline**: generate the first Prisma migration, switch the Railway start command to
  `prisma migrate deploy`, and remove `prisma db push --accept-data-loss`. No destructive sync ever
  runs against production again.
- Money columns → `Decimal` with explicit `@db.Decimal(precision, scale)`; eliminate `Float` money in
  catalog/analytics models. Replace free-text domain "enums" with real Prisma enums. Add indexes on
  hot query paths (foreign keys, status/role filters, time-series). Define PII retention + soft-delete.

### 1.6 Backend platform & observability
- **Structured logging** (pino/winston) with request IDs and user/correlation context; **error
  monitoring** (Sentry) wired to the (repaired, actually-mounted) central error handler that returns
  a safe error envelope and never leaks `error.message` in production.
- Layering discipline (controller → service → data); typed config; **TypeScript `strict` on** with an
  `any` burn-down. CI runs typecheck + the test suite + `npm audit` on every PR.
- **Test pyramid for a payments platform**: money-path integration tests against a real test DB
  (per the "don't mock the DB" rule) — checkout, webhook, refund, disbursement, ledger conservation.

### 1.7 Frontend architecture
- Introduce a **real client-side router** (history API / a router lib) so back/refresh/deep-links
  work; gate the auth screen behind an auth-loading state (no flash).
- **Data-fetching conventions**: every fetch has explicit loading / empty / **error** UI (no silent
  swallow); a shared fetcher with typed errors and toasts.
- **Design system**: a real token layer (the brand CSS vars are currently dead) — colors, type,
  spacing — consumed by components instead of ad-hoc inline styles. Single Tailwind v4 pipeline;
  **remove the v3 CDN dev script** from production.
- **Accessibility baseline** (WCAG AA): labels/ARIA on inputs and interactive elements, semantic
  elements, focus management, AA contrast (fix gold/lavender-on-light text). Wire into CI (axe).

### 1.8 Brand & design consistency
- **"Good Circles" (two words)** everywhere in the app (fix `GoodCircles` occurrences); official
  palette (#7851A9 / #CA9CE1 / #C2A76F) + Montserrat/Fira Sans via the token layer; logo from the
  brand package. The marketing site is the reference; bring the app to parity.

### 1.9 Compliance architecture
- **In-product legal**: privacy / terms / cookies reachable inside the app (not only on marketing),
  with acceptance capture at signup.
- **Data-subject rights**: DSAR/export + deletion + retention schedule for PII/financial data.
- **Money-transmitter-avoidance boundary**: keep the custodial wallet, transferable credits, and
  merchant netting **behind `featureFlagService` flags, OFF**, until the funded/registered phase —
  and guard those endpoints. (See `[[GoodCircles MT-Avoidance Constraint]]` / docs.)
- **Tax / facilitator** (SALT-consult-gated): marketplace-facilitator sales-tax collection + 1099-K;
  IRS 501(c)(3) verification gates nonprofit payouts.
- **FTC**: affiliate disclosure on **every** monetized page (marketing fix below); `rel="sponsored"`.
- **Accessibility/ADA** as a compliance item, not just UX.

### 1.10 Marketing surface (keep at enterprise grade)
- Already B/maturity 4 (SEO/GEO/schema/affiliate engine + build-time SEO gate). Close the two gaps:
  **add FTC affiliate disclosure to all affiliate-bearing pages** (learn/answers/city/county CTAs),
  and hold the thin-content discipline (county engine stays dormant; index in monitored waves).

---

## 2. Phased remediation roadmap (sequenced, do-no-harm)

> Today ≈ June 2026; launch ≈ September 2026. "Buildable now" = independent of the external
> prerequisites. Each phase ships behind tests + the relevant CI gate.

### Phase 0 — Surgical security & correctness quick wins (days; buildable now)
Low-risk, high-severity, mostly self-contained:
- JWT/HMAC **fail-fast config** (remove `default_secret` fallbacks).
- **Catalog Stripe webhook signature verification**; Resend webhooks **hard-reject** on bad signature.
- **Refund authorization** (ownership/role gate) — closes the IDOR.
- **PII gating** (Tax IDs / COGS) behind owner/admin DTOs.
- **SSRF egress filter** on the CRM webhook URL (block private/link-local; scheme allowlist).
- **Repair the central error handler** (mount it; safe envelope; no message leak).
- **Remove the Tailwind v3 CDN** dev script from the production build.
- **FTC affiliate disclosure** across the marketing affiliate pages (the one marketing gap).
- **Wordmark fix** ("GoodCircles" → "Good Circles") in app copy; **in-app donation-math copy fix**
  ("10% of your purchase" → "10% of the merchant's profit"; fix the incoherent role-page example) to
  restore the accuracy contract inside the product.

### Phase 1 — Data integrity & money correctness (weeks; buildable now)
- **Prisma migration baseline** + `migrate deploy`; drop `--accept-data-loss`.
- Decimal precision/scale on money columns; remove Float money; real enums; key indexes.
- **Single-source the split**; delete dead 79/10/11 code; **cent quantization** + conservation test.
- **Webhook/ledger idempotency** (event-id dedupe).
- Persist Stripe charge/payment-intent id on `Transaction` (enables refunds/reconciliation later).

### Phase 2 — Observability, config, and the test pyramid (weeks; buildable now)
- Structured logging + request IDs + Sentry; typed/validated config module.
- TypeScript `strict` + `any` burn-down; CI = typecheck + tests + `npm audit` + (app) axe + SEO gate.
- Money-path integration tests against a real test DB.

### Phase 3 — App correctness, UX & accessibility (weeks; buildable now)
- Client-side router; auth-loading gate; data-fetch loading/empty/**error** conventions.
- Design-token system; component consolidation; WCAG AA pass (labels/ARIA/contrast/focus); real QR
  rendering (replace decorative noise on the cash-payment code).

### Phase 4 — Compliance build-out (weeks; buildable now, SALT items flagged)
- In-app legal pages + signup acceptance; DSAR/export/deletion + retention.
- Feature-flag the custodial wallet / credits / netting OFF and guard them (MT-avoidance).
- Tax/facilitator + 1099-K + IRS-verification design (execution gated on SALT consult).

### Phase 5 — Money-out go-live (prerequisite-gated)
*Unblocked by: SALT consult, business + service registrations, Stripe Connect onboarding, live keys.*
- Build + test Stripe Connect disbursement (destination charges / transfers + payouts + KYC).
- Refund money-movement execution. Live keys + webhook secret swap. Go-live runbook + reconciliation.

### Phase 6 — Beyond launch (months)
- Scale data (indexing, read paths); county-engine indexing waves (per `county-expansion-plan.md`);
  PR/authority for SEO/GEO; SOC2-style controls if enterprise customers (CDFI/municipal) require it.

---

## 3. "Definition of enterprise-ready" (acceptance gates)

- **Security:** no secret fallbacks; every route has an explicit authz decision; all webhooks
  signature-verified + idempotent; no private data to non-owners; `npm audit` clean of high/critical;
  no `error.message` leakage.
- **Money:** one split source; cent-exact conservation test green; idempotent; (live) disbursement +
  refunds reconciled daily.
- **Data:** migrations only (no destructive sync); Decimal money with precision; retention defined.
- **Platform:** structured logs + error monitoring; TS strict; CI green (typecheck/test/audit/axe).
- **Frontend:** routable + deep-linkable; loading/empty/error everywhere; WCAG AA; design tokens.
- **Compliance:** in-app legal + acceptance; DSAR/retention; MT-avoidance flags OFF; FTC disclosure.
- **Brand:** "Good Circles" + official palette/type via tokens; app ↔ marketing parity.

---

## 4. Governance

- Engineering track is now tracked in **`.claude/engineering_priorities.md`** (mirrors Phases 0–5),
  alongside the marketing track — closing the process gap flagged in CLAUDE.md §16.
- The audit is a point-in-time baseline; re-run the multi-agent audit quarterly and before launch.
- Every phase merges behind CI; no live-money transaction until Phase 1 + Phase 5 gates are green.

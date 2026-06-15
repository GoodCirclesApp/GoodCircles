# Engineering Priorities — Good Circles

> The engineering launch track (mirrors the marketing track in `active_priorities.md`). Derived from
> the verified enterprise audit (`docs/ENTERPRISE_AUDIT_2026-06.md`) and architecture
> (`docs/ENTERPRISE_ARCHITECTURE.md`). Update status as items land. Created 2026-06-15.
> Legend: ☐ open · ◐ in progress · ☑ done · 🔒 prerequisite-gated (Stripe Connect / live keys / SALT
> consult / business+service registration — do not block other work on these).

## P0 — Surgical security & correctness (buildable now, do first)
- ☐ Remove JWT/HMAC `default_secret` fallbacks; fail-fast on missing/weak secrets (`utils/tokenUtils.ts`, unsubscribe HMAC)
- ☐ Verify the **catalog** Stripe webhook signature (`routes/catalogRoutes.ts`); hard-reject Resend webhooks on bad/missing signature (`inboundEmailController.ts`, `routes/emailRoutes.ts`)
- ☐ Authorize the **refund** route (ownership/role gate) — closes the IDOR (`routes/refundRoutes.ts`, `services/refundService.ts`)
- ☐ Gate merchant **PII (Tax IDs)/COGS** behind owner/admin DTOs (compliance/netting/credit + marketplace endpoints)
- ☐ SSRF egress filter on the nonprofit CRM webhook URL (`dmsController.saveWebhook`/`crmWebhookService`)
- ☐ Repair/mount the central Express error handler; safe error envelope; no `error.message` leak in prod
- ☐ Remove the Tailwind v3 CDN dev `<script>` from the production app build (double-load)
- ☐ App accuracy/brand fixes: "GoodCircles"→"Good Circles" in app copy; fix in-app role-page donation example + "10% of your purchase"→"10% of the merchant's profit"
- ☐ Marketing: add FTC affiliate disclosure to all affiliate-bearing pages (learn/answers/city/county CTAs)

## P1 — Data integrity & money correctness (buildable now)
- ☐ Prisma **migration baseline** + switch start to `prisma migrate deploy`; remove `db push --accept-data-loss`
- ☐ Money columns → `Decimal` w/ explicit precision/scale; remove `Float` money (catalog/analytics); real Prisma enums; hot-path indexes
- ☐ Single-source the 89/10/1 split; delete dead 79/10/11 code in `stripeService`; cent-quantize; add Σ-conservation test
- ☐ Webhook/ledger **idempotency** (Stripe event-id dedupe)
- ☐ Persist Stripe charge/payment-intent id on `Transaction` (enables refunds/reconciliation)

## P2 — Observability, config, tests (buildable now)
- ☐ Structured logging + request IDs + Sentry error monitoring
- ☐ Typed/validated config module (zod env)
- ☐ TypeScript `strict` on + `any` burn-down
- ☐ CI: typecheck + tests + `npm audit` (+ axe on app, + SEO gate on marketing)
- ☐ Money-path integration tests vs a real test DB (checkout/webhook/refund/ledger)
- ☐ Resolve the 7 `npm audit` vulns (4 moderate / 3 high, transitive)

## P3 — App correctness, UX & accessibility (buildable now)
- ☐ Real client-side router (back/refresh/deep-link); auth-loading gate (no flash)
- ☐ Data-fetch loading/empty/**error** conventions (stop swallowing failures)
- ☐ Design-token system; component consolidation; replace decorative QR noise with a real code
- ☐ WCAG AA pass: labels/ARIA/semantics/focus/contrast (fix gold/lavender-on-light)

## P4 — Compliance build-out (buildable now; SALT items flagged)
- ☐ In-app legal pages (privacy/terms/cookies) + signup acceptance capture
- ☐ DSAR/export + deletion + PII retention schedule
- ☐ Feature-flag custodial wallet / transferable credits / merchant netting OFF + guard them (MT-avoidance)
- 🔒 Marketplace-facilitator sales tax + 1099-K design (gated on SALT consult); IRS 501(c)(3) verification gates payouts

## P5 — Money-out go-live 🔒 (prerequisite-gated)
- 🔒 Stripe Connect disbursement (destination charges/transfers + payouts + KYC/onboarding)
- 🔒 Refund money-movement execution (multi-party reversal)
- 🔒 Live Stripe keys + webhook secret swap; go-live runbook + daily reconciliation

## Keep (verified strengths — don't regress)
- helmet, two-tier rate limiting, bcrypt-12, short-lived JWT + refresh, zod on most write paths,
  parameterized Prisma, merchant/nonprofit object-ownership checks, verified primary Stripe webhook,
  HMAC single-use QR tokens, Decimal in the ledger split, admin audit log, marketing SEO/GEO gate.

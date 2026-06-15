# Engineering Priorities — Good Circles

> The engineering launch track (mirrors the marketing track in `active_priorities.md`). Derived from
> the verified enterprise audit (`docs/ENTERPRISE_AUDIT_2026-06.md`) and architecture
> (`docs/ENTERPRISE_ARCHITECTURE.md`). Update status as items land. Created 2026-06-15.
> Legend: ☐ open · ◐ in progress · ☑ done · 🔒 prerequisite-gated (Stripe Connect / live keys / SALT
> consult / business+service registration — do not block other work on these).

## P0 — Surgical security & correctness — ✅ COMPLETE (all pushed 2026-06-15, Railway green build verified locally: tsc + vite both exit 0)
- ☑ Authorize the **refund** route (ownership/role gate) — closes the IDOR (`routes/refundRoutes.ts`, `services/refundService.ts`). _Done 2026-06-15 (commit 57b579a): only buyer/owning-merchant/PLATFORM admin may refund; others 403. tsc clean._
- ☑ SSRF egress filter on the nonprofit CRM webhook URL (`dmsController.saveWebhook`/`crmWebhookService`). _Done 2026-06-15 (commit 57b579a): new `utils/safeUrl.ts` (`isPublicHttpsUrl`) — requires public https, blocks loopback/private/link-local/CGNAT/cloud-metadata; enforced at save (zod refine→400) + fire (defense-in-depth skip). Residual: DNS-rebinding (noted in file; pin resolved IP later)._
- ☑ Marketing: add FTC affiliate disclosure to all affiliate-bearing pages (learn/answers/city/county CTAs). _Done 2026-06-15 (checkpoint 1, pushed): `AFFILIATE_DISCLOSURE` on 223 affiliate pages, 0 on non-affiliate, SEO gate green at 314 pages._
- ☑ Verify the **catalog** Stripe webhook signature (`routes/catalogRoutes.ts`); hard-reject Resend webhooks on bad/missing signature (`inboundEmailController.ts`). _Done 2026-06-15 (commit 8158095): catalog webhook now `constructEvent`-verifies against the raw body, fails CLOSED with 503 when `STRIPE_WEBHOOK_SECRET` unset (Stripe retries). Resend inbound hard-rejects 401 on missing/invalid Svix sig WHEN `RESEND_WEBHOOK_SECRET` set (prior soft behavior preserved when unset). TODO at go-live: dedicated `CATALOG_STRIPE_WEBHOOK_SECRET` if catalog gets its own Stripe endpoint. No live catalog Stripe traffic today, so deploy-safe._
- ☑ Gate merchant **PII (Tax IDs)/COGS** behind owner/admin DTOs (marketplace endpoint). _Done 2026-06-15 (commit 647ee43): `marketplaceController.listOrders` narrowed Prisma include → drops merchant `taxId`/`stripeAccountId`/address + product `cogs` from the buyer's order list. Verifier ran tsc before+after (both exit 0). NOTE deferred-by-design: the PUBLIC marketplace search exposes `cogs` intentionally (buyer "where every dollar goes" transparency UI reads it) — a separate product decision, not changed._
- ☑ Repair/mount the central Express error handler; safe error envelope; no `error.message` leak in prod (`server.ts`). _Done 2026-06-15 (commit 8158095): adds `res.headersSent` guard (→ next(err)), logs full stack server-side, preserves intentional 4xx messages, genericizes 5xx in production only. Mount order unchanged (last middleware before app.listen)._
- ☑ Remove the Tailwind v3 CDN dev `<script>` from the production app build (double-load). _Done 2026-06-15 (commit a33cfd7): removed from `index.html`; verified compiled Tailwind v4 build covers every used utility (incl. arbitrary values) and `dist/index.html` has 0 CDN refs after `vite build`._
- ☑ App accuracy/brand fixes: "GoodCircles"→"Good Circles" in app copy; fix in-app donation example "10% of your purchase/savings"→"10% of merchant net profit". _Done 2026-06-15 (commit a33cfd7): 37 verified string edits across components/views/constants/manifest; live wire header `X-GoodCircles-Signature` deliberately untouched._
- ☑ Remove JWT/HMAC `default_secret` fallbacks; fail-fast on missing/weak secrets. _Done 2026-06-15 (commit 8158095): new `utils/secrets.ts` `requireSecret()` — JWT access+refresh, unsubscribe HMAC, QR HMAC fail boot in production on missing/weak secret; refresh+QR derive from `JWT_SECRET` when own vars unset. Shipped after owner confirmed `JWT_SECRET` is set & strong in Railway. ⚠️ if `JWT_REFRESH_SECRET` was unset, active refresh sessions re-login once._

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

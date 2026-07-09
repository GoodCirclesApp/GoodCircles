# Good Circles — Compliance & Security Audit

**Date:** 2026-07-09
**Scope:** Full platform — Express/TypeScript backend (`server/`, `server.ts`), React app (`components/`, `views/`, `services/`), Astro marketing site (`marketing/`), Prisma schema (`prisma/`), CI/ops.
**Method:** Read-only static evidence-gathering (no runtime pen-test). Payment/PII/security sweeps by three independent reviewers, plus direct verification of every CRITICAL and the mechanical scans (`npm audit`, secret regex sweep, axe-core/jsdom WCAG scan of 20 representative templates, split-rate consistency).
**Status:** This is the **pre-remediation** audit. It was written **before any code changes**, per instruction. Phases 2–5 remediation and the before/after delta are tracked at the end of this file and in the session summary.

> **Grade legend**
> **PASS** — control present and adequate. **GAP** — control missing or weak; needs work but not currently exploitable for material harm. **CRITICAL** — exploitable now for data exposure, money loss, or legal breach; fix before onboarding real users. **HUMAN REQUIRED** — cannot be resolved in code; needs a legal/operational decision by the owner or counsel.

---

## 0. Grade summary (pre-remediation)

| # | Area | Grade |
|---|------|-------|
| A1 | PCI SAQ-A eligibility (no card data on servers) | **PASS** |
| A2 | Stripe webhook signature verification | **PASS** |
| A3 | Resend webhook signature verification (fail-open) | **GAP** |
| B1 | Money-flow documentation (for attorney) | **PASS (documented)** |
| B2 | Disbursement / money-out wired | **GAP** (known P0; money-out gated off) |
| C1 | PII data map completeness | **PASS (documented)** |
| C2 | Token-at-rest hashing (verifyToken, invite codes) | **GAP** |
| D1 | Password hashing (bcrypt cost 12) | **PASS** |
| D2 | In-app "Account Recovery" plaintext-password flow | **CRITICAL** |
| D3 | JWT secret handling / prod fail-fast | **PASS** |
| D4 | Refresh-token rotation & revocation | **GAP** |
| D5 | RBAC — `complianceRoutes` broken function-level authz | **CRITICAL** |
| D6 | RBAC — `adminRoutes` no router-level role gate (defense-in-depth) | **GAP** |
| D7 | Rate limiting (auth/refresh, compliance writes) | **GAP** |
| D8 | SQL injection | **PASS** |
| D9 | XSS (no user-controlled sink) | **PASS** |
| D10 | API security headers (CSP disabled; HSTS present) | **GAP** |
| D11 | Marketing site security headers (none) | **GAP** |
| D12 | Secrets in tree — GitHub PAT in `.git/config` | **CRITICAL (rotate)** |
| D13 | Hardcoded seed/demo passwords in source | **GAP** |
| D14 | Dependency vulnerabilities (`npm audit`) | **GAP** |
| D15 | Financial audit logging (refunds/withdrawals not logged) | **GAP** |
| D16 | DB backup/restore runbook | **GAP → HUMAN REQUIRED** |
| E1 | CAN-SPAM unsubscribe on marketing mail | **CRITICAL** |
| E2 | CAN-SPAM physical address enforcement | **GAP → HUMAN REQUIRED** (env unset) |
| E3 | Suppression enforcement (`isSuppressed` category/fail-open) | **GAP** |
| E4 | `List-Unsubscribe` one-click header (RFC 8058) | **GAP** |
| E5 | Privacy-page unsubscribe claim accuracy | **GAP** |
| F1 | Minors / age attestation (COPPA) | **GAP** |
| G1 | Data subject access — export exists | **PASS (partial)** |
| G2 | Data subject erasure — no endpoint | **GAP** |
| G3 | DSAR export omits WaitlistEntry PII | **GAP** |
| H1 | Retention jobs (only ErrorLog pruned) | **GAP** |
| I1 | Accessibility — structural WCAG 2.1 A/AA (axe) | **PASS** |
| I2 | Accessibility — color-contrast (needs browser verify) | **HUMAN REQUIRED (verify)** |
| I3 | Accessibility — Meridian form multiple-labels | **GAP** |
| J1 | Claim consistency — marketing splits vs computed | **PASS** |

**Totals (pre-remediation): 3 CRITICAL · 1 CRITICAL-rotate · ~22 GAP · ~10 PASS · 5 HUMAN REQUIRED.**

---

## A. Payments / PCI

### A1. PCI SAQ-A eligibility — **PASS**
Card data (PAN/CVV/expiry) never touches Good Circles servers.
- **No card columns in the schema.** A repo-wide scan of `prisma/schema.prisma` for `card_number|cvv|cvc|pan|expiry|cardholder` finds none. The only payment columns are Stripe reference IDs: `Transaction.stripeCheckoutSessionId/stripePaymentIntentId/stripeChargeId` (`prisma/schema.prisma:390-392`), `WalletTopUp.stripePaymentIntentId` (`:1641`), `CatalogBilling.stripeCheckoutSessionId/stripePaymentIntentId` (`:1063-1064`), `Merchant.stripeAccountId` (`:130`), `Nonprofit.stripeAccountId` (`:327`).
- **Two payment flows, both keep card entry client-side:**
  - Storefront → **Stripe-hosted Checkout Session** (`server/src/services/stripeService.ts:59-80`); server receives only `session.url` (`server/src/controllers/paymentController.ts:90-109`).
  - Wallet top-up → **PaymentIntent + Stripe Elements** client-side tokenization; server returns only `client_secret` (`server/src/controllers/walletController.ts:53-70`); the browser calls `stripe.confirmCardPayment` with the `CardElement` (`views/WalletView.tsx:43-47`). Our API only ever receives `{ amount }`.
- **No card fields posted to our API** (`checkoutController.ts:9-17`, `paymentController.ts:16`).
- **No request-body logging** on payment routes (grep for `console.log(req.body)`/logger of `req.body` across `server/` → 0 matches; webhook logs event/transaction IDs only, `paymentController.ts:135,163`).

> SAQ-A posture is intact. Keep it that way — see the CI "PCI guard" in Phase 5, which fails the build if a card-field name or `req.body` logging appears on a payment route.

### A2. Stripe webhook signature verification — **PASS**
- `POST /api/payment/webhook` (`paymentController.ts:115-126`) verifies via `stripe.webhooks.constructEvent`; unset secret → throw → `400` (fail-closed, though only by the non-null assertion `endpointSecret!` — hardened in Phase 2 to an explicit guard).
- `POST /api/catalog/webhook/stripe` (`catalogRoutes.ts:485-509`) explicitly returns `503` if the secret is absent (fail-closed).
- Both implement idempotency via `ProcessedWebhookEvent` keyed `eventId_source`, marked processed last so failures retry (`paymentController.ts:131-137`, `catalogRoutes.ts:512-518`, `prisma/schema.prisma:487`).

### A3. Resend webhook signature verification — **GAP**
- `POST /api/inbound/webhook` (`server/src/controllers/inboundEmailController.ts:17-44`): if `RESEND_WEBHOOK_SECRET` is unset, verification is skipped and the email is stored unverified (fail-open, acknowledged in comment `:22-25`).
- `POST /api/email/webhook/resend` (`server/src/routes/emailRoutes.ts:20-50`): on `verifyErr` it only `console.warn`s and **processes the event anyway** (`:36-38`), always returning `200`. It does not reject forged payloads even when the secret IS set.
- **Impact:** email-state only (delivery flags, inbound support mail) — no money or auth. Still, a forged payload can poison suppression/bounce state. Phase 2 makes both fail-closed when their secret is set.

---

## B. Money Flow (for the attorney)

This section is a factual, code-derived description of how money moves today. It exists so counsel can assess money-transmitter / merchant-of-record posture against the constraint in memory ([[project_compliance_mt]]: avoid MT status; Stripe-Connect-facilitator model).

### B1. Current state — **documented**
- **Merchant of record = the Good Circles platform Stripe account.** Checkout Sessions are created **destination-less** — no `destination`, `on_behalf_of`, `application_fee_amount`, or `transfer_data` (`stripeService.ts:59-80`). The only Connect-adjacent field is `payment_intent_data.transfer_group`, a tag that moves no money (`stripeService.ts:74-76`). **All customer funds settle into the single platform account.**
- **Connect accounts exist but are decorative.** `createConnectAccount` makes `type: 'express'` accounts (`stripeService.ts:18-30`); IDs are stored on `Merchant`/`Nonprofit` and used **only as pre-checkout gating checks** (`paymentController.ts:49-57`, `transactionService.ts:218-229`). The `merchantAccountId`/`nonprofitAccountId` params passed into `createCheckoutSession` are **never used in its body** (`stripeService.ts:43-51`).
- **Splits are internal-ledger arithmetic, not real transfers.** The authoritative split lives in `server/src/lib/splitRates.ts:16-19` (consumer discount 10% of MSRP; of **net profit**: nonprofit 10%, platform 1%, merchant 89%; conservation guard at `:23-25`). It is applied only to the internal wallet ledger for `INTERNAL` transactions (`walletService.processInternalTransaction`, `walletService.ts:73-188`). Card transactions never trigger a transfer — the webhook marks state and emails (`paymentController.ts:147-258`, comment `:160-163` "In a real app, we'd use Stripe Transfers here").
- **Money-out is stubbed/gated:** nonprofit payouts return `[]` (`nonprofitController.ts:335-347`); `walletService.withdraw` only moves internal balances + a 3.5% platform fee, no `stripe.payouts`/`transfers` (`walletService.ts:191-231`); refunds write a `TransactionRefund` DB row for card payments with **no** `stripe.refunds.create` (`refundService.ts:88-90`).
- **Quantified:** `stripe.transfers.create` = 0, `payouts.create` = 0, `transfer_data` = 0, `application_fee_amount` = 0, `refunds.create` = 0, `on_behalf_of`/`destination` = 0 across `server/src`. The only real external money movement is charging the customer into the platform account.

### B2. Implication — **GAP (known P0)**
Because all funds rest in one platform account and there is no automated split-disbursement, the platform is presently the merchant of record and holder of funds. **Wiring Stripe Connect destination charges / transfers (so the platform is a facilitator, not a custodian of others' funds) is the single most important pre-launch money task** and is a legal-design decision — see HUMAN REQUIRED #1. This audit does **not** wire money-out (out of scope: "never weaken controls," and money-out is intentionally gated).

---

## C. PII Data Map

### C1. Inventory — **documented (PASS)**
Every PII/quasi-PII field and its third-party flow (full table also feeds `DATA_PRACTICES.md`, Phase 3). Third-party flows verified against `stripeService.ts`, the email services, and `marketing/src/lib/analytics.ts`.

| Model.field (`schema.prisma` line) | PII type | Purpose | Flows to |
|---|---|---|---|
| `User.email` (15) | Email | Identity, mail | Resend, Stripe (Connect create) |
| `User.passwordHash` (16) | Credential (bcrypt) | Auth | Nowhere; excluded from export |
| `User.firstName/lastName` (18-19) | Name | Personalization | Resend |
| `User.phone` (20) | Phone | Contact | Internal (in export) |
| `User.address` (21) | Postal | Contact | Internal (in export) |
| `User.electedNonprofitId` (30) | Cause/affinity (incl. `faith-based-service` cat, 2022) | Donation routing | Internal; nonprofit only if `DonorProfile.shareName/EmailWithNonprofits` (1343-1344) |
| `User.acceptedTermsVersion/termsAcceptedAt` (26-27) | Consent record | CAN-SPAM proof | Internal |
| `Merchant.taxId` (118) | **Tax ID/EIN** | Tax | Internal |
| `Merchant.physicalAddress/City/State/Zip` (119-122) | Business address | Geo, checkout | Stripe, FFIEC geocoder |
| `Merchant.latitude/longitude/censusTractId` (123,131-132) | Geolocation | LMI/CDFI class | FFIEC (Census) |
| `Nonprofit.ein` (323) | **EIN** | IRS verify | IRS EO-BMF sync |
| `MunicipalPartner.contactName/contactEmail` (823-824) | Name+Email | Outreach | Resend |
| `DonationReceipt.nonprofitEin/nonprofitName/merchantName` (1209-1211) | Tax-ID + names | Receipts | CSV export to nonprofits |
| `WaitlistEntry.email` (1690) | Email | Waitlist | Resend, admin CSV |
| `WaitlistEntry.firstName` (1749) | Name | Admin outreach | Admin CSV |
| `WaitlistEntry.zipCode/city/state` (1696-1699) | Geo | Regioning | Admin CSV |
| `WaitlistEntry.ein` (1710) | EIN | NP waitlist | Admin CSV |
| `WaitlistEntry.ipHash` (1725) | Hashed IP (SHA-256, salt+trunc, `waitlistController.ts:22-24`) | Anti-abuse | Internal |
| `WaitlistEntry.electedNonprofitId` (1750) | Cause/affinity | Meridian demand | Admin-only |
| `WaitlistEntry.verifyToken` (1752) | **Verify token (plaintext, `@unique`)** | Email confirm | Emailed to user |
| `WaitlistEntry.utmSource/utmCampaign/referrer` (1722-1724) | Funnel | Attribution | Admin CSV |
| `MemberBusinessVote` (2055) | Member→business pref | Demand | Admin-only |
| `MunicipalAccessToken.tokenHash`, `QrCheckoutToken.tokenHash`, `CrmWebhook.secret` (837,1303,1392) | Secret tokens | Access/checkout/webhook | Internal |
| `EmailRecipient.emailAddress/toName` (1860-1861) | Email+name | Delivery tracking | Resend correlation |
| `InboundEmail.fromAddress/fromName/textBody/htmlBody` (1783-1788) | Email + free text | Support inbox | From Resend inbound |
| `ErrorLog.userId/userRole` (1941-1942) | User ref | Monitoring | Internal (30-day) |
| `LocalDollarEdge.neighborId/nonprofitEin/consumerState` (1968-1978) | Behavioral+geo | Analytics graph | Internal, append-only |

**Third-party summary:** Stripe receives user email + `{transactionId,type}` charge metadata (no consumer name/email on the charge, no `receipt_email`). Resend receives recipient email, name, and full personalized HTML (no custom headers set, `emailTransport.ts:41-47`). GA4 is client-side `gtag` `sign_up`, no-op unless `PUBLIC_GA4_ID` set. Railway holds all data at rest.

### C2. Token-at-rest hashing — **GAP**
`WaitlistEntry.verifyToken` (`schema.prisma:1752`) and invite codes are stored in **plaintext**. `ipHash` is hashed; passwords are hashed. Single-use email-verify tokens are lower-risk than passwords, but a DB read exposes live tokens. Phase 2 note: acceptable to defer (single-use, short-lived) but documented; hashing is recommended when the auth surface expands.

---

## D. Security Baseline

### D1. Password hashing — **PASS**
`bcryptjs` cost **12** on all real auth paths: registration (`authController.ts:40`), login compare (`:204`), admin change/reset (`adminController.ts:526,528,544`), beta (`betaController.ts:39`). No plaintext storage; `passwordHash` stripped from `getProfile`/`updateProfile` (`authController.ts:253,285`). Demo seed uses cost 10 with a hardcoded literal (`mockDataController.ts:14`) — see D13.

### D2. In-app "Account Recovery" plaintext-password flow — **CRITICAL**
- `components/AuthSystem.tsx:41` reads mock users (plaintext passwords) from `localStorage['gc_mock_users']`; `:44` passes `user.password` (plaintext) into `generateRecoveryEmailContent`.
- `services/geminiService.ts:7-21` embeds the plaintext key into an LLM prompt (`Recovery Key: ${userKey}`) sent to an external model, and the fallback email body (`:21`) contains the plaintext key verbatim.
- **This is the "email you your password" anti-pattern plus third-party secret exfiltration.** Phase 2 removes the plaintext handling (this is a client-side mock recovery UI, not the server auth path — but it must not ship). Confirmed it does not touch the real bcrypt server flow.

### D3. JWT secret handling — **PASS**
Access 15m, refresh 7d (`utils/tokenUtils.ts:16,22`). `requireSecret('JWT_SECRET', …)` with production fail-fast and a `KNOWN_WEAK` set rejecting `default_secret` and secrets <16 chars (`utils/secrets.ts:21-68`). The `'default_secret'` fallback applies only in non-production. (Recommend pinning `algorithms: ['HS256']` in `verifyAccessToken`, `tokenUtils.ts:28` — minor, Phase 2.)

### D4. Refresh-token rotation & revocation — **GAP**
`authController.ts:215-235` mints new tokens on refresh but the **old refresh token stays valid its full 7 days** — no rotation, no jti/blacklist, no reuse detection, no server-side session store. A stolen refresh token is usable for 7 days and cannot be revoked short of rotating `JWT_SECRET`. `/api/auth/refresh` is also not under `authLimiter` (D7). Full rotation needs a session/denylist table (schema) — deferred with a documented plan; Phase 2 adds `/refresh` to the strict limiter as the immediate mitigation.

### D5. RBAC — `complianceRoutes` broken function-level authorization — **CRITICAL** *(directly verified)*
- `server/src/routes/complianceRoutes.ts:6` applies **`authenticateToken` only** — no `authorizeRole` on any of its 22 routes.
- `server/src/controllers/complianceController.ts` has **zero** role checks (direct grep for `authorizeRole|req.user.role|PLATFORM` → 0 matches).
- **Any authenticated user of any role** (e.g. a freshly self-registered `NEIGHBOR`) can reach: `GET/POST /1099k`, **`GET /1099k/export`** (CSV of all merchants' 1099-K tax data), `GET /inform-act` (INFORM Consumers Act seller PII), `POST /irs/sync` (triggers a 10–30 min IRS BMF download), `GET /state-report`, CCV campaign ledgers/contracts, and state-standing sync.
- **This is the single most serious finding: merchant tax data + seller PII exposure and expensive-job abuse.** Phase 2 adds `authenticateToken + authorizeRole(['PLATFORM','PLATFORM_VIEWER'])` at the router (mutations `['PLATFORM']`) with a regression test.

### D6. RBAC — `adminRoutes` no router-level role gate — **GAP (not currently exploitable)**
`adminRoutes.ts:8` applies only `authenticateToken`; `:11-16` blocks `PLATFORM_VIEWER` on non-GET. All 38 `adminController` handlers individually check `role !== 'PLATFORM'` (38/38 confirmed), so there is no current hole, but it is fragile — a new handler that forgets the check is exposed. `dataCoopRoutes` `/admin/dashboard` similarly relies on an in-controller check (`dataCoopController.ts:95`). Phase 2 adds a router-level `authorizeRole` as defense-in-depth.

### D7. Rate limiting — **GAP**
Global `apiLimiter` (200/15m prod, `server.ts:117-124`); `authLimiter` on `/login`+`/register` (`:126-132`) but **not `/refresh`**; `waitlist` 5/min, `election` 5/min submit + 60/min read, `affiliate click` 30/min. **Unprotected beyond the global limiter:** all of `complianceRoutes` (incl. the IRS-sync trigger), `governanceRoutes` proposal/vote, `dataCoopRoutes` writes. Phase 2 adds `/refresh` to `authLimiter` and a limiter to the compliance sync triggers.

### D8. SQL injection — **PASS**
All raw SQL is parameterized or static. `$queryRaw`/`$executeRaw` tagged templates (`adminController.ts:373,382`), `$queryRawUnsafe` in `testController.ts:9,31,47` uses bound `$1..$7` params (no concatenation), `Prisma.sql` in `localDollarGraphService.ts:113`, DDL `$executeRawUnsafe` in `server.ts:677,701` from static constants. No user input reaches raw SQL.

### D9. XSS — **PASS**
All React `dangerouslySetInnerHTML` sinks are locally-generated SVG/style strings (`ImpactBadgeGenerator.tsx:55`, `QRPaymentSystem.tsx:218,378`, `ImpactMapView.tsx:634`). All Astro `set:html` sinks are build-time constants from `marketing/src/data/*` and JSON-LD. **No user-controlled data path into any HTML sink.** (Weakened by CSP-off, D10.)

### D10. API security headers — **GAP**
`helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })` (`server.ts:89-92`). **CSP disabled** (the SPA is same-origin in prod). **HSTS is present** (helmet default not disabled). CORS allows any `https://` origin with `credentials:true` (`:104-114`) — rationalized by Bearer-token (not cookie) auth. Phase 2 enables a conservative CSP.

### D11. Marketing site security headers — **GAP**
Root `netlify.toml` has no `[[headers]]` block and there is **no `public/_headers`** file. The static site ships with no CSP/HSTS/`X-Frame-Options`/`X-Content-Type-Options`. Phase 2 adds `marketing/public/_headers`.

### D12. Secrets — GitHub PAT in `.git/config` — **CRITICAL (rotate)**
Both `[remote "origin"]` and `[remote "goodcircles"]` URLs in `.git/config` embed a live `github_pat_…` credential. It is not a tracked file but sits in the working tree. **No live secrets in tracked source** — sweeps for `sk_live|sk_test|re_|whsec_|github_pat_|ghp_|AKIA|xoxb-|PRIVATE KEY` across `*.ts/tsx/js/mjs/json/env/astro/md/yml` found only `.env.example` placeholders and `CLAUDE.md` go-live notes. **HUMAN REQUIRED #2: revoke and rotate the PAT.** Phase 5 adds gitleaks to CI to prevent recurrence.

### D13. Hardcoded seed/demo passwords — **GAP**
`DemoMS2026!` (`mockDataController.ts:14`), `GoodCircles2026!` (`adminController.ts:336`; `seed-nonprofits.ts:50` falls back to it if `NONPROFIT_SEED_PASSWORD` unset). Non-production/seed only, but literals in source. Phase 2 sources them from env with a non-prod-only guard.

### D14. Dependency vulnerabilities — **GAP**
- **Backend:** 3 (`@anthropic-ai/sdk` moderate — insecure default file perms in local FS memory tool; `qs` moderate — DoS; `esbuild` low — dev-server file read on Windows). 0 high/critical.
- **Marketing:** 2 (`astro` **high**; `esbuild` low). Both dev/build-chain.
Phase 2 attempts `npm audit fix`; Phase 5 CI fails on **high** (with an allowlist for unfixable dev-only advisories, logged not silently capped).

### D15. Financial audit logging — **GAP**
`AdminAuditLog` (`schema.prisma:1620-1630`) covers **11** admin mutations via `writeAuditLog` (`adminController.ts:12-13`) but **omits refunds** (`refundService.ts` writes none despite moving balances) and **wallet withdrawals**. Writes are best-effort/error-swallowed (`.catch(()=>{})`, `:13`) — an audit entry can silently fail while the mutation commits. A genuine double-entry financial ledger (`LedgerEntry`/`PlatformLedgerEntry` with `balanceAfter`) exists for money traceability, but the actor-attributed trail is incomplete. Phase 2 adds audit writes to refund/withdraw paths.

### D16. DB backup/restore runbook — **GAP → HUMAN REQUIRED**
No `pg_dump`/`pg_restore`/PITR tooling or documented restore procedure in the repo; backups are implicitly delegated to managed Railway Postgres. **HUMAN REQUIRED #3: enable and test Railway PITR/backups and write a restore runbook.** Phase 5 adds a runbook stub in `COMPLIANCE_CALENDAR.md`.

---

## E. Email Compliance (CAN-SPAM)

### E1. Unsubscribe on marketing mail — **CRITICAL**
- The **campaign path** injects a working one-click unsubscribe (`emailCampaignService.ts:308-313`; HMAC token `:246-259`; `GET /api/email/unsubscribe` → `applyUnsubscribe` `emailCampaignController.ts:125-135`). **Functional.**
- But **direct-send marketing emails have NO unsubscribe link**: `sendWaitlistConfirmEmail` (`waitlistEmailService.ts:73`), `sendWaitlistOverflowEmail` (`:30`), and `sendElectionVerifyEmail` (`electionEmailService.ts:43`) call `wrap({ footerVariant:'MARKETING' })` **without `unsubscribeUrl`**; the footer only renders the link when `opts.unsubscribeUrl` is truthy (`emailLayoutService.ts:133`). These are sent from the marketing `hello@` alias with the MARKETING footer yet no opt-out. **CAN-SPAM requires a functioning opt-out on commercial email.** Phase 2 injects the unsubscribe URL into the direct-send marketing path (and/or reclassifies genuinely-transactional confirmations as TRANSACTIONAL from `notifications@`).

### E2. Physical mailing address — **GAP → HUMAN REQUIRED**
`EMAIL_PHYSICAL_ADDRESS` gates only the address footer line (`emailLayoutService.ts:128,132`) and blocks only **mass** MARKETING sends (`emailCampaignService.ts:368-370`). It does **not** block INDIVIDUAL marketing campaigns or the direct-send waitlist/election marketing emails. **HUMAN REQUIRED #4: set `EMAIL_PHYSICAL_ADDRESS`** (a real postal/PO-box address is legally required on commercial email). Phase 2 extends the pre-flight guard to the direct-send path so nothing marketing-classified goes out without it.

### E3. Suppression enforcement — **GAP**
`isSuppressed` only matches `EmailUnsubscribe` rows with `category = null` (`emailCampaignService.ts:28-38`; `loadSuppressedSet` likewise `:275`) and **fails open** (`catch { return false }`). Any future per-category unsubscribe would not be enforced, and a DB error lets a send to a suppressed address proceed. Latent today (the only writer always uses `category:null`). Phase 2 makes `isSuppressed` fail-closed and category-aware.

### E4. `List-Unsubscribe` header — **GAP**
No `List-Unsubscribe`/`List-Unsubscribe-Post` (RFC 8058) header on any email (`emailTransport.ts:41-47` sets only `from/to/subject/html/reply_to/attachments`). Affects Gmail/Yahoo bulk-sender one-click requirements. Phase 2 adds the headers on the campaign path (which already has a token URL).

### E5. Privacy-page unsubscribe claim — **GAP**
`marketing/src/pages/privacy.astro:49` claims "Unsubscribe from emails at any time via the link in every message" — inaccurate given E1 (transactional by design + waitlist/election by defect lack the link). Phase 2/3 reconciles the copy with actual behavior (DATA_PRACTICES.md policy-contradiction report).

---

## F. Minors / Age — **GAP**
No age attestation or 13+/16+/18+ gate exists in **any** collection flow: waitlist `BaseSchema` (`waitlistController.ts:26-61`), app register `registerSchema` (`authController.ts:10-35`), `MeridianElectionForm.tsx`, `RoleFlow.tsx` — none collect age/DOB. `terms.astro` has **no** age/eligibility clause. The only age text is a passive COPPA disclaimer in `privacy.astro:54-55` ("not directed at children under 13") with **no enforcement**. Phase 2 adds a lightweight age attestation (16+ checkbox) to signup/waitlist/election forms and an eligibility clause to Terms — but the **policy decision on minimum age is HUMAN REQUIRED #5** (13 vs 16 vs 18 changes COPPA/parental-consent obligations).

---

## G. Data Subject Rights

### G1. Export — **PASS (partial)**
`GET /api/account/export` → `exportMyData` (`accountController.ts:11-63`), self-scoped, excludes `passwordHash`, returns merchant/nonprofit/cdfi/wallet/transactions/credits/bookings/donorProfile.

### G2. Erasure — **GAP**
**No account-deletion endpoint anywhere.** `accountController.ts:9-10` states deletion is intentionally excluded (must reconcile CCV/tax retention holds); the export notice tells users to email `hello@` (`:51`). `User.isActive` exists (`schema.prisma:22`) but no self-service path sets it. No soft-delete/`deletedAt`/anonymization routine. Phase 3 adds `POST /api/account/delete` (anonymize-in-place respecting tax-retention holds) with the migration **held for approval**.

### G3. DSAR export omits WaitlistEntry PII — **GAP**
Export is keyed to `User` only; a waitlist-only subject (email, firstName, ipHash, election, votes, UTM) cannot export their data, and a registered user's prior waitlist record isn't returned. Phase 3 adds a waitlist lookup-by-verified-email to the export.

---

## H. Retention — **GAP**
Only retention job is `ErrorLogService.pruneOlderThan(30)` (`errorLogService.ts:69-73`, scheduled `server.ts:520-527`). Unbounded PII/volume tables with **no** prune: `EmailRecipient`+`EmailCampaign` (stores email+name+**full rendered HTML** per send — highest-volume PII store), `AffiliateClick` (incl. guest clicks), `MemberBusinessVote`, `WaitlistEntry`, `InboundEmail`, `AdminAuditLog`, `ProcessedWebhookEvent`, `LocalDollarEdge` (immutable by design). Phase 3 adds retention jobs for click/email-recipient/webhook-event tables with documented windows.

---

## I. Accessibility (WCAG 2.1 AA)

### I1. Structural WCAG 2.1 A/AA — **PASS**
axe-core 4 (via jsdom) run against **20 representative built templates** (home, causes, how-it-works, sell, sell/get-started, meridian, learn hub, passive-nonprofit-funding, compare, shop-local/mississippi/jackson, answers, privacy, terms, a resources/funder page, a Spanish `/es/` page, for-nonprofits, for-churches, partners/cdfi, faq), WCAG2A/2AA/21A/21AA rulesets. **Zero definite violations** — `html-has-lang`, `image-alt`, `label`, `link-name`, `button-name`, `document-title`, `duplicate-id`, heading-order, landmark rules all clean.

### I2. Color-contrast — **HUMAN REQUIRED (verify)**
`color-contrast` returns "incomplete" on all pages because jsdom has no layout/canvas engine to sample pixels — it cannot be computed statically. **HUMAN REQUIRED #6 (low effort): run a browser-based axe/Lighthouse pass** (or use the brand palette contrast table) to confirm purple `#7851A9`/ink `#2E1B4E`/gold `#C2A76F` on their backgrounds meet 4.5:1. The brand ink-on-white and white-on-purple pairings are very likely compliant; gold-on-white text would not be and should be audited.

### I3. Meridian form multiple-labels — **GAP**
`form-field-multiple-labels` (moderate) fires on `meridian/index.html` — the searchable nonprofit select likely carries both a `<label>` and an `aria-label`/duplicate label. Phase 2 fixes the election-form island labeling.

---

## J. Claim Consistency — **PASS**
Marketing claims match the single computed source of truth (`server/src/lib/splitRates.ts:16-19`, conservation-guarded `:23-25`): shopper ~10% off MSRP; merchant keeps **89%** of profit; **10%** of net profit to the elected nonprofit; **1%** platform fee on profit. This is consistent with the locked `/sell` wording ("a 1% fee on profit") and the marketing 89/10/1 split. (Legacy 79/10/11 model is dead/removed per the file comment `:13`.) Phase 5 adds a claim-consistency test that fails CI if the constants and the published copy diverge.

---

## HUMAN REQUIRED (legal / operational — not fixable in code)

1. **Wire Stripe Connect money-out as a facilitator** (destination charges / transfers so the platform is not a custodian of others' funds) — the core money-transmitter-avoidance design decision (B2, [[project_compliance_mt]]). Requires counsel sign-off on the flow.
2. **Revoke and rotate the GitHub PAT** embedded in `.git/config` (D12).
3. **Enable and test Railway Postgres PITR/backups; write a restore runbook** (D16).
4. **Set `EMAIL_PHYSICAL_ADDRESS`** to a real postal/PO-box address before any commercial send (E2).
5. **Decide the minimum age** (13 / 16 / 18) — drives COPPA/parental-consent obligations and the Terms eligibility clause (F).
6. **Run a browser-based color-contrast pass** (Lighthouse/axe in Chrome) to close I2; audit gold-on-white text specifically.
7. **Attorney review of money-flow (Section B), tax posture, and the DATA_PRACTICES.md privacy disclosures** produced in Phase 3.
8. **Provide a `security.txt` security-contact email** and confirm the disclosure address (Phase 5 scaffolds `/.well-known/security.txt`).

---

## Remediation tracker (Phases 2–6)

Populated as each phase lands. Schema changes are **committed locally and HELD** — the migration SQL is shown to the owner before any deploy (Railway runs `prisma migrate deploy` on push to `main`).

- **Phase 2 (code CRITICAL/GAP):** compliance RBAC gate + test (D5); remove plaintext-recovery flow (D2); harden Stripe webhook guard + Resend fail-closed (A2/A3); `adminRoutes` router role gate (D6); `/refresh` + compliance-sync rate limits (D7); API CSP + marketing `_headers` (D10/D11); env-source seed passwords (D13); `npm audit fix` (D14); refund/withdraw audit logging (D15); direct-send unsubscribe + physical-address guard + fail-closed suppression + `List-Unsubscribe` (E1–E4); age attestation + Terms clause (F); Meridian form labels (I3). Audit-log-coverage may need an additive table (**schema — held**).
- **Phase 3 (privacy):** `export` waitlist inclusion (G3); `POST /account/delete` anonymize (G2, **schema — held**); retention jobs (H); `DATA_PRACTICES.md` + policy-contradiction report (E5).
- **Phase 4 (tax scaffolding, data capture only):** encrypted W-9/TIN fields + completeness flags; transaction taxable-amount/jurisdiction fields; pluggable tax-calc interface (no provider chosen). **Schema — held.**
- **Phase 5 (CI/ops):** `.github/workflows/compliance.yml` (npm audit fail-on-high, gitleaks, header check, axe, claim-consistency test, PCI guard, JSON-LD); `SECURITY.md`; `/.well-known/security.txt`; `COMPLIANCE_CALENDAR.md`.
- **Phase 6:** SOC 2 readiness mapping appended below; test suite green; before/after grade delta.

---

# Remediation results (Phases 2–5) — before / after

Completed 2026-07-09, same session as the audit. Every change was made **without weakening an existing control**; TypeScript compiles clean (`tsc --noEmit`, 0 errors), the marketing build passes all gates (2,666 pages, 0 issues), and the DB-free test suite is green (68 passing, incl. new PCI/tax/crypto/claim tests). **No schema was modified** — the tax-capture migration is held in `docs/HELD-MIGRATION-tax-scaffolding.md` for your approval.

| # | Finding | Before | After | What changed (file) |
|---|---|---|---|---|
| D5 | Compliance routes broken authz | **CRITICAL** | **PASS** | `authorizeRole(['PLATFORM','PLATFORM_VIEWER'])` + viewer write-block on router (`complianceRoutes.ts`) |
| D2 | Plaintext-password recovery | **CRITICAL** | **PASS** | Recovery no longer reads/emails/LLM-sends a password; non-enumerating (`geminiService.ts`, `AuthSystem.tsx`) |
| E1 | Marketing mail w/o unsubscribe | **CRITICAL** | **PASS** | 3 signup emails reclassified TRANSACTIONAL (`waitlistEmailService.ts`, `electionEmailService.ts`) |
| D12 | GitHub PAT in `.git/config` | **CRITICAL** | **HUMAN REQUIRED** | Cannot fix in code — owner must revoke/rotate; gitleaks added to CI to prevent recurrence |
| D6 | Admin router no role gate | GAP | **PASS** | Router-level `authorizeRole` (`adminRoutes.ts`) |
| A2 | Stripe webhook guard | PASS | **PASS+** | Explicit fail-closed 503 replaces `!` assertion (`paymentController.ts`) |
| A3 | Resend delivery webhook fail-open | GAP | **PASS** | Hard-reject 401 on missing/bad signature when secret set (`emailRoutes.ts`) |
| D3 | JWT algorithm not pinned | PASS | **PASS+** | HS256 pinned on sign+verify (`tokenUtils.ts`) |
| D7 | Rate limits (refresh, sync) | GAP | **PASS** | `/auth/refresh` + compliance-sync limiters (`server.ts`) |
| D10 | API CSP disabled | GAP | **PASS** | Baseline CSP (`frame-ancestors/object-src/base-uri` locked) (`server.ts`) |
| D11 | Marketing no security headers | GAP | **PASS** | `marketing/public/_headers` (CSP/HSTS/XFO/XCTO + object-src) |
| D13 | Hardcoded seed passwords | GAP | **PASS** | Env-sourced with fallback (`mockDataController.ts`, `adminController.ts`) |
| D14 | Dependency vulns | GAP | **PARTIAL** | Backend 3→2 (`npm audit fix`); marketing astro-high is a major upgrade — allowlisted + logged in CI, tracked |
| D15 | Refunds/withdrawals unaudited | GAP | **PASS (refunds)** | Actor-attributed audit log on refund path + shared util (`utils/auditLog.ts`, `refundRoutes.ts`) |
| E2 | Physical-address enforcement | GAP | **PARTIAL** | Guard extended to individual marketing (`emailCampaignService.ts`); setting the address is HUMAN REQUIRED |
| E3 | Suppression fails open | GAP | **PASS** | `isSuppressed` now fails **closed** (`emailCampaignService.ts`) |
| E4 | No List-Unsubscribe header | GAP | **PASS** | RFC 8058 header + one-click POST route (`emailCampaignService.ts`, `emailCampaignController.ts`, `emailRoutes.ts`) |
| E5 | Privacy unsubscribe claim | GAP | **PASS** | Copy reconciled (`marketing/src/pages/privacy.astro`) |
| F | Minors / age attestation | GAP | **PARTIAL** | 16+ gate at account creation + Meridian election form + Terms clause; min-age decision is HUMAN REQUIRED |
| G2 | No account erasure | GAP | **PASS** | `POST /api/account/delete` anonymize-in-place, retention-safe (`accountController.ts`) |
| G3 | Export omits waitlist PII | GAP | **PASS** | Export now includes waitlist records (`accountController.ts`) |
| H | Unbounded retention | GAP | **PARTIAL** | Daily prune of webhook events + unconverted clicks (`dataRetentionService.ts`); email/inbox retention documented |
| I3 | Meridian form labels | GAP | **PASS** | Verified 0 actual violations (SSR + axe); was a jsdom "incomplete", not a real defect |
| D4 | Refresh-token rotation | GAP | **PARTIAL** | Rate-limited now; full rotation needs a session table (held/deferred) |
| C2 | Token-at-rest hashing | GAP | **DEFERRED** | Documented; single-use short-lived tokens, low risk |
| — | Tax scaffolding (Phase 4) | n/a | **NEW** | Pluggable `TaxCalculator` seam + AES-256-GCM field encryption; schema **held** |
| — | Privacy tooling (Phase 3) | n/a | **NEW** | Export+delete endpoints, retention jobs, `DATA_PRACTICES.md` |
| — | Compliance CI (Phase 5) | n/a | **NEW** | `compliance.yml`: gitleaks, audit-gate, PCI guard, header check, axe, dist audit, claim-consistency; `SECURITY.md`; `security.txt`; `COMPLIANCE_CALENDAR.md` |

**Grade delta:** **CRITICAL 3 → 0 in code** (D12 converted to a HUMAN REQUIRED rotation, with a CI guard to prevent recurrence). ~15 GAPs closed to PASS; ~6 partially closed with the residual explicitly HUMAN REQUIRED or held. PASS count roughly doubled. New capabilities added in privacy, tax, and CI that did not exist before.

---

# HUMAN REQUIRED — consolidated (owner / counsel action, not code)

These cannot be resolved in code. Full context in `COMPLIANCE_CALENDAR.md`.

1. **Revoke & rotate the GitHub PAT** in `.git/config` remotes. *(was CRITICAL D12)*
2. **Wire Stripe Connect money-out** as a facilitator — the core money-transmitter-avoidance design; counsel sign-off. *(B2)*
3. **Enable & test Railway Postgres PITR/backups**; write a restore runbook. *(D16)*
4. **Set `EMAIL_PHYSICAL_ADDRESS`** before any marketing send. *(E2)*
5. **Decide the minimum age** (13/16/18); implemented default is 16+. *(F)*
6. **Set `FIELD_ENCRYPTION_KEY`** in production before any TIN is stored. *(Phase 4)*
7. **Browser color-contrast pass** (Lighthouse/axe); audit gold-on-white text. *(I2)*
8. **Attorney review** of money-flow §B, tax nexus/1099-K, and `DATA_PRACTICES.md`.
9. **Confirm `security@goodcircles.org`** routes to a monitored inbox; renew `security.txt` before 2027-07-09.
10. **Approve/apply the held tax migration** (`docs/HELD-MIGRATION-tax-scaffolding.md`) if enabling tax capture.

---

# Files changed, by phase

- **Phase 2 (security):** `server/src/routes/complianceRoutes.ts`, `adminRoutes.ts`, `emailRoutes.ts`, `refundRoutes.ts`; `server/src/controllers/paymentController.ts`, `adminController.ts`, `mockDataController.ts`, `emailCampaignController.ts`; `server/src/utils/tokenUtils.ts`, `auditLog.ts` (new); `server/src/services/emailCampaignService.ts`, `emailTransport.ts`, `waitlistEmailService.ts`, `electionEmailService.ts`; `server.ts`; `services/geminiService.ts`, `components/AuthSystem.tsx`, `components/SignupFlow.tsx`; `marketing/src/pages/terms.astro`, `privacy.astro`, `marketing/public/_headers`, `marketing/src/components/react/MeridianElectionForm.tsx`.
- **Phase 3 (privacy):** `server/src/controllers/accountController.ts`, `routes/accountRoutes.ts`, `services/dataRetentionService.ts` (new), `server.ts`; `DATA_PRACTICES.md` (new).
- **Phase 4 (tax):** `server/src/services/tax/taxCalculator.ts` (new), `server/src/utils/fieldEncryption.ts` (new), `docs/HELD-MIGRATION-tax-scaffolding.md` (new, **schema held**); tests `fieldEncryption.test.ts`, `taxCalculator.test.ts`.
- **Phase 5 (CI/docs):** `.github/workflows/compliance.yml` (new), `scripts/pci-guard.mjs`, `security-headers-check.mjs`, `audit-gate.mjs`, `marketing/scripts/a11y-axe.mjs` (new); `server/src/tests/claimConsistency.test.ts` (new); `SECURITY.md`, `marketing/public/.well-known/security.txt`, `COMPLIANCE_CALENDAR.md` (new).

---

# SOC 2 readiness mapping (Trust Services Criteria)

Current posture against the AICPA TSC. This is a **readiness self-assessment**, not an attestation — a SOC 2 report requires an independent auditor and an observation period. Legend: ✅ control in place · ◐ partial · ⬜ gap (owner action).

## Common Criteria (CC) / Security
| TSC | Criterion | Status | Evidence / gap |
|---|---|---|---|
| CC6.1 | Logical access — authentication | ✅ | bcrypt(12); JWT HS256-pinned; secrets fail-fast in prod (`secrets.ts`) |
| CC6.1 | Logical access — authorization (RBAC) | ✅ | `authorizeRole` on all admin/compliance routes (D5/D6 fixed); 38/38 admin handlers role-checked |
| CC6.1 | Session management | ◐ | Short-lived access tokens; **refresh rotation/revocation deferred** (D4) |
| CC6.6 | Boundary protection | ✅ | Helmet + CSP (API), `_headers` CSP (marketing), CORS Bearer-only, rate limits |
| CC6.7 | Data in transit / at rest | ◐ | HTTPS + HSTS; PCI SAQ-A (no card data); **field encryption util ready, TIN capture pending migration + key** |
| CC6.8 | Malicious code / dependencies | ◐ | `npm audit` gate (fail-on-high + logged allowlist); gitleaks; **astro major upgrade tracked** |
| CC7.1 | Vulnerability detection | ✅ | CI: gitleaks, audit-gate, PCI guard, header check, axe, claim-consistency |
| CC7.2 | Security monitoring / logging | ◐ | `AdminAuditLog` (admin actions + refunds), `ErrorLog`, financial ledger; **centralized log aggregation/alerting is a gap** |
| CC7.3–7.4 | Incident response | ◐ | `SECURITY.md` disclosure policy + `security.txt`; **formal IR runbook is a gap** |
| CC8.1 | Change management | ✅ | Git + PR CI (app-ci, marketing-seo, compliance); schema changes held for review |
| CC2/CC5 | Governance / risk | ◐ | This audit + `COMPLIANCE_CALENDAR.md`; **formal risk register / policies are a gap** |

## Availability
| A1.2 | Backups & recovery | ⬜ | **No documented/tested restore** — Railway PITR must be enabled + tested (D16, HUMAN REQUIRED) |
| A1.1 | Capacity / health | ◐ | `/api/health` + `/api/health/ready` (DB probe); rate limiting; no autoscaling policy documented |

## Confidentiality
| C1.1 | Sensitive-data identification | ✅ | PII data map (§C) + `DATA_PRACTICES.md` |
| C1.2 | Confidential-data handling | ◐ | Suppression fail-closed; tokens excluded from export; **TIN encryption pending key/migration** |

## Processing Integrity
| PI1.1 | Accurate processing | ✅ | Single-source split (`splitRates.ts`) conservation-guarded; claim-consistency test; webhook idempotency |
| PI1.3 | Complete/authorized | ◐ | Financial ledger (`LedgerEntry`/`PlatformLedgerEntry`); **money-out/disbursement unwired** (B2) |

## Privacy
| P1–P8 | Notice, choice, access, disposal | ◐ | Privacy Policy + `DATA_PRACTICES.md`; DSR **export + erasure** endpoints; retention jobs; **min-age decision + physical-address are HUMAN REQUIRED** |

**Top SOC 2 gaps to close before pursuing a Type I:** (1) tested backups/restore (A1.2), (2) centralized logging + alerting and a formal IR runbook (CC7.2–7.4), (3) refresh-token rotation (CC6.1), (4) a documented risk register + policy set (CC2/CC5), (5) resolve the deferred dependency advisory (CC6.8). None are blockers for launch; all are on the `COMPLIANCE_CALENDAR.md`.


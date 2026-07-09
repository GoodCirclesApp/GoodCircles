# Good Circles — Data Practices

**Last updated:** 2026-07-09
**Owner:** Good Circles (goodcircles.org)
**Purpose:** Internal + reference record of what personal data Good Circles collects, why, who it is shared with, how long it is kept, and how data-subject rights are honored. Derived from the PII data map in `COMPLIANCE_AUDIT.md` §C. This document informs — but is not a substitute for — the public Privacy Policy at `/privacy`.

> This is an operational/engineering record. It is written to be accurate to the code as of the date above. When the schema or a data flow changes, update this file and the audit's §C together.

---

## 1. Categories of personal data collected

| Category | Fields (model) | Collected from | Purpose |
|---|---|---|---|
| Account identity | `User.email`, `firstName`, `lastName`, `phone`, `address`, `passwordHash` | Account signup | Authentication, personalization, receipts |
| Cause preference | `User.electedNonprofitId`, `DonorProfile.*` | Signup / profile | Routing donations to the user's chosen nonprofit |
| Consent record | `User.acceptedTermsVersion`, `termsAcceptedAt` | Signup | Proof of Terms acceptance (16+ eligibility) |
| Merchant business | `Merchant.taxId` (EIN), `physicalAddress/City/State/Zip`, `latitude/longitude`, `censusTractId`, `stripeAccountId` | Merchant onboarding | Payouts, tax, LMI/CDFI classification |
| Nonprofit org | `Nonprofit.ein`, `stripeAccountId` | Nonprofit onboarding | IRS verification, donation routing |
| Payment references | `Transaction.stripe*Id`, `WalletTopUp.stripePaymentIntentId`, `CatalogBilling.stripe*Id` | Checkout | Reconciliation, refunds. **No card numbers/CVV/expiry are ever stored** (PCI SAQ-A). |
| Waitlist / early access | `WaitlistEntry.email`, `firstName`, `zipCode/city/state`, `ein`, `ipHash`, `electedNonprofitId`, `verifyToken`, `utmSource/utmCampaign/referrer` | Waitlist + Meridian election forms | Early-access demand, regioning, anti-abuse, email verification |
| Demand signals | `MemberBusinessVote`, `EntitySuggestion` | Meridian election form | Private/admin-only local demand data |
| Email delivery | `EmailRecipient.emailAddress/toName`, `EmailCampaign.bodyHtml`, `EmailSuppression`, `EmailUnsubscribe` | Every send | Delivery tracking, suppression, CAN-SPAM opt-out |
| Support inbox | `InboundEmail.fromAddress/fromName/textBody/htmlBody`, `InboundEmailReply` | Inbound email | Customer support |
| Financial ledger | `LedgerEntry`, `PlatformLedgerEntry`, `DonationReceipt.*`, `AdminAuditLog` | Transactions/admin actions | Money-movement traceability, tax, audit |
| Analytics graph | `LocalDollarEdge.*` | Settled transactions | De-identified local-recirculation analytics (immutable) |
| Operational logs | `ErrorLog.userId/userRole` | Runtime errors | Debugging/monitoring |

Sensitive/quasi-sensitive to note: cause/affinity preference (may include `faith-based-service` categories), EINs/Tax IDs, hashed IPs. `passwordHash` is a one-way bcrypt hash (cost 12); `ipHash` is a salted SHA-256 truncation; `verifyToken`/access tokens are credentials and are never included in exports.

## 2. Third parties data flows to

| Processor | Data sent | Purpose |
|---|---|---|
| **Stripe** | User email + type (Connect account create); charge metadata `{transactionId, type}` | Payments. No consumer name/email is placed on the charge; no `receipt_email`. Card data is entered directly on Stripe (hosted Checkout / Elements) and never transits our servers. |
| **Resend** | Recipient email + name + full personalized HTML | Transactional & marketing email delivery + delivery/inbound webhooks |
| **Railway** | All data at rest (Postgres) | Hosting |
| **Google Analytics 4** | Standard client-side identifiers (GA client id, IP, UA) via `gtag` | Aggregate web analytics. No-op unless `PUBLIC_GA4_ID` is set. |
| **FFIEC / US Census** | Merchant business address | Census-tract / LMI geocoding |
| **IRS EO-BMF** | Nonprofit EIN | Tax-exempt status verification |

## 3. Retention

| Data | Retention | Mechanism |
|---|---|---|
| Error logs | 30 days | `ErrorLogService.pruneOlderThan(30)` daily (`server.ts`) |
| Webhook idempotency keys (`ProcessedWebhookEvent`) | 90 days (`RETAIN_WEBHOOK_EVENTS_DAYS`) | `dataRetentionService.runDataRetention()` daily |
| Unconverted affiliate clicks (`AffiliateClick` with no conversion) | 180 days (`RETAIN_UNCONVERTED_CLICKS_DAYS`) | `dataRetentionService.runDataRetention()` daily |
| Financial/tax records (`Transaction`, `LedgerEntry`, `DonationReceipt`, `AdminAuditLog`) | **Retained** for legal/tax obligations (min. 7 years recommended) — **not auto-pruned** | Policy |
| `LocalDollarEdge` | Immutable/append-only by design | Policy |
| Email delivery records (`EmailRecipient`/`EmailCampaign`) | **Owner-configurable policy — no auto-prune yet** | See "Open retention items" below |
| Inbound support email | Retained until manually cleared (admin "delete read") | Manual |

**Open retention items (documented, not yet automated):** `EmailRecipient`/`EmailCampaign` (stores email + full rendered HTML per send) and `InboundEmail` are not auto-pruned because they are referenced by reporting/webhook-correlation and support workflows; automating their prune (e.g. 24-month window, keeping aggregate counts) is a recommended follow-up. Tracked in `COMPLIANCE_CALENDAR.md`.

## 4. Data-subject rights (implemented)

- **Access / portability:** `GET /api/account/export` returns the caller's account data **and** any waitlist records keyed to their email as a JSON download (excludes `passwordHash` and live tokens). (`accountController.exportMyData`)
- **Erasure:** `POST /api/account/delete` (requires `{ "confirm": true }`) anonymizes the account in place — scrubs email/name/phone/address and matching waitlist PII (incl. `ipHash`, `verifyToken`, UTM), deactivates the account, and records an `AdminAuditLog` entry. **De-identified** financial/tax records are retained as required by law. (`accountController.deleteMyAccount`)
- Both endpoints require authentication and are self-scoped (`req.user.id`); no admin can be impersonated and no other user's data is reachable.

## 5. Security measures (summary)

Passwords bcrypt cost 12; JWT HS256-pinned (15-min access / 7-day refresh); role-based access control on all admin/compliance routes; rate limiting on auth, waitlist, election, affiliate, and compliance-sync endpoints; parameterized SQL only; no user-controlled HTML sinks; helmet security headers + CSP on the API and a `_headers` CSP on the marketing site; Stripe & Resend webhooks signature-verified (fail-closed when the secret is set); suppression checks fail-closed. Full detail and residual gaps in `COMPLIANCE_AUDIT.md`.

## 6. Policy-contradiction reconciliation

The public `/privacy` page previously stated users could "unsubscribe from emails at any time via the link in every message." That was inaccurate: transactional/operational messages (receipts, verifications, security/account notices) intentionally carry **no** unsubscribe link (they are CAN-SPAM-exempt relationship mail), and three formerly-"marketing"-classified signup emails lacked one. Both have been reconciled:

- The three signup emails (waitlist confirm, waitlist overflow, election verify) are now correctly classified **TRANSACTIONAL** (sent from `notifications@`, operational footer) — they are confirmations of user-initiated actions, not commercial email. (`waitlistEmailService`, `electionEmailService`)
- Genuine **marketing** campaigns include a working one-click unsubscribe link **and** an RFC 8058 `List-Unsubscribe`/`List-Unsubscribe-Post` header, and are blocked from sending unless `EMAIL_PHYSICAL_ADDRESS` is set. (`emailCampaignService`)
- The `/privacy` copy now accurately distinguishes marketing (opt-out available) from transactional/operational messages. (`marketing/src/pages/privacy.astro`)

No remaining known contradiction between stated policy and system behavior as of the date above.

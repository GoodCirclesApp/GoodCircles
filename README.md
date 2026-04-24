# Good Circles L3C — Platform README

## Quick Start

**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `GEMINI_API_KEY`, etc.
3. Run migrations: `npm run prisma:migrate`
4. Seed beta accounts: `npm run seed:beta`
5. Start dev server: `npm run dev`

## Beta Accounts

Password for all: `BetaTest2026!`

| Email | Role |
|---|---|
| admin@goodcircles.org | Platform Admin |
| alice@beta.test | Consumer |
| bob@beta.test | Consumer |
| marco@theharvesttable.com | Merchant |
| contact@localfoodbank.org | Nonprofit |

---

## Compliance Automation — Implementation Status

Good Circles L3C operates under a triple-impact economic model (10% consumer savings / 10% of merchant profit to elected nonprofit / 1% platform fee) which creates Commercial Co-Venturer (CCV) obligations in 5 states. This section documents the compliance automation plan.

### Phase 1 — Pre-Launch (COMPLETE)

- **CCV Checkout Disclosure** — Statutory language ("By completing this purchase, you are directing $X.XX to [Selected Charity] via Good Circles L3C. No portion of the purchase price is tax-deductible for the consumer.") rendered dynamically in CartDrawer.tsx with exact dollar amount.
- **Merchant Onboarding Compliance Flow** — Updated MerchantOnboarding.tsx adds: EIN (already existed), physical business address (street/city/state/zip), click-wrap Merchant Services Agreement with timestamped acceptance stored to database (`agreementAcceptedAt`, `agreementVersion` on Merchant model).
- **IRS Nonprofit Verification System** — `IrsVerificationService` + `IrsNonprofitRecord` model in DB. Monthly sync architecture in place (`/api/compliance/irs/sync`). All platform nonprofits seeded into the verification table at startup. In production, replace the sync stub with IRS EO BMF + Pub78 + Auto-Revocation bulk download (free, no API key required).
- **Transaction CCV Audit Log** — Every transaction now tagged with `consumerState` (extracted from consumer's address). `TaxReportingService.trackTransaction()` called non-blocking after every settled transaction to maintain running 1099-K and INFORM Act totals.

### Phase 2 — Within 90 Days of Launch (COMPLETE)

- **Compliance Dashboard** (`/admin → L3C Compliance`) — 4-tab admin view:
  - *Filing Calendar* — Pre-seeded deadlines for all 5 states + federal. Color-coded by jurisdiction/urgency. One-click "Mark Done" with timestamp.
  - *Mission Report* — Auto-generated quarterly mission multiplier report (total GTV / total nonprofit donations / platform fees / ratio vs. 10:1 target). Exportable JSON for Minute Book.
  - *Tax Reporting* — 1099-K tracker (merchants crossing $600 threshold flagged and notified via Resend). INFORM Act queue (merchants exceeding 200 transactions or $5K revenue flagged for identity verification).
  - *IRS Verification* — Manual EIN lookup + sync log viewer.
- **1099-K Tracker** — `TaxReportingFlag` model tracks gross sales per merchant per year. `POST /api/compliance/1099k/notify` sends Resend emails. `GET /api/compliance/1099k/export` downloads CSV for IRS filing.
- **INFORM Act Tracker** — `InformActFlag` model tracks transaction count + revenue per merchant per year. Admin queue at `GET /api/compliance/inform-act`.
- **CCV Campaign Manager** — `CcvCampaign` model + endpoints for tracking campaign start/end dates with auto-calculated state deadlines (MS: 7-day notice, AL: 15-day registration, MS report: +30 days, AL closing: +90 days).

---

## Phase 3 — Pre-Multi-State Expansion (Complete Before Operating in All 5 States)

> **Handle before expanding marketing beyond Mississippi and Wyoming.**

### 3A. Marketplace Facilitator Sales Tax (Stripe Tax)
**What:** Auto-collect and remit sales tax in states where Good Circles crosses economic nexus thresholds ($100K revenue or 200 transactions in most states).
**Action:** Integrate Stripe Tax (`stripe.tax.calculations.create`) at checkout. Enable only after nexus thresholds trigger.
**Cost:** ~0.5% of transactions or flat Stripe fee.
**Do NOT build in-house.** Sales tax rules change constantly per state; use Stripe Tax or TaxJar.

### 3B. State-Specific Post-Campaign Report Generator
**What:** Machine-readable export of CCV closing reports for Mississippi (within 30 days of campaign end) and Alabama (within 90 days).
**Action:** Extend `TaxReportingService.getStateReport()` to generate formatted PDF/CSV output matching state AG template fields: total gross receipts, total charitable proceeds, proof of transfer dates, EIN of beneficiary charity.
**Integration point:** `GET /api/compliance/state-report?state=MS&startDate=...&endDate=...` (already exists — needs PDF formatter).

### 3C. Advanced CCV Campaign Manager
**What:** In-app CCV campaign tracker with pre-filing alerts.
**Action:** Build notification layer on top of existing `CcvCampaign` model. When a campaign is created, schedule email alerts 7 days before MS notice deadline and 15 days before AL registration deadline.
**Integration point:** Use Resend + `emailService.sendEmail()` (already wired).

---

## Phase 4 — Human Required (Cannot Be Automated)

> **These items must be handled by a registered agent, attorney, or directly by Good Circles management. Track deadlines in the Compliance Dashboard → Filing Calendar.**

| Item | Who | When | Cost |
|---|---|---|---|
| Wyoming L3C Annual Report | Registered Agent | April 15 annually | $62 |
| Mississippi Foreign Qualification | Attorney / Registered Agent | Once, before MS operations | $258 |
| Alabama Foreign Qualification | Attorney / Registered Agent | Once, before AL operations | $178 |
| Louisiana Foreign Qualification | Attorney / Registered Agent | Once, before LA operations | $150 |
| Florida Foreign Qualification | Attorney / Registered Agent | Once, before FL operations | $125 |
| Georgia Foreign Qualification | Attorney / Registered Agent | Once, before GA operations | $225 |
| Alabama Surety Bond ($10,000) | SuretyBonds.com or similar | Before AL operations | ~$100-150/yr premium |
| Alabama CCV Registration | Alabama AG portal | 15 days before first AL campaign | $100 |
| CCV Written Contracts with charities | Attorney (one template, reuse) | Before each charity's first campaign | Legal cost once |
| BOI FinCEN Filing | FinCEN BSAEFILING system | At formation; update within 30 days of ownership change | $0 |
| Federal Tax Return (Form 1065) | Accountant | March 15 annually | Accounting cost |
| Corporate Minute Book maintenance | Management (use compliance dashboard exports) | Ongoing | $0 |
| Quarterly Written Resolutions | Manager signature required | Quarterly | $0 |
| Alabama Closing Statement | Management | Within 90 days of each AL campaign end | $0 |
| Mississippi Post-Campaign Notice | Management | Within 30 days of each MS campaign end | $0 |
| Privacy Policy legal review | Attorney | On material changes | Legal cost |

---

## Architecture Notes

- All compliance data stays on Good Circles' own servers. No third-party receives transaction data for verification purposes.
- IRS data is free and authoritative — no commercial nonprofit verification API needed.
- The 10:1 Mission Multiplier (nonprofit share / platform fee) is enforced at the transaction calculation level in `transactionService.ts` and verified quarterly by the Compliance Dashboard Mission Report.
- Consumer state is captured from User.address field at transaction time for CCV audit trail purposes.

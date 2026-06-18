# QR Cash-Flow Implementation Plan

**Status:** Planning only — implementation blocked by the same SALT hard gate as the tax-compliance plan, plus specifically by Confirmation Register #16 (which determines whether the merchant or the platform remits sales tax for cash sales).

**Companion documents:**
- `docs/tax-compliance-implementation-plan.md` — shares Path A/B/C/D routing, `TransactionGroup`, `TransactionTaxLine`, the merchant wallet, and the 89/10/1 split
- `docs/tax-compliance-ticket-to-module-map.md` — per-story file mapping

---

## 0. Current implementation status — acknowledged limitations (2026-06-18)

The full in-person QR system is **intentionally DEFERRED to the SALT consultation**, which will be completed **before launch (target Sept 2026)**. This is a deliberate gate, not an oversight. State of the shipped code as of this date:

- ✅ **QR generation** renders a real, scannable code (commit `9f5c3c1` — previously it drew decorative noise that encoded nothing).
- ✅ **Scanner fixed** (commit `3e2aca4`) — `HandshakeScanner` previously truncated the scanned value to 6 upper-cased characters, while the real token is a ~158-char case-sensitive HMAC; every scan failed. It now reads the full token.
- ✅ **Token mint/validate backend is sound** (`qrCheckoutService.ts`): HMAC-signed, single-use (`usedAt`), 5-minute TTL, user-mismatch + expiry checks.
- ⛔ **Settlement is NOT production-ready.** `processQrCheckout` settles via the custodial wallet (`paymentMethod:'INTERNAL'`), which is **disabled at launch** by the `enable_internal_banking` feature flag (money-transmitter avoidance). It therefore functions only for seeded beta/demo wallets — real consumers cannot complete an in-person QR payment today.
- ⛔ **The intended cash flow (this document, "Epic 11") is unbuilt** and stays unbuilt until the SALT advisor confirms Confirmation Register **#16** (merchant vs platform remits sales tax on cash sales) and **#5** (Path B trades). See §7 and §9.

**MT-avoidance note for counsel (raise at the SALT / fintech-attorney consult):** the cash design as written moves money through *internal custodial wallets* (debit merchant wallet → credit nonprofit wallet → credit platform treasury, §3.3). That is the same custodial machinery the money-transmitter-avoidance constraint defers to a licensed/BaaS phase. The MT-clean implementation likely collects the 11% via **Stripe Connect from the merchant's connected account** and transfers the nonprofit's 10% to **its** connected account — i.e., Epic 11 depends on the Stripe Connect disbursement layer (enterprise roadmap P5). Confirm that "the merchant pre-funds a platform wallet and the platform holds the nonprofit's 10% donation" does not itself create money-transmitter / tax-escrow exposure before building §3.

This section will be revisited when the SALT engagement completes and Epic 11 begins.

---

## 1. Purpose

Give consumers a way to purchase goods and services from local merchants **in cash**, in person, through Good Circles — receiving the same 10% benefit (price discount or platform credit) and routing the same 10% net-profit donation to their elected nonprofit, while the merchant honors the 89/10/1 economics by paying the platform fee and the nonprofit donation from their platform-wallet balance rather than from cash collected.

The only operational difference from online sales: the cash never touches the platform's payment rails. The merchant collects 100% of cash from the consumer (post-discount in `PRICE_REDUCTION` mode, full MSRP in `PLATFORM_CREDITS` mode, plus any sales tax). The platform-fee and nonprofit-donation portions move via internal wallet ledger entries instead of Stripe transfers.

---

## 2. Existing-codebase baseline

| Surface | Current state | File |
|---|---|---|
| QR token generation | 5-minute HMAC token tied to `consumerId` only. Single-use. | `server/src/services/qrCheckoutService.ts` |
| QR token validation | Consumes token; returns `consumerId` to caller. | Same |
| QR redemption endpoint | `processQrCheckout` requires `productServiceId` at scan time; calls `TransactionService.processTransaction(paymentMethod='INTERNAL')` — wallet-style, not cash. | `server/src/controllers/merchantController.ts:664` |
| Transaction payment methods | `'INTERNAL'` (wallet) and `'STRIPE'` (online card). **No `'CASH'` branch.** | `server/src/services/transactionService.ts:139, 195, 197` |
| Merchant wallet | `Wallet` model with balance + ledger entries; `WalletTopUp` model exists. | `prisma/schema.prisma:386-412` |
| `QrCheckoutToken` schema | Stores `userId`, `tokenHash`, `expiresAt`, `usedAt`. Thin consumer-ID record. | `prisma/schema.prisma` (referenced from service) |
| Stripe Connect split | Computed internally but **not actually wired to Stripe** (no `application_fee_amount` / `transfer_data`). | `server/src/services/stripeService.ts:43-87` |

**Implication:** the current QR plumbing covers ~10% of the intended feature. The token-generation mechanism is sound, but the redemption flow, payment-method branch, wallet-debit logic, and consumer-side transaction-binding all need to be built.

---

## 3. Locked design (decisions captured 2026-05-24/25)

### 3.1 Model

The QR token is **transaction-bound and single-use**. The consumer pre-creates the cash transaction in the app — selecting merchant + listing/quote/milestone + confirming amount + (implicitly) snapshotting their elected nonprofit and discount mode — and the system generates a QR that encodes that specific pending transaction. The consumer presents the QR (digital or printed) to the merchant; the merchant scans it and the transaction settles with all parameters already bound.

### 3.2 Pre-conditions (enforced at QR generation)

1. Consumer account active; elected nonprofit set (force-elect before allowing QR generation); `discountMode` chosen.
2. Merchant account active; agreement accepted; the referenced listing/quote/milestone exists and is active.
3. Merchant's platform wallet balance ≥ 11% of estimated net profit on the transaction. If insufficient, the QR generation is allowed but the scan blocks at the merchant side with a "Top up wallet to continue" message — see §3.6.
4. For variable-price merchants: the transaction must reference a `Quote` or `JobMilestone` (Q2-architecture entities), which carries both price and COGS in the merchant reporting layer.

### 3.3 The intended cash flow

```
1. Consumer opens app
2. Consumer initiates a payment to a specific merchant:
   - For catalog purchases: select listing, confirm quantity/price
   - For service quotes: select an accepted Quote or specific JobMilestone
3. App snapshots: consumerId, merchantId, productServiceId | quoteId | jobMilestoneId,
   cashAmountCents (final), nonprofitId, discountMode
4. App creates a PendingCashTransaction record holding all parameters; generates a
   QR token referencing it. expiresAt = now + 30 days.
5. Consumer presents QR to merchant in person (digital or printed)
6. Consumer hands cash to merchant: post-discount price + sales tax (per Path A
   routing, computed inside the app and displayed; the merchant collects in cash)
7. Merchant scans QR in their POS view
8. Merchant POS:
   - Verifies QR signature + lookup of PendingCashTransaction
   - Pre-flight check: merchantWallet.balance >= 0.11 × estimatedNetProfit
       ├── INSUFFICIENT → "Top up wallet to continue" — block; no settlement
       └── SUFFICIENT  → proceed
9. Atomic Prisma $transaction:
   - Create Transaction (paymentMethod='CASH'; ref to listing/quote/milestone;
     all amounts; consumerState captured for CCV audit)
   - Create TransactionTaxLine (path; rate; jurisdiction;
     remittanceResponsibility='MERCHANT' — excluded from platform TAP export)
   - DEBIT merchant wallet 11% of net profit (10% nonprofit + 1% platform)
   - CREDIT nonprofit wallet 10% of net profit
   - CREDIT platform treasury 1% of net profit
   - If PLATFORM_CREDITS mode: CREDIT consumer CreditLedger 10% of effective revenue
     (per Q10 gift-card model in the tax plan)
   - Mark PendingCashTransaction.redeemedAt
10. Post-commit (non-blocking) receipts fire:
    - Consumer: in-app receipt + email (full per-(path, rate) breakdown per tax plan Q5)
    - Merchant: order summary (line items, customer fulfillment info, donation attribution)
    - Nonprofit: donation summary, DMS-ready donor info
    - IRS Pub 1771 acknowledgment to merchant for the donation
```

### 3.4 Path B (real-property job) cash settlements

For a roofer or HVAC contractor settling a Job milestone in cash, the QR references a `JobMilestone`:

- No sales tax line displayed (Invariant 2 from the tax routing spec)
- Merchant collects only the milestone contract amount in cash
- Merchant wallet still debited 11% of net profit on the milestone
- Contractor's tax (3.5% > $10k, non-residential) remains the contractor's separate obligation to MS DOR, outside the platform

### 3.5 Discount-mode behavior in cash

| Mode | Consumer cash paid (excl. tax) | Cash to merchant | Consumer credit accrued |
|---|---:|---:|---:|
| `PRICE_REDUCTION` | 90% of MSRP | 90% of MSRP | $0 |
| `PLATFORM_CREDITS` | 100% of MSRP | 100% of MSRP | 10% of effective revenue (= 10% of MSRP) |

Tax (Path A) is computed on 90% of MSRP in both modes per Q10 of the tax plan (gift-card-equivalent treatment for the credit accrual). The merchant collects the tax amount in cash on top of either 90% or 100% depending on mode.

### 3.6 Insufficient-wallet behavior

When the merchant's wallet balance is below the 11% threshold at scan time:

- The scan does not settle. The merchant POS shows "Insufficient wallet balance. Top up to continue."
- The consumer's QR remains valid (not redeemed) and can be re-scanned after the merchant tops up.
- No partial settlement. No accumulating debt. The transaction either completes atomically or doesn't happen.

Merchants need to top up their wallet periodically. For mixed merchants (online + cash), the 89% credited from online sales accumulates in the wallet and naturally funds future cash-sale 11% debits. For pure cash merchants, top-up is from a connected bank account via `WalletTopUp` (existing model).

### 3.7 Refund mechanics (cash)

Anti-abuse policy: **donation is non-refundable to the consumer.** On refund:

| Element | Refund treatment |
|---|---|
| Cash paid by consumer | Merchant returns cash in person, proportional to refund amount |
| Credits paid by consumer (if any used) | Returned as credits, NOT as cash |
| Credits earned by consumer on the original transaction | Stay with consumer; NOT clawed back |
| Sales tax collected | Merchant refunds proportionally in cash; merchant adjusts their own MS DOR remittance |
| Merchant wallet — platform fee (1%) | REFUNDED to merchant wallet |
| Merchant wallet — nonprofit donation (10%) | **NOT refunded** — stays with nonprofit |
| Platform treasury — platform fee (1%) | DEBITED on refund (mirror of the original credit) |
| Nonprofit wallet — donation (10%) | **Unchanged** — donation is final |

Net effect for the merchant on a $100 cash sale fully refunded: they return $100 in cash to the consumer, get $1 back to their wallet (the platform fee), and eat the $10 donation as the cost of the refund. This protects the nonprofit and prevents consumer-side abuse.

**Known abuse vector (monitor post-launch, not blocking for launch):** in `PLATFORM_CREDITS` mode, a consumer paired with a complicit merchant could buy-and-refund repeatedly to farm credits at the platform/merchant's expense. Mitigations available later if abuse materializes: per-consumer credit-accrual rate limits, refund-rate anomaly monitoring, or "credits earned on a refunded transaction are forfeit" as a v1.1 policy.

### 3.8 Walk-in retail without smartphone

Not supported at launch. The transaction-bound-QR model requires the consumer to pre-create the transaction; for walk-in retail the cart isn't known until the till, so a smartphone is required to generate the QR on the spot. Consumers without smartphones can use the platform only for pre-known transactions (online order pickup, accepted quotes, scheduled milestones, advance bills) via printed QRs. Documented limitation; revisit post-launch.

---

## 4. Schema changes

### 4.1 New / modified models

**`QrCheckoutToken` (existing — extend) or `PendingCashTransaction` (new — recommended)**

The current `QrCheckoutToken` is a thin consumer-ID record. Two implementation options:

- **Option A:** Extend `QrCheckoutToken` to hold the full pending-transaction parameters. Smaller schema footprint; single table.
- **Option B:** Introduce a new `PendingCashTransaction` model that holds the parameters; `QrCheckoutToken` references it. Cleaner separation between "the QR token" (authentication artifact) and "the pending transaction" (business object). Recommended for clarity.

Either way, the parameters captured:
```
consumerId          (FK to User)
merchantId          (FK to Merchant)
productServiceId?   (FK; one of these three is required)
quoteId?            (FK to new Quote model from tax plan Q2)
jobMilestoneId?     (FK to new JobMilestone model)
cashAmountCents     (Integer; the agreed price pre-tax pre-discount)
nonprofitIdSnapshot (FK to Nonprofit; snapshot at QR generation)
discountModeSnapshot ('PRICE_REDUCTION' | 'PLATFORM_CREDITS')
generatedAt         (DateTime)
expiresAt           (DateTime; generatedAt + 30 days)
redeemedAt?         (DateTime; null until redeemed)
redeemedByMerchantId? (FK; null until redeemed — verifies merchant identity matches)
tokenHash           (existing field, retained for HMAC verification)
```

**`Transaction` (existing — extend)**

The Transaction model already covers most fields needed. Additions:
- `paymentMethod` accepts new value `'CASH'`
- Add optional `pendingCashTransactionId` (FK) for traceability back to the QR

The tax-plan additions (`transactionGroupId`, `taxCategoryCode`, `path`) layer in independently.

**`Quote` and `JobMilestone` (new — from tax plan Q2)**

These already get COGS as part of the tax-plan schema additions. Confirmed here for completeness: `Quote` carries `contractPrice` and `cogs` (or `QuoteLineItem` carries per-line `cogs`); `JobMilestone` carries `amount` and inherits `cogs` proportional to the milestone's share of the parent Quote.

**`Wallet` (existing — no schema change)**

Existing model handles balance + ledger entries. The new cash flow writes one additional `LedgerEntry` per cash transaction (the 11% debit), tagged with the transaction reference.

---

## 5. Code-touch mapping

| File | Action |
|---|---|
| `prisma/schema.prisma` | Add `PendingCashTransaction` model (or extend `QrCheckoutToken`); add `paymentMethod='CASH'` enum value if enums are used; add `pendingCashTransactionId` FK to `Transaction` |
| `server/src/services/qrCheckoutService.ts` | Extend `generateToken` to accept transaction parameters; create `PendingCashTransaction` row; return token + the pending-transaction ID. Extend `consumeToken` to return the full transaction parameters and verify the scanning merchant matches `merchantId` |
| `server/src/services/transactionService.ts` | Add `'CASH'` branch in `processTransaction` that: (a) skips Stripe entirely, (b) debits merchant wallet 11% of net profit, (c) credits nonprofit wallet 10%, (d) credits platform treasury 1%, (e) writes `TransactionTaxLine` with `remittanceResponsibility='MERCHANT'`, (f) honors `discountMode` for credit accrual |
| `server/src/controllers/merchantController.ts:664` | Replace `processQrCheckout` body: scan a QR → resolve `PendingCashTransaction` → pre-flight wallet check → call `processTransaction(paymentMethod='CASH', ...)` with the bound parameters |
| `server/src/controllers/neighborController.ts:110` | Replace `generateQrToken`: accept transaction parameters from the consumer's app, validate elected-nonprofit prerequisite, validate listing/quote/milestone exists, create `PendingCashTransaction`, return QR token + display data |
| Frontend — Consumer app | New "Pay with cash at a merchant" flow: choose merchant → choose listing/quote/milestone → confirm amount + nonprofit + discount mode → generate QR. Display the QR with options to share/print |
| Frontend — Merchant POS view (`views/MerchantPortalView.tsx`) | New scan view: camera-based QR scan → display pending-transaction details + cash amount to collect → confirm → settle. Surface wallet balance + 11% requirement before/during scan. Show "Top up to continue" if insufficient |
| `server/src/services/walletService.ts` (existing) | Add helper for the 11%-debit pattern (atomic with the Transaction write inside the same Prisma `$transaction`) |
| Refund flow | Extend existing `TransactionRefund` handling to support the cash-refund mechanics from §3.7 (1% refundable, 10% non-refundable, credits stay) |
| Receipt views | Confirm the consumer/merchant/nonprofit receipt rollups from the tax plan handle `paymentMethod='CASH'` correctly |

---

## 6. Sequencing — when this gets built

The QR cash flow is functionally an Epic that sits alongside the tax-plan epics. Recommended placement: **Epic 11** in the build plan, dependent on:
- Epic 1 (tax taxonomy) — `taxCategoryCode` on listings
- Epic 2 (rate table + calculation) — for the tax line display
- Epic 3 (Path A checkout + `TransactionGroup` + multi-merchant Stripe Connect) — for the per-line atomicity pattern that the cash flow mirrors
- Epic 4 (Path B Job + JobMilestone + Quote + QuoteLineItem) — for variable-price service settlements
- Epic 9 (invariants) — invariant guards apply equally to cash transactions

Sequencing within Epic 11:
1. Schema additions (PendingCashTransaction, paymentMethod CASH)
2. Service-layer CASH branch in TransactionService
3. QR generation flow (consumer side)
4. QR redemption flow (merchant side) with wallet pre-flight check
5. Refund mechanics
6. Receipt and email integration

Most of this is "wiring the existing wallet/ledger primitives to a new flow," not net-new infrastructure. The schema additions are small. The biggest construction surface is the merchant POS view (QR scanner + cash-amount confirm + wallet-balance display + settle).

---

## 7. SALT-gated items specific to this flow

Canonical list lives in `prisma/seed/tax-confirmation-register.json`. Items most directly relevant to the cash flow:

| Confirmation Register | Why this gates the cash flow |
|---|---|
| #16 — Marketplace-facilitator status on in-person cash sales | Determines whether `TransactionTaxLine.remittanceResponsibility` is `MERCHANT` (current design) or whether the platform must escrow collected sales tax. If the latter, the design needs a tax-escrow wallet step at every cash sale |
| #5 — Residential / ≤$10k treatment of building trades | Blocks every Path B cash settlement for the real-property trades. Until SALT confirms, roofers/HVAC/plumbing cannot settle Job milestones in cash via the platform |
| #2 — Prepared food & lodging local taxes | Affects the tax amount the merchant collects in cash on prepared-food / lodging transactions |
| #13, #14, #15 — Platform-credit treatment | Affects the discount-mode handling in cash transactions (PLATFORM_CREDITS mode credits are accrued per the Q10 gift-card model) |
| #17 — Pub 1771 acknowledgment on refunded sales | The non-refundable-donation refund mechanics depend on the merchant retaining their original charitable-contribution acknowledgment after the underlying sale is reversed |
| #18 — Donation-acknowledgment allocation in multi-merchant orders | Confirms the pro-rata-by-line-value allocation used to generate per-merchant acknowledgments when a single cash order touches multiple merchants |
| #19 — MS DOR cash-sale receipt format | Shapes the in-app receipt and confirmation email for cash transactions; non-conformance is a launch-blocker |
| #20 — Sales-tax refund reconciliation mechanics | Determines the per-merchant cash-tax-export UX and the metadata captured on refunded cash sales |
| #21 — Marketplace-facilitator clause language in merchant agreement | The legal foundation under which the merchant-remits-cash-sales-tax model is asserted |
| #22 — Platform liability for contractor non-remittance | Determines whether Path B cash settlements need an affirmative-defense UX element (merchant acknowledgment at scan) or whether the routing-spec's informational note suffices |

---

## 8. Risks worth flagging

1. **Wallet-balance gating creates merchant friction.** Pure-cash merchants without an online sales backstop must top up periodically to keep scanning. Onboarding should set realistic expectations and the top-up UX must be one-tap easy.

2. **Refund mechanics create merchant-side risk.** Carrying the 10% donation cost on every refund means merchants need real refund discipline. Surface refund stats prominently in the merchant dashboard. Document the policy clearly in the agreement.

3. **Credit-farming abuse vector** (per §3.7). Bounded for launch by manual fraud detection; monitor refund + credit-accrual rates per consumer post-launch.

4. **30-day QR expiry combined with "generate when finalized"** means a consumer who generates a QR but doesn't transact within 30 days has to regenerate. For long-tail use cases (e.g., a contractor milestone scheduled 6 weeks out), the consumer must wait until ~the payment date to generate. This is the user's stated preference (§3) and is operationally cleaner; the UX should make regeneration painless.

5. **Identity-verification at merchant-side scan.** The QR token is tied to a specific merchantId. The scanning merchant's logged-in identity must match. If a malicious merchant intercepts a printed QR for another merchant, the system should reject the scan. Token verification logic enforces this.

6. **Path B "no tax line on checkout" must hold for cash too.** Invariant 2 from the tax routing spec — must be re-validated in the CASH branch. Worth a property-based test that any Path B-tagged `Transaction` with `paymentMethod='CASH'` has zero `TransactionTaxLine` rows.

---

## 9. What ships in Phase 0 (planning only, no code)

For the duration of the SALT engagement, the only artifacts produced are this document and the companion tax-compliance docs. Schema scaffolds, controllers, and the merchant POS view do **not** begin until:
- SALT advisor confirms #16 (merchant vs platform remits on cash sales)
- SALT advisor confirms #5 (real-property residential/threshold treatment) — for Path B cash settlements
- All Phase-0 prerequisites from the tax-compliance plan are satisfied

The 30-day QR expiry and the "generate only when finalized" rule are encoded here as design constraints that engineering implements when Epic 11 starts.

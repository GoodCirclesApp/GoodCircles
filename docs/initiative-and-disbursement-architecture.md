# Initiative Model + Compliant Disbursement — Architecture Map

> Drafted 2026-05-29 (chief-engineer review). Companion to the MT/compliance direction.
> Scope: the architectural revisions needed to ship the nonprofit-owned **initiative** model and
> the **money-transmitter-clean** disbursement path. Legal items gated on the June 10 SALT meeting
> are flagged ⚖️. Items that are stored-value/custodial are gated behind feature flags ⛔.

---

## 1. Confirmed product model (what we're building)

- **Initiatives are owned by nonprofits.** An initiative is a campaign/project created by an existing
  501(c)(3); it inherits the parent nonprofit's Stripe Connect account (earmarked), so no new role.
- **The consumer directs; the merchant is donor of record** for both the base cut and the waived amount.
- A single transaction can fund **two nonprofits**: the *elected* nonprofit (10% of net profit, general
  use) and the *initiative's* nonprofit (10% of gross, restricted) — or the same nonprofit for both.
- **No platform custody.** Every captured dollar has a determined destination at the moment of capture.

### The corrected money math (DONE — see `transactionService.calculateDistribution`)
The split is **always** computed on the discounted (effective) base; the 10% discount has exactly one
destination. Conservation now holds and is unit-tested (`server/src/tests/transaction.test.ts`):

```
distributed = merchantNet + nonprofitShare + platformFee + waivedContribution + creditIssued == neighborPays
```

| Mode | neighborPays | 10% goes to |
|------|-------------|-------------|
| PRICE_REDUCTION (not waived) | discounted price | neighbor (lower price) |
| Waived | full MSRP | `waivedContribution` → initiative's nonprofit |
| PLATFORM_CREDITS ⛔ | full MSRP | `creditIssued` → consumer closed-loop credit |

New outputs `waivedContribution` and `creditIssued` are now returned for the disbursement layer to route.

---

## 2. Data-model revisions (`prisma/schema.prisma`)

1. **`CommunityInitiative.nonprofitId` is currently nullable** → for the launch model it must be
   **required and enforced** (an initiative with no parent nonprofit has no Connect account to receive
   funds). Add an app-level guard at initiative creation: only a nonprofit's user may create one, and
   `nonprofitId` is set to that nonprofit. Consider a `payoutsEnabledSnapshot`/validation at creation.
2. **Dual donation receipts.** `Transaction.donationReceipt` is a **1:1** relation, but a waived
   transaction produces **two** merchant→nonprofit gifts (elected + initiative). Change to **1:many**
   (`donationReceipts DonationReceipt[]`) OR add an explicit `kind` field
   (`BASE_DONATION` | `WAIVED_INITIATIVE`) so both can be issued and aggregated separately.
3. **Persist the waived contribution amount** on `Transaction` (e.g., `initiativeContribution Decimal`)
   so it's auditable and not re-derived. `discountAmount` already stores the 10%; a dedicated field
   makes the destination explicit.
4. **Initiative ↔ nonprofit Connect readiness:** no schema change needed if we read
   `initiative.nonprofit.stripeAccountId` + Stripe capability at checkout (see §4 gating).

---

## 3. Disbursement layer (⚖️ gated on counsel; build against ledger amounts, never percentages)

For a **waived** transaction there are up to **four** destinations from one charge. Use Stripe Connect
**separate charges & transfers** (destination charges support only one destination):

| Recipient | Amount | Connect account |
|-----------|--------|-----------------|
| Merchant | `merchantNet` | merchant (merchant-of-record via `on_behalf_of`) |
| Elected nonprofit | `nonprofitShare` | elected nonprofit |
| Initiative's nonprofit | `waivedContribution` (= 10% of gross) | initiative's parent nonprofit, earmarked to `initiativeId` |
| Platform | `platformFee` | retained (application fee) |

- **Delete the dead code** in `stripeService.createCheckoutSession` (the unused `merchantAmount = 0.79`
  / `nonprofitAmount = 0.10` lines) — wrong frame, ignores COGS.
- **Wire the webhook** (`checkout.session.completed`) to: (a) record settlement, (b) issue the two
  donation receipts, (c) fire the existing post-commit hooks. Today the receipt only fires on the
  INTERNAL/credit path (`processTransaction` post-commit `if INTERNAL || neighborPays==0`).
- **Internal/ledger path already conserves** (`walletService.processInternalTransaction` now credits the
  initiative's parent nonprofit the waived amount). This path is ⛔ gated for launch but is correct.

---

## 4. Checkout gating (product logic)

- **Waiver option is shown only when** there is ≥1 active initiative whose **parent nonprofit's Connect
  account is fully `charges_enabled`/`transfers`-capable** (not merely created). If none qualify, the
  discount cannot be waived — it falls back to PRICE_REDUCTION. This is the rule that eliminates any
  "hold funds for a future/undesignated initiative" custody scenario.
- Merchant and elected nonprofit must also be Connect-onboarded (already enforced in `createCheckout`).

---

## 5. Receipting revisions (`donationReceiptService.ts`)

- Already merchant-as-donor (keyed by `merchantId`, per-merchant annual summary). ✅ Keep.
- Add issuance of the **second** receipt for `waivedContribution` (merchant → initiative's nonprofit),
  tagged to the initiative. Both roll up in `getMerchantTaxSummary`.
- ⚖️ The waived-amount receipt carries the conduit/assignment-of-income question (SALT Theme N) — the
  merchant-as-donor characterization is more aggressive there because the consumer is the economic source.

---

## 6. Feature-flag gating (`featureFlagService.ts`)

| Flag | Launch | Covers |
|------|--------|--------|
| `waiveToInitiative` | ✅ ON (⚖️ pending CCV/solicitation answer) | immediate waive → initiative routing |
| `consumerWallet` | ⛔ OFF / hidden | stored cash balance, top-up, cash withdrawal, P2P |
| `platformCredits` | ⛔ OFF | closed-loop consumer credit (`creditIssued`) |
| `communityFundWaiver` | ⛔ OFF | pooled `CommunityFund` waiver (custodial) |
| `merchantNetting` | ⛔ OFF | M2M obligation netting |

Leave the gated code in place (flagged OFF, hidden from UI) so it can be switched on post-funding with a
BaaS partner — money-movement-layer swap, not a rewrite.

---

## 7. Refunds (`refundService.ts` — currently a stub)

A refunded **waived** sale has already paid up to three recipients (merchant, elected nonprofit,
initiative nonprofit). Refund logic must reverse/claw back across all transfers (Stripe reversal of each
`transfer`), and decide policy on already-issued donation receipts. Build alongside the disbursement layer.

---

## 8. Open legal dependencies (⚖️ June 10 SALT meeting)

- **Theme K/L/M** — money-transmitter posture, stored value, recipient payouts.
- **Theme N** — merchant-as-donor on the *waived* amount (conduit/assignment-of-income) + substantiation.
- **Theme O/R** — charitable-solicitation **and commercial-co-venturer (CCV)** registration for the
  "shop → a portion funds a cause" model; initiatives-owned-by-nonprofits structure.
- **Theme P/Q** — sales-tax base (discount, credits, donated portion) + 1099-K/1099-B reporting.

Architecture is built to proceed the moment these return; nothing above assumes platform custody.

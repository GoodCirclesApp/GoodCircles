# Phase 1 (P1) Execution Plan — Data Integrity & Money Correctness

> **Status (2026-06-16):** **P1-0 is ✅ DONE & pushed** (commits `7e2b02d` + `77483bb`). The rest is plan-only, gated on **P1-A**, which needs production-DB access (owner step).
> **Owner data decision (resolved):** no transaction records need to be kept (throwaway), **but the waitlist is real user data that must be preserved** → use the **conservative baseline-the-existing-DB path** in P1-A (touches no table data), **not** the reset path.
> **Created:** 2026-06-15 · Derived from a read-only, evidence-backed investigation (5 parallel agents, every claim quoted to `file:line`).
> **Companion docs:** [`ENTERPRISE_AUDIT_2026-06.md`](./ENTERPRISE_AUDIT_2026-06.md) · [`ENTERPRISE_ARCHITECTURE.md`](./ENTERPRISE_ARCHITECTURE.md) · [`../.claude/engineering_priorities.md`](../.claude/engineering_priorities.md) (P0 = ✅ complete).

---

## 1. The one fact that shapes this whole phase

**Production deploys by force-syncing the database on every boot, and there is no migration history.**

- The **real** prod boot command is `Dockerfile:18`:
  `CMD ["sh","-c","npx prisma db push --accept-data-loss --skip-generate; NODE_ENV=production node_modules/.bin/tsx server.ts"]`
  (Railway uses the Dockerfile builder per `railway.toml`. The `package.json` `start` script is **dead in prod** — don't be fooled by it. Note the `;` separator: the server starts *even if the destructive push errors*.)
- There is **no `prisma/migrations/` directory** anywhere in the repo. The live schema was only ever created via `db push`.
- The schema is large: **97 models, 6 enums, 116 relations, 34 `onDelete: Cascade`**. A mistaken table drop/recreate cascades widely.

**Consequence:** until a non-destructive migration flow exists, *any* schema change merged to `main` is one bad diff away from `--accept-data-loss` dropping prod data. This is why **P1-A (migration baseline) is the linchpin** that gates the schema-touching items.

---

## 2. ⭐ The decision that can shrink this entire phase: is prod empty?

The project is **pre-launch** (first market Sept 2026). If the live prod DB currently has **zero / near-zero real rows**, the risk profile collapses:

- The migration baseline can be done by simply **resetting** (drop + recreate from a clean baseline migration) instead of the delicate "baseline-an-existing-DB" dance.
- The Float→Decimal and String→enum conversions in P1-B become trivial (no historical rows to back-fill or audit).
- The whole phase compresses from weeks of careful staging to a couple of focused sessions.

> **✅ OWNER DECISION #1 — RESOLVED (2026-06-16):** transaction/ledger data is throwaway, **but the waitlist holds real signups that must be preserved.** Because real data exists (the waitlist), we use the **conservative baseline-the-existing-DB path** in P1-A — which alters **no** table data, so it protects the waitlist and the throwaway transaction tables alike. The "reset path" is **off the table**.

The plan below is written for that **conservative, data-preserving path**.

---

## 3. Recommended sequence & dependency graph

```
P1-0  Single-source the split + delete dead 79/10/11 + cent-quantize + Σ-test   [CODE ONLY — no DB]  ── ship anytime
                                                                                   (independent; do first for a quick, safe win)

P1-A  Migration baseline → switch prod boot to `prisma migrate deploy`           [THE LINCHPIN — HIGH risk]
        │   (gate everything schema-touching behind this)
        ├──► P1-B1  Add hot-path indexes                  (additive, low risk)
        ├──► P1-C   Persist Stripe charge/PI id           (additive nullable cols, LOW risk)
        ├──► P1-D   Webhook idempotency (new table)       (additive table, MEDIUM risk)
        └──► P1-B2  Float→Decimal, then String→enum       (type changes, HIGH risk — LAST, in waves)
```

| Order | Item | Risk | Complexity | Schema? | Depends on |
|------|------|------|-----------|---------|-----------|
| 1 | **P1-0** Split single-source + dead-code + cent-quantize + Σ-test | MEDIUM | M | No | — |
| 2 | **P1-A** Migration baseline + `migrate deploy` | **HIGH** | M | Yes (process) | — |
| 3 | **P1-C** Persist Stripe charge/PI id | LOW | S | Yes (additive) | P1-A |
| 4 | **P1-D** Webhook idempotency table | MEDIUM | M | Yes (additive) | P1-A |
| 5 | **P1-B1** Hot-path indexes | LOW | S | Yes (additive) | P1-A |
| 6 | **P1-B2** Float→Decimal → enums | **HIGH** | L | Yes (type change) | P1-A |

**Why this order:** P1-0 is pure code (no DB) and delivers correctness value immediately with a trivial revert. P1-A unblocks safe schema change. Then we go **additive-first** (charge ids, idempotency table, indexes) before the **type-changing** P1-B2, which is the most dangerous and goes last.

---

## 4. Item detail

### P1-0 — Single-source the 89/10/1 split, delete dead 79/10/11, cent-quantize, add Σ-conservation test — ✅ DONE (2026-06-16, commits `7e2b02d` + `77483bb`)
**Risk: MEDIUM · Complexity: M · No schema change (pure code — `prisma db push` is a no-op for this).**
> **Shipped:** new `server/src/lib/splitRates.ts` (single-sourced rates + load-time sum-to-1 assert + `roundCents` HALF_UP). `calculateDistribution` cent-quantizes with the **merchant as residual party** → parts sum exactly to the cent. Dead 79/10/11 deleted from `stripeService`. All split sites (mockDataController, catalogRoutes, financeEngine, accountingService) now import the shared constants. New `Σ-Conservation (exact cents)` test block (pins rates, whole-cent assertions, exact conservation, 5000-input fuzz, residual-party check). Verified: `tsc` exit 0; transaction suite **30/30**; `vite build` exit 0.

**Current state.** The canonical split lives in `transactionService.ts:49-54` — `nonprofitShare = netProfit*0.10`, `platformFee = netProfit*0.01`, `merchantProfitShare = netProfit*0.89`, all as **inline `new Decimal(...)` literals** (not a shared constant). Problems found:
- **Dead 79/10/11 code:** `stripeService.ts:54-61` computes `merchantAmount = amount*0.79` / `nonprofitAmount = amount*0.10` — both **unused** (the Checkout session charges the full amount). Contradicts the live ledger.
- **Duplicated rate math** re-derived inline in `financeEngine.ts:109`, `accountingService.ts:57-58`, `mockDataController.ts:173-175`, `catalogRoutes.ts:38-40`. `constants.ts:4-6` has 0.10/0.10/0.01 but no `0.89` and isn't imported by backend services.
- **No cent-quantization:** `Transaction.{grossAmount,…,merchantNet}` are unconstrained `Decimal` (no `@db.Decimal(_,2)`), so the four stored parts need not sum to an exact cent. Only the Stripe charge is rounded (`transactionService.ts:219`).
- An existing "Conservation Invariant" test (`transaction.test.ts:182-205`) uses `toBeCloseTo(…,2)` tolerance — **not** exact-cent.

**Target.** One shared rate module (`server/src/lib/splitRates.ts`: `NONPROFIT_RATE`, `PLATFORM_RATE`, `MERCHANT_PROFIT_RATE`, `GC_DISCOUNT_RATE`, with a compile-time assert that the three shares sum to 1) imported by `calculateDistribution` and every other split site. Dead `stripeService` block deleted. `calculateDistribution` cent-quantizes outputs with a documented **residual policy (merchant absorbs the sub-cent remainder)** so parts sum **exactly** to neighbor-pays cents. New pure-math Σ-test asserts exact-cent summation over thousands of fuzzed inputs.

**Why it's safe to do first:** touches no Prisma model, so the destructive boot push is irrelevant; forward-only (no historical rows rewritten); fully covered by `tsc` + `vitest` (25 tests today run with no DB). Land on a branch, get the new exact-cent test green, then merge.

**Open decisions:** (a) confirm **merchant** is the residual rounding party (keeps nonprofit/platform clean and matches `refundService` deriving `neighborRefund = merchantNet + platformFee`); (b) **ROUND_HALF_UP** vs banker's rounding — recommend HALF_UP (money default, matches existing `Math.round`).

> Note: governance `FiscalPolicy` rates (`schema.prisma:1202-1204`) are **not** read by the live split — single-sourcing the constant is step one but does **not** make the split governance-driven. That wiring stays a separate, later item.

---

### P1-A — Migration baseline → switch prod boot from `db push --accept-data-loss` to `migrate deploy`
**Risk: HIGH · Complexity: M · The linchpin. Requires owner involvement (backup, env, ideally a low-traffic window).**

**Target.** Prod boots with `prisma migrate deploy` (apply-only, never destructive), driven by a committed `prisma/migrations/` whose first entry (`0_init`) reproduces the *current* live schema and is marked **already-applied** in prod. `--accept-data-loss` removed from every boot path.

**Safe, data-preserving sequence (conservative path — use if prod has real data):**
0. **Full restorable backup** of prod (Railway snapshot or `pg_dump`). Do not proceed without it. *(This is the only true safety net.)*
1. **Drift check (read-only):** restore the dump into a **scratch** DB and run `prisma migrate diff --from-url $SCRATCH --to-schema-datamodel prisma/schema.prisma --script`. Empty ⇒ live matches schema (expected). Non-empty ⇒ real drift; reconcile **before** baselining. *(Open question: were the catalog models at `schema.prisma:904+` ever actually pushed to live, or only merged into the file? The diff answers this.)*
2. **Generate baseline (local only):** `prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql`. Inspect: must be all `CREATE …`, **no `DROP`**. Add `migration_lock.toml` (`provider="postgresql"`).
3. **Prove baseline == live:** apply `0_init` to a fresh empty scratch DB, then `migrate diff` that DB against the prod-copy — must be empty.
4. **Mark applied in PROD (the delicate, but non-destructive step):** `prisma migrate resolve --applied 0_init` against the **real** prod `DATABASE_URL`. This writes **only** a bookkeeping row into `_prisma_migrations`; it runs **no DDL** on app tables. Verify with `prisma migrate status` (read-only).
5. **Swap the boot command (the actual fix):** in `Dockerfile:18` replace `npx prisma db push --accept-data-loss --skip-generate` with `npx prisma migrate deploy`, and change the `;` to `&&` so a future failed migration **fail-closes** (blocks boot) instead of silently starting on a half-changed schema. Mirror in `package.json:9` for consistency.
6. **Controlled deploy:** push, watch Railway logs confirm `migrate deploy` finds `0_init` already applied and performs **no DDL**. Keep the backup until verified healthy.
7. **Cleanup (separate commit):** delete stale `prisma/catalog-schema-additions.prisma` and `prisma/test.txt`.

**Reset path (use only if OWNER DECISION #1 says prod is empty/throwaway):** drop the prod schema, generate `0_init` from the current schema, `migrate deploy` to create it fresh, switch the Dockerfile. Far simpler — but **destroys existing rows**, so it's only acceptable on confirmed-empty data.

**Top risks:** running `migrate deploy` against prod **before** `resolve --applied` (baseline `CREATE TABLE`s collide with existing tables); a `--from-empty` baseline that doesn't truly equal live (drift) leading a *future* migration to emit destructive `ALTER`s; pointing any diff/resolve step at the **wrong `DATABASE_URL`**. Mitigants: no `@map`/views in schema (baseline should match a push-created DB closely); `resolve --applied` is provably bookkeeping-only.

**Verification (no local Postgres):** `prisma validate` + `prisma generate` locally; the real diff checks run against a **restored prod copy** (Railway branch DB or disposable container), never against prod; against prod only read-only `migrate status`.

> **Side cleanup to flag (not in this item):** `Dockerfile:10` runs `npx playwright install chromium` on every prod image build — bloats the image, unrelated to data safety. Track separately.

---

### P1-C — Persist Stripe charge / payment-intent id on `Transaction`
**Risk: LOW · Complexity: S · Additive nullable columns. (Depends on P1-A for the "right" flow, but additive-nullable is safe even under `db push`.)**

**Current state.** `Transaction` has **no** Stripe id column. Card transactions are created **before** the Checkout Session, and the session id / `payment_intent` / charge are **never written back** (`paymentController.ts:69-101`, `transactionService.ts:179-231`). The webhook reads only `session.metadata.transactionId`, discarding `session.payment_intent`. As a result `refundService.ts:88-89` **can't execute a real Stripe refund** — it has no id to pass. The pattern already exists elsewhere: `WalletTopUp.stripePaymentIntentId`, `CatalogBilling.stripeCheckoutSessionId/stripePaymentIntentId`.

**Target.** Add three **nullable** columns to `Transaction`: `stripeCheckoutSessionId`, `stripePaymentIntentId`, `stripeChargeId`. Populate `stripeCheckoutSessionId` at session creation; populate `stripePaymentIntentId` (+ optional `stripeChargeId` via `latest_charge`) in the `checkout.session.completed` webhook. This **unblocks the refund stub data-wise** (execution stays gated).

**Why LOW risk:** `ADD COLUMN … NULL` is non-destructive even under `db push --accept-data-loss` (no rewrite, no backfill, no lock of consequence). The write-backs are extra `update`s that can't corrupt existing rows. **Do not** add `@unique` on `stripePaymentIntentId` in the same push (a plain `@@index` is safe). **Verification:** `prisma generate && tsc` confirms the optional fields and that all existing `transaction.create` calls still compile.

---

### P1-D — Webhook / ledger idempotency (dedupe Stripe events)
**Risk: MEDIUM · Complexity: M · Adds one new table (additive). Depends on P1-A for a clean migration.**

**Current state.** Both webhooks verify the signature but **neither dedupes by `event.id`**, and there's no processed-events table. The primary webhook (`paymentController.ts:117`) dispatches credits issue/redeem, booking completion, referral bonuses, emails — all **re-runnable** on a Stripe redelivery. `creditService.ts:100` does an **unconditional** `creditLedger.create` (no unique on `(transactionId, source)`), so a redelivered event mints a **second** credit row. The catalog webhook (`catalogRoutes.ts:515`) is status-idempotent but re-runs side effects. The only real dedupe today is wallet top-up (`walletController.ts:79` + `WalletTopUp.stripePaymentIntentId @unique`).

**Target.** New **additive** table `ProcessedWebhookEvent { eventId @id, eventType, source, receivedAt }`. Each handler, right after `constructEvent`, attempts `create({ eventId })`; on `P2002` (already processed) returns `200 received:true` **without** re-processing. The credit/booking/referral block runs inside **one `prisma.$transaction`** with the claim insert (mark-before so a mid-way crash rolls back and Stripe can legitimately retry); emails stay outside the transaction.

**Risk note:** the table itself is a safe `CREATE TABLE`, but `db push` **re-diffs the entire schema** against (possibly drifted) prod — another reason to land **after** P1-A. A *Stage-2* `@@unique([transactionId, source])` on `CreditLedger` is genuinely dangerous if duplicate rows already exist from past redeliveries — gate it behind a read-only duplicate audit; **defer to a separate PR.**

**Open question:** if catalog later gets its own Stripe endpoint/secret, the *same* `checkout.session.completed` event id could arrive at two handlers; a shared `ProcessedWebhookEvent` would let the first "claim" it and starve the second. If both must act, key on **`(eventId, source)` composite** instead of `eventId` alone.

---

### P1-B — Money-column types, enums, and hot-path indexes
**Split into B1 (low-risk, additive) and B2 (high-risk, type-changing). Both depend on P1-A.**

**Current state (good news first):** the **core ledger is already correct** — `Transaction` money fields, `LedgerEntry`, `Wallet`, `CreditLedger`, `MerchantObligation`, fund amounts, and affiliate models all use `Decimal`; several even pin `@db.Decimal(p,s)`. The catalog subsystem **already uses real Prisma enums** (template to follow). The gaps:
- **Float money columns** (lossy for currency): `AnonymizedTransaction.{grossAmount,nonprofitShare,platformFee,merchantNet}` (`209-214`), `MarketInsight.metricValue` (`184`), `CatalogProduct.*` (`996-1013`), `CatalogRevenue.*` (`1063-1065`), `CatalogImport.actualPlatformCogs` (`971`), `CatalogBilling.{amountChargedDisplay,grossMargin}` (`1034,1043`), `RegionalMetric.{totalJobsSupported,internalPaymentPct}`. *(Int-cents fields like `CatalogBilling.amountCharged` are fine — leave them.)*
- **String fields that should be enums** (allowed values live only in `//` comments + scattered zod): `Transaction.paymentMethod`, `Booking.status`, `AffiliateConversion.status`, `FundDeployment.{deploymentType,status}`, `CreditLedger.{entryType,source}`, several `*.status`. **Real bug this surfaces:** code filters `paymentMethod:'WALLET'` (`adminController.ts:38,132`) and `'INTERNAL_BALANCE'` (`regionalMetricsService.ts:67,94`) — values **never written** (writers emit `INTERNAL`/`CARD`/`STRIPE`), so those two metrics are silently always 0. An enum makes this a compile error.
- **Missing indexes:** `MerchantObligation.isSettled` (filtered in `nettingService`), `Transaction.createdAt` and `(merchantId, createdAt)` (merchant dashboard + analytics date-range), `Transaction.paymentMethod`.

**B1 — indexes (LOW, additive, do first within B):** add `@@index([createdAt])`, `@@index([merchantId, createdAt])`, `@@index([paymentMethod])` on `Transaction`, `@@index([isSettled])` (or `[isSettled, batchId]`) on `MerchantObligation`. On a large `Transaction` table, hand-edit the generated migration to `CREATE INDEX CONCURRENTLY` to avoid write locks.

**B2 — Float→Decimal then String→enum (HIGH, last):** ship in waves — analytics Floats first (regenerated rows, low consequence), then catalog Floats, then **enums last**. Enums are the dangerous one: **before** converting, run `SELECT DISTINCT <col>` on a prod snapshot to enumerate real values, **reconcile the code** (kill the phantom `WALLET`/`INTERNAL_BALANCE` reads, decide the canonical `PaymentMethod` set), backfill any stray rows, **then** apply `CREATE TYPE` + `ALTER COLUMN TYPE`. Never combine an enum conversion with a value-set change in one deploy. Derive zod schemas from the generated Prisma enum types so app validation can't drift again.

**Open decisions:** canonical `PaymentMethod` vocabulary (is `INTERNAL` the intended `WALLET`?); one documented precision/scale standard (e.g. dollars `@db.Decimal(12,2)`, rates `(5,4)`, accumulators `(18,4)`); whether prod is empty (collapses B2's risk entirely — see §2).

---

## 5. Open decisions for the owner (blocking where noted)

1. **🔴 Is prod empty/throwaway?** (§2) — reshapes P1-A and P1-B2 risk dramatically. *Answer before P1-A.*
2. **P1-0:** confirm merchant is the residual cent-rounding party + ROUND_HALF_UP. *(Low stakes; I recommend both.)*
3. **P1-A:** can you take/locate a prod DB backup, and does Railway give a branch/snapshot DB for staging the drift check? Is there a low-traffic window?
4. **P1-B2:** the canonical `PaymentMethod` enum set + whether historical rows need backfill.
5. **P1-D:** will catalog keep sharing the primary Stripe webhook endpoint, or get its own? (Decides `eventId` vs `(eventId, source)` keying.)

## 6. Verification posture (unchanged from P0)

No local Postgres. For **every** item: `tsc --noEmit` (build's typecheck) is the baseline gate; `vitest` covers split/netting/wallet logic (P1-0's new exact-cent test runs with no DB). **DB-touching migrations cannot be fully verified locally** — generate the SQL with `migrate diff`/`migrate dev` against a **scratch/restored-snapshot** Postgres and read it by hand (look for unexpected `DROP`/`USING` casts/`CREATE TYPE`); a green `tsc` proves code compiles, **not** that a migration is data-safe. Final verification is watching the Railway deploy log.

---

*Nothing in this plan has been applied. On approval, the recommended first move is **P1-0** (pure code, quick safe win) in parallel with answering OWNER DECISION #1, then **P1-A** once the prod-data question is settled.*

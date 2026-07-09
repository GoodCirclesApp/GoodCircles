# HELD MIGRATION — Tax/Reporting Data Capture (Phase 4)

> **⛔ DO NOT APPLY WITHOUT OWNER APPROVAL.**
> Pushing a Prisma migration to `main` triggers Railway's `prisma migrate deploy` on boot. This migration is intentionally **not** added to `prisma/schema.prisma` or `prisma/migrations/` yet, so nothing deploys until you approve it. Per the audit's operating rule: *"Do NOT deploy schema changes without showing me the migration first."* This is that migration, shown first.

**What it does:** adds **data-capture** columns for tax compliance — encrypted W-9/TIN storage + completeness flags on `Merchant`, and per-transaction taxable-amount/jurisdiction fields on `Transaction`. It does **not** collect, calculate, or remit any tax, and it does **not** choose a tax provider. It is purely the storage substrate the pluggable interface (`server/src/services/tax/taxCalculator.ts`) and the encryption util (`server/src/utils/fieldEncryption.ts`) will write to once you approve.

**Safety:** every column is nullable or defaulted → **purely additive**, no backfill, no data loss, existing rows unaffected. Reversible (drop columns).

---

## 1. Prisma schema additions

Add to `model Merchant { … }`:

```prisma
  // ── Tax identity / W-9 capture (encrypted at rest via fieldEncryption util) ──
  taxClassification String?   // W-9 line 3 entity type (e.g. "sole-proprietor", "s-corp")
  tinEncrypted      String?   // AES-256-GCM envelope of the EIN/SSN (never stored plaintext)
  tinLast4          String?   // last 4 digits, for display only
  w9Status          String    @default("NOT_COLLECTED") // NOT_COLLECTED | COLLECTED | VERIFIED
  w9CollectedAt     DateTime?
  backupWithholding Boolean   @default(false)
```

Add to `model Transaction { … }`:

```prisma
  // ── Sales-tax capture (populated by the pluggable TaxCalculator seam) ──
  taxableAmount  Decimal?  @db.Decimal(12, 2)
  taxAmount      Decimal   @default(0) @db.Decimal(12, 2)
  taxJurisdiction String?  // e.g. "US-MS"
  taxProvider    String?   // 'none' until a provider is configured
  taxComputed    Boolean   @default(false)
```

(Optional, only if nonprofits will also submit W-9s — deferred by default:)
```prisma
// model Nonprofit { … } — same six tax-identity fields as Merchant, if needed.
```

## 2. Equivalent raw SQL (what `migrate deploy` will run)

```sql
-- Merchant: encrypted tax-identity capture
ALTER TABLE "Merchant" ADD COLUMN "taxClassification" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "tinEncrypted" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "tinLast4" TEXT;
ALTER TABLE "Merchant" ADD COLUMN "w9Status" TEXT NOT NULL DEFAULT 'NOT_COLLECTED';
ALTER TABLE "Merchant" ADD COLUMN "w9CollectedAt" TIMESTAMP(3);
ALTER TABLE "Merchant" ADD COLUMN "backupWithholding" BOOLEAN NOT NULL DEFAULT false;

-- Transaction: per-sale tax capture
ALTER TABLE "Transaction" ADD COLUMN "taxableAmount" DECIMAL(12,2);
ALTER TABLE "Transaction" ADD COLUMN "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Transaction" ADD COLUMN "taxJurisdiction" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "taxProvider" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "taxComputed" BOOLEAN NOT NULL DEFAULT false;
```

## 3. Required env before this data is USED (not before the migration)

- `FIELD_ENCRYPTION_KEY` — 32-byte key (base64 or hex). **Must be set in production** before any TIN is written, or `requireEncryptionKey()` throws by design. Generate: `openssl rand -base64 32`.
- `TAX_PROVIDER` — leave unset/`none` (default). Only set when a provider is legally configured.

## 4. How to apply (after approval)

1. Paste the §1 blocks into `prisma/schema.prisma`.
2. `npx prisma migrate dev --name tax_scaffolding` (locally) to generate the migration folder, or hand-place the §2 SQL as a migration.
3. Review the generated SQL matches §2 (additive only).
4. Commit + push → Railway applies it on next boot.
5. Set `FIELD_ENCRYPTION_KEY` in the Railway environment.
6. Wire the W-9 capture form + `encryptField()`/`getTaxCalculator()` call sites (follow-up ticket).

## 5. HUMAN REQUIRED / legal

- Confirm whether Good Circles is **required** to collect sales tax in Mississippi (economic nexus, marketplace-facilitator status) before enabling any provider — this is a legal determination, not a code toggle.
- Confirm 1099-K issuance obligations (a `complianceController` 1099-K report already exists; this migration does not change it).
- Choose the W-9 collection UX and retention window (TINs are highly sensitive; retention should follow IRS guidance).

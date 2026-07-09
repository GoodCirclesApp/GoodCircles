# Compliance & Security Calendar

Recurring obligations and review cadences for Good Circles. Owner-run unless a CI
job is named. Dates are the **next due** date; update after each completion. Seeded
from the 2026-07-09 compliance audit (`COMPLIANCE_AUDIT.md`).

## Continuous (automated in CI — `.github/workflows/compliance.yml`)
- **Secret scanning** (gitleaks) — every push/PR.
- **Dependency audit gate** (fail on unallowlisted high/critical) — every push/PR. Backend + marketing.
- **PCI SAQ-A tripwire** (no card data / no `req.body` logging on payment routes) — every push/PR.
- **Security-headers presence** (marketing `_headers`) — every push/PR.
- **Accessibility** (axe WCAG 2.1 A/AA) + **dist audit** (links/metas/JSON-LD) — every push/PR.
- **Claim-consistency** (published splits match `splitRates.ts`) — every push/PR.

## Weekly / Monthly
- **Monthly — dependency audit review:** review `audit-gate` allowlist (currently `astro`, `esbuild`); confirm each is still justified and no new high/critical slipped the net.
- **Monthly — open retention items:** confirm the data-retention job ran (webhook events, unconverted clicks); evaluate automating `EmailRecipient`/`EmailCampaign` + `InboundEmail` retention (see `DATA_PRACTICES.md`).
- **Monthly — access review:** review who holds `PLATFORM` / `PLATFORM_VIEWER` roles and rotate as needed.

## Quarterly
- **Backup restore test:** verify Railway Postgres PITR/backups are enabled and perform a **test restore** to a scratch database; record the result. (Audit D16 — HUMAN REQUIRED until first completed.)
- **Secret rotation:** rotate `JWT_SECRET`/`JWT_REFRESH_SECRET`, Stripe/Resend keys as policy dictates; confirm no secret is present in `.git/config` remotes.
- **Access-control spot check:** re-run the RBAC review for any new routes (every admin/compliance route has `authorizeRole`).

## Annually
- **Full compliance audit re-run** (regenerate `COMPLIANCE_AUDIT.md`; refresh PII map + before/after grades).
- **`security.txt` renewal:** update `Expires` in `marketing/public/.well-known/security.txt` (currently **2027-07-09**). Do not let it lapse.
- **SOC 2 readiness review** (see `COMPLIANCE_AUDIT.md` §SOC 2 appendix): re-map controls, close gaps.
- **Astro major-version migration** evaluation (5.x → 7.x) to clear the allowlisted advisory.

## HUMAN REQUIRED — one-time, before onboarding real users (from the audit)
- [ ] **Revoke & rotate the GitHub PAT** embedded in `.git/config` remotes. (D12 — CRITICAL)
- [ ] **Wire Stripe Connect money-out** as a facilitator (destination charges/transfers) — legal-design decision with counsel. (B2)
- [ ] **Set `EMAIL_PHYSICAL_ADDRESS`** to a real postal/PO-box before any marketing send. (E2)
- [ ] **Decide the minimum age** (13 / 16 / 18) — drives COPPA/parental-consent posture. Implemented default is 16+. (F)
- [ ] **Set `FIELD_ENCRYPTION_KEY`** (32-byte) in production before any TIN is stored. (Phase 4)
- [ ] **Browser-based color-contrast pass** (Lighthouse/axe in Chrome); audit gold-on-white text. (I2)
- [ ] **Enable & test Railway PITR/backups**; write the restore runbook. (D16)
- [ ] **Attorney review** of money-flow (audit §B), tax nexus/1099-K posture, and `DATA_PRACTICES.md`. (B, Phase 4)
- [ ] **Confirm the `security@goodcircles.org` alias** routes to a monitored inbox.
- [ ] **Apply the held tax migration** (`docs/HELD-MIGRATION-tax-scaffolding.md`) after review, if/when tax capture is enabled.

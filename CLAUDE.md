# GoodCircles — Claude Code Context

## What This App Is

GoodCircles is a community marketplace with a triple-impact economic model:
- **Consumers** save 10% on every purchase
- **10% of merchant profit** is donated to a nonprofit the consumer elects
- **1% platform fee** — no subscriptions, no per-sale fees

Roles: Consumer, Merchant, Nonprofit, Platform Admin.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Framer Motion, Recharts |
| Backend | Express 5, TypeScript, tsx (runtime) |
| Database | Prisma ORM (see `/prisma`) |
| Payments | Stripe (test mode during beta) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`), Google GenAI (`@google/genai`) |
| Auth | JWT + bcryptjs |
| Email | Resend |
| Deploy | Railway (`railway.toml`, `nixpacks.toml`), Docker |
| Tests | Vitest |

## Project Structure

```
/                        # Root: App.tsx, index.tsx, types.ts, constants.ts
/views/                  # One file per major page/view
/components/             # Shared React components
/hooks/                  # Custom React hooks
/server/src/
  controllers/           # Request handlers
  routes/                # Express route definitions
  services/              # Business logic
  middleware/             # Auth, rate limiting, etc.
  utils/                 # Shared utilities
  data/                  # Seed / static data
  mocks/                 # Mock implementations
/prisma/                 # Schema and migrations
/routing/                # Client-side routing
/services/               # Frontend service layer
/types/                  # Shared TypeScript types
/validation/             # Zod schemas
```

## Dev Commands

```bash
npm run dev              # Start dev server (tsx server.ts)
npm run build            # prisma generate + tsc + vite build
npm run test             # vitest run
npm run seed:beta        # Seed beta test accounts
npm run prisma:migrate   # Run DB migrations
```

## Beta Status

**Version:** 1.0.0-beta

### Fully Functional (Real Data)
- User auth, registration
- Marketplace browsing and listings
- Cart, checkout, transaction processing (Stripe test mode)
- Wallet balances, 10/10/1 payment splits
- Merchant dashboard (orders, bookings, financials)
- Nonprofit transaction feed and payout records
- Booking/scheduling system
- Referral code generation
- Admin user management

### Completed Production Fixes (as of 2026-04-27)
- **Impact Map** — full rewrite: real SVG cartogram, deterministic demo data, drill-down, health score, CDBG print report
- **Community Activity Feed** — wired to real `GET /api/feed` endpoint with privacy controls; fallback to demo data if empty
- **Impact Leaderboard** — wired to real `GET /api/leaderboard` (cities, merchants, neighbors, nonprofits from DB)
- **Cart QR Token** — replaced Math.random() stub with HMAC-signed token from `POST /api/wallet/qr-token`
- **Wallet Fund** — Stripe Elements embedded card form; PaymentIntent flow; wallet credited only after Stripe webhook confirms
- **Feature Flags** — moved from in-memory to DB-backed via `SystemSetting` table; persist across deploys
- **Demo Mode toggle** — admin-only; persisted to DB; live users always see real data
- **Demo Reset button** — wipes all beta/demo transactions and zeros all balances
- **Admin password change** — self-service from Admin Settings panel
- **Remote user management** — admin can edit user info, issue credits, adjust wallet balance, reset passwords
- **Audit Log** — every admin action writes to `AdminAuditLog` table; viewable in admin portal
- **Merchant order emails** — sent on checkout via Resend
- **Customer receipt emails** — sent on checkout via Resend
- **Wallet top-up confirmation emails** — sent after Stripe webhook confirms payment
- **Nonprofit daily digest emails** — sent via 24h scheduler; only on days with donations; links to dashboard
- **Leaderboard real data** — `GET /api/leaderboard` aggregates real transactions across 4 dimensions
- **Feed real data** — `GET /api/feed` returns real transactions with privacy controls
- **CDFI partner management** — activate/deactivate from admin portal, wired to DB
- **Price Sentinel review** — admin approve/reject flagged listings, wired to DB
- **FAQ v8.02** — added CDFI and Impact Map FAQ entries
- **NonprofitAnalytics** — wired to real `GET /api/nonprofit/analytics` (category breakdown) + `GET /api/nonprofit/stats` (6-month trend); removed all hardcoded chart data
- **NonprofitInitiatives** — wired to real `GET /api/nonprofit/initiatives` + `POST /api/nonprofit/initiatives`; create-initiative modal functional
- **NonprofitReferrals** — wired to real `GET /api/nonprofit/referral-info`; real bonus totals from `ReferralBonusPayout` table
- **Backend: nonprofit trend** — `nonprofitController.getStats()` computes real 6-month trend from DB transactions
- **Backend: nonprofit analytics** — `getAnalytics()` computes real geographic coverage (distinct states) and category breakdown
- **Backend: nonprofit initiatives** — `getInitiatives()` computes real supporter count from waived-discount transactions
- **Backend: nonprofit referrals** — `getReferralInfo()` sums real bonus payouts from `ReferralBonusPayout`
- **Backend: admin financials** — `getFinancialOverview()` computes real platform fees, wallet balance aggregate, payment split, netting savings from DB
- **Backend: admin system health** — `getSystemHealth()` reports real last-run times from `NonprofitDigestLog`, `WalletTopUp`, and `Transaction` tables
- **Backend: admin stats** — `getStats()` computes real `internalBankingAdoption` from wallet vs card transaction ratio

### Remaining Pre-Launch Work

#### Infrastructure / Deployment (blocking — must do before first live user)
- **Railway env var** — add `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...` (or `pk_test_...`) in Railway service settings
- **Commit & push** — all production-launch changes are uncommitted; push triggers Railway deploy which runs `prisma db push` (applies 4 new schema models: `SystemSetting`, `AdminAuditLog`, `WalletTopUp`, `NonprofitDigestLog`)
- **Stripe webhook** — ensure `STRIPE_WEBHOOK_SECRET` is set in Railway and the `payment_intent.succeeded` event is enabled in Stripe dashboard for the live endpoint
- **Stripe live mode** — switch `STRIPE_SECRET_KEY` from `sk_test_...` to `sk_live_...` when ready for real payments

#### Intentionally Deferred (not blocking launch)
- **FAQ persistence** — currently stored in localStorage; could be moved to `SystemSetting` DB table
- **JWT expiration** — no frontend handling for expired tokens (silent failure); add refresh or redirect to login
- **Wallet Withdraw** — shows alert only; real Stripe Connect payout not implemented (pending business registration)
- **Catalog Import connectors** — Shopify/Etsy/Amazon OAuth is simulated (intentional per decision)
- **Onboarding Pipeline** — fake async delays, not real API calls
- **Integrity Test Suite** — simulated, no real tests run
- **Print/Export buttons** — window.print() or alert() placeholders
- **Credit Dashboard** — activates at 200 merchants (intentional gate)
- **Mobile apps** — pending

### Intentionally Inactive (Pending Business Registration)
- Stripe live payments (test mode only)
- Shopify/Etsy/Amazon connectors
- CDFI fund deployment
- Municipal partner portal
- Cooperative purchasing
- Mobile apps

## Pre-Seeded Beta Accounts

Password for all: `BetaTest2026!`

| Email | Role |
|---|---|
| admin@goodcircles.org | Platform Admin |
| alice@beta.test | Consumer |
| bob@beta.test | Consumer |
| marco@theharvesttable.com | Merchant |
| lisa@fixitlocal.com | Merchant |
| david@justicelaw.com | Merchant |
| sarah@farmfreshco.com | Merchant |
| alex@tutorzone.com | Merchant |
| contact@localfoodbank.org | Nonprofit |
| info@youthscholars.org | Nonprofit |
| team@greencleanup.org | Nonprofit |

## Important Notes
- Deployed on Railway
- Context folder at `../Context/` contains business plan, executive briefing, vendor/merchant prospect lists, marketing plan, and tax impact analysis
- The app uses both Anthropic and Google GenAI SDKs

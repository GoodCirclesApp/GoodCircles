# Good Circles — Beta Tester Guide

Welcome to the Good Circles beta! This guide will walk you through how to use the platform.

## What is Good Circles?

Good Circles is a community marketplace where every purchase creates a triple impact:
- **You save 10%** on every transaction (as a price discount or platform credits)
- **10% of merchant profit** goes to a nonprofit of your choice
- **1% platform fee** — no subscriptions, no per-sale fees

## Getting Started

### Step 1: Register
Go to the app and click **Register**. Choose your role:
- **Consumer** — Shop and support local causes
- **Merchant** — List your products/services and join the community economy
- **Nonprofit** — Receive funding and recruit merchants

All beta accounts are **automatically verified** and receive a **$50 wallet balance** for testing.

**Password for all pre-seeded accounts:** `BetaTest2026!`

### Pre-Seeded Test Accounts

| Email | Role | Details |
|-------|------|---------|
| admin@goodcircles.org | Platform Admin | Full admin access |
| alice@beta.test | Consumer | $50 balance |
| bob@beta.test | Consumer | $50 balance |
| marco@theharvesttable.com | Merchant | The Harvest Table (Restaurant) |
| lisa@fixitlocal.com | Merchant | Fix-It Local Plumbing |
| david@justicelaw.com | Merchant | Justice Partners Legal |
| sarah@farmfreshco.com | Merchant | Farm Fresh Collective (Groceries) |
| alex@tutorzone.com | Merchant | TutorZone Academy (Education) |
| contact@localfoodbank.org | Nonprofit | Community Food Bank |
| info@youthscholars.org | Nonprofit | Youth Scholars Alliance |
| team@greencleanup.org | Nonprofit | Green Cleanup Initiative |

## How to Make a Purchase

1. Log in as a **Consumer** (e.g., alice@beta.test)
2. Browse the **Marketplace** — you'll see products and services from all merchants
3. Each listing shows the original price and your **member discount (10%)**
4. Click **Add to Cart**
5. Open your **Cart** — you'll see a full financial breakdown:
   - Original price
   - Your 10% discount
   - Amount going to your elected nonprofit
   - Platform fee (1%)
   - Your total
6. Choose your payment method:
   - **Platform Balance** — No processing fees! 
   - **Card** — 2.9% + $0.30 processing fee (passed through at cost)
7. Click **Checkout**

## How to Book a Service

1. Find a service listing (e.g., "Initial Legal Consultation")
2. View available time slots
3. Select a date and time
4. Book the appointment
5. The merchant confirms the booking
6. After service completion, the transaction is processed

## How to View Your Impact

- Go to **Impact** in the navigation to see your personal impact dashboard
- See total saved, total contributed to nonprofits, and community fund investments

## For Merchants

1. Log in with a merchant account
2. Go to **Merchant Portal** in the navigation
3. You can:
   - View your **Dashboard** with sales metrics
   - Manage **Listings** (add/edit products and services)
   - View **Bookings** for service appointments
   - See **Financial Reports** with full transaction breakdowns
   - Access **Co-op Purchasing** (monitoring mode during beta)
   - Manage **Settings** including payment preferences

## For Nonprofits

1. Log in with a nonprofit account
2. Go to **Nonprofit Portal** in the navigation
3. You can:
   - View your **Dashboard** with funding totals
   - See the **Transaction Feed** of all contributions
   - Access **Analytics** on supporter patterns
   - Manage your **Referral Program** (generate referral codes)
   - Create and manage **Community Initiatives**

## Known Limitations (Beta)

The following are confirmed, intentional limitations during the beta period. Each item is flagged for transition to live data and full functionality before public launch. Beta testers should be aware that these areas display demonstration content rather than real platform activity.

---

### ✅ Fully Functional (Real Data)
These features are wired to the live database and work end-to-end:
- User registration and authentication
- Marketplace browsing and product listings
- Cart, checkout, and transaction processing (Stripe test mode)
- Wallet balances and internal payment splits (10/10/1 model)
- Merchant dashboard (orders, bookings, financials)
- Nonprofit transaction feed and payout records
- Booking and scheduling system
- Referral code generation
- Admin user management and system health

---

### 🟡 Demo Data — Displays Fake Content (Pre-Launch Fix Required)

**Impact Map** (`/impact-map`)
- Shows 5 hardcoded fictitious nodes (Westside Arts District, Downtown Commercial Hub, etc.) with fake coordinates and dollar amounts
- Not connected to real merchant/nonprofit locations or transaction volumes
- "Analyze Circular Flow" button does nothing
- *Fix required: Wire to RegionalMetricsService and real geographic coordinates*

**Community Activity Feed** (homepage ticker and feed)
- Generates randomized fake transactions using `Math.random()` (fake merchant names, fake amounts $15–$100, fake timestamps)
- Falls back to demo data even when the API is available
- *Fix required: Connect to live transaction stream*

**Impact Leaderboard**
- Displays hardcoded community rankings (3 Mississippi regions, 4 nonprofits) from a static constants file
- Does not reflect actual platform activity
- *Fix required: Pull from live aggregated metrics*

**Nonprofit Initiatives**
- Shows 3 hardcoded fake initiatives (Community Garden $3K, Youth Tech $8.5K, Senior Meal $12K)
- Not connected to any database model
- *Fix required: Connect to CommunityInitiatives database table*

**Nonprofit Analytics**
- Monthly funding chart and merchant category distribution use hardcoded arrays (10%–30% fake growth figures)
- *Fix required: Aggregate from real transaction history*

**Nonprofit Referrals**
- Referred merchant list and bonus tier thresholds ($7.5K–$150K) are hardcoded
- *Fix required: Pull from ReferralService live data*

**Credit Dashboard**
- Explicitly noted in code as simulated — mock credit history and expiry data
- Platform credits not yet active (threshold: 200 merchants)
- *Fix required: Activate CreditService once merchant threshold is met*

**Municipal Demo Simulator**
- Entire feature is a projection tool with 14 hardcoded scale presets (Small Town → Amazon Scale)
- Intended for sales demos, not live use
- *Pre-launch decision required: Keep as sales tool or replace with live municipal data*

---

### 🔴 Stub Features — Buttons/Actions That Do Nothing (Pre-Launch Fix Required)

**Wallet — Withdraw Button**
- Shows an `alert()` popup about a 3.5% fee but does not process any withdrawal
- *Fix required: Integrate with Stripe Connect payout flow*

**Cart — QR Handshake Token**
- Generates a fake random token (`Math.random()`) instead of a real signed payment token
- *Fix required: Connect to QRCheckoutService HMAC signing*

**Catalog Import — Platform Connect**
- Shopify, Etsy, and Amazon connector screens simulate authentication with a timer rather than real OAuth flows
- *Fix required: Activate real connector APIs (gated on billing registration)*

**Catalog Payment Step**
- Simulates payment processing with a timer instead of real Stripe charge
- *Fix required: Wire to CatalogBillingService (gated on billing registration)*

**Onboarding Pipeline**
- Step transitions use fake async delays instead of real backend calls
- *Fix required: Connect each step to real API endpoints*

**Integrity Test Suite**
- Test execution is simulated with timers — no real backend tests are run
- *Fix required: Wire to actual test runner or remove from production UI*

**Sentinel Security**
- Threat level resets to "STABLE" automatically after 5 seconds via a timer
- *Fix required: Connect to real security event monitoring*

**Print / Export Buttons** (multiple dashboards)
- "Print PDF", "Copy embed code", and similar buttons use `window.print()` or `alert()` placeholders
- *Fix required: Implement real export/PDF generation*

---

### ⚪ Intentionally Inactive (Pending Business Registration)

- **Stripe live payments** — Currently in test mode. No real charges occur. Activates after business registration.
- **Stripe refunds** — Internal wallet refunds work. Card refunds are recorded but not executed until live Stripe webhook is configured.
- **Shopify / Etsy / Amazon catalog connectors** — API credentials pending business registration.
- **CDFI fund deployment** — Feature complete but inactive; requires CDFI partner agreement.
- **Municipal partner portal** — Feature complete; requires municipal contract.
- **Cooperative purchasing** — In monitoring mode; activates at platform thresholds.
- **Mobile apps** — Web application only during beta.

---

## Reporting Issues

If you encounter a bug or unexpected behavior, please note:
1. What you were trying to do
2. What happened instead
3. Your account email and role
4. Any error messages you saw

When testing, please focus your feedback on the **✅ Fully Functional** features above — those are the areas where real bugs matter most right now.

Thank you for helping us build a better community economy!

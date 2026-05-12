# Good Circles — Decisions Log

> One entry per meaningful decision. Newest at top.
> Format: Date · Decision · Context · What it rules out

---

## 2026-05-11 — Marketing Savant Mode activated

**Decision:** Claude Code is now the Good Circles marketing, growth, community, partnerships, and pre-launch operations operator — not only the dev assistant. Full directive stored in conversation context and encoded into CLAUDE.md.

**Context:** Bootstrapped one-person team needs a force multiplier that maintains context across sessions, builds reusable systems, and compounds value by encoding repeated workflows into slash commands and skills.

**Rules out:** Starting every marketing session cold with re-briefing. One-off outputs that don't encode as reusable assets.

---

## 2026-05-11 — SupportInbox: raw fetch → apiClient

**Decision:** All six `fetch` calls in the SupportInbox component replaced with `apiClient` calls.

**Context:** The JWT access token expires after 15 minutes. Raw `fetch` calls received a 403 on expiry and had no recovery path. The `apiClient` interceptor already handles 401/403 by refreshing the token and retrying silently — it was simply never used in the inbox.

**Rules out:** Any new component using raw `fetch` for authenticated requests — always use `apiClient`.

---

## 2026-05-10 — Compose email added to support inbox

**Decision:** Added compose (new outbound email) capability to the admin portal support inbox, posting to `POST /api/email/send` via Resend.

**Context:** Admins needed the ability to initiate email threads, not just reply to inbound.

**Rules out:** Using the compose form for mass outreach — it's single-recipient, one email at a time, support-context tool.

---

## 2026-05-07 — CORS opened to any HTTPS origin

**Decision:** Railway CORS policy changed from allowlist to allow any HTTPS origin. `if (origin.startsWith('https://')) return callback(null, true)`.

**Context:** Landing page deployed on Netlify. Railway's CORS allowlist did not include the Netlify domain, blocking all waitlist form submissions. JWT Bearer token auth (not cookies) means CSRF via CORS bypass is not a threat vector.

**Rules out:** Needing to update CORS allowlist every time the landing page URL changes.

---

## 2026-05-07 — API base URL hardcoded to Railway in landing page

**Decision:** `landing/src/lib/api.ts` default base URL changed from `'http://localhost:3000'` to `'https://goodcircles-production.up.railway.app'`.

**Context:** `VITE_API_BASE` was not set in Netlify build environment, causing all API calls to go to localhost (unreachable from the deployed browser). Hardcoding the Railway URL as default eliminates the dependency on the Netlify env var.

**Rules out:** Relying on `VITE_API_BASE` being set in Netlify for the landing page to function.

---

## 2026-05-07 — alreadyRegistered wired through landing page

**Decision:** Added `alreadyRegistered` flag propagation from server response through all 5 signup forms to the Confirmation component.

**Context:** Server was already returning `alreadyRegistered: true` for duplicate email signups but the landing page ignored it and showed a false "confirmation email sent" message.

**Rules out:** False-positive confirmation messages for people who sign up twice.

---

## 2026-05-07 — Briefing Requests Prisma NULL filter fixed

**Decision:** Replaced `{ briefingStatus: { not: 'dismissed' } }` with `{ OR: [{ briefingStatus: null }, { briefingStatus: { not: 'dismissed' } }] }` in `listBriefings`.

**Context:** Prisma's `{ not: 'dismissed' }` filter excludes NULL rows in the underlying SQL, which means new entries with no briefing status never appeared in the admin portal.

**Rules out:** Using simple `{ not: <value> }` Prisma filters when NULL rows should be included — always use OR with null check.

---

## 2026-04-27 — Mississippi-first launch, September 2026

**Decision:** Good Circles launches in Mississippi only in September 2026. Global (other states) launch planned for after January 2027.

**Context:** Brand identity is rooted in Mississippi's specific economic profile ($8.6B leakage, #2 generosity ranking despite #1 lowest income), community trust requires local credibility before scaling, and a controlled first market allows the founding circle to shape the product.

**Rules out:** Nationwide or multi-state launch in 2026. Offering founding circle access to non-Mississippi users until after January 2027 (they join a separate interest list via comments/DMs).

---

## 2026-04-27 — Founding Circle permanent status terminology

**Decision:** "Founding Circle," "Founding Merchant," "Founding Nonprofit," "Founding Partner" are permanent status terms — capitalized, used consistently, not treated as marketing language that rotates.

**Context:** These terms signal that early members are builders, not early adopters. Permanence is the value proposition — you earn it once and it stays.

**Rules out:** Using "early access," "beta users," "charter members," or other generic pre-launch language. Do not downgrade or expire Founding status.

---

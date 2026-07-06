# Meridian re-engagement email — DRAFT, one-time send (owner triggers manually)

**Status: DRAFT ONLY — DO NOT SEND without owner review and manual trigger.**

## Send plan

- **Audience:** existing waitlist members. Preferred segment: Mississippi members —
  `WaitlistEntry.state = 'MS'` OR `zipCode` starting `393` (Meridian/Lauderdale). The
  `state`/`zipCode` fields exist on the model but are only populated where a member
  supplied them (city-request and some role flows); members with neither stay in the
  general send or are excluded — owner's call at send time.
- **From:** `hello@goodcircles.org` (marketing alias — never a personal address).
- **Mechanism:** Admin Portal → Email Campaigns → compose to segment. ⚠️ The mass-send
  path is CAN-SPAM-gated: `EMAIL_PHYSICAL_ADDRESS` must be set in Railway before any
  marketing mass send.
- **Honesty rules honored:** no signup counts, no vote totals, no momentum language, no
  implication any organization endorsed Good Circles.
- **One-time send.** Do not schedule recurrence.

## Subject line (pick one)

1. `Meridian goes first — make your election`
2. `Early access is underway in Meridian. Your election is open.`
3. `You're in the founding circle. Now elect your nonprofit.`

Preheader: `Elect the Meridian nonprofit your shopping will support — two minutes, free.`

## Body (HTML-ready copy)

---

**Early access is underway in Meridian & Lauderdale County.**

Hi {firstName | "neighbor"},

You joined the Good Circles founding circle before there was anything to click — thank
you. Here's the first real thing to do with it.

**Meridian & Lauderdale County is our founding community**, and early access is underway
ahead of the September 2026 launch in the Jackson metro. Founding members go first, and
there are two things only a member can do:

**1. Elect your nonprofit.** Pick the Meridian-area organization your everyday shopping
will support. When shopping opens, about **10% of the merchant's net profit** on every
local purchase you make funds your elected nonprofit — automatically, at no cost to you
or to them.

**2. Pick your businesses.** Tell us which local businesses you most want to see on
Good Circles — from downtown restaurants to the shops you already love. Pick one to ten.

> **[Make my election →](https://goodcircles.org/meridian)**

It takes about two minutes and it's free — it always will be for shoppers and
nonprofits. You'll save about 10% on local purchases once shopping opens, and the
businesses you bring keep 89% of their profit on a 1% fee.

One honest note: the organizations on the ballot haven't endorsed Good Circles.
They're listed because they serve Meridian & Lauderdale County — and they are
**elected by neighbors like you**. That's the whole point.

Not in the Meridian area? Your founding spot is unchanged, and your city's turn is
coming — the September 2026 launch starts in the Jackson metro, then Good Circles
expands to the cities that ask for it most. You can still
[put your city on the map](https://goodcircles.org/request-your-city/).

— Timothy Franklin
Founder, Good Circles

*You received this because you joined the Good Circles waitlist. Your founding status
is permanent and requires no action.*

---

## Implementation notes for the send (admin)

- Merge field: `{firstName}` → fall back to "neighbor" (the field is newly collected;
  most existing members won't have one).
- CTA URL: `https://goodcircles.org/meridian` (add `?utm_source=email&utm_campaign=meridian-reengagement` at send time).
- The /meridian form enforces one election per verified email — members who already
  elected will see a clear "already elected" message, so a duplicate send is safe.

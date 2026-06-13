# NM9t5 — Synthesis (for Good Circles integration)

*Sources: the per-page notes in this folder, fetched 2026-06-13. Pages individually fetched:
home, about, memberships, ascend-the-ladder, veterans-and-military-spouses, foundation. Other
audience tracks render from the same SPA shell and share the offer below; their segment-specific
claims are kept to what the home/segment pages verify (no invented program details).*

## Positioning
The No More 9 to 5 Club (NM9t5), founded by **Jason McNamara** (U.S. Navy veteran, ex-corporate),
is **"a growth ecosystem for people who want autonomy, skill-based income, and real leverage."**
Its thesis is execution over mindset ("We train execution performance"), and freedom by
preparation, not escape ("You weren't meant to live for weekends"). It serves entrepreneurs at
every stage and runs a mission-driven Foundation alongside the Club.

## The product, simply
1. **Roadmap to Success survey (Free):** the no-friction entry — "Get Your Custom Roadmap (Free) …
   No credit card. No pressure. Just clarity."
2. **Ascend the Ladder (3 stages):** Escape the System → Startup → Scale.
3. **Memberships:** Free / **Basic $28** / **Professional $97** (commission up to 33% direct;
   Pro adds a 2-tier 33% structure — the affiliate-revenue surface).
4. **The Foundation:** the nonprofit arm; veterans + entrepreneurs; "Join Our Free Boot Camp."

## Audience segments, ranked by overlap with Good Circles (sellers)
| Rank | Segment | Why it overlaps |
|---|---|---|
| 1 | **Aspiring entrepreneurs** | Become first-time **local sellers** — the exact top of the Good Circles /for-business funnel |
| 2 | **Corporate professionals transitioning** | Leaving the 9-to-5 to start a local business; high intent, disposable income |
| 3 | **Veterans & military spouses** | Founder is a vet; Foundation focus; tight community; emotionally resonant content |
| 4 | **Early-stage entrepreneurs** | Already launched, need **customers** = Good Circles stages 4–5 |
| 5 | **Parents seeking financial freedom** | Home/local businesses; community-first framing fits Good Circles |
| 6 | **Content creators & influencers** | May sell products/services locally; amplification value |
| 7 | **Experienced entrepreneurs** | Stage-6 scale (multi-location, product lines) |
| — | Investors / Digital nomads / HNWI | Lower direct seller overlap |

## Top 3 offers to promote (affiliate)
1. **Roadmap to Success survey (Free)** — best entry CTA everywhere (zero friction, highest CTR).
2. **Memberships (Basic $28 / Professional $97)** — the monetizable upgrade; where commission is earned.
3. **Veterans free training + Foundation boot camp** — mission-aligned, powerful for veteran content
   and the secondary /for-nonprofits angle.

## Buyer-journey fit (the core of the partnership)
NM9t5 owns **stages 1–3** (decide → build skills → first offer) and **stage 6** (scale). Good Circles
owns **stages 4–5** (join the Founding Circle → sell locally and keep 89% of profit). They sit
end-to-end. NM9t5's "Escape → Startup" = GC stages 1–3; NM9t5 "Scale" = GC stage 6.

## Canonical affiliate URL format
```
https://thenomore9to5club.org<path>?am_id=<MY_AFFILIATE_ID>&utm_source=goodcircles&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>
```
`am_id` is the affiliate parameter (confirmed live as `am_id=nm9t5club` on their partner links).
Good Circles sets its own ID via the `PUBLIC_NM9T5_AFFILIATE_ID` env var (never hardcoded).
Key NM9t5 paths to link: `/` , `/memberships`, `/ascend-the-ladder`, `/veterans-and-military-spouses`,
the Roadmap survey CTA, and the Foundation (`https://thenomore9to5foundation.org/`).

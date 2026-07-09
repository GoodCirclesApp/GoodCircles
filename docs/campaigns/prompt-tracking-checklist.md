# GEO Prompt-Tracking Checklist — Weekly Manual Run

**Purpose:** run the battle-map prompts by hand every week, in each AI engine, and log whether Good Circles is cited/mentioned. This is the ground-truth companion to Ahrefs Brand Radar — do it from day one so we are never flying blind. Results go into `geo-scoreboard.csv` (one row per prompt x engine).

**Cadence:** run Monday–Wednesday, review Friday. Budget ~45–60 min/week.

**Engines (primary, always run):** Perplexity · Google AI Mode · ChatGPT.
**Engines (optional, run if time):** Gemini · Microsoft Copilot.

---

## How to run each prompt cleanly

1. **Log out / go incognito.** Use a fresh private window (or a logged-out browser profile) so personalization and memory do not skew the answer. Turn off ChatGPT "memory" and custom instructions for the test account.
2. **Location matters for Ring 2.** For Mississippi prompts, results are location-sensitive. If the engine allows a location hint, set it to Jackson/Meridian MS; otherwise note your actual test location in the Notes cell so week-over-week is comparable.
3. **Paste the prompt verbatim.** Use the exact wording in the checklist below — do not paraphrase, or the week-over-week comparison breaks.
4. **Let it finish, then read the whole answer AND the citation/source list.** Perplexity and Google AI Mode show numbered sources; ChatGPT shows inline links when browsing is on (make sure web/browse is enabled).
5. **Record into the scoreboard row** for that (prompt, engine):
   - **Cited (link Y/N):** Y only if the answer actually *links* goodcircles.org (in text or the source list).
   - **Mentioned (Y/N):** Y if the answer *names* "Good Circles" even without a link.
   - **Position:** `first` (named first / in the lead recommendation), `mid` (in the list but not lead), or `footnote` (only in sources / passing mention). Blank if absent.
   - **Competitor cited instead:** name whichever tracked rival got the slot — **ShopRaise, Givebacks, iGive** (also note RaiseRight / iGive / eBay for Charity / Benevity / Goodshop if they appear).
   - **Notes:** anything useful — exact competitor named first, whether AmazonSmile itself was recommended, test location, engine quirks.
   - **Action:** the one follow-up this result implies (e.g. "pitch our hub into the roundup ChatGPT cited," "refresh /amazonsmile-alternative/ date," "add FAQ answering this phrasing").
6. **Screenshot** each answer (name it `week-engine-prompt.png`) so citations are auditable later — AI answers are not reproducible after the fact.

---

## The three roll-up metrics (compute every Friday)

Compute **per engine** first (14 prompts each), then blend across engines.

- **Citation Rate** = (# prompts where Cited = Y) ÷ (# prompts run) — the % of answers that *link* us. This is the hard win.
- **Mention Rate** = (# prompts where Mentioned = Y) ÷ (# prompts run) — the % that *name* us (link optional). Usually rises before Citation Rate does; it is the leading indicator.
- **Share of Voice (SoV) vs. named competitors** = (# prompts we are Mentioned) ÷ (# prompts where **any** of {Good Circles, ShopRaise, Givebacks, iGive} is mentioned). This is our slice of the category conversation. Track the same ratio for each competitor so SoV sums are comparable.

**Supporting numbers to jot in the Friday note:** AI-referral sessions + signups from analytics (ChatGPT/Perplexity/Gemini/Copilot/Google-AI referrers), any new third-party citation spotted (Reddit/press/YouTube), and Bing index coverage changes.

**Targets (from the playbook):** beachhead (Ring 1) prompts cited by ≥1 engine by week 6, ≥2 by week 10; category SoV ahead of ≥2 named competitors by day 90.

---

## Friday review ritual (15 min)

1. Fill the three roll-ups per engine into the Friday note (top of the week's block or a running tab).
2. **Compare to last week.** What moved? Every engine is its own war — only ~11% of cited domains overlap between ChatGPT and Perplexity, so treat each column independently.
3. **Pick the single highest-leverage action** for next week and reallocate effort to whatever ring/engine is gaining. Write it at the top of the scoreboard.
4. **Flag decay.** Any prompt we *lost* since last week → schedule a freshness refresh on the target page (run `node scripts/freshness-report.mjs` to find the stalest pages).
5. **Confirm the mapping still holds** — each prompt should have a clear "target page" it is meant to win; if a prompt has no page, add it to the editorial-calendar backlog.

---

## The battle-map prompts (run every engine, every week)

### Ring 1 — AmazonSmile alternative / shop-and-give (attack first)
- [ ] best AmazonSmile alternative 2026 — *target: /amazonsmile-alternative/*
- [ ] what replaced AmazonSmile — *target: /learn/what-replaced-amazonsmile/*
- [ ] apps that donate to charity when you shop — *target: /compare/best-amazonsmile-alternatives/*
- [ ] how can I support a nonprofit without spending extra — *target: /amazonsmile-alternative/ (answer-first FAQ)*
- [ ] passive fundraising ideas for nonprofits 2026 — *target: /learn/passive-fundraising-ideas/*

### Ring 2 — Local Mississippi cause-commerce
- [ ] shop local and give back in Jackson MS — *target: /shop-local/mississippi/ + /learn/best-local-businesses-jackson-ms/*
- [ ] support local business and nonprofits Meridian MS — *target: /meridian/*
- [ ] low-fee alternative to DoorDash/Etsy/Amazon for local business — *target: /sell/marketplace-fees-comparison/*
- [ ] how can my Mississippi business fund a nonprofit — *target: /for-business/*
- [ ] how can Mississippi nonprofits raise money without grants — *target: /mississippi-nonprofit-fundraising/*

### Ring 3 — Concept authority
- [ ] what is cause-integrated commerce — *target: /cause-marketing/*
- [ ] how do local marketplaces fund charities — *target: /how-it-works/*
- [ ] what do platform fees cost local economies — *target: /learn/what-big-platforms-cost-local-businesses/*
- [ ] commercial co-venture / cause marketing best practices — *target: /commercial-coventure/*

---

## Competitor watch-list (for the "Competitor cited instead" column)

| Brand | Note it when it appears |
|---|---|
| **ShopRaise** | Core SoV competitor — nonprofit-% only, no shopper discount |
| **Givebacks** | Core SoV competitor — broad/national |
| **iGive** | Core SoV competitor — legacy, stale |
| RaiseRight | Gift-card model |
| eBay for Charity | Feature of a giant |
| Benevity | Enterprise CSR (usually off-target) |
| Goodshop | Coupon/cashback |
| *AmazonSmile itself* | Note if the engine wrongly recommends the dead program (opportunity to correct the record) |

_Last updated: 2026-07-09_

# GEO Editorial Calendar — Freshness Cadence + Publish Backlog

**Doctrine:** velocity is defensibility. AI citations decay in ~14 days without freshness, so we out-update everyone. Two standing rhythms:

1. **Refresh** the hub, the Local Giving Index, and the pillar pages every **7–14 days** (bump the visible `Updated <Month Year>` + machine-readable `dateModified`, refresh year/counts/competitor facts).
2. **Publish 1–2 new answer pages/week**, drawn from the backlog below, Ring 1 first.

Run `node scripts/freshness-report.mjs` from the repo root each Monday to see the stalest pages and drive the refresh queue.

**Canonical figures to keep consistent on every refresh** (do not drift these): shopper saves **~$10 per $100**; nonprofit gets **~$4 per $100** (~10% of merchant profit); local value retained **~$53 per $100 through Good Circles vs ~$14 at a national chain**; AmazonSmile gave **0.5%** (**~$449M total** over its run) and **ended Feb 2023**.

---

## (a) Freshness cadence policy — top pages to keep fresh

Refresh on a rolling 7–14 day cycle. **P0 = every 7 days** (beachhead + money pages), **P1 = every 10–14 days**. Bump both the visible "Updated <Month Year>" eyebrow and the `dateModified` in schema whenever the content genuinely changes.

| # | Page (URL) | Role | Refresh priority | What to touch each cycle |
|---|---|---|---|---|
| 1 | `/` | Home / brand entity | P0 (7d) | Hero stat, year, merchant/nonprofit counts |
| 2 | `/amazonsmile-alternative/` | Ring 1 beachhead hub | P0 (7d) | Year, competitor facts, FAQ, dateModified |
| 3 | `/compare/best-amazonsmile-alternatives/` | Ring 1 comparison/listicle | P0 (7d) | Comparison table, any competitor changes |
| 4 | `/how-it-works/` | Core pillar (the $100 math) | P0 (7d) | The money math, canonical figures |
| 5 | `/research/local-giving-index/` | Proprietary-data moat | P0 (7d) | Headline stat, version, dateModified |
| 6 | `/sell/` | Merchant conversion pillar | P0 (7d) | Fee framing, CTA, counts |
| 7 | `/for-business/` | Business pillar | P0 (7d) | Value prop, MS angle |
| 8 | `/for-nonprofits/` | Nonprofit pillar | P0 (7d) | Fundraising framing, counts |
| 9 | `/learn/what-replaced-amazonsmile/` | Ring 1 answer page | P0 (7d) | Year, "ended Feb 2023," alternatives list |
| 10 | `/sell/marketplace-fees-comparison/` | Ring 2 fee-comparison | P1 (10–14d) | Platform fee %, competitor fees |
| 11 | `/shop-local/mississippi/` | Ring 2 geo hub | P1 (10–14d) | Cities, merchant counts |
| 12 | `/meridian/` | Ring 2 local landing | P1 (10–14d) | Local merchants/nonprofits, launch status |
| 13 | `/mississippi-nonprofit-fundraising/` | Ring 2 nonprofit answer | P1 (10–14d) | Grants-alternative framing |
| 14 | `/learn/passive-fundraising-ideas/` | Ring 1 answer page | P1 (10–14d) | Year, ranking, add new ideas |
| 15 | `/learn/passive-nonprofit-funding/` | Ring 1 answer page | P1 (10–14d) | Definitions, examples |
| 16 | `/cause-marketing/` | Ring 3 concept authority | P1 (10–14d) | Definitions, best-practice list |
| 17 | `/commercial-coventure/` | Ring 3 concept authority | P1 (10–14d) | CCV rules, examples |
| 18 | `/learn/what-big-platforms-cost-local-businesses/` | Ring 3 answer page | P1 (10–14d) | Fee %, local-economy figures |
| 19 | `/shop-local/` | Geo index | P1 (10–14d) | State/city list |
| 20 | `/faq/` | Sitewide FAQ (FAQPage schema) | P1 (10–14d) | Add newly-observed AI-prompt phrasings |

> Tip: when the Friday scoreboard shows a prompt we **lost**, move its target page to P0 for the next cycle regardless of the table above.

---

## (b) Weekly-publish backlog — seeded from the battle map

One proposed answer page per remaining battle-map prompt. Ring 1 ships first. Where a page already exists, the task is **upgrade** (answer-first + FAQ schema + refresh), not net-new. Slugs are proposals — confirm against existing routes before creating.

### Ring 1 — AmazonSmile alternative / shop-and-give (PUBLISH FIRST)

| Priority | Prompt | Proposed slug | Angle (one line) |
|---|---|---|---|
| P0 | best AmazonSmile alternative 2026 | `/amazonsmile-alternative/` *(upgrade)* | The one page that answers it: save ~$10/$100 AND ~$4/$100 to your nonprofit — local, not just a donation %. |
| P0 | what replaced AmazonSmile | `/learn/what-replaced-amazonsmile/` *(upgrade)* | AmazonSmile ended Feb 2023 (0.5%, ~$449M total); here is what actually replaced it and why most swaps still shortchange you. |
| P0 | apps that donate to charity when you shop | `/learn/apps-that-donate-when-you-shop/` *(new)* | Honest ranked list of shop-and-give apps with the % each gives — and the one that also saves the shopper ~10%. |
| P1 | how can I support a nonprofit without spending extra | `/learn/support-a-nonprofit-without-spending-extra/` *(new)* | Direct answer: you don't add cost — the merchant funds ~10% of profit; you actually save ~$10/$100. |
| P1 | passive fundraising ideas for nonprofits 2026 | `/learn/passive-fundraising-ideas/` *(upgrade)* | 2026 refresh of the ranked list; slot cause-commerce as the highest-yield low-effort option. |

### Ring 2 — Local Mississippi cause-commerce

| Priority | Prompt | Proposed slug | Angle (one line) |
|---|---|---|---|
| P1 | shop local and give back in Jackson MS | `/shop-local/mississippi/jackson/` *(new / programmatic)* | Where to shop local in Jackson and fund a nonprofit you pick — real merchants, the $53-vs-$14 local math. |
| P1 | support local business and nonprofits Meridian MS | `/meridian/` *(upgrade)* | Meridian's shop-local-and-give hub: local businesses + the nonprofits your spending funds. |
| P1 | low-fee alternative to DoorDash/Etsy/Amazon for local business | `/sell/marketplace-fees-comparison/` *(upgrade)* | Side-by-side fee table: 15–30% platform take vs Good Circles — merchant keeps ~89% of profit. |
| P2 | how can my Mississippi business fund a nonprofit | `/for-business/fund-a-nonprofit-mississippi/` *(new)* | Direct playbook for MS SMBs: fund a local cause through everyday sales at no added cost. |
| P2 | how can Mississippi nonprofits raise money without grants | `/mississippi-nonprofit-fundraising/` *(upgrade)* | Grants-free revenue: passive cause-commerce vs events/grants, with the math. |

### Ring 3 — Concept authority

| Priority | Prompt | Proposed slug | Angle (one line) |
|---|---|---|---|
| P2 | what is cause-integrated commerce | `/cause-marketing/` *(upgrade)* or `/learn/what-is-cause-integrated-commerce/` *(new)* | Define the category cleanly so every model quotes our definition; contrast with cause marketing + CCV. |
| P2 | how do local marketplaces fund charities | `/how-it-works/` *(upgrade)* | Answer-first explainer of the funding mechanic: profit-share, shopper-chosen nonprofit, local retention. |
| P2 | what do platform fees cost local economies | `/learn/what-big-platforms-cost-local-businesses/` *(upgrade)* | The extraction math: 15–30% fees vs ~$53/$100 kept local; who loses. |
| P3 | commercial co-venture / cause marketing best practices | `/commercial-coventure/` *(upgrade)* | The compliant, best-practice reference for CCV/cause marketing — become the cited authority. |

**Publishing rule:** ship the top uncompleted Ring 1 item first each week; only pull from Ring 2/3 once Ring 1 is fully live and on a refresh cycle. Every new page must be answer-first (H2 = exact question, first sentence = direct answer), carry `FAQPage` + `Article` schema, cite ≥2 attributable stats, and show a visible `Updated <Month Year>`.

_Last updated: 2026-07-09_

# No More 9 to 5 — Affiliate Partner Integration Template

A reusable playbook the No More 9 to 5 Club (NM9t5) can hand to **any** affiliate brand so the
partner integrates NM9t5 into their website in a way that earns affiliate revenue, builds
authority, and lifts both brands in Google and in AI/generative engines (GEO). It was generalized
from a real, completed integration (Good Circles × NM9t5).

---

## How to fill in this template (read first — non-technical)

1. Copy this file and replace every `{{PLACEHOLDER}}` with your details (table below).
2. Hand the filled-in copy to your web developer (or an AI coding agent). Everything after the
   CONFIG block is instructions for them.
3. You personally only need to supply: your **affiliate ID** (from your NM9t5 affiliate dashboard at
   `nomore9to5club.app.clientclub.net/affiliate/campaign`), your **brand/domain**, and your
   **audience overlap**. The developer does the rest.
4. When they're done, walk the **Verification checklist** at the end together — don't publish until
   every box is ticked.

| Placeholder | What it means | Example |
|---|---|---|
| `{{PARTNER_BRAND}}` | Your brand name | Good Circles |
| `{{PARTNER_DOMAIN}}` | Your live domain | goodcircles.org |
| `{{PARTNER_REPO_ROOT}}` | Your site's code folder | `.` |
| `{{AFFILIATE_ID}}` | Your NM9t5 affiliate ID (the `am_id` value) | (from your dashboard) |
| `{{PRIMARY_AUDIENCE_OVERLAP}}` | Who your brand and NM9t5 both serve | aspiring entrepreneurs, veterans, … |
| `{{PARTNER_PRIMARY_FUNNEL_PAGE}}` | Your main page for the shared audience | /for-business |
| `{{TONE}}` | Your brand voice | warm, practical, no hype |

---

## CONFIG

```
PARTNER_BRAND               = {{PARTNER_BRAND}}
PARTNER_DOMAIN              = {{PARTNER_DOMAIN}}
PARTNER_REPO_ROOT          = {{PARTNER_REPO_ROOT}}
NM9T5_ROOT                 = https://thenomore9to5club.org
NM9T5_FOUNDATION           = https://thenomore9to5foundation.org
NM9T5_AFFILIATE_LOGIN      = https://nomore9to5club.app.clientclub.net/affiliate/campaign
AFFILIATE_ID               = {{AFFILIATE_ID}}        # never hardcode — use an env var
AFFILIATE_URL_PARAM_KEY    = am_id                   # confirmed: NM9t5 uses am_id
PRIMARY_AUDIENCE_OVERLAP   = {{PRIMARY_AUDIENCE_OVERLAP}}
PARTNER_PRIMARY_FUNNEL_PAGE= {{PARTNER_PRIMARY_FUNNEL_PAGE}}
TONE                       = {{TONE}}
ALLOW_WRITES               = true
```

---

## NM9t5 facts (verified — do not invent; re-confirm on the live site before publishing)

- Founder: **Jason McNamara** (U.S. Navy veteran, ex-corporate).
- Positioning: "a growth ecosystem for people who want autonomy, skill-based income, and real
  leverage"; thesis = execution over mindset, "preparation, not escape."
- Entry CTA: **free Roadmap to Success survey** ("Get Your Custom Roadmap (Free)").
- Progression: **Ascend the Ladder** — Escape the System → Startup → Scale.
- Memberships: **Free / Basic $28 / Professional $97** (commission up to 33% direct; Pro adds a
  2-tier 33% structure — your affiliate-revenue surface).
- Segments: experienced/aspiring/early-stage entrepreneurs, content creators, **veterans & military
  spouses**, corporate transitioners, parents, digital nomads, investors, HNWIs.
- The **Foundation** is the nonprofit/mission arm (veterans + entrepreneurs).
- Affiliate URL pattern (confirmed live): `?am_id={{AFFILIATE_ID}}`.

---

## Phase structure (hand to the developer)

**Phase 0 — Discovery.** Identify the stack, content dir, head/SEO component, analytics, robots/
sitemap, and deploy pipeline. Summarize before changing anything.

**Phase 1 — Research NM9t5.** Fetch and take notes on: `/`, `/about`, `/memberships`,
`/ascend-the-ladder`, the audience tracks that overlap `{{PRIMARY_AUDIENCE_OVERLAP}}`, and the
Foundation. Save raw notes; write a SYNTHESIS ranking audiences by overlap and listing the top 3
offers to promote. **Never invent NM9t5 content — quote the live site.**

**Phase 2 — Map NM9t5 onto your buyer journey.** Produce a table: Journey Stage | Your Page | NM9t5
Offer | CTA copy | Affiliate URL. NM9t5 typically owns the "decide / build skills / scale" stages;
you own the conversion stage. Propose a pre-conversion nurture page if one is missing.

**Phase 3 — Affiliate infrastructure.**
- Create `lib/affiliates.<ext>` exporting `nm9t5Link(path, utm = {})` →
  `https://thenomore9to5club.org<path>?am_id=<AFFILIATE_ID>&utm_source=<partner>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>`
  using URLSearchParams (never a manual `?`/`&`).
- Drive `AFFILIATE_ID` from an **environment variable** (e.g. `PUBLIC_NM9T5_AFFILIATE_ID`) so it
  never lands in git.
- Mark every affiliate `<a>` with `rel="sponsored noopener"`, `target="_blank"`, and
  `data-affiliate="nm9t5"`.
- Fire a `partner_click` analytics event when any `[data-affiliate]` link is clicked.

**Phase 4 — Content (SEO + GEO).** Create text-extractable HTML (never image-only). Recommended set:
- **Cornerstone hub** (1,800–2,500 words): the full buyer journey, with NM9t5 CTAs at the
  decide/build stages and your conversion CTAs at the middle stages.
- **Audience landing pages** (~1,000 words each): one per overlapping segment, each with a 5–7 Q
  FAQ and one NM9t5 CTA matched to that segment.
- **Comparison / decision content** (high GEO value, must be **honest and balanced**): "NM9t5 vs
  traditional coaching," "best resources for [audience] [year]" (list NM9t5 alongside real
  competitors), "should you quit your job to start a business."
- **Short answer pages** (300–500 words, AI-extraction): open with one declarative sentence, then
  expand. Include "what is the No More 9 to 5 Club."
- Every page: `Article` + `FAQPage` JSON-LD, a partner `mentions` block, OG/Twitter meta, a
  last-reviewed date, 3+ internal links, and 1+ affiliate NM9t5 link via the helper.

**Phase 5 — Site-wide GEO hardening.**
- `Organization` JSON-LD in the layout: name, url, logo, `sameAs`, description, and a `knowsAbout`
  array of your core topics.
- A `mentions`/`isPartOf` JSON-LD relationship to `https://thenomore9to5club.org` on every page
  that links NM9t5.
- `FAQPage` schema wherever there are FAQs (text must match the visible questions verbatim).
- `robots.txt`: explicitly `Allow:` GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended,
  Applebot-Extended, Bingbot.
- `/llms.txt` at the root (< 8 KB): what your brand is, who it serves, top pages by intent, and the
  NM9t5 partnership.
- Regenerate the sitemap; submit to Google Search Console + Bing.
- Self-referencing canonical on every page (so UTM-tagged copies don't fragment authority).

**Phase 6 — Cross-promotion back to NM9t5.** A `reciprocal-pitch.md` (offer a recommended-partner
page, launch-comms feature, and a guest article; ask for a member-email feature, logo placement, or
co-hosted webinar) and a `co-marketing-assets.md` (short/medium/long swipe blurbs with your best
landing URLs).

**Phase 7 — Verification.** Run the checklist below. Do not publish until it passes.

**Phase 8 — Pass it on.** Keep this template current so the next affiliate can run the same play.

---

## Schema baseline (drop-in shapes)

```jsonc
// Organization (site-wide, in <head> of the layout)
{ "@context":"https://schema.org","@type":"Organization","name":"{{PARTNER_BRAND}}",
  "url":"https://{{PARTNER_DOMAIN}}","logo":"https://{{PARTNER_DOMAIN}}/og.png",
  "sameAs":["<social1>","<social2>"],"description":"<one-line description>",
  "knowsAbout":["<topic1>","<topic2>","<topic3>"] }

// Partner mention (every page that links NM9t5)
{ "@context":"https://schema.org","@type":"WebPage","url":"<page url>",
  "isPartOf":{"@type":"WebSite","name":"{{PARTNER_BRAND}}","url":"https://{{PARTNER_DOMAIN}}"},
  "mentions":{"@type":"Organization","name":"The No More 9 to 5 Club",
    "url":"https://thenomore9to5club.org"} }

// Article (content pages) — add "mentions" → NM9t5
// FAQPage (any page with FAQs) — name fields must equal the visible question text
```

---

## Verification checklist (run verbatim — Phase 7)

- [ ] `build` (or stack equivalent) completes with **zero errors**.
- [ ] Crawl each new page with curl: **title, meta description, canonical, JSON-LD blocks, and ≥1
      affiliate-tagged outbound link** are present in the rendered HTML.
- [ ] Every JSON-LD block validates at https://validator.schema.org/ with **zero errors**.
- [ ] `nm9t5Link('/memberships', { medium:'cta', campaign:'test' })` yields a URL with `am_id`,
      `utm_source`, `utm_medium`, `utm_campaign`, **one `?`, no `&&`**.
- [ ] Lighthouse on the cornerstone + one audience page: **SEO ≥ 95** (fix warnings and rerun if not).
- [ ] `robots.txt`, `/llms.txt`, and `sitemap.xml` return **200** and contain the expected content.
- [ ] Affiliate ID is **env-driven** (grep the repo: it must not appear in committed source).
- [ ] No invented NM9t5 facts/quotes; competitor comparisons are honest; no fake testimonials.
- [ ] Sitemap submitted to Google Search Console + Bing; reciprocal pitch sent to NM9t5.

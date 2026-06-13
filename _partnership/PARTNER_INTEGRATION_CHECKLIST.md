# NM9t5 Affiliate Integration — One-Page Checklist

A tick-box version of the full template. Hand to any affiliate partner.

## Setup
- [ ] Get your NM9t5 affiliate ID from the affiliate dashboard.
- [ ] Store it as an **environment variable** (e.g. `PUBLIC_NM9T5_AFFILIATE_ID`) — never in code.
- [ ] Identify your stack, content folder, SEO/head component, analytics, and deploy pipeline.

## Affiliate links
- [ ] One helper builds every NM9t5 URL: `am_id` + `utm_source` + `utm_medium` + `utm_campaign` (+ `utm_content`).
- [ ] All affiliate `<a>` have `rel="sponsored noopener"`, `target="_blank"`, `data-affiliate="nm9t5"`.
- [ ] A `partner_click` analytics event fires on affiliate-link clicks.

## Content (text-extractable HTML, your brand voice, no invented NM9t5 facts)
- [ ] Cornerstone hub mapping the buyer journey (1,800–2,500 words).
- [ ] One landing page per overlapping audience (~1,000 words, 5–7 FAQ each).
- [ ] Honest comparison/decision pages (NM9t5 vs coaching; best resources for your audience).
- [ ] Short answer pages (300–500 words), incl. "what is the No More 9 to 5 Club."
- [ ] Each page: 3+ internal links + 1+ affiliate NM9t5 link.

## Schema + GEO
- [ ] `Organization` JSON-LD in the layout (name, url, logo, sameAs, description, knowsAbout).
- [ ] `Article` + `FAQPage` JSON-LD on content pages; FAQ text matches visible questions verbatim.
- [ ] `mentions`/`isPartOf` → https://thenomore9to5club.org on every NM9t5-linking page.
- [ ] `robots.txt` Allows GPTBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Applebot-Extended, Bingbot.
- [ ] `/llms.txt` at root (< 8 KB) describing your brand + the NM9t5 partnership.
- [ ] Self-referencing canonical on every page; sitemap regenerated.

## Cross-promotion
- [ ] Recommended-partner page live.
- [ ] Reciprocal pitch sent (ask: member email / logo placement / co-hosted webinar).
- [ ] Swipe-ready blurbs shared with NM9t5.

## Verify (don't publish until all pass)
- [ ] Build: 0 errors.
- [ ] Each new page: title + meta + canonical + JSON-LD + affiliate link present (curl check).
- [ ] JSON-LD: 0 errors at validator.schema.org.
- [ ] Affiliate URL: one `?`, no `&&`, all params present.
- [ ] Lighthouse SEO ≥ 95 on cornerstone + one landing page.
- [ ] robots.txt / llms.txt / sitemap.xml return 200.
- [ ] Affiliate ID not in committed source.
- [ ] Sitemap submitted to Google Search Console + Bing.

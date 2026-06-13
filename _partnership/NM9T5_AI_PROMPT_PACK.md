# NM9t5 Affiliate — AI Prompt Pack

Copy-paste prompts that make an AI assistant (ChatGPT, Claude, Gemini, etc.) do the affiliate work
for you. Use them with the **NM9T5 Affiliate Growth Framework**. Fill in every `[BRACKET]` first.

**How to use:** paste a prompt into your AI, replace the brackets, and send. Start with Prompt 1
(it sets up everything the others reuse). Always paste **your own** campaign links from your
dashboard — the AI cannot get them for you.

---

## ⚠️ Guardrails — paste this at the top of EVERY prompt

```
RULES (follow exactly):
- Use ONLY the affiliate links I provide. Each NM9t5 campaign has its own unique link + am_id —
  never swap one campaign's code onto another offer, and never invent a link.
- Add an FTC affiliate disclosure to anything public ("affiliate link — I may earn a commission").
  For website links, note rel="sponsored".
- Do NOT invent facts, quotes, prices, or features about the No More 9 to 5 Club or its founder.
  If you're unsure of a detail, say "[verify on thenomore9to5club.org]" instead of guessing.
- In any comparison, be honest and balanced — state real strengths of alternatives.
- Match my brand voice: [describe your tone, e.g. warm, practical, no hype].
```

---

## Prompt 1 — Build my link sheet + audience map

```
[paste Guardrails]

Here are my No More 9 to 5 Club affiliate campaign links (copied from my dashboard):
[paste each as: Campaign name — commission% — full link]

My audience is: [who follows you / who you can reach, e.g. veterans, new parents, career changers].

Do three things:
1. Organize my links into a clean table: Campaign | Commission | Best-fit audience | My link.
2. Rank them by which I should promote FIRST, weighing commission % AND fit to my audience.
3. Give me a simple "if someone is [X], send them to [campaign]" routing cheat-sheet.
```

---

## Prompt 2 — Write my swipe copy (social / email / DMs) — Manual track

```
[paste Guardrails]

Using these links: [paste the 2-3 links you want to promote, with campaign names].
My audience: [audience]. My platform(s): [e.g. Instagram, email list, LinkedIn].

Write, for EACH link:
- 3 short social captions (≤280 chars) with a hook, value, disclosure, and the link.
- 1 medium newsletter blurb (~120 words).
- 1 longer post / DM script (~250 words) that tells a relatable story and ends with the link.
Keep it honest and specific to my audience. No hype, no invented claims.
```

---

## Prompt 3 — Plan my SEO/GEO content cluster — Website track

```
[paste Guardrails]

I have a website at [your URL] about [your niche]. My audience: [audience].
My NM9t5 links: [paste them with campaign names + commission%].

Design a content cluster modeled on a proven one (cornerstone + audience pages + honest
comparison pages + short answer pages). For each proposed page give me:
- The URL slug, the target search query, and the single-sentence "answer-first" opening.
- An H2 outline.
- Which ONE NM9t5 campaign link to feature and where (and any plain free-resource link).
- 3 internal links to my other pages.
- 5 FAQ questions for FAQ schema.
Prioritize a few excellent pages over many thin ones. Flag which pages are best for getting cited
by AI assistants (usually the honest comparison + answer pages).
```

---

## Prompt 4 — Draft one page in full — Website track

```
[paste Guardrails]

Write the full page for: [slug + target query from Prompt 3].
~[1000–2000] words. Requirements:
- Open with a direct 40–60-word answer to the query.
- Clear H2/H3 structure; specific, useful, honest content (no filler).
- Feature this NM9t5 link once or twice as a clear call-to-action: [link + campaign].
- Add an FAQ section of 5 questions with concise answers (these will become FAQ schema —
  the visible question text must match the schema exactly).
- Include 3 internal links to: [list your other pages].
- Add a one-line affiliate disclosure.
Output clean HTML (text-extractable, not images), plus the FAQPage + Article JSON-LD blocks
(add a "mentions" of the No More 9 to 5 Club, url https://thenomore9to5club.org).
```

---

## Prompt 5 — Build the whole website integration (hand to an AI coding agent) — Advanced

```
[paste Guardrails]

You are integrating the No More 9 to 5 Club affiliate program into my website.
My stack: [e.g. WordPress / Next.js / Astro / plain HTML]. Repo/site root: [path or "describe"].
My campaign links (verbatim, each with its own am_id): [paste all].

Follow the spec in NM9T5_PARTNER_INTEGRATION_TEMPLATE.md (I will paste it next / it's attached):
- Build a campaign-link registry so links are only ever built from my real per-campaign links
  (never a single shared id); add UTM params; mark anchors rel="sponsored" + a partner_click event.
- Build the content cluster (cornerstone, audience pages, honest comparisons, answer pages) with
  Article + FAQPage + partner "mentions" JSON-LD, canonical, sitemap, and an llms.txt.
- Allow AI crawlers in robots.txt.
Then run the verification checklist (PARTNER_INTEGRATION_CHECKLIST.md) and report results. Do not
invent NM9t5 facts; do not hardcode anything but my own public campaign links.
```

*(For Prompt 5, also give the agent the two technical files in this folder. A capable coding agent
can then build and verify the same integration we built for Good Circles.)*

---

## Tips for working with the AI
- Give it **real specifics** (your actual audience, niche, links) — vague inputs = generic output.
- Ask it to **revise**: "make caption 2 punchier," "this comparison feels biased — add a real
  strength of the competitor."
- **You are the fact-checker.** Before publishing, confirm any NM9t5 detail against the live site,
  and click each link to confirm it carries *your* am_id.

*Prepared 2026-06-13. Pair with NM9T5_AFFILIATE_GROWTH_FRAMEWORK.md.*

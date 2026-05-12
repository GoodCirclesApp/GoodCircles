# /role-landing-page — Landing page copy for a specific role

Drafts full landing page copy for one of the five Good Circles audience roles — hero, value props, mechanism explanation, social proof block, and CTA.

## Inputs
Required: `<role>` — one of: NEIGHBOR, MERCHANT, NONPROFIT, CDFI, MUNICIPAL
Optional: `--variant <A|B>` for A/B test variants

## Process
1. Read CLAUDE.md — pull role brief for the specified role, brand voice rules, key stats, launch context.
2. Draft full page copy in sections:
   - **Hero:** headline (bold, 6–10 words max), subheadline (one sentence — what they get), CTA button copy
   - **The problem:** 2–3 sentences naming the specific pain this role faces — with numbers
   - **How it works:** 3-step mechanism explanation — plain language, no jargon
   - **The numbers:** key stat block — 2–3 quantified benefits
   - **Social proof placeholder:** structure for testimonial/partner logos when available
   - **FAQ:** 3–4 role-specific questions with answers
   - **Final CTA:** closing statement + button
3. Apply brand voice check per Section 3 of CLAUDE.md.

## Output spec
- Format: Sectioned markdown with copy blocks clearly labeled
- Length: 600–900 words of page copy
- Brand voice: Strict — peer tone, specific numbers, no platitudes, no guilt-language
- CTA: goodcircles.org
- Save to: `.claude/content/landing-page-<role>-<date>.md`

## Sources
marketing plugin for drafting. Stats from Section 4 of CLAUDE.md only — no unverified claims.

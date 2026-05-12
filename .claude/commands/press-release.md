# /press-release — Launch-ready press release for a specific topic

Drafts a standard press release format suitable for wire distribution or direct journalist outreach.

## Inputs
Required: `<topic>` — the news event (e.g., "Mississippi launch announcement," "Founding Circle opening," "CDFI partnership program launch")
Optional: `--quote <speaker>` — name and title for the founder quote block
Optional: `--date <YYYY-MM-DD>` — embargo date or release date

## Process
1. Read CLAUDE.md — pull brand voice, key stats (verified only), launch context.
2. Draft press release:
   - **Headline:** ≤12 words, active voice, news-forward — no marketing superlatives
   - **Subheadline:** one sentence expanding the headline
   - **Dateline:** [JACKSON, MS — DATE]
   - **Lede paragraph:** who, what, when, where, why — all in the first sentence
   - **Body paragraph 1:** the mechanism — what Good Circles actually does, in plain language
   - **Body paragraph 2:** the Mississippi context — why here, why now (use ILSR stats, Mississippi generosity stat, launch date)
   - **Founder quote:** attributed, human-sounding, not corporate — peer tone
   - **Boilerplate:** 2-sentence "About Good Circles" block
   - **Contact info:** goodcircles.org + support@goodcircles.org
3. Run brand voice check — no platitudes, no corporate-speak, specific numbers only.
4. Verify: are all stats in the release verified (no ⚠️ flags in CLAUDE.md Section 4)?

## Output spec
- Format: Standard press release format, AP style
- Length: 400–500 words
- Brand voice: Credible, specific, human — not a startup announcement
- CTA: goodcircles.org
- Save to: `.claude/content/press-release-<topic-slug>-<date>.md`

## Example
`/press-release "Mississippi founding circle launch" --quote "Tim, Founder"`
`/press-release "CDFI partnership program" --date 2026-09-01`

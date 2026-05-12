# /press-pitch — Single tailored press pitch for a specific publication

Drafts one press pitch, researched and tailored to a specific outlet and its audience. Ready to send.

## Inputs
Required: `<publication>` — name of the outlet (e.g., "Mississippi Today," "Next City," "Chronicle of Philanthropy")
Optional: `--angle <angle>` — specific story angle (e.g., "launch story," "CDFI integration," "economic extraction")
Optional: `--journalist <name>` — specific journalist to target

## Process
1. Read CLAUDE.md — pull brand voice, key stats, launch context.
2. WebSearch: research the publication — beat, audience, recent stories, editorial tone.
3. If journalist specified: WebFetch their recent bylines to understand their specific angle.
4. Identify: the one story angle from Good Circles that fits this outlet's beat exactly.
5. Draft pitch:
   - Subject line: ≤10 words, no fluff — the news hook
   - Opening: the lede — one sentence, the specific news
   - Paragraph 1: what Good Circles is — one paragraph, plain language
   - Paragraph 2: why this matters to THIS outlet's readers specifically
   - Paragraph 3: the offer — exclusive data? founder call? product demo?
   - Fact sheet (3 bullet stats from CLAUDE.md Section 4 — verified only, no ⚠️ stats)
   - CTA: goodcircles.org + contact info
6. Run brand voice check.

## Output spec
- Format: Email-ready pitch (subject + body)
- Length: 200–300 words
- Brand voice: Credible, specific, peer — not a PR blast
- CTA: goodcircles.org
- Save to: `.claude/content/pitch-<publication>-<date>.md`

## Example
`/press-pitch "Mississippi Today" --angle "launch story"`
`/press-pitch "Next City" --journalist "Oscar Perry Abello"`

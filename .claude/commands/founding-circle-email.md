# /founding-circle-email — Nurture email for a specific role

Drafts a single nurture email targeting one of the five Good Circles founding circle roles. Ready to send or schedule via email platform.

## Inputs
Required: `<role>` — one of: NEIGHBOR, MERCHANT, NONPROFIT, CDFI, MUNICIPAL
Optional: `--topic <topic>` — specific angle for this email (e.g., "launch date announcement," "how the 10% works," "you're now #347 in line")
Optional: `--position <n>` — if addressing a specific waitlist position milestone

## Process
1. Read CLAUDE.md — pull role brief for the specified role, brand voice rules, launch context, key stats.
2. Draft email:
   - Subject: short (≤8 words), no emoji, no clickbait — punchy and specific
   - Opening: a specific number or fact relevant to this role — not a generic greeting
   - Body: 2–3 short paragraphs — advance the story from "you signed up" toward "here's what's coming and why it matters"
   - Action: one specific, concrete thing they can do today (share, refer, prepare)
   - Close: CTA → goodcircles.org
3. Run brand voice check: no guilt-language, no "make a difference," peer tone, plain words.

## Output spec
- Format: Subject line + full email body
- Length: 150–250 words
- Brand voice: Strict — peer, specific, no platitudes
- CTA: goodcircles.org
- Save to: `.claude/content/email-<role>-<date>.md`

## Example
`/founding-circle-email MERCHANT --topic "how the 89% works"`
`/founding-circle-email NONPROFIT --position 47`

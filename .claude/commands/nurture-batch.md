# /nurture-batch — Weekly founding-circle nurture email batch

Produces one nurture email per active waitlist role for the current week. Segmented by role, in brand voice, designed to deepen commitment and drive referrals.

## Inputs
Required: `--week <MM-DD>` (week of send)
Optional: `--role <NEIGHBOR|MERCHANT|NONPROFIT|CDFI|MUNICIPAL>` to produce only one role's email

## Process
1. Read CLAUDE.md — pull role briefs, brand voice rules, launch context.
2. For each role (or specified role): draft a nurture email.
3. Each email must: (a) open with a specific, real number or fact — never generic, (b) advance the narrative from the signup moment, (c) include one concrete action the reader can take today, (d) close with goodcircles.org CTA.
4. Subject lines: short, punchy, no emoji, no clickbait.
5. Run brand voice check per Section 3 of CLAUDE.md.

## Output spec
- Format: One email per role, full subject line + body
- Length: 150–250 words per email (short — these go to busy people)
- Brand voice: Strict — peer tone, specific numbers, no guilt-language
- CTA: goodcircles.org
- Save to: `.claude/content/nurture-<week-date>-<role>.md` (one file per role)

## Sources
marketing plugin for drafting. Pull stats from Section 4 of CLAUDE.md.

## Note
These are not broadcast blasts — they are 1:1-feeling emails from a person, not a platform. Write them accordingly.

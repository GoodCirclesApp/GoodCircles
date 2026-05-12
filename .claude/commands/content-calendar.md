# /content-calendar — Weekly social content calendar

Produces next week's complete social post schedule across TikTok, Instagram Reels, YouTube Shorts, LinkedIn, and Facebook — in brand voice, role-targeted, campaign-aware.

## Inputs
Required: `--week <MM-DD>` (Monday of the target week)
Optional: `--focus <role>` to weight content toward one of the 5 audiences
Optional: `--campaign <name>` to tie to an active campaign (e.g., "founding-circle-launch")

## Process
1. Read CLAUDE.md — pull brand voice rules, 5 role briefs, launch context, active priorities.
2. Check posting cadence (from launch timeline: Week 5=Neighbor, Week 4=Business, etc.) — align week's content.
3. Draft 5–7 posts for the week, each targeting a specific role and platform combination.
4. For each post: write caption, specify visual direction, specify hashtags (3–5 max), specify CTA.
5. Apply brand voice check: no guilt-language, no platitudes, specific numbers, peer tone.
6. Output as a day-by-day schedule table.

## Output spec
- Format: Markdown table + full post copy below the table
- Length: Full week (5–7 posts), each post fully written out
- Brand voice: Strict — run against Section 3 of CLAUDE.md before outputting
- CTA: Always goodcircles.org
- Save to: `.claude/content/calendar-<week-date>.md` (create file)
- Platform notes: No LinkedIn for Neighbor content. Hashtags in first comment for Instagram, in caption for TikTok.

## Sources
marketing plugin for drafting, postiz plugin for scheduling output format.

# /performance-report — Monthly marketing performance report

Produces a full-month marketing performance review across all active channels and the waitlist, with trend analysis and next-month priority recommendations.

## Inputs
Required: `--month <YYYY-MM>`

## Process
1. Read CLAUDE.md — pull active priorities, launch context, recent decisions.
2. Pull waitlist data: total, by role, month-over-month growth.
3. Pull social metrics (postiz or user-provided CSV): reach, engagement rate, follower growth by platform.
4. Pull press/media: any earned mentions that month (from /press-scan logs).
5. Pull founding-partner pipeline: CDFIs and municipalities by stage.
6. Synthesize: what moved this month? What didn't? What drove growth?
7. Produce next-month priority recommendations (max 3 — prioritize ruthlessly).

## Output spec
- Format: Structured report — sections with headers
- Length: 600–900 words
- Brand voice: Not required — internal ops
- Sections: Waitlist · Social · Press · Founding-Partner Pipeline · Assessment · Next Month Top 3
- Save to: `.claude/reports/performance-<YYYY-MM>.md`

## Sources
postiz plugin (social data), marketing plugin (synthesis), data plugin (DB stats if available).

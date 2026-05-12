# /social-pulse — Daily social engagement snapshot

Reviews yesterday's social post performance, surfaces top-performing content, and flags replies or comments needing response.

## Inputs
None required. Optional: `--platform <tiktok|instagram|youtube|linkedin|facebook>` to narrow.

## Process
1. Read CLAUDE.md for content calendar context and active campaign.
2. Pull engagement data from postiz plugin (if connected) or request user to paste metrics.
3. Identify: highest-engagement post yesterday. Why did it perform? Extract the structural lesson.
4. Identify: any comment/reply mentioning goodcircles.org, "founding circle," or a CTA click — these need a human response.
5. Flag: any post underperforming vs baseline (defined as <50% of average reach for that platform).

## Output spec
- Format: Bullet list
- Length: <20 lines
- Sections: Top performer · Underperformer · Replies needing response · Lesson to apply today
- Brand voice: Not required — internal ops
- Save to: None (chat output only)

## Sources
postiz plugin (scheduling/analytics), platform native analytics if user provides CSV export.

# /founding-partner-pipeline — Weekly CDFI and municipal outreach pipeline review

Reviews the current founding-partner pipeline for CDFIs and municipalities, surfaces stale contacts, drafts next outreach actions, and produces a weekly priority list.

## Inputs
None required. Optional: `--add <org-name> <type> <contact>` to add a new prospect to the pipeline.

## Process
1. Read CLAUDE.md — pull CDFI and Municipality role briefs, active priorities, recent decisions.
2. Read pipeline file at `.claude/data/founding-partner-pipeline.md` (create if not exists).
3. For each prospect: assess stage (Cold / Contacted / Responded / Briefing Scheduled / Partner).
4. Flag: any prospect contacted >7 days ago with no response — surface for follow-up.
5. Flag: any prospect at Briefing Scheduled stage — confirm prep needed.
6. Draft next-action for top 3 prospects: either a follow-up email draft or a briefing prep note.
7. Update pipeline file with today's date.

## Output spec
- Format: Pipeline table + next-action drafts for top 3
- Length: Table (all prospects) + ~100 words per next-action draft
- Brand voice: Professional, civic, data-forward (CDFI tone) or civic/trustworthy (municipal tone)
- CTA: goodcircles.org/partner or direct contact response
- Save to: Update `.claude/data/founding-partner-pipeline.md`

## Sources
marketing plugin for outreach copy. Use /cdfi-brief or /municipality-brief to generate full briefing packages for warm prospects.

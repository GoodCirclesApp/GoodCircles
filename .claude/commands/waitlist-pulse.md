# /waitlist-pulse — Daily waitlist health snapshot

Produces a quick-read pulse on waitlist growth, source breakdown, role distribution, and drop-off signals.

## Inputs
None required. Optional: `--date <YYYY-MM-DD>` to pull a specific day (default: today).

## Process
1. Read CLAUDE.md for launch context and active priorities.
2. Query `GET /api/waitlist/admin/stats` (or pull from DB via Prisma if no endpoint exists).
3. Sub-agent: parse role breakdown (NEIGHBOR, MERCHANT, NONPROFIT, CDFI, MUNICIPAL).
4. Flag: any role with <10% of total is underperforming — surface it.
5. Flag: any spike or drop >20% day-over-day.
6. Surface top referral/signup source if available in DB.

## Output spec
- Format: Bullet list, plain text
- Length: <20 lines
- Sections: Total signups · By role · Day-over-day change · Flags · Recommended action
- Brand voice: Not required — this is internal ops data
- Save to: None (chat output only unless flagged)

## Example output shape
```
WAITLIST PULSE — 2026-05-11
Total: 847 signups
  NEIGHBOR    412 (49%)
  MERCHANT    201 (24%)
  NONPROFIT    98 (12%)
  CDFI         47 (6%)
  MUNICIPAL    89 (11%)

Day-over-day: +34 (+4.2%) — MERCHANT up 18%, CDFI flat
⚠️ CDFI has been flat 5 days — pipeline may need a push
Recommended: Run /founding-partner-pipeline to review CDFI outreach queue
```

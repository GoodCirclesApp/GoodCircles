# /press-pitch-batch — Monthly batch of 5 targeted press pitches

Produces 5 press pitches per month, each tailored to a specific outlet and journalist beat, in brand voice, with a clear news hook.

## Inputs
Optional: `--focus <topic>` to theme the batch (e.g., "launch," "CDFI," "nonprofit economy")
Optional: `--outlets <list>` to specify target publications

## Process
1. Read CLAUDE.md — pull brand voice, key stats, launch context, 5 role briefs.
2. WebSearch: identify 5 relevant outlets — mix of (a) Mississippi-local press, (b) economic development trade press, (c) nonprofit sector press, (d) national tech/startup press, (e) community finance press.
3. For each outlet: identify the specific beat/angle most relevant to Good Circles.
4. Draft pitch: subject line (short, no fluff), lede (the news hook in one sentence), body (2–3 paragraphs — what it is, why it matters now, why your readers specifically), offer (exclusive? data? founder quote?), CTA (email or goodcircles.org).
5. Attach a "fact sheet" block at the bottom of each pitch (key stats from CLAUDE.md Section 4).

## Output spec
- Format: 5 complete pitches, each fully written
- Length: 200–300 words per pitch
- Brand voice: Strict — peer tone, specific numbers, no platitudes
- CTA: goodcircles.org
- Save to: `.claude/content/press-pitches-<YYYY-MM>.md`

## Sources
WebSearch (outlet research), WebFetch (journalist bio verification), marketing plugin (drafting).

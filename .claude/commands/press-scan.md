# /press-scan — Daily press and competitor monitoring

Scans for Mississippi-focused press coverage, mentions of Good Circles, and competitor activity. Flags anything worth acting on.

## Inputs
None required. Optional: `--depth deep` to expand to national community-economy press.

## Process
1. Read CLAUDE.md for launch context and competitive landscape.
2. WebSearch: "Good Circles Mississippi marketplace" — flag any new mentions.
3. WebSearch: "Mississippi local economy 2026" + "Mississippi small business news" — scan for story angles.
4. WebSearch: "community marketplace" OR "local commerce platform" — scan for competitor moves.
5. WebSearch: "Mississippi economic development news" — flag CDFI/municipal angles.
6. Sub-agent: compile into structured digest.

## Output spec
- Format: Three sections — (1) GoodCircles mentions, (2) Story opportunities, (3) Competitor flags
- Length: <30 lines
- Brand voice: Not required — internal ops digest
- Save to: None (chat output only unless a story opportunity is flagged as HIGH)
- If HIGH story opportunity: auto-draft a pitch outline and note to run /press-pitch <outlet>

## Sources
WebSearch + WebFetch (verify headlines before citing). Use brightdata-plugin for deeper scraping if needed.

# /competitor-deep-dive — Quarterly competitive landscape analysis

Deep analysis of emerging community-marketplace and local-commerce platforms. Identifies positioning gaps, threat signals, and differentiation opportunities for Good Circles.

## Inputs
None required. Optional: `--competitor <name>` to deep-dive one specific player.

## Process
1. Read CLAUDE.md — pull product summary, brand voice, 5 role briefs.
2. WebSearch: "community marketplace platform 2026" + "local commerce app" + "buy local platform" + "community economic model."
3. brightdata-plugin: scrape competitor landing pages, pricing pages, and "about" pages.
4. For each major player: document (a) model, (b) fee structure, (c) target audience, (d) geography, (e) what they do that Good Circles doesn't, (f) what Good Circles does that they don't.
5. Identify: any player entering Mississippi or the South?
6. Synthesize: top 3 differentiation points to emphasize in Good Circles marketing.

## Output spec
- Format: Competitive matrix table + narrative summary
- Length: 800–1,200 words
- Save to: `.claude/reports/competitor-<YYYY-QN>.md`

## Sources
brightdata-plugin (scraping), WebSearch/WebFetch (research), marketing plugin (synthesis).

# /seo-health-check — Monthly SEO audit for goodcircles.org

Full SEO health check on goodcircles.org and any published content pages. Surfaces technical issues, keyword gaps, and AI-search visibility opportunities.

## Inputs
None required. Optional: `--page <url>` to audit a specific page only.

## Process
1. Read CLAUDE.md — pull key stats, role terminology, brand voice.
2. searchfit-seo plugin: run technical SEO audit on goodcircles.org.
3. WebFetch: check current page titles, meta descriptions, H1s on goodcircles.org.
4. Check: are the 5 audience terms (neighbor, local business, nonprofit, municipality, CDFI) in page copy and metadata?
5. Check: does goodcircles.org appear in AI search answers for "community marketplace Mississippi"?
6. Check: schema markup present for organization, FAQ, local business types?
7. Produce prioritized fix list — P1 (blocking), P2 (high value), P3 (nice to have).

## Output spec
- Format: Prioritized fix list with explanations
- Length: 400–600 words
- Save to: `.claude/reports/seo-<YYYY-MM>.md`

## Sources
searchfit-seo plugin (primary), WebFetch (page inspection), WebSearch (SERP check).

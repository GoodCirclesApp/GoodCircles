# /municipality-brief — Founding partnership briefing package for a prospective municipal partner

Produces a briefing document for a city or county economic development office exploring a founding partnership. Civic, data-focused, zero infrastructure ask.

## Inputs
Optional: `--city <city-name>` — name of the city/county for personalization
Optional: `--contact <title>` — contact's title (e.g., "Economic Development Director")
Optional: `--focus <small_biz_support|eda|cdbg|general>` — their primary interest area

## Process
1. Read CLAUDE.md — pull Municipality role brief, key stats (verified only), brand voice (civic/trustworthy register).
2. Draft briefing package in sections:
   - **The economic extraction problem** — local vs chain spend multipliers, Mississippi-specific context (use verified ILSR stats, flag $8.6B as estimated if included)
   - **What Good Circles provides to a municipality** — live spend-retention data, neighborhood-level data, no infrastructure
   - **The dashboard** — what they'd actually see and how often it updates
   - **CDBG and EDA relevance** — how this data supports federal reporting requirements (if applicable to their focus area)
   - **Founding Partner terms** — what founding status means (data access, community visibility, founding partner designation — not a financial commitment)
   - **The ask** — one clear next step: 30-min briefing call
   - **Fact sheet** — 3–5 verified stats from CLAUDE.md Section 4
3. Keep it under 2 pages equivalent. City officials skim.

## Output spec
- Format: Structured document, email-sendable or one-page PDF ready
- Length: 400–600 words
- Brand voice: Civic, trustworthy, professional — no startup hype
- CTA: goodcircles.org
- Save to: `.claude/content/municipality-brief-<city>-<date>.md`

## Sources
CLAUDE.md (role brief + stats). Do NOT include ⚠️-flagged stats without verifying first.

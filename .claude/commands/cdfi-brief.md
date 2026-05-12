# /cdfi-brief — Founding partnership briefing package for a prospective CDFI

Produces a complete briefing document for a Treasury-certified CDFI exploring a founding partnership with Good Circles. Data-forward, TLR-aware, no fluff.

## Inputs
Optional: `--org <org-name>` — name of the CDFI for personalization
Optional: `--region <region>` — their lending region for geographic context
Optional: `--cert <number>` — CDFI cert number (if known)

## Process
1. Read CLAUDE.md — pull CDFI role brief, key stats (verified only), brand voice (professional/civic/data-forward register).
2. Draft briefing package in sections:
   - **What Good Circles is** — 1 paragraph, plain language, no jargon
   - **What it means for a CDFI** — live QIA merchant data, TLR-readiness, pre-engaged relationships
   - **The data layer** — what data they'd see: revenue, margin, transaction volume, LMI census tract flag
   - **TLR integration** — how merchant snapshots map to Transaction Level Report format
   - **Founding Partner terms** — what founding status means, what it doesn't (not a financial commitment — a briefing and positioning decision)
   - **The ask** — one clear next step: schedule a 30-min briefing call
   - **Fact sheet** — 3–5 verified stats from CLAUDE.md Section 4
3. Format for email delivery (can be sent as the body of a cold outreach or as an attachment summary).

## Output spec
- Format: Structured document, email-sendable
- Length: 400–600 words
- Brand voice: Professional, data-forward, civic — no guilt-language, no nonprofit framing
- CTA: goodcircles.org
- Save to: `.claude/content/cdfi-brief-<org>-<date>.md`

## Sources
CLAUDE.md (role brief + stats). Do NOT use ⚠️-flagged stats in this document — CDFIs are sophisticated and will check.

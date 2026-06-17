# Good Circles Resource Hub — Roadmap from 9/10 to 10/10 (staff & dev work specs)

**Purpose.** The resource hub is currently a defensible **9/10**. This roadmap is the path to a genuine **10/10, best-in-class** resource. Each of the 12 sections below is a complete, dev-ready **work specification**: a marketing or research staff member can execute the "human work" steps, then hand the "developer handoff package" straight to development. Every spec is written to satisfy the hub's existing build gates (`check-seo.mjs` + `check-citations.mjs`) so nothing breaks the strict-quality pipeline.

**How to use this document.** Pick an item, assign the **primary owner**, do the human work in order, and submit the handoff package to development. Items are independent unless a "Dependencies" line says otherwise. Prefer the free/low-cost path every spec calls out.

**Already handled by Claude (not in this list):**
- *Explainer videos* — 17 walkthrough scripts are drafted in `VIDEO_SCRIPTS.md`; the owner records them locally (kept local, not published).
- *Live funder-data partnership* — see §11: there is a **$0, ship-now Phase 1** (ProPublica + IRS public data) that does not need any partnership; paid partnerships are a funded-phase option with one-page briefs.

**Recommended sequencing (Claude's synthesis — each spec also carries its own priority):**

| # | Improvement | Primary owner | Effort | Recommended wave |
|---|-------------|---------------|--------|------------------|
| 9 | Feedback & measurement loop ("was this helpful?", analytics) | Dev + ops | S | **Wave 1 — quick wins (free, days)** |
| 10 | GEO / AI-citation optimization (HowTo/Dataset schema, llms.txt) | Dev/SEO | S–M | **Wave 1** |
| 12 | "Ask the Hub" moderated Q&A → living Answers library | Content + dev | M | **Wave 1** |
| 8 | Curated toolkits + Google-Docs copies + per-guide PDF | Content + dev | M | **Wave 1** |
| 7 | Accessibility audit + plain-language pass (hub passes its own WCAG tool) | Dev + QA | M | **Wave 1** |
| 4 | On-site search + interlinked glossary | Dev + content | M | **Wave 2 — high-impact (weeks)** |
| 3 | "Start Here" diagnostic / personalized pathways | Dev + content | M | **Wave 2** |
| 2 | Expert review program + E-E-A-T bylines + inline citations | Research + content | M–L | **Wave 2** |
| 5 | Free email mini-courses (drip) | Content + email infra | M | **Wave 2** |
| 1 | State-by-state legal localization (Mississippi-first) | Research + content | L | **Wave 2/3 — flagship differentiator** |
| 6 | Deeper / broader localization (tools, templates, more languages) | Research + content | L | **Wave 3** |
| 11 | Live data partnerships (free Phase 1 now; paid later) | BizDev + dev | L | **Phase 1 now / paid = funded phase** |

**Biggest single differentiators** (what most moves the needle toward 10): **§1 state-specific localization** (no free competitor offers it), **§2 expert review + inline citations** (the credibility/E-E-A-T gap), and **§12 the living Answers library** (turns a static library into a service). The Wave-1 items are nearly free and should ship first to compound SEO and quality immediately.

**Cross-cutting rules every spec already bakes in:** keep the static-site + strict-gate architecture; no login and no unnecessary PII (money-transmitter-avoidance posture); only `@goodcircles.org` aliases (never the personal Family First gmail); the Good Circles accuracy contract on any GC mention (10% of merchant net profit; ~10% shopper savings as an estimate; merchants keep 89% on a 1% fee; free for nonprofits; ~$72/active supporter/yr estimate; September 2026 launch).


---

## 1. State-by-State Legal Localization (Mississippi-First "Operating Playbook" Modules)

**Why it moves 9 -> 10:** Today the hub teaches *what* a nonprofit must do nationally, but a founder in Jackson still has to leave the site and stitch together the Mississippi Secretary of State, the Securities & Charities Enforcement Division, and the Department of Revenue themselves — exactly the gap that keeps under-resourced local nonprofits out of compliance. The National Council of Nonprofits and Nolo only publish *generic* 50-state overviews; the truly state-specific, step-by-step content (Harbor Compliance, Labyrinth, Foundation Group) is commercial lead-gen, often paywalled, and rarely carries a verified-on date. A free, plain-language, dated, schema-marked **Mississippi operating playbook** — with a data model built to scale to all 50 states — is something none of the benchmarks (Candid, NCN, Bloomerang, NonprofitReady, Nolo, Propel) offer for free, and it is the most defensible "local-first" differentiator the hub can ship. It also reinforces Good Circles' Mississippi-first launch narrative with real public utility.

**Primary owner (human labor):** research · **Also needs:** content writer, development, QA (legal review for disclaimer language only)
**Effort:** L (1–2 mo for the MS pillar + data model; each added state is then S–M) · **Priority:** P1 · **Dependencies:** none technical; reuses the existing data-driven guide template, "Sources & tools" block, citation gate, and hreflang pattern.

### Definition of done
A new **`/resources/states/mississippi/`** hub exists with one index page and five state-module guides (incorporation, charitable-solicitation registration, annual report, state tax exemption, employment basics), each rendered from a **single typed `StateModule` data record** so a sixth field-identical record produces a new state with zero template work. Every module passes the existing `check-seo.mjs` and `check-citations.mjs` gates unmodified, carries a dated "Sources & tools" block citing the *primary* state authority (sos.ms.gov, dor.ms.gov, mdes.ms.gov, the Mississippi Code), and links bidirectionally to the relevant national guide. A "States" entry appears in the resources IA, and a one-page **`STATE-PLAYBOOK.md` contributor template** documents how to add the next state. A Spanish (`es`) localization of the Mississippi index + the incorporation module ships using the existing hreflang pattern.

### The human work (step-by-step for a marketing/research staff member)

1. **Build the source-of-truth dossier (research, ~4–5 days).** For Mississippi only, pull the *primary* source for each of the five modules and record the exact URL, fee, form name/number, agency, deadline, and a verified-on date in a spreadsheet (one row per fact). Use these authorities, not aggregators:
   - **Incorporation:** Mississippi Secretary of State, Business Services — `sos.ms.gov/business-services`. Confirm: nonprofits file the **same Articles of Incorporation form as for-profit corporations**, **$50** filing fee, online filing. Note the post-incorporation duties listed (organizational meeting within two years, EIN, State Tax Commission/DOR registration).
   - **Charitable-solicitation registration:** SOS **Securities & Charities Enforcement Division** (`sos.ms.gov`, "Charities"); statute **Miss. Code §§ 79-11-501 to 79-11-529**. Confirm: **$50** registration fee (+ ~**$3.14** online portal fee on renewal), renewal due the **15th day of the 5th month after fiscal year-end** (May 15 for calendar-year orgs), and the **§79-11-505 exemption** (orgs receiving **< $25,000** in a 12-month period ending June 30 *and* using only **unpaid fundraisers**, plus churches, accredited schools, and libraries) — but note exempt orgs must still file a **one-time Notice of Exemption**. Capture the up-to-$25,000-per-violation penalty for soliciting unregistered.
   - **Annual report:** SOS Business Services — the **new requirement (HB 1344)**: all registered nonprofit corporations file an annual report, window **Jan 1 – May 15**, **no fee**, online; non-filing risks administrative dissolution. *Flag clearly that this is separate from the charity renewal* (different division, different purpose, overlapping deadline).
   - **State tax exemption:** Mississippi **Department of Revenue** (`dor.ms.gov`). Confirm: state **income-tax** exemption generally follows the federal 501(c)(3) determination (no separate renewal), but Mississippi **does not grant a general sales-tax exemption** to nonprofits — any sales-tax relief must be applied for separately/narrowly. Get the IRS prerequisite (Form 1023/1023-EZ → determination letter) and the DOR registration step.
   - **Employment basics:** Mississippi **Department of Employment Security** (`mdes.ms.gov`) for unemployment-insurance registration; DOR for state withholding; note the federal-vs-state split (the national guide covers FLSA/IRS; the state module covers MS unemployment, withholding, new-hire reporting, and the 501(c)(3) option to *elect reimbursement* in lieu of UI tax). Keep this module deliberately short and pointer-heavy.
2. **Verify every figure twice (research, ~1 day).** Each fee/date/threshold must appear on the official `.ms.gov` page or in the Mississippi Code before it goes in prose. Where the official page omits a number, cite the statute (Justia/Cornell mirror is acceptable as a *secondary* link but the primary `.ms.gov` page is the canonical citation). Record a single "Last verified YYYY-MM-DD" date per module.
3. **Write each module to the house format (content writer, ~3–4 days).** Reuse the existing guide skeleton exactly: answer box ("In Mississippi, you must…"), TOC, a **worked example** (e.g., "Hope Center, a Jackson food pantry expecting $40k/yr, must register because it exceeds the $25k threshold"), the dated **"Sources & tools" block** (free-first: the official portals; then any paid filing service), an **FAQ** (questions phrased exactly as a founder would ask — these must appear verbatim in the body for the gate), and the single Good Circles CTA. Add an explicit **plain-language non-legal-advice disclaimer** and a "Last verified / confirm current fees on the official site before filing" line.
4. **Write the Mississippi index page (content writer, ~0.5 day).** A "Start & run a nonprofit in Mississippi" overview that sequences the five modules as a checklist (Incorporate → get EIN → 501(c)(3) → register to solicit / or file Notice of Exemption → annual report → DOR/MDES), with a printable summary table (task, agency, fee, deadline).
5. **Cross-link to the national guides (content writer, ~0.5 day).** Each module opens with "This is the Mississippi-specific layer; for the national rules see [national guide]," and each relevant national guide gets a "State-specific: see Mississippi" callout. This is the reciprocal-link pattern dev needs to wire.
6. **Localize the priority pages to Spanish (content writer + research, ~1 day).** Translate the MS index and the incorporation module, mirroring the existing 20-cornerstone `es` + bidirectional hreflang pattern.
7. **Draft `STATE-PLAYBOOK.md` (research, ~0.5 day).** A fill-in-the-blanks contributor template listing the five module types, the exact field list below, the "primary `.gov` source only" rule, and the verify-twice/Last-verified discipline, so the next state (e.g., Tennessee, Alabama) is a content task, not an engineering one.

### Developer handoff package

**Content/data structure (typed record — mirror the existing learn/guide data modules):**

```ts
interface StateModule {
  state: 'MS';                     // ISO/USPS code, drives URL + grouping
  stateName: 'Mississippi';
  moduleSlug: 'incorporation' | 'charitable-registration'
            | 'annual-report' | 'tax-exemption' | 'employment-basics';
  h1: string;                      // exactly one H1
  title: string;                   // === og:title
  description: string;             // meta description
  lang: 'en' | 'es';
  hreflangAltUrl?: string;         // bidirectional alt-language URL
  answerBox: string;               // "In Mississippi, you must…"
  bodyHtml: string;                // TOC + sections + worked example, house CSS scope
  agencies: { name: string; url: string }[];  // primary .ms.gov authorities
  facts: { label: string; value: string; sourceUrl: string }[];
                                   // e.g. {label:'Incorporation fee', value:'$50', sourceUrl:'https://sos.ms.gov/...'}
  faq: { q: string; a: string }[]; // q text MUST appear verbatim in bodyHtml
  sources: { name: string; url: string; free: boolean }[]; // free-first
  lastVerified: string;            // 'YYYY-MM-DD' -> renders "Last verified 2026-06-17"
  nationalGuideSlug: string;       // reciprocal cross-link target
  ctaVariant: 'default';
  noindex?: false;
}
```

**Example record (incorporation):** `state:'MS'`, `moduleSlug:'incorporation'`, `h1:'How to Incorporate a Nonprofit in Mississippi'`, fee fact `{label:'Articles of Incorporation filing fee', value:'$50', sourceUrl:'https://www.sos.ms.gov/business-services'}`, agency `{name:'MS Secretary of State, Business Services', url:'https://www.sos.ms.gov/business-services'}`, `lastVerified:'2026-06-17'`, `nationalGuideSlug:'how-to-start-a-nonprofit'`.

**URLs / IA placement:**
- Index: `/resources/states/mississippi/`
- Modules: `/resources/states/mississippi/incorporation/`, `/charitable-registration/`, `/annual-report/`, `/tax-exemption/`, `/employment-basics/`
- Spanish: `/es/resources/states/mississippi/` and `/es/resources/states/mississippi/incorporation/` (bidirectional hreflang)
- A new **"States"** node in the resources hub nav/landing, sitting as a 12th access point alongside the 11 pillars (or nested under the existing "Starting a nonprofit" pillar — confirm with IA owner; either way it is one link target).

**Build-gate & SEO requirements (must pass unmodified):**
- Exactly one non-empty `<h1>` (`module.h1`); non-empty `<title>` and meta description; `og:title === title`; absolute `og:image`.
- Absolute self-referencing **canonical in trailing-slash form** (`https://goodcircles.org/resources/states/mississippi/incorporation/`).
- Every module uses the **"Sources & tools"** block → therefore the citation gate *requires* a `Last verified YYYY-MM-DD` stamp (Spanish: `Verificado por última vez YYYY-MM-DD`). Render it from `lastVerified`.
- **Article + BreadcrumbList JSON-LD** on every module; **FAQPage JSON-LD** where `faq` is non-empty, with every `faq[].q` present **verbatim** in `bodyHtml` (the gate fails otherwise).
- All internal links resolve, no `.html` internal links, both reciprocal national↔state links must resolve.
- All six EN pages (and the two `es` pages) appear in the sitemap; none set noindex.
- No new figures introduced into prose that would trip `figure-watchlist.mjs` (these are *state* fees, not the federal watch-list figures — no watchlist change needed, but reuse the same verified-on discipline).

**Interaction / UX behavior:** Static content; the only interactive element is the index page's checklist/summary table (pure HTML/CSS, no JS state, no PII, no custody). Optional progressive enhancement: a print stylesheet so a founder can print the MS checklist — nice-to-have, not required.

**Acceptance criteria / QA checklist:**
- [ ] `npm run build` passes both gates with the six EN + two ES pages present.
- [ ] Each module: one H1, dated "Sources & tools," valid Article + Breadcrumb JSON-LD, FAQ verbatim match.
- [ ] Every fee/date/threshold in prose matches the `facts[]` record and resolves to a primary `.ms.gov`/Mississippi Code source.
- [ ] National↔state reciprocal links resolve in both directions.
- [ ] Spanish index + incorporation module carry correct bidirectional hreflang to their EN counterparts.
- [ ] Brand tokens applied (Purple #7851A9, Ink #2E1B4E, Gold #C2A76F; Montserrat + Fira Sans); single Good Circles CTA per page.
- [ ] Disclaimer ("informational, not legal advice; confirm current fees on the official site") visible on every module.
- [ ] Adding a 7th identical-shape record (smoke test with a stub state) builds without template edits.

### Accuracy, accessibility & compliance notes
- **Figures to verify (primary source, on-page before publish):** incorporation $50; charitable registration $50 (+ ~$3.14 online portal fee on renewal); §79-11-505 exemption thresholds ($25,000 / unpaid fundraisers only) and the one-time Notice of Exemption; charity renewal deadline (15th day of 5th month after FY-end); HB 1344 annual report window Jan 1–May 15 and **no fee**; MS income-tax exemption follows federal 501(c)(3); **MS has no general nonprofit sales-tax exemption** (do not imply otherwise); MDES unemployment registration and the 501(c)(3) reimbursement election. Re-verify all at least **annually** and whenever the SOS/DOR updates a fee or HB 1344 guidance matures — set the review cadence in `STATE-PLAYBOOK.md`.
- **Legal review:** No bespoke legal opinion needed for factual filing data, but have counsel (or a one-time pro-bono review) approve the standard **non-legal-advice disclaimer** wording once; reuse it across all states. Keep the tone "here's where to file and what it costs," never "you should structure your org as…".
- **WCAG 2.1 AA:** semantic headings (single H1, ordered H2/H3 TOC), the summary table uses real `<table>`/`<th scope>` markup, link text is descriptive ("File the Mississippi annual report on sos.ms.gov" not "click here"), 4.5:1 contrast (Ink on Lavender-tint background already passes; verify Gold link color on white meets 4.5:1 and darken if not), and the print/checklist works without JS.
- **GC accuracy-contract compliance:** the single CTA must use the canonical figures (10% of merchant net profit to the nonprofit; merchants keep 89% on a 1% fee; ~10% shopper savings *estimate*; free for nonprofits; ~$72/active supporter/yr *estimate*) with the "estimate" hedges intact. Nothing in these modules touches money flow, so the **no-custody / no-unnecessary-PII** posture is unaffected — no forms collect user data.

### Effort, cost & sequencing
- **Effort:** L for the Mississippi pillar + data model + contributor template (1–2 months, research-led, ~10–12 working days of actual labor spread across research/writing/dev/QA). Each subsequent state is **S–M** (mostly the research dossier + content; zero new engineering).
- **Cost:** **$0 third-party.** All sources are free government portals and the public Mississippi Code; reuses the existing Astro template, gates, and hreflang machinery. The only "cost" is a one-time pro-bono/counsel sign-off on disclaimer language.
- **Sequencing:** Ship as a **P1** flagship after the current ~96 national guides are stable (they are), since the state modules *depend on and link back to* those national guides. Do Mississippi end-to-end first to prove the data model and the `STATE-PLAYBOOK.md` template, then expand to the next launch-adjacent states (Tennessee, Alabama, Louisiana) as pure content tasks. This is the single highest-leverage "local-first" differentiator and directly compounds the Mississippi-first September 2026 launch story.

---

## 2. Expert Review Program + E-E-A-T Bylines + Inline Footnote Citations

**Why it moves 9 -> 10:** The hub already proves its links resolve and its figures aren't stale, but it cannot yet prove *who stands behind the advice* — and on the highest-stakes guides (501(c)(3) formation, Form 990, board governance, bylaws, budgeting, grant budgets) that is exactly the trust gap that separates a good resource from an authoritative one. The best legal/finance resources close it with named, credentialed reviewers and per-claim sourcing: Investopedia marks board-reviewed articles with a visible check and a Financial Review Board of CPAs/CFPs; Nolo and NerdWallet carry "Reviewed by [name, credential]" bylines; Candid and the National Council of Nonprofits trade on named subject-matter authority. Adding a CPA + nonprofit-attorney review pass, visible "Reviewed by" bylines with bios, `reviewedBy` schema, and inline numbered footnotes that link each load-bearing claim to a primary source (IRS, state AG, statute) converts the hub from "well-organized content" into "expert-verified reference," which is the single most valuable signal both Google's E-E-A-T raters and a skeptical executive director look for. This is the credibility layer a top-tier YMYL ("Your Money or Your Life") resource is expected to have and the hub currently lacks.

**Primary owner (human labor):** research · **Also needs:** bizdev (reviewer recruitment), content writer (footnote conversion), development (template/schema), QA
**Effort:** L (1-2 mo) · **Priority:** P1 · **Dependencies:** None hard. Reuses the existing Sources & tools sourcing on each guide as the raw material for footnotes; reuses the existing `dateline` and `callout` components and the build gate. Best sequenced after the figure-watchlist is stable (it is) so reviewers aren't reviewing moving numbers.

### Definition of done
A defined **Tier-1 set of ~12 highest-stakes guides** (the legal/finance/compliance cornerstones, English + their Spanish localizations) each carries: (1) a visible **"Reviewed by [Name], [Credential]" + "Last reviewed [YYYY-MM-DD]"** byline directly under the existing dateline; (2) a short **reviewer bio block** near the foot of the article with the reviewer's credential, affiliation, and a `sameAs` link (LinkedIn or firm bio); (3) **inline numbered footnote citations** ([1], [2]…) on every load-bearing factual claim, each linking to a primary source, resolving to a numbered **"References"** list at the foot of the article; (4) valid **`Article` JSON-LD extended with `reviewedBy` (a credentialed `Person`)**, `author`, `dateModified`, and a `citation` array; (5) a one-line **scope disclaimer** ("Educational information, not legal or tax advice"); and (6) a single **`/resources/about/editorial-standards/` page** documenting the review program, reviewer roster, and correction policy. A new build-gate check (`check-reviewers.mjs`) fails the build if any guide *declaring* a reviewer byline lacks the matching `reviewedBy` schema, a reviewer in the roster, or a `Last reviewed` date — exactly mirroring how the citation gate enforces `Last verified`. Every footnote anchor resolves; no broken reference links; the existing SEO + citation gates still pass green.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Define scope and the reviewer data the program needs (research, ~2 days)**
1. Lock the **Tier-1 list**. Pull the 12 highest-stakes, highest-liability guides — the ones where bad advice costs an org money or its exemption. Confirmed candidates from the live hub: `start-a-nonprofit/how-to-get-501c3-status`, `how-to-start-a-nonprofit`, `nonprofit-bylaws`, `how-to-build-a-board-of-directors`, `governance-compliance/form-990-explained`, `nonprofit-board-governance`, `conflict-of-interest-policy`, `document-retention-policy`, `annual-compliance-checklist`, `operations/nonprofit-budgeting`, `operations/financial-management-basics`, `grants/grant-budget-guide`. Split into **CPA-review** (anything with tax/financial figures: 990, budgeting, financial management, grant budgets) and **attorney-review** (formation, bylaws, governance, COI, retention, compliance). Some get both.
2. Write a **one-page reviewer scope-of-work** so a volunteer knows exactly what they're agreeing to: "Read 4–6 short guides (~8-min reads), flag anything inaccurate or out-of-date against current IRS/state rules, confirm the figures, and let us list you as 'Reviewed by [you], [credential]' with a 2-sentence bio and a link to your bio/LinkedIn." Make clear it is **content review, not a client engagement** — they are not providing advice to readers and form no attorney/CPA-client relationship. (This framing is what keeps reviewer liability low; pair it with the on-page scope disclaimer in step 11.)

**Phase B — Recruit the reviewers, free/low-cost first (bizdev/research, 1-3 wks elapsed, low active hours)**
3. Post two scoped pro-bono projects (one "tax/finance content review," one "nonprofit legal content review") on **Taproot Plus** (taprootplus.org — free, US nonprofit-focused, runs regular volunteer/nonprofit orientations) and **Catchafire** as the primary channels.
4. In parallel, approach **AICPA Volunteer Central** and the **Mississippi Society of CPAs** (and, for the attorney, the **Mississippi Bar** and **Mississippi Center for Nonprofits**) — state societies routinely run nonprofit pro-bono matching and are the natural fit given the Mississippi-first launch. The **National Council of Nonprofits "Pro Bono and Skilled Volunteers"** page lists additional channels.
5. Target **2 reviewers to start** (1 CPA, 1 nonprofit attorney). Vet credentials: active CPA license (verify via the state board of accountancy license lookup) and an attorney in good standing with nonprofit/tax-exempt experience (verify via the state bar). Capture, for each: full name, post-nominal credential (e.g., "CPA"; "JD" / "Esq."), firm/affiliation, one `sameAs` URL (LinkedIn or firm bio page), and a 1–2 sentence bio. **Collect no SSNs, no home addresses, no PII beyond what appears publicly on the byline** — stay consistent with the lean, no-unnecessary-PII posture.
6. Get a **short written consent** (email is fine) for: being named as reviewer, the bio/credential/link text as it will appear, and the scope ("editorial review, not professional advice to readers"). File the consent text; this is the audit trail the editorial-standards page promises.

**Phase C — Run the review pass (research + reviewer, ~1-2 wks)**
7. Send each reviewer their assigned guides as a simple checklist (a shared doc or a printout of the live page). Ask them to mark each guide **Pass / Pass-with-edits / Needs-rework** and to confirm the dated figures. Set the **"Last reviewed" date = the date the reviewer signs off**, not the publish date.
8. Triage their edits. Anything that contradicts a current primary source gets fixed before the byline goes live — a "Reviewed by" byline on a wrong page is worse than no byline.

**Phase D — Convert "Sources & tools" into inline footnotes (content writer, the bulk of the effort)**
9. For each Tier-1 guide, walk the body top to bottom and attach a **numbered footnote to every load-bearing factual claim** — thresholds, deadlines, dollar figures, legal rules ("three consecutive years triggers automatic revocation," "due the 15th day of the 5th month," "$50,000 gross-receipts 990-N threshold"). Map each footnote to the **most primary source available**, preferring the existing "Free first" links already vetted in that guide's Sources block: IRS pages, the statute/CFR, the state AG/Secretary of State, Candid's knowledge base. Reuse the URLs already in the guide wherever possible — the sourcing work is largely *re-pointing existing links to specific claims*, not net-new research.
10. Keep the existing **"Sources & tools"** block and its **"Last verified"** stamp intact (the citation gate depends on it). Footnotes are an *additional* layer: claim → numbered marker → References list. The References list and Sources & tools can share URLs; that's expected.
11. Add the **scope disclaimer** sentence once per guide, in the byline area: *"Educational information, not legal or tax advice — confirm specifics with a qualified professional."* (Standard, defensible editorial-content framing.)

**Phase E — Stand up the program page (content writer, ~1 day)**
12. Draft `/resources/about/editorial-standards/`: how guides are written, the figure-verification + "Last verified" process (already real), the expert-review program, the reviewer roster (name, credential, affiliation, `sameAs`), the **correction policy** ("found an error? email …"), and the scope disclaimer. Link to it from each reviewed guide's byline ("How we review"). This is the "review board" page the best resources publish.

### Developer handoff package

**1. Reviewer roster — single source of truth.** A new data file the build reads (mirrors how the hub already centralizes data), so a reviewer's bio/link is defined once and reused:
```js
// marketing/data/reviewers.mjs
export const REVIEWERS = {
  'jdoe-cpa': {
    name: 'Jane Doe',
    credential: 'CPA',
    jobTitle: 'Certified Public Accountant',
    affiliation: 'Doe & Co. CPAs, Jackson, MS',
    sameAs: 'https://www.linkedin.com/in/janedoe-cpa/',
    bio: 'Jane Doe, CPA, has 15 years advising Mississippi nonprofits on Form 990 and fund accounting.',
    knowsAbout: ['Form 990', 'nonprofit accounting', 'tax-exempt compliance']
  }
};
```

**2. Per-guide front-matter / byline fields** (added to whatever per-page metadata drives the template; example values for `form-990-explained`):
```
reviewer: 'jdoe-cpa'        // key into REVIEWERS; omit if not yet reviewed
lastReviewed: '2026-06-20'  // ISO date the reviewer signed off
```

**3. Visible byline markup** — placed immediately after the existing `.dateline`, reusing existing type tokens:
```html
<div class="dateline">Updated June 16, 2026 · Good Circles · ~8 min read</div>
<div class="reviewedby">Reviewed by <a href="https://www.linkedin.com/in/janedoe-cpa/" target="_blank" rel="noopener">Jane Doe, CPA</a>
  · Last reviewed June 20, 2026 · <a href="/resources/about/editorial-standards/">How we review</a></div>
```
New CSS (one rule, same family as `.dateline`): `.reviewedby{font-size:.82rem;color:var(--ash);font-family:'Montserrat';font-weight:600;margin-bottom:14px}` plus a small "verified" check glyph (inline SVG, decorative, `aria-hidden="true"`) echoing Investopedia's blue-check pattern.

**4. Reviewer bio block** — reuse the existing `.callout.purple` component, placed just above the "Sources & tools" block:
```html
<div class="callout purple"><h4>About the reviewer</h4>
  <p>Jane Doe, CPA, has 15 years advising Mississippi nonprofits on Form 990 and fund accounting.
  <a href="https://www.linkedin.com/in/janedoe-cpa/" target="_blank" rel="noopener">Profile ↗</a></p>
  <p class="muted" style="margin-top:6px">Educational information, not legal or tax advice — confirm specifics with a qualified professional.</p></div>
```

**5. Inline footnote markup** — superscript anchor at the claim, resolving to a numbered References list:
```html
<!-- in body: -->
…missing it <b>three years in a row triggers automatic revocation</b><sup class="fn"><a id="fnref-1" href="#fn-1" aria-label="Footnote 1">[1]</a></sup>…

<!-- before "Sources & tools": -->
<h2 id="references">References</h2>
<ol class="refs">
  <li id="fn-1">IRS — Automatic Revocation of Exemption.
    <a href="https://www.irs.gov/charities-non-profits/..." target="_blank" rel="noopener">irs.gov ↗</a>
    <a href="#fnref-1" aria-label="Back to text">↩</a></li>
</ol>
```
CSS: `.fn{font-size:.7em} .refs{font-size:.92rem} .refs li{margin:4px 0}` (no new tokens needed).

**6. JSON-LD — extend the existing `Article` block** (do not add a second Article block; augment in place):
```json
{
  "@context":"https://schema.org","@type":"Article",
  "headline":"Form 990 Explained: Which One You File (2026)",
  "datePublished":"2026-06-16","dateModified":"2026-06-20",
  "author":{"@type":"Organization","name":"Good Circles"},
  "reviewedBy":{"@type":"Person","name":"Jane Doe",
    "honorificSuffix":"CPA","jobTitle":"Certified Public Accountant",
    "worksFor":{"@type":"Organization","name":"Doe & Co. CPAs"},
    "knowsAbout":["Form 990","nonprofit accounting"],
    "sameAs":"https://www.linkedin.com/in/janedoe-cpa/"},
  "citation":[
    {"@type":"WebPage","name":"IRS — Automatic Revocation of Exemption","url":"https://www.irs.gov/charities-non-profits/..."},
    {"@type":"WebPage","name":"IRS — Form 990 Series: Which Forms Do Exempt Organizations File","url":"https://www.irs.gov/charities-non-profits/..."}
  ],
  "publisher":{"@type":"Organization","name":"Good Circles","logo":{"@type":"ImageObject","url":"https://goodcircles.org/resources/og.png"}},
  "mainEntityOfPage":"https://goodcircles.org/resources/governance-compliance/form-990-explained/"
}
```
Notes for dev: use `reviewedBy` (the schema.org property for who verified the page for accuracy), not `Review`/`ClaimReview` (those are for *rating* a product/claim and Google disallows self-reviews — wrong tool here). `citation` entries should mirror the visible References list. The generator should build `reviewedBy` and `citation` from `reviewers.mjs` + the page's footnote list so the schema can never drift from what's visible.

**7. URLs / IA placement.**
- Bylines/footnotes: in-place on the 12 Tier-1 English guides + their Spanish localizations (already exist with bidirectional hreflang).
- New page: `https://goodcircles.org/resources/about/editorial-standards/` (+ optional `/es/`). Add to sitemap; link from each reviewed guide and from the resources hub footer.
- Spanish bylines reuse the same reviewer; translate the labels: **"Revisado por … · Última revisión [fecha]"** and **"Sobre el revisor"**, matching the existing `Verificado por última vez` / `Actualizado el …` Spanish conventions.

**8. New build-gate check — `marketing/scripts/check-reviewers.mjs`** (runs after the SEO + citation gates, same walk-the-dist pattern). Fails the build if any page that:
- renders a `class="reviewedby"` byline but has **no** `"reviewedBy"` in its Article JSON-LD (or vice-versa) — byline/schema must agree;
- declares a reviewer **not present** in `reviewers.mjs`;
- has a reviewer byline but **no `Last reviewed YYYY-MM-DD`** (mirrors the citation gate's `Last verified` rule; add Spanish `Última revisión`);
- contains a footnote marker `href="#fn-N"` with **no matching `id="fn-N"`** (and each `#fn-N` has a back-ref) — i.e., every footnote anchor resolves, the same guarantee the SEO gate gives internal links.

**Build-gate & SEO requirements it must satisfy (reusing the existing gate):**
- Single non-empty `<h1>` unchanged (References is an `<h2>`, bio is a `.callout`).
- Absolute trailing-slash self-canonical on the new editorial-standards page; `og:title === <title>`; absolute `og:image`.
- All JSON-LD must still parse (the SEO gate parses every `ld+json`); the extended Article + existing FAQPage/HowTo/Breadcrumb all valid.
- FAQ questions still appear verbatim in visible text (unchanged).
- "Sources & tools" + "Last verified" date **retained** so the citation gate stays green; footnotes are additive.
- New page in sitemap; every footnote/reference link and the "How we review" link resolve (SEO gate's internal-link + asset-link checks cover this; external `target="_blank"` links carry `rel="noopener"`).

**Acceptance criteria / QA checklist:**
- [ ] All 12 Tier-1 guides (EN + ES) show a "Reviewed by [Name, Credential]" + "Last reviewed [date]" byline matching `reviewers.mjs`.
- [ ] Each reviewed guide has a bio block (`.callout.purple`) with a working `sameAs` link and the scope disclaimer.
- [ ] Every load-bearing claim carries a footnote; every `[n]` marker links to an existing `#fn-n` that links to a real primary source and back-refs to the text.
- [ ] Article JSON-LD validates in Google's Rich Results Test and Schema Markup Validator with `reviewedBy` (credentialed Person) + `citation` array present and matching the visible References + byline.
- [ ] `/resources/about/editorial-standards/` lists the program, full reviewer roster, and correction email; reachable from each guide and the hub.
- [ ] `npm run build` passes: existing SEO gate, existing citation gate, and the new `check-reviewers.mjs` all green; zero broken internal links.
- [ ] Non-reviewed guides are unaffected (no byline, no schema change) and still build.
- [ ] Spanish pages mirror EN exactly with translated labels and identical reviewer/footnote data.

### Accuracy, accessibility & compliance notes
- **Figures to verify:** the reviewer pass *is* the verification — but the CPA/attorney must confirm every dated figure already on the page (990 thresholds $50k/$200k/$500k, the 15th-day-of-5th-month deadline, 3-year auto-revocation, any state formation fees) against current IRS/state sources, and any change feeds back into the figure-watchlist so the citation gate guards it going forward.
- **Legal review needed:** yes — that's the point. Additionally, run the **scope disclaimer and reviewer-consent wording past the attorney reviewer once** so the "editorial review, not advice; no client relationship" framing is sound. No GC-specific legal exposure beyond standard editorial disclaimers.
- **WCAG 2.1 AA:** footnote markers must be real links with discernible names (`aria-label="Footnote 1"`) and visible focus, not bare superscripts; back-reference arrows need an `aria-label`; the byline "verified" glyph is decorative (`aria-hidden="true"`) so it isn't announced; ensure the `[1]` link text and `.fn` superscript still meet 4.5:1 contrast against the page (the `.refs`/`.fn` colors must not drop below the gate-acceptable contrast — keep References body text at the standard ink color, only the markers small). Footnote tap targets should be comfortably clickable on mobile (pad the anchor).
- **GC accuracy-contract compliance:** the single Good Circles CTA (`.gcbox`) and its figures (10% of net profit, 89% merchant keep on a 1% fee, ~$72/active supporter/yr, free for nonprofits, Sept 2026 launch, no-custody) are **unchanged and must remain** exactly as the contract specifies — the GC CTA is *not* part of what reviewers vet (it's not advice), and reviewer bylines must not appear to endorse Good Circles the marketplace. Keep the reviewer's scope explicitly limited to the educational body content.
- **Keeping it current:** set a **recurring re-review cadence** — re-verify each Tier-1 guide at least annually, or sooner when its watch-listed figures change; bump "Last reviewed" only when a reviewer actually re-reads. The `check-reviewers.mjs` gate plus a calendar reminder keeps stale bylines from going unnoticed. If a reviewer departs, removing them from `reviewers.mjs` will fail the build on any guide still citing them — forcing a clean reassignment.

### Effort, cost & sequencing
**Effort:** L overall, but front-loaded on *recruitment lead time* (1-3 wks elapsed, low active hours) and *footnote conversion* (the real labor: ~12 guides × EN/ES, mostly re-pointing links already present). Dev work is modest: one template change (byline + bio + footnote rendering), one data file, one ~50-line build-gate script in the exact style of the two that exist, and one new static page.
**Third-party cost:** effectively **$0**. Reviewers via Taproot Plus / Catchafire / AICPA / state CPA society / state bar pro-bono are free; offer non-cash recognition (named credit + bio link + a "Founding Reviewer" note on the editorial-standards page) instead of payment. No new tools, hosting, or subscriptions — it lives in the existing static-site + strict-gate pipeline. If pro-bono recruitment stalls, a paid contract review of all 12 guides by a freelance nonprofit CPA/attorney would be a low-hundreds-to-low-thousands one-time cost, but free channels should be exhausted first.
**Sequencing:** Do this **before** any further breadth expansion (more guides/tools). Depth-of-trust on the highest-stakes existing pages yields more 9->10 movement than additional volume, and the footnote/reviewer pattern, once built into the template and gate, becomes a reusable standard every future high-stakes guide inherits.

Sources: [schema.org reviewedBy](https://schema.org/reviewedBy), [schema.org hasCredential](https://schema.org/hasCredential), [schema.org ClaimReview](https://schema.org/ClaimReview), [MedicalWebPage lastReviewed](https://schema.org/MedicalWebPage), [Bankrate Financial Review Board](https://bankrate.com/financial-review-board/), [Taproot Plus](https://taprootfoundation.org/taproot-plus), [National Council of Nonprofits — Pro Bono and Skilled Volunteers](https://www.councilofnonprofits.org/running-nonprofit/employment-hr/pro-bono-and-skilled-volunteers), [Candid — pro bono tax/legal help](https://learning.candid.org/pro-bono-tax-lawyer-for-nonprofits/278279), [Search Engine Journal — Structured Data for E-A-T](https://www.searchenginejournal.com/google-eat/structured-data/), [Termly — Views Expressed Disclaimer](https://termly.io/resources/articles/views-expressed-disclaimer/)

---

## 3. Guided "Start Here" Diagnostic — Personalized Nonprofit Pathways

**Why it moves 9 -> 10:** The hub already has best-in-class depth (96+ guides, 12 tools, 43 funders), but a first-time visitor from an under-resourced nonprofit lands on a wall of ~150 links and has to self-diagnose where to begin — the exact friction the best resources remove. Candid and the National Council of Nonprofits both replace "browse everything" with a guided, step-ordered starter path, and the field's standard mental model is Susan Kenny Stevens' seven-stage Nonprofit Lifecycle (idea -> start-up -> growth -> maturity), which funders and consultants already use. A browser-only "Start Here" wizard that maps *lifecycle stage + top need + state* to an *ordered* path of existing guides/tools/templates turns the library's depth from a liability into a personalized curriculum — the above-and-beyond touch that NonprofitReady (learning paths) and Bloomerang Academy (role-based tracks) gate behind logins, given away free with no account and no PII. It also lifts conversion on every downstream guide by routing the right people to the right page instead of relying on search luck.

**Primary owner (human labor):** content writer · **Also needs:** research (lifecycle/state grounding), development (build the wizard), QA · light design (reuse existing tool styles)
**Effort:** M (1-3 wks) · **Priority:** P1 · **Dependencies:** None blocking — all destination URLs already exist (verified against the repo). Should ship before any paid-acquisition push so traffic lands on a guided entry point.

### Definition of done
A new browser-only interactive page at `/resources/start-here/` that asks 3 required questions (lifecycle stage; top need; state) plus 1 optional refiner, and instantly renders a personalized, **ordered** "Your path" of 4-8 steps. Each step links to a real, resolving guide / tool / template URL already on the hub, with a one-line "why this, now" rationale. The result is shareable via a URL hash (so a coach can send a nonprofit its exact path) and prints cleanly. It runs entirely client-side with plain JS — no account, no storage beyond the URL hash, nothing transmitted — and passes both existing build gates unchanged. It is linked as the first card on `/resources/` and `/resources/tools/`.

### The human work (step-by-step for a marketing/research staff member)

The deliverable from the human is **one spreadsheet (the routing matrix) + one short copy doc**. The developer turns these into the page. Do it in this order:

1. **Lock the question tree (research-grounded, ~half a day).** Use the four *active* lifecycle stages from Susan Kenny Stevens' [Nonprofit Lifecycles model](https://nonprofitlifecycles.com/lifecycles/) (omit decline/turnaround/terminal — out of scope for a starter tool) and label them in plain language:
   - **Idea** — "I have an idea but haven't formed an organization yet"
   - **Forming / Start-up** — "We're incorporating or applying for 501(c)(3)"
   - **Running** — "We're operating with programs and some funding"
   - **Growing** — "We're stable and want to scale funding, board, or programs"

   For "top need," use five buckets that map cleanly onto the existing pillars: **Legal & formation**, **Funding & grants**, **Board & governance**, **Fundraising & donors**, **Marketing & visibility**. Cross-check the step language against how [NCN's "How to Start a Nonprofit"](https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit) and [Candid's starting-a-nonprofit roadmap](https://learning.candid.org/starting-a-nonprofit/267834) order their steps, so an outside expert recognizes the sequence as standard.

2. **Build the routing matrix (the core deliverable, ~3-5 days).** Create a spreadsheet, one row per `(stage × need)` combination = **4 × 5 = 20 paths**. For each path, list 4-8 ordered steps. Each step has: order number, label, destination URL, asset type (guide / tool / template / directory), and a one-line "why now." **Pull every URL from the live hub** — do not invent slugs. Confirmed real destinations you will route to (all verified present in the repo) include, for example:
   - Idea/Forming + Legal: `/resources/start-a-nonprofit/how-to-start-a-nonprofit/`, `/resources/start-a-nonprofit/choosing-a-nonprofit-structure/`, `/resources/start-a-nonprofit/fiscal-sponsorship-explained/`, `/resources/start-a-nonprofit/how-to-get-501c3-status/`, template `Nonprofit-Bylaws-Template.docx`.
   - Any stage + Board: `/resources/start-a-nonprofit/how-to-build-a-board-of-directors/`, `/resources/governance-compliance/nonprofit-board-governance/`, tool `/resources/tools/board-composition-matrix/`, template `Board-Skills-and-Composition-Matrix.xlsx`.
   - Running/Growing + Funding: `/resources/grants/how-to-get-grant-ready/`, tool `/resources/tools/grant-readiness-assessment/`, `/resources/grants/how-to-find-grants/`, `/resources/grants/funder-directory/`, `/resources/fundraising/the-funding-mix/`, `/resources/passive-funding/build-a-recurring-funding-base/`.
   - Running/Growing + Fundraising: `/resources/fundraising/individual-giving-basics/`, `/resources/fundraising/monthly-recurring-giving/`, `/resources/donor-development/donor-retention-and-stewardship/`, tool `/resources/tools/donor-retention-ltv-calculator/`.
   - Any stage + Marketing: `/resources/marketing/nonprofit-website-essentials/`, `/resources/marketing/free-marketing-channels/`, `/resources/marketing/nonprofit-email-marketing/`.
   - Compliance entry common to Running/Growing: `/resources/governance-compliance/annual-compliance-checklist/`, `/resources/governance-compliance/charitable-solicitation-registration/`.

   Aim to surface at least one **tool** and one **template** in most paths (that's the hub's differentiator). Place **exactly one Good Circles step** near the end of each path where it's genuinely relevant (passive recurring funding), reusing the approved estimate language — do not over-insert it.

3. **Handle "state" as a light refiner, not 50 custom paths (~half a day).** The static, no-PII posture means do not build per-state logic trees. Instead, capture state to (a) deep-link the existing state-registration guidance and (b) point to the authoritative free state source. For every path that includes formation or compliance, add a state-aware line that links to `/resources/start-a-nonprofit/state-charitable-registration/` and `/resources/governance-compliance/charitable-solicitation-registration/`, plus a generic pointer to the user's **state association of nonprofits** (NCN explicitly recommends this) and the state's AG/charities registration office. Mississippi (launch state) gets one hand-written sentence; all other states use the same generic, accurate line. This keeps the matrix at 20 paths, not 1,000.

4. **Write the micro-copy (~1 day).** For each step write the ≤14-word "why now" rationale (e.g., "Before you fundraise, you need a clear case for support"). Write the intro answer-box paragraph, the 3 question prompts with plain-language option labels, the privacy line ("runs in your browser, nothing saved or sent"), and a 4-6 item FAQ. Reuse the brand voice and the existing accuracy-contract sentence verbatim for the GC step.

5. **Self-QA the matrix before handoff.** Click every URL in the spreadsheet on the live/preview hub to confirm it resolves (the build gate will fail the deploy if any don't, so catch it here). Confirm no path exceeds 8 steps, every path has a sensible order, and the Spanish cornerstones are linked from Spanish-relevant steps where an `/es/` version exists.

### Developer handoff package

**Content/data structure (single embedded JS object — no CMS, mirrors the grant-readiness tool's inline-data pattern).** The staff spreadsheet exports to this shape. The wizard is pure routing over static data; there is no scoring backend.

```js
// Questions (rendered as accessible radio fieldsets)
const STAGES = [
  { id:"idea",    label:"I have an idea, not yet an organization" },
  { id:"forming", label:"We're forming / applying for 501(c)(3)" },
  { id:"running", label:"We're up and running" },
  { id:"growing", label:"We're stable and want to grow" }
];
const NEEDS = [
  { id:"legal", label:"Legal & formation" },
  { id:"funding", label:"Funding & grants" },
  { id:"board", label:"Board & governance" },
  { id:"fundraising", label:"Fundraising & donors" },
  { id:"marketing", label:"Marketing & visibility" }
];
// STATES: array of {code:"MS", name:"Mississippi"} for the <select>, used only for the state-refiner line.

// One example routed path (key = `${stage}:${need}`)
const PATHS = {
  "forming:funding": {
    title: "Get funding-ready while you finish forming",
    steps: [
      { type:"guide",    label:"Choose the right structure",
        url:"/resources/start-a-nonprofit/choosing-a-nonprofit-structure/",
        why:"Your structure shapes which funders you can approach." },
      { type:"guide",    label:"How to get 501(c)(3) status",
        url:"/resources/start-a-nonprofit/how-to-get-501c3-status/",
        why:"Most grants require confirmed tax-exempt status." },
      { type:"tool",     label:"Grant-Readiness Assessment",
        url:"/resources/tools/grant-readiness-assessment/",
        why:"See exactly which foundations funders screen for." },
      { type:"guide",    label:"The funding mix",
        url:"/resources/fundraising/the-funding-mix/",
        why:"Plan a durable blend before chasing any one source." },
      { type:"gc",       label:"Build a recurring funding base",
        url:"/resources/passive-funding/build-a-recurring-funding-base/",
        why:"Recurring, unrestricted income is the durability funders reward." }
    ],
    stateAware:true   // appends the state-registration line if true
  }
  // ...19 more keys
};
```

**URL / placement in the IA.**
- New page: `https://goodcircles.org/resources/start-here/` (built as `/resources/start-here/index.html`). Self-canonical, trailing slash.
- Add it to the sitemap (indexable — it's a high-value entry page).
- Surface it as the **first card** on `/resources/` (hero CTA: "Not sure where to start? Build your path →") and as a featured card at the top of `/resources/tools/`. Add a cross-link from `/resources/start-a-nonprofit/` and `/resources/tools/grant-readiness-assessment/`.
- Same `nav`/`footer` chrome, same `/resources/resources.css`, same `share.js`, same brand tokens/fonts as existing tools — no new global CSS needed.

**Build-gate & SEO requirements it must satisfy (reuse existing gate, no changes to the gate scripts):**
- Exactly one non-empty `<h1>` ("Start here: build your personalized nonprofit path").
- Non-empty `<title>` and meta description; `og:title` byte-identical to `<title>`; absolute `og:image` (`/resources/og.png`).
- Absolute self-referencing canonical in trailing-slash form: `https://goodcircles.org/resources/start-here/`.
- JSON-LD: `WebApplication` (matching the grant-readiness tool's block, `price:"0"`, "runs in the browser, no data collected"), `BreadcrumbList` (Good Circles -> Resources -> Start Here), and `FAQPage`. **Every FAQ `name` must appear verbatim in the visible HTML** (check-seo.mjs enforces this — author the FAQ as static visible `<div class="faq">` markup, not JS-injected).
- **All routed destination URLs must be hard-coded as real links and resolve to built files.** check-seo.mjs walks `href="/..."` and fails on any broken internal link or any `.html` link. Because all ~80 routed URLs live in the JS `PATHS` object (not in `href=` attributes until injected), **also emit a static, visually-hidden `<nav aria-label="All paths"><ul>` containing every routed URL as a plain `<a href>`** so the build gate verifies them and so the page degrades gracefully with JS off. This is the key gate-compliance trick: the matrix must exist as real anchors in the served HTML.
- No `/api` or `/account` links; no internal `.html` links.
- This page does **not** adopt the "Sources & tools" block, so check-citations.mjs requires no "Last verified" stamp. If any benchmark stat is cited in the FAQ, add the Sources block — then it must carry a `Last verified YYYY-MM-DD` line. Cleanest path: cite no live figures; speak only in routing/process terms and reuse the already-approved GC estimate language (which is on the watch-list-safe side).

**Interaction / UX behavior (interactive):**
- Three required questions shown together (single screen, not a multi-page wizard — fewer clicks, fully visible, easier to make accessible). State is a `<select>`; stage and need are radio fieldsets.
- "Build my path" button is disabled until stage + need are chosen (state optional). On click: look up `PATHS[`${stage}:${need}`]`, render the ordered step list into an `aria-live="polite"` results region, append the state-aware line if `stateAware`, smooth-scroll to results.
- Each step renders as a numbered card: type badge (GUIDE / TOOL / TEMPLATE / DIRECTORY, reusing `.dlcard`/`.ic` styles), bold label linking to the URL, and the "why now" line.
- **Shareable + resumable:** encode selections in the URL hash (`#stage=forming&need=funding&state=MS`); on load, read the hash and auto-render that path. This lets a coach email a nonprofit its exact path with zero accounts/PII. No `localStorage`, no cookies, no network calls.
- "Start over" resets selections and clears the hash. "Print my path" triggers `window.print()` with print CSS that shows results and hides the form chrome.
- Reuse the existing `.sharebar` + `share.js`.

**Acceptance criteria / QA checklist:**
- [ ] `npm run build` passes both check-seo.mjs and check-citations.mjs with the new page present.
- [ ] All 20 `(stage × need)` combinations render a non-empty ordered path; none exceeds 8 steps; none links to a 404 (every URL resolves on the built site).
- [ ] The hidden "All paths" `<nav>` contains every routed URL as a resolving `<a href>`; build gate confirms link resolution.
- [ ] FAQ questions appear verbatim in visible HTML (gate passes).
- [ ] Loading `…/start-here/#stage=running&need=board&state=MS` auto-renders the correct path with no clicks.
- [ ] With JavaScript disabled, the page still shows the question copy and the full hidden link list is reachable (graceful degradation).
- [ ] Keyboard-only: tab into each fieldset, arrow-key between radios, select state, activate button, land on results; focus moves to the results heading.
- [ ] Screen reader announces the result via the `aria-live` region; each radio group has a `<fieldset>`/`<legend>`.
- [ ] Nothing is written to `localStorage`/cookies; no network requests fire (verify in devtools).
- [ ] Exactly one Good Circles step per path, using approved estimate language; no duplicate or off-topic GC insert.
- [ ] Print output shows the rendered path and hides the form.

### Accuracy, accessibility & compliance notes
- **Figures to verify:** none introduced if the page stays process-only. The single GC step reuses the locked accuracy contract verbatim — *10% of merchant net profit; ~$72/active supporter/yr (estimate); free for nonprofits* — with the "estimates, not guarantees" caveat. Do **not** restate the 89/1% merchant split here (out of scope and on the watch-list).
- **Legal review:** none required — the tool routes to existing reviewed guides and authoritative free sources (state associations, state charities offices). Keep the standing "general information, not legal advice; consult a professional and your state's requirements" disclaimer that the formation guides already use, mirrored in the state-aware line, consistent with how NCN/Candid frame state variation.
- **WCAG 2.1 AA:** radio options grouped in `<fieldset>` with `<legend>` (1.3.1); results in an `aria-live="polite"` region (4.1.3); visible focus states; full keyboard operability (2.1.1) with native radios/`<select>`/`<button>` — no custom widgets; type badges must not rely on color alone (include the text label); check contrast of badge colors against brand tokens. Grounded in [W3C WAI grouping guidance](https://www.w3.org/WAI/tutorials/forms/grouping/) and the [WebAIM WCAG 2 checklist](https://webaim.org/standards/wcag/checklist).
- **No-custody / no-PII posture:** state is the only quasi-identifier collected and it never leaves the browser (hash only, no storage, no transmission). This is consistent with the hub's existing "nothing saved or sent" promise and adds no money-transmitter or data-handling surface.
- **Keeping it current:** the routing matrix is the only maintenance surface. When a guide slug changes or a new pillar guide ships, update the JS `PATHS` object and the hidden link list — the build gate then re-verifies every link on deploy, so drift fails loudly rather than rotting silently. Add a quarterly review of the matrix to the same cadence as the citation watch-list.

### Effort, cost & sequencing
- **Effort:** ~M overall. Human work (question tree + 20-path matrix + copy + URL QA) ≈ 4-6 working days for a content/research staffer. Dev work (one static page reusing the grant-readiness tool's exact structure, plus hash routing and print CSS) ≈ 2-4 days. QA ≈ 1 day.
- **Cost:** $0 third-party. No new libraries, no backend, no analytics vendor — plain JS on the existing Astro static site, served from `/resources/`.
- **Sequencing:** Do this **first among entry-point improvements** — it is the front door that makes the hub's existing depth legible and raises the yield of every other guide/tool. It depends on nothing and unblocks better routing for any future acquisition or partner-referral traffic.

Sources: [Nonprofit Lifecycles Institute](https://nonprofitlifecycles.com/lifecycles/) · [GCN: The Nonprofit Lifecycle model](https://gcn.org/resource-hubs/article/the-nonprofit-lifecycle-a-model-for-making-smart-decisions/) · [NCN: How to Start a Nonprofit](https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit) · [Candid Learning: starting a nonprofit](https://learning.candid.org/starting-a-nonprofit/267834) · [W3C WAI: Grouping Controls](https://www.w3.org/WAI/tutorials/forms/grouping/) · [WebAIM WCAG 2 Checklist](https://webaim.org/standards/wcag/checklist)

---

## 4. On-Site Search + Interlinked Plain-English Glossary

**Why it moves 9 -> 10:** The hub has ~96 guides, 12 tools, 23 templates and a 43-funder directory, but no way to search across them and no canonical place to decode the jargon a guide assumes ("MTDC," "UBIT," "fiscal sponsorship," "de minimis rate"). Candid and the National Council of Nonprofits both treat a maintained glossary as core infrastructure, and Bloomerang/NonprofitReady lean on internal search to keep visitors inside the resource rather than bouncing to Google. Adding (a) zero-infrastructure client-side search and (b) a 100-term, anchor-addressable glossary that guides auto-link on first mention closes the two biggest "this is a real reference library, not a pile of articles" gaps — it raises findability, comprehension for under-resourced first-time founders, and topical authority (every guide gains contextual internal links to definitive definitions, and the glossary becomes a magnet for "what is X" / AI-answer queries via `DefinedTerm` schema). Both are free, static, and respect the no-custody / no-PII posture.

**Primary owner (human labor):** content writer (glossary definitions) + research (term sourcing/verification) · **Also needs:** development (Pagefind wiring + auto-link build step), design (search UI + glossary tooltip styling), QA
**Effort:** M (1-3 wks) · **Priority:** P1 · **Dependencies:** none hard; the glossary auto-link step should run as the *last* HTML transform before the SEO/citation gates so it doesn't fight them.

### Definition of done
1. A search box in the hub nav on every `/resources/**` page opens an instant, client-side, full-text search over all hub pages (guides, tools, templates index, funder directory, glossary). Results show title + context snippet + breadcrumb, keyboard-navigable, no network call to any server, total search payload well under ~300 kB for the current page count.
2. A glossary lives at `/resources/glossary/` with 100 terms (acceptable range 50-150), each a plain-English definition under its own stable `#anchor`, an A-Z jump index, "see also" cross-links, and (where a figure or legal rule is cited) a free-first Sources block with a `Last verified` date.
3. Across all English guides, the **first** in-body mention of any glossary term is auto-linked to its glossary anchor (e.g. `…the <a href="/resources/glossary/#mtdc">MTDC</a> base…`), capped to avoid link spam, never inside headings/answer-box/links/code.
4. The glossary page is in the sitemap, passes `check-seo.mjs` and `check-citations.mjs` unchanged, and carries `DefinedTermSet` + `BreadcrumbList` JSON-LD. Search is excluded from the sitemap/index as a UI surface, not a content page.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Build the term list (research)**
1. Assemble a master term list by reconciling three authoritative free glossaries so coverage is defensible, not invented:
   - **Candid** — *Glossary of nonprofit terms* (candid.org/resources/glossary-nonprofit-terms/) — the field-standard breadth (501(c)(3), Form 990, fiscal sponsor, endowment, in-kind, etc.).
   - **National Council of Nonprofits** — running-a-nonprofit articles for governance/compliance terms (fiscal sponsorship, charitable solicitation registration, conflict-of-interest policy).
   - **IRS + eCFR** for the technical tax/grants terms the others gloss over: UBIT (IRS Pub 598), **MTDC** and **de minimis indirect cost rate** (2 CFR 200.1 / 200.414), 509(a) public-support test, donor-advised fund.
2. Filter to ~100 terms by this rule: **include a term only if it already appears in, or is directly implied by, an existing hub guide.** Walk the 11 pillars and harvest jargon. This guarantees the auto-linker has real mentions to attach to and keeps the glossary on-mission rather than encyclopedic. Prioritize the high-confusion technical set: `501(c)(3)`, `509(a)(1)/(2) public charity`, `private foundation`, `fiscal sponsorship`, `fiscal agent` (and why it's the wrong term), `fund accounting`, `restricted / unrestricted / temporarily restricted net assets`, `MTDC`, `de minimis indirect cost rate`, `indirect cost rate (NICRA)`, `direct vs. indirect costs`, `UBIT / UBI`, `in-kind`, `matching / in-kind match`, `Form 990 / 990-EZ / 990-N`, `charitable solicitation registration`, `conflict-of-interest policy`, `DAF`, `endowment`, `operating reserve`, `LOI`, `logic model`, `theory of change`, `outcome vs. output`, `case for support`, `donor retention`, `lapsed donor`, `LYBUNT/SYBUNT`, `acknowledgment letter / quid pro quo`, `FLSA / exempt vs. non-exempt`, `worker classification (1099 vs. W-2)`, `fiduciary duty`, `L3C` (define it; relevant to the GC disclosure), etc.
3. Tag each term with: the pillar(s) it belongs to, 1-3 "see also" related terms, and whether the definition states a **figure or legal threshold** (e.g. de minimis = 15% of MTDC; $25k subaward cap inside MTDC; 990-N e-Postcard gross-receipts threshold). Flag those rows red — they need a source + date and must be reconciled with `figure-watchlist.mjs` before publishing (see Accuracy notes; the de minimis rate moved from 10% to 15% effective Oct 1, 2024, exactly the kind of figure the citation gate exists to catch).

**Phase B — Write the definitions (content)**
4. Write each definition to a fixed micro-template so they're scannable and AI-extractable:
   - **One-sentence plain answer** (no jargon; if you must use another glossary term, link it). 
   - **Why it matters to a small nonprofit** (1-2 sentences, concrete).
   - Optional **example** for the technical/number terms.
   - **See also:** 1-3 anchor links.
   - For figure-bearing terms only: a one-line **Source** (free-first authority, e.g. "2 CFR 200.414; IRS Pub 598") and a `Last verified YYYY-MM-DD`.
   - Plain-English bar: target ~8th-grade reading level; spell out every acronym on first use within its own entry.
5. Provide a short page intro (answer-box style) and an A-Z jump bar spec. Hand off as one structured file (Phase C).

**Phase C — Package for development**
6. Deliver the glossary as a single machine-readable file (JSON or a simple spreadsheet dev converts) using the schema below, plus the auto-link inclusion list (which term strings/aliases may be auto-linked and which must NOT, e.g. don't auto-link "board" everywhere). Deliver search copy strings (placeholder, "no results," result-count label) for the UI.

### Developer handoff package

**1. Glossary data structure** — staff submit `glossary.json`:
```json
{
  "terms": [
    {
      "id": "mtdc",
      "term": "MTDC (Modified Total Direct Costs)",
      "aliases": ["MTDC", "modified total direct costs"],
      "autolink": true,
      "pillars": ["grants", "operations"],
      "definition_html": "The cost base used to apply an indirect cost rate on a federal grant. It includes salaries, fringe, materials, supplies, services, travel, and up to the first $25,000 of each subaward, and <b>excludes</b> equipment, capital costs, and the portion of any subaward above $25,000.",
      "why_it_matters": "If you take the de minimis rate, MTDC is the number you multiply by — get the base wrong and your indirect recovery is wrong.",
      "see_also": ["de-minimis-rate", "indirect-cost-rate", "direct-vs-indirect-costs"],
      "source": "2 CFR 200.1",
      "verified_on": "2026-06-17"
    }
  ]
}
```
Dev renders this to `/resources/glossary/index.html` matching the existing page chrome exactly (same `<nav>`, `<footer>`, sharebar, fonts, `resources.css`, hero/crumb/answer/dateline pattern). Each term becomes `<h2 id="{id}">` so anchors are stable and addressable.

**2. URL / IA placement**
- Glossary page: `https://goodcircles.org/resources/glossary/` (new pillar-level card on the hub index: "Nonprofit Glossary — plain-English definitions"). Anchors: `/resources/glossary/#mtdc`.
- Search is a **UI overlay**, not a routed content page. Pagefind's index bundle lives at `/resources/pagefind/` (or `/pagefind/`), generated post-build; do **not** add a `/resources/search/index.html` content page (avoids a thin page the SEO gate would demand title/canonical/sitemap presence for).

**3. Search implementation (Pagefind, MIT, free, zero infra)**
- Add `pagefind` as a dev dependency. After the static `/resources/**` HTML is assembled into `dist/`, run `npx pagefind --site dist/resources` (or `--site dist` scoped via `data-pagefind-body` on the resource `<article>`/main region) to emit the static index + JS API + prebuilt UI. Wire this into `npm run build` **before** `check-seo.mjs`.
- Mark indexable content with Pagefind attributes: put `data-pagefind-body` on the main content wrapper and `data-pagefind-ignore` on nav/footer/sharebar/CTA so results aren't polluted by boilerplate. Use `data-pagefind-meta` to surface the pillar/breadcrumb in results.
- UI: a search input in the hub `<nav>` that lazy-loads `/resources/pagefind/pagefind-ui.js` on focus (keeps every page's critical payload unchanged). Use the prebuilt PagefindUI for v1; it's keyboard- and screen-reader-ready out of the box. Result item = title + highlighted snippet + sub-path breadcrumb.
- Because Pagefind only finds files it can crawl in `dist/`, confirm the glossary, tools, templates index, and funder directory pages are all present at build time so they're indexed.

**4. Glossary auto-linker (build step)**
- Add a Node post-process step (sibling to `check-seo.mjs`) that, for each English `/resources/**/index.html`, scans the visible body for the **first** occurrence of each `aliases` entry where `autolink:true` and wraps it in `<a class="gloss" href="/resources/glossary/#{id}">`. Rules the script MUST enforce (these keep the SEO gate green):
  - Skip text inside `<h1>`–`<h4>`, inside the `.answer` box, inside existing `<a>`, inside `<code>`/`<script>`/`<style>`, and inside FAQ question text (FAQPage questions must stay **verbatim** for `check-seo.mjs`; wrapping a word in an `<a>` changes the HTML but the gate checks the *visible text* contains the question string, so links inside answers are safe — links must still never break the `mainEntity[].name` strings, which are in JSON-LD and not transformed).
  - At most **one** auto-link per term per page (first mention only) and a hard cap of ~12 auto-links/page to avoid over-linking.
  - Never auto-link a term **on the glossary page itself** or on a page whose own subject *is* that term.
  - Run this step **before** the sitemap walk is irrelevant (sitemap is by file presence) but **before** `check-seo.mjs`/`check-citations.mjs` so the gate validates the final, linked HTML.
- Skip Spanish (`/es/`) pages in v1 (term aliases are English); the glossary is English-only v1 (note in roadmap: Spanish cornerstone parity later).

**5. Build-gate & SEO requirements the glossary page must satisfy** (reuse existing gate, no changes to the gate code):
- Exactly one non-empty `<h1>` ("Nonprofit Glossary").
- Non-empty `<title>` + meta description; `og:title === <title>`; absolute `og:image`.
- Absolute self-canonical in trailing-slash form: `https://goodcircles.org/resources/glossary/`.
- Valid JSON-LD: `DefinedTermSet` (with each term as a `DefinedTerm` `hasDefinedTerm` entry: `name`, `description`, `url` = the `#anchor`, `inDefinedTermSet`) + `BreadcrumbList`. **No `FAQPage`** on this page (it's not Q&A), so no verbatim-FAQ obligation.
- All internal links resolve; no `*.html` internal links (use `/resources/glossary/#id`, and cross-pillar see-also links to real pages only).
- In sitemap (the `astro.config.mjs` walker auto-adds it once `public/resources/glossary/index.html` exists — no config change needed).
- **Citation gate:** any term entry that uses the "Sources" standard must carry a `Last verified YYYY-MM-DD` stamp. Simplest compliant pattern: render a single page-level "Sources & tools" block listing the figure-bearing entries' authorities with one `Last verified` date — that satisfies `check-citations.mjs` and keeps per-term clutter down. Ensure no entry states a known-stale figure on the watch-list (see Accuracy).

**6. Interaction / UX behavior**
- Search: focus input → lazy-load Pagefind UI → type → debounced instant results; `Esc` closes; arrow keys move through results; `Enter` navigates. Empty query shows nothing or a few "popular guides." Works with JS only (acceptable for an enhancement); the nav link to `/resources/` is the no-JS fallback.
- Glossary: sticky A-Z jump bar; clicking a letter scrolls to that group; deep links (`#mtdc`) scroll-to and visually highlight the target term (CSS `:target`). "Back to top" after each letter group. Optional progressive enhancement: a small "filter terms" input that hides non-matching `<h2>` rows client-side (no Pagefind needed for in-page filter).
- Auto-link tooltips (optional, v1-nice-to-have): on hover/focus of a `.gloss` link, show the one-sentence definition in a CSS tooltip; must be keyboard-focusable and not trap focus.

**7. Acceptance criteria / QA checklist**
- [ ] Searching a term present only in one guide (e.g. "DIBELS", "case for support") returns that guide with a correct snippet and breadcrumb.
- [ ] Search returns the glossary entry when querying a defined term ("what is MTDC").
- [ ] No network request leaves the origin during search (verify in devtools; static bundle only).
- [ ] Search bundle + index total transfer for a full-hub query is < ~300 kB; per-page critical payload unchanged (UI lazy-loads on focus).
- [ ] `npm run build` passes: `check-seo.mjs` 0 issues, `check-citations.mjs` 0 issues, with the glossary page and auto-linker active.
- [ ] Glossary page: one H1, valid `DefinedTermSet`+`BreadcrumbList` JSON-LD (test in Google Rich Results), canonical/trailing-slash correct, in sitemap.
- [ ] Every `#anchor` is unique and resolves; every "see also" link points to an existing anchor/page.
- [ ] Auto-linker: at most one link per term per page; none in headings, answer box, FAQ question strings, or existing links; no page exceeds the per-page cap; glossary page itself is not self-linked.
- [ ] No figure in any entry matches a `figure-watchlist.mjs` stale pattern without also stating the current value.
- [ ] Keyboard-only user can open search, navigate results, open glossary, and follow an auto-link; visible focus states throughout.

### Accuracy, accessibility & compliance notes
- **Figures to verify (and keep in sync with `figure-watchlist.mjs`):** de minimis indirect cost rate = **15% of MTDC** (effective Oct 1, 2024 — *not* the old 10%); MTDC subaward inclusion = **first $25,000** of each subaward; Form 990-N e-Postcard gross-receipts threshold; 509(a)(1) public-support 1/3 test; standard mileage / acknowledgment ($250 written-acknowledgment) thresholds. Each figure-bearing entry must cite a primary free authority (eCFR 2 CFR Part 200, IRS pubs/instructions) and carry a `Last verified` date. **Add any new figure to the watch-list** so a future change fails the build instead of silently rotting.
- **Legal review:** definitions are educational, not advice — include the hub's standard "not legal/tax advice" line in the glossary intro. The `fiscal agent` vs `fiscal sponsor` and `L3C` entries should be reviewed for precision since they touch GC's own structure.
- **WCAG 2.1 AA:** search input needs a programmatic `<label>`; results list as an ARIA live region announcing result count; tooltips reachable by keyboard (focus, not hover-only) and dismissible (1.4.13); brand-color link/focus states must meet 4.5:1 contrast (verify Purple #7851A9 on white and the `.gloss` underline state); A-Z jump bar items are real links with visible focus; `:target` highlight must not rely on color alone (add a left border/weight change).
- **GC accuracy-contract compliance:** the glossary's `L3C` and any "Good Circles" mention must use the exact contract language — 10% of merchant **net profit** to the nonprofit, ~10% shopper savings (estimate), merchants keep **89%** on a **1%** fee, free for nonprofits, ~$72/active supporter/yr (estimate), no custody/money-transmitter posture. Reuse the existing single-CTA `gcbox`; do not invent new figures in definitions.
- **Privacy/no-PII:** Pagefind is fully client-side — no queries leave the browser, no analytics endpoint, no cookies. This is a feature; state "search runs entirely in your browser" if any UI copy mentions it. Nothing to add to the privacy policy.
- **Keeping it current:** quarterly review tied to the existing "Last verified" cadence; the citation gate already forces re-dating sourced pages. Glossary is data-driven (`glossary.json`), so adding/editing a term is a content edit, not a code change.

### Effort, cost & sequencing
- **Effort:** ~M (1-3 wks). Roughly: 6-9 days content (write/verify 100 definitions), 3-5 days dev (Pagefind wiring + UI, auto-linker script + tests, glossary page template + JSON-LD), 1-2 days QA/a11y. Term sourcing (Phase A) can start immediately and in parallel.
- **Third-party cost:** $0. Pagefind is free, MIT-licensed, self-hosted static (no Algolia/SaaS, no API keys, no per-seat cost), consistent with the lean posture. No new runtime dependencies ship to the browser beyond the lazy-loaded Pagefind bundle.
- **Sequencing:** P1 and a natural keystone — it multiplies the value of everything already built (findability over 96 guides) and every future guide auto-inherits glossary links and search indexing for free. Do it **before** further content expansion so new guides are written against an existing term set. The auto-linker and Pagefind steps slot cleanly into the current `npm run build` chain ahead of the two existing gates; no architectural change, no server, no new infra.

Sources: [Pagefind / Astro integration](https://github.com/shishkin/astro-pagefind), [Starlight site search (Pagefind)](https://starlight.astro.build/guides/site-search/), [Candid glossary of nonprofit terms](https://candid.org/resources/glossary-nonprofit-terms/), [National Council of Nonprofits — fiscal sponsorship](https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/fiscal-sponsorship-nonprofits), [schema.org DefinedTermSet](https://schema.org/DefinedTermSet), [eCFR 2 CFR 200.414 — indirect costs / de minimis](https://www.ecfr.gov/current/title-2/subtitle-A/chapter-II/part-200/subpart-E/subject-group-ECFRd93f2a98b1f6455/section-200.414)

---

## 5. Free Email Mini-Courses (Drip) — "Good Circles School" for Under-Resourced Nonprofits

**Why it moves 9 -> 10:** The hub today is a brilliant *reference library* — but reference libraries are pull-only; they wait to be found and rarely change behavior. The best-in-class players close that gap with structured, sequenced learning: Candid runs free on-demand *courses* and a dedicated startup-nonprofit track, Bloomerang Academy and NonprofitReady package knowledge into multi-lesson series, and Nolo/Propel guide founders step-by-step rather than article-by-article. Good Circles has ~96 guides, 12 tools, and 23 templates but no *spine* that walks an overwhelmed founder through them in order, with one action a day. Free email mini-courses add the one thing a static library structurally cannot: a relationship over time (the M+R 2025/2026 welcome-series benchmark is a ~1.6% CTR, roughly 3x ordinary sends, ~80% open on the first email), a re-engagement channel into the September 2026 launch, and a credibility signal that this hub teaches, not just hosts. It also makes the existing in-house email engine *earn its keep* with zero new third-party cost.

**Primary owner (human labor):** content writer · **Also needs:** marketing (signup placement + lifecycle copy), development (sequence scheduler + signup endpoint), QA
**Effort:** M (1–3 wks) · **Priority:** P1 · **Dependencies:** Existing `emailCampaignService` (campaign/recipient model, suppression, unsubscribe, scheduling, daily ceiling) is built; the ~96 published guides + 12 tools + 23 templates are the source content; a CAN-SPAM physical address (`EMAIL_PHYSICAL_ADDRESS`) must be configured before any course email sends (already a hard pre-flight gate in the engine).

### Definition of done
Three free, evergreen email mini-courses — **"Start a Nonprofit in 30 Days"** (daily, 12 lessons over ~30 days, paced), **"Get Grant-Ready in 6 Weeks"** (weekly, 6 lessons), and **"Build a Recurring Funding Base"** (weekly, 5 lessons) — each launchable by a non-developer with no code. A visitor enters their email on a course landing page (or an inline block on a relevant guide), receives an immediate Lesson 0 confirmation, then receives one lesson per cadence step, each repackaging existing hub guides/tools/templates into a single 5–10 minute read with exactly **one action**. Sequences run entirely on the in-house engine (campaign/recipient model, suppression, signed unsubscribe, daily ceiling, Resend delivery tracking). Each course ends with a single Good Circles CTA. Enrollment, lesson-by-lesson delivery, opens/clicks, and unsubscribes are visible in the existing admin Campaigns dashboard. The three course landing pages pass the existing `check-seo.mjs` and `check-citations.mjs` build gate.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Benchmark & decide structure (research, ~1 day)**
1. Skim how the authorities sequence free learning so the courses match category expectations: **Candid's startup-nonprofit resource track** (learning.candid.org — its course catalog and "resources for nonprofits"), **Bloomerang's learning/Academy** structure, **NonprofitReady** course lengths, **Nolo's** "how to form a nonprofit" step list, and **National Council of Nonprofits** startup checklist. Note: they teach in *ordered steps with one outcome each* — mirror that.
2. Lock cadence and length against the email benchmarks already gathered: **daily lessons for "30 Days" (paced to ~12 sends, not 30 — avoid fatigue), weekly for the other two.** Keep each course ≤ 12 emails (M+R: a subscriber already gets ~50 nonprofit emails/year; don't overload). Target a 5–10 minute read per lesson (longer than that and it's a course body, not a lesson — link to the full guide for depth).

**Phase B — Map every lesson to an EXISTING asset (content, ~2–3 days)**
3. For each course, build a lesson map: each lesson = {subject line, 120–180 word teaching summary, the ONE action, and the existing guide/tool/template it links to}. **Do not write new long-form content** — every lesson is a *repackage* of a published hub asset. Use the live URLs under `/resources/`. Suggested maps:

   **Course 1 — "Start a Nonprofit in 30 Days" (12 lessons, daily-paced):**
   1. Is a nonprofit right for you? → `start-a-nonprofit` pillar intro · *Action: write your one-sentence mission.*
   2. Mission & need → `program-design/theory-of-change` · *Action: draft a one-line theory of change.*
   3. Pick your structure & state → `start-a-nonprofit` + `governance-compliance` · *Action: confirm your state's incorporation portal.*
   4. Incorporate → state-incorporation guide · *Action: reserve your name / file articles.*
   5. Board basics → governance guide · *Action: list 3 prospective board members.*
   6. Bylaws & EIN → governance/compliance · *Action: get your EIN (free, IRS).*
   7. 501(c)(3) — 1023 vs 1023-EZ → start-a-nonprofit guide · *Action: check 1023-EZ eligibility.*
   8. State charitable registration → `start-a-nonprofit/state-charitable-registration` · *Action: check if your state requires it.*
   9. Bank account & bookkeeping → operations/`functional-expense-allocation` + the **Functional Expense Allocator tool** · *Action: open a nonprofit bank account.*
   10. Your first funding mix → `fundraising/the-funding-mix` · *Action: pick 2 starter revenue lines.*
   11. Free/discounted software → `operations/free-and-discounted-software-for-nonprofits` · *Action: apply for one nonprofit discount.*
   12. Recurring funding from day one → `passive-funding` pillar + **Passive Funding Calculator** → **Good Circles CTA.**

   **Course 2 — "Get Grant-Ready in 6 Weeks" (6 lessons, weekly):**
   1. Why diversified orgs win grants → `grants/why-diversified-nonprofits-win-grants` · *Action: list your current revenue lines.*
   2. Find free funders → `grants/funder-directory` (the 43-funder directory + free discovery databases) · *Action: shortlist 5 funders.*
   3. Design a grant-ready program → `program-design/designing-grant-ready-programs` · *Action: write your program's outcome statement.*
   4. Measure outcomes → `program-design/how-to-measure-outcomes` + `program-evaluation-basics` · *Action: pick 2 outcome metrics.*
   5. Budget & functional expenses → **Functional Expense Allocator tool** + template · *Action: build a one-page project budget.*
   6. Impact reporting + don't depend on grants → `impact-reporting` + `passive-funding` → **Good Circles CTA.**

   **Course 3 — "Build a Recurring Funding Base" (5 lessons, weekly):**
   1. The funding mix & why recurring wins → `fundraising/the-funding-mix` + `fundraising/monthly-recurring-giving` · *Action: calculate your current % of recurring revenue.*
   2. Monthly individual giving → `fundraising/individual-giving-basics` + `donor-development/donor-acquisition` · *Action: set a monthly-donor goal.*
   3. Keep the donors you have → `donor-development/moves-management` + `lapsed-donor-reactivation` · *Action: list 5 lapsed donors to re-contact.*
   4. Passive fundraising explained → `passive-funding/passive-fundraising-explained` + **Passive Funding Calculator** · *Action: run your number in the calculator.*
   5. Set up a no-ask recurring base → `passive-funding/supporter-enrollment-playbook` + `good-circles-onboarding-checklist` → **Good Circles CTA.**

4. Write each lesson body in the established hub voice (plain, peer-to-peer, specific, no "give back" guilt language per CLAUDE.md §3). Reuse the brand tokens (Purple #7851A9, Ink, Gold) — the email layout already renders these.
5. Write a **Lesson 0** for each course: immediate confirmation ("You're enrolled — here's what's coming and when"), sets expectations (N lessons, cadence), and links Lesson 1. This is the welcome email that earns the ~80% open.
6. For the final lesson of each course, use the single Good Circles CTA, with the exact accuracy-contract language: nonprofits join free; ~$72/active supporter/yr (estimate); 10% of merchant **net profit**; ~10% shopper savings (estimate). No other figures without a verified-on date.

**Phase C — Signup placement (marketing, ~1 day)**
7. Specify three placements (no new design system — reuse the existing inline-CTA / `RequestCityForm` form pattern):
   - **A dedicated `/resources/courses/` index** listing all three courses (card per course: title, what you'll learn, cadence, "Start free").
   - **One landing page per course** (`/resources/courses/start-a-nonprofit-in-30-days/` etc.) with the lesson outline, a 1-field email form, and the "free / unsubscribe anytime" microcopy.
   - **Contextual inline blocks** on the most relevant pillar pages: Course 1 on the `start-a-nonprofit` pillar, Course 2 on the `grants` pillar and `funder-directory`, Course 3 on the `passive-funding` and `fundraising` pillars. Place after the article body, before the existing single GC CTA (don't compete with it — the course *is* a softer first step toward it).

### Developer handoff package

**Content/data structure (course + lesson definitions — static data, in-repo):**
A new `marketing/src/data/courses.ts` (mirrors the existing `learn.ts` pattern) plus a server-side sequence definition the engine reads. Example record:
```ts
// marketing/src/data/courses.ts  (drives landing pages + signup)
{
  slug: "start-a-nonprofit-in-30-days",
  title: "Start a Nonprofit in 30 Days",
  cadence: "daily",              // daily | weekly  (for the landing-page copy)
  lessonCount: 12,
  summary: "One short lesson and one action a day...",
  outline: [ { n: 1, title: "Is a nonprofit right for you?", links: ["/resources/start-a-nonprofit/"] }, ... ],
  ctaSlug: "for-nonprofits"
}
```
```ts
// server: sequence definition (drives the drip; lessons are EmailTemplate rows or inline blocks)
EmailSequence {
  id, key: "start-a-nonprofit-30d",
  status: "ACTIVE",
  steps: [ { order: 0, delayDays: 0, templateKey: "san-l0" },
           { order: 1, delayDays: 1, templateKey: "san-l1" }, ... ]   // delayDays relative to enrollment
}
EmailSequenceEnrollment {
  id, sequenceKey, emailAddress, firstName?, status: "ACTIVE|COMPLETED|UNSUBSCRIBED",
  enrolledAt, nextStepOrder, nextSendAt
}
```
Each lesson is stored as an `EmailTemplate` (the model already exists: `subject`, `bodyHtml`, `category`, `layoutVariant: MARKETING`, `defaultAccentRole: NONPROFIT`). Each lesson send is a `type: AUTOMATED` `EmailCampaign` of size 1 with `triggerSource: "SEQUENCE:<key>:<order>"` so it joins the existing dashboard/tracking with no new reporting code.

**The automation requirement (the one real dev addition):** there is currently **no worker that fires `SCHEDULED` campaigns at their due time** — the engine sends now or marks `SCHEDULED`. The drip needs a lightweight, idempotent **sequence tick**: a single function `processDueSequenceSteps()` that selects `EmailSequenceEnrollment` rows where `status=ACTIVE AND nextSendAt <= now()`, for each: skip-and-mark `UNSUBSCRIBED` if the address is in `EmailSuppression`/`EmailUnsubscribe` (reuse `isSuppressed`), else render the step template and send via the existing `recordSend` → `transport` → `finalizeSend` path (so suppression, daily ceiling, and Resend tracking all apply unchanged), then advance `nextStepOrder`/`nextSendAt` or set `COMPLETED` on the last step. Run it on a schedule — cheapest options, in order: (a) a `node-cron` job in the existing Express process firing hourly; (b) a Railway cron; (c) an external uptime-ping hitting an authenticated `POST /api/email/sequences/tick`. Must be idempotent (advance pointer in the same transaction as the send-record) so a double-fire never double-sends. Enrollment endpoint: `POST /api/email/sequences/:key/enroll { email, firstName? }` — public, rate-limited (reuse `submitLimiter`), creates the enrollment with `nextSendAt = now()` (Lesson 0 immediate), idempotent on `(sequenceKey, emailAddress)`.

**URL(s) / placement in the IA:**
- `/resources/courses/` — index (in nav under Resources hub)
- `/resources/courses/start-a-nonprofit-in-30-days/`
- `/resources/courses/get-grant-ready-in-6-weeks/`
- `/resources/courses/build-a-recurring-funding-base/`
- Inline signup blocks on the pillar pages named in Phase C.

**Build-gate & SEO requirements (must pass existing `check-seo.mjs` + `check-citations.mjs`):**
- Exactly one `<h1>` per landing page (the course title).
- `<title>`, meta description; absolute self-canonical with trailing slash; `og:title === <title>`.
- Each landing page: `Course` JSON-LD (schema.org/Course with `provider: Organization Good Circles`, `hasCourseInstance` describing the free email delivery, `offers price:0`) **and** `BreadcrumbList` JSON-LD — both must be valid (the gate parses JSON-LD).
- If a course landing page uses an FAQ, the FAQ questions must appear **verbatim** in visible text (FAQPage rule). Recommended FAQ: "Is it really free?", "How many emails will I get?", "Can I unsubscribe?" — keeps the gate happy and answers the real objections.
- Any benchmark figure cited in copy (e.g., the M+R welcome-series stat) needs a **"Last verified" date** or the `check-citations.mjs` gate fails — prefer keeping the landing pages **non-sourced** (no external stats) so this is a non-issue; put any stats only in the internal lesson bodies, not the gated static pages.
- All three landing pages in `sitemap.xml`; sitemap↔noindex consistent; no internal `.html` links; all internal links resolve (every guide/tool/template a lesson links to must be a live URL — verify against the published `/resources/` set).

**Interaction / UX behavior:**
- 1-field email form (name optional) → `POST .../enroll` → inline success state ("You're in. Lesson 0 is on its way — check your inbox.") modeled on `RequestCityForm`'s done-state.
- No account, no password, no PII beyond email (+ optional first name) — preserves the no-unnecessary-PII posture.
- Every lesson email carries the signed unsubscribe link (engine already appends it for MARKETING layout); unsubscribing or hard-bouncing halts the sequence (suppression checked each tick).
- Lesson 0 fires immediately on enroll; subsequent lessons fire on the cadence (daily-paced / weekly) from enrollment date.

**Acceptance criteria / QA checklist:**
- [ ] Enrolling on each landing page sends Lesson 0 within ~1 minute; success state renders.
- [ ] Lessons arrive on cadence, in order, one per step; last lesson contains exactly one GC CTA with correct accuracy-contract numbers.
- [ ] Unsubscribing (or a hard bounce/complaint) stops all further lessons for that address; the address is in `EmailUnsubscribe`/`EmailSuppression`.
- [ ] Double-enrolling the same email does not create a second parallel sequence and does not double-send.
- [ ] The sequence tick is idempotent: running it twice in a row sends each due lesson once.
- [ ] Each lesson appears in the admin Campaigns dashboard as an `AUTOMATED` campaign with `triggerSource: SEQUENCE:<key>:<order>`; opens/clicks/bounces track via Resend webhook.
- [ ] All three landing pages pass `npm run` build gate (`check-seo.mjs` + `check-citations.mjs`) with zero errors.
- [ ] Every guide/tool/template URL referenced in every lesson resolves (no 404s).
- [ ] No course email sends if `EMAIL_PHYSICAL_ADDRESS` is unset (CAN-SPAM pre-flight blocks it).
- [ ] Daily ceiling (`EMAIL_DAILY_CEILING`) is respected; a backlog spreads across days rather than failing or overspending.

### Accuracy, accessibility & compliance notes
- **Figures to verify:** the only stat in *gated* pages should be none — keep external benchmarks out of the static landing pages (or stamp a verified-on date). In lesson bodies, the Good Circles claims must use the locked accuracy contract: free for nonprofits; **10% of merchant NET PROFIT**; ~10% shopper savings (estimate, always "~"/"about"); ~$72/active supporter/yr (estimate); merchants keep 89% on a 1% fee. No money custody implied anywhere.
- **Legal/compliance:** CAN-SPAM is the controlling regime (US-only audience). These are marketing emails, so they require the working unsubscribe (engine provides it) **and** a physical postal address — `EMAIL_PHYSICAL_ADDRESS` must be configured first (a cheap P.O. box / virtual mailbox per the email-client plan). **Double opt-in is not legally required** under CAN-SPAM (single opt-in is fine and maximizes the ~30–60% squeeze-page conversion); a confirmation-style Lesson 0 gives most of the deliverability/list-hygiene benefit of double opt-in without the conversion drop. No personal Family First email anywhere — `hello@goodcircles.org` is the from-alias (already a documented sender alias). No PII beyond email + optional first name.
- **WCAG 2.1 AA:** landing-page form inputs need visible labels / `aria-label` (the existing form pattern already does this), 4.5:1 contrast (brand tokens already meet this on white), focus-visible states (existing form has focus rings), and the email body templates need a plain-text alt + meaningful link text (not "click here"). Don't rely on color alone to mark the "one action."
- **Keeping it current:** lessons link to live guides rather than duplicating them, so guide updates propagate automatically. Add a quarterly review step to the editorial calendar: confirm every lesson's linked URL still resolves and the guide's advice hasn't changed materially. Because lessons are `EmailTemplate` rows, edits are made in the admin, no redeploy.

### Effort, cost & sequencing
- **Effort:** M (1–3 weeks). Content (lesson maps + bodies for ~23 total lessons, all repackaged from existing assets): ~2–3 days writing. Dev: the sequence schema + idempotent tick + enroll endpoint is the only net-new code (~3–5 days); the send path, suppression, unsubscribe, tracking, daily ceiling, and dashboard already exist. Landing pages reuse the `learn.ts`/CTA patterns (~1–2 days). QA ~1 day.
- **Cost:** $0 incremental beyond what's already planned — runs on the in-house engine and **Resend free tier** (100/day, 3,000/mo), which comfortably covers drip volume at pre-launch scale (the daily ceiling spreads any spike). The one prerequisite cost is the CAN-SPAM **P.O. box / virtual mailbox** (already required for any marketing send, not unique to this).
- **Sequencing:** Build **after** the email engine's E1–E4 (layout, campaign model, mass send, CAN-SPAM footer) are live — which they are — and **after** `EMAIL_PHYSICAL_ADDRESS` is set. It pairs naturally with the funder-directory and passive-funding pillars (Courses 2 and 3 funnel straight into them), and it doubles as a pre-launch nurture channel into the September 2026 Mississippi launch — making it a high-leverage P1 relative to purely static additions.

**Sources:** [M+R Benchmarks 2026 — Email Messaging](https://mrbenchmarks.com/email-messaging/) · [Nonprofit Tech for Good — 2026 Email Stats](https://www.nptechforgood.com/101-best-practices/email-marketing-statistics-for-nonprofits/) · [Candid — startup nonprofit learning resources](https://learning.candid.org/page/nonprofit-resources) · [Bloomerang Learning](https://bloomerang.com/experience/learning) · [EmailOctopus — email course as a lead magnet](https://emailoctopus.com/blog/how-to-create-an-email-course) · [EmailToolTester — is double opt-in required](https://www.emailtooltester.com/en/blog/is-double-opt-in-required/) · [Leadpages — lead-magnet landing pages (conversion)](https://leadpages.com/lead-generation-guide/lead-magnet-landing-page-examples)

---

## 6. Deeper & Broader Localization: A Full Multilingual Hub (Spanish-complete + Vietnamese), Localized Tools, and a Language Switcher

**Why it moves 9 -> 10:** Today the hub localizes 20 cornerstone *guides* into Spanish, but its 12 interactive tools, top templates, and pillar landing pages are English-only, and there is no way for a Spanish speaker to *discover* the es content (no switcher, no localized hub index). That is exactly where the "best in class" resources stop too: Candid and the National Council of Nonprofits offer only scattered Spanish PDFs, Bloomerang publishes *English* advice *about* reaching Spanish speakers, and Propel/Nolo offer "language assistance on request" rather than a parallel, QA'd resource set ([NCN](https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit), [Bloomerang](https://bloomerang.co/blog/diversifying-your-communication-how-nonprofits-can-connect-with-spanish-speaking-communities/), [Propel](https://propelnonprofits.org/contact/)). Shipping the first *fully localized, native-reviewed nonprofit toolkit* — where a Spanish- or Vietnamese-speaking founder can run a 501(h) calculator and download a board matrix in their own language, reached via a one-tap switcher — is a genuine above-and-beyond differentiator no competitor matches, and it directly serves the 29.6M U.S. residents with limited English proficiency ([Census ACS 2023 via Slator](https://slator.com/number-non-english-speaking-households-continues-to-rise-united-states/)).

**Primary owner (human labor):** content writer · **Also needs:** research, QA (native-speaker reviewers), development, design
**Effort:** L (1–2 mo) · **Priority:** P2 · **Dependencies:** existing es cornerstones (translation memory/glossary source); build gates (check-seo.mjs, check-citations.mjs) must learn a few multilingual rules first

### Definition of done
- **Spanish completeness:** the 12 tools, the 11 pillar landing pages, the `/resources/` hub index, and the 8 highest-traffic templates each have a published `es/` counterpart with bidirectional hreflang, matching the existing `{path}/es/index.html` convention. Tool *UI strings* (labels, buttons, result sentences, share bar) render in Spanish; the math is unchanged and shares the same code.
- **Second language (Vietnamese, `vi`):** the 8 most-foundational guides (the "first-90-days" set: how-to-start, 501(c)(3), bylaws, board, budgeting, find-grants, individual-giving, passive-fundraising-explained), the hub index, and the `start-a-nonprofit` pillar page are published in `vi/` with full hreflang.
- **Language switcher:** a persistent control in the `.nav` of every resources page lets a visitor jump to the same page in any available language; if a translation does not exist for that page, the switcher offers the localized *pillar/hub* fallback instead of a 404.
- **QA:** every published non-English page has passed a documented two-pass native-speaker review (translate/post-edit → independent native reviewer sign-off) logged in a tracker, and carries `Verificado por última vez` / `Đã xác minh lần cuối` dated stamps where sourced.
- **Gates green:** `npm run build` passes check-seo.mjs and check-citations.mjs with the new pages, including extended hreflang/FAQ-verbatim rules below.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Justify and lock the language pick (research, ~2 days)**
1. Pull the language data. Spanish is the runaway #1 non-English language (~45M speakers); after it, the largest U.S. home languages are **Chinese (~3.7M), Tagalog (~1.9M), and Vietnamese (~1.6M)** ([Census ACS via mentalfloss](https://www.mentalfloss.com/geography/maps/americas-most-spoken-languages-other-than-english-spanish-by-state); [Wikipedia: Languages of the US](https://en.wikipedia.org/wiki/Languages_of_the_United_States)). Of ~68M who speak another language at home, **29.6M are limited-English-proficient** ([Slator/Census 2023](https://slator.com/number-non-english-speaking-households-continues-to-rise-united-states/)).
2. **Recommend Vietnamese as the second language** and write a one-paragraph justification: (a) Vietnamese-speaking communities have a high LEP rate and a dense ecosystem of immigrant-founded mutual-aid and faith nonprofits that are exactly Good Circles' under-resourced target; (b) unlike Chinese, Vietnamese uses Latin script with diacritics, so it reuses the existing Montserrat/Fira Sans stack and the same `{path}/vi/` URL pattern with no font/RTL work — a deliberate low-cost, high-impact pick that respects the lean architecture. Note Simplified Chinese (`zh-Hans`) as the documented Phase-2 candidate (larger population, but needs a CJK web font and a separate cost line), so the choice is defensible, not arbitrary.
3. Cross-check against Mississippi-first reality: confirm with one sentence that Spanish is the dominant local LEP language and Vietnamese has a real Gulf-Coast presence, so the pick serves the launch market, not just national vanity.

**Phase B — Build the translation kit (content writer, ~3 days)**
4. Extract a **bilingual glossary** from the 20 existing es cornerstones: lock canonical Spanish for every recurring term (e.g., *estatutos* = bylaws, *acta constitutiva* = articles of incorporation, *junta directiva* = board, *Fuentes y herramientas* = Sources & tools, *Verificado por última vez* = Last verified). This guarantees the new es pages match the voice already shipped. Store it as a simple two-column sheet.
5. Lock the **GC accuracy-contract phrasing** in each language as fixed strings (do NOT let translators paraphrase the numbers): 10% of merchant **net profit** to the nonprofit; ~10% shopper savings (estimate); merchants keep 89% on a 1% fee; free for nonprofits; ~$72/active supporter/yr (estimate); no custody of funds. Pre-approve these so every page is identical and compliant.
6. Build a **UI-string table for the 12 tools**: list every visible English string per tool (field labels, the `.sub` hints, button text like "Copy link", status words like *Strong/Adequate/Thin*, and the result-sentence templates assembled in JS) with a column for `es` and a column for `vi`. This is the single artifact dev needs to localize the tools without touching math.

**Phase C — Translate with a cost-controlled MTPE + native-review workflow (content + QA, the bulk)**
7. For each page, produce a first draft with **machine-translation-then-post-edit (MTPE)** against the glossary. Industry MTPE runs $0.05–$0.15/word vs. $0.15–$0.30 for full human translation ([Ulatus](https://www.ulatus.com/translation-blog/how-much-does-translation-cost-in-2025/); [Artlangs](https://artlangs.com/news-detail/MTPE-Rates-2025--Cost-Effective-Translation-for-High-Volumes)); a fluent staffer can self-MTPE Spanish for $0. Treat MTPE as the *draft*, never the published artifact (ISO 18587 makes human post-editing mandatory for publish-quality output).
8. **Two-pass native-speaker QA — the credibility step.** Pass 1: the post-editor (native or near-native) edits for accuracy, the glossary, and the locked GC numbers. Pass 2: an **independent native speaker** who did not draft the page reviews for fluency, false friends, and that every FAQ question/answer reads naturally — because the build gate requires FAQ question text to appear **verbatim** in the visible page, the reviewer must sign off on the *exact* FAQ strings. Recruit reviewers free/low-cost via partner immigrant-serving nonprofits, bilingual board members, or a vetted volunteer; budget a small stipend only if needed.
9. Log every page in a **translation tracker** (page URL, language, MTPE done, reviewer 1, reviewer 2, sign-off date, verified-on date). The tracker is the audit trail that makes the multilingual claim defensible the same way check-citations.mjs makes the figure claim defensible.
10. Localize the **top 8 templates**: translate the in-document headings/instructions and the filename suffix (e.g., `-es`, `-vi`); keep one English master so structure never drifts.

**Phase D — Spec the IA and switcher (content + design, ~2 days)**
11. Write the **language-switcher rule** in plain language for dev (see handoff). Specify the fallback behavior: never 404; degrade to the localized pillar, then the localized hub index.
12. Produce a localized **hub index and 11 pillar pages** per language (Spanish full; Vietnamese: hub + start-a-nonprofit pillar minimum), each linking only to pages that actually exist in that language, so no dead links ship.

### Developer handoff package

**Content/data structure**
- **Page convention (unchanged):** every translation is `public/resources/{path}/{lang}/index.html`, mirroring the live es pattern (e.g., `…/tools/operating-reserve-calculator/es/index.html`). `lang` ∈ `es`, `vi`.
- **Tool UI-strings JSON** (staffer delivers one file per tool, dev wires it in). Example record:
```json
{
  "tool": "operating-reserve-calculator",
  "strings": {
    "field_expenses": { "en": "Annual operating expenses", "es": "Gastos operativos anuales", "vi": "Chi phí hoạt động hàng năm" },
    "status_strong":  { "en": "Strong", "es": "Sólido", "vi": "Vững mạnh" },
    "result_template": {
      "en": "Your reserve of {res} covers about {months} months…",
      "es": "Tu reserva de {res} cubre alrededor de {months} meses…",
      "vi": "Khoản dự trữ {res} của bạn trang trải khoảng {months} tháng…"
    }
  }
}
```
  The localized tool page reuses the **identical calculation script**; only the string table and number/locale formatting differ (use the page's locale for `toLocaleString`; keep `$`/USD).
- **Per-page head block** must replicate the existing es head exactly: `<html lang="{lang}">`, localized `<title>`/meta/og, `og:locale` (`es_ES`, `vi_VN`), localized JSON-LD with `"inLanguage":"{lang}"`, and a **complete hreflang cluster** listing *every* available language for that page plus `en` and `x-default`→English. Self-referencing required.

**URL(s) / placement in the IA**
- Switcher lives in `.nav` `.links` on every resources page. Hub index gains a localized index at `/resources/es/` and `/resources/vi/`; pillar pages at `/resources/{pillar}/es/` and `…/vi/`.
- `x-default` always points to the English URL (Google's recommended neutral fallback) ([Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)).

**Build-gate & SEO requirements** (must pass existing gates + these additions)
- Single non-empty `<h1>`; localized `<title>` + meta description; absolute self-canonical in **trailing-slash** form (`…/es/`); `og:title === <title>`; absolute `og:image`; all JSON-LD parses; in sitemap (the config's `collectResourceUrls()` already walks every `index.html`, so new `es/`/`vi/` pages auto-enter the sitemap — verify).
- **FAQ-verbatim:** if the page uses FAQPage schema, each translated `Question.name` must appear character-for-character in the visible localized HTML (this is why Phase-C reviewer signs off on FAQ strings).
- **Sources + date:** sourced pages must carry the localized "Sources & tools" heading and a dated stamp. Extend check-citations.mjs to accept the Vietnamese heading/stamp the same way it already accepts `Fuentes y herramientas` + `Verificado por última vez`.
- **New hreflang gate (add to check-seo.mjs):** for any page with `hreflang` tags, assert (1) a self-referencing tag exists, (2) every referenced URL resolves to a built file, and (3) the cluster is **bidirectional** (if A lists B, B lists A). This prevents the single most common failure mode — studies find ~75% of hreflang implementations are broken, and one bad URL voids the whole cluster ([digitalapplied](https://www.digitalapplied.com/blog/international-seo-hreflang-multilingual-guide)).

**Interaction / UX behavior**
- Switcher: a small dropdown/`<details>` in `.nav` showing language names in their *own* language (English · Español · Tiếng Việt), current language marked. Each option links to the same page's `{lang}/` URL **only if it exists**; otherwise to that language's pillar, else its hub index. No JS framework — a static per-page `<details>` menu keeps it inside the no-build-tool static bundle.
- Tools: changing language is a full navigation to the localized page (no client-side i18n runtime); accept the small duplication to preserve the static, dependency-free posture.

**Acceptance criteria / QA checklist**
- [ ] `npm run build` passes check-seo.mjs and check-citations.mjs with all new pages.
- [ ] Every new page validates: 1 H1, canonical trailing-slash self-ref, og:title===title, valid JSON-LD with correct `inLanguage`.
- [ ] hreflang clusters are bidirectional and self-referencing; every alternate URL resolves; `x-default`→English.
- [ ] All 12 tools render fully localized UI in `es` and produce numerically identical results to the English tool for the same inputs.
- [ ] FAQ question strings appear verbatim in visible text on every localized FAQ page.
- [ ] Language switcher present on every resources page; selecting an unavailable translation lands on a localized fallback, never a 404.
- [ ] Every published non-English page has two logged native-reviewer sign-offs in the tracker.
- [ ] Localized hub/pillar pages contain zero links to non-existent translations.
- [ ] No new external runtime dependency; Vietnamese renders correctly in the existing Fira Sans/Montserrat stack (diacritics intact).

### Accuracy, accessibility & compliance notes
- **Figures to verify:** the GC accuracy-contract numbers (10% net profit, 89%/1%, ~10% savings est., ~$72/yr est., free for nonprofits, no custody) must match the English canonical word-for-word in each language — pre-translated and locked, not paraphrased. Any sourced page inherits the same `Last verified` discipline via localized stamps.
- **Legal/compliance:** no new legal review needed (content is informational and mirrors approved English); reaffirm the money-transmitter-avoidance language ("no custody of funds") is present and unambiguous in each translation, and that no personal/Family-First email appears — goodcircles.org aliases only.
- **WCAG 2.1 AA:** correct `lang` attribute per page (already in the es pattern) is itself a 3.1.1/3.1.2 requirement; ensure the switcher is keyboard-operable, has an accessible name, and that language options are programmatically labeled with `lang` on each option; maintain the brand-token contrast (Purple #7851A9 on white passes; verify any new status colors).
- **Keeping current:** when an English guide's figures or `Last verified` date change, the tracker flags its `es`/`vi` siblings as stale; the localized verified-on stamp must be re-dated and re-reviewed. The bidirectional-hreflang gate guarantees that adding/removing a translation can't silently break the cluster.

### Effort, cost & sequencing
- **Effort:** L (1–2 months) — Spanish completion is the larger lift (12 tools' UI + 11 pillars + hub + 8 templates); Vietnamese is intentionally scoped to the 8-guide "first-90-days" set + hub/pillar to prove the second-language pipeline without ballooning cost.
- **Cost:** near-$0 if Spanish is staff-MTPE'd and Vietnamese review is sourced through a partner nonprofit or bilingual volunteer; otherwise budget MTPE at ~$0.05–$0.15/word for Vietnamese drafting plus a modest native-reviewer stipend ([Ulatus](https://www.ulatus.com/translation-blog/how-much-does-translation-cost-in-2025/)). No third-party SaaS, no new build tooling — fits the static-site + strict-gate architecture.
- **Sequencing:** do this **after** any improvement that changes guide *content or figures* (translate stable text once, not twice), and **after** the hreflang/citation gate extensions land (small dev task that must precede bulk page creation so errors are caught from page one). It pairs naturally with the existing es cornerstones, which serve as the translation memory and voice reference.

Sources: [NCN how-to-start](https://www.councilofnonprofits.org/running-nonprofit/how-start-nonprofit) · [Bloomerang on Spanish-speaking communities](https://bloomerang.co/blog/diversifying-your-communication-how-nonprofits-can-connect-with-spanish-speaking-communities/) · [Propel language assistance](https://propelnonprofits.org/contact/) · [Census ACS 2023 / Slator LEP data](https://slator.com/number-non-english-speaking-households-continues-to-rise-united-states/) · [Languages of the US](https://en.wikipedia.org/wiki/Languages_of_the_United_States) · [Most-spoken non-English languages by state](https://www.mentalfloss.com/geography/maps/americas-most-spoken-languages-other-than-english-spanish-by-state) · [Google Search Central: localized versions / x-default](https://developers.google.com/search/docs/specialty/international/localized-versions) · [hreflang error rate & best practice](https://www.digitalapplied.com/blog/international-seo-hreflang-multilingual-guide) · [MTPE rates 2025 (Ulatus)](https://www.ulatus.com/translation-blog/how-much-does-translation-cost-in-2025/) · [MTPE rates / ISO 18587 (Artlangs)](https://artlangs.com/news-detail/MTPE-Rates-2025--Cost-Effective-Translation-for-High-Volumes)

---

## 7. Accessibility Audit & Remediation of the Hub + Plain-Language Pass (Practice What the WCAG Guide Preaches)

**Why it moves 9 -> 10:** The hub *publishes* a guide telling nonprofits how to be WCAG-compliant and plain-spoken, yet the hub itself has never been formally audited — and a quick code/contrast review already surfaces real AA failures (gold `#C2A76F` on purple `#7851A9` = 2.55:1; `.gcbox` body copy `#e7daf5` on purple = 4.44:1; hand-authored `/resources/` pages ship with no skip-link or `<main>` landmark and non-semantic `javascript:void(0)` share "buttons"). Candid, the National Council of Nonprofits, and NonprofitReady all run on platforms with published accessibility statements and conformance baselines; Bloomerang and Propel write at a deliberately low reading grade to serve overwhelmed, time-poor staff. Closing this gap converts a credibility liability ("do as we say, not as we do") into a proof point — a hub that is *demonstrably* AA-conformant and readable at ~8th grade genuinely serves low-literacy, ESL, disabled, low-bandwidth, and mobile-only users, who are over-represented in the under-resourced communities Good Circles exists to serve. It also bakes accessibility and readability into the existing build gate so the hub *stays* a 10/10 as it grows past 96 guides.

**Primary owner (human labor):** QA (audit lead) + content writer (plain-language pass) · **Also needs:** development (remediation + new gate checks), design (token/contrast fixes)
**Effort:** L (1-2 mo) · **Priority:** P1 · **Dependencies:** Stable hub HTML (no in-flight redesign); access to the `marketing/` repo and the existing `scripts/check-seo.mjs` + `scripts/check-citations.mjs` gate; one Windows machine (NVDA) and one Mac/iOS device (VoiceOver) for screen-reader passes.

### Definition of done
1. **Audit complete and recorded:** Every *template* of page on the hub (hub index, a pillar index, an in-depth English guide, a Spanish cornerstone, an interactive tool, the funder directory, a download/template page, the 404) has been run through automated tooling (axe + WAVE + Lighthouse), a full keyboard-only pass, and a screen-reader pass (NVDA on Windows, VoiceOver on macOS/iOS), with results logged in a tracked issue register.
2. **Zero automated AA violations** across all page templates (axe "violations" count = 0; Lighthouse Accessibility = 100; WAVE errors = 0), plus all documented manual issues remediated or explicitly waived with rationale.
3. **A published, accurate Accessibility Statement** lives at `/resources/accessibility/` stating the target standard (WCAG 2.1 AA), conformance status, known limitations, the verified-on date, and a contact alias for accessibility feedback.
4. **Plain-language pass done** on the highest-traffic content: the hub index, all 11 pillar index pages, the answer box + first section + FAQ of the top ~20 guides, and 100% of tool UI labels/help text — each hitting a target of **Flesch-Kincaid Grade ≤ 9 (aim 8)** and **Flesch Reading Ease ≥ 60**, with a short readability score recorded per page.
5. **The build gate is extended** so accessibility and readability regressions fail the build the same way SEO/citation regressions do: a new `scripts/check-a11y.mjs` (static HTML invariants) wired into `npm run build`, and `pa11y-ci`/axe added as a CI step.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Set the standard and the page inventory (Day 1-2)**
1. Adopt **WCAG 2.1 Level AA** as the written target (this is the standard U.S. ADA settlements and Section 508 reference; it is also what the hub's own accessibility guide tells nonprofits to use — keep them consistent). Record this decision in the issue register.
2. Build a **representative page inventory**, not a per-URL list (96+ guides share templates). Pick one live example of each template: hub index (`/resources/`), a pillar index (`/resources/fundraising/`), a long English guide (e.g. `/resources/marketing/nonprofit-website-accessibility/`), a Spanish cornerstone (an `es` page), an interactive tool (`/resources/tools/passive-funding-calculator/`), the funder directory, a `/resources/templates/` download page, and `404`. These 8 cover the whole hub.
3. Create a tracked **issue register** (one Google Sheet or a markdown table in the repo): columns = Page template, Tool/method that found it, WCAG SC (e.g. 1.4.3 Contrast), Severity (Blocker/Major/Minor), Description, Fix owner, Status, Verified-on date.

**Phase B — Automated scan (Week 1) — all free**
4. In Chrome, install the **axe DevTools** extension (Deque, free tier) and the **WAVE** extension (WebAIM, free). Run **Lighthouse** (built into Chrome DevTools → Lighthouse → Accessibility category) on each inventory page. Run all three on each template; log every violation. Note the well-documented limitation that automated tools catch only ~30-40% of issues — do not stop here.
5. Run **WebAIM Contrast Checker** (free) on every brand token pair that appears as text or meaningful UI. Use the verified results below as your starting defect list (computed against WCAG math):
   - `--gold #C2A76F` text/icon on `--purple #7851A9` = **2.55:1 — FAIL** (needs ≥4.5:1, or ≥3:1 if it is purely a ≥24px/≥18.66px-bold large element or a non-text UI boundary).
   - `.gcbox p` color `#e7daf5` on the purple gradient = **4.44:1 — FAILS AA for normal body text** (passes only as large text). Darken the box or lighten the text to ≥4.5:1.
   - Passing pairs to leave alone (already verified): body ink on cream (13.96:1), article copy (13.89:1), `.faq p` (9.78:1), `--ash #6B6577` labels on white (5.60:1), `gold-deep #8A6A2E` links on white (5.02:1), footer text (8.77:1), nav links (11.38:1). This tells dev *exactly* what to change and what not to touch.

**Phase C — Keyboard-only pass (Week 1-2)**
6. Unplug the mouse. On each template, Tab/Shift-Tab/Enter/Space/arrow through the whole page. Verify: (a) a visible **skip-to-content link** appears on first Tab (the Astro pages have one via `Base.astro`, but the hand-authored `/resources/` HTML pages currently **do not** — log this as a Blocker), (b) focus is always visible, (c) focus order is logical, (d) no keyboard traps, (e) every interactive control (the calculator sliders/number inputs, share buttons, copy-link, nav) is reachable and operable, (f) the tool sliders announce/operate via arrow keys.
7. Specifically flag the **share/copy controls**: they are `<a href="javascript:void(0)" onclick=…>` and a `<button>` with copy feedback that is visual-only. Log: convert share anchors to real `<button>` elements, and add an `aria-live="polite"`/`role="status"` region so the "Copied!" confirmation is announced to screen-reader users.

**Phase D — Screen-reader pass (Week 2)**
8. **NVDA** (free, Windows) + Firefox/Chrome, and **VoiceOver** (built into macOS/iOS, free). On each template, navigate by headings (H key in NVDA), by landmarks (D key), by links, and read the page top to bottom. Verify: (a) exactly one H1 and a logical heading outline with no skipped levels, (b) the page has proper landmarks — log that the static `/resources/` pages use `<nav>/<article>/<footer>` but have **no `<main>`** (the skip-link target `#main` exists only on Astro pages), (c) all images have correct `alt` (logos = "Good Circles"; decorative SVG icons inside labeled share buttons should be `aria-hidden="true"`), (d) form fields have associated labels (the calculator does — confirm), (e) language is set (`<html lang="en">` / `lang="es"` on Spanish pages — confirm), (f) tables have proper `<th>` scope, (g) FAQ content reads sensibly.
9. Log each finding with the exact SC and a plain repro step.

**Phase E — Plain-language / readability pass (Week 2-4)** — run in parallel with remediation
10. Use the free authorities for method and word lists: **plainlanguage.gov** (the Federal Plain Language Guidelines from PLAIN), the **CDC Clear Communication Index** and **"Everyday Words for Public Health Communication,"** and **Hemingway Editor** (free web version) for sentence-level grading. Score readability with **Flesch-Kincaid Grade** and **Flesch Reading Ease** (free in Hemingway, Microsoft Word's Editor, or `readabilityformulas.com`).
11. Prioritize by traffic/importance: hub index → 11 pillar indexes → answer box + intro + FAQ of the top ~20 guides → 100% of tool labels/help text. Do NOT mechanically rewrite all 96 guides (effort sink, low marginal value); the answer box and FAQ are what low-literacy/ESL users and AI answer-engines actually read.
12. For each prioritized block, apply the rules and re-score until **FK Grade ≤ 9 (target 8), Reading Ease ≥ 60**: short sentences (aim ≤20 words avg), one idea per sentence, common words over jargon (use the CDC everyday-words list — e.g. "follow the rules" not "ensure compliance"), active voice, "you," expand or gloss every acronym on first use (501(c)(3), WCAG, FK), and front-load the answer. **Constraint:** preserve every FAQPage question *verbatim* (the SEO gate matches FAQ JSON-LD against visible text) and never alter the GC accuracy-contract figures or their estimate hedges. Record the before/after score per page in the issue register.
13. **ESL note:** FK is calibrated for native readers, so treat Grade 8 as a ceiling, not a goal — favor the simplest accurate wording even when the score already passes, and keep the existing `es` Spanish cornerstones (they are the real reach lever for Mississippi's Spanish-speaking communities).

**Phase F — Statement + verification (Week 4+)**
14. Draft the **Accessibility Statement** (template: W3C/WAI "Developing an Accessibility Statement"). Include: standard targeted (WCAG 2.1 AA), conformance status ("substantially conformant" with any listed exceptions), assistive tech tested (NVDA, VoiceOver), known limitations, feedback contact (a goodcircles.org alias — **never** a personal Gmail per the no-personal-email rule), and the verified-on date.
15. After dev remediates, **re-run the full audit** (Phases B-D) to confirm zero violations, and update every issue-register row to Verified with a date.

### Developer handoff package (what the staff member submits to development)

**1. Remediation work items (from the issue register), the high-confidence ones pre-identified:**
   - **Contrast:** Replace `--gold #C2A76F` *as a text/icon/meaningful-boundary color on purple* with a token meeting ≥4.5:1 (e.g. use `--gold-soft #FADC9C`, which is 11.41:1 on ink, for on-dark text/icons; keep `#C2A76F` only for ≥3:1 decorative borders/large display). Fix `.gcbox p` (`#e7daf5` on purple gradient, 4.44:1) to ≥4.5:1 by darkening the gradient floor or lightening the text. Touch nothing on the verified-passing pairs.
   - **Landmarks + skip link on static pages:** Wrap the primary content of every `public/resources/**/*.html` page in `<main id="main">` and add the same skip-link the Astro `Base.astro` ships (`<a href="#main" class="skip-link">Skip to content</a>` as first body child) plus a `.skip-link` style (visually hidden until `:focus`). This is a templated edit across the hand-authored hub.
   - **Share/copy controls:** Convert `<a href="javascript:void(0)" onclick>` share triggers to semantic `<button type="button">`; add a visually-hidden `aria-live="polite"` status region in `share.js` so "Copied!" is announced.
   - **Decorative SVGs:** add `aria-hidden="true"` to the inline icon SVGs inside already-labeled share buttons.
   - **Focus visibility:** ensure a `:focus-visible` outline (≥2px, ≥3:1 against background) on all links/buttons/inputs in `resources.css`.
   - Any remaining items in the register (heading-order fixes, table scopes, etc.).

**2. New build-gate check — `marketing/scripts/check-a11y.mjs`** (mirrors the style of `check-seo.mjs`, runs over `dist/`):
   - Asserts per built HTML page: a skip-link to `#main` is present and an element with `id="main"` (or a `<main>`) exists; every `<img>` has an `alt` attribute; every `<html>` has a non-empty `lang`; no `href="javascript:` interactive controls remain; `<table class="tbl">` cells use `<th>` for headers; exactly one H1 and no skipped heading levels (e.g. no H4 directly after H2).
   - Wire into `package.json` `build` after the citation check: `"build": "astro build && node scripts/check-seo.mjs && node scripts/check-citations.mjs && node scripts/check-a11y.mjs"`.
   - Add a **CI step** running `pa11y-ci` (free, axe/HTMLCS-based, npm `--save-dev`) against the built `dist/` for the 8 template pages; fail CI on any error.
   - **Optional readability gate (recommended):** a tiny `scripts/check-readability.mjs` that extracts the `.answer` box text per resource page, computes Flesch-Kincaid Grade, and **warns** (does not fail) above a threshold of 9 — keeps drift visible without blocking authors on borderline math.

**3. New page — Accessibility Statement**
   - **Field/data structure (front-matter or static HTML, matching the hub's existing pattern):**
     ```
     title:        "Accessibility Statement · Good Circles Resources"
     description:  "How accessible the Good Circles nonprofit resource hub is, the standard we target (WCAG 2.1 AA), known limitations, and how to report a barrier."
     path:         "/resources/accessibility/"
     standard:     "WCAG 2.1 Level AA"
     conformance:  "Substantially conformant"
     tested_with:  ["NVDA", "VoiceOver", "axe", "WAVE", "Lighthouse"]
     feedback:     "accessibility@goodcircles.org"   # alias, never a personal Gmail
     last_verified:"2026-07-15"
     ```
   - **URL / IA placement:** `/resources/accessibility/`, linked from the hub footer (same footer nav used site-wide).

**4. Build-gate & SEO requirements the new statement page must satisfy** (reuse existing gate — non-negotiable): exactly one non-empty `<h1>`; non-empty `<title>` + meta description; absolute self-referencing canonical in trailing-slash form; `og:title` === `<title>`; absolute `og:image`; valid JSON-LD (use `@type: "WebPage"`); listed in `sitemap-0.xml` (indexable, not noindex); all internal links resolve and no `.html` internal links. If it carries a "Sources & tools" block (it should cite WCAG/W3C), it must include a `Last verified YYYY-MM-DD` stamp per `check-citations.mjs`. No FAQ needed; if one is added, questions must appear verbatim in visible text.

**5. Interaction/UX behavior:** Skip-link is visually hidden until focused, then visible and jumps focus to `#main`. Copy-link button announces "Copied!" via `aria-live`. Calculator sliders remain arrow-key operable with visible focus. No new JS frameworks — keep the no-dependency, static posture.

**6. Acceptance criteria / QA checklist (testable):**
   - [ ] axe DevTools = 0 violations on all 8 template pages.
   - [ ] Lighthouse Accessibility = 100 on all 8 template pages.
   - [ ] WAVE = 0 errors (contrast errors included) on all 8 template pages.
   - [ ] All text/UI contrast ≥ 4.5:1 (≥3:1 for large text and non-text UI), confirmed in WebAIM Contrast Checker — specifically the gold-on-purple and `.gcbox` fixes verified.
   - [ ] Full keyboard pass on every template: skip-link works, focus always visible, logical order, no traps, all controls operable.
   - [ ] NVDA + VoiceOver pass: one H1, no skipped heading levels, `<main>` landmark present, correct alt text, labeled form fields, `lang` set (en/es), "Copied!" announced.
   - [ ] `node scripts/check-a11y.mjs` passes; `pa11y-ci` CI step passes; existing `check-seo.mjs` + `check-citations.mjs` still pass.
   - [ ] Accessibility Statement live at `/resources/accessibility/`, in sitemap, footer-linked, dated.
   - [ ] Prioritized content blocks score FK Grade ≤ 9 (target 8) and Reading Ease ≥ 60; scores recorded in the register.
   - [ ] All FAQPage questions still appear verbatim in visible text after the plain-language rewrite (SEO gate green).

### Accuracy, accessibility & compliance notes
- **Figures to verify before publishing the statement:** the conformance claim must be honest — only claim "substantially conformant" if the post-remediation re-audit (Phase F) shows zero outstanding AA blockers; otherwise list them as known limitations. The standard cited (WCAG 2.1 AA) and the tools listed must match what was actually used. Date-stamp it and re-verify on each major hub change (treat like a watch-list item).
- **Legal review:** none strictly required (this is self-assessed conformance, not a legal certification), but the statement must avoid over-claiming "fully accessible"/"ADA-certified" — those phrases create liability. Use "we aim to conform" / "substantially conformant," the wording pattern Candid and NCN use.
- **WCAG 2.1 AA considerations:** the marquee SCs in play are 1.4.3 (Contrast), 2.4.1 (Bypass Blocks / skip link), 1.3.1 (Info & Relationships / landmarks, headings, table scope), 2.1.1 (Keyboard), 4.1.2 (Name, Role, Value / semantic buttons + labels), 3.1.1/3.1.2 (Language of page/parts), and 1.1.1 (Non-text Content / alt). Plain language supports 3.1.5 (Reading Level, a AAA criterion we adopt voluntarily as a reach goal, not a conformance claim).
- **GC accuracy-contract compliance:** the plain-language pass must NOT touch the contract figures or their hedges — keep "10% of merchant **net profit**," "merchants keep **89%** on a **1% fee**," "**~10%** shopper savings (estimate)," "**~$72**/active supporter/yr (estimate)," "free for nonprofits," and the September 2026 launch. Simplifying *sentences around* these is fine; changing the numbers or dropping the "estimate" qualifier is not. Maintain the no-custody / no-unnecessary-PII posture — the audit adds no tracking or new data collection.
- **Keeping it current:** the new `check-a11y.mjs` gate prevents structural regressions on every build; the optional readability warn keeps prose drift visible; schedule a manual NVDA/VoiceOver re-pass at each new pillar launch and re-date the statement then.

### Effort, cost & sequencing
- **Effort:** ~1-2 months elapsed, mostly QA + content labor. Rough split: automated + contrast scan (3-4 days), keyboard pass (2-3 days), screen-reader pass (3-4 days), remediation by dev (1-1.5 weeks including the new gate + statement page), plain-language pass on prioritized content (1.5-2 weeks), re-audit + statement finalize (3-4 days).
- **Third-party cost: $0.** axe DevTools (free tier), WAVE, Lighthouse, NVDA, VoiceOver, WebAIM Contrast Checker, Hemingway (free web), plainlanguage.gov, CDC Clear Communication Index, and `pa11y-ci` (open-source npm) are all free. No paid overlay/widget — overlays are widely discredited and would contradict the hub's own accessibility guidance.
- **Sequencing:** Do this **early and P1**, before or alongside content-expansion improvements, because (a) it is the hub's biggest *credibility* gap given it preaches accessibility, (b) the new build-gate checks should exist *before* more pages are authored so they enforce the standard on all future content rather than requiring a retrofit, and (c) the plain-language pass compounds the value of every other improvement by making it readable to the actual end audience. It depends on no other improvement and unblocks the "publish a credible Accessibility Statement" proof point that the best nonprofit resources all carry.

Sources: [W3C/WAI Web Accessibility Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/list/) · [Equalize Digital — Nonprofit Website Accessibility](https://equalizedigital.com/industries/nonprofit-website-accessibility/) · [FatLab — Nonprofit WCAG Compliance Guide](https://fatlabwebsupport.com/blog/nonprofit/wcag-accessibility-compliance-for-nonprofit-websites-what-you-actually-need-to-know/) · [inclly — Free Accessibility Testing Tools Compared](https://inclly.com/resources/accessibility-testing-tools-comparison) · [plainlanguage.gov Federal Plain Language Guidelines](https://www.plainlanguage.gov/) · [CDC Clear Communication Index](https://www.cdc.gov/ccindex/tool/index.html) · [CDC Plain Language Materials & Resources](https://www.cdc.gov/health-literacy/php/develop-materials/plain-language.html) · [Readable — Flesch Reading Ease & Flesch-Kincaid Grade Level](https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/)

---

## 8. Curated toolkits, one-click Google copies & per-guide print/PDF

**Why it moves 9 -> 10:** The hub has 23 strong templates and ~96 guides, but they sit as flat lists — a founder must already know that bylaws, a budget, a conflict-of-interest policy and a Form 990 checklist all belong to the same job. The best resources package the journey: National Council of Nonprofits ships a multi-piece *budget toolkit* rather than loose files, and Candid bundles "start-up & early-stage" resources into one curated path. Three additions close the gap: (a) curated kits turn "here are files" into "here is everything you need to do X," (b) one-click "Make a copy" Google Docs/Sheets links remove the download-into-Word friction that excludes the many small nonprofits living entirely in Google Workspace (Bloomerang/NonprofitReady users expect this), and (c) a clean print/PDF stylesheet lets any guide become a board handout or offline reference — the offline-credibility move that Nolo and Propel get from their PDF-first formats. All three are free, static, and reinforce the existing "free-first, no-custody" posture.

**Primary owner (human labor):** content writer · **Also needs:** design (kit page layout polish), development (Google Drive setup + print CSS + kit page build)
**Effort:** M (1-3 wks) · **Priority:** P2 · **Dependencies:** Existing `/resources/templates/` page and its 23 `.docx`/`.xlsx` files; the shared `resources.css`; the existing build gate (`check-seo.mjs`, `check-citations.mjs`). No dependency on other proposed improvements.

### Definition of done
1. **Kits.** A single new page `/resources/toolkits/` presents at least three curated kits — **New Nonprofit Starter Kit**, **Grant-Ready Kit**, **Board Governance Kit** — each a card listing the exact templates *and* guides it bundles, with a one-line "what this kit gets you done" promise and links to every component. Each kit is reachable from the templates page and the main resources hub, and passes the existing gate.
2. **Google copies.** Every one of the 23 templates offers, alongside the existing `.docx`/`.xlsx` download, a one-click **"Make a copy (Google)"** link that opens the file in the user's own Drive as a fresh copy (URL ending in `/copy`), leaving the Good Circles master untouched. A short privacy/ownership note explains what the link does. Both the templates page and the kit page show both options per template.
3. **Print/PDF.** Adding a `@media print` block to `resources.css` makes any guide or kit page print (and "Save as PDF") as a tidy, branded, single-column document: nav/share/footer/CTA-button chrome removed, link URLs surfaced in parentheses, sensible page breaks, a printed source line with the page URL and "Last verified" date, and the answer box / tables intact. No new files, no per-page work — it applies to the whole hub automatically.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Design the kits (content writer; ~3 days)**
1. Open `/resources/templates/` and the main hub. Inventory the 23 templates (list is in the templates page) and the existing guides per pillar.
2. For each of the three launch kits, decide the **bundle** — pick from existing assets only (do not commission new ones). Recommended starting bundles, grounded in the current inventory:
   - **New Nonprofit Starter Kit** ("Everything to stand up a compliant 501(c)(3)"): Nonprofit Bylaws Template, Conflict-of-Interest Policy, Annual Operating Budget, Board Meeting Agenda & Minutes, Document Retention Policy, Whistleblower Policy + the guides *How to start a nonprofit*, *Board governance basics*, *Form 990 explained*.
   - **Grant-Ready Kit** ("Everything a funder asks to see"): Grant Proposal Template, Grant Budget Template, Case for Support, Logic Model, Annual Operating Budget + the *Grant-Readiness Assessment* tool, and guides on grant readiness / the funding mix. Cross-link the funder directory.
   - **Board Governance Kit** ("Every governance policy Form 990 asks about"): Conflict-of-Interest, Whistleblower, Gift Acceptance, Document Retention policies, Board Meeting Agenda & Minutes, Board Skills & Composition Matrix + the *Board Composition Matrix* tool and the governance guides.
3. Write, per kit: an H2-able kit **name**, a one-sentence **promise**, a 2-3 sentence **intro**, and an annotated **component list** (each item = title + 1 line on why it's in the kit + its existing URL). Reuse the verbatim template descriptions already on the templates page so nothing has to be re-verified.
4. Confirm every component URL resolves (paste each into a browser). Broken links will fail the gate.
5. Benchmark check (optional but recommended): skim the National Council of Nonprofits budget toolkit and Candid's "start-ups & early stage" resource page to confirm your bundles match how the field groups these jobs. Sources: National Council of Nonprofits (councilofnonprofits.org/running-nonprofit) and Candid Learning (learning.candid.org/national-nonprofit-resources).

**Phase B — Create the Google copies (content writer + ops; ~2-3 days, one-time)**
6. Using the **goodcircles.org Google Workspace account only** (never the owner's personal Gmail — per project rule), upload each `.docx` to Google Docs and each `.xlsx` to Google Sheets. Keep them in one shared Drive folder "GC Resources — Template Masters."
7. For each file, set sharing to **"Anyone with the link — Viewer"** (Viewer, not Editor, so the master can't be altered; a `/copy` link still works for viewers and produces an editable copy in the user's own Drive).
8. Record each file's share URL, then build the copy link by replacing the trailing `/edit?usp=sharing` with `/copy` (Docs: `https://docs.google.com/document/d/<ID>/copy`; Sheets: `https://docs.google.com/spreadsheets/d/<ID>/copy`). This is the standard, documented "make a copy" pattern (CSS-Tricks / Google support).
9. Test each copy link in a logged-out and a logged-in browser. Note for dev: a `/copy` link prompts the user to sign in if they aren't already — that's expected Google behavior, not a bug. Capture the behavior in the privacy note copy (Phase D).
10. Deliver a single mapping table to dev: `filename.docx -> https://…/copy`. (See schema below.)

**Phase C — Spec the print output (content writer + design; ~1 day)**
11. Decide what should *not* print (nav, share bar, footer nav, the gold CTA button, the JS share buttons) and what *must* print legibly (H1, dateline, answer box, TOC optional, body, tables, callouts, the "Sources & tools" block, the "Last verified" date).
12. Write the one-line **print footer** text dev will inject via CSS, e.g. *"Source: [page URL] · Good Circles free nonprofit resources · goodcircles.org"*. The page URL is already the canonical; dev can surface it.
13. Hand design the brand constraints: keep Ink (#2E1B4E) headings, drop background tints to white/near-white for toner economy, keep the gold answer-box left rule as a thin black/gray rule.

**Phase D — Write the supporting microcopy (content writer; ~half day)**
14. Write the per-template dual-action labels ("Download .docx" / "Make a copy (Google)") and a one-time privacy/ownership note: *"'Make a copy' opens the template in your own Google Drive as a brand-new copy you own and can edit. We can't see your copy, and your edits never touch ours. Prefer offline? Download the Word/Excel version."* (No PII is collected; this preserves the no-unnecessary-PII posture.)
15. Write the `/resources/toolkits/` page meta: title `Nonprofit Toolkits & Kits · Good Circles`, a meta description, and one Good Circles CTA reusing the existing `.gcbox` block + accuracy-contract copy verbatim from the templates page (the "$72 per active supporter per year (≈ $36,000/year from 500 supporters), free for nonprofits" language already on-site).

### Developer handoff package

**1. Content/data structure**

*Per-template record* (drives both the templates page and kit pages; staff submits as a flat table/JSON):
```json
{
  "id": "nonprofit-bylaws",
  "title": "Nonprofit Bylaws Template",
  "type": "DOC",
  "blurb": "A clean, adoptable framework structured to satisfy state and IRS expectations…",
  "docx": "/resources/templates/files/Nonprofit-Bylaws-Template.docx",
  "gcopy": "https://docs.google.com/document/d/1AbC…/copy",
  "kits": ["new-nonprofit-starter", "board-governance"]
}
```

*Per-kit record:*
```json
{
  "slug": "grant-ready",
  "name": "Grant-Ready Kit",
  "promise": "Everything a funder asks to see, in one place.",
  "intro": "Pull this kit before you write your next proposal…",
  "components": [
    {"title": "Grant Proposal Template", "kind": "template", "url": "/resources/templates/files/Grant-Proposal-Template.docx", "why": "The fixed structure funders reward."},
    {"title": "Grant-Readiness Assessment", "kind": "tool", "url": "/resources/tools/grant-readiness-assessment/", "why": "Score your gaps in 12 questions."},
    {"title": "The funding mix", "kind": "guide", "url": "/resources/fundraising/the-funding-mix/", "why": "Where grants fit in a healthy budget."}
  ]
}
```

**2. URLs / IA placement**
- New page: `/resources/toolkits/` (canonical `https://goodcircles.org/resources/toolkits/`, trailing slash). Build as `public/resources/toolkits/index.html` to match the existing static pattern.
- Update `/resources/templates/index.html`: add the dual download/Google action to each `.dlcard`, and add a "Curated kits →" callout linking to `/resources/toolkits/`.
- Add a link to `/resources/toolkits/` from the main resources hub (`/resources/`) and add it to the sitemap. Run `orphan-check.mjs` — the new page must be linked from at least one other page (it will be, via templates + hub).
- Google copy links are **external** (`docs.google.com`), so they are not subject to the internal-link resolver in `check-seo.mjs`; use `target="_blank" rel="noopener"`.

**3. Build-gate & SEO requirements (must pass `check-seo.mjs` + `check-citations.mjs`)**
- Exactly **one** non-empty `<h1>` on `/resources/toolkits/` (the page title; kit names are `<h2>`/`<h3>`).
- Non-empty `<title>` and `<meta name="description">`; **`og:title` byte-identical to `<title>`** (the gate decodes entities, but keep them matched); absolute `og:image` (reuse `/resources/og.png`).
- Absolute self-canonical in trailing-slash form: `https://goodcircles.org/resources/toolkits/`.
- JSON-LD: use **`CollectionPage`** + **`BreadcrumbList`** (mirror the existing templates page's two JSON-LD blocks — same shape, new name/URL). All JSON-LD must parse.
- **No FAQ needed** on the toolkits page; if one is added, every FAQ question string must appear **verbatim in the visible HTML** (gate requirement).
- The toolkits page lists/links templates but is **not a "sourced" page** — it must NOT contain the literal string `Sources & tools`, or the citation gate will then require a `Last verified YYYY-MM-DD` stamp. Keep it a navigation/collection page. (Guide pages that already carry "Sources & tools" are untouched and keep their date.)
- All internal links must resolve to a built file and must not end in `.html` (use directory/trailing-slash form). The `.docx`/`.xlsx` asset links already resolve.
- Page must appear in `sitemap-0.xml` (it's indexable, no `noindex`).

**4. Print stylesheet (single edit to `public/resources/resources.css`)** — add one `@media print` block; affects every hub page automatically, zero per-page work:
- `display:none` for `.nav`, `.sharebar`, `footer`, `.related` (optional), and the CTA *button* (`.btn`) — keep the `.gcbox` text but drop its dark gradient background.
- Force `body{background:#fff;color:#000}` and tinted blocks (`.answer`, `.callout`, `.gcbox`, `.tbl th`) to white/near-white backgrounds with a thin gray rule, for toner economy.
- Surface link URLs: `article a[href^="http"]::after{content:" (" attr(href) ")";font-size:.85em;color:#555}` — but **exclude** in-page anchors and nav (`a[href^="#"]::after, .nav a::after, .related a::after{content:""}`) so the printout isn't noisy.
- Page-break hygiene: `h2,h3{break-after:avoid}`, `.answer,.callout,.tbl,.faq,.steps>li{break-inside:avoid}`.
- Inject a printed source/footer line via `@page` margin or a `body::after` (or a hidden `.print-source` element rendered only in print) reading `Source: <canonical URL> · goodcircles.org`. Simplest: a `.print-only` element in the layout shown only under `@media print`.
- Use absolute units for `@page{margin:18mm 16mm}` (PDF engines render absolute units consistently).
- Keep brand: Ink headings, Montserrat where the print engine supports the web font (fall back to a serif/sans stack).

**5. Interaction / UX**
- Each template row shows two affordances: a primary **Download** (`.docx`/`.xlsx`, existing `download` attr) and a secondary **Make a copy (Google)** opening in a new tab. Visually distinguish (e.g., secondary/ghost button styling) so users understand they're two formats of the same file.
- One concise privacy/ownership note near the first template (not repeated 23×).
- Kit cards: collapsible or simply a titled card listing components as links; no JS required — keep it static.
- Print: triggered by the browser's native Print / Save-as-PDF; **no in-page "Print" button is required**, but an optional unobtrusive "Print / Save as PDF" text link near the dateline (calling `window.print()`) is a nice touch and is allowed (it's not an internal nav link, so it won't trip the gate).

**6. Acceptance criteria / QA checklist**
- [ ] `npm run build` passes — `check-seo.mjs` reports 0 issues including the new page.
- [ ] `check-citations.mjs` passes (toolkits page is not flagged as a sourced page; no stale figures).
- [ ] `orphan-check.mjs` shows `/resources/toolkits/` is linked from ≥1 page (not an orphan).
- [ ] `/resources/toolkits/` has exactly one `<h1>`, valid `CollectionPage` + `BreadcrumbList` JSON-LD, matching `og:title`/`title`, trailing-slash canonical, and is in the sitemap.
- [ ] Each of the 3 kits lists its components; every component link resolves (templates, guides, tools).
- [ ] Each of the 23 templates shows both a working Download and a working **Make a copy (Google)** link; clicking the latter creates a copy in the tester's own Drive and the GC master is unchanged afterward.
- [ ] Google links are Viewer-shared (testers cannot edit the master) and use `rel="noopener"`.
- [ ] Print preview (Chrome DevTools "Emulate CSS media type: print" + actual Save-as-PDF) of three sample guides shows: no nav/share/footer-button chrome, white backgrounds, link URLs in parens for external links only, no awkward mid-table/mid-callout page breaks, and the printed source line with the canonical URL.
- [ ] Printed guide still shows the "Last verified" date and Sources block.
- [ ] Mobile and desktop screen rendering of the templates page is visually unchanged except for the added secondary buttons (print CSS is `@media print` only and cannot affect screen).

### Accuracy, accessibility & compliance notes
- **Figures to verify:** None new. Kit pages reuse template blurbs verbatim and the existing accuracy-contract CTA copy ("$72/active supporter/yr (estimate), ≈$36,000/yr from 500 supporters, free for nonprofits, 89% kept, 10% of net profit, ~10% shopper savings"). Keep the "(estimate)" framing already used on-site. Any GC mention must match the accuracy contract exactly.
- **Legal review:** None required — no new legal content; templates already carry their own "review with counsel" notes. The Google copy note must not imply Good Circles stores or sees user data (it doesn't; the copy lives in the user's Drive).
- **PII / no-custody posture:** The Google "make a copy" flow involves *no* data flowing to Good Circles — it's a static outbound link; GC collects nothing and stores nothing. This preserves the no-unnecessary-PII and no-custody constraints. Document that the masters live in the goodcircles.org Workspace, never a personal account (project rule).
- **WCAG 2.1 AA:** The two per-template actions must each have discernible accessible names (e.g., "Download Nonprofit Bylaws Template (Word)" / "Make a copy of Nonprofit Bylaws Template in Google Docs") — not bare "Download"/"Copy", which fail 2.4.4 (Link Purpose) and 4.1.2. Maintain the existing color-contrast tokens; the secondary button must hit 4.5:1. The optional "Print/Save as PDF" control, if a `<button>`, needs an accessible label. Print output inherits semantic headings, so screen-reader and print structure stay aligned.
- **Keeping it current:** When a template's `.docx`/`.xlsx` is revised, re-upload to the same Drive file (File > version, or replace contents) so the existing `/copy` URL keeps working — never delete and re-create, which would break the link. Add the Drive "Template Masters" folder + the filename→`/copy` mapping table to the maintenance runbook. The print CSS is set-and-forget. Kits should be re-reviewed whenever a new pillar or cornerstone template is added.

### Effort, cost & sequencing
- **Effort:** M, ~1.5-2.5 weeks total: Phase A (kits) ~3 days content; Phase B (23 Google uploads + share + link-build + test) ~2-3 days, mostly one-time mechanical ops; Phase C/D (print spec + microcopy) ~1.5 days; dev ~3-4 days (one new static page + templates-page edits + one `@media print` CSS block + Drive link wiring).
- **Third-party cost:** $0. Uses the existing goodcircles.org Google Workspace (nonprofits qualify for free Google Workspace for Nonprofits via Google for Nonprofits). No new tooling, no PDF-generation service (browser-native Save-as-PDF covers it), no JS dependencies.
- **Sequencing vs. other improvements:** P2 — high leverage, low risk, fully within the static + strict-gate architecture, and independent of the other 9->10 items. The print CSS is the cheapest single win (one CSS block, hub-wide) and can ship first; the kits and Google copies can follow in the same release. Do this before any improvement that *adds* templates, so new assets are bundled and Google-copied from day one rather than retrofitted.

Relevant files: `marketing/public/resources/templates/index.html` (add dual actions + kits callout), new `marketing/public/resources/toolkits/index.html`, `marketing/public/resources/resources.css` (add `@media print` block), `marketing/public/resources/index.html` (link to toolkits), and the two gates `marketing/scripts/check-seo.mjs` + `marketing/scripts/check-citations.mjs` (no changes needed — the new page must satisfy them as-is).

---

## 9. The Feedback & Measurement Loop — a privacy-first "Was this helpful?" widget, full GA4 event coverage, and a quarterly data-driven content review

**Why it moves 9 -> 10:** The hub is built (96+ guides, 12 tools, 23 templates, a 43-funder directory) but currently *flies blind*: the hand-built `/resources/` HTML pages don't even load GA4 (the snippet only lives in the Astro `Base.astro` layout, not in these static guides), and there is no per-page quality signal at all. The best resources close this loop in plain sight — the National Council of Nonprofits, Candid Learning, web.dev, MDN, and Stripe Docs all carry a per-page "Was this helpful?" control and act on the data, and Bloomerang/Mighty Citizen publicly frame quarterly GA4-driven content audits as table stakes (yet [only ~45% of nonprofits feel confident in their own analytics](https://www.mightycitizen.com/insights/articles/2026-nonprofit-marketing-benchmarks)). Adding a no-PII helpfulness widget, real event coverage for tools/templates/directory, and a documented quarterly "fix the weakest pages" ritual turns a static library into a *self-improving* one — and lets Good Circles credibly say "we measure whether this actually helps you," which is exactly the above-and-beyond posture a 10/10 demands.

**Primary owner (human labor):** marketing (analytics + review ritual) · **Also needs:** development (widget, event wiring, optional Worker), QA
**Effort:** M (1-3 wks) · **Priority:** P1 · **Dependencies:** GA4 G-GL2EMC1F1X (exists); a no-PII landing place for free-text comments (Cloudflare Worker + KV on free tier, OR GA4-only with comments disabled — decided in Step 1)

### Definition of done
- Every guide, tool, and template-detail page under `/resources/` renders a single, keyboard- and screen-reader-accessible **"Was this helpful? Yes / No"** control directly above the existing share bar, styled in brand tokens.
- Clicking Yes or No fires a GA4 `page_feedback` event (no PII) and reveals an **optional** free-text comment box; submitting the comment fires `feedback_comment`. The control records a `localStorage` flag so a returning visitor isn't re-prompted on the same page.
- GA4 is actually loaded on the `/resources/` pages (today it isn't), via one shared script, gated by Do-Not-Track and reusing the existing consent posture.
- `tool_used`, `template_download`, and `directory_filter` events fire from the relevant pages with documented parameters.
- A free-text comment, *if* the comment backend is enabled, lands in a no-PII store the team can read; if not enabled, the comment box is omitted entirely (no dead UI).
- A written **Quarterly Resource Review** runbook exists in `docs/seo/`, names the GA4 reports/exploration to use, defines the "weakest page" scoring, and the build still passes both gates (`check-seo.mjs`, `check-citations.mjs`) on every touched page.

### The human work (step-by-step for a marketing/research staff member)

1. **Make the one privacy decision first — where do *comments* go?** The yes/no counts will always live in GA4 (no decision needed). Free-text comments are the only thing that needs a home. Pick ONE:
   - **Option A (recommended, free):** a tiny Cloudflare Worker + Workers KV endpoint that stores `{page, sentiment, comment, ts}` and nothing else. Cloudflare's free tier is [100k Worker requests/day and 1,000 KV writes/day](https://developers.cloudflare.com/workers/platform/pricing/) — orders of magnitude above this hub's volume. No origin server, fits the static architecture.
   - **Option B (zero-infra):** send the comment text as a GA4 event parameter (truncated, sanitized) and read it in GA4. Simplest, but GA4 free-text params are awkward to read and you risk capturing something a user typed. Acceptable as a v1.
   - **Option C:** disable the comment box entirely; ship yes/no only. Still a real signal, zero PII risk.
   Write the choice and the one-line rationale into the handoff. Default to A unless dev pushes back, then C.
2. **Write the widget microcopy** (brand voice, no jargon): heading "Was this helpful?", buttons "Yes" / "No", and a single comment prompt that *changes by sentiment* — for No: "Thanks — what was missing or wrong? (optional, no email needed)"; for Yes: "Glad it helped. Anything we should add? (optional)". Add the post-submit thank-you line: "Thanks — this tells us which guides to improve first." Explicitly tell users **not** to include personal/contact info (mirrors the [data-minimization guidance for nonprofits](https://www.eff.org/pages/online-privacy-nonprofits)).
3. **List every page type that needs an event** and the human-meaningful name for each, so dev wires the right selector:
   - Guides + tools + template pages → the helpfulness widget.
   - 12 interactive tools → `tool_used` on first meaningful interaction (e.g. "Calculate"/"Score" button), not on page load.
   - 23 templates → `template_download` on the .docx/.xlsx download link click.
   - Funder directory → `directory_filter` when a search/filter is applied.
   Produce a simple table: page/URL pattern → event → what user action triggers it.
4. **Draft the GA4 configuration checklist** (you'll do this in the GA4 UI, no code): in Admin → Custom definitions, register custom dimensions for the event params you want to slice by — `feedback_sentiment`, `page_path`, `tool_id`, `template_id`, `filter_type`. Mark none as conversions (these are quality signals, not goals). Confirm Google signals / ads personalization stays **off** to keep the lean posture.
5. **Write the Quarterly Resource Review runbook** (the ritual that turns data into fixes). Base the cadence on the benchmark consensus — [quarterly thematic reviews of the top URLs by sessions, with ≥20% of effort reserved for refreshing existing pages](https://clutch.co/resources/content-decay-audits). Specify, in order:
   1. **When:** first full week of Jan / Apr / Jul / Oct; ~½ day to score, the rest of the week to fix.
   2. **Pull the data (free, GA4 + Search Console):** a) helpfulness ratio per page (`page_feedback` where `feedback_sentiment=no` ÷ total) ; b) [pages where sessions + engagement rate + avg engagement time are all declining quarter-over-quarter](https://www.frac.tl/content-decay-updating-underperforming-content/) ; c) high-impression / low-CTR pages from Search Console ; d) tools/templates with high views but low `tool_used`/`template_download` (a UX or relevance smell).
   3. **Score "weakest pages":** rank by a simple composite — high "No" rate OR high decay OR high-traffic-but-low-action. Take the **bottom 5–10** that quarter (don't boil the ocean).
   4. **Fix:** read the free-text comments for those pages, rewrite the weak section, refresh the "Sources & tools" block, and **bump the `Last verified` date + `dateModified`** (this re-passes `check-citations.mjs`).
   5. **Record:** one row per quarter in a tracking sheet — page, problem, fix, before/after "No" rate next quarter. This is the proof the loop works.
6. **Hand off** the four artifacts to dev: (a) the comment-backend decision, (b) the microcopy, (c) the event table, (d) the GA4 config checklist. Keep the runbook (#5) in your lane — it's an operations doc, not code.

### Developer handoff package (what the staff member submits to development)

**1. Where it lives / placement in the IA**
- A single new shared script `public/resources/feedback.js` (sibling of the existing `public/resources/share.js`), plus a shared GA4 loader `public/resources/analytics.js`. Both are referenced once at the bottom of each `/resources/` page (next to the existing `<script src="/resources/share.js"></script>`).
- The widget markup is injected by `feedback.js` immediately **before** `.sharebar` on guide/tool/template pages (so it appears above Share, below the article body). No per-page HTML authoring — JS finds `.sharebar` (or `article`) and inserts the widget, keeping all ~120 static pages untouched and the build gate green.
- The GA4 snippet currently in `Base.astro` (lines 71-78) stays for the Astro marketing site; `analytics.js` brings the **same** `G-GL2EMC1F1X` config to the static `/resources/` pages, which today load no GA4 at all.

**2. Widget markup (rendered by JS) — native, accessible, no framework**
```html
<section class="gc-feedback" aria-labelledby="gcfb-h">
  <p id="gcfb-h" class="gcfb-q">Was this helpful?</p>
  <div class="gcfb-btns" role="group" aria-labelledby="gcfb-h">
    <button type="button" class="gcfb-yes" data-fb="yes">Yes</button>
    <button type="button" class="gcfb-no"  data-fb="no">No</button>
  </div>
  <form class="gcfb-comment" hidden>
    <label for="gcfb-text">What was missing or wrong? (optional — no email needed)</label>
    <textarea id="gcfb-text" maxlength="600" rows="3"></textarea>
    <button type="submit" class="btn btn-gold">Send</button>
  </form>
  <p class="gcfb-thanks" role="status" aria-live="polite" hidden>Thanks — this tells us which guides to improve first.</p>
</section>
```
Use real `<button>`/`<form>` (not `div role=button`), set `aria-pressed` on the chosen Yes/No, reveal the comment `<form>` by removing `hidden`, and announce the thank-you via the `aria-live="polite"` region. Style with existing brand tokens (Purple `#7851A9`, Gold `#C2A76F`, Ink `#2E1B4E`); buttons must meet 4.5:1 contrast.

**3. Event schema (GA4 via gtag, snake_case per [Google's convention](https://www.analyticsmania.com/post/how-to-track-custom-events-with-google-analytics-4/))**

| Event | Trigger | Params (example values) |
|---|---|---|
| `page_feedback` | Yes/No click | `feedback_sentiment:"yes"|"no"`, `page_path:"/resources/grants/how-to-write-a-letter-of-inquiry/"`, `content_type:"guide"|"tool"|"template"` |
| `feedback_comment` | comment submit | `feedback_sentiment`, `page_path`, `comment_len:142` (length only — **never** the text, to GA4) |
| `tool_used` | first calc/score action | `tool_id:"grant-readiness-assessment"`, `page_path` |
| `template_download` | .docx/.xlsx link click | `template_id:"loi-skeleton"`, `file_ext:"docx"`, `page_path` |
| `directory_filter` | funder filter applied | `filter_type:"focus_area"|"geo"|"search"`, `page_path` |

Example comment record sent to the **Worker/KV** store (Option A only — this is where the actual text goes, never to GA4):
```json
{ "page": "/resources/grants/how-to-write-a-letter-of-inquiry/", "sentiment": "no", "comment": "The skeleton doesn't cover multi-year asks", "ts": "2026-07-03T14:21:09Z" }
```
KV write must be fire-and-forget with a `try/catch` that never blocks the UI (mirror the existing `analytics.ts` "analytics must never break the flow" pattern). Worker should set a per-IP soft rate limit and drop any submission whose comment matches an email/phone regex (defense-in-depth against accidental PII).

**4. Loader behavior (`analytics.js`)**
- Inject the standard gtag loader for `G-GL2EMC1F1X` **only if** `navigator.doNotTrack !== "1"` and no opt-out cookie is set (honors the [cookie policy](/cookies) promise of "respect your choice"). When skipped, all `gtag()` calls no-op exactly like the existing `analytics.ts`.
- Reuse/extend the delegated-click listener already in `Base.astro` for `tool_used` / `template_download` / `directory_filter` via `data-*` hooks, so per-page authoring isn't required.

**5. Build-gate & SEO requirements it must satisfy** (reuse the existing gates)
- Widget is **JS-injected**, so static HTML keeps **exactly one `<h1>`**, canonical, og:title===title — `check-seo.mjs` stays green untouched. The widget heading is a `<p>`, not `<h2>/<h1>`.
- **No new internal links** in the widget (avoids the link-resolver checks); the comment form has no `action` to a `.html`.
- Pages already carrying a "Sources & tools" block keep their `Last verified YYYY-MM-DD` stamp — the widget must not displace it (`check-citations.mjs`).
- No new JSON-LD needed. Do **not** add `aggregateRating` schema from this feedback (it would be unverifiable rich-result spam) — keep schema as-is.
- `analytics.js`/`feedback.js` are static assets in `public/`, so they ship unchanged and don't affect sitemap/noindex consistency.

**6. Acceptance criteria / QA checklist**
- [ ] Widget appears once per guide/tool/template page, directly above the share bar; not on hub index/category pages (or as decided).
- [ ] Keyboard-only: Tab reaches Yes/No, Enter/Space activates, focus moves into the revealed comment box; visible focus ring throughout.
- [ ] Screen reader announces the question, button names, pressed state, and the thank-you (via `aria-live`).
- [ ] Yes-click fires exactly one `page_feedback` with `feedback_sentiment:"yes"` (verify in GA4 DebugView); No-click fires the `"no"` variant.
- [ ] Comment submit fires `feedback_comment` with `comment_len` only; **no comment text appears in any GA4 event** (network-tab check).
- [ ] Option A: comment text reaches KV; submission containing an email address is rejected/stripped; KV failure does not break the UI.
- [ ] `localStorage` flag prevents re-prompt on reload of the same page; clearing storage restores it.
- [ ] With `doNotTrack=1`, no gtag request fires and the widget still works (yes/no UI + Option-A comment still post; just no GA4 hit).
- [ ] `tool_used` fires on action (not page load) for all 12 tools; `template_download` fires for all 23 templates; `directory_filter` fires on a real filter in the funder directory.
- [ ] `npm run build` passes `check-seo.mjs` and `check-citations.mjs` with zero new issues across all `/resources/` pages.
- [ ] Lighthouse: no contrast or name-role-value a11y regressions; widget adds < 3 KB gzipped JS.

### Accuracy, accessibility & compliance notes
- **No new GC accuracy-contract figures** are introduced by this feature (it carries no `$72`, `10%`, `89%`, etc. claims), so it can't violate the contract — but the widget must not sit *inside* the `.gcbox` CTA, so the single-CTA rule per page is preserved.
- **PII / money-transmitter posture:** the design captures **no PII** by default — no email field, no name, IP only transiently for rate-limiting and never stored, comment text stored separately from GA4. Add one sentence to `/cookies` and `/privacy` noting "we collect anonymous page-helpfulness feedback and aggregate usage analytics; we never ask for your identity." Legal review: light — a one-paragraph privacy-page update, no contract/regulatory review needed since nothing custodial or identity-bearing is involved.
- **WCAG 2.1 AA:** native `<button>`/`<form>`, `aria-pressed` toggle state, `aria-live="polite"` confirmation, 4.5:1 contrast on brand-token buttons, full keyboard operability, and a visible focus indicator — per the [Deque](https://www.deque.com/blog/accessible-aria-buttons/) and [Sara Soueidan ARIA live-region](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/) guidance.
- **Keeping it current:** the quarterly runbook *is* the currency mechanism — every fixed page gets a fresh `Last verified` date, which the citation gate enforces, so the act of acting on feedback also keeps the accuracy claim defensible.

### Effort, cost & sequencing
- **Effort:** M. Dev ≈ 1 wk (shared `analytics.js` + `feedback.js`, event hooks, optional ~40-line Worker). Marketing ≈ 2-3 days (microcopy, GA4 custom-dimension setup, runbook). QA ≈ 1 day across page types.
- **Cost:** $0. GA4 is already provisioned; the optional comment store fits comfortably inside [Cloudflare's free Workers/KV tier](https://blog.cloudflare.com/workers-kv-free-tier/). No subscriptions, no SaaS form vendor needed (Forminit-style hosted forms would work but aren't necessary given the existing static stack).
- **Sequencing:** Do this **early/first** among the remaining 9→10 improvements — it's the measurement substrate that tells you which *other* improvements actually paid off. Ship the GA4 loader + yes/no widget + the three usage events as a fast first slice (high value, low risk), then layer the comment backend and the first quarterly review (Jul 2026, ahead of the September launch) once data starts accruing.

**Sources:** [Forminit — "Was this page helpful?" widget](https://forminit.com/blog/was-this-page-helpful-feedback-widget/) · [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/) · [Cloudflare Workers KV free tier](https://blog.cloudflare.com/workers-kv-free-tier/) · [Analytics Mania — GA4 custom events](https://www.analyticsmania.com/post/how-to-track-custom-events-with-google-analytics-4/) · [Clutch — content-decay audits (cadence)](https://clutch.co/resources/content-decay-audits) · [Fractl — content decay & GA4 engagement signals](https://www.frac.tl/content-decay-updating-underperforming-content/) · [Mighty Citizen — 2026 nonprofit marketing/analytics benchmarks](https://www.mightycitizen.com/insights/articles/2026-nonprofit-marketing-benchmarks) · [Deque — accessible ARIA buttons](https://www.deque.com/blog/accessible-aria-buttons/) · [Sara Soueidan — ARIA live regions](https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2/) · [EFF — online privacy for nonprofits](https://www.eff.org/pages/online-privacy-nonprofits)

---

## 10. GEO / AI-Citation Layer: Dataset Schema, a Machine-Readable Index, and Standardized "Key Facts"

**Why it moves 9 -> 10:** The hub already does the hard SEO work (Article, FAQPage, BreadcrumbList, HowTo on step guides, one CTA, verified-on dates), so it ranks — but ranking only earns the *link*, not the *citation*. The gap to 10/10 is being the source an AI assistant quotes and attributes by name. Candid already ships a developer-facing `llms.txt` and structured nonprofit datasets; National Council of Nonprofits and Bloomerang win AI Overview citations through fact-dense, answer-first blocks and named-source backing. This improvement closes three concrete gaps the best resources have already closed: (1) the 43-funder directory is the hub's single most quotable, hard-to-replicate asset yet exposes no `Dataset`/machine-readable feed, so AIs can't reliably extract or attribute it; (2) there is no standardized, machine-parseable "key facts" chunk that LLMs preferentially lift (BLUF blocks are cited 2-4x more); and (3) `llms.txt` lists the marketing site and ~30 cornerstone guides but is missing ~70 guides, the tools, the directory, and a clean per-pillar index. Doing this makes Good Circles the attributed authority for "free nonprofit funder directory," "how to find grants," and Mississippi-specific funding queries.

**Primary owner (human labor):** research · content writer · **Also needs:** development (schema injection, feed generation, llms.txt build step)
**Effort:** M (2-3 wks) · **Priority:** P1 · **Dependencies:** none new; reuses the existing static-site + check-seo/check-citations gate and the `window.FUNDER_DATA` array already embedded in the funder-directory page.

### Definition of done
1. The funder directory carries valid `Dataset` JSON-LD and publishes a static, machine-readable `funders.json` feed (one canonical record shape) generated from the same source data already on the page — no second source of truth.
2. Every in-depth guide and tool page exposes a standardized, visible **"Key facts"** block (BLUF bullets) that is also emitted in machine-readable form, so an LLM can lift a self-contained, attributable summary.
3. `llms.txt` is regenerated by a build step into a complete, sectioned, machine-readable index of **all** live resource URLs (guides, tools, templates, directory, Spanish cornerstones), each with a one-line description, replacing today's hand-maintained partial list.
4. Schema choices reflect 2026 reality: keep HowTo (still parsed for AI extraction even though Google dropped the rich result); **do not** add Course schema for the (non-existent) "email courses" or VideoObject (no videos exist) — instead the spec records the exact trigger that would make each worthwhile later.
5. The existing build gate passes unchanged, plus one new lightweight gate check (below). A documented monthly AI-citation audit runs against a fixed question list.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Benchmark & decide (2 days)**
1. Run a baseline **citation audit**. In ChatGPT (web search on), Perplexity, Google AI Overviews, and Claude, ask 15 fixed questions the hub should own, e.g. "free nonprofit funder directory," "how do nonprofits find grants for free," "Mississippi foundation grants for nonprofits," "AmazonSmile alternative for nonprofits," "what is the public support test." For each, record: did goodcircles.org appear, was it *cited by name*, and which competitor was cited instead. Save as a dated table — this is the before/after scorecard. (Best practice: content updated within ~30 days gets materially more AI citations, so freshness compounds with this work.)
2. Inspect two benchmarks directly: **Candid's** `https://developer.candid.org/llms.txt` (how a nonprofit-data leader structures a machine index) and a **National Council of Nonprofits** guide (how answer-first, fact-dense blocks read). Note format only — do not copy content.
3. Confirm the schema decision with the rationale already grounded: HowTo and FAQPage rich results were deprecated/dropped by Google in 2025-2026, **but the markup is still parsed by AI crawlers**, so we keep them. Course and VideoObject add nothing today because there are no courses or videos. Decision is settled — no further research needed.

**Phase B — Author the "Key facts" blocks (1.5 wks, the bulk of the work)**
4. For each in-depth guide, write a **3-5 bullet "Key facts" block** following BLUF rules: each bullet is one complete, standalone, fact-dense sentence that names entities and numbers explicitly (a citing AI must be able to lift one bullet with zero surrounding context). Example for *How to Find Grants*: "Nonprofits find grants through five free sources: Candid's Foundation Directory (free at Funding Information Network libraries), Grants.gov for federal funding, funders' IRS Form 990-PF filings on ProPublica Nonprofit Explorer, community foundations, and corporate giving programs."
5. Reuse, don't reinvent: most guides already have an "answer box" — the Key facts block is the *itemized, atomic* version of it. Mine the answer box and worked example for the figures.
6. **No new statistics.** Only restate figures already verified on the page. Any GC mention must use the accuracy contract verbatim: ~10% shopper savings (estimate), 10% of merchant **net profit** to the nonprofit, merchants keep 89% on a 1% profit fee, free for nonprofits, ~$72/active supporter/yr (estimate). Do not introduce custody/wallet language.
7. For the funder directory specifically, write the **Dataset description** prose (1-2 sentences: what it covers, how many records, geography, refresh cadence, that it is built from public information) and a plain-language "what each field means" note that doubles as the dataset's `variableMeasured` labels.

**Phase C — Assemble the developer package (2 days)**
8. Deliver the Key facts bullets as a single structured file (one entry per URL — see schema below), so dev can inject both the visible block and its machine form without re-keying.
9. Deliver the Dataset field dictionary and the directory's `last-verified`/`next refresh` dates (these already exist on the page: "Updated June 17, 2026 · 43 verified funders · refreshed quarterly · next refresh September 2026").
10. Hand off the fixed 15-question audit list so it becomes a recurring monthly task (calendar reminder), re-run after launch.

### Developer handoff package (what the staff member submits to development)

**1. Content/data structures**

*(a) Per-page Key Facts source (`keyfacts.json`, authored by content, consumed at build):*
```json
{
  "/resources/grants/how-to-find-grants/": {
    "keyFacts": [
      "Nonprofits find grants through five free sources: Candid's Foundation Directory (free at Funding Information Network libraries), Grants.gov, funders' IRS Form 990-PF filings via ProPublica Nonprofit Explorer, community foundations, and corporate giving programs.",
      "Reading a funder's Form 990-PF reveals its real grant range and exactly which organizations it funded — the step most applicants skip.",
      "A short, well-researched pipeline of good-fit funders outperforms volume applications."
    ]
  }
}
```
Renders as a visible `<section class="keyfacts"><h2>Key facts</h2><ul><li>…</li></ul></section>` placed immediately after the existing answer box, AND each bullet must appear verbatim in visible text (mirrors the existing FAQ-verbatim rule).

*(b) Funder directory `Dataset` JSON-LD (added alongside the existing CollectionPage block — keep both):*
```json
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Nonprofit Funder Directory (Good Circles)",
  "description": "A free, curated directory of 43 verified U.S. nonprofit funders — national foundations, corporate and community funders, and Mississippi/Deep-South regional grantmakers — built entirely from public information. Refreshed quarterly.",
  "url": "https://goodcircles.org/resources/grants/funder-directory/",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "creator": { "@type": "Organization", "name": "Good Circles", "url": "https://goodcircles.org" },
  "dateModified": "2026-06-17",
  "variableMeasured": ["Funder name","Focus areas","Geography","Application type","Typical grant size","Deadline cadence","Source URL"],
  "distribution": [{
    "@type": "DataDownload",
    "encodingFormat": "application/json",
    "contentUrl": "https://goodcircles.org/resources/grants/funder-directory/funders.json"
  }]
}
```

*(c) `funders.json` machine feed — generated, not hand-written.* It must be derived from the existing `window.FUNDER_DATA` array (current record shape is already clean: `name, url, focusAreas[], geography, applicationType, typicalGrantSize, deadlineCadence, notes, sourceUrl`). Add a top-level wrapper `{ "lastVerified": "2026-06-17", "recordCount": 43, "license": "CC BY 4.0", "funders": [ … ] }`. **Single source of truth:** either (i) lift `FUNDER_DATA` into a standalone `funders.json` that the page loads at runtime and the build copies through, or (ii) keep it inline and have a tiny build script extract it to the public feed. Prefer (i) — it removes the inline blob and the duplication risk.

*(d) `llms.txt` build step.* Add `scripts/build-llms.mjs` to the `npm run build` chain (it already runs `_compile_docs.mjs`-style scripts). It walks `dist/resources/**/index.html`, reads each page's `<title>` and meta description, and regenerates the `## Nonprofit Resource Center` portion of `llms.txt` into per-pillar `##` sections (Start & structure, Governance, Grants, Program design, Fundraising, Passive funding, Marketing, Donor development, Operations, HR, Tools, Templates, Funder directory), each entry `- [Title](url): description`. Spanish cornerstones go under an `## Español (es)` section. The marketing-site portion (top of file) stays hand-maintained; only the resource index is generated. Add a final line: `## Optional` listing the raw feed + the `funders.json` data URL for agents. Keep `public/llms.txt` and `dist/llms.txt` identical (they are today).

**2. URLs / placement in the IA**
- `funders.json` → `https://goodcircles.org/resources/grants/funder-directory/funders.json` (co-located with the page; served as a static asset).
- Key facts block → injected into every guide + tool page template, directly under the answer box, above the TOC.
- `llms.txt` → unchanged location `https://goodcircles.org/llms.txt` (HTTP 200, no redirect, `text/plain; charset=utf-8`).
- No new indexable HTML routes are created (feed is JSON; gate only checks `.html`).

**3. Build-gate & SEO requirements it must satisfy**
- **Reuse existing gate unchanged:** single H1 (the new block uses `<h2>Key facts</h2>`, not H1), absolute self-canonical trailing-slash, og:title===title, all JSON-LD parses, no internal `.html` links, all internal links resolve, sitemap/noindex consistency.
- **FAQ-verbatim rule extended in spirit:** every Key facts bullet must appear in visible text (it already will, since the block is visible) — no schema-only claims.
- **Sources+date rule:** the directory and any sourced guide keep their existing "Sources & tools" + `Last verified YYYY-MM-DD` stamp (check-citations.mjs already enforces this). The `Dataset.dateModified` and `funders.json.lastVerified` must equal the page's visible "Updated …" date.
- **One new tiny gate** (add to `check-seo.mjs` or a sibling): assert `funders.json` exists, parses, `recordCount` equals the array length and matches the "43 verified funders" figure on the page, and that any page emitting `Dataset` JSON-LD has a resolvable `distribution.contentUrl`. This keeps the dataset claim honest the same way `check-citations.mjs` keeps figures honest.
- JSON-LD types in play: `Dataset` + `DataDownload` (new), existing `Article`/`HowTo`/`FAQPage`/`BreadcrumbList`/`CollectionPage`/`WebApplication` unchanged.

**4. Interaction / UX behavior**
- Key facts block is static (no JS). Funder directory keeps its existing client-side search/filter; the only change is its data may now load from `funders.json` instead of an inline blob (must degrade gracefully — if fetch fails, page still renders, or keep inline and copy-extract per option (ii)).

**5. Acceptance criteria / QA checklist**
- [ ] `npm run build` passes check-seo.mjs, check-citations.mjs, and the new dataset check with 0 issues.
- [ ] `funders.json` validates as JSON, `recordCount === funders.length === 43` and equals the on-page count.
- [ ] Funder-directory page validates in Google Rich Results Test / Schema.org validator as `Dataset` with a working `DataDownload`.
- [ ] Every guide/tool page shows a visible "Key facts" block under the answer box; each bullet is a complete standalone sentence; all bullets present in `keyfacts.json`.
- [ ] Regenerated `llms.txt` lists every live resource URL (count matches sitemap resource-URL count), is valid Markdown with one H1 + `##` sections, returns HTTP 200 as `text/plain`, and contains the `funders.json` link under `## Optional`.
- [ ] No Course or VideoObject schema added; HowTo retained on step guides.
- [ ] Spot-check: paste 3 guides into an LLM and ask "summarize and cite the source" — it lifts the Key facts and attributes goodcircles.org.

### Accuracy, accessibility & compliance notes
- **Figures to verify:** the "43 verified funders" count (must match feed + Dataset + page), each funder record's `last-verified`/source URL (already maintained), and any GC figure in a Key facts bullet against the accuracy contract (~10%/10% net profit/89%/1%/free/~$72 estimate; no custody language). The new gate enforces the count; check-citations.mjs continues to catch stale watch-list figures.
- **Legal review:** light. Declaring `license: CC BY 4.0` on the funder dataset is a deliberate, low-risk choice (it is built from public information and CC BY invites attributed reuse — exactly the citation behavior we want); confirm leadership is comfortable licensing the compiled directory for attributed reuse. No PII is added — funder records are public organizational data only, consistent with the no-unnecessary-PII posture.
- **WCAG 2.1 AA:** the Key facts block is a real `<h2>` + `<ul>` (programmatic structure, screen-reader friendly), inherits existing brand-token contrast (Ink #2E1B4E on white passes AA), adds no color-only meaning, and adds no new interactive controls. `funders.json` is non-visual and exempt.
- **Keeping it current:** `llms.txt` and the Dataset `dateModified` regenerate on every build, so they never drift from published content. The funder feed inherits the existing quarterly refresh (next: September 2026). The 15-question citation audit becomes a standing monthly task — freshness is itself a citation factor, so the monthly cadence both measures and improves results.

### Effort, cost & sequencing
- **Effort:** M, ~2-3 weeks. Roughly 60% content labor (authoring Key facts bullets across ~96 guides + tools — the long pole), 40% development (Dataset schema injection, `funders.json` extraction, `build-llms.mjs`, the new gate check). Content can be batched per pillar and shipped incrementally; schema/feed/llms.txt are a single dev pass.
- **Third-party cost:** **$0.** All build-time, static-file work; the citation audit uses free tiers of ChatGPT/Perplexity/Google/Claude. No new dependencies, no runtime services, no custody, no PII.
- **Sequencing:** Do this **after** content/SEO foundations (already done) and ideally **alongside or just after** any funder-directory expansion, since the directory is the highest-value Dataset target — schema-tag it once the record count is stable. The `build-llms.mjs` step should land last so it indexes the final URL set. This is P1 because it converts existing #1-quality content into attributed AI citations — the specific reach gap between a 9 and a genuine 10.

**Sources:** [Animalz — techniques that get cited in answer engines](https://www.animalz.co/blog/ai-aeo-answer-engine-citation) · [Previsible — content formats that win AI citations](https://previsible.io/seo-ai-news/which-content-formats-win-in-ai/) · [Kime.ai — structuring content for LLM extraction (GEO 2026)](https://kime.ai/blog/how-to-structure-content-for-llm-extraction-geo-guide-2026) · [Search Engine Journal — FAQ removal & schema's AI-search value](https://www.searchenginejournal.com/serp-faq-removal-new-data-challenge-schemas-ai-search-value/574993/) · [Candid — llms.txt / developer data](https://developer.candid.org/docs) · [Candid — about our data](https://candid.org/about/our-data/) · [Medium (Sourceable) — llms.txt implementation guide 2026](https://medium.com/@besourceable/llms-txt-the-complete-implementation-guide-for-2026-34c8abac6576)

---

## 11. Live Data Partnerships — Funder + Benchmark Feeds (bizdev + ingest pipeline)

**Why it moves 9 -> 10:** The funder directory and any benchmark figures are hand-curated and re-verified quarterly, which is honest and defensible but caps the directory at ~43 funders and bounds freshness to a 90-day window — exactly the gap that separates a strong free hub from a category leader. The best resources solve this with data, not labor: Candid sits on millions of normalized records and exposes them via API; Charity Navigator and ProPublica's Nonprofit Explorer are built directly on the free IRS 990 e-file and Business Master File feeds; Instrumentl/GrantStation maintain live opportunity data that small nonprofits otherwise pay $139–$699/yr to reach. Wiring Good Circles into the *free* public data (ProPublica API + IRS EO BMF + 990 e-file index on AWS) lets the directory verify EIN/status/financials automatically and scale to hundreds of entries without adding payroll, while a clearly-scoped paid track (Candid Charity Check, Instrumentl/GrantStation affiliate or data partnership) is documented so the org can pull the trigger the moment it is funded. This closes the credibility gap ("how current, how comprehensive?") and the reach gap (43 -> hundreds) at near-zero marginal cost, while keeping the strict-gate static architecture intact.

**Primary owner (human labor):** bizdev · **Also needs:** development (ingest pipeline), research (data QA), light legal review (data-licensing terms)
**Effort:** L (1–2 mo for the free Phase 1 pipeline + partnership outreach; paid integrations are follow-on) · **Priority:** P2 · **Dependencies:** existing `funder-directory/index.html` schema and `check-citations.mjs`/`check-seo.mjs` gates; a build environment that can run a Node ingest script before `astro build` (already present — the site uses Node build scripts).

### Definition of done
1. A documented, signed-off **data-sourcing strategy** that cleanly separates **Free/Now** (ProPublica Nonprofit Explorer API, IRS EO BMF monthly extract, IRS 990 e-file index on AWS) from **Paid/Later** (Candid Charity Check or Premier API, Instrumentl, GrantStation, GrantWatch), each with concrete ask, cost band, terms, and integration effort.
2. A working **Phase-1 enrichment pipeline** (free sources only) that runs at build time: it reads the existing `window.FUNDER_DATA` records, auto-verifies each funder's EIN/tax-exempt status and pulls latest 990 financial signals + a canonical ProPublica link, normalizes them into new optional fields in the existing schema, and **stamps a machine-checked freshness date** — without changing the directory's no-login, no-PII, static-HTML nature.
3. The directory page still passes `check-seo.mjs` and `check-citations.mjs` unchanged, and gains an auditable "data sources & method" disclosure block (with `Last verified` date) so the freshness claim is provable, not asserted.
4. A **one-page partnership brief per paid candidate** that a funded org can act on in a single afternoon (contact, ask, price, contract type, what it unlocks, integration outline).

### The human work (step-by-step for a marketing/research staff member)

**A. Map what's free and authoritative (research — do this first, ~2 days)**
1. Read and bookmark the three free, no-cost, no-auth public sources that the best nonprofit data products are built on:
   - **ProPublica Nonprofit Explorer API** — free, unauthenticated, JSON. Two endpoints you need: organization profile (`/organizations/{EIN}.json`) and full-text search (`/search.json?q=...`). It returns IRS summary financials (revenue, expenses, net assets, contributions) plus the canonical Nonprofit Explorer URL. Note their Data Terms of Use and the polite-rate guidance (~300 ms between calls). (`projects.propublica.org/nonprofits/` and `propublica.org/nerds/announcing-the-nonprofit-explorer-api`)
   - **IRS Exempt Organizations Business Master File (EO BMF)** — free CSV extracts, one file per state + DC + PR, refreshed monthly from the IRS Business Master File. Fields include EIN, name, address, foundation code, deductibility code, filing-requirement code, ruling date, NTEE/asset/income codes. This is the authoritative "is this entity still a recognized exempt org and what type" check. (`irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf`; field decoder at `irs.gov/pub/irs-soi/eo-info.pdf`)
   - **IRS 990 e-file data on AWS** — free public S3 dataset (`registry.opendata.aws/irs990/`), 2011–present, XML per filing, with a machine-readable index (`s3://irs-form-990/index.json`) listing filer name, EIN, form type (990/990-EZ/990-PF), filing date, and the XML URL. Use the **Nonprofit Open Data Collective** concordance/efile-index resources to map XML fields without parsing raw schemas yourself (`nonprofit-open-data-collective.github.io/irs-990-efile-index/`).
2. For each of the 43 existing funders that has a ProPublica link (most of the MS-regional ones already do; the EIN is the last path segment of that URL, e.g. `.../organizations/640845750`), record the EIN in a tracking sheet. For funders missing an EIN (mostly the national corporate programs), look up the legal foundation entity (e.g., "Bank of America Charitable Foundation") in Nonprofit Explorer search and capture the EIN. This EIN list is the join key for the entire pipeline.

**B. Benchmark how the best resources handle live data (research, ~half a day)**
3. Confirm the pattern: Charity Navigator and ProPublica build on the free IRS feeds (above); Candid resells normalized data via API; Instrumentl/GrantStation maintain live *opportunity* data behind a subscription. Write a half-page "build vs. buy" note: **funder identity, status, and financials = free IRS/ProPublica data we can ingest now; live opportunity/deadline data = the thing worth paying for later.** This framing drives the whole spec and prevents over-buying.

**C. Scope the paid candidates (bizdev, ~3–4 days; outreach only — do NOT contract pre-funding per the no-spend posture)**
4. **Candid** — has a developer portal (`developer.candid.org`) with Essentials (org search), Premier (deep org data), and **Charity Check** (instant IRS charitable-status verification) APIs. There is a free trial; production pricing is quote-based and Candid prices nonprofits/limited-budget orgs lower than corporates. The *free, no-API* fallback already linked on the page (990 Finder + in-person Foundation Directory at Funding Information Network libraries) stays. Ask Candid two specific questions: (a) is there a free/low-volume **Charity Check** tier for a nonprofit-serving free resource, and (b) what does an **Essentials/Premier** read-only license cost for ~hundreds of orgs refreshed quarterly. Capture that FIN partner access itself runs **$2,995/yr (Access) or $5,995/yr (Training)** — relevant only if GC ever hosts in-person funder research, not needed for the directory.
5. **Instrumentl** — has a public partner/affiliate program (`instrumentl.com/partners`) and a free browse-grants directory + 14-day no-card trial. Ask for: (a) an affiliate/referral arrangement (deep-link the existing listing), and (b) whether they offer a co-marketing data feed or embeddable opportunity widget for a nonprofit coalition. Realistic outcome: affiliate link + co-marketing, not raw data.
6. **GrantStation** — list price **$699/yr**, but the standard nonprofit-association member rate is **~$139/yr** (80% off) and they run an affiliate program. Ask whether GC's state-association relationships (it already links the MS Alliance and National Council of Nonprofits) unlock the $139 rate or an affiliate deep-link. **GrantWatch** — free browse, paid to view full details; affiliate/deep-link only.
7. For each paid candidate, fill a one-page brief: contact + portal URL, the exact ask, price band, contract type (API license / affiliate / FIN membership), what it unlocks, data-license redistribution constraints (critical — see compliance), and rough integration effort. Mark all as **"Paid/Later — action on funding."**

**D. Decide and document (bizdev + research, ~1 day)**
8. Recommendation to lock in: **ship Phase 1 (free) now; defer all paid integrations.** Write the "data sources & method" copy that will appear on the directory (plain-language: what's auto-verified from IRS/ProPublica, what's hand-curated, how often, and the standard disclaimer that funders change priorities — confirm at the source). Keep the existing quarterly human re-verification of *editorial* fields (focus areas, deadline cadence, application type) — those are judgment calls the free APIs cannot supply.

### Developer handoff package

**Content/data structure (extend the existing schema — additive only).** Today each record in `window.FUNDER_DATA.funders[]` has: `name, url, focusAreas[], geography, applicationType, typicalGrantSize, deadlineCadence, notes, sourceUrl`, optional `propublica`, and a top-level `lastVerified`. Add these **optional, machine-populated** fields (human editorial fields are untouched):

```jsonc
{
  "name": "Gertrude C. Ford Foundation",
  "ein": "640804548",                         // join key (string, no dashes)
  "propublica": "https://projects.propublica.org/nonprofits/organizations/640804548",
  "verified": {                                // NEW — auto-filled by ingest, all optional
    "statusOk": true,                          // EIN present & active in IRS EO BMF
    "foundationCode": "04",                    // from BMF (private foundation, etc.)
    "deductible": true,                        // BMF deductibility code 1
    "latestFiling": { "form": "990PF", "fyEnd": "2024-12", "filedOn": "2025-08-14" },
    "financials": { "totalRevenue": 5421233, "totalExpenses": 4980112, "netAssets": 88210440, "fiscalYear": 2024 },
    "source": "ProPublica Nonprofit Explorer + IRS EO BMF",
    "checkedOn": "2026-09-15"                  // ISO date, drives freshness stamp
  }
}
```
Records with no EIN (corporate giving programs not filing their own 990) simply omit `ein`/`verified` and render exactly as today — the pipeline must degrade gracefully.

**Pipeline (new build-time Node script, e.g. `scripts/enrich-funders.mjs`, runs BEFORE `astro build`, never at runtime):**
1. **Ingest** — for each record with an `ein`: (a) GET `https://projects.propublica.org/nonprofits/api/v2/organizations/{EIN}.json` (free, no key, throttle ≥300 ms/call), (b) look up the EIN row in the cached state EO BMF CSV for status/foundation/deductibility codes, (c) optionally read the AWS 990 index for the latest filing form + date. Cache the BMF CSVs and ProPublica responses locally (e.g. `scripts/.cache/`) so the build is reproducible and not network-flaky; refresh cache monthly.
2. **Normalize** — map raw fields into the `verified{}` object above using the IRS field decoder and the NODC concordance; round/whitelist only the few financial fields shown; drop everything else (no PII, no officer comp on the public page).
3. **Merge & write** — patch `verified{}` into each record, set top-level `lastVerified` to the run date, and write the updated `window.FUNDER_DATA` block back into `funder-directory/index.html` (or, cleaner, externalize the data to a generated JSON the page reads — keep it inline if that's simpler for the gate). No schema field is ever removed; unknown/failed lookups leave `verified` absent.
4. **Render** — extend the existing client-side `card()` function to show, when `verified` exists, a small "IRS-verified · checked {checkedOn}" badge and an optional "FY{year} revenue/expenses" line. The existing search/filter logic is unchanged (new fields are display-only).

**URL / IA placement.** No new URL. Everything lands on the existing `https://goodcircles.org/resources/grants/funder-directory/`. The "data sources & method" copy goes into the existing **"How this directory is maintained"** callout plus the **"Sources & tools"** block already on the page.

**Build-gate & SEO requirements (reuse existing gates — must still pass):**
- Single `<h1>` ("Nonprofit Funder Directory") — unchanged.
- Absolute self-canonical with trailing slash — unchanged.
- `og:title` === `<title>` — unchanged.
- Valid JSON-LD: keep the existing `CollectionPage` + `FAQPage` + `BreadcrumbList`. If a financial figure is surfaced in JSON-LD, it must also appear in visible text (the gate enforces FAQ-verbatim; do not introduce schema-only claims).
- **Sources + date:** the page already carries the `Sources & tools` block and a `Last verified YYYY-MM-DD` stamp — `check-citations.mjs` requires this. The pipeline must keep that stamp present and current (it sets it from `checkedOn`).
- In `sitemap.xml`, not `noindex` — unchanged.
- All internal links resolve, no `.html` internal links — unchanged.
- **figure-watchlist:** if the page states a count ("43 verified funders"), the dateline, answer box, meta description, OG description, and `CollectionPage` schema all repeat it — the ingest/edit step must update **all** occurrences together or `check-citations.mjs` will (correctly) flag a stale figure. Add the funder count to the watch-list so drift fails the build.

**Interaction / UX behavior.** Filtering/search behavior is unchanged. New `verified` data renders as a non-interactive badge + one financial line per card; absent data renders nothing (no empty labels). No new network calls in the browser — all enrichment is baked at build time, preserving the no-login/no-PII static posture.

**Acceptance criteria / QA checklist:**
- [ ] `scripts/enrich-funders.mjs` runs offline from cached IRS BMF + ProPublica responses and is idempotent (same inputs -> same HTML).
- [ ] Every funder with a known EIN gets a `verified.statusOk`; any EIN not found in the BMF logs a warning and the build still completes (graceful degrade).
- [ ] No officer names, addresses, or other PII are written to the page — only the whitelisted financial summary fields.
- [ ] `npm run build` passes `check-seo.mjs` and `check-citations.mjs` with zero new errors.
- [ ] The funder count is identical across `<title>`, meta description, OG description, dateline, answer box, and `CollectionPage` JSON-LD.
- [ ] `Last verified YYYY-MM-DD` reflects the latest pipeline run; the "data sources & method" disclosure names ProPublica + IRS and the quarterly editorial re-verify.
- [ ] ProPublica calls are throttled (≥300 ms) and the run respects their Data Terms of Use.
- [ ] Page works with JS disabled for the static content; the directory list (JS-rendered today) behavior is unchanged from current.
- [ ] One paid-candidate brief exists for each of Candid, Instrumentl, GrantStation, GrantWatch, each marked "action on funding."

### Accuracy, accessibility & compliance notes
- **Figures to verify:** funder count (single source of truth, on the watch-list); any financial figure shown must come straight from ProPublica/IRS and carry the FY and `checkedOn` date. Do not compute or editorialize financials. Keep the GC accuracy-contract block exactly as written (10% of merchant **net profit**; ~10% shopper savings *estimate*; merchants keep 89% on a 1% fee; free for nonprofits; ~$72/active supporter/yr *estimate*) — this improvement does not touch GC's own numbers.
- **Data licensing (light legal review):** IRS BMF, IRS 990 e-file, and ProPublica are public/free, but ProPublica's **Data Terms of Use** govern reuse — review before shipping and credit ProPublica as the source on-page (already linked). For any **paid** source (Candid/Instrumentl/GrantStation), redistribution of their proprietary data into a public free page is typically **prohibited** by license — which is the core reason Phase 1 deliberately uses only public-domain government/ProPublica data; paid sources should be used for affiliate deep-links or internal research, not republished. Flag this explicitly in each paid brief.
- **No-PII / no-custody posture:** the pipeline writes only org-level public financials and status — no individuals, no donor data, no payment data. Consistent with the lean, no-PII, money-transmitter-avoidance constraints.
- **WCAG 2.1 AA:** the new "IRS-verified" badge must not rely on color alone (include the text label and a date); maintain 4.5:1 contrast against card backgrounds using existing brand tokens; the financial line must be real text (not an image) and read sensibly to a screen reader (e.g., "FY2024 revenue $5.4M, expenses $5.0M"). No change to focus order or keyboard operability of the existing filters.
- **Keeping it current:** monthly cache refresh of the BMF + ProPublica responses (cheap, automatable); the existing **quarterly** human pass continues to own the editorial fields (deadline cadence, application type, priorities) that no API can supply. The build-gate freshness stamp prevents an un-refreshed page from shipping silently.

### Effort, cost & sequencing
- **Effort:** Phase 1 (free pipeline + on-page disclosure + paid briefs) ≈ L, ~1–2 months end-to-end, mostly the ingest/normalize/merge script and QA against the existing gates; bizdev outreach runs in parallel and is conversational, not contractual.
- **Third-party cost:** **$0 for Phase 1** (ProPublica API, IRS EO BMF, IRS 990 on AWS are all free/no-auth). Deferred/optional: GrantStation **~$139/yr** (member rate) or affiliate; Instrumentl affiliate/co-marketing (no cash); Candid Charity Check/Premier **quote-based**, nonprofit-discounted; Candid FIN partnership **$2,995–$5,995/yr** only if GC ever offers in-person funder research. None are required to ship.
- **Sequencing:** slot **after** the lower-effort polish items and **before** any paid-partnership spend. The free pipeline is the high-leverage, no-cost step that turns the directory's "verified" claim from a manual promise into a machine-checked, auditable fact and unlocks scaling from 43 to hundreds of funders; the paid briefs sit ready in the funded-phase backlog alongside the other deferred-build work.

Sources: [ProPublica Nonprofit Explorer API](https://www.propublica.org/nerds/announcing-the-nonprofit-explorer-api) · [Nonprofit Explorer](https://projects.propublica.org/nonprofits/) · [IRS EO BMF extract](https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf) · [IRS 990 filings on AWS](https://registry.opendata.aws/irs990/) · [Nonprofit Open Data Collective 990 e-file index](https://nonprofit-open-data-collective.github.io/irs-990-efile-index/) · [Candid developer portal](https://developer.candid.org/) · [Candid Funding Information Network FAQ](https://candid.org/improve-your-nonprofit/funding-information-network/frequently-asked-questions) · [Instrumentl Partner Program](https://www.instrumentl.com/partners) · [GrantStation membership](https://grantstation.com/product/grantstation-membership)

---

## 12. "Ask the Hub" — a moderated question intake that turns real nonprofit questions into a living Answers library

**Why it moves 9 -> 10:** A 96-guide static hub is comprehensive but one-directional — it answers the questions Good Circles *guessed* nonprofits have, not the ones they're actually typing into a search bar at 11pm. The best resources close this loop: Candid's free [Online Librarian](https://candid.org/get-help/online-librarian) takes real questions and answers them, Nonprofit Quarterly runs a recurring ["Ask a Nonprofit Expert"](https://nonprofitquarterly.org/series/ask-a-nonprofit-expert/) column, and National Council of Nonprofits / state associations offer member "Ask an Expert" services. None of them is free *and* publicly published *and* fed back into an SEO-optimized library. Adding a moderated intake that converts vetted questions into short, schema-marked answer pages makes the hub demonstrably *living* (fresh-dated content, real demand signal), builds trust (a human will actually answer you), and compounds SEO/AI-Overview reach — every published answer is a new long-tail entry that no competitor's gated service can rank for. It is the single lowest-lift way to convert the hub from "library" to "service."

**Primary owner (human labor):** content writer · **Also needs:** development (one-time wiring of form + page template; ~1 day), research (source-checking each answer), QA (build gate)
**Effort:** M (1-3 wks for v1: template + 8-12 seed answers + workflow) · **Priority:** P1 · **Dependencies:** none hard; complements the existing `/answers/` pattern on the marketing site and the `/resources/` static bundle. A free Tally account (no card).

### Definition of done
1. A public **"Ask the hub"** intake form (no login, no PII required beyond an optional email-for-reply) is reachable from the resources hub and from the foot of every guide.
2. A new crawlable index at **`/resources/answers/`** lists published answers; each answer lives at **`/resources/answers/{slug}/`** as a static HTML page built to the exact same gate the rest of the hub passes.
3. A written, repeatable **editorial workflow** exists (intake -> triage -> draft -> source-check -> publish -> link) that a single content/research staffer runs on a weekly cadence with no developer involvement after the template ships.
4. At least **8-12 seed answer pages** are published at launch (so the hub is never empty), each derived from a real or realistic high-intent question, each carrying a "Last verified" date, a Sources block, and a single Good Circles CTA.
5. The full hub still passes `check-seo.mjs` and `check-citations.mjs` with zero new issues, and the new pages are in the sitemap.

### The human work (step-by-step for a marketing/research staff member)

**Phase A — Set up the intake (½ day, one-time)**
1. Create a **free Tally account** (free tier: unlimited forms, 100 submissions/mo, GDPR-compliant, built-in honeypot spam protection — see [Tally](https://tally.so); chosen over Formspree because Formspree's free tier caps at 50/mo and locks spam protection behind paid plans, per [Toolradar](https://toolradar.com/tools/formspree/pricing)). Use a `@goodcircles.org` alias as the form owner — never the personal Family First gmail.
2. Build a 4-field form: **(1) Your question** (required, long text, 280-char min so we get specifics), **(2) Topic** (dropdown matching the 11 pillars + "Other"), **(3) Your role** (optional: ED / board / volunteer / starting a nonprofit / other — used only to gauge audience, no name), **(4) Email if you'd like a reply** (optional, clearly labeled optional). Do **not** collect name, org name, address, or phone. Turn on Tally's honeypot + (free) email-verification-off to keep friction low.
3. In Tally, set the form to email new submissions to the `@goodcircles.org` resources inbox and (optional) pipe to a free Google Sheet for the triage queue. Add a confirmation message: *"Thanks — we read every question. If it helps other nonprofits, we'll publish a free answer in our Answers library (no names, ever). If you left an email, we may reply directly."*

**Phase B — Build the answer-writing playbook (½ day, one-time)**
4. Write a one-page editorial standard the team will reuse: each published answer is **150-350 words**, leads with a **direct 1-2 sentence answer**, then context, then "what to do next," then a Sources block. Tone matches the existing hub (plain-language, practitioner-first — the NPQ/Candid model, not legalese).
5. Decide the **non-advice boundary** up front (mirrors Candid's published scope): the hub answers questions about nonprofit management, fundraising, grants, compliance *processes*, and marketing — it does **not** give legal, tax, or accounting advice, write/review anyone's proposal, or recommend specific funders to approach. Draft a standing disclaimer line for every answer page: *"This is general information for nonprofits, not legal, tax, or financial advice. Verify with a qualified professional before you act."*

**Phase C — Run the weekly loop (ongoing, ~2-3 hrs/wk)**
6. **Triage:** each week, pull new submissions, drop spam/PII-laden ones, and tag each as: *(a) already answered by an existing guide* (reply with the link if they left an email; no new page), *(b) good for a new Answer page*, or *(c) too narrow/needs a pro*.
7. **Draft** the (b) questions. **Rewrite the question generically** so it's a useful search query and contains zero submitter identity (e.g., "Can our small church run a raffle without losing tax exemption?" not anything naming the submitter).
8. **Source-check every factual claim** against free authorities before publishing — same sources the hub already cites: [IRS Charities & Nonprofits](https://www.irs.gov/charities-non-profits), [National Council of Nonprofits](https://www.councilofnonprofits.org/), [Candid Learning](https://learning.candid.org/), and state charity-official sites. Record the verification date.
9. **Assemble the answer record** (schema below) and hand the batch to dev — or, once comfortable, copy an existing answer HTML file, fill in the fields, and add it to the index yourself (it's static HTML; no build skills needed beyond find-and-replace).
10. **Link it in:** add the new answer to the `/resources/answers/` index and add a "Related" link from the most relevant in-depth guide, so the answer isn't an orphan.
11. **Recycle into guides:** when 3-4 answers cluster on one theme that the hub lacks, that's the signal to commission a full guide — the intake becomes the hub's content-roadmap engine.

### Developer handoff package

**Content/data structure (one record per answer).** Store as a small JSON/array the staffer appends to (`answers.json`), mirroring the marketing site's existing `data/answers.ts` pattern:
```json
{
  "slug": "church-raffle-tax-exemption",
  "question": "Can a church run a raffle without risking its tax-exempt status?",
  "pillar": "governance-compliance",
  "answer_html": "<p>Generally yes, but raffles are regulated gambling in most states and may create <b>unrelated business income</b> (UBI)…</p>",
  "next_steps_html": "<ul class=\"check\"><li>Check your state charitable-gaming rules…</li></ul>",
  "sources": [
    {"label": "IRS — Unrelated Business Income", "url": "https://www.irs.gov/charities-non-profits/unrelated-business-income-tax", "note": "Defines when fundraising income is taxable.", "tier": "free"}
  ],
  "verified_on": "2026-06-17",
  "related": ["/resources/governance-compliance/annual-compliance-checklist/"],
  "asked_anonymously": true
}
```

**URL(s) / placement in the IA.**
- Index hub: `/resources/answers/` (new top-level resource section; add a card to the `/resources/` `catgrid` and a nav/footer link).
- Answer pages: `/resources/answers/{slug}/` -> built as `public/resources/answers/{slug}/index.html` (same static-bundle convention as every other guide; the sitemap walker in `astro.config.mjs` `collectResourceUrls()` will pick them up automatically — no config change needed).
- Intake form: render the Tally form **embedded** at `/resources/answers/ask/` (its own static page) and link to it with an "Ask the hub a question" button from (a) the `/resources/answers/` index, (b) the resources home `gcbox`, and (c) a small line in the existing FAQ footer of every guide.

**Build-gate & SEO requirements (must satisfy the existing `check-seo.mjs` + `check-citations.mjs` exactly):**
- Each answer page: **exactly one `<h1>`** (the question), non-empty `<title>` and meta description, **absolute self-canonical in trailing-slash form** (`https://goodcircles.org/resources/answers/{slug}/`), `og:title` **identical** to `<title>`, absolute `og:image` (reuse `/resources/og.png`).
- **JSON-LD per page:** `QAPage` (not FAQPage) — Google reserves QAPage for a single question with answers and FAQPage for editor multi-Q pages ([Google QAPage docs](https://developers.google.com/search/docs/appearance/structured-data/qapage)); since each page is one user question with our one accepted answer, use `QAPage` with `mainEntity` `@type: Question` + `acceptedAnswer`. Also emit `BreadcrumbList` (Good Circles › Resources › Answers › {question}). The `/resources/answers/` index uses `CollectionPage` + `BreadcrumbList`, matching the existing pillar-index pattern.
- Because each page uses the **"Sources & tools"** block, `check-citations.mjs` *requires* a literal `Last verified YYYY-MM-DD` string in the HTML — include it.
- The accepted-answer text rendered in JSON-LD must appear **verbatim in visible body text** (the gate's FAQ-verbatim rule applies to FAQPage; to stay safe and AI-friendly, keep QAPage answer text == visible text too).
- **No internal `*.html` links;** all internal links must resolve to a built file; page must be present in the sitemap (automatic via the walker) and must **not** be `noindex`.
- Reuse `/resources/resources.css`, the existing `nav`/`footer` markup, `share.js`, and the `.answer` / `.callout` / `.gcbox` / `.faq` / `.related` classes verbatim — no new CSS needed.

**Interaction / UX behavior.**
- The `ask/` page embeds the Tally form (single `<script>` or `<iframe>` embed — static, no GC backend, no data touches our servers, preserving the no-custody/lean-infra posture). If JS is disabled, show a plain mailto fallback to the resources alias.
- Answer pages are fully static — no JS required to read. The only script is the shared `share.js`.
- On submit, Tally shows our confirmation copy; no redirect to a GC route needed.

**Acceptance criteria / QA checklist:**
- [ ] `npm run build` passes `check-seo.mjs` and `check-citations.mjs` with 0 new issues.
- [ ] Each new answer page has exactly one H1, valid `QAPage` + `BreadcrumbList` JSON-LD (test in [Google Rich Results Test](https://search.google.com/test/rich-results)).
- [ ] Accepted-answer JSON-LD text is found verbatim in visible HTML.
- [ ] Every answer page carries a `Last verified YYYY-MM-DD` stamp and a Sources block (free-first).
- [ ] `/resources/answers/` and every `/resources/answers/{slug}/` appear in `sitemap-0.xml`; none are `noindex`.
- [ ] All `related` links and the index->answer links resolve (no broken/`.html` links).
- [ ] Exactly one Good Circles CTA per answer page (the `gcbox`), copy matches the accuracy contract.
- [ ] Intake form collects no required PII; email field is explicitly optional; honeypot on.
- [ ] Disclaimer line present on every answer page and on the intake page.
- [ ] Mobile + keyboard: form embed and the index cards are operable; focus visible.

### Accuracy, accessibility & compliance notes
- **Figures to verify:** any answer touching dollar/percent thresholds (e.g., UBI, $50k 990-N threshold, raffle limits, Ad Grant $10k/mo) must be source-checked and dated at publish; add recurring ones to `figure-watchlist.mjs` so the citation gate catches them if they go stale.
- **GC accuracy-contract compliance:** the single CTA must use approved figures only — 10% of merchant **net profit** to the nonprofit, ~10% shopper savings (estimate), merchants keep 89% on a 1% fee, free for nonprofits, ~$72/active supporter/yr (estimate), launching September 2026, no custody. Do not let an answer imply GC gives grants or holds funds.
- **Legal review:** none required to launch *if* the non-advice boundary + standing disclaimer are enforced and answers stay at the "general information / here's the authoritative source" altitude (the Candid model). Have counsel eyeball the disclaimer wording once.
- **Privacy/PII posture:** no accounts, no required PII; the only optional PII (reply email) lives in Tally, never in the repo or in published HTML. Published questions are rewritten to be fully anonymous (`asked_anonymously` flag enforces the editor habit). Add one line to `/privacy/` noting questions may be published anonymously and that the form is processed by Tally.
- **WCAG 2.1 AA:** form embed must have labeled inputs, a visible focus ring, and error text not conveyed by color alone (Tally handles most; verify). Answer pages inherit the hub's existing AA-compliant CSS; keep contrast on the Purple/Gold tokens, ensure the question H1 and answer are real text (not images), and that the share buttons retain their `aria-label`s.
- **Keeping it current:** the `verified_on` date drives re-checks; re-verify any answer older than ~12 months or when its watch-listed figure changes. Cap the live library by quality, not volume — prune or merge thin answers into guides.

### Effort, cost & sequencing
- **Effort:** M. One-time dev: ~1 day to clone an existing guide into an answer template + build the `/resources/answers/` index + the `ask/` embed page. Content: ~½ day for the playbook, then 8-12 seed answers at ~30-45 min each (~1 week). Ongoing: ~2-3 hrs/week for one staffer.
- **Cost:** **$0** — Tally free tier (100 submissions/mo, ample for a pre-launch hub) and a free Google Sheet for triage. No new infrastructure, no GC backend, no custody. If volume ever exceeds 100/mo, Tally Pro is ~$29/mo — defer until that's a real problem.
- **Sequencing:** Do this **first among the community-engagement options** — it is the lowest-lift, highest-trust entry point and it *generates the demand data* that should drive the heavier options (office-hours/webinar program, peer/partner directory). Ship intake -> let real questions accumulate for 4-8 weeks -> use the clustering signal to schedule the first "office hours" topic and to prioritize new full guides. It slots in right after the current build-gate work and before any synchronous/live programming, because it needs zero scheduling, zero new infra, and immediately makes the hub provably *living*.

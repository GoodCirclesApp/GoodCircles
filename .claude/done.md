# Good Circles — Completed Work Archive

> Items move here from `.claude/active_priorities.md` when done.
> Format: Date · Item · Outcome

---

## 2026-05-11 — Marketing Savant Mode infrastructure

**What was built:**
- CLAUDE.md expanded from 154-line dev file to 15-section master context file (product summary, 5 role briefs, brand voice rules, key stats with citation flags, launch context, active priorities, recent decisions, what-not-to-do, plugin inventory, standing references, full tech and dev context)
- `.claude/decisions_log.md` — full decision history with context and ruling-out notes (8 entries spanning 2026-04-27 to 2026-05-11)
- `.claude/commands/` — 16 slash commands: waitlist-pulse, press-scan, social-pulse, content-calendar, nurture-batch, founding-partner-pipeline, performance-report, seo-health-check, competitor-deep-dive, press-pitch-batch, founding-circle-email, role-landing-page, press-pitch, cdfi-brief, municipality-brief, press-release
- `.claude/active_priorities.md` and `.claude/done.md` (this file)

**Outcome:** Full marketing operating system encoded. Every future session starts warm. Repeated workflows are one-keystroke operations.

**Pushed to:** GitHub (GoodCirclesApp/GoodCircles, main branch, commit 64e83bd)

---

## 2026-05-11 — 5-role marketing brief

**What was built:** Full structured marketing brief for all 5 audience roles (Neighbor, Business, Nonprofit, Municipality, CDFI). Each role: one-line pitch, target persona, top 3 pain points, top 3 benefits, key features, emotional hook, CTA, visual vibe. Plus brand voice, launch hook, and hashtag ecosystem.

**Outcome:** Production-ready brief suitable for use as agency brief, content guide, or campaign foundation. Lives in conversation context + encoded into CLAUDE.md Section 2.

---

## 2026-05-10 — Facebook 9-slide launch carousel prompt

**What was built:** Production-ready Claude Cowork prompt for a 9-slide 1080×1920 Facebook/Instagram carousel. Includes: full slide-by-slide copy, hex color specs, font specs, layout instructions, design philosophy notes, and final output checklist.

**Outcome:** Prompt is ready to paste into Claude Cowork for final PNG production. Slides cover: Declaration, The Wound, The Paradox, The Model, The Vision, For Neighbors, For Businesses, For Nonprofits, The Founding Circle.

**Status:** PNG production pending (user action: paste into Claude Cowork).

---

## 2026-05-10 — CapCut 5-video production package (content phase)

**What was built:** Complete production package for 5 × 30-second vertical videos. Per video: voiceover script (blocked for TTS, with voice pick and speed settings), captions.srt (timed to final runtime), shot_list.md (scene-by-scene with stock search terms, on-screen text overlay specs, and editor tips), capcut_notes.md (music, caption style, text overlay style, effects, logo card spec, export settings, social caption + hashtags, QC checklist).

**Outcome:** Content is complete. Videos need CapCut editing to render. Estimated 45–90 min per video first time, 30–45 min thereafter.

**Package location:** `C:\Users\timh2\Downloads\goodcircles_capcut_package\goodcircles_capcut\`

---

## 2026-05-11 — Admin portal: compose email

**What:** Added outbound email compose to support inbox in admin portal.
**Outcome:** Admins can now initiate new email threads from the portal. Routes via `/api/email/send` → Resend. Token expiry bug fixed simultaneously by migrating all SupportInbox fetch calls to apiClient.

---

## 2026-05-07 — Landing page: all 5 signup forms operational

**What:** Fixed "Failed to fetch" errors on CDFI and Municipal signup forms. Root causes: wrong default API URL (localhost instead of Railway) and CORS not allowing Netlify's HTTPS domain. Also wired `alreadyRegistered` flag through all 5 forms and Confirmation component.
**Outcome:** All 5 founding circle signup forms (Neighbor, Merchant, Nonprofit, CDFI, Municipal) functional on the live Netlify deployment.

---

## 2026-05-07 — Admin portal: Briefing Requests fixed

**What:** Fixed three bugs in waitlistController.ts (Prisma NULL filter, missing try-catch, empty string status rejection) that caused the Briefing Requests panel to throw "failed to fetch."
**Outcome:** CDFI and Municipal briefing request management fully operational in admin portal.

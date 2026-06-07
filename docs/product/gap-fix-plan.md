# 13 Gap fix plan

> Five sprints to close the 74 gaps from
> [`student-audit.md`](./student-audit.md). Sprint 1 is the
> highest-leverage; finishing it kills 10 of the 36 Diya-gaps in one
> pass. Sprints 2 and 3 are P0 quick wins. Sprints 4 and 5 are
> deferred to a future cycle.

**Audit scope:** the work below is execution against the audit, not new
product work. Phase P5 (Resend email + retention) is **paused** until
this plan reaches "Sprint 3 done."

**Branch:** `claude/p0-p1-database-live` (PR #8). Sprint 1 to 3 commits
land here so PR #8 stays the rolling artifact.

## Sprint sequence

| # | Sprint | Closes | Effort | Status |
|---:|---|---|---:|---|
| 1 | New-user reality | 9 gaps | ~14h | In progress this session |
| 2 | Onboarding integrity | 7 gaps | ~12h | Partial this session |
| 3 | Loop hardening (submit + bid + wallet) | 12 gaps | ~16h | Partial this session |
| 4 | Power-user surfaces | 9 gaps | ~30h | Deferred |
| 5 | Polish + a11y + safety | 36 gaps | ~58h | Deferred + tracked |

Total session ambition: clear the **8 to 10 highest-leverage P0 gaps**
across sprints 1 to 3, push for merge, and document the rest.

---

## Sprint 1 — New-user reality (the demo-persona leak)

**Why first.** The dashboard, earnings, trust, and tax pages all
call `currentStudent()` which hard-codes the demo Aarav. A real
first-time user logs in and sees Aarav's 82 trust, 14 jobs, ₹24,750
lifetime. Wrong, embarrassing, and the single biggest UX bug.

**Closes**: #17, #18, #50 partial, #54 partial.

**Files**:
- `lib/auth/session.ts` — refactor `currentStudent()` to a sync helper
  that knows about session role and returns either the live-session
  student or the demo persona.
- `lib/demo/data.ts` — add `DEMO_NEW_STUDENT` zero-data persona for
  testing the empty state.
- `app/(student)/student/dashboard/page.tsx` — render zero-state hero
  + "next action" recommender when `me.jobsCompleted === 0`.
- `app/(student)/student/earnings/page.tsx` — empty wallet shape.
- `app/(student)/student/trust/page.tsx` — empty trust-ring + empty
  history.
- `app/(student)/student/tax/page.tsx` — pre-threshold state.

## Sprint 2 — Onboarding integrity (no more lies)

**Why second.** The landing page promises a 15-minute AI-graded skill
assessment. The button is dead. The onboarding stepper does not step.
The Skip and Finish buttons do the same thing.

**Closes**: #9, #11, #14. Defers the heavy onboarding rewrite (#10,
#15, #4) to Sprint 5.

**Files**:
- `app/(student)/student/onboarding/page.tsx` — remove the
  unimplemented assessment claim OR ship a minimal MCQ. Decision:
  remove the claim (24h to ship a real one is over budget this
  session). Replace with "Take a skill check soon" coming-soon
  treatment.
- `app/(auth)/auth/verify-email/page.tsx` — gate the "any code
  works" note on `DEMO_MODE` only.
- Distinct primary vs ghost actions on onboarding form so Skip vs
  Finish do different things.

## Sprint 3 — Loop hardening

**Why third.** Submit, bid, wallet are the moments money is on the
line. Friction here is moat-eroding.

**Closes**: #30, #33, #36, #45, #67, #70.

**Files**:
- `app/(student)/student/orders/[id]/submit/page.tsx` — client-side
  required: at least one of (file selected, notes >= 100 chars).
  Plus a visible "Attempt N of 3" pill so revisions are clear.
- `app/(student)/student/jobs/[id]/page.tsx` — bid input now reads
  `TIER_BUDGET_CEILING` and clamps + warns.
- `app/(student)/student/earnings/page.tsx` — TDS proximity row
  showing "₹X away from the ₹30k threshold" using the existing tax
  engine.
- `app/(student)/student/trust/page.tsx` — `<svg aria-label="...">`
  on the trust ring.
- `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`,
  `app/(student)/error.tsx`, `app/(client)/error.tsx`,
  `app/(admin)/error.tsx` — branded warm boundaries.

## Sprint 4 — Power-user surfaces (deferred)

Closes Aarav-side gaps that need real production data to validate:
#39, #40, #41, #43, #46, #47, #57, #50, #51. Track in the
build-checklist as T2 / T3.

## Sprint 5 — Polish, accessibility, safety (deferred)

The other 36 gaps, including #11 if we decide to ship a real
assessment, #4 college typeahead, #61 report flow, #64 message
attachments, #62 2FA. Track in the build-checklist; surface monthly
via a "gap audit re-run."

---

## Acceptance gates per sprint

- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` all
  exit 0.
- New tests where the engine math changed (Sprint 3 bid cap; TDS
  proximity).
- One commit per sprint with the closes-list in the message.
- PR #8 description updated each sprint.

## What this plan does NOT cover

- The 36 deferred polish items in sprint 5.
- Any product changes outside the audit (no new features land here).
- Real LLM / Razorpay / Supabase verification (still gated on founder
  prep list).

## Decision log to mirror in features.md after this session

| Date | Feature | Decision | Reason |
|---|---|---|---|
| 2026-06-06 | Skill assessment claim on landing | Removed from copy until real assessment ships | The button was dead; the page lied. |
| 2026-06-06 | New-user dashboard zero-state | Promoted to P0; shipped | Highest-leverage Diya gap. |
| 2026-06-06 | Phase P5 (Resend email) | Paused | Audit fixes take priority before launch. |

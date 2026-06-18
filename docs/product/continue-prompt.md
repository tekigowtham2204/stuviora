# 14 Continue prompt for a new session

> Paste the **fenced block at the bottom of this doc** into a fresh
> Claude Code session and it will pick up where the last one left
> off. This doc itself is the long-form explanation; the prompt at
> the bottom is the short, self-contained handoff.

**Last touched:** 2026-06-18. See the **Session update (2026-06-18)**
block immediately below for the current true state; the older sections
further down are historical context. If you return after later commits,
re-skim to confirm the snapshot still holds.

---

## Session update (2026-06-18)

`main` now includes six squash-merged PRs from this session (all green on
CI: tsc + lint + em/en-dash copy-ban + 239 unit tests + build):

| PR | What landed |
|---|---|
| #24 | `getPlatformMetrics()` computes REAL Supabase aggregates in live mode (orders, platform_ledger, tax_events, profile/dispute counts, 14-day sparkline); honest zeros on error, demo only when unconfigured. Freelancer reviews + trust history now filtered by studentId in live mode. Student dashboard uses `computeSplit()`. |
| #25 | Fabricated data stripped from public pages: homepage hero "sample order" card -> factual `DealFlowCard`; AI review panel -> real rubric (`GateRubricCard`, weights 40/30/30, pass 70); income calculator single-sources the split from `COMMISSION_RATE`. |
| #26 | Audit Sprint 5: onboarding pricing tip sourced from the pricing engine (`priceFloorFor`); low-fit "why" hint on the jobs list (#20); "AI is reviewing" order state (#31). |
| #27 | Audit Sprint 5b: 7-day dispute appeal window enforced via tested `canAppealDispute()` (#55), `Dispute.resolvedAtISO` added. (#40 saved jobs, #43 templates, #56 block-client were already live-wired.) |
| #28 | Light/dark theme audit: dark-mode separation for inset brown CTA blocks; trust-ring track contrast; AI-panel icon + messages sent-bubble contrast; `app/error.tsx` hex -> `var(token, fallback)`. |
| #29 | P5/P6 wiring: `postJob` fires the match-fanout Inngest event with the real job id; `hireProposal` captures the real order id for the hire email; `dispatchUserEmail` honors email opt-outs; funnel `trackEvent` on order + dispute lifecycle; `sendMessage` rate-limited. |

**Audit status:** the fake-data audit, theme audit, and student-audit
Sprints 1-5 + 5b are CLOSED. Most of Sprints 5/5b turned out to have been
shipped already by the P5-P11 build-out; only the genuine holes were
closed.

**Deferred backlog (intentionally NOT shipped until the core loop is
verified live, since these touch the live path and cannot be verified
without keys/deps here):**
- Meilisearch live search: `searchIds()` exists in `lib/search/client.ts`
  but `app/(public)/search/page.tsx` + `explore/page.tsx` call
  `searchDemo()` directly. Needs a `searchSite()` hydration wrapper
  (try `searchIds` -> hydrate via queries -> fall back to demo).
- Per-recipient email opt-out filters inside the match fan-out
  (`lib/matching/notify.ts`) and weekly digest (`inngest/functions.ts`)
  workers. The dispatch-level gate (`lib/email/dispatch.ts`) already
  covers the direct order/payout emails.
- `getDispute()` (`lib/data/queries.ts`) is still demo-only; wiring its
  live read (incl. `resolved_at`) makes the appeal window correct in live
  mode.
- Sentry: `captureError()` is a stub; needs `@sentry/nextjs` +
  `instrumentation.ts`.

**THE bottleneck is Phase V (live verification), which must run from the
Codespace/local, NOT this remote container (egress to *.supabase.co is
blocked here).** Code is wired behind `services.<flag>`; nothing in the
live loop has been exercised with real keys yet. Do Phase V before any
more live-wiring.

### SECURITY TODOs (operator, do not skip)
1. **Revoke** the Supabase personal access token pasted in chat earlier
   (`sbp_a0a8805b...`) at supabase.com/dashboard/account/tokens.
2. **Rotate** the `service_role` key after Phase V passes.

### Phase V runbook (from Codespace/local)
1. `npm run dev`; if `@tailwindcss/oxide ... Cannot find native binding`,
   run `rm -rf node_modules package-lock.json .next && npm install`.
2. `npm run verify:supabase` -> expect all 6 checks green.
3. Sign up with an allow-listed college email (e.g. `test@iitb.ac.in`,
   `student@ashoka.edu.in`; 42 domains seeded via migration 0003).
   Confirm a row in Supabase Auth > Users and that the portal shows the
   empty REAL account, NOT a demo persona (Aarav/Diya).
4. Add Razorpay TEST keys + an OpenRouter key to `.env.local` and run the
   full loop: post job -> hire -> fund escrow -> submit -> AI gate ->
   approve -> payout. Watch Inngest + webhook logs.

---


## What Stuviora is

India-first AI-powered student freelancing marketplace. Verified
college students sell skills to SMBs. Every deliverable passes a
Claude AI quality gate before it reaches the client. 85/15 split via
Razorpay Route. 15% take rate. **Wedge: the AI quality gate, because
no incumbent has one inline.** Tagline: "Hire students. Trust the
platform."

Built in Next.js 16 (Proxy not Middleware, async request APIs),
React 19, Tailwind v4 with the warm-earth design system (sage
#ABC270, yellow #FEC868, orange #FDA769, brown #473C33 on cream
#F8F2E3). Geist body + Fraunces display. No em-dashes, no en-dashes
in any user-visible string (hard ban).

## Where the build is

`main` at `d3da3b2`. Phases shipped:

| Phase | Status | Highlights |
|---|---|---|
| P0 — CI + tests | DONE | vitest 4.1.8, 144 unit tests, GitHub Actions runs tsc + lint + test + build |
| P1 — Database live | DONE | 18 of 30 query fns branch on `services.supabase`; `lib/data/mappers.ts`; migrations 0003 + 0004 |
| P2 — Auth + storage | DONE | Real Supabase Auth in `getSession`; `lib/auth/college-domains.ts` + 42-domain allowlist; `lib/storage/files.ts`; bucket migration 0005; proxy session refresh |
| P3 — Razorpay Route | DONE | SDK 2.9.6; Order with on-hold transfers; webhook idempotency via `webhook_events`; 72h auto-release cron filled |
| P4 — OpenRouter LLM | DONE | `chatJson` with Zod retry; versioned prompts; live AI gate + proposal writer + case-study; Inngest registration of 10 functions; PDF/DOCX/ZIP/text extractors |
| P5 — Resend email + retention | DONE (wired) | Resend REST client, 7 templates, match fan-out + 3/day cap, weekly digest |
| P6 — Search + rate limit + observability | DONE (wired) | Meilisearch REST indexer, Upstash rate limit + fallback, PostHog capture, funnel events |
| P7 — Hardening | MOSTLY DONE | Upload validation + ZIP traversal guard; DPDP consent/export/erasure/banner. Remaining: PII Vault (keys), Lighthouse (browser) |
| P8 — Load tests + runbooks | DONE | Commission reconciler engine + cron, /admin/ops, k6 smoke, 4 runbooks |
| P9 — B2B + monetization | DONE (wired) | Partner HMAC API, university portal + invite attribution, featured listings, subscriptions, team splits |
| P10 — Expo mobile (M7.3) | SCAFFOLDED | mobile/README.md plan; needs the Expo toolchain (separate machine) |
| P11 — Launch ops | CODE DONE | sitemap + robots + /trust page; DNS/Cloudflare/status page are founder ops |

### Student-audit progress

19 of 74 gaps closed across Sprints 1 to 4.

| Sprint | Closed | Shipped in |
|---|---:|---|
| 1 — New-user reality | 4 | PR #8 |
| 2 — Onboarding integrity | 3 | PR #8 |
| 3 — Loop hardening | 6 | PR #8 |
| 4 — Power-user surfaces | 6 | PR #9 |
| 5 — Polish + safety + schema items | 0 | **Queued** |

Remaining 55 audit gaps tracked in `docs/product/student-audit.md`
plus the build-checklist Sprint 4/5 sections.

## Repo + branch conventions

- **Repo:** `tekigowtham2204/stuviora` on GitHub.
- **Working branch pattern:** one branch per logical unit (a phase, a
  sprint, a single gap fix). Examples: `claude/p0-p1-database-live`,
  `claude/audit-sprint-4`, `claude/p5-resend-emails`.
- **PR per branch.** Squash-merge into `main` once CI is green.
- **CI is `.github/workflows/ci.yml`** — runs `npx tsc --noEmit`,
  `npm run lint`, `npm test`, `npm run build`. All four must pass.
  Currently CI takes ~90s.
- **Demo path always works.** Every live integration is gated on a
  `services.<flag>` from `lib/env.ts`. Without keys the demo path
  serves seeded data so a fresh clone still boots. **Never break the
  demo path while adding live code.**
- **No em-dashes, no en-dashes** anywhere user-visible. Pre-commit
  is enforced by code review; CI does not check this yet.

## Critical conventions

1. **Engine + queries + actions pattern** (from M4). Pure functions
   live in `lib/<domain>/` (no I/O). Data access in
   `lib/data/queries.ts` is the single swap point that branches on
   `services.<flag>` and falls back to demo on error. Server Actions
   in `app/actions/` are thin wrappers that call engines + queries.
2. **DAL.** `lib/auth/dal.ts` exposes `requireSession`,
   `requireRole`, `maybeSession`. Every mutating Server Action must
   call one of these before writing.
3. **Tests live alongside code.** `lib/<domain>/__tests__/*.test.ts`.
   Vitest config aliases `server-only` to a no-op shim so Next-only
   modules load in unit tests.
4. **Mappers.** Snake-case Supabase rows go through `lib/data/mappers.ts`
   before becoming domain types. Queries never inline-reshape rows.
5. **Live integrations stay TODO-commented** when keys are absent.
   Every engine has a "live path" comment that mirrors
   `lib/ai/quality-gate.ts`.
6. **Next.js 16 only.** Proxy not Middleware (`proxy.ts`). Async
   `cookies()`, `headers()`, `params`, `searchParams`. **Always
   `await` the request APIs.**
7. **Style.** Warm-earth tokens in `app/globals.css`; reusable
   primitives in `components/ui/`; motion via `motion/react` with
   `Reveal` and the `cubic-bezier(0.23,1,0.32,1)` ease. Honour
   `prefers-reduced-motion`. Never animate from `scale(0)`.
8. **Persona accents.** Student = sage, client = orange, admin =
   yellow. The portal shell sidebar bar reflects this.

## Live-key prep list (founder owns these)

If the user hands you keys, set them in `.env.local` and the live
paths activate. None of these are required for development.

| Service | Vars | Phase that needs it |
|---|---|---|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | P1+ |
| Razorpay Route | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | P3+ |
| OpenRouter | `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL` (default `anthropic/claude-sonnet-4.5`) | P4+ |
| Resend | `RESEND_API_KEY` | P5+ |
| Inngest | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | P4+ event delivery, P5+ |
| Upstash | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | P6 |
| Meilisearch | `MEILISEARCH_HOST`, `MEILISEARCH_KEY` | P6 |
| Sentry | `SENTRY_DSN` | P6 |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | P6 |

## Document map (read these, not the code)

The strategic decisions and architecture live in `docs/`. Read these
before touching code so you don't reinvent.

| File | When to open it |
|---|---|
| `docs/STUVIORA_MASTER_PLAN.md` | Master plan §4 has the phase sequencing |
| `docs/HANDOFF.md` | Machine-switch + secrets handoff (predates this loop) |
| `docs/product/overview.md` | One-page elevator pitch |
| `docs/product/prd.md` | v1 functional + non-functional requirements |
| `docs/product/personas.md` | Aarav + Diya + Priya + Dr. Banerjee + JTBD |
| `docs/product/features.md` | What ships in v1 / v1.1 / rejected + decision log |
| `docs/product/metrics.md` | North star (CPO/w) + 6 leading + 4 guardrails |
| `docs/product/gtm.md` | Beachhead + first-10 + content cadence |
| `docs/product/risks.md` | 11 risks with owners + kill switches |
| `docs/product/roadmap.md` | 12-month horizons mapped to P0..P11 |
| `docs/product/build-status-and-honest-review.md` | Realistic % done; uncomfortable second opinion |
| `docs/product/build-checklist.md` | T1 to T4 task tiers with file paths |
| `docs/product/student-audit.md` | 74 student-walkthrough gaps with numbered fixes |
| `docs/product/gap-fix-plan.md` | 5-sprint plan for the audit |
| `docs/product/deep-research-category-winner.md` | Web-verified competitive/market research + the category-winner strategy |

## Recommended next moves, in order

1. **Audit Sprint 5** (polish + a11y + the remaining Diya gaps that
   are not schema-heavy). ~18h. Closes #1, #2, #3, #5, #6, #7, #8,
   #12, #13, #16, #19, #23, #24, #25, #26, #27, #28, #29, #34, #35,
   #58, #59, #60, #62, #63, #65, #66, #68, #69, #71, #72, #74. Most
   are small surgery (focus traps, ARIA, copy, FAQ surface).
2. **Audit Sprint 5b** (schema-needing power-user items): #40 saved
   jobs, #43 proposal templates, #55 dispute appeal, #56 block
   client. ~32h including 2 migrations + DAL work.
3. **Resume P5** (Resend email + retention loops). ~80h per the
   plan. Unblocks match fanout, weekly digest, payout-settled emails,
   3-emails-per-day cap enforcement against `notification_log`.
4. **P6** (search + rate limit + observability). ~120h.
5. **P7..P11** in plan order.

You can alternate sprints + phases or push straight through one
track — the user has accepted both rhythms.

## Verification ritual (run before any push)

```bash
npx tsc --noEmit          # type-check
npm run lint              # eslint
npm test                  # vitest, 239 tests as of 5d17a4b (#29)
npm run build             # next build, 43+ routes
```

All four must exit 0. CI re-runs them on the PR. If a real test fails
that wasn't expected, **first** check if your engine math is correct
(the tests pin the math); the engine is canonical.

## Things you must NOT do

- Build features not in `docs/product/features.md`. New requests get
  logged in the decision log first.
- Break the demo path. Every live wiring keeps the existing branch
  alive.
- Generate the deliverable for the student via AI (master plan §10
  rejected list). This collapses the moat.
- Use em-dashes or en-dashes in user-visible copy.
- Push directly to `main`. Always PR.
- Force-push to `main` ever. To a branch, only with
  `--force-with-lease`, and only when you understand why.
- Hardcode the demo persona ("Aarav") into "you" surfaces in live
  mode. The student-audit lesson is repeating that across new pages
  is the most common bug.
- Tell the user a phase is "done" when only the wiring code shipped
  and live verification has not happened. Live verification requires
  real keys; surface that distinction.

## The handoff prompt

Copy everything between the fences below into a fresh Claude Code
session in this repo. The new session will read this doc and resume.

```text
You are picking up Stuviora, an India-first AI-powered student
freelancing marketplace, mid-build. Read docs/product/continue-prompt.md
first — it is the canonical handoff and points at the other docs you
need. Then read docs/product/build-checklist.md Part D for the queued
tasks and docs/product/student-audit.md Part D for the gap fix list.

Repo at tekigowtham2204/stuviora. Working tree on main at 5d17a4b (#29)
or later — check git log and the "Session update (2026-06-18)" block at
the top of this doc. Phases P0 to P11 are wired behind services.<flag>;
the fake-data audit, theme audit, and student-audit Sprints 1 to 5 + 5b
are CLOSED. The bottleneck is Phase V (live verification) which runs from
the Codespace/local, NOT a remote container (egress to *.supabase.co is
blocked there). See the Session update block for the deferred live-wiring
backlog and the SECURITY TODOs (revoke the pasted Supabase PAT; rotate the
service_role key after Phase V).

Convention recap (so I do not have to repeat):
- Branch per logical unit; squash-merge PR to main.
- Demo path stays alive on every commit; live behind services.<flag>.
- npx tsc --noEmit, npm run lint, npm test (vitest), npm run build
  must all exit 0 before push. CI re-runs them.
- Engine + queries + actions pattern. Mutating Server Actions call
  lib/auth/dal.ts requireSession or requireRole first.
- Mappers (lib/data/mappers.ts) bridge snake_case rows to domain types.
- No em-dashes, no en-dashes in user-visible copy. Geist body +
  Fraunces display. Warm-earth palette (sage, yellow, orange, brown
  on cream).
- Next.js 16 conventions: Proxy not Middleware, await cookies(),
  headers(), params, searchParams.
- Never animate from scale(0). Honor prefers-reduced-motion.

Pick one of these to start (or ask me to pick):
A) Audit Sprint 5: close the remaining polish, a11y, and copy gaps
   from docs/product/student-audit.md. Mostly small surgery; no new
   schema. ~18h. Highest leverage if I want a launch-ready feel.
B) Audit Sprint 5b: the schema-heavier audit items (saved jobs,
   proposal templates, dispute appeal, block client). ~32h plus
   2 migrations + DAL.
C) Resume P5: Resend email + retention loops. ~80h. Unblocks match
   fanout, weekly digest, payout-settled emails, 3 per day cap.
D) Start P6: search + rate limit + observability. Meilisearch +
   Upstash + Sentry + PostHog. ~120h.
E) Pick a specific gap number from student-audit.md.
F) Pick a specific phase task from build-checklist.md Part D.

Use the same workflow:
1. Create a branch.
2. Implement.
3. Run the verification ritual (tsc + lint + test + build).
4. Commit + push.
5. Open a PR with a body that names the gaps or phase tasks closed.
6. Wait for CI green; squash-merge.

If a feature requires keys I do not have, ship the code with the
services.<flag> branch and surface the blocker in your status report
rather than skipping.

Default to acting as the right expert for the moment: CTO for the
wiring choices, PM for the prioritisation, senior frontend engineer
for the UI, security reviewer for any payments or PII work. When you
genuinely cannot decide between two routes, ask via AskUserQuestion
once and proceed. Auto-mode is on; bias toward shipping over
clarifying.
```

## After you use this prompt

Re-touch this file the moment a phase ships or an audit sprint
closes. The "Where the build is" table and the recommended-next-moves
list are the parts most likely to drift. A stale handoff is worse
than no handoff.

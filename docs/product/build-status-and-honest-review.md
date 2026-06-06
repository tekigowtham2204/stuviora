# 10 Build status and honest review

> A joint CTO + PM audit of where Stuviora actually stands today, what
> percentage of work remains to be user-ready, and an honest probability
> review on every metric in [metrics.md](./metrics.md).
>
> Written to be uncomfortable. Treat it as the second opinion, not the
> founder narrative.

**Last audited:** 2026-06-06. Re-audit when any phase ships.

## Executive summary

> The product **looks** about 85% done and **is** about 25% done. The
> visible surface (UI, palette, 50 routes, 38-table schema, 12 pure
> engines, 11 strategic docs) is venture-grade. The invisible
> infrastructure (live database, payments, auth, AI gate, email, file
> storage, tests, observability) is at zero to ten percent across the
> board.
>
> Production-readiness is 6 to 9 months of focused engineering for a
> solo founder-dev, or 3 to 4 months for a small team. **The build
> debt is not the existential risk; cold-start liquidity is.** Even a
> perfectly-shipped v1 has a 60 to 75 percent chance of failing on
> demand-side traction in the first 6 months.
>
> If you only read one number: **the platform is roughly 25% of the way
> to shipping its first real paid order, and that first paid order has
> a roughly 60% chance of happening within 90 days of starting Phase
> P1**, assuming Supabase / Razorpay Route / OpenRouter keys are
> already in hand.

---

## 1. Build status by area

For each area I report: (a) what is built and visible, (b) what is
actually wired to a real backend, (c) % complete weighted by what
ships to a real user, (d) hours to close the gap (solo founder-dev,
focused).

Status legend: **D** demo-only · **W** wired in some path · **L**
live-ready · **N** not started.

| # | Area | Visible | Real | Status | % done | Hours to user-ready |
|---|---|---|---|---|---:|---:|
| 1 | UI surfaces (47 pages, 3 APIs) | All built, warm-earth redesign across every persona | All read demo data; render against in-memory arrays | W | 90% | 60 |
| 2 | Database schema | 38 tables, 18 enums, 52 RLS policies, triggers, indexes | Migration files exist; have **never been applied** to a real project | L | 90% | 40 |
| 3 | Data access layer (`lib/data/queries.ts`) | 30+ query functions with consistent shape | Reads only from `lib/demo/data.ts`; **3 of 30+ functions have a `services.supabase` branch** | D | 10% | 120 |
| 4 | Server Actions (10 files) | All wired into UI; mutate in-memory demo data | Server-side state vanishes on restart; no DB writes anywhere | D | 15% | 100 |
| 5 | Auth | College-email + role-picker UX present | **No real auth.** Cookie holds a JSON persona id. `proxy.ts` enforces only the cookie's presence in non-DEMO mode | D | 5% | 80 |
| 6 | File storage (Supabase Storage) | Upload UI on portfolio + submissions + dispute evidence | **Zero storage code.** Files never persist | N | 0% | 60 |
| 7 | Payments (Razorpay Route) | Checkout UI present; webhook handler with HMAC verify | **No live API calls.** `createEscrowOrder` returns a fake id. `releaseEscrow` returns `computeSplit()`. Webhook idempotency guard always returns `true` | D | 8% | 140 |
| 8 | AI quality gate | Submission flow + score readout + "AI-reviewed" badge | **No LLM call.** `runQualityGate` returns hash-of-orderId. **No file extraction.** No Inngest worker. No Realtime push | D | 5% | 160 |
| 9 | Inngest background jobs | 12 function stubs in `inngest/functions.ts` | **None registered.** No `/api/inngest` route. All function bodies return `void event` | D | 4% | 120 |
| 10 | Email (Resend) | Settings page + preferences engine | **Zero email code.** No templates. `services.resend` is checked nowhere | N | 2% | 80 |
| 11 | Search (Meilisearch) | Search box on `/explore` + dedicated `/search` page | **In-memory string-contains** over `demo.students` + `demo.jobs`. Works for the demo dataset; will not scale | W | 25% | 50 |
| 12 | Rate limiting (Upstash) | None visible | `lib/ratelimit/index.ts` is an **in-memory Map**. Lost on restart. Not applied to any handler yet | W | 15% | 50 |
| 13 | Observability (Sentry + PostHog) | None visible | `lib/observability/index.ts` is `console.error` + `console.log`. SDKs not installed | N | 5% | 60 |
| 14 | PII encryption / DPDP | Tax page captures PAN | **PAN stored in plaintext** in demo. No Supabase Vault. No download-my-data. No delete-account. No consent log. No cookie banner | N | 3% | 80 |
| 15 | Smart matching engine | Engine pure-tested mentally; UI surfaces wired | Engine works against any dataset; just wire to real data | L | 80% | 20 |
| 16 | Pricing engine | Per-category floors, tier multipliers, surfaced in proposal form | Pure logic, no external dependency | L | 90% | 8 |
| 17 | AI proposal writer | Draft loads on bid form | **No LLM call.** Returns a template substituted with student data | D | 10% | 30 |
| 18 | Portfolio auto-generator | Server Action + draft engine | Returns hand-tuned text; no LLM call | D | 10% | 30 |
| 19 | Trust score engine | `/student/trust` with ring + breakdown + history | Pure engine; correctly weighted; integration tests missing | L | 85% | 20 |
| 20 | Dispute state machine | Full UI + admin queue + resolution flow | Pure engine + Server Actions; no real state persistence | W | 60% | 40 |
| 21 | Tax engine (GST + TDS) | `/student/tax` with FY tracker + Form 16A | Pure engine; correct math; needs counsel review of edge cases | L | 75% | 40 |
| 22 | University B2B | `/admin/university` + REST API + cohort engine | API endpoints exist but **no HMAC auth**; no partner table; engine pure | W | 40% | 80 |
| 23 | Monetization (featured listings, subscriptions, teams) | Featured picker on post-job; subscription engine; team split math | **No checkout** anywhere; subscriptions have no UI; team orders have no Server Action | W | 25% | 80 |
| 24 | Mobile (Expo) | None | **Not started.** Master plan §4 has it post-launch but user has elected M7.3 in scope | N | 0% | 200 |
| 25 | Tests | None | **Zero unit, integration, or E2E tests** | N | 0% | 80 |
| 26 | CI | Workflow runs typecheck + lint + build | Test step removed until P0 resumes | W | 40% | 20 |
| 27 | Accessibility | Focus rings + ARIA on dialogs + reduced-motion respected | **Lighthouse never run.** Real keyboard-nav audit never done. No `app/error.tsx` or `app/not-found.tsx` | W | 50% | 40 |
| 28 | Empty / error / loading states | `EmptyState`, `Skeleton`, `ErrorState` primitives exist | **Not on every list surface.** No `loading.tsx` files. No global error boundary | W | 45% | 30 |
| 29 | Legal (Terms / Privacy / Refund / DPDP) | Pages scaffolded with placeholders | **Counsel never reviewed.** DPDP disclosures not real | N | 20% | counsel hours |
| 30 | Docs (master plan + handoff + 11 PM docs) | Strong, current | 25 markdown files, ~20k words | L | 95% | 10 |
| 31 | Deployment | None | **Not deployed anywhere.** No Vercel project. No domain pointed | N | 0% | 20 |

### Hours-to-user-ready summary

| Bucket | Hours |
|---|---:|
| Critical path (must work for first paid order) | 580 |
| Important (must work for real users) | 460 |
| Nice (mobile, premium features, deep polish) | 380 |
| **Total to "user-ready full product"** | **~1,420 hours** |

For a solo founder-dev shipping 30 to 40 productive hours per week,
that is 36 to 47 weeks (~8 to 11 months). A team of 2 to 3 devs + 1
designer compresses it to ~4 to 5 months, matching the master plan
§4.1 estimate.

### Critical-path subset (first paid order live on Razorpay)

| Area | Hours |
|---|---:|
| #2 schema apply + new migrations (notification_log, webhook_events idempotency, partners) | 40 |
| #3 query layer live branches | 120 |
| #4 Server Action live writes | 100 |
| #5 real auth + college domain table | 80 |
| #6 file storage + upload validation | 60 |
| #7 Razorpay Route live + checkout + webhook idempotency | 140 |
| #8 OpenRouter AI gate via Inngest | 160 (40 critical-path-only) |
| #25 minimum viable tests for ledger + webhook | 40 |
| **Critical-path subtotal to first paid order** | **~580 hours** |

For solo founder-dev: ~3.5 to 5 months to first paid order. With prior
Razorpay Route account approval (which itself has 4 to 8 week
regulatory lead time on a new merchant account), this is a parallel
risk that can shrink or grow the calendar by ±4 weeks.

## 2. Aggregate user-ready percentage

Weighting each area by its blocker-importance for "real Indian user
hires a real Indian student and money settles":

```
Critical path (70% weight)   complete: ~12%   contribution: 8.4%
Important (20% weight)        complete: ~25%   contribution: 5.0%
Nice (10% weight)             complete: ~35%   contribution: 3.5%
-----------------------------------------------------------------
Weighted user-ready completion                              16.9%
```

The unweighted (engineering-progress) number including the high-polish
UI and engine work is **roughly 50%**, but that flatters the situation
because the UI runs against in-memory state that vanishes on restart.

> **Honest summary number: 25% done.** Higher if you give credit for
> the schema design and the engine quality (which you should). Lower
> if you weight strictly by "would a real user have a working
> experience right now" (which is closer to 8%).

## 3. Honest success-rate review

Probability ranges, not point estimates. These are conditional on the
production plan executing cleanly. If execution slips, every number
shifts down.

### North star — completed paid orders per week

| Milestone | Original target | P(hit) | Honest read |
|---|---|---:|---|
| First paid loop (1 CPO) | Phase P3 ship gate | **60%** | Likely. Depends on Razorpay Route approval timing (regulatory). |
| Month 1 (10 CPO) | Founder-sourced | **40%** | Possible only if founder hand-onboards every client. |
| Month 3 (75 CPO) | Repeat clients + campus | **18%** | Requires distribution to actually compound. Most marketplaces fail here. |
| Month 6 (200 CPO) | Two beachheads + content loop | **10%** | Requires an unblemished AI gate experience + ambassador retention. |
| Month 12 (1,000 CPO) | Five campuses, viral loops | **5%** | Venture-scale outcome. Requires Series A, real team, durable retention. |

### Leading indicators

| Metric | Target | P(hit on schedule) | Honest read |
|---|---|---:|---|
| Proposals per job, 24h median | >= 3 | **55%** | Fan-out works in code; cold-start supply density is the gating factor. |
| Time to first proposal | < 60 min | **60%** | Engine ranking is solid; depends on online student volume in beachhead. |
| Time to first hire | < 24 to 48 hr | **45%** | Brief quality dominates this; clients write bad briefs. |
| AI gate first-pass rate | 78 to 88% | **50%** | Depends entirely on prompt calibration; will require 2 to 3 rounds of real-data tuning. |
| 30-day client repeat rate | >= 35% | **30%** | This is the marketplace-fit signal. Hardest number to forecast pre-launch. If we hit this, the rest follows. |
| Match fan-out to hire conversion | 8 to 15% propose, 30% hire | **45%** | Engine quality matters; clearer once we have 100+ jobs. |

### Trust funnel

| Metric | Target | P(hit) | Honest read |
|---|---|---:|---|
| College-email verified | >= 95% | **80%** | Easy mechanically. Risk is mostly OTP deliverability + disposable-domain evasion. |
| Skill assessment completed | >= 80% | **45%** | Friction. Students will skip. Needs onboarding flow polish + reminders. |
| Portfolio item present | >= 90% | **40%** | Same. Most students have no portfolio. Needs templates + sample import. |
| Dispute rate | <= 2% | **55%** | Pre-empted by AI gate; depends on calibration. |
| First-job guarantee claim rate | <= 5% | **50%** | Coverage is a cost line; depends on AI gate calibration + brief quality. |
| Median trust score | >= 70 (Silver) | **40%** | Most v1 students are new; will sit Bronze for 30 to 60 days. |

### Money

| Metric | Target | P(hit) | Honest read |
|---|---|---:|---|
| GMV per student per month, month 3 | Rs.6,000 | **22%** | Aspirational. Mean reverts to category averages. Indian student freelancer median is closer to Rs.2,000 to 4,000. |
| GMV per student per month, month 12 | Rs.18,000 | **8%** | Possible for top-decile students. Median will be lower. |
| Take rate (15% net of 18% GST) | Rs.1,230 per Rs.10k | **95%** | Math; we control this. |
| AI gate cost per review | < Rs.5 | **75%** | OpenRouter pricing is stable; risk is prompt bloat (we run multi-pass). Heavy prompts could push to Rs.8 to 12. |
| Withdrawal SLA | UPI <5 min, bank <1d | **90%** | Razorpay handles this. |

### Guardrails

| Guardrail | Target | P(hold) | Honest read |
|---|---|---:|---|
| Double-payout count | Zero, ever | **80%** | Strong if we land the `webhook_events` idempotency table + the daily reconciler. Failure mode is a single missed reconciliation. |
| AI gate p95 latency | < 60s | **70%** | Tight. Inngest cold start + OpenRouter latency + extraction can blow this on big PDFs. |
| Page load p95 | < 2.5s | **75%** | Achievable on Vercel + Next 16 cache components. Vulnerable to RSC + 3rd-party SDK bloat. |
| Monthly availability | >= 99.5% | **85%** | Vercel + Supabase + Razorpay all hit 99.9 individually; combined ~99.5. Inngest reliability is the weak link. |

### Business-level outcomes

| Outcome | Window | P |
|---|---|---:|
| Product reaches positive unit economics on Rs.10,000 average order | Month 6 | **35%** |
| Product reaches break-even (founder salary + infra) | Month 12 to 18 | **20%** |
| Product hits Series A milestones (1,000+ CPO/w, 35% repeat client, Rs.5L+ monthly net revenue) | Month 18 to 24 | **8%** |
| Product is shut down with zero traction | Month 6 to 12 | **35%** |
| Product pivots away from student freelancing | Month 9 to 18 | **15%** |
| Product is acquired pre-Series A by Razorpay / Internshala / Upwork-India | Month 12 to 24 | **5%** |

These probabilities sum to >100% because outcomes overlap (e.g., a
pivot can still reach break-even).

## 4. What actually determines survival

In priority order, the five things that decide whether Stuviora makes
it past month 12:

### 1. Razorpay Route account approval (regulatory, not engineering)

Cannot ship the first paid loop without it. 4 to 8 week lead time, can
stretch to 12. **If this is not in motion today, start it before P3
engineering begins.**

### 2. Founder-led demand-side success at month 1

The 10 founder-sourced clients need to be happy. If 5 of 10 churn after
the first job, we have a quality problem, not a distribution problem.
Fix in the next sprint, do not scale.

### 3. AI gate calibration

The wedge depends on this feeling true to both sides. Expect 2 to 3
rounds of prompt tuning in the first 60 days post-launch. Build a
calibration dashboard early (P4 includes it). If we cannot tune to a
78 to 88% first-pass rate, the moat is fictional.

### 4. Founder load and time-to-second-engineer

Solo founder-dev shipping P0 to P3 alone is 3 to 5 months of focused
work. By month 4, founder bandwidth becomes the bottleneck.
**Recommendation: budget the second hire (ops generalist) at month 3,
not month 6.** Hire ahead of need.

### 5. Cash runway through the cold-start

Marketplace cold-starts take longer than people budget for. Plan for
12 months of infrastructure + founder living expenses before assuming
take-rate revenue covers anything. ARR exits zero around month 4 to 6
at the earliest.

## 5. What to do this week

If you have 10 hours this week, this is the highest-leverage spend:

1. **Submit the Razorpay Route Marketplace application now.** Approval
   is the long pole. Cannot be parallelized later.
2. **Provision the Supabase production project.** Apply the migrations
   in a throwaway DB to confirm they work. Update env vars in a stub
   `.env.local`.
3. **Provision the OpenRouter API key with a Rs.5,000 cap.** Test one
   `chatJson` call manually against `anthropic/claude-sonnet-4.5` to
   confirm latency and parsing.
4. **Resume Phase P0**: add `vitest`, write the engine tests, restore
   the test step in CI. Time-budget: 6 hours. Outcome: CI fully green
   with real test coverage on the pure engines.
5. **Validate the first three target colleges (Phase 1 beachhead):**
   confirm a contact at the placement cell who will pick up the phone.
   If none of the three return calls, swap colleges before campus
   ambassadors are appointed.

If items 1 and 2 are blocked, do items 3, 4, 5 only. Do not start P1
to P3 engineering work without #1 and #2 in motion, because the
engineering happens against unverified rails.

## 6. The uncomfortable summary

- The product looks 85% done. It is 25% done. The gap is mostly
  invisible because the UI quality and the schema design hide the
  amount of integration work that has not happened.
- Cold-start risk is materially larger than build risk. Even with a
  perfect build, the platform has a 60 to 75 percent chance of failing
  on traction in the first 6 months.
- Razorpay Route regulatory timing is the single longest pole.
- Hire ahead of need (ops generalist by month 3). Do not solo through
  month 6.
- Plan for 12 months of cash. Do not assume take-rate revenue covers
  anything before month 6.
- The thesis is right. The execution risk is normal-startup-hard, not
  unusual-easy. **The hard part is in front of us, not behind us.**

## Audit cadence

Re-run this audit:

- After every phase ships.
- At any point a founder believes "we are 80% done"; the report will
  challenge that read.
- Quarterly for the success-rate section.

## Sources

- Schema audit: `supabase/migrations/0001_init_schema.sql` (525 lines,
  38 tables, 18 enums), `0002_rls_policies.sql` (221 lines, 52
  policies).
- Code audit: `lib/` (29 files), `app/actions/` (10 files), 47 page
  routes, 3 API routes, 12 Inngest stubs, 25 UI components.
- Demo data: 660 lines in `lib/demo/data.ts`, 252 lines in
  `lib/data/queries.ts` (only 3 of 30+ functions check
  `services.supabase`).
- Tests: zero. Confirmed via `find . -name "*.test.ts" -o -name
  "*.spec.ts" | grep -v node_modules`.
- Live integrations: `services.<flag>` branches found in 3 files
  (`lib/ai/quality-gate.ts`, `lib/razorpay/escrow.ts`,
  `lib/observability/index.ts`).
- Documentation: 25 markdown files across `docs/`, ~20k words.

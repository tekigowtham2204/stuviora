# 11 Build checklist

> Concrete, checkbox-shaped. Current state on top, "next" organized by
> complexity tier so the team can pick wins by available time budget.
>
> Last reviewed: 2026-06-06. Tick boxes as work ships. When a tier-1
> item moves to done, log it in the
> [features.md](./features.md) decision log only if scope changed.

---

## Part A — What is built

### Foundation and tooling

- [x] Next.js 16 (Proxy not Middleware; async request APIs respected)
- [x] React 19
- [x] Tailwind v4 with `@theme` design tokens (`app/globals.css`)
- [x] Warm-earth palette: sage `#ABC270`, yellow `#FEC868`, orange `#FDA769`, brown `#473C33`, cream `#F8F2E3`
- [x] Geist body + Fraunces display fonts via `next/font/google`
- [x] CI workflow: typecheck + lint + build green on every push (`.github/workflows/ci.yml`)
- [x] CODEOWNERS + Dependabot weekly groups (`.github/`)
- [x] Repo gitignore + `.env.example` rules
- [x] Demo/live `services.<flag>` pattern established (`lib/env.ts`)
- [x] PR-based development workflow on `claude/trusting-faraday-nOc0p`
- [x] PR #1 merged; PR #2 currently open with latest changes

### Database (designed, not applied)

- [x] 38-table schema authored (`supabase/migrations/0001_init_schema.sql`)
- [x] 18 Postgres enums for state machines (`order_status`, `dispute_status`, etc.)
- [x] 52 RLS policies authored (`supabase/migrations/0002_rls_policies.sql`)
- [x] `set_updated_at` trigger helper
- [x] `pgcrypto` + `citext` extensions
- [x] Service-role-only writes on ledger / commission / admin tables

### Pure engines (Tier 1 stability)

- [x] Trust scoring `lib/trust/score.ts` (4-component formula, tier mapping, budget gating, history)
- [x] Matching `lib/matching/engine.ts` (4-component formula, top-N rank for student or job)
- [x] Pricing `lib/pricing/engine.ts` (category floors, tier multipliers, reasoning strings)
- [x] Disputes `lib/disputes/engine.ts` (state machine, 48h escalation, resolution outcomes)
- [x] Tax `lib/tax/engine.ts` (GST 18%, TDS Section 194H, FY tracking, Form 16A)
- [x] Teams `lib/teams/split.ts` (multi-member Route split math with rounding-drift handling)
- [x] Featured listings `lib/monetization/featured.ts`
- [x] Client subscriptions `lib/monetization/subscriptions.ts` (Free / Growth / Scale)
- [x] University B2B cohort rollups `lib/university/engine.ts`
- [x] Trust score utilities (`nextTier`, `TIER_BUDGET_CEILING`, `canAcceptBudget`)
- [x] Utility helpers `lib/utils.ts` (`computeSplit`, `formatINR`, `cn`)

### Data and types

- [x] `lib/types.ts` full domain types (StudentProfile, ClientProfile, Job, Proposal, Order, Dispute, etc.)
- [x] `lib/demo/data.ts` 660 lines of internally consistent demo dataset
- [x] `lib/status.ts` status-to-tone metadata mappers
- [x] `lib/constants.ts` brand + service categories + trust tiers

### Server actions (10 files)

- [x] Auth actions (`app/actions/auth.ts`): `loginAs`, `logout`, `startStudentSignup`, `startClientSignup`, `verifyOtp`
- [x] Jobs (`app/actions/jobs.ts`): `postJob`, `submitProposal`, `hireProposal`
- [x] Orders (`app/actions/orders.ts`): `submit`, `approve`, `requestRevision`
- [x] Disputes (`app/actions/disputes.ts`): `openDispute`, `advanceDispute`
- [x] Tax (`app/actions/tax.ts`): `savePan`
- [x] Admin (`app/actions/admin.ts`): `resolveDispute`, `toggleUserActive`
- [x] Onboarding, services, notifications, portfolio

### UI surfaces (47 page routes)

- [x] Public: `/`, `/how-it-works`, `/about`, `/explore`, `/freelancer/[username]`, `/search`, `/legal/{terms,privacy,refund}`
- [x] Auth: login, signup picker, student signup, client signup, verify email
- [x] Student portal: dashboard, matches, jobs, jobs/[id], proposals, orders, orders/[id], orders/[id]/submit, services, services/new, earnings, trust, tax, onboarding
- [x] Client portal: dashboard, post-job, jobs, jobs/[id]/proposals, matches, orders, orders/[id], payment/[id], onboarding
- [x] Admin portal: dashboard, disputes, users, university (new M7), audit
- [x] Shared: messages, messages/[id], disputes, disputes/[id], settings

### UI primitives (25 components)

- [x] Button, Card, Badge, Stat, PageHeader, Section primitives
- [x] Input, Textarea, Select, Label, FieldHint
- [x] Money, TrustTierBadge, StatusPill (Order, Dispute, Proposal)
- [x] EmptyState, Skeleton, Container
- [x] Brand logomark (`components/brand/logomark.tsx`)
- [x] Portal shell with brown sidebar + persona accent (`components/layout/portal-shell.tsx`)
- [x] Site header + footer
- [x] Feature cards (StudentCard, OrderTimeline, AiReviewPanel, DisputeTimeline)
- [x] Motion: Reveal primitive with `prefers-reduced-motion` guard
- [x] Theme toggle (light default + suppress-hydration pattern)

### Documentation (25 markdown files, ~20k words)

- [x] Master plan (`docs/STUVIORA_MASTER_PLAN.md`)
- [x] Handoff (`docs/HANDOFF.md`)
- [x] Production-readiness plan (in `/root/.claude/plans/`)
- [x] 11 product docs in `docs/product/`: overview, why, personas, PRD, features, competitive, metrics, GTM, risks, roadmap, build-status
- [x] Reference materials (`docs/reference/`)

### Demo paths (work without any keys)

- [x] Login picks a persona from `loginAs(role)` without OTP
- [x] All queries read seeded data; no DB connection needed
- [x] AI gate returns deterministic verdict by orderId hash
- [x] Payments return fake order ids and faked transfers
- [x] Search runs in-memory string contains
- [x] Rate limit holds in-process Map

### REST API (3 routes)

- [x] `POST /api/payments/webhook` — Razorpay webhook handler with HMAC verify
- [x] `GET /api/v1/university/students` — cohort listing
- [x] `GET /api/v1/university/gmv` — monthly GMV time series

### Inngest function stubs (12 functions)

- [x] All 12 stubs in `inngest/functions.ts` with correct signatures (`escrowAutoRelease`, `commissionReconciler`, `weeklyEarningsDigest`, `tdsThresholdChecker`, `aiQualityCheck`, `trustScoreRecalc`, `portfolioAutoGenerator`, `smartMatchFanout`, `disputeEscalationTimer`, `collegeDomainVerifier`, `taxEventLogger`, `recomputeMatches`)

---

## Part B — What is partial (demo-only; needs live wiring)

### Critical (must work for first paid order)

- [ ] Apply `0001_init_schema.sql` + `0002_rls_policies.sql` to a real Supabase project
- [ ] Data access layer: branch every `lib/data/queries.ts` function on `services.supabase` (only 3 of 30+ done)
- [ ] Server Actions: live writes via `getServiceSupabase()` in every mutation
- [ ] Auth: real Supabase Auth in `lib/auth/session.ts` (currently cookie-only fake)
- [ ] File storage: zero code today; `lib/storage/files.ts` does not exist
- [ ] Razorpay Route: live `createEscrowOrder` + `releaseEscrow` + linked accounts
- [ ] Webhook idempotency: `guardWebhookIdempotency` always returns `true`; needs `webhook_events` insert with conflict
- [ ] OpenRouter LLM client: `lib/llm/client.ts` does not exist
- [ ] File extraction: PDF / DOCX / image / code / ZIP extractors not built
- [ ] AI gate: `runQualityGate` returns hash-of-orderId, never calls a model
- [ ] Inngest registration: no `/api/inngest` route; functions never run

### Important (must work for real users)

- [ ] Email (Resend): zero code; templates not built
- [ ] Notification preferences: form persists nowhere
- [ ] Rate limit: in-memory Map; survives one process only
- [ ] Search: Meilisearch not wired; falls back to string contains
- [ ] Sentry: SDK not installed
- [ ] PostHog: SDK not installed
- [ ] Trust score recalc trigger: cron exists in stub only
- [ ] Smart-match fan-out: not wired to email send
- [ ] Portfolio case-study: returns templated text, no LLM call
- [ ] AI proposal writer: returns templated text, no LLM call

### Nice (post-v1 acceptable for launch)

- [ ] University B2B HMAC auth on REST endpoints (currently open)
- [ ] Featured-listing checkout (engine + UI picker, no Razorpay call)
- [ ] Client subscriptions (engine only, no UI, no checkout)
- [ ] Team / group order flow (engine, no UI)
- [ ] PII encryption (PAN stored as plaintext in demo)
- [ ] DPDP compliance: download-my-data, delete-account, consent log
- [ ] Cookie consent banner

---

## Part C — What is not started

- [ ] Tests of any kind: 0 files matching `*.test.ts` or `*.spec.ts`
- [ ] Vitest config + setup
- [ ] Playwright config + E2E specs
- [ ] k6 load test scripts
- [ ] Expo mobile workspace (`mobile/`)
- [ ] Vercel project + production deploy
- [ ] DNS + Cloudflare config for `stuviora.com`
- [ ] Status page (status.stuviora.com)
- [ ] Runbooks (deploy, incident, webhook replay, key rotation, dispute SOP, payout reconciliation)
- [ ] Legal review of Terms / Privacy / Refund / DPDP
- [ ] `instrumentation.ts` for Sentry/PostHog server-side
- [ ] `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx` global error boundaries
- [ ] Per-route-group `error.tsx` (student, client, admin, shared)
- [ ] Per-route `loading.tsx` skeletons
- [ ] Backup + DR strategy
- [ ] Ambassador dashboard
- [ ] Featured-talent profile boost
- [ ] WhatsApp notifications via Gupshup
- [ ] Customer support inbox

---

## Part D — What to build next, by complexity

Pick by available time budget.

### Tier 1 — Quick wins (under 8 hours each)

Aimed at "Saturday morning, one block of focus."

- [ ] **Restart vitest config** with one passing test on `computeSplit` and one on `computeTrustScore`. ~2h. Files: `vitest.config.ts`, `lib/__tests__/utils.test.ts`.
- [ ] **Add `app/error.tsx` and `app/not-found.tsx`** with the warm-error layout. ~1h. Stops generic Next error pages from leaking.
- [ ] **Add `app/loading.tsx`** with a top-of-page progress bar using `Suspense`. ~1h.
- [ ] **Per-route-group `error.tsx`** for `(student)`, `(client)`, `(admin)`, `(shared)`. ~2h. Uses the existing `EmptyState` primitive.
- [ ] **Lint warnings sweep**: 5 unused-import warnings remain. ~30m.
- [ ] **`.env.example` polish**: list every env var the audit doc names, grouped by service. ~30m. Files: `.env.example`.
- [ ] **Wire `services.<flag>` doc generation** so the front page renders a "feature flags" badge row showing which integrations are live. ~3h.
- [ ] **Engine tests for trust, matching, pricing, tax, disputes, teams**. ~6h total. Files: `lib/<domain>/__tests__/`.
- [ ] **Pure-engine README** in each `lib/<domain>/` explaining inputs, outputs, weights. ~2h.
- [ ] **Add OpenGraph + Twitter card images** for landing and a generic profile page. ~3h. Static assets.
- [ ] **Sitemap + `robots.txt`** so the public profile pages are indexed. ~1h.
- [ ] **Compress all SVGs** (logomark, illustrations) via `svgo`. ~30m.
- [ ] **Make the demo persona switcher always visible** in the bottom-right of every page in DEMO_MODE so testers can flip without logging out. ~2h.
- [ ] **Wire `bun` or `pnpm` lockfile guard** to avoid lockfile drift in PRs. ~30m.
- [ ] **CI badge in `README.md`** + a short product blurb. ~30m.

### Tier 2 — Moderate (8 to 40 hours each)

Aimed at "one focused week of evenings."

- [ ] **Apply migrations to a real Supabase project** and prove they run. ~8h including verifying every table and policy.
- [ ] **Wire `getServerSupabase` into 6 highest-traffic queries first**: `listStudents`, `listOpenJobs`, `getStudentByUsername`, `getJob`, `listStudentOrders`, `listClientOrders`. ~16h. Files: `lib/data/queries.ts`, new `lib/data/mappers.ts`.
- [ ] **Auth Server Actions live for `loginAs` → `signInWithOtp`**. ~16h. Includes Supabase Auth integration, OTP email via Supabase's built-in sender first (Resend later).
- [ ] **`college_domains` seed migration** with 500+ `.ac.in`/`.edu.in`. ~6h to compile and dedupe the list.
- [ ] **Disposable-email blocklist** (`lib/auth/college-domains.ts`). ~4h.
- [ ] **Storage helpers and bucket migration** (`lib/storage/files.ts`, `0004_storage_buckets.sql`). ~12h. Buckets: `portfolio`, `submissions`, `disputes_evidence`, `gst_invoices`.
- [ ] **Portfolio upload UI fully wired to Storage**. ~10h.
- [ ] **Razorpay client wrapper** (`lib/razorpay/client.ts`) + `createLinkedAccount`. ~16h. Linked accounts are the gating dependency for the 85/15 split.
- [ ] **Real `createEscrowOrder`** with Route transfer config. ~20h. Files: `lib/razorpay/escrow.ts`, `app/actions/payments.ts`.
- [ ] **Razorpay Checkout embed** on `/client/payment/[id]`. ~8h.
- [ ] **Webhook idempotency** via `webhook_events` table. ~6h.
- [ ] **`escrowAutoRelease` Inngest cron** filled out for real. ~6h.
- [ ] **`lib/llm/client.ts`** with OpenRouter `chatJson` helper. ~10h.
- [ ] **AI gate live path** via Inngest. ~24h. Files: `lib/ai/quality-gate.ts`, `inngest/functions.ts`, `app/(student)/student/orders/[id]/submit/page.tsx`.
- [ ] **File extraction** (`lib/uploads/extract.ts`): PDF `pdf-parse`, DOCX `mammoth`, ZIP `unzipit`, images via OpenRouter Vision. ~16h.
- [ ] **AI proposal writer live**. ~6h.
- [ ] **Case-study generator live**. ~6h.
- [ ] **Resend client + 5 highest-leverage templates**: welcome, college-verify, order-hired, order-submitted, payout-settled. ~16h.
- [ ] **Match fan-out Inngest function** with 3-emails/day cap reading `notification_log`. ~10h.
- [ ] **Vitest + Playwright fully wired in CI** including the previously-removed steps. ~10h.
- [ ] **Sentry + PostHog** wrapped into `lib/observability/index.ts`. ~12h.
- [ ] **Error boundaries per route group** with Sentry capture. ~8h.
- [ ] **Funnel events from every Server Action** (`signup_completed`, `proposal_submitted`, etc.). ~6h.
- [ ] **Upstash sliding-window rate limit** with `withRateLimit` wrapper. ~10h.
- [ ] **Apply rate limit to abuse-prone endpoints**: `postJob`, `submitProposal`, `sendMessage`, `verifyOtp`. ~6h.
- [ ] **Meilisearch SDK + indexers**. ~16h. Files: `lib/search/client.ts`, `inngest/functions.ts` (new `searchReindex`).
- [ ] **Featured listing checkout** through Razorpay. ~16h.
- [ ] **Vercel deploy + DNS** for staging. ~10h.

### Tier 3 — Heavy (40 to 160 hours each)

Aimed at "a multi-week focused project."

- [ ] **Full data access layer live wiring** for all 30+ query functions, with row-mappers, integration tests against a Supabase test project. ~80h.
- [ ] **All 10 Server Actions live writes** with DAL wrapping + auth guard. ~60h.
- [ ] **Full Inngest registration + workers** with `/api/inngest` route. All 12 function bodies filled. ~60h.
- [ ] **All 12 Resend email templates** with JSX-email components + snapshot tests. ~50h.
- [ ] **Real auth flow end to end**: signup → OTP → profile creation → role-aware redirect. ~50h.
- [ ] **PII encryption via Supabase Vault**: PAN, Aadhaar, phone, college id, with helpers and migration. ~50h.
- [ ] **DPDP-compliant download-my-data + delete-account + consent log + cookie banner**. ~60h.
- [ ] **Accessibility sweep + Lighthouse audit** across every page; fix to >= 95. ~50h.
- [ ] **k6 load test scripts** + integration into a weekly CI run. ~50h.
- [ ] **Webhook idempotency stress test + commission reconciler**. ~40h.
- [ ] **File upload validation**: MIME sniff, EXIF strip, ZIP path-traversal guard, virus scan hook. ~40h.
- [ ] **Subscription billing**: Razorpay Subscriptions API + UI + plan migration. ~50h.
- [ ] **Team / group projects**: Server Action, payment flow, multi-way Route split. ~60h.
- [ ] **University B2B partner key issuing + HMAC verification**: partners migration + admin UI + signed webhook dispatch. ~80h.
- [ ] **Production runbooks**: deploy, incident response, webhook replay, key rotation, dispute SOP, payout reconciliation. ~40h.
- [ ] **Status page** + uptime monitors (BetterStack or equivalent). ~30h.
- [ ] **Ops dashboard** at `/admin/ops` with real Sentry + Inngest + Razorpay live counters. ~50h.

### Tier 4 — Major (160+ hours each)

Aimed at "a phase".

- [ ] **Expo mobile app (M7.3)** with auth + dashboard + matches + orders + messages. ~250h. Includes EAS + TestFlight + Play internal.
- [ ] **`@stuviora/shared` workspace package** with types and shared logic between web and mobile. ~80h.
- [ ] **Push notifications** end to end (web + Expo). ~60h.
- [ ] **First 10 founder-led clients**: hand-onboarding playbook + brief docs + 10 hand-managed projects through completion. ~120h founder-PM time, not engineering.
- [ ] **Campus ambassador program** kickoff: 5 ambassador agreements, ambassador kit, attribution tracking, paper-tracked dashboards. ~100h ops time.
- [ ] **University B2B sales motion**: deck, demo, three pilot deals. ~100h founder time.
- [ ] **Content loop production**: Mon static + Wed carousel + Fri money-win reel for 8 weeks. ~80h, mostly creative.

---

## Part E — Recommended 4-week sprint order

Concrete sequence for the next 4 weeks. Tier-1 items run alongside.

### Week 1: Foundation parallel with regulatory

Goal: nothing in engineering is blocked by waiting on rails.

- [ ] **Submit Razorpay Route Marketplace application** (founder, day 1; the longest pole).
- [ ] Provision Supabase prod project.
- [ ] Provision OpenRouter key with Rs.5,000 cap.
- [ ] Apply both migrations to the prod project, verify all 38 tables + 52 policies, take a structural backup.
- [ ] Resume Phase P0: vitest + engine tests + restore CI test step.
- [ ] Tier-1 cleanups: error boundaries, loading states, lint warnings.

### Week 2: Database live

Goal: the highest-traffic pages render against the live DB.

- [ ] Build `lib/data/mappers.ts` for the 6 most-used entities.
- [ ] Wire `listStudents`, `listOpenJobs`, `getStudentByUsername`, `getJob`, `listStudentOrders`, `listClientOrders` to Supabase.
- [ ] Add an integration test against a local `supabase start` instance covering one row per table.

### Week 3: Auth and storage

Goal: a real new user can sign up and upload a portfolio file.

- [ ] Real `loginAs` via Supabase Auth.
- [ ] `college_domains` seed migration + disposable blocklist.
- [ ] Storage helpers + bucket migration.
- [ ] Portfolio upload UI wired to Storage.
- [ ] Update `proxy.ts` to refresh Supabase session on the edge.

### Week 4: Payments live (test mode)

Goal: a Rs.100 test transaction completes end to end.

- [ ] Razorpay client wrapper.
- [ ] Real `createEscrowOrder` and `releaseEscrow` via Route.
- [ ] Razorpay Checkout embed on the payment page.
- [ ] Webhook idempotency table + handler.
- [ ] `escrowAutoRelease` Inngest cron live.
- [ ] Manual Rs.100 test transaction captured as proof.

After Week 4, the platform can take a real paid order in test mode. Live mode is gated only on Razorpay account approval.

---

## Audit cadence

- After every shipped sprint, mark items done.
- When a tier-3 or tier-4 item completes, re-tier the rest.
- Quarterly: re-read part A and part D in full to catch drift.

Anything not on this list does not get built without an explicit
decision logged in [features.md](./features.md).

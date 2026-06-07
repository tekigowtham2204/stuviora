# 15 Full-product build plan, phase by phase, by complexity

> A CTO + PM execution plan to take Stuviora from "P0 to P4 wired
> behind flags" to a live, hardened, full product. Ordered by
> dependency first and complexity second, with effort, prerequisites,
> acceptance gates, and the non-engineering long poles called out.
>
> **Authored:** 2026-06-07. Grounded in `STUVIORA_MASTER_PLAN.md` (S4),
> `build-checklist.md` (Part D complexity tiers + Part E), and
> `build-status-and-honest-review.md` (hour model). The external-fact
> section is **not freshly verified** (the verification pass was cut
> off by a rate limit); treat it as "verify before relying."

---

## 0. Reconciled baseline (where we actually are)

Two numbers, because they diverge:

| Lens | Estimate | Meaning |
|---|---:|---|
| Code built | ~55-60% of v1 | UI 90%, schema 90%, 12 engines 80-90%, P0-P4 wired with live branches, 148 tests, CI green |
| Live-verified | ~10-15% | **Nothing has run against real keys.** Migrations never applied; no real Razorpay/LLM call has executed |
| User-ready (real paid order today) | ~8-15% | A real user cannot complete a paid loop; rails unverified, Route not live |

Phase tracks: P0-P4 done in code, P5 paused, P6-P11 not started. Audit
gaps: 32/74 closed (~43%) after PR #11.

**The honest-review doc (`build-status...md`) predates the P0-P4 wiring
and now reads too pessimistic. Re-audit it as the first PM action.**

---

## 1. The dependency spine (what blocks what)

```
[Founder long poles]  Razorpay Route approval ──┐  (4-8 wk regulatory)
                      Supabase + OpenRouter keys ┤  (hours, founder)
                      Legal counsel (DPDP/terms) ─┘  (external)
                                  │
                                  v
   Phase V: LIVE VERIFICATION of P1-P4  ◄── the missing phase; converts wired -> works
                                  │
              ┌───────────────────┼───────────────────┐
              v                   v                   v
   Audit 5b + remaining     P5 Email/retention   P6 Search/RL/observ.
   (Supabase-shaped)        (Resend)             (Meili/Upstash/Sentry/PostHog)
              │                   │                   │
              └───────────────────┼───────────────────┘
                                  v
   P7 Hardening (PII/DPDP, file validation, a11y/Lighthouse)
                                  v
   P8 Load tests + runbooks + ops dashboard
                                  v
   P9 B2B + monetization ───────► P11 Launch ops ◄─── P10 Expo mobile (parallel after V)
```

Hard rule from the master plan and honest-review: **do not build new
integration phases (P5-P7) on top of unverified P1-P4 rails for longer
than necessary.** Phase V is the unlock.

---

## 2. The non-engineering long poles (start these first; they gate code)

These are founder/external actions. They are the true critical path and
**cannot be parallelized away later.**

1. **Submit the Razorpay Route marketplace application now.** Longest
   pole (weeks). Nothing real about payments verifies until it clears.
2. **Provision Supabase project + OpenRouter key** (cap ~Rs.5,000).
   Hours of work; unlocks Phase V immediately.
3. **Engage counsel for DPDP + Terms/Privacy/Refund review.** External
   lead time; gates P7 and public launch.
4. **Engage a CA to confirm the tax model** (see external flags S7).
   The current code assumes a TDS model that may be the wrong section.

---

## 3. Phase-by-phase plan

Each phase: **Goal · Complexity · Prereqs · Work · Effort · Gate · Risk.**
Complexity is T1 (under 8h items) to T4 (160h+), per build-checklist Part D.

### Phase V - Live verification of P1-P4  (NEW, highest leverage)

- **Goal:** Convert the already-written P1-P4 code from "wired behind a
  flag" to "verified working against real services." This is the single
  highest-leverage engineering spend and de-risks every later phase.
- **Complexity:** T2 (moderate), but **fully gated on keys + Route**.
- **Prereqs:** Supabase project, OpenRouter key, Razorpay Route (test
  mode is enough to start).
- **Work:**
  - Apply migrations to a real Supabase project; verify every table,
    enum, RLS policy; take a structural backup.
  - Wire + verify the 6 highest-traffic queries against live DB
    (`listStudents`, `listOpenJobs`, `getStudentByUsername`, `getJob`,
    `listStudentOrders`, `listClientOrders`).
  - Real auth round-trip: signup -> OTP -> profile -> role redirect.
  - One real `chatJson` call through the AI gate on a real PDF (test
    extraction + latency + JSON parse).
  - Rs.100 Razorpay Route **test-mode** transaction end to end:
    order -> escrow -> split -> webhook -> ledger -> payout.
- **Effort:** ~60-80h (subset of the honest-review 580h critical path).
- **Gate:** A real test user completes a paid order in Razorpay test
  mode, and one real AI-gate verdict is pushed via Realtime.
- **Risk:** Migrations may fail on first apply; AI-gate latency may
  blow the 60s p95; webhook idempotency edge cases. All cheaper to find
  now than post-launch.

### Phase A - Audit Sprint 5b + remaining gaps  (do now if no keys)

- **Goal:** Close the launch-feel gaps; finish the 74-item audit.
- **Complexity:** T1-T2. Sprint 5b needs 2 small migrations + DAL but is
  fully demo-testable; the rest is polish/a11y/copy.
- **Prereqs:** None (Supabase-shaped, but verifiable on the demo path).
- **Work:**
  - **5b (schema-shaped, ~32h):** saved jobs (#40), proposal templates
    (#43), dispute appeal (#55), block client (#56). 2 migrations +
    queries + DAL + UI.
  - **Remaining audit (~26h):** the rest of the 74 not yet closed -
    income calculator (#2), notification bell (#19), keyboard nav (#39),
    deadline sort (#46), GSTIN field (#51), quarterly tax CSV (#50),
    mobile bottom-nav verification (#57), etc.
- **Effort:** ~58h.
- **Gate:** verification ritual green; audit doc marked 74/74 or each
  remaining item explicitly deferred with reason.
- **Risk:** Low. Schema here is on the critical path anyway, so not
  wasted when keys arrive.

### Phase P5 - Email + retention loops

- **Goal:** Transactional + lifecycle email; the retention flywheel.
- **Complexity:** T2-T3 (~80h).
- **Prereqs:** Resend key for live send; Inngest for fan-out. Logic and
  templates are unit-testable without keys (build behind `services.resend`).
- **Work:** Resend client + 5 core templates (welcome, college-verify,
  order-hired, order-submitted, payout-settled); match fan-out Inngest
  fn with a 3-emails/student/day cap reading `notification_log`; weekly
  earnings digest cron; notification preferences honored.
- **Effort:** ~80h.
- **Gate:** templates snapshot-tested; cap enforced in a unit test; one
  real send per template when key lands.
- **Risk:** Deliverability/spam-folder rate (invisible until live).

### Phase P6 - Search + rate limit + observability

- **Goal:** Real discovery + abuse protection + you can see production.
- **Complexity:** T2 (~120h aggregate).
- **Prereqs:** Meilisearch, Upstash, Sentry, PostHog keys. All have a
  demo/in-memory fallback already, so build proceeds without keys.
- **Work:** Meilisearch client + indexers (`searchReindex` Inngest fn);
  Upstash sliding-window `withRateLimit` applied to `postJob`,
  `submitProposal`, `sendMessage`, `verifyOtp`; Sentry + PostHog in
  `lib/observability`; funnel events from every Server Action.
- **Effort:** ~120h.
- **Gate:** rate-limit unit tests; one indexed search query live; one
  Sentry event + one PostHog funnel visible.
- **Risk:** RSC + 3rd-party SDK bloat hurting page-load p95.

### Phase P7 - Hardening: PII/DPDP, file safety, a11y

- **Goal:** Be lawful and safe before real users + real PII.
- **Complexity:** T3 (~190h). Highest compliance risk.
- **Prereqs:** Counsel review (external); Supabase Vault.
- **Work:** PII encryption (PAN/Aadhaar/phone) via Vault; DPDP flows -
  download-my-data, delete-account, consent log, cookie/consent banner,
  grievance-officer surface; file-upload validation (MIME sniff, EXIF
  strip, ZIP path-traversal guard, size caps, virus-scan hook); full
  a11y sweep + Lighthouse to >=95.
- **Effort:** ~190h + counsel hours.
- **Gate:** Lighthouse >=95 on key pages; DPDP flows demoable;
  pen-test-lite on upload paths.
- **Risk:** **Compliance is not optional in India.** Under-building
  here is legal exposure, not just polish. See S7 external flags.

### Phase P8 - Load tests + runbooks + ops

- **Goal:** Know it holds; know what to do when it breaks.
- **Complexity:** T3 (~120h).
- **Prereqs:** P6 observability live.
- **Work:** k6 load scripts in a weekly CI run; webhook idempotency
  stress test + commission reconciler; runbooks (deploy, incident,
  webhook replay, key rotation, dispute SOP, payout reconciliation);
  `/admin/ops` dashboard with live Sentry/Inngest/Razorpay counters.
- **Effort:** ~120h.
- **Gate:** load test passes target RPS at p95 < 2.5s; reconciler
  catches a seeded double-credit in a test.
- **Risk:** Inngest reliability is the weak link in the availability SLA.

### Phase P9 - B2B + monetization

- **Goal:** Revenue beyond the 15% take rate.
- **Complexity:** T3-T4 (~210h).
- **Prereqs:** Live core loop (Phase V) proven; some repeat-client volume.
- **Work:** Featured-listing checkout (Razorpay); client subscriptions
  (Razorpay Subscriptions API + UI + plan migration); team/group
  projects (multi-way Route split + Server Action); university B2B
  partner key issuing + HMAC verification + admin UI + signed webhooks.
- **Effort:** ~210h.
- **Gate:** one featured-listing purchase + one subscription cycle +
  one HMAC-verified partner webhook, all in test mode.
- **Risk:** Build only after the master plan's "100+ repeat clients"
  trigger; premature monetization distracts from liquidity.

### Phase P10 - Expo mobile (M7.3)

- **Goal:** Native iOS + Android over the same backend.
- **Complexity:** T4 (~250h+).
- **Prereqs:** A stable API surface (post Phase V), ideally a
  `@stuviora/shared` workspace package for types/logic (~80h).
- **Work:** Expo app (auth, dashboard, matches, orders, messages); EAS
  + TestFlight + Play internal; push notifications (web + Expo).
- **Effort:** ~250h app + ~80h shared pkg + ~60h push.
- **Gate:** internal-track build of the core loop on both platforms.
- **Risk:** Parallelizable after Phase V with a second engineer; do not
  let it block the web revenue flywheel.

### Phase P11 - Launch ops

- **Goal:** Go public, safely.
- **Complexity:** T2-T3 (mostly ops).
- **Prereqs:** P7 (compliance) + P8 (runbooks) + Route live approval.
- **Work:** DNS + Cloudflare (DDoS + CDN); status page + uptime
  monitors; staging + prod Vercel; the beachhead playbook (first-10
  founder-led clients, campus ambassadors).
- **Effort:** ~80h eng + heavy founder/ops time.
- **Gate:** status page green; first founder-sourced paid order live.
- **Risk:** This is where **cold-start liquidity** (not build) becomes
  the existential risk per the honest-review.

---

## 4. Complexity-ordered execution lanes ("by time available")

Run T1 items in the cracks between the big phases.

- **A Saturday (T1, <8h each):** finish remaining audit polish, OG/Twitter
  cards, sitemap + robots, README + CI badge, lint sweep, `.env.example`
  polish, persona switcher in DEMO_MODE.
- **A focused week (T2, 8-40h):** Phase V verification slices; Sprint 5b;
  a P6 sub-system (rate limit OR search OR observability).
- **A multi-week project (T3, 40-160h):** P5 full; P7 hardening; P8 ops.
- **A quarter (T4, 160h+):** P9 B2B/monetization; P10 mobile.

---

## 5. Recommended sequence (the actual order I'd run)

Given **"no keys yet"** today:

1. **Now (no keys):** Phase A - Sprint 5b, then remaining audit gaps.
   Re-audit the honest-review doc; keep `continue-prompt.md` fresh.
2. **In parallel (founder):** submit Razorpay Route; provision Supabase
   + OpenRouter; engage counsel + CA.
3. **The moment keys land:** stop feature work, run **Phase V**. This is
   non-negotiable - it validates 4 phases of code at once.
4. **Then:** P5 (retention compounds early), P6 (you need to see prod).
5. **Before any public launch:** P7 (compliance) + P8 (runbooks).
6. **After live core loop proves out:** P9, P10 (parallel), then P11.

Effort to a **live, hardened, single-platform v1 (through P8 + P11
launch ops, excluding mobile/B2B):** roughly the honest-review's
~1,040h (1,420h total minus ~380h "nice"/mobile). Solo: ~7-9 months.
Small team: ~4-5 months. **The clock starts when the founder long
poles (S2) start, not before.**

---

## 6. Acceptance gates (every phase)

- `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build` exit 0.
- New tests where engine math changes.
- Demo path stays alive; live code behind `services.<flag>`.
- No em-dashes / en-dashes in user-visible copy.
- Branch per logical unit; squash-merge PR; CI green before merge.
- "Done" means live-verified, not just wired (state the distinction).

---

## 7. External assumptions to VERIFY (not freshly confirmed this session)

The web-verification pass was rate-limited, so these inherited
assumptions need a fresh check before you rely on them. Several look
**materially wrong or stale** in the current docs:

1. **TDS section is probably wrong.** Master plan S3.1 and S4 assume
   "TDS 5% under Sec 194H past Rs.30k/year." For a platform paying
   sellers, the governing provision is most likely **Section 194-O
   (e-commerce operator -> e-commerce participant)**, whose rate was
   **reduced to 0.1%** and which carries a **Rs.5,00,000** annual
   threshold for individuals/HUF - not Rs.30,000. 194H (5%) applies to
   commission/brokerage, a different flow. **This changes the tax engine
   thresholds and the wallet TDS-proximity warning (audit #36).**
   Action: confirm with a CA; likely re-pin `lib/tax/engine.ts`.
2. **GST + TCS:** confirm 18% GST on the platform commission and whether
   **GST TCS under Section 52** (e-commerce operator collection) applies
   and at what current rate.
3. **Razorpay Route:** confirm the current onboarding/approval timeline,
   required KYC for Linked Accounts, and exactly what works in **test
   mode** vs needs live activation. Plan assumes weeks of lead time.
4. **DPDP Act 2023 + Rules:** confirm whether the implementing **Rules
   are finalized/notified** and the **compliance deadline/grace period**,
   plus children's-data (verifiable parental consent) and breach-notice
   timelines. This scopes Phase P7.
5. **AI-gate economics:** confirm current Claude/OpenRouter pricing.
   "< Rs.5 per review" is realistic on a small/fast model but tight on a
   mid-tier model for long documents; pre-screen with a cheap model.

I can re-run the five-source verification (Razorpay Route, DPDP, India
tax, LLM-judge economics, marketplace sequencing) once the rate limit
resets and fold cited results back into S7.

---

## 8. PM hygiene (do alongside)

- Re-audit `build-status-and-honest-review.md` (stale; predates P0-P4).
- Keep `continue-prompt.md` "Where the build is" table current per phase.
- Log any new feature in `features.md` decision log before building it.
- Re-tier `build-checklist.md` Part D when a T3/T4 item completes.

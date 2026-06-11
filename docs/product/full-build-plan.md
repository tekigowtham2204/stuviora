# 15 Full-product build plan, phase by phase, by complexity

> A CTO + PM execution plan to take Stuviora from "P0 to P4 wired
> behind flags" to a live, hardened, full product. Ordered by
> dependency first and complexity second, with effort, prerequisites,
> acceptance gates, and the non-engineering long poles called out.
>
> **Authored:** 2026-06-07. Grounded in `STUVIORA_MASTER_PLAN.md` (S4),
> `build-checklist.md` (Part D complexity tiers + Part E), and
> `build-status-and-honest-review.md` (hour model). Section 7 is a
> **five-source web verification (2026-06-07)** of the external facts
> the plan depends on, with primary-source citations and confidence
> flags; high-confidence items can be relied on, medium/low need a
> professional (CA / counsel / Razorpay) sign-off before launch.

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

## 7. External facts (VERIFIED 2026-06-07) and the plan changes they force

Five-source web verification (high-confidence items cited to primary
sources; medium/low and disputed items flagged). These **change the
plan**, not just confirm it.

### 7.1 India tax: the master plan's TDS model is WRONG (fix it)

The master plan (S3.1, S4) says "TDS 5% under Sec 194H past Rs.30k/yr."
Verified-incorrect for a marketplace paying sellers:

- **Section 194-O governs the seller payout, at 0.1% on gross** (reduced
  from 1%, effective 1 Oct 2024), and **overrides** 194C/194H/194J for
  that transaction. [high]
  https://cleartax.in/s/section-194o
- **Threshold: Rs.5,00,000** gross/FY for an individual/HUF participant
  who furnishes PAN/Aadhaar (no TDS below it) - **not Rs.30,000**. No
  PAN -> 5% under s.206AA. [high] https://cleartax.in/s/section-194o
- TDS base is **gross** (platform commission included); once 194-O is
  deducted you do **not** also layer 194H 5% on the commission. [high]
  https://taxguru.in/income-tax/section-194h-applicability-commission-e-commerce-operators.html
- **GST 18%** on the platform commission. **GST TCS u/s 52 is now 0.5%**
  (0.25% CGST + 0.25% SGST), reduced from 1% on 10 Jul 2024. [high]
  https://taxguru.in/goods-and-service-tax/cgst-e-commerce-operator-tcs-collection-rate-reduced-0-25-percent.html
- **Form 16A: quarterly**, due 15 Aug / 15 Nov / 15 Feb / 15 Jun. [high]
  https://incometaxindia.gov.in/Documents/Tax-Calendar/Issue-of-TDS-Certificate-in-Form-16A.htm
- **GSTIN:** services-only freelancers selling through an ECO are
  **exempt from compulsory GST registration below Rs.20L** (Notif.
  65/2017-CT), so most student sellers stay unregistered; collect +
  validate GSTIN at onboarding, stamp it on the invoice when present.
  [med-high] https://www.vjmglobal.com/blog/exempt-suppliers-services-through-an-e-commerce-platform-obtaining-compulsory-registration

> **Plan change:** re-pin `lib/tax/engine.ts` to 194-O (0.1% on gross,
> Rs.5L individual threshold) and TCS 0.5%; fix the wallet TDS-proximity
> warning (audit #36) from Rs.30k -> Rs.5L. Confirm with a CA whether any
> category is a notified s.9(5) service (then the platform pays GST).

### 7.2 Razorpay Route: test-mode-first is valid

- Route splits one payment into Transfers to Linked Accounts;
  **on-hold transfers (`on_hold` + `on_hold_until`)** are the escrow-like
  hold mechanism (not a regulated escrow account). [high]
  https://razorpay.com/docs/payments/route/
- **Linked Accounts can be created/tested in Test mode**; real fund
  movement needs Live activation + completed KYC. [high/med]
  https://razorpay.com/docs/payments/route/faqs/
- Base KYC: Express Activation ~1 business hr, standard review ~4-5
  business days; **Route is separately enabled and typically gets manual
  marketplace review - exact duration not published** (treat as
  days-to-weeks; confirm with Razorpay). [med/low]
  https://razorpay.com/blog/introducing-express-activation/
- Webhooks: `transfer.processed`, `settlement.processed`; **at-least-once
  delivery, dedupe on `x-razorpay-event-id`**, retries w/ backoff up to
  24h, respond 2xx within 5s. [high]
  https://razorpay.com/docs/webhooks/best-practices/

> **Plan change:** Phase V can proceed in **test mode** before live Route
> approval. Confirm the existing `webhook_events` guard keys on
> `x-razorpay-event-id`.

### 7.3 DPDP: Rules notified; 2026 is the build/test year

- **DPDP Rules 2025 notified 13 Nov 2025.** Phased: Board provisions
  immediate; consent-manager by **13 Nov 2026**; substantive obligations
  (notice, rights, breach, children) from **13 May 2027** (~18-mo grace).
  [high]
  https://www.ey.com/en_in/insights/cybersecurity/transforming-data-privacy-digital-personal-data-protection-rules-2025
- Obligations: standalone itemized consent notice; rights (access,
  correction, **erasure**, grievance, nominate); withdrawal as easy as
  consent; **grievance SLA max 90 days**. [high]
  https://www.dpdpa.com/dpdparules/rule14.html
- **Under-18 = child: verifiable parental consent required; profiling +
  targeted ads to children prohibited.** Directly relevant - some college
  students are under 18. [high]
- **Breach reporting: to users without delay; to the Data Protection
  Board, initial intimation without delay + detailed report within 72h;
  no materiality threshold (any breach reportable).** [high]
- **No PAN/Aadhaar-specific category** under DPDP (all "personal data"
  treated uniformly; Aadhaar separately governed). Still treat PAN +
  payment data as high-risk under "reasonable security safeguards." [med]
- **Penalties up to Rs.250 crore** (security-safeguard failure). [high]
  https://ksandk.com/data-protection-and-data-privacy/penalties-adjudication-under-indias-dpdp-act-2023/

> **Plan change:** P7 features (consent manager hook, itemized notice,
> cookie banner, download-my-data, delete/erasure, consent+processing
> log, published grievance officer, 72h breach workflow, **age-gate +
> parental consent for under-18**) have a real deadline runway: build/test
> through 2026, compliant before May 2027. Confirm penalty tiers against
> the bare Act text before legal sign-off.

### 7.4 AI quality gate: economics confirmed, build refined

- Pricing per 1M tokens: **Haiku 4.5 $1/$5, Sonnet 4.6 $3/$15, Opus 4.8
  $5/$25**. OpenRouter passes provider rates through with **no inference
  markup** (but ~5.5% card top-up fee out-of-band). [high]
  https://openrouter.ai/pricing
- Per-review (12k in + 400 out): **~Rs.1.2 on Haiku, ~Rs.3.6 on Sonnet**;
  sub-Rs.5 holds on both up to ~12-15k input (Haiku across 5-20k). Prompt
  caching the rubric/brief prefix cuts repeat-call cost. [high, arithmetic]
- Reliability: verbosity + position + self-enhancement bias are real
  (MT-Bench, arXiv 2306.05685). Mitigate with **structured JSON output,
  a 1/3/5-anchored rubric, <=5 scoring dimensions, a 100-500 example
  human-labeled calibration set** (recalibrate when agreement <~75%), and
  a **Haiku pre-screen reserving Sonnet for borderline/audit** cases. [high]
- Long-input grading takes **tens of seconds** vs ~29-30s serverless
  caps -> **async background job is mandatory** (already P4's design).
  Prefer **one multi-criteria call** over N single-criterion calls
  (input dominates cost). [high]

> **Plan change:** default the gate to **Haiku 4.5 pre-screen + Sonnet
> 4.6 on borderline**; one structured multi-criteria JSON call; stand up
> a calibration set early (master plan's "2-3 tuning rounds" maps to this).

### 7.5 Marketplace sequencing: validates the liquidity-first order

- **Liquidity, not features, is the primary risk**; network effects only
  start after critical mass per side. [high]
  https://a16z.com/13-metrics-for-marketplace-companies/
- **Trust must be in the MVP** ("marketplaces live and die on trust") -
  Stuviora's AI gate + verification + ratings is the right early bet. [high]
  https://roobykon.com/blog/posts/how-to-build-an-online-marketplace-mvp-in-2026
- **Defer** advanced search / recommendations / mobile until liquidity
  exists ("an AI rec engine means nothing if basic search is clunky").
  [med] - supports deferring P6 search depth and **P10 mobile**.
- **Beachhead first** (constrain by geography/vertical); track
  time-to-first-match + fill rate. [high]
  https://www.lennysnewsletter.com/p/how-to-kickstart-and-scale-a-marketplace
- HBR 250-platform study: 4 failure causes - mispricing a side, weak
  trust, dismissing competition, entering too late. [high]
  https://hbr.org/2019/05/a-study-of-more-than-250-platforms-reveals-why-most-fail
- *Flagged unverified:* specific 20-40%/40-60% liquidity benchmarks and
  the 30-80% leakage range (secondary/self-reported sources only).

> **Plan change:** keep mobile (P10) and deep search (P6) **after** the
> beachhead reaches liquidity; do not let them precede the live core loop
> + founder-led demand. This matches the master plan's "ship M3, then
> harden/expand."

---

## 8. PM hygiene (do alongside)

- Re-audit `build-status-and-honest-review.md` (stale; predates P0-P4).
- Keep `continue-prompt.md` "Where the build is" table current per phase.
- Log any new feature in `features.md` decision log before building it.
- Re-tier `build-checklist.md` Part D when a T3/T4 item completes.

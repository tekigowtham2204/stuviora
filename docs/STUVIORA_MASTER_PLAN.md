# Stuviora — Master Plan

> **One-line:** India's first AI-powered student freelancing platform, where every deliverable passes an AI quality check before it reaches the client — making student talent safe to hire for the first time.
>
> **Tagline:** *"Hire students. Trust the platform."*
> **Status:** Fully designed (7 planning docs), zero code written. Plan dated 1 June 2026.
> **Scope: the complete full product.** Not an MVP. Every page, every table (37), every engine, background job, and university system in the architecture docs is in scope. Nothing is deferred or cut — the only question is *build order*, driven by dependencies, not by minimalism.
>
> **First target: one responsive web application.** Desktop + tablet + mobile-web, served from a single Next.js codebase (responsive design, not a separate mobile build). The native **Expo mobile app is NOT part of the first target** — it becomes a later phase after the web product is complete. Page count below is for the web app.

This document ties the existing blueprints into **one sequenced plan to ship the entire platform** — what to build, in what order, how to launch, and how to make it a blockbuster. It supersedes nothing; it sequences everything.

> **A note on sequencing the full product.** "Build everything" still has to happen in an order — you cannot build payouts before payments, or matching before jobs exist. The phases below are a **dependency-ordered path to the complete product**, not a scope-reduction. We ship the core loop *first* because every other system reads from or writes to it, then layer the full surface on top. The loop becomes live and earning revenue while the rest is built around it — this is how you build a large product without an 8-month dark period before launch.

---

## 0. The thesis (why this wins)

Indian students have real, sellable skills (writing, design, code, research, social) but no trusted way to monetize them, and SMBs can't safely hire an unknown 20-year-old. **Every existing freelance platform fails students twice:** clients don't trust them, and students don't know how to price or pitch. Stuviora removes both frictions with **one wedge no competitor has: an AI quality gate that guarantees the work is good *before* the client ever sees it.**

That single feature converts the entire pitch from *"trust this random student"* to *"trust the platform's review."* Everything else (escrow, trust score, verification) is table stakes that makes the wedge credible.

**The moat compounds:** more jobs → more AI reviews → better quality calibration + richer student portfolios + trust-score data → higher client confidence → more jobs.

---

## 1. The core loop (protect this above all else)

```
Student signs up (college email) → onboards → bids on job → gets hired
→ submits work → AI gate reviews → client approves → money splits (85% student / 15% Stuviora)
```

**Everything in the product exists to make this loop spin faster and more often.** If a feature doesn't accelerate or protect the loop, it's v2. The first completed loop with real money is the only launch metric that matters.

---

## 2. Five-layer trust architecture (the product's spine)

| # | Layer | Question it answers | Mechanism | Build phase |
|---|-------|--------------------|-----------|-------------|
| 1 | **Identity** | "Is this student real?" | College-email OTP; 500+ verified `.ac.in/.edu.in` domains; optional Aadhaar KYC badge | Week 1–3 |
| 2 | **Skill** | "Can they do this?" | 15-min AI-graded assessment before listing; portfolio samples; imported Coursera/NPTEL badges | Week 4 |
| 3 | **Payment** | "Will I get scammed?" | Razorpay **Route** escrow; pay-on-approval; 72-hr auto-release | Day 1 — critical |
| 4 | **Quality** ⭐ | "Will the work be good?" | **Claude AI gate** scores every delivery 0–100; only ≥70 reaches client; "AI-reviewed" badge | Week 4 — the moat |
| 5 | **Track record** | "Has anyone hired them?" | First-job money-back guarantee; "Verified Freelancer" badge after 3 jobs; mandatory reviews | Ongoing |

---

## 3. Technical architecture (build target)

**Full-product stack (all in scope):**
- **Core:** Next.js 16 (App Router, React 19; `create-next-app` latest) · Supabase (Postgres + Auth + Storage + Realtime) · Razorpay Route · Claude API · Resend · Vercel.
  - *Next 16 reality check (from bundled version docs):* Middleware is now **Proxy** (`proxy.ts`); request APIs (`cookies()`, `headers()`, route `params`) are **async**; Turbopack is default; new Cache Components model. The build follows these, not older Next 14 conventions.
- **Async + infra:** Inngest (event-driven jobs) · Vercel Cron (scheduled jobs) · Upstash Redis (rate limiting + session cache).
- **Discovery + observability:** Meilisearch (student/job full-text search) · PostHog (funnel analytics) · Sentry (errors + webhook-failure alerts) · Cloudflare (DDoS + asset CDN).
- **Mobile + B2B:** Expo React Native (iOS + Android) · custom REST + webhooks API for university partners.

The earlier "MVP vs v2" split in the blueprints is collapsed: everything above ships as part of the full product. Sequencing (below) decides *when*, not *whether*.

### 3.1 Critical corrections already identified in the architecture audit
These are designed-but-not-obvious gaps. **Bake them in from day one — retrofitting is painful:**

1. **Razorpay Route, not "generic escrow."** Only Route does atomic percentage splits (85/15) in one API call. Standard escrow needs manual transfers and can't auto-credit the platform.
2. **AI gate must be async (Inngest), never inline.** Vercel times out at 10s; real PDF/DOCX/ZIP submissions will always exceed it. Submit → upload to Storage → fire Inngest → push result via Realtime.
3. **File extraction before Claude.** Claude can't read a raw PDF. Need: `pdf-parse` (PDF), `mammoth` (DOCX), Claude Vision (images), raw string (code), unzip-and-loop (ZIP). Without this the gate fails silently on every real submission.
4. **Webhook idempotency is non-optional.** Razorpay retries on 5xx. Without a `webhook_events` dedupe guard + HMAC-SHA256 verification, students get **paid twice.**
5. **Tax engine from the start.** GST 18% on commission; TDS 5% (Sec. 194H) once a student earns >₹30k/year. Requires GSTIN + student PAN at onboarding. Indian compliance, not optional.
6. **Anti-disintermediation by design.** Hide student email/phone/socials until order is `ACTIVE`. Clients see name + college only in proposals. This protects commission revenue.

### 3.2 Database — 37 tables (17 named in early blueprint, 20 added)
Critical additions cluster in **payments/ledger** (`platform_ledger`, `commission_events`, `webhook_events`, `tax_events`, `student_wallets`, `transfer_log`, `withdrawal_requests`), **skills taxonomy** (`skill_tags`, `student_skills`, `job_skill_requirements`), and **disputes** (`dispute_cases`, `dispute_evidences`). Enforce **Row-Level Security on every table**; ledger/commission/admin tables are `service_role` only.

### 3.3 Background jobs (10 — all new; the platform doesn't function without them)
- **Cron:** escrow auto-release (every 30 min) · commission reconciler (daily 2AM IST) · weekly earnings digest (Mon 9AM IST) · TDS threshold checker (monthly).
- **Inngest events:** async AI quality check · trust-score recalc · portfolio auto-generator · smart match notifier · dispute escalation timer · college-domain verifier · tax-event logger.

### 3.4 The four hardest things to build (de-risk these first)
1. `/student/orders/[id]/submit` — file upload + async AI gate + Realtime result push.
2. `/client/payment/[id]` — Razorpay Route checkout + escrow lock + webhook confirmation.
3. `/client/orders/[id]` — delivery review + approve + dispute + 72-hr auto-release.
4. The matching + trust-score engines (scoring formulas; currently zero code).

---

## 4. Build roadmap — full product, dependency-ordered

Eight milestones. Each is a coherent, shippable layer; later milestones depend on earlier ones. The **core loop goes live and earns revenue at M3** while the rest of the full product is built around it — no long dark period before launch. Calendar timing depends on team size (see §4.1); the *order* does not.

### M0 — Foundations (before code)
- [ ] Secure `stuviora.com` + `@stuviora` handles everywhere.
- [ ] Razorpay **Route** (Marketplace) account + GSTIN registration.
- [ ] Anthropic, Supabase, Vercel, Resend, Inngest, Upstash accounts + keys in Vercel env (never in repo).
- [ ] Seed `college_domains` (500+ Indian university domains) + disposable-email blocklist.
- [ ] **Finalize the 4 zero-designed engines on paper:** payment-split, dispute state machine, matching scorer, trust-score formula. (These have no design yet — design before building.)
- [ ] Repo scaffold: Next.js 14 App Router, route groups, Supabase clients, `middleware.ts` auth/role guard, CI, env config.

### M1 — Data + identity foundation
The full **37-table schema** with RLS on every table (ledger/commission/admin = `service_role` only), Supabase Auth, college-email OTP, the college-domain verifier job, role-based routing. Everything downstream reads from this — build it complete, not partial.
*Pages:* landing, how-it-works, login, signup + role picker, student/client signup, email verify.

### M2 — Profiles, onboarding, jobs & services
Student onboarding (skills, portfolio, AI-graded skill assessment, first service listing) and client onboarding (company, KYC). Job posting, service listings + packages, skills taxonomy, both dashboards. Public student profile + explore/browse.
*Engines:* skills taxonomy, service listings.

### M3 — Core loop live + earning ⭐ (first revenue)
The money loop, end to end, production-grade:
- **Payments:** Razorpay Route order → escrow lock → atomic 85/15 Transfer split → **idempotent HMAC-verified webhook handler** → commission ledger.
- **AI quality gate (the moat):** async via Inngest — file extraction (PDF/DOCX/image/code/ZIP) → structured-JSON Claude prompt → score routing → Realtime push to student. Never inline.
- **Orders:** bid → hire → submit → review → approve / 72-hr Cron auto-release → payout → earnings + withdrawals.
- **Messaging:** Supabase Realtime threads with contact-gating until `ACTIVE`.
- **Reviews:** mandatory post-delivery rating.

> **This is the launch point.** From M3 onward the platform is live, real money moves, and the remaining milestones harden and expand it while it operates.

### M4 — Trust, disputes & compliance
- **Trust-score engine:** `(avg_rating×0.40)+(on_time×0.25)+(ai_pass×0.20)+(response×0.15)`; Bronze→Silver→Gold→Platinum tiers gating higher-budget jobs; `trust_score_history`.
- **Dispute engine:** full state machine (OPEN → EVIDENCE_COLLECTION → ADMIN_REVIEW → RESOLVED), evidence upload, 48-hr escalation timer, commission `DISPUTE_HOLD` + rollback.
- **Tax engine:** GST 18% invoicing on commission; TDS 5% (Sec. 194H) past ₹30k/year; PAN capture; Form 16A data; DPDP-compliant PII encryption (Supabase Vault).
- **Admin:** full dashboard — live GMV, daily revenue, dispute queue, payout override, user management, immutable `admin_actions` audit trail.

### M5 — Intelligence & growth features
- **Smart matching engine:** `(skill_overlap×0.45)+(budget_fit×0.25)+(trust×0.20)+(availability×0.10)`; top-20 notify; 3-emails/student/day cap.
- **AI proposal writer + pricing engine:** raises win-rate and GMV per job, prevents undercharging.
- **Portfolio auto-generator:** every completed job → Claude-drafted case study the student edits.
- **Discovery:** Meilisearch full-text search across students and jobs.
- **Retention jobs:** weekly earnings digest, smart notifications, notification preferences.

### M6 — Hardening, scale & observability
Rate limiting (Upstash sliding-window per-user/per-endpoint), Sentry, PostHog funnels, Cloudflare (DDoS + CDN), commission reconciler + full background-job suite in production, file-upload validation (MIME/size/EXIF/ZIP path-traversal), load/webhook stress testing, accessibility + full empty/error states.

### M7 — Mobile & B2B expansion
- **Expo React Native app** (iOS + Android) over the same Supabase/Next.js backend.
- **University partnership system:** dashboards for placement cells, student-activation reporting, custom REST + webhooks API.
- **Advanced monetization:** featured listings, client subscriptions for volume hiring, verified-skill premium, team/group projects, video-call integration.

### 4.1 Timeline & team
The blueprint's "6 weeks" assumed a *solo dev shipping an MVP*. The **full product is a materially larger build** (55 pages, 4 net-new engines, mobile app, B2B API, full compliance + observability). Indicative effort:
- **Solo founder-dev:** M1–M3 (live core loop) ≈ 8–12 weeks; full product (M1–M7) ≈ 7–10 months.
- **Small team (2–3 devs + 1 designer):** live core loop ≈ 5–6 weeks; full product ≈ 4–5 months, with mobile/B2B parallelized after M3.

Recommendation regardless of team: **ship M3 to real users and start the revenue + content flywheel before building M4–M7.** A complete product that no one has stress-tested is riskier than a live core loop you expand weekly.

---

## 5. Business model & unit economics

- **Revenue:** 15% commission on every completed job (auto-split via Route). Net after 18% GST on the fee.
  - On a ₹10,000 job: student ₹8,500 · Stuviora ₹1,500 gross · ₹270 GST · **₹1,230 net.**
- **Later monetization (only after 100+ repeat clients):** featured listings, client subscriptions for volume hiring, verified-skill premium, university B2B.
- **Targets from the founder blueprint:**
  - Month 1: 10 completed jobs.
  - Month 3: ₹3L GMV (~₹45k revenue).
  - Break-even: ~Month 6 if lean.

---

## 6. Go-to-market — the blockbuster engine

**Two-sided cold-start: solve supply first (students are easier), then concentrate demand.**

### 6.1 Beachhead strategy (don't boil the ocean)
Launch in **2–3 cities / 5 colleges**, not all of India. Density beats reach: a client needs to feel there are *many* good students *now*. Win one campus cluster fully (e.g. Ahmedabad CS/commerce), then replicate the playbook city by city.

### 6.2 Launch-day goals
100 student signups from 5+ colleges · 5 live client jobs · first completed job within 7 days · 1 college placement cell sharing internally.

### 6.3 Growth loops (the actual blockbuster mechanics)
1. **Content loop (Instagram-led, student-native).** Cadence: Mon hot-take static (comment bait) · Wed carousel tip (save bait) · Fri money-win reel (share bait) · daily story polls (the manual DM acquisition funnel). **Voice rule: post like a broke 21-year-old who figured out a hack, never like a startup.** "Razorpay: ₹4,500 credited" reels are the hero format.
2. **Earnings-proof loop.** Every payout is shareable social proof; weekly earnings digest (students who see weekly progress churn 40% less) doubles as content seed.
3. **Portfolio loop.** Every completed job auto-generates a case study → students share their Stuviora profile → free top-of-funnel.
4. **Campus ambassador loop.** Placement cells + student ambassadors per college; they earn for activating peers.
5. **Trust-badge loop.** "Verified Freelancer" / tier badges are status symbols students display → organic referral.

### 6.4 Demand side
First clients = founder's network + Indian startup/SMB communities (LinkedIn, Twitter, Reddit). Hand-hold the first 10 clients to a great outcome — the **first-job money-back guarantee** removes the only objection. Concentrate demand on the categories with proven student supply: content/copywriting (highest demand) and social-media/marketing (easiest entry).

---

## 7. Success metrics (what "blockbuster" looks like)

**North Star: completed jobs per week** (the loop spinning). Supporting:
- **Liquidity:** % of jobs receiving ≥3 proposals within 24h; % hired within 72h.
- **Quality moat:** AI-gate first-pass rate; client approval rate; dispute rate (<2%).
- **Retention:** repeat-client rate; student 30-day active rate; weekly-digest open rate.
- **Trust:** % students verified; first-job-guarantee claim rate (low = trust working).
- **Money:** GMV, take-rate-adjusted net revenue, GMV per active student.

---

## 8. Top risks & mitigations

| Risk | Mitigation |
|------|-----------|
| **Cold-start (no clients ↔ no students)** | Beachhead density; founder-sourced first 10 clients; supply-first. |
| **AI gate false-fails frustrate students** | Max 3 revisions; show fixes not just rejection; human admin queue on 3rd fail; tune threshold from real data. |
| **Double-payout / payment bugs** | Webhook HMAC + idempotency guard + daily reconciler from day one. |
| **Disintermediation (off-platform hiring)** | Contact-gating until `ACTIVE`; make on-platform escrow + guarantee genuinely safer for both sides. |
| **Fake students** | College-domain allowlist + disposable blocklist + manual review queue. |
| **Tax/legal non-compliance** | GST + TDS engine, PAN at onboarding, DPDP-compliant PII encryption (Supabase Vault). |
| **Quality of student work at scale** | Skill assessment gate + trust tiers gating high-budget jobs + AI gate. |

---

## 9. Immediate next actions (the M0→M3 foundation, in order)

These are the first concrete build steps toward the full product — each unblocks the next. We start here regardless of final scope because the entire platform sits on top of them.

1. **Scaffold the repo (M0)** — Next.js 14 App Router skeleton with the documented route groups, Supabase clients, `middleware.ts` auth/role guard, Inngest + env config, CI. *(Recommended first build step — makes everything else real.)*
2. **Write the full Supabase SQL (M1)** — all **37 tables**, types, FKs, indexes, RLS policies, plus the critical ledger/commission/webhook/tax schemas. Build it complete now; the full product depends on the whole schema.
3. **Build the AI quality gate (M3 moat)** — `qualityCheck.ts`: extraction pipeline + structured-JSON Claude prompt + Inngest async worker + Realtime result push.
4. **Build the payment engine (M3 critical)** — Razorpay Route order creation, atomic Transfer split, idempotent HMAC webhook handler, commission ledger.

---

## 10. AI feature set — strategic verdict (the "work smarter" layer)

**Guardrail (non-negotiable):** AI removes *busywork and intimidation*; it never does the *value-work* the client pays a human for. The product sells trustworthy, original student work — any feature that lets AI produce the deliverable destroys the moat and is rejected. Positioning is **"focus your effort on the work that matters; we automate the rest"** — never "cheat code / skip the skill."

### Approved — accelerators (reframed where noted)
- **Smart starting templates & scaffolds** — pre-built structures for common tasks to kill blank-page paralysis. A head start, *not* an auto-generated deliverable. *(M2/M5)*
- **Micro-Task Blitz** — curated genuinely-small real tasks for fast first-win → first payout → first trust points. Primary **activation** wedge. *(M3/M5)*
- **AI proposal/bid writer** — already planned. The pitch stays the student's. *(M5)*
- **Smart portfolio builder** — already planned (auto case-study generator), student edits before publish. *(M5)*
- **One-click delivery polish** — grammar/formatting/lint/image-optimization on the student's *own* output. Not content generation. *(M5)*
- **Structured feedback prompts** — actionable, structured client reviews (mandatory rating already exists). Not anonymous — accountability is part of trust. *(M4)*
- **Gamified progress** — streaks/levels/earning milestones **tied to the Bronze→Platinum trust tiers**, not vanity addiction. Retention driver. *(M4/M5)*
- **AI project decomposition** — breaks bigger jobs into sub-tasks so students can *deliver* more, raising GMV per order. *(M5)*
- **Intelligent task routing** — extends the matching engine; routes by **best-fit / highest win-probability**, not "easiest." *(M5)*
- **Dynamic pricing + negotiation assist** — pricing engine (planned) plus *suggested* negotiation replies the student sends. No auto-deals. *(M5)*

### Approved — moat amplifier (the hidden gem in this list)
- **Quality control + originality / AI-content detection** — upgrade the AI gate to also flag plagiarism and un-edited AI generation. This lets Stuviora *guarantee clients "real, original student work,"* turning the gate from a quality check into an **authenticity guarantee**. Strengthens the core moat directly. *(M3 gate → enhanced in M4)*

### Deferred
- **Automated workflow integrations** (design/code/content tools) — legitimate productivity, lower priority. *(M6+)*

### Reframed (capped to protect trust)
- **Client-comms assist** — *suggested* replies the student reviews and sends. Nothing auto-sends on the student's behalf. The "Ghost Assistant" auto-reply version is cut. *(M5)*

### Rejected (moat-destroying — do not build)
- **AI generating near-complete deliverables on one click** — collapses the value the client pays for.
- **"Passive income via student-deployed AI agents doing the work"** — sells commodity AI output at student markup; fraud + disintermediation risk; not part of the marketplace, full stop.

> **The reframe that makes the "backbencher" pitch actually work:** market the *removal of friction* (no scary proposal-writing, no pricing anxiety, no portfolio grind, instant polish, fast micro-wins) — never the *removal of effort on the work itself*. Low-effort supply is what kills marketplace trust; low-*friction* supply is what scales it.

---

*This plan is the connective tissue over the blueprint, MVP-pages, architecture, and content-bank docs — reframed for the **complete full product**. Build the foundation, take the core loop live and earning at M3, then expand to the full surface (trust/disputes/tax → intelligence → hardening → mobile + B2B) while real usage and earnings-proof content compound. Win one campus, then replicate.*

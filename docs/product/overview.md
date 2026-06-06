# 00 Overview

> Stuviora is an India-first AI-verified freelancing marketplace where
> verified college students sell their skills to small and medium
> businesses, and every deliverable passes a Claude AI quality check
> before it reaches the client.

**Tagline:** Hire students. Trust the platform.

## What we do, in one sentence

We turn the part of student talent that scares clients (the unknown
quality bar of a 20-year-old's work) into a guarantee they trust, then
we settle the money safely.

## The wedge

Every existing freelance platform fails students twice. Clients do not
trust them, and students do not know how to price, pitch, or get paid
safely. Stuviora removes both frictions with **one feature no
competitor has: an AI quality gate that scores every deliverable 0 to
100 before the client ever sees it.** Only work above 70 is delivered,
with an "AI-reviewed" badge stamped on it.

That single feature converts the pitch from *"trust this random
student"* to *"trust the platform's review."* Everything else (Razorpay
escrow, college-email verification, trust tiers, dispute mediation) is
table stakes that makes the wedge credible.

## Core loop

```
Student signs up (college email) -> onboards -> bids on job
  -> gets hired -> submits work -> AI gate reviews
  -> client approves -> money splits 85/15 in one Razorpay transfer
```

If a feature does not accelerate or protect this loop, it is not v1.
The first completed loop with real money is the only launch metric that
matters.

## Who pays

- **Clients** pay full job amount upfront into Razorpay escrow.
- **Stuviora** keeps **15%** as commission, splits on transfer.
- **Students** receive **85%** to their UPI or bank, net of TDS where
  applicable (Section 194H, 5%, over Rs.30,000/year).
- **Net margin per Rs.10,000 job**: Rs.1,500 gross to platform,
  Rs.1,230 net after 18% GST on the commission.

## Why now

- 250M+ Indian students with monetizable digital skills, all underbanked
  on legitimate income paths.
- The cost of high-quality AI grading is finally low enough (under
  Rs.5 per submission via OpenRouter) to gate every delivery without
  destroying unit economics.
- Razorpay Route enables atomic 85/15 splits in one API call.
  Marketplaces in India previously had to choose between compliant or
  fast; Route makes them both.
- DPDP came into force in 2026, so the bar for handling student PII
  rose. Most Indian student platforms have not yet caught up. We design
  to that bar from day one.

## What v1 ships (the live core loop)

- **Identity**: college-email OTP against a 500+ domain registry, plus
  optional Aadhaar KYC.
- **Skill**: 15-minute AI-graded skill assessment per category, plus
  portfolio.
- **Payment**: Razorpay Route escrow, 72-hour auto-release.
- **Quality**: AI gate on every submission. Below 70, the student
  resubmits with specific fixes.
- **Track record**: rating, trust tier (Bronze to Platinum), and a
  first-job money-back guarantee.

Full product surface (matching, AI proposal writer, portfolio
auto-generator, search, university B2B, monetization) is already built
in DEMO_MODE; the work ahead is flipping each integration to live keys.
See `docs/product/roadmap.md`.

## Target users

- **Student**: 18-24, in college, has a stackable skill (writing,
  design, code, social, research), wants legitimate income that builds
  a portfolio.
- **Client**: SMB or solo founder in India, Rs.3,000 to Rs.50,000
  budget, content / design / dev / research work, has been burned by
  Fiverr or simply does not know where to find Indian college talent.
- **University placement cell** (v2 buyer): wants activation data on
  cohorts, GMV by college, success stories for the brochure.

## Why this can be a venture-scale business

- 15% take rate is in line with Upwork and below Fiverr; it pays for the
  AI gate (the cost moat) and still leaves room.
- Marketplace dynamics: every completed job grows the trust dataset and
  the portfolio dataset. The AI gate gets sharper with more data.
- B2B layer: university partnerships create recurring deals that beat
  pure two-sided economics.
- Defensible because the trust + quality data compounds; a competitor
  cannot cold-start the AI gate without it.

## What we explicitly do not do

- Generate the deliverable for the student. The AI helps with friction
  (pricing, pitching, polish, portfolio writing). It never produces the
  work the client paid for. That would collapse the moat.
- Compete on price. We charge 15%; we do not race to the bottom.
- Serve full-time job placement. Stuviora is project-based freelancing.

## Status, today

- All M1 through M7 surfaces exist in DEMO_MODE. Live keys for Supabase,
  Razorpay Route, and OpenRouter are ready. Other integrations queued.
- Production rollout sequenced in `docs/STUVIORA_MASTER_PLAN.md` §4 and
  `docs/product/roadmap.md`.
- First completed paid order target: end of P3 (payments live). See
  `docs/product/metrics.md`.

## One paragraph for the deck

> Stuviora is the India-first student freelancing marketplace where
> every deliverable passes an AI quality check before it reaches the
> client. By solving the trust gap that has kept SMBs from hiring
> college talent, we unlock a 250M-student supply side at a 15%
> take rate, with Razorpay-Route escrow on every order and a dataset
> that compounds with every job.

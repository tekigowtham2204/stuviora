# 09 Roadmap

> Twelve months ahead, in horizons. Read this when you need to
> remember what is shipping next vs. what is still aspirational.
> Lines up exactly with the production-readiness plan in
> `docs/STUVIORA_MASTER_PLAN.md` and the PR-#1 sequence (P0 to P11).

## How to read this

Three horizons:

- **Now (next 90 days)**: scope is fixed. We ship these.
- **Next (90 to 180 days)**: scope is committed but order can shift.
- **Later (180 to 365 days)**: scope is a working set. Items here can
  move up if the data calls for it, or out if they do not.

## Now — Phases P0 to P3 (next 90 days)

The goal: **first paid loop closes end to end on live Razorpay.**

| Phase | Status | Ship gate |
|---|---|---|
| P0 — CI + tests | Partly done (CI workflow shipped; vitest + Playwright + engine tests still queued) | Green CI on a no-op PR; failing tests block merge. |
| P1 — Supabase DB live | Queued | Every `lib/data/queries.ts` function reads from the real DB; demo fallback still works. |
| P2 — Auth + Storage + college verification | Queued | A new student verifies a college email, uploads a portfolio file, lands on the dashboard against the live DB. |
| P3 — Razorpay Route payments | Queued | One Rs.100 test transaction completes; webhook replay does not double-credit; commission ledger shows `ESCROWED -> SETTLED`. |

**Public artifacts in this horizon**: PR #2 (currently open), GitHub
Actions green, first ten test-mode payouts captured as screenshots,
and the first founder-sourced paid order.

## Next — Phases P4 to P7 (90 to 180 days)

The goal: **the platform is good enough that the founder stops
hand-onboarding clients.**

| Phase | Status | Ship gate |
|---|---|---|
| P4 — AI gate live via OpenRouter | Queued | A PDF submission is scored within 60 seconds; FAIL bounces back with specific fixes; PASS shows up with the AI-reviewed badge. |
| P5 — Email + retention loops (Resend, Inngest) | Queued | A new job triggers a digest to 20 matched students within 5 minutes; cap holds at 3/day. Weekly digest fires Monday 9am IST. |
| P6 — Search, rate limit, observability | Queued | Search returns >= 3 hits in under 300ms; abuse endpoint returns 429 after burst; Sentry receives a deliberate error. |
| P7 — Hardening (PII, files, accessibility) | Queued | A ZIP traversal exploit is rejected; "delete account" tombstones a user; Lighthouse a11y >= 95 on landing + both dashboards. |

**Public artifacts**: production status page; first 100 paid orders
landed; first dispute resolved end to end; SEO indexable freelancer
profiles indexed by Google.

## Later — Phases P8 to P11 (180 to 365 days)

The goal: **scale safely, win the university B2B layer, ship mobile.**

| Phase | Status | Ship gate |
|---|---|---|
| P8 — Load tests + runbooks + on-call | Queued | 50 webhook replays/sec produces no drift; k6 captures p95 charts; runbook for every key flow exists. |
| P9 — B2B + monetization live | Queued | One placement cell pulls cohort data with valid HMAC; one client subscribes to Growth tier; one team-of-3 order completes with correct split. |
| P10 — Expo mobile (M7.3) | Queued | A student logs in on iPhone, sees a match, opens the order, replies to a message. EAS dev build on TestFlight + Play internal. |
| P11 — Launch ops | Queued | First completed paid order on live Razorpay with no demo suffix; 10 beta clients; one campus placement cell sharing internally. |

**Public artifacts**: status.stuviora.com live; app store listings;
first university B2B contract signed; first investor update sent.

## Calendar view (indicative)

Solo founder-dev cadence per master plan §4.1. Compresses with each
hire.

```
Month 1   ▓▓▓▓▓▓░░░░░░  P0, P1 ship.
Month 2   ░░░░░░▓▓▓▓▓▓  P2 ships. P3 begins.
Month 3   ▓▓▓▓▓▓░░░░░░  P3 ships. First paid loop on live. ⭐
Month 4   ░░░░░░▓▓▓▓▓▓  P4 ships. AI gate live.
Month 5   ▓▓▓▓▓▓░░░░░░  P5 ships. Email + retention.
Month 6   ░░░░░░▓▓▓▓▓▓  P6 ships. Search + observability.
Month 7   ▓▓▓▓▓▓░░░░░░  P7 ships. Hardening.
Month 8   ░░░░░░▓▓▓▓▓▓  P8 ships. Load + runbooks.
Month 9   ▓▓▓▓▓▓░░░░░░  P9 ships. B2B + monetization.
Month 10  ░░░░░░▓▓▓▓▓▓  P10 begins. Mobile.
Month 11  ▓▓▓▓▓▓▓▓▓▓▓▓  P10 ships. Mobile in test.
Month 12  ▓▓▓▓▓▓▓▓▓▓▓▓  P11 ships. Public launch ops. ⭐
```

With a small team (2 to 3 devs + 1 designer per master plan §4.1), the
above compresses to about 5 months for the live core loop and ~7 months
for the full surface.

## What stays the same (the invariants)

These do not change between horizons. If a roadmap item conflicts with
one of these, the invariant wins.

- 15% take rate. We do not race to the bottom.
- AI quality gate on every delivery. It is the moat.
- INR + UPI + IST end to end.
- College-email verification as the identity floor.
- Razorpay Route as the settlement rail.
- 85/15 atomic split via a single transfer.
- No em-dashes or en-dashes in any user-visible string.
- Demo path always boots without keys.

## What we will revisit after v1

- Multi-currency (if international clients ask, not before).
- AI gate alternatives if OpenRouter pricing/SLAs become a problem.
- Native Android-first design (vs. iOS-first).
- WhatsApp-first onboarding (very India-shaped; powerful if it works).
- A Hindi UI experiment in three colleges.

## What we will not do, ever

These are out of scope by design. If they keep coming up, we update
the [features.md](./features.md) rejected list.

- AI generates the deliverable for the student.
- Anonymous proposals.
- Crypto payouts.
- Race-to-the-bottom open bidding wars.
- A general-purpose freelance platform serving senior independents.

## What changes the roadmap

A roadmap is a forecast, not a contract. Three signals move it:

1. **CPO/w trajectory misses target by >= 30%.** Reorder to whichever
   phase unblocks supply or demand most directly.
2. **A major vendor change** (e.g., Razorpay Route policy shift,
   OpenRouter pricing jump). Bring the swap-vendor phase forward.
3. **A funding event.** New cash compresses phases; new investor pulls
   in specific commitments (typically mobile and observability).

When the roadmap moves, the change goes in
[features.md](./features.md)'s decision log with the reason.

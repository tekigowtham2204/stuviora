# 06 Metrics

> The numbers we run on. One north star, six leading indicators, four
> guardrails. If a number is not here, it is not a KPI; do not put it
> on a dashboard.

## North star

**Completed paid orders per week (CPO/w).**

This is the loop spinning. Every other metric is upstream or downstream
of it. The first CPO above zero is the v1 launch event. Per the master
plan §7, this is the only number that confirms the platform works.

Target trajectory:

| Milestone | CPO/w | Notes |
|---|---|---|
| First paid loop | 1 | Phase P3 ship gate. |
| End of month 1 post-launch | 10 | Mostly founder-sourced + ambassador clients. |
| End of month 3 | 75 | First-time clients returning; one campus saturated. |
| End of month 6 | 200 | Two beachhead campuses + 50+ repeat clients. |
| End of month 12 | 1,000 | Five campuses, content loop compounding. |

## Leading indicators (predict next quarter's CPO/w)

### 1. Supply liquidity

**Proposals received per posted job within 24 hours.**

Healthy: median >= 3. Below 2, the matching engine is misfiring or the
job category has no bench. Above 12, we are spamming students; tune
the fan-out cap.

### 2. Time to first proposal

**Median minutes from job-post to first proposal.**

Healthy: under 60 minutes. Above 4 hours, students are not seeing the
brief; either notifications are broken or the match score floor is
too high.

### 3. Time to first hire

**Median hours from job-post to client clicking Hire.**

Healthy: under 24 hours for content / design; under 48 for dev / data.
Above that, the proposals page is not surfacing the right candidate
or the brief is bad. Run the brief through the AI rewrite assist.

### 4. AI gate first-pass rate

**% of submissions that pass on the first attempt.**

Healthy: 78% to 88%. Below 78, the gate is too strict or the brief is
poor; tune the rubric and run the calibration dashboard. Above 88, we
have false-positives leaking through; tighten.

### 5. 30-day client repeat rate

**% of clients who post a second job within 30 days of completing
their first.**

Healthy: above 35%. This is the single best signal of platform-fit
for SMBs. Drop below 25 means the first experience is leaking value
somewhere; usually delivery quality or messaging UX.

### 6. Match-fanout to hire conversion

**% of fan-out emails that lead to a proposal, then to a hire.**

Healthy: 8% to 15% propose, 30% of those get hired. Below 8%, ranking
is mis-tuned; revisit the matching weights.

## Trust funnel

Master plan §7 trust metrics. Track monthly.

| Metric | Target |
|---|---|
| % students who finished college-email verification | >= 95% |
| % students who finished the skill assessment | >= 80% |
| % students with at least one portfolio item | >= 90% |
| Dispute rate (open disputes / completed orders) | <= 2% |
| First-job money-back guarantee claim rate | <= 5% |
| Trust score median across active students | >= 70 (Silver) |

## Money

| Metric | Target |
|---|---|
| GMV per active student per month | Rs.6,000 at month 3, Rs.18,000 at month 12 |
| Take-rate-adjusted net revenue per Rs.10,000 GMV | Rs.1,230 net (15% - 18% GST on commission) |
| Cost per AI gate review | Below Rs.5 per submission via OpenRouter |
| Average platform tax cost per Rs.10,000 order | Rs.270 GST + Rs.0 or Rs.425 TDS depending on FY threshold |
| Withdrawal completion time | UPI: under 5 minutes; bank: under 1 working day |

## Guardrails (do not let these slip)

These do not move forward; they bound the others.

### G1. Double-payout count

**Zero, ever.** Webhook replay must be a no-op. The webhook idempotency
test in CI is the daily check; the monthly reconciler is the audit.

### G2. AI gate p95 latency

**Below 60 seconds** including file extraction. Above that, students
abandon and the trust feel breaks. Sentry alerts on a 5-minute window
breaching p95.

### G3. Page load p95 (landing + dashboard)

**Below 2.5 seconds** on Chrome mobile, 4G simulated. Lighthouse run
weekly in CI; alerts on a 10% regression.

### G4. Availability

**99.5% monthly minimum.** Status page exposes raw numbers. Any
incident over 30 minutes is post-mortemed within 48 hours.

## Anti-metrics (do not optimise for these)

These are easy to grow but they would mislead the team.

- **Total student signups.** Vanity. Most do not complete a job.
  Optimize % activated, not signups.
- **Total job posts.** Same. Optimize % of posts that receive >= 3
  proposals within 24 hours.
- **Average bid value.** Bid amount is set by the client budget; we
  cannot move it without burning supply.
- **Time on page.** Marketplace, not social.
- **Email open rate alone.** Open rate without a downstream signal
  (proposal or hire) is noise.

## Dashboard layouts

### Founder dashboard (refresh: live)

Top row, big numerals:

1. CPO this week (north star)
2. GMV this week
3. Active students (signed in within 7 days)
4. Open disputes

Second row, sparklines:

5. Daily revenue, 30 days
6. AI gate first-pass rate, 14 days
7. p95 latency: page load + AI gate

Side rail:

8. Top 5 most-escalated disputes
9. Webhook idempotency anomalies
10. Sentry recent errors

### Weekly review (Mon 9am IST)

A founder-facing email auto-rendered with last-week numbers, week-over-
week deltas, and the three biggest red lines. Generated by Inngest's
`weeklyEarningsDigest` extended for admins.

### Quarterly board pack

- CPO/w over the quarter, with annotations.
- Cohort retention: % of clients still active after 90 days.
- Net revenue and contribution margin.
- Beachhead progress (campuses won, university B2B contracts).
- Top three risks with mitigation status.

## How metrics map to roadmap phases

| Phase | What this phase moves |
|---|---|
| P0 (CI) | None directly. Enables clean velocity. |
| P1 (DB live) | Enables logging. Every metric becomes real. |
| P2 (auth, storage) | % verified students. |
| P3 (payments) | CPO/w from 0 to first non-zero. |
| P4 (AI gate live) | AI first-pass rate. AI latency p95. |
| P5 (email) | Match-fanout to hire conversion. |
| P6 (search, rate limit, observability) | Discovery success rate. Sentry visibility. |
| P7 (hardening) | Guardrails: double-payout, latency, a11y. |
| P8 (load tests) | Confidence to push CPO/w higher. |
| P9 (B2B + monetization) | Net revenue per CPO. |
| P10 (mobile) | DAU / WAU. App store rating. |
| P11 (launch ops) | First public CPO/w numbers. |

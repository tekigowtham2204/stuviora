# 19 Pitch deck (slide-by-slide)

> Slide-by-slide deck the founder can adapt for an investor meeting.
> Each section is one slide. Keep it to one page per slide when you
> export. Long form is in `vision-10x.md`; competitive sources are in
> `deep-research-category-winner.md`; numbers are in `metrics.md`.
>
> **Last touched:** 2026-06-26.

---

## Slide 1. Title

**Stuviora**
Hire students. Trust the platform.
India's AI-verified student freelancing marketplace.

Founder name / email. Round + ask in one line.

---

## Slide 2. Problem

Indian students have real, sellable skills (writing, design, code,
research). Every existing freelance platform fails them twice:

- Clients do not trust them (no track record, no resume).
- Students do not know how to price, pitch, or get paid safely.

1 in 3 first-time student freelancers loses money to scams or
ghosting. SMB clients spend agency money to get unverified gigs done.

---

## Slide 3. The wedge

**No incumbent runs an inline AI deliverable gate.**

Internshala, Truelancer, Upwork, Fiverr: all score the people, none
score the work. We score every deliverable against the brief before
the client sees it. Below the bar, it bounces back to the student
with specific fixes. Only verified work ships.

That single primitive lets us promise something nobody else can: a
first-time client can hire a first-time student and the platform
stands behind the result.

---

## Slide 4. Why now

Four forces converged in the last 18 months:

1. **AI inflection.** Inline quality verification of unstructured
   work (essays, code, design) just became economically viable.
2. **Demographic dividend.** India's freelance workforce on a path
   to ~23M by 2029-30; Gen Z is ~30% of the gig workforce.
3. **Regulatory tailwind.** UGC mandates 60-120h of credit-bearing
   internships for UG programmes. Every placement cell needs proof.
4. **SMB digitisation.** India's SMBs are digitising fast and cannot
   afford agencies. Verified students at fair prices are the fit.

---

## Slide 5. Solution (live demo)

The autonomous loop, no humans needed.

1. **Hire** -> Razorpay authorises (holds), does not charge.
2. **AI gate** -> scores the work to 100 on brief alignment,
   completeness, quality.
3. **PASS** -> auto-capture (client charged) + auto-deliver +
   72h dispute window.
4. **3x FAIL** -> void the hold. No charge, no human dispute case.
5. **Dispute** -> forces an AI gate re-run if revisions remain,
   else refund. Still no human.
6. **Silence** -> payout settles to the student. Done.

Investor sees this in the demo at `/vision` (Try the gate, run the
model, view a verdict receipt).

---

## Slide 6. Product (what is built)

Built and shipping in DEMO_MODE today; live behind `services.<flag>`:

- 50+ routes across student, client, university, and admin portals.
- 12 pure engines (trust, matching, pricing, tax, disputes, teams,
  reconciliation, consent, roster, proposal variants, assessment).
- Live integrations wired: Razorpay Route + auth-and-capture, OpenRouter
  AI gate + extraction, Resend email + retention, Meilisearch,
  Upstash, PostHog, partner HMAC API, university portal.
- 267 unit tests, CI green.
- Public verdict receipts (`/v/[id]`) + verify API
  (`/api/v1/receipts/[id]`).

---

## Slide 7. Market

- India freelance platforms revenue: **~USD 265M (2025), growing
  ~25% CAGR toward ~USD 1.5B by 2033.** (Grand View Research.)
- Workforce: **12-15M freelancers today, ~23.5M by 2029-30.** (India
  Skills Report 2026.)
- Gen Z share of gig workforce: **~30%.** (Demand Sage.)
- UGC FYUGP framework mandates 60-120h credit-bearing internship
  after the 4th semester for UG programmes.

We start in India; the protocol is portable to any market where
institutional trust is the missing primitive.

---

## Slide 8. Business model

- **Take rate: 15%** of GMV. Sits between Truelancer (8-10%) and
  Fiverr (20%), at Upwork's effective ceiling.
- **GST: 18% on commission**, included in the take.
- **Marginal cost per order: sub-rupee** (AI gate API + payment
  processor fees). No humans in the healthy or terminal-failure path.
- **Defensibility:** the gate is the difference between usable work
  and a scam. We sell the gate, not the rate.

Investor can adjust assumptions at `/vision` simulator.

---

## Slide 9. Moat

The AI gate prompt is copyable in a weekend. The calibration dataset
is not.

Every order produces a labelled triple: brief, submission, AI verdict,
human-confirmed outcome (approved / revision / disputed / refunded).
Across creative, technical, and analytical categories. Nobody else
has it.

In 12 months of meaningful GMV, the dataset is the asset. It
calibrates the gate so it becomes both stricter and more forgiving in
the right places. It is also the foundation for the verification
protocol we license (horizon 3).

---

## Slide 10. Three horizons

| Horizon | What | KPI |
|---|---|---|
| **Today** | AI-verified freelancing for Indian SMBs. | CPO/w |
| **24 mo** | University OS for the placement era (NEP 2020). | GMV per institution |
| **10x** | Trust protocol for verified online work. License the AI gate. Portable trust score. SE Asia first, then MENA. | External verifications / week |

Horizons one and two return the fund. Three is the asymmetric upside.

---

## Slide 11. Traction (honest)

Pre-traction. Code built and shipping in DEMO_MODE; live keys not
yet exercised end-to-end. The next milestone is Phase V (live
verification): first college email signup -> first paid loop ->
first AI verdict -> first auto-capture -> first auto-settle.

Once live, traction lands on `/trust` automatically. Until then,
no fabricated numbers.

---

## Slide 12. Team

Founder line. Background. Why this team, why this market, why now.

(Filled in by founder.)

---

## Slide 13. The ask

Round size. Use of funds (in priority order):

1. Phase V live verification + first 90 days of operations.
2. Two beachhead campuses + first institutional contracts.
3. Founder ops + first hire (operator-engineer).
4. Reserve for the protocol-licensing experiments (horizon 3).

Contact: `invest@stuviora.com`. Live demo at `/vision`. Public
verdict-receipt API at `/api/v1/receipts/[id]`.

---

## Speaker notes

- Lead with the wedge (slide 3) if the audience already knows
  Indian freelance.
- Lead with the autonomous loop (slide 5) if the audience cares
  about operating leverage.
- Lead with the moat (slide 9) if the audience is data-bet biased.
- Always end with the `/api/v1/receipts/[id]` demo. It is the only
  pitch in the freelance category that returns JSON to anyone on
  the internet on day one.

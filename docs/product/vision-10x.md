# 18 Vision (10x): from safe gigs to a trust protocol

> The investor-facing narrative. Mirror of `/vision` (the public page),
> with the long-form reasoning that does not fit on a single screen.
> Pair with `deep-research-category-winner.md` for the external-source
> table and `metrics.md` for the numbers we run on.
>
> **Last touched:** 2026-06-26.

---

## 1. The one-paragraph thesis

Stuviora is the only marketplace where every deliverable passes an
AI quality check before the client sees it. The 10x bet is to turn
that single primitive into a fully autonomous trust protocol, with
zero humans in the order loop, that compounds into a labelled corpus
of verified student work no incumbent can replicate. We start as
India's safe place to hire students; we end as the verification
layer for online work in markets where institutional trust is the
missing primitive.

## 2. No humans in the order loop

Most marketplaces scale staff with GMV. We do not. The order machine
runs end-to-end without a human reviewer touching any healthy order,
and unhealthy orders end in refund rather than arbitration. The
mechanism is **auth-and-capture plus inline AI verification**.

| State | What the system does | Who is involved |
|---|---|---|
| `hire` | Razorpay authorises (holds) the full amount. Card not charged. | Software |
| `in_progress` | Student works against the brief. | Student |
| `submitted` | AI gate scores the submission to 100. | Software |
| `auto_captured` | On PASS, the platform captures the hold and delivers. | Software |
| `dispute_window` | Client gets 72h to dispute. Silence settles. | Client (passive) |
| `revision_requested` | On FAIL with revisions left, student resubmits. | Student |
| `voided` | 3x FAIL voids the hold. No charge, no payout, no case. | Software |
| `completed` | Payout splits 85/15. GST + TDS inline. | Software |

The novelty is not the AI gate alone. It is **the gate wired into the
payment authorisation lifecycle**. A dispute does not go to a staff
queue; it forces an AI gate re-run if revisions remain, or refunds.
The payment processor never sees a chargeable disputed transaction in
the happy path, so operating cost per order trends toward the API fee.

## 3. Why now

Four forces converge in this window:

1. **Demographic dividend.** India has 12 to 15 million freelancers
   today and a trajectory toward ~23 million by 2029-30. Gen Z is
   already ~30% of the gig workforce. The next decade of online work
   in India is being staffed right now, by people in college.
2. **AI inflection.** Inline quality verification of unstructured
   deliverables (essays, code, designs, decks) became economically
   viable in the last 18 months. The wedge is open because the tech
   to fill it just shipped.
3. **Regulatory tailwind.** The UGC curriculum framework makes a 60
   to 120 hour internship mandatory for UG programmes, with credits
   attached. Every college placement cell now needs documentable,
   verifiable experiential work.
4. **SMB digitisation.** India's SMB sector is digitising fast and
   cannot afford agency rates. Verified student talent at fair
   prices, with money-back safety, is the natural fit. The buyer
   exists; the trust did not.

See `deep-research-category-winner.md` Section 4 for source links.

## 4. The wedge that no incumbent occupies

| Player | Take rate | Inline AI deliverable gate? |
|---|---|---|
| Internshala | 0% | No |
| Truelancer | 8 to 10% | No |
| Upwork | ~10% effective (22 to 34% true with Connects etc.) | No |
| Fiverr | 20% flat | No |
| **Stuviora** | **15%** | **Yes, on every order** |

Their AI investments point at matching, fraud, and skill badges, all
upstream of the work. We score the work itself, before the client
sees it. That single primitive lets us promise something nobody else
can: a first-time client can hire a first-time student and the
platform stands behind the result.

## 5. The three horizons

Each horizon funds and de-risks the next. Horizons one and two
return the fund by themselves. Horizon three is the asymmetric
upside that justifies the bet.

### Horizon 1: Today, AI-verified freelancing for Indian SMBs

What ships now. Verified students sell content, code, design,
research, and marketing to small businesses. Razorpay Route holds
the money, the AI gate checks the work, payouts auto-settle. 85/15
take rate, GST + TDS inline, college-email verification on every
signup, 72h auto-release.

**KPI:** CPO/w (completed paid orders per week). Targets in
`metrics.md`.

### Horizon 2: 24 months, university OS for the placement era

Every Indian college that needs credit-bearing internships and
placement evidence runs on Stuviora. Cohort dashboards, attributed
signups, GMV per institution. NEP 2020 credit reporting per
student. Invite attribution + revenue share with the college. First-
job money-back guarantee subsidised at the campus level.

Why this is asymmetric: distribution at near-zero CAC. The college
endorsement transmits trust at no marginal cost. Unstop's
institutional reach (~28M users across 10,000 college partnerships)
proves the playbook works at scale, but they do not compete on
freelance work. We do.

**KPI:** Institutions signed; GMV per institution; activation rate
per cohort.

### Horizon 3: 10x, the trust protocol for verified online work

The AI quality gate becomes a licensable verification protocol.
Adjacent marketplaces, agent platforms, and outcome-routing systems
pay Stuviora to verify deliverables produced on their stack. The
student trust score becomes a portable credential, the credit score
for student work. We expand into SE Asia first, then any market
where institutional trust is the missing primitive.

This is where the labelled corpus pays off. The protocol is only
defensible because the dataset is unique.

**KPI:** External verifications per week; trust-score export count;
geographies live.

## 6. The compounding moat

The AI gate prompt is copyable in a weekend. The calibration
dataset is not.

Every order produces a labelled triple:

- **Brief** (structured job spec with category, deliverable type,
  acceptance criteria)
- **Submission** (the student's actual work: text, code, file,
  design; with extraction metadata)
- **AI verdict** (0 to 100, per-dimension breakdown, specific issues
  raised)
- **Outcome** (human-confirmed: client approved, requested revision,
  disputed, or refunded)

Within 12 months of meaningful GMV, this dataset is the asset. It
calibrates the gate so it is both stricter and more forgiving in the
right places. It is also the foundation for the verification
protocol we license to others.

**The flywheel.** More orders sharpen the gate; a sharper gate
raises pass rates and trust; higher trust drives more orders. The
first mover wins because the dataset cannot be back-filled.

## 7. Unit economics

Asset-light. Cash-positive per order. No inventory, no salaries
scaling with GMV, no manual approvals.

| Line | Number |
|---|---|
| Take rate | 15% of GMV |
| GST on commission | 18% of the 15%; included in the take |
| Student share on PASS | 85%, captured the moment delivery is verified |
| Marginal cost per order | Sub-rupee; AI gate + payment processor fees |
| Manual touches per healthy order | 0 |
| Refund reserve per order | 0 in the happy path (hold is voided, not charged) |

Why the take rate holds: 15% sits between Truelancer (8 to 10%) and
Fiverr (20%), at Upwork's effective ceiling. The premium pays for
the inline gate. As long as the gate is the difference between a
usable deliverable and a scam, the rate is defensible. **We sell the
gate, not the rate.**

Why CAC compounds down: distribution rides the college channel.
Signed institutional partnerships push verified students in at near-
zero cost. We share revenue with the college; the college gets
credit-bearing placement evidence. Both sides win, fast.

## 8. What we are explicitly not building

These are dilutive or off-thesis. Decision log in `features.md`
Section "Rejected".

- **Mentorship, tuition, peer guidance.** Not a marketplace
  mechanic. Adds humans the loop is designed to remove.
- **Generating the deliverable for the student via AI.** Collapses
  the moat. We verify the student's work; we do not produce it.
- **Cohort cliques or social feeds.** This is not LinkedIn. The
  marketplace is the product.
- **Subsidised pricing for liquidity.** We do not race Internshala
  to zero. The take rate buys the gate; the gate buys the trust.
- **Manual dispute reviewers.** The dispute window forces an AI
  gate re-run or refund. Staff do not break ties on healthy orders.

## 9. The ask

Investors backing Stuviora are funding two things, neither of
which is the Indian gig market alone:

1. **The dataset.** A labelled corpus of student deliverables
   across creative, technical, and analytical categories, with
   human-confirmed outcomes. Nobody else has it. We build it by
   running the marketplace.
2. **The protocol.** Inline AI verification of unstructured work,
   wired into the payment authorisation lifecycle, with zero staff
   in the loop. Licensable in horizon three.

The marketplace is how we earn the right to build both.

Contact: `invest@stuviora.com`. The live trust numbers will appear
on `/trust` as soon as they exist. Until then, that page shows
policy facts, not invented social proof.

## 10. How to read the rest of the docs

- `STUVIORA_MASTER_PLAN.md` — the build plan, phases, and the
  master state machine.
- `deep-research-category-winner.md` — full competitive and market
  research with sources.
- `metrics.md` — the one north star, six leading indicators, four
  guardrails.
- `gtm.md` and `gtm-university-playbook.md` — the distribution
  plan, both consumer and B2B.
- `risks.md` — 11 named risks with owners and kill switches.

If a number contradicts this document, the number wins. Update
this document.

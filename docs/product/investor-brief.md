# Stuviora investor brief

_Status: pre-traction. Every number in the product is measured or an honest
empty state; this brief contains no fabricated metrics (see PRINCIPLES.md)._

## One line

A fully self-operating marketplace where Indian college students do paid
freelance work, an AI certifies the quality of every delivery, and the client
pays only when quality-checked work is in their hands. No human staff touches a
single order.

## The model in one breath

1. A client hires a student. Their payment method is **authorized (held), not
   charged**.
2. The student submits work. An **AI quality gate** scores it against the brief
   (0 to 100). Below 70 it goes back to the student to fix, up to three times.
3. On a pass, the work is **delivered and the payment is captured in the same
   moment**. The client pays on receipt of quality-checked work, never before.
4. If the work fails three times, the hold is released and the client pays
   nothing. If the client disputes inside a short window, the policy resolves it
   automatically (refund or a forced gate re-run). No mediator, no approval
   click, no support queue.

The product runs itself. There is no human reviewer, mentor, or operations team
in the loop, by design.

## Why this is different

Traditional freelance platforms sell a directory and hope. Escrow platforms
make the client pre-fund and then manually approve. Stuviora removes both points
of human friction:

- **The client never gambles.** They only pay for work an independent AI has
  certified against their brief.
- **The student is never stiffed.** Funds are authorized up front, so a passed
  delivery is a guaranteed payment.
- **The platform never employs a reviewer.** The gate is the acceptance step.
  This is what lets one engineer run a national marketplace.

## The 10x: the data flywheel is the moat, not the gate

The AI gate itself is table stakes; any competitor can call a model. The durable
asset is what accrues underneath it. Every order produces a labeled pair: the
gate's verdict, then the client's real-world outcome (kept, disputed, refunded,
reordered). That is a proprietary, India-specific, per-category dataset of *what
good student work actually looks like* that no cold-start rival has.

Each order makes the gate sharper, which lifts pass-precision, which lifts client
retention, which pulls more orders. The flywheel is instrumented today (gate
precision vs client outcome is on the admin dashboard). At scale it becomes a
vertical quality model that is genuinely hard to copy.

## Unit economics (modeled, transparent)

- Take rate: 15% commission, captured on delivery.
- Variable cost per order: payment processing (~2% of order) + gate inference +
  payout transfer. Modeled on the founder dashboard with the assumptions printed
  inline; replace with measured costs as a cost ledger fills.
- This is a **volume + repeat + near-zero-CAC** business, not a high-margin-per-
  deal one. The leverage comes from college distribution (CAC near zero) and
  repeat orders (the repeat-order shortcut + retention metric exist in product).

## What an investor should underwrite

- **Cold start / liquidity.** The existential risk for any marketplace. The plan
  is a single category-by-campus wedge for the first 100 orders, then expand.
- **Gate validity per category.** The gate must assess the actual artifact, not
  just its description, and be honest about what it can and cannot judge.
- **Regulatory.** Holding and moving client funds in India implicates RBI
  payment-aggregator rules; the pay-on-delivery (auth-and-capture) model is
  designed to minimise funds held, but this is a real constraint to clear.

## What is already built

- Fully-automated AI quality gate enforcing the 70 threshold, with three
  revision attempts, no human review.
- Pay-on-delivery auth-and-capture flow (this milestone).
- Consent-gated auto-export of delivered work to the student's own destinations.
- Role-prefixed public identities, trust scoring, fraud-risk signals (advisory),
  and the gate-precision data loop, all on a demo-or-live architecture that runs
  with zero external keys for evaluation.

## The ask

[ raise size, use of funds, and milestones to fill in once the wedge and the
first-100-order plan are committed. ]

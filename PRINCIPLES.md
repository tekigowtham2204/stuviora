# Stuviora operating principles

Stuviora sells trust. A marketplace where first-time clients hire first-time
students only works if neither side, and no regulator, ever catches us being
dishonest. These principles are not aspirational copy; they are constraints on
what we are allowed to build. When a growth idea conflicts with one of them,
the principle wins. If you think a principle is wrong, change it here in a pull
request first, then build. Do not route around it in code.

## 1. No deception, ever

We never tell a user something we know to be false, and we never let the
product imply something false by omission.

- **Label things by what they are.** The AI quality gate runs on the model it
  actually runs on. We do not put a more famous vendor's name on a different
  vendor's model, and we do not invent model names. (`lib/llm/models.ts` shows
  the real model id next to every tier; the ops dashboard shows the real
  provider.)
- **Real numbers or no number.** Dashboards, trust pages, and marketing show
  measured values or an honest empty state. We do not seed fabricated metrics,
  reviews, order counts, or "students online" figures. Mechanism diagrams that
  illustrate how a flow works are fine and are labelled as such.
- **No fake scarcity or fake social proof.** No countdown timers that reset, no
  "3 people viewing", no invented testimonials.

## 2. The quality gate judges the work, not the writer

The AI gate exists to check whether a delivery does the job the brief asked
for. It is fully automated: it is the only check before the work reaches the
client, with no human reviewer or mentor behind it. Work scoring 70 or above
is delivered; below 70 goes back to the student to fix and resubmit, up to
three attempts. It must never become a filter on who the student is or how
they write.

- It scores the quality of the work against the brief: completeness,
  alignment, usability.
- It never penalises simple or non-native English, and never docks points for
  "reading like AI". This is about the quality of the work, not its
  authorship; AI-detection is unreliable and biased against students who write
  English as a second or third language.
- "Originality" means the work was genuinely produced for this brief (not
  copied wholesale), not how "human" the prose sounds. (See
  `lib/ai/prompts.ts`, `lib/ai/quality-gate.ts`.)

## 3. The student owns their work and their data

- Raw client files stay private. Delivered work is exported to a student's
  connected destinations only when the order is complete, and shared publicly
  only with the client's explicit licence for that order. (See
  `lib/export/plan.ts`.)
- Consent is recorded, not assumed, and is revocable.
- We collect the minimum personal data a feature needs. Sensitive identifiers
  (KYC, OAuth tokens) are referenced, not duplicated, across tables.

## 4. Money is handled as if it were ours to lose

- Client funds sit in escrow until the client approves or auto-release fires.
  The student is paid from escrow, never ahead of it.
- Zero double payouts, ever. Reconciliation runs daily and the guardrail is
  asserted, not hoped for. (See `lib/payments/reconcile.ts`.)
- Commission is disclosed up front and computed in one place
  (`COMMISSION_RATE`), not adjusted per user behind their back.

## 5. We do not punish people for using the platform honestly

- No dark patterns: cancelling, deleting an account, turning off emails, and
  withdrawing consent are as easy as the actions that started them.
- We do not trap relationships we did not create. Anti-disintermediation
  measures protect against fee-dodging on deals the platform sourced; they must
  not strand a client and student who already knew each other.
- Disputes have a real human path and a defined timer, not an unreachable form.

## 6. Build it so the honest path is the easy path

If a principle here is hard to follow in the code, that is a bug in the code,
not a reason to break the principle. Prefer designs where the safe, honest
behaviour is the default and the dishonest one is impossible to express.

---

These principles were written down after an early decision point: a request to
display a well-known vendor's model names over a different provider's models was
declined as deception. Codifying the rule means the next person does not have to
relitigate it under deadline pressure.

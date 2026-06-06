# 08 Risks

> Eleven risks ranked by combined likelihood and impact. Each has a
> named owner, a pre-mitigation in product, and a kill-switch trigger.

## R1. Cold-start two-sided liquidity

**Owner:** Founder.

**Likelihood:** High at launch. Decreases sharply after first 10 paid
orders.

**Impact:** Existential. If neither side ever shows up, nothing else
matters.

**Pre-mitigations:**

1. Beachhead strategy (see [gtm.md](./gtm.md)). Five colleges, two
   cities, supply concentrated.
2. Founder-led first 10 clients via WhatsApp + intro emails.
3. Campus ambassadors paid per verified onboarding, not per signup.
4. First-job money-back guarantee removes client risk on their first
   hire.
5. Hard-block signups outside the beachhead allowlist for 60 days.

**Kill-switch:** if CPO/w stays at 0 by week 8 after launch, pause
feature work and switch to founder-led sales full-time. The product
is not the bottleneck if 0 paid orders happen across 100 students and
10 clients; distribution is.

---

## R2. AI gate false-negatives frustrating students

**Owner:** Founder + AI lead.

**Likelihood:** Medium-high at launch. Lower as the rubric tunes.

**Impact:** High. A wrongly-rejected student churns immediately and
posts a bad review on Twitter.

**Pre-mitigations:**

1. Max 3 revisions per order; after the third FAIL, the submission
   goes into the founder admin queue, not a permanent reject.
2. Every FAIL ships with specific fixes ("section 2 asks for a
   comparison table, not bullets"). No "rejected" without a reason.
3. AI gate calibration dashboard in `/admin/ops` shows verdict
   distribution and lets the founder tune the threshold from real
   data.
4. PASS/FAIL of border cases (score 65 to 75) shown to the client as
   "AI-reviewed, marginal" rather than a binary block, so the client
   chooses.

**Kill-switch:** if first-pass rate drops below 65% sustained for 7
days, route every submission to the admin queue + lower threshold to
60 until calibration is restored.

---

## R3. Webhook race conditions causing double-payouts

**Owner:** Founder.

**Likelihood:** Low if we do the engineering right; catastrophic if
not.

**Impact:** Direct financial loss + customer trust loss. Razorpay
retries on every 5xx; a non-idempotent handler can pay the same
student twice.

**Pre-mitigations:**

1. HMAC SHA-256 signature verification on every webhook (already in
   `app/api/payments/webhook/route.ts`).
2. `webhook_events` idempotency table: on receipt, insert with
   `ON CONFLICT DO NOTHING`. Skip the dispatch if it was already
   processed.
3. Daily commission reconciler cron compares ledger sums against
   Razorpay's settlement file; alerts on drift.
4. Load test in CI: 50 webhook replays per second; assert no ledger
   drift (Phase P8).

**Kill-switch:** if the reconciler ever flags drift, the platform
freezes payouts (`commission_event.status = INVESTIGATION`) until
reconciled by hand. Better to delay one payout than double one.

---

## R4. Disintermediation (off-platform hiring)

**Owner:** Founder + product.

**Likelihood:** Medium. Indian SMBs ask for WhatsApp numbers often.

**Impact:** Lost commission. Lost protection for both sides.

**Pre-mitigations:**

1. Contact-gating: student phone, email, social IDs are masked in the
   profile and messaging until the order is `active`. Once `active`,
   contact is unmasked because trust is in place.
2. Make the on-platform path genuinely safer: escrow guarantee,
   first-job money-back, dispute mediation. The off-platform path
   loses all of these.
3. Phrase the platform messaging to make off-platform feel risky:
   "off-platform deliveries are not AI-reviewed and not money-back
   protected."

**Kill-switch:** none needed; this leaks at a steady-state rate and we
accept it below 5%. If it exceeds 10% of completed orders (measured by
"did the same client repeat-hire without a new job post"), we
re-evaluate.

---

## R5. Fake students or impersonation

**Owner:** Founder.

**Likelihood:** Medium. India has a long history of credential fraud.

**Impact:** Trust erosion the moment one fake student delivers a
plagiarised piece to a real client.

**Pre-mitigations:**

1. College-email OTP with hard allowlist (`college_domains`). Disposable
   blocklist.
2. AI gate originality + AI-content detection on every submission.
   Plagiarism flags route to founder review.
3. Trust score component dampens new accounts: they cannot accept
   above Rs.5,000 until they reach Silver (60+ score).
4. First-job money-back guarantee shields the client even if the
   student is found out post-delivery.

**Kill-switch:** if any college's domain shows fraud (matched ID + IP
on multiple accounts), suspend signups from that domain until manual
review.

---

## R6. Tax / legal non-compliance

**Owner:** Founder + counsel.

**Likelihood:** Medium. India tax compliance is intricate.

**Impact:** High. Notice from tax department, payout freeze, brand
damage.

**Pre-mitigations:**

1. GST 18% on commission automated; line item on every invoice.
2. TDS 5% Section 194H automated once student crosses Rs.30,000 FY
   threshold. PAN required before any TDS.
3. Form 16A generated quarterly and downloadable from `/student/tax`.
4. DPDP compliance: PII encrypted via Supabase Vault, consent log,
   download-my-data, delete-account.
5. Counsel-reviewed Terms / Privacy / Refund / DPDP disclosures before
   launch.

**Kill-switch:** none; this is a steady-state compliance burden. If
counsel flags an issue, we patch the engine and reissue the affected
invoices/certificates.

---

## R7. AI gate becomes commoditised

**Owner:** Founder.

**Likelihood:** High over 24-month horizon. Frontier LLMs are getting
both cheaper and more available.

**Impact:** Medium. The wedge erodes; we lose narrative differentiation.

**Pre-mitigations:**

1. Own the dataset, not the model. `brief + delivery + score + outcome`
   triples accumulate as we operate; competitors must cold-start.
2. Layer originality + AI-content detection into the gate so the
   "real, original student work" guarantee is a more specific claim
   than "AI-reviewed."
3. University B2B layer: distribution moat that does not depend on the
   AI gate.

**Kill-switch:** if a major competitor announces an inline gate, ship
the originality score as the headline metric and lean harder into
campus partnerships.

---

## R8. Razorpay outage or Route policy change

**Owner:** Founder.

**Likelihood:** Low (Razorpay is reliable).

**Impact:** High. We cannot settle payouts during the outage.

**Pre-mitigations:**

1. Idempotent webhook + reconciler: when Razorpay comes back, we
   replay safely.
2. Status page + visible "settlement delayed" banner to set
   expectations.
3. Cashfree as a vetted fallback, documented but unwired.

**Kill-switch:** during a confirmed Razorpay outage, mark new escrow
funding as "delayed" and let students know via in-app banner + email.
We do not silently fail.

---

## R9. Founder load (single point of failure)

**Owner:** Founder + first hire.

**Likelihood:** High in the first six months.

**Impact:** Medium. Slows scaling; risks founder burn-out.

**Pre-mitigations:**

1. Hand-onboard the first 10 clients, then document the playbook in
   `docs/launch/founder-playbook.md` so the next 100 do not need the
   founder.
2. Ambassador program offloads supply onboarding from week 4.
3. Hire ops generalist by month 3 if CPO/w exceeds 50.

**Kill-switch:** if founder is on the critical path for more than 40
hours/week by month 4, hire ops faster, even if cash is tight.

---

## R10. Brand damage from one bad story

**Owner:** Founder.

**Likelihood:** Medium. We hire SMB clients in a country where
LinkedIn outrage is a sport.

**Impact:** High. One viral "Stuviora ripped me off" thread sets the
narrative for a quarter.

**Pre-mitigations:**

1. First-job money-back guarantee: the structural answer to "I got
   ripped off." If the client asks, we refund. Quietly.
2. Dispute escalation: founder reads every escalated dispute. No
   ticket sits past 48 hours.
3. Proactive PR: own the conversation on Twitter and LinkedIn before
   the third party does. Honest "here is what went wrong, here is what
   we changed" posts.

**Kill-switch:** if a dispute starts trending, founder reaches out
directly within 4 hours, refunds in full + extra, and writes the
post-mortem in public.

---

## R11. Vendor dependency (OpenRouter, Resend, Inngest, Razorpay)

**Owner:** Founder.

**Likelihood:** Low individually; medium for the basket.

**Impact:** Medium. One vendor outage or unexpected price hike can
break a flow.

**Pre-mitigations:**

1. Demo path stays alive on every integration via the `services.<flag>`
   pattern. A vendor outage degrades to a graceful fallback, not a
   crash.
2. Caching for AI gate verdicts so a duplicate submission does not
   re-spend on OpenRouter.
3. Document vendor swap paths in `docs/runbooks/key-rotation.md`:
   OpenRouter to direct Anthropic; Resend to Postmark; Razorpay to
   Cashfree.

**Kill-switch:** if any vendor's cost spikes >2x or reliability drops
under 99% monthly, swap to the documented alternative.

## Risk dashboard

In the founder dashboard, a small risk strip shows:

- Open disputes count and oldest age.
- AI first-pass rate (last 24 hours).
- Webhook idempotency anomalies (last 24 hours).
- Off-platform suspected hires (heuristic: same client, same student,
  no new job post in 14 days).
- Reconciliation drift (Rs. amount).
- Vendor health (OpenRouter, Razorpay, Resend status badges).

Anything red triggers a Sentry alert that wakes the founder.

# 03 PRD v1

> Product Requirements Document for Stuviora v1. v1 is defined as **the
> live core loop**: a real Indian SMB hires a real verified student via
> the platform, the student delivers, the AI gate reviews, the client
> approves, and Razorpay Route settles 85% to the student's UPI and 15%
> to Stuviora's platform account in a single atomic transfer.

**Owner:** Founder.
**Status:** Built in DEMO_MODE; production wiring sequenced in
[roadmap.md](./roadmap.md).
**Target launch:** First completed paid order on live Razorpay, end of
Phase P3.

## 1. Goal

A first-time client hires a first-time student safely, and a first-time
student completes their first paid order within a week of signup,
both without human intervention from the platform team.

## 2. Non-goals (v1)

- No native mobile app (M7.3, deferred to post-v1.1).
- No multilingual UI. English only at launch.
- No video calls inside messages.
- No verified-skill premium upsell beyond the default skill assessment.
- No bulk-hire workflow for clients ordering 10+ students at once.

## 3. Personas

See [personas.md](./personas.md). v1 primary: Aarav, Diya, Priya. v1
secondary: Dr. Banerjee (the university dashboard is built but B2B
contract velocity is post-launch).

## 4. Functional requirements

### 4.1 Identity and verification

| Requirement | Detail | Status |
|---|---|---|
| College-email OTP | Student must verify a `.ac.in` / `.edu.in` against a 500+ domain registry. Disposable-email blocklist. | Live wiring P1+P2 |
| Optional Aadhaar KYC | Increases trust score; not blocking. | Demo today, live P2 |
| College allowlist | Hard match against `college_domains` table. Unknown domain blocks signup. | Live P2 |
| Client KYC | Razorpay-required for marketplace transfers. PAN + bank required before first payment. | Live P3 |

### 4.2 Skill verification

| Requirement | Detail | Status |
|---|---|---|
| Skill assessment | 15-minute AI-graded test in the student's category. Score becomes the initial skill component of the trust score. | Live P4 |
| Portfolio | Student uploads samples (link, image, file). Stored in Supabase Storage with signed URLs. | Live P2 |
| Imported badges | Coursera, NPTEL, GitHub. Not v1; deferred to v1.1. | Post-v1 |

### 4.3 Job posting and matching

| Requirement | Detail | Status |
|---|---|---|
| Job post form | Client enters title, category, description, skills, budget range, deadline. | Done |
| Smart matching | Engine ranks students per job using `skill 0.45 + budget 0.25 + trust 0.20 + availability 0.10`. | Engine done, fan-out P5 |
| Match fan-out | Top 20 students per posted job receive a notification within 5 minutes. 3-emails-per-student-per-day cap. | Live P5 |
| Featured listings | Client may pay Rs.499 to Rs.999 to boost a job. | Engine done, payment P9 |

### 4.4 Proposals and hiring

| Requirement | Detail | Status |
|---|---|---|
| AI proposal draft | One-click LLM-drafted pitch on the bid form. Student must edit before submit. | Live P4 |
| AI pricing chip | Suggested bid amount + range based on category floors and trust tier. | Done |
| Proposal submission | Cover letter + bid + delivery days. Rate-limited 5/min per student. | Live P6 |
| Client view | Ranked by AI fit; shows score breakdown, trust tier, ratings. | Done |
| Hire action | Server action transitions order to `pending_payment`. | Done |

### 4.5 Payments and escrow

| Requirement | Detail | Status |
|---|---|---|
| Razorpay Route order creation | Linked-account transfer config baked into the order. | Live P3 |
| Razorpay Checkout | Embedded on `/client/payment/[id]`. | Live P3 |
| Webhook verification | HMAC-SHA256 verify + idempotency guard via `webhook_events` table. | Live P3 |
| Escrow lock | On `payment.captured`, order moves to `active`; funds locked. | Live P3 |
| Atomic 85/15 split | On approval, single Route Transfer pays student linked account + platform account. | Live P3 |
| 72h auto-release | Cron job releases escrow if client does not act. | Live P3 |
| Refund / dispute hold | On dispute open, escrow stays locked; commission event marked `DISPUTE_HOLD`. | Done |

### 4.6 AI quality gate (the moat)

| Requirement | Detail | Status |
|---|---|---|
| File extraction | PDF (`pdf-parse`), DOCX (`mammoth`), images (LLM Vision), code (raw), ZIP (recursive). | Live P4 |
| LLM scoring | OpenRouter Claude Sonnet 4.5 with structured JSON output. Categories: brief alignment, completeness, quality, originality. | Live P4 |
| Pass threshold | Score >= 70 of 100 is PASS. Else, FAIL with specific fixes. | Done |
| Realtime push | Result pushed to student via Supabase Realtime on `order:${orderId}` channel. | Live P4 |
| Revision limit | Max 3 revisions per order; then admin queue. | Done |
| Async architecture | Inngest event-driven; never inline (Vercel 10s timeout). | Live P4 |
| Latency target | p50 under 20s, p95 under 60s including extraction. | Live P4 |
| Originality detection | Embedded in the gate prompt. Flags suspected AI-content with confidence. | Live P4 |

### 4.7 Trust tier

| Requirement | Detail | Status |
|---|---|---|
| Score formula | `rating 0.40 + on_time 0.25 + ai_pass 0.20 + response 0.15`. 0 to 100. | Done |
| Tiers | Bronze (0+), Silver (60+), Gold (78+), Platinum (90+). | Done |
| Budget gating | Bronze max Rs.5,000, Silver Rs.15,000, Gold Rs.50,000, Platinum unlimited. | Done |
| History | Every score change appended to `trust_score_history`. | Live P1 |
| Recompute trigger | After every completed order, review, AI verdict. | Live P5 (Inngest) |

### 4.8 Reviews

| Requirement | Detail | Status |
|---|---|---|
| Mandatory rating | Client cannot close order without leaving 1-5 stars + optional comment. | Done |
| Bidirectional | Student also rates the client (affects client reliability score). | Post-v1 |

### 4.9 Disputes

| Requirement | Detail | Status |
|---|---|---|
| State machine | open -> evidence_collection -> admin_review -> resolved. | Done |
| Evidence upload | Both sides may upload files; 48-hour window. | Live P2 storage |
| Escalation | 48-hour stage deadline; past deadline marks `Escalated` in admin queue. | Done |
| Resolution outcomes | Client favour, student favour, partial (configurable share). | Done |
| Commission impact | Full client refund waives commission; partial keeps it. | Done |

### 4.10 Tax and compliance

| Requirement | Detail | Status |
|---|---|---|
| GST 18% on commission | Auto-applied; line item on every order's invoice. | Done |
| TDS 5% Section 194H | Withheld once student crosses Rs.30,000 FY gross. PAN required before TDS applies. | Done |
| PAN capture | Encrypted at rest via Supabase Vault. | Live P7 |
| Form 16A | Annual TDS certificate downloadable from `/student/tax`. | Done |
| GSTIN client invoice | Generated per completed order. | Done |
| DPDP compliance | PII encrypted, consent log, download my data, delete account. | Live P7 |

### 4.11 Messaging

| Requirement | Detail | Status |
|---|---|---|
| Realtime threads | Supabase Realtime; one thread per order. | Live P1 |
| Contact gating | Phone, email, social IDs masked until order is `active`. Prevents disintermediation. | Done |
| Rate limit | 30 messages/minute/user. | Live P6 |

### 4.12 Notifications

| Requirement | Detail | Status |
|---|---|---|
| Preferences | User toggles: job matches, order updates, weekly digest, marketing. | Done |
| Match digest cap | 3 match emails per student per day, enforced via `notification_log`. | Live P5 |
| Templates | Resend templates: welcome, college verify, match digest, order hired, order submitted, AI gate result, payout settled, weekly digest, dispute opened/resolved, tier upgraded. | Live P5 |

### 4.13 Discovery

| Requirement | Detail | Status |
|---|---|---|
| Search | Full-text across students and jobs. Meilisearch with skill synonyms. | Live P6 |
| Explore page | Public, category-filtered student grid. | Done |

### 4.14 University B2B

| Requirement | Detail | Status |
|---|---|---|
| Cohort dashboard | Student count, activated count, GMV, GMV per student per college. | Done |
| REST API | `/api/v1/university/students/activated`, `/gmv/monthly`, `/jobs/by-college`. HMAC-signed. | Live P9 |
| Webhooks | `student.completed_first_job`, `student.tier_upgraded`. | Live P9 |
| Partner key management | Admin page issues + revokes keys, view per-partner usage. | Live P9 |

## 5. Non-functional requirements

### 5.1 Performance

- Page load p95 under 2.5s on landing, dashboard, matches.
- AI gate p95 under 60s end to end.
- Match engine ranking 10k students in under 2s.
- Webhook handler p99 under 1s.

### 5.2 Availability

- Target 99.5% monthly availability in v1; 99.9% post-v1.1.
- Status page at `status.stuviora.com`.

### 5.3 Security

- All PII encrypted at rest (Supabase Vault).
- All admin actions logged to immutable `admin_actions` table.
- Service-role tokens never exposed client-side.
- Rate limit on every abuse-prone endpoint via Upstash.
- HMAC on every external webhook (Razorpay in, partner out).
- DPDP-compliant cookie consent, download-my-data, delete-account.

### 5.4 Accessibility

- WCAG 2.2 AA on every shipped surface.
- Lighthouse a11y >= 95 on landing, both dashboards, both matches pages.
- All animations respect `prefers-reduced-motion`.
- Keyboard navigable end to end.

### 5.5 Browser and device support

- Last 2 versions of Chrome, Safari, Firefox, Edge.
- iOS Safari 16+, Android Chrome 110+.
- Responsive 360, 768, 1280, 1536 widths.

### 5.6 Internationalization

- INR only at v1. Tabular numerals everywhere.
- IST timezone for all displays. UTC stored in DB.
- en-IN locale.

## 6. Success criteria

See [metrics.md](./metrics.md) for the dashboard. The two acceptance
gates for v1:

1. **First paid loop closes end to end** on live Razorpay with no demo
   suffix, no manual founder action, in under 7 days from signup.
2. **No double-payouts** when a Razorpay webhook is replayed 10 times.

## 7. Out of scope for v1, ordered by next-in-line

1. Native mobile app (M7.3).
2. AI proposal writer + Vision-based portfolio extraction (works in v1
   without vision; vision adds visual brief alignment in v1.1).
3. Featured-listing checkout (engine in v1, live in P9).
4. Client subscription tiers (engine in v1, live post-v1.1).
5. Team / group projects.
6. Video calls in messages.
7. Multilingual UI.
8. Verified-skill premium tier.

## 8. Dependencies

- Supabase production project + service-role key.
- Razorpay Route Marketplace approval (requires GSTIN + bank).
- OpenRouter API key.
- Resend, Inngest, Upstash, Meilisearch, Sentry, PostHog. Each phase
  flagged for which one it needs.
- DNS + Cloudflare for the production deploy.

See `docs/STUVIORA_MASTER_PLAN.md` §8 for the full secrets list.

## 9. Risks

See [risks.md](./risks.md). Top three in priority order:

1. Cold-start two-sided liquidity (mitigated by beachhead + founder-led
   first 10 clients).
2. AI gate false-negatives frustrating students (mitigated by max 3
   revisions + specific fixes + admin override queue).
3. Webhook race conditions causing double-payouts (mitigated by HMAC +
   idempotency table from day one).

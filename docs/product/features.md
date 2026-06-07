# 04 Features

> Source of truth for what ships in v1, v1.1, v1.2, and what we reject
> by construction. If a feature is not here, it is not built. New
> requests get added to this doc first, then prioritised.

Legend: `S` ship in v1 · `+` v1.1 · `++` v1.2 · `R` rejected.

---

## Identity and verification

| Feature | Notes | Status |
|---|---|---|
| College-email OTP | `.ac.in`/`.edu.in` against 500+ domain registry. | S |
| Disposable-email blocklist | Stops `mailinator`, `tempmail` etc. | S |
| Optional Aadhaar KYC badge | Boosts trust signal. | S |
| Phone OTP secondary verify | For high-value account recovery. | + |
| Selfie + ID liveness check | Defers; expensive without scale. | ++ |
| Identity dispute (impersonation flag) | Founder-mediated. | + |

## Skill and onboarding

| Feature | Notes | Status |
|---|---|---|
| 15-min AI-graded skill assessment | Category-specific. Sets initial skill component. | S |
| Portfolio upload (file + link + image) | Supabase Storage with signed URLs. | S |
| Coursera / NPTEL / GitHub badge import | Pulls verified credentials. | + |
| Skill auto-tagging from portfolio text | LLM extracts skills from uploaded samples. | + |
| Mock-brief warm-up | Pre-listing exercise so first proposal is not the first try. | + |

## Profiles

| Feature | Notes | Status |
|---|---|---|
| Public student profile | `/freelancer/[username]`. | S |
| Trust tier badge | Bronze to Platinum, visible everywhere. | S |
| Verified college badge | College name + KYC marker. | S |
| AI-reviewed jobs counter | "Last 12 jobs AI-reviewed, 11 PASS." | + |
| Custom domain on profile (`username.stuviora.com`) | SEO boost for students. | ++ |

## Jobs

| Feature | Notes | Status |
|---|---|---|
| Job post (title, brief, skills, budget, deadline) | Full form on `/client/post-job`. | S |
| Featured listings | Rs.499 / Rs.999 boost; engine done, payment P9. | S |
| Draft + reuse job posts | Save and clone. | + |
| Brief AI rewrite | LLM tightens a vague brief. | + |
| Job templates by category | Pre-filled forms for common needs. | + |
| Bulk-hire (5+ students per project) | Anti-pattern at v1 scale. | ++ |

## Matching and discovery

| Feature | Notes | Status |
|---|---|---|
| Smart matching engine | skill 0.45 + budget 0.25 + trust 0.20 + availability 0.10. | S |
| Top 20 fan-out per posted job | With 3-emails/student/day cap. | S |
| Matches feed on student dashboard | "Matched for you" with score breakdown. | S |
| Suggested talent on client proposals page | Top non-proposers. | S |
| Meilisearch full-text discovery | Students + jobs + skill synonyms. | S |
| Saved-search alerts | Email or push when a new match crosses a threshold. | + |
| Intelligent task routing (best fit, not easiest) | Master plan §10. | + |

## AI quality gate (the moat)

| Feature | Notes | Status |
|---|---|---|
| Async file extraction (PDF / DOCX / image / code / ZIP) | Inngest worker. | S |
| Claude-via-OpenRouter scoring with structured JSON | 4-component score + 0 to 100. | S |
| Pass threshold 70 | Below 70 = FAIL with specific fixes. | S |
| Realtime push to student | `order:${id}` channel. | S |
| Max 3 revisions, then admin queue | Protects students from infinite loop. | S |
| Originality and AI-content detection | Embedded in the gate prompt. | S |
| Multi-modal Vision review for visual briefs | Adds visual alignment scoring. | + |
| Per-category sub-prompts | Code review, copy review, design critique. | + |
| Score calibration dashboard | Founder-only, watch verdict drift. | + |

## AI-as-coach (master plan §10 approved list)

| Feature | Notes | Status |
|---|---|---|
| AI proposal writer | One-click pitch draft; student edits. | S |
| Pricing engine + chip | Per-category floors + tier multiplier. | S |
| Smart starting templates | Pre-built structures by category. | + |
| One-click delivery polish | Grammar + format + image-optim on the student's own output. | + |
| Structured feedback prompts | Clients leave actionable, structured reviews. | + |
| Dynamic pricing + negotiation assist | Suggested negotiation replies; student edits and sends. | + |
| Portfolio auto-generator | Completed order to draft case study; student edits before publish. | S |
| Client-comms assist (suggested replies) | Never auto-sends. | + |
| Gamified progress | Tier streaks, earnings milestones; tied to Bronze to Platinum. | + |
| AI project decomposition | Breaks big jobs into sub-tasks; raises GMV per order. | + |
| AI generating near-complete deliverables | Collapses the moat. | R |
| "Passive income via deployed AI agents" | Commodity AI markup; fraud risk. | R |

## Orders and payments

| Feature | Notes | Status |
|---|---|---|
| Razorpay Route order + 85/15 atomic split | Linked accounts. | S |
| HMAC-verified webhooks + idempotency | `webhook_events` dedupe. | S |
| 72-hour auto-release | Cron `escrowAutoRelease`. | S |
| Dispute hold on commission | Held until resolution. | S |
| Refund flow | Full and partial. | S |
| Order timeline | Visible to both sides. | S |
| Multi-milestone orders | Pay per milestone. | + |
| Recurring orders (retainers) | Subscription-style. | ++ |
| Team / group projects | Multi-member split via Route. | + |

## Wallet and earnings

| Feature | Notes | Status |
|---|---|---|
| Wallet (available, pending, lifetime) | Reads commission_event rows. | S |
| UPI + bank withdrawals | Razorpay payouts. | S |
| Transaction history | Filterable, exportable to CSV. | S |
| Withdrawal scheduling (auto-payout above threshold) | Reduces manual taps. | + |

## Trust and tier

| Feature | Notes | Status |
|---|---|---|
| Trust score 0 to 100 with 4-component breakdown | The /student/trust surface. | S |
| Tier gating on budget ceilings | Bronze to Platinum. | S |
| Trust history with reasons | Why the score moved, every time. | S |
| Tier upgrade ceremony | Push notification + payout pill + share-to-Twitter button. | + |
| Verified-skill premium tier | Paid extra verification. | ++ |

## Reviews

| Feature | Notes | Status |
|---|---|---|
| Mandatory 1 to 5 star rating per completed order | With comment. | S |
| Bidirectional reviews (student rates client) | Affects client reliability. | + |
| Review prompts (LLM-suggested structure for clients) | Actionable, not vibes. | + |
| Disputed reviews escalation | Founder-mediated. | + |

## Disputes

| Feature | Notes | Status |
|---|---|---|
| Full state machine (open to resolved) | With 48-hour stage windows. | S |
| Evidence upload by both sides | Files via Storage. | S |
| Admin queue with escalation flag | Most-overdue first. | S |
| Founder mediation tools | Resolve with reason, audit log. | S |
| In-app dispute appeal | Second-look process. | + |

## Tax and compliance

| Feature | Notes | Status |
|---|---|---|
| GST 18% on commission | Auto-applied. | S |
| TDS 5% Sec 194H once over Rs.30k FY | Withheld with PAN on file. | S |
| Form 16A download | Annual. | S |
| GSTIN client invoice | Per completed order. | S |
| Encrypted PAN / Aadhaar / phone | Supabase Vault. | S |
| Download my data + delete my account | DPDP-compliant. | S |
| Cookie consent banner + log | DPDP. | S |
| Quarterly tax summary PDF | Founder cost; student convenience. | + |

## Messaging

| Feature | Notes | Status |
|---|---|---|
| Realtime threads per order | Supabase Realtime. | S |
| Contact-gating until `active` | Disintermediation defence. | S |
| File attachments | Storage with signed URLs. | + |
| Voice notes | + |
| Video calls in messages | ++ |

## Notifications

| Feature | Notes | Status |
|---|---|---|
| Preference toggles + persistence | Settings page. | S |
| Match digest with 3/day cap | `notification_log` enforcement. | S |
| Order update emails | Hire, submit, AI verdict, approve, dispute. | S |
| Weekly earnings digest (Mon 9am IST) | Skips when nothing to report. | S |
| Push notifications (web + Expo mobile) | M7.3. | + |
| WhatsApp notifications via Gupshup | Indian-market natural. | ++ |

## University B2B

| Feature | Notes | Status |
|---|---|---|
| Cohort dashboard for placement cells | `/admin/university` and partner login. | S |
| HMAC-signed REST API | Students activated, GMV monthly. | S |
| Webhooks for milestones | `student.completed_first_job`, `student.tier_upgraded`. | S |
| Partner API key issuing + revocation | Founder admin page. | S |
| Co-branded student stories | Editorial + LinkedIn-ready. | + |
| Custom college landing page (`stuviora.com/[college]`) | + |
| Skill-gap report (LLM-summarised) | Quarterly per partner. | ++ |

## Monetization

| Feature | Notes | Status |
|---|---|---|
| Featured-listing checkout | Razorpay one-shot payment. | S |
| Client subscription tiers (Free / Growth / Scale) | Razorpay Subscriptions. | + |
| Verified-skill premium | Paid additional verification. | ++ |
| Team / group projects with multi-way split | Engine done, P9. | + |
| Premium support (priority dispute queue) | Bundled with Scale tier. | + |

## Mobile

| Feature | Notes | Status |
|---|---|---|
| Responsive web (360, 768, 1280, 1536) | Single Next.js codebase. | S |
| Native Expo iOS app | Read-mostly v1: auth, dashboard, matches, orders, messages. | + |
| Native Expo Android app | Same scope. | + |
| Push notifications via Expo Push | Once mobile lands. | + |
| Camera-based portfolio upload | Mobile-first natural. | ++ |

## Admin and ops

| Feature | Notes | Status |
|---|---|---|
| Live GMV + revenue + escrow dashboard | `/admin/dashboard`. | S |
| Dispute queue with escalation | `/admin/disputes`. | S |
| User management with suspend / reactivate | `/admin/users`. | S |
| Immutable audit trail | `admin_actions` table. | S |
| Ops page with real-time queue depth + p95 metrics | Sentry + Inngest backed. | + |
| Bulk admin actions via CSV | Once volume justifies it. | ++ |

## Anti-features (rejected by construction)

We refuse to build these even if they would grow GMV:

- **AI doing the work the client paid for.** Collapses the trust moat.
- **Race-to-the-bottom pricing.** Pricing engine has category floors;
  we will not let students undercut below them.
- **Anonymous proposals.** Accountability is part of trust.
- **Off-platform contact before order is `active`.** Disintermediation
  destroys commission and removes platform protection.
- **Generic "match any worker to any task" feed.** Cold-start anti-pattern.
- **Crypto payouts.** Adds regulatory burden, removes UPI simplicity.
- **Auto-bidding bots.** Pollutes the proposal feed.

## Decision log

When a feature moves up or gets cut, log the date + the reason here.

| Date | Feature | Decision | Reason |
|---|---|---|---|
| 2026-06-06 | Native mobile | Promoted from v2 to v1 (M7.3) | User explicit decision in plan-mode session. |
| 2026-06-06 | OpenRouter via Claude Sonnet 4.5 | Adopted for all LLM calls | User-provided integration; replaces direct Anthropic SDK. |
| 2026-06-06 | Video calls in messages | Deferred to v1.2 | Not load-bearing for the core loop. |
| 2026-06-07 | Matches pagination (audit #41) | Shipped | Engine + queries now return `{ matches, total }`; pagination primitive added. |
| 2026-06-07 | Orders default sort by deadline (audit #46) | Shipped | Active list sorts ascending so most-urgent surfaces first. |
| 2026-06-07 | Quarterly tax summary + CSV export (audit #50) | Shipped | `fiscalQuarter` + `summariseByQuarter` added to tax engine; `/api/student/tax/export` returns text/csv. |
| 2026-06-07 | GSTIN field on settings (audit #51) | Shipped | Validates 15-character format; persisted on student or client profile. |
| 2026-06-07 | Payouts page with UPI + bank capture (audit #53) | Shipped | New `/student/payouts`; format-validates UPI, IFSC, account number. |
| 2026-06-07 | Mobile bottom nav (audit #57) | Shipped | Five-slot `<MobileNav>` with centre primary CTA; portal shell hides legacy scroller when present. |

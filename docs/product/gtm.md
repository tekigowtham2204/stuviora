# 07 Go-to-market

> How the first 1,000 completed paid orders happen. Founder-led, dense,
> not viral. Once the loop is hot, we layer on growth loops. Until then
> we cheat with hand-onboarding.

## The trap to avoid

Two-sided marketplaces die in the cold-start. The trap is to spend
ad money on awareness on both sides simultaneously. We do not.

We solve supply first (students are easier), concentrate demand into a
beachhead, and use the first 10 hand-onboarded clients to write the
case studies that pull in the next 100.

## The beachhead

**Phase 1 (months 1 to 2): 5 colleges, 2 cities.**

Pick:

1. **IIT Bombay (CS / mech, Mumbai)** — proves the high-skill thesis.
2. **NID Ahmedabad (design)** — proves the design thesis and gives
   Instagram-ready visual content.
3. **Lady Shri Ram (humanities, Delhi)** — proves the verbal-skill
   thesis.
4. **Christ University (business / commerce, Bengaluru)** — proves the
   research / dashboard thesis.
5. **Symbiosis Pune (BBA / marketing)** — proves the social-media
   marketing thesis.

Why these five: each represents one of the master plan's six service
categories at a campus with strong placement-cell relationships and a
student culture that already monetises skill.

**Phase 2 (months 3 to 6): expand to 15 colleges, 4 cities.** Replicate
the playbook only after Phase 1's first 10 paid orders complete.

## Demand-side: founder-led first 10 clients

The first 10 clients come from the founder's network. Not Instagram.
Not LinkedIn. Direct WhatsApp + intro emails.

The pitch script:

> "Hey, I am building Stuviora, a marketplace for verified college
> students with an AI that reviews every delivery before it reaches
> you. I have 3 students on the bench (Aarav for code, Diya for
> copy, Kabir for design). Got anything I can land in the next two
> weeks for under Rs.10,000? First job is money-back guaranteed."

This is hand-onboarding. The founder is in every WhatsApp thread,
running the brief, brokering the proposal, watching the AI gate. After
10 jobs the playbook is documented and the next 100 do not need the
founder.

## Supply-side: campus ambassadors

One ambassador per beachhead college. Selection criteria:

- Already monetising a skill on campus (writes for the magazine, runs
  a Telegram tutoring channel, does a friend's freelance dev work).
- 5K+ Instagram followers OR 200+ WhatsApp contacts in the college
  cohort.
- Verified by founder reference, not a form.

Compensation:

- Rs.500 per verified student onboarded who completes the skill
  assessment.
- Rs.2,000 per student who completes their first paid order.
- Rs.10,000 monthly retainer for the top ambassador in each city.

Tools they get:

- Stuviora ambassador kit: signup links with `?ref=ambassador_id`,
  a slide deck for placement cells, two pre-written WhatsApp messages,
  three Instagram story templates.
- A dashboard at `/ambassador/dashboard` (built post-launch, paper-
  tracked at first).
- Direct line to the founder.

## Growth loops (post-first-10)

These are the engines we turn on after the manual loop proves the
unit works. Master plan §6.3.

### Loop 1: Content (Instagram-led, student-native)

Cadence:

- **Mon**: hot-take static (comment bait). "₹500 Fiverr blog vs ₹4,000
  Stuviora blog. Same brief. Different outcome."
- **Wed**: carousel tip (save bait). "How to price your first design
  job: a category-by-category cheat sheet."
- **Fri**: money-win reel (share bait). "₹4,250 credited to UPI"
  Razorpay payout reel, with student permission.

Voice rule (non-negotiable per master plan §6.3):

> Post like a broke 21-year-old who figured out a hack, never like
> a startup.

The Razorpay payout reels are the hero format. Each completed order is
an opportunity for a story; the student opts in at signup.

### Loop 2: Earnings-proof

Every payout is shareable. The weekly earnings digest doubles as
content. Students who see weekly progress churn 40% less; we ship the
digest from day one for the retention compounding, even before the
volume justifies it editorially.

### Loop 3: Portfolio

Every completed order auto-generates a case study (master plan §10).
Student edits and publishes to their `/freelancer/[username]` profile.
Public profile pages are SEO-indexed. Free top-of-funnel: "best
freelancers Mumbai for SaaS copy" Google searches lead to Stuviora
profile pages.

### Loop 4: Campus ambassador referral

Ambassadors share `?ref=` links in college WhatsApp groups. Each
verified onboarding is a tracked event. Two-layer attribution: 30 days
to first job credits the ambassador.

### Loop 5: Trust-badge social

"Verified Freelancer" / tier badges are status symbols students display
on LinkedIn, Twitter, Instagram bios. Tier upgrades trigger a "share
to Twitter" prompt (master plan §10).

## University B2B

Sales motion runs in parallel from month 3 onwards once the first 10
campus clients are happy. The pitch:

> "Your 4,500 students earned Rs.X this semester via Stuviora. Here is
> the dashboard, the cohort REST API for your LMS, and the
> co-brandable success stories for your brochure. No engineering hours
> required from your side."

The first three university contracts are free in exchange for
co-brandable case studies and a quote from the placement cell head.
From the fourth onward we charge Rs.50,000 to Rs.2L/year depending on
cohort size.

## Channel mix, first 6 months

| Channel | Effort allocation | Why |
|---|---|---|
| Founder WhatsApp + email outreach | 30% | First 10 clients. Highest conversion. |
| Campus ambassadors | 25% | Supply density at zero marginal CAC. |
| Instagram content loop | 20% | Earnings-proof reels compound. |
| Founder LinkedIn + Twitter | 10% | B2B credibility, fundraising signal. |
| University B2B direct sales | 10% | Long-cycle, but unlocks supply. |
| Paid (Meta + Google) | 5% | Reserved for retargeting; never blanket awareness. |

We do not buy keyword ads against "freelancer India" until month 6.
That market is a race-to-the-bottom; we lose at the cost-per-click
level until we have proof to convert with.

## Launch-day goals

Per master plan §6.2:

- 100 student signups from 5+ colleges.
- 5 live client jobs posted.
- First completed paid job within 7 days.
- 1 college placement cell sharing internally.

If any of these slips by more than 50%, we pause feature work and
focus on whichever side is starving until it is unblocked.

## Risks specific to GTM

See [risks.md](./risks.md) for the full list. The GTM-specific ones:

- **Ambassador fraud (fake onboardings to claim bounty).** Verify with
  college-email OTP and a completed skill assessment before any
  bounty pays.
- **Founder-load.** First 10 clients are founder-heavy. Document the
  playbook from day one so the 11th onward does not also need the
  founder.
- **Beachhead leakage.** If we let students from non-beachhead colleges
  sign up, supply density at our flagship campuses dilutes. Hard-block
  signups from outside the allowlist for the first 60 days.

## What we do NOT do at launch

- No paid Meta or Google awareness campaigns.
- No PR push (we have nothing to brag about until CPO/w > 50).
- No expansion outside India.
- No tier-2 cities until tier-1 beachheads are saturated.
- No second category sponsorship deal (Razorpay, Notion, Figma) until
  the data shows it would matter.

## Measuring GTM

GTM success rolls up into [metrics.md](./metrics.md):

- Activation rate: % of signups who complete a first paid order within
  30 days. Target 12% by month 3.
- Ambassador NPS: ask quarterly, target 50+.
- Repeat client rate: target 35%+ by month 3.
- CAC paid by channel: target sub Rs.500 blended across loops.
- Time-to-first-paid-order for new students: target 7 days median.

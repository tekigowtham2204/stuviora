# 05 Competitive analysis

> The landscape of platforms a Stuviora student or Stuviora client
> considers before signing up. Read this before naming a competitor in
> a pitch, or before borrowing a feature from one of them.

## How to read this

Each competitor is scored against the three things that matter to our
buyer:

1. **Quality guarantee** — does the platform stand behind the
   deliverable, or is the buyer on their own?
2. **Payment safety** — does money flow safely both ways?
3. **India-native fit** — UPI, INR, GST/TDS, college emails, IST.

A "✓" means the platform meaningfully solves that dimension. A "○"
means partial. A "✗" means it does not.

## Global generalist freelancing

### Upwork

| | |
|---|---|
| Founded | 2003 (as Elance), merged 2013 |
| GMV | USD 4.1B 2024 (global) |
| Take rate | 10% client + 10% freelancer (effective ~20%) |
| Quality guarantee | ✗ Catalog of freelancers; no platform-side review |
| Payment safety | ✓ Hourly tracker + milestone escrow |
| India-native fit | ✗ USD-denominated, Stripe rails, no GST/TDS automation |

**Why students fail there**: <3% of Indian signups complete a first
job. Bid wars against established overseas competitors. Stripe takes
multiple days to land in INR. No skill assessment for new accounts.
The "rising talent" badge requires hours of work before the first
proposal is taken seriously.

**Why we beat Upwork**: we lead with a platform-issued quality
guarantee instead of a freelancer-issued portfolio claim. We are INR
native end to end. We rank proposals by AI fit, not bid count.

### Fiverr

| | |
|---|---|
| Founded | 2010 |
| GMV | USD 1.5B 2024 |
| Take rate | 20% from freelancer + 5.5% client fee |
| Quality guarantee | ✗ Star ratings only, after the fact |
| Payment safety | ○ Holds 14 days post-delivery |
| India-native fit | ✗ Same problems as Upwork; USD payouts; no Indian compliance |

**Why students fail there**: hostile to new sellers (algorithm buries
new gigs). $5 floor sets a permanent price ceiling on Indian students.
Disputes go to a North America-shift support team.

**Why we beat Fiverr**: we onboard a student into proposals + bids
where their skill profile matters more than their gig count. The AI
gate is a structural guarantee that no Fiverr seller can offer.

### Toptal

| | |
|---|---|
| Founded | 2010 |
| Target | Top 3% of senior freelancers |
| Take rate | Hidden; clients pay USD 60 to USD 200+/hr |
| Quality guarantee | ✓ Curated bench |
| Payment safety | ✓ Net-30 for clients, milestones for freelancers |
| India-native fit | ✗ Senior + global |

**Not a competitor.** Toptal serves the opposite of our user. Mentioned
because investors sometimes confuse the categories.

### Freelancer.com

| | |
|---|---|
| Founded | 2009 |
| Take rate | 10% + project fees + listing fees |
| Quality guarantee | ✗ |
| Payment safety | ○ Milestones, but heavy dispute friction |
| India-native fit | ✗ |

**Why we beat them**: an Indian student opening Freelancer.com today is
bidding against the same talent pool as Upwork, with even worse signal
to noise.

## India-incumbent platforms

### Internshala

| | |
|---|---|
| Founded | 2010 |
| Reach | 70K+ companies, ~22M registered students |
| Model | Internships + part-time + online trainings |
| Quality guarantee | ✗ |
| Payment safety | ✗ Stipend goes from company directly to student, no escrow |
| India-native fit | ✓ College-native; INR; UPI |

**Where Internshala wins**: it owns the student-internship search. If
the student wants an internship that pays a stipend over 6 months,
Internshala is the answer.

**Where it loses to us**: it does not solve project-by-project income.
Stipends are unreliable; many internships are unpaid; lockin to one
company; no portfolio compounding; no payment recourse if the company
ghosts.

**Why we beat Internshala**: project-based, real money on day one, AI
gate as the trust layer.

### Apna

| | |
|---|---|
| Founded | 2019 |
| GMV / users | 50M+ users, Unicorn 2022 |
| Model | Job matching, blue-collar and entry white-collar |
| Quality guarantee | ✗ |
| India-native fit | ✓ Hindi UI, India-only |

**Not a direct competitor.** Apna is job-board, not project-based.
Worth borrowing from: vernacular onboarding patterns, WhatsApp-shaped
flows.

### Unstop (Dare2Compete)

| | |
|---|---|
| Founded | 2017 |
| Reach | 7M+ student users, 12K+ colleges |
| Model | Competitions + hackathons + campus placement events |
| Quality guarantee | ○ Competition winners are externally judged |
| Payment safety | ✗ |
| India-native fit | ✓ College-native |

**Where Unstop wins**: peak engagement is during fests and
competitions. They own the funnel for "student wants to demonstrate
skill for resume points."

**Where it loses to us**: not transactional. Students do not earn on
Unstop in any predictable way.

**Distribution opportunity**: cross-promotion. Stuviora student-of-
the-month featured in Unstop content; Unstop competition winners
auto-tier-up on Stuviora.

### Topmate

| | |
|---|---|
| Founded | 2022 |
| Model | 1:1 expert sessions (mostly senior professionals) |
| Quality guarantee | ✗ |
| Payment safety | ✓ Razorpay |
| India-native fit | ✓ INR, UPI, GST automated |

**Where Topmate wins**: monetising knowledge as 1:1 calls. Excellent
for product managers, designers, senior engineers. Brand voice is
warm and India-native.

**Where it loses to us**: Topmate is calls, not deliverables. The
service unit is incompatible with a freelancing marketplace. Topmate
also does not serve undergrads.

**Closest brand sibling.** We borrow their tone of voice (warm,
considered, India-rooted, no SaaS hype) and their payments rails (the
same Razorpay account-linked split model).

### Behance, Dribbble

Design-only portfolios. Not transactional, not escrowed. Useful as a
top-of-funnel for design students; we link to their Behance from the
profile page if they choose.

### Frapper, HelloIntern, Internship.com

Smaller internship-aggregator sites. Same shape problems as Internshala.

## Adjacent (not direct, but borrowed from)

### Razorpay itself

Not a competitor, our rail. Worth noting: Razorpay's documentation
voice, their dashboard density, and their reliability shaped our
expectations of what an Indian fintech-grade product should feel like.

### LinkedIn Service Marketplace

A dormant feature in India. Almost no buyer-side traffic. If LinkedIn
ever turns it on aggressively in India, the trust layer is our defence:
LinkedIn cannot review every deliverable.

### Naukri Gigs (NaukriGigs.com)

Naukri's freelance experiment. Low buyer-side traffic. India-native
payments rails but no quality layer.

## Positioning grid

If we plot competitors on two axes (`platform-issued quality guarantee`
vs `India-native end-to-end`), the upper-right is empty. That is where
Stuviora sits.

```
                  India-native end-to-end
                          (high)
                            |
                            |   Stuviora *
                            |
                            | Topmate
            (low)           |          (high)  Platform-issued
            -------------------+---------------> quality guarantee
   Upwork                   |
   Fiverr                   | Internshala
   Freelancer               |
                            |
                          (low)
```

## Our positioning, in three lines

> Upwork without the bid wars. Internshala for projects, not stipends.
> Toptal for college students. **We are the only platform that reviews
> the work before the client sees it.**

## Where each competitor will copy us

The AI quality gate is copyable in 3 to 6 months once frontier models
become cheap enough. Our defensibility is the dataset of
`brief + delivery + score + outcome` triples that we accumulate by
being first. By the time Upwork or Fiverr considers shipping a gate,
we will have hundreds of thousands of labeled triples for India-shaped
work, and they will have to cold-start with no Indian labels.

Mitigation if a major competitor announces a gate:

1. Ship the **Stuviora Originality Score** as the headline metric. We
   have months of labelled originality data on Indian student work;
   nobody else does.
2. Lean into the **first-job money-back guarantee**: structural, not a
   feature copy.
3. Double down on the **university B2B layer**. Partners give us
   distribution and locked supply; no global incumbent has the patience
   for India placement-cell sales.

## Quick reference grid

| Platform | Quality guarantee | Payment safety | India-native | Project work | Builds portfolio |
|---|---|---|---|---|---|
| Stuviora | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upwork | ✗ | ✓ | ✗ | ✓ | ○ |
| Fiverr | ✗ | ○ | ✗ | ✓ | ○ |
| Freelancer | ✗ | ○ | ✗ | ✓ | ○ |
| Toptal | ✓ | ✓ | ✗ | ✓ | ✓ |
| Internshala | ✗ | ✗ | ✓ | ✗ | ○ |
| Apna | ✗ | ✗ | ✓ | ✗ | ✗ |
| Unstop | ○ | ✗ | ✓ | ✗ | ○ |
| Topmate | ✗ | ✓ | ✓ | ✗ | ✗ |

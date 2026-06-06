# 01 Why Stuviora

> The market thesis. Why this product, in this country, at this moment,
> with this team. Read this when you need to remember what we believe
> and what we are betting against.

## 1. The student-income problem is unsolved in India

India has 250M+ college students and 1.6M+ schools. The single largest
question every undergrad answers in their second year is "how do I make
my own money?" The answers available today are bad:

- **Part-time gigs (Swiggy, Zomato, Urban Company)**: monetize time, not
  skill. Pays Rs.150 to Rs.250 per hour. No portfolio. No leverage.
- **Tuition / coaching**: the default. Pays Rs.300 to Rs.600 per hour,
  caps at ~10 hours/week, builds no transferable record.
- **Internships (Internshala, LinkedIn)**: stipend is Rs.5,000 to
  Rs.15,000/month, often unpaid. Lock-in to a single company. Most
  internships are not skill-aligned.
- **Global freelance (Upwork, Fiverr)**: the platform a college student
  is told to use. In practice: brutal race to the bottom, $5/hr
  benchmarks set by Filipino and Pakistani competition, no Indian
  payments rails, no first-job protection. **Less than 3% of Indian
  Upwork signups complete a first job.** Most quit in a week.

A 20-year-old with real skills (writing, design, code, research,
social) has no honest path to Rs.20,000+/month of project income that
builds a portfolio. That is the gap.

## 2. The other side has a matching gap

Indian SMBs and solo founders need exactly this work: blog posts,
landing pages, decks, social kits, light dev, research, dashboards.
They cannot afford an agency. They will not hire an unknown student.

Their fallback options:

- **Agencies**: Rs.30,000+ minimum. Slow. Overscoped.
- **Senior freelancers**: Rs.1,500 to Rs.3,000/hr. Out of budget.
- **Fiverr global**: untrustworthy quality, GST headaches, payments
  friction.
- **"Find me a CS student" via WhatsApp**: works once, never repeatable,
  no recourse if it goes wrong.

Both sides want the trade. The reason it does not happen at scale: the
client does not trust the student, and there is no platform that
guarantees the work before it lands.

## 3. The AI quality gate is the unlock

For the first time in marketplace history, the platform can stand in
the middle and guarantee the deliverable.

A frontier-quality LLM (Claude Sonnet 4.5 via OpenRouter, ~Rs.4 per
review at our prompt size) can read a brief, read a submission, score
it 0 to 100 for completeness + brief alignment + originality + polish,
and explain its reasoning. We pass that score back to the student
**before the client sees the work**. Submissions below 70 bounce with
specific fixes; only passing work is delivered, stamped "AI-reviewed."

Three things follow:

1. **The pitch flips.** Clients no longer hire a person they do not
   know. They hire a platform that has already verified the work.
2. **Quality compounds.** Every submission grows the dataset of
   "brief + delivery + score." The gate gets calibrated and the platform
   reputation gets stronger with every order.
3. **Disintermediation drops.** A client who tries to take a student
   off-platform loses the gate, the escrow, and the guarantee. The
   off-platform path is genuinely worse.

No incumbent runs an inline quality gate. Upwork ran an opt-in skill
test that was easy to cheat. Fiverr ranks by stars after the fact.
Internshala does not do project work. The gate is the wedge.

## 4. Why India, why now

**Distribution is finally addressable.**

- **UPI** has 400M+ active users. A college student receiving Rs.4,000
  to UPI is normal.
- **Razorpay Route** lets a marketplace split a single payment 85/15
  atomically. No competitor in the world has rails this clean for
  marketplace settlement in INR.
- **College emails** (`.ac.in` / `.edu.in`) are universal among students
  and easy to verify against a domain registry. India's college email
  coverage is among the highest globally.
- **DPDP (2026)** raised the PII bar. Platforms have to do this
  properly now; we design for that from day one (Supabase Vault for
  PAN, encrypted at rest).
- **GST + TDS rails (Section 194H, 5%)** are well-understood. We
  automate them so students never have to think about it.

**Demand is finally aware.**

- Post-COVID, Indian SMBs are comfortable hiring remote talent. The
  "where do I find someone for one blog post" search query is bigger
  than the "where do I hire a freelancer" query.
- The Indian startup ecosystem (700K+ DPIIT-registered startups) has
  trained a generation of buyers on the workflow of project-based work.

**Supply is finally restless.**

- Inflation has pushed average campus monthly allowance below where it
  feels enough. Students search for income earlier than they used to.
- "Money-with-skill" content (Instagram, YouTube Shorts) has made the
  premise of student freelancing socially aspirational, not
  embarrassing.

## 5. Why we will win

- **Speed to live core loop.** End to end is already built in
  DEMO_MODE; production rollout is sequencing, not invention.
- **A real moat (the gate), not a feature.** Adding an AI gate later is
  hard because you have to retrain on labelled data; we get that data
  by being the first to gate.
- **Indian-rooted brand.** Warm-earth palette, college email native,
  UPI native, GST native, dispute resolution in IST timezones. Every
  inch of the product is built for the local market.
- **Founder edge.** Live in the campus problem; can recruit ambassadors
  in two weeks; can hand-onboard the first 10 clients.

## 6. What we are betting against

If any of these turn out true, the thesis weakens:

- **Claude (or peers) get cheap enough that the AI gate becomes
  table stakes for incumbents.** Mitigation: own the verified-student
  + portfolio dataset that compounds; that is what the moat actually
  becomes long-term.
- **Razorpay Route launches a competing marketplace.** Possible but
  unlikely; Razorpay is a rails business, not a brand-side play.
- **A global player (Toptal, Upwork) builds a student vertical and
  localises payments.** They have not for 15 years; the unit economics
  of student-tier transactions do not work without an inline gate.
- **Clients prefer agencies even at 10x the cost.** Mitigation: the
  first-job money-back guarantee lowers the perceived risk to zero.

## 7. The honest summary

> India has 250M underemployed students with real skills and 70M+
> small businesses that need their output. The only thing keeping the
> trade from happening is trust. A frontier AI model and the right
> payments rails have made the trust problem solvable for the first
> time. We are building the platform that solves it, in INR, in IST,
> for India.

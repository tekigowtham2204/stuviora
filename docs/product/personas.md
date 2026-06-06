# 02 Personas

> Four people. Each is hiring Stuviora to do a specific job. If a
> proposed feature does not move one of these jobs forward, it is not
> v1.

---

## P1. Aarav, third-year CS at IIT Bombay

**Persona type:** Skilled supply side. Our flagship student.

- Age 20. Computer Science, year 3. From Indore. Lives in hostel.
- Has shipped 4 side projects. Knows React, Python, basic ML.
- Monthly allowance Rs.8,000. Wants to clear Rs.15,000 to Rs.25,000
  more on his own, predictably, without a full-time job.
- Has tried Upwork. Lost three weeks on bids that never landed.
- Active on Twitter, GitHub, LinkedIn. Will share a payout screenshot
  if the platform looks credible.

**Job he is hiring Stuviora for:**

> "Convert my skill into reliable monthly income without becoming a
> salesperson, without lying about my experience, and without getting
> scammed."

**What success looks like for him:**

- First completed paid job within 7 days of signup.
- Rs.20,000+ per month within 3 months.
- A portfolio of 5 published case studies inside a year.
- Trust tier reaching Gold or Platinum so he can take Rs.50,000+ jobs.

**What kills the platform for him:**

- Bidding more than 8 times without a hire.
- A client ghosting after delivery.
- Payment stuck for more than 72 hours.
- The AI gate failing his work for the wrong reason without specific,
  actionable feedback.

**Where we meet him:**

- Campus ambassadors (one per beachhead college).
- "Money-win" reels from peers on Instagram.
- A friend's payout screenshot in a WhatsApp group.

---

## P2. Diya, second-year English Lit at Lady Shri Ram

**Persona type:** Verbal-skill supply side. The wide middle of the
market.

- Age 19. English Literature, year 2. Delhi.
- Writes well. Has run her college magazine.
- No Github. No portfolio site. Has never freelanced before.
- Pricing terrifies her. Pitching terrifies her.
- Has Rs.0 of project income today.

**Job she is hiring Stuviora for:**

> "Let me earn from writing without having to be a salesperson, and
> show me what to charge."

**What success looks like for her:**

- A guided first-job experience: AI proposal draft, AI pricing chip,
  category floors so she does not undercharge.
- The AI gate not as a threat but as a coach: gives her one specific
  fix per submission and she gets better, faster.
- A signed-off portfolio piece after every job, written for her by the
  case-study generator.

**What kills the platform for her:**

- An empty-state with no obvious next step.
- Having to choose her hourly rate without any guardrails.
- Bid feedback that says "rejected" with no reason.

**Where we meet her:**

- Female-focused Instagram creators.
- "Beat your tuition income" carousels.
- Campus ambassador events at non-engineering colleges.

---

## P3. Priya, founder of Brewhaus Coffee Co. (Bengaluru)

**Persona type:** SMB demand side. Repeat client.

- Age 31. Runs a specialty coffee brand. 8 retail staff, no in-house
  marketing.
- Posts on Instagram herself. Needs help with content kits, social
  design, and the occasional blog post.
- Has tried Fiverr twice. One okay job, one disaster. Switched to
  WhatsApp asks among friends.
- Comfortable spending Rs.5,000 to Rs.15,000 per project. Wants
  outcomes, not hours.

**Job she is hiring Stuviora for:**

> "Find me a competent young person, fast, who will not waste my time,
> and give me a way to push back if the work is wrong without it
> becoming a fight."

**What success looks like for her:**

- A clear list of ranked candidates within 4 hours of posting.
- An AI-reviewed delivery that lands at or above her brief on the
  first try.
- A repeat hire of the same student for the next month's kit.
- A first-job money-back guarantee that she never has to use.

**What kills the platform for her:**

- Receiving 40 cookie-cutter proposals.
- A delivery that is obviously off-brief and the platform takes no
  position.
- Razorpay payment friction at checkout.

**Where we meet her:**

- LinkedIn posts from founders she follows.
- Founder-to-founder referrals.
- Stuviora's case-study posts about other SMB clients in her city.

---

## P4. Dr. Banerjee, head of placement cell, Christ University

**Persona type:** B2B buyer. Unlocks bulk supply.

- Manages placement for 4,500 students across 14 streams.
- Tracks placement rate, average package, internship conversion.
- Already runs LinkedIn and Naukri partnerships. Suspicious of
  paid platforms.

**Job she is hiring Stuviora for:**

> "Give me a way to show my AICTE-mandated student earnings + skill
> development metrics, with a co-brandable narrative for the brochure,
> without me having to push the platform."

**What success looks like for her:**

- A dashboard with activation rate, GMV per cohort, top-earning
  students, by month and stream.
- A weekly HMAC-signed webhook of cohort milestones that feeds her
  internal LMS.
- Co-branded content rights to her top-three success stories.
- API integration that costs her zero engineering hours.

**What kills the platform for her:**

- Asking students to verify their college twice.
- A revenue share request from her budget.
- Bad press if a student misuses the platform.

**Where we meet her:**

- AICTE / NAAC conferences.
- A founder-led intro from another placement cell.
- The Stuviora university B2B landing page + REST API docs.

---

## Cross-persona jobs to be done (JTBD)

These are the abstract jobs each persona is hiring us for, mapped to
the features that fulfil them. Use this when scoping new work.

| JTBD | Persona | Stuviora feature |
|---|---|---|
| "Help me make money from my skill without becoming a salesperson." | Aarav, Diya | AI proposal writer, pricing engine, matched job feed |
| "Show me I will get paid if the client ghosts." | Aarav, Diya | Razorpay escrow, 72-hour auto-release, dispute mediation |
| "Tell me what to charge." | Diya | Pricing engine with category floors |
| "Tell me how to improve the work I just made." | Aarav, Diya | AI gate with specific fixes, max 3 revisions |
| "Make my portfolio without me having to write it." | Aarav, Diya | Case-study generator on completed orders |
| "Find me competent talent fast." | Priya | Smart matching engine, ranked proposals, suggested talent |
| "Verify the deliverable before I see it." | Priya | AI quality gate with the AI-reviewed badge |
| "Give me recourse if it goes wrong." | Priya | Dispute engine, founder-led mediation, first-job money-back |
| "Lock the money safely until approval." | Priya | Razorpay Route escrow, atomic 85/15 split |
| "Prove my college's freelancing impact." | Dr. Banerjee | University dashboard, cohort REST API, signed webhooks |

## Anti-personas (we do not serve these)

- **Senior independent consultants** charging Rs.5L+ per engagement.
  Use Toptal. We do not match brands to brands.
- **Companies trying to bulk-hire 50+ students for one task.** The trust
  story does not scale that way; use Internshala internships.
- **AI generators of finished deliverables.** They sell commodity AI
  output at a markup. We reject this category by construction; see the
  master plan §10 (Rejected list).
- **Students looking for full-time jobs.** Naukri or Apna. We do
  project work only.

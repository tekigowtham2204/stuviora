# 12 Student walkthrough audit

> Two students sit down with Stuviora today. Diya has never freelanced
> before and is nervous. Aarav has 80 Upwork jobs under his belt and
> arrives expecting tooling. Both surface different gaps. This doc
> walks both flows step by step, flags every gap with a file path, and
> prioritises fixes (**P0** launch-blocker · **P1** v1 · **P2** nice).

**Last audited:** 2026-06-06 against PR #8 (`claude/p0-p1-database-live`
at commit `2073fc8`).

**Method:** read every student-facing surface, walk it as both personas,
note the friction. Backend gaps that are invisible to the user are
out of scope here; see `docs/product/build-status-and-honest-review.md`
for those.

---

## A. Diya — first-time freelancer, 19, English Lit at LSR

She came in from a college WhatsApp group, has never freelanced
before, and is nervous about pricing and pitching. (Persona P2 in
[personas.md](./personas.md).)

### Step 0. Landing page (`app/(public)/page.tsx`)

**Works**: the warm hero + the live deal card (Kabir's SV-1042 with the
86/100 AI score and ₹5,950 payout) is exactly the visceral proof she
needs. The "₹12L+ paid · 500+ colleges · 91% AI-gate pass" strip lands
the platform's pulse.

**Gaps:**

1. **No "first job in your hour" CTA for the first-time student.**
   The two CTAs are "Earn as a student" and "Hire student talent" — generic.
   A first-timer needs "See if you qualify in 60 seconds" + a tier or
   skill checker.
   *Fix*: secondary hero CTA on landing for first-timers.
   **P1**, ~4h. File: `app/(public)/page.tsx:42-60`.

2. **No income calculator.** Diya wants to know: if she writes 4 blog
   posts/month, what does she clear? The landing claims "85% to
   student" but the math is invisible.
   *Fix*: small interactive widget below the proof strip:
   pick a category + pick hours → see expected monthly.
   **P1**, ~8h. New file `components/feature/income-calculator.tsx`.

3. **No social proof from her demographic.** All three "real wins"
   cards (Diya silver, Aarav gold, Kabir platinum) are engineering /
   design heavy. The first-time English Lit student does not see
   herself reflected.
   *Fix*: rotate the "Real wins" set by referer / cookie, or surface
   a "Pick the kind of work you do" filter chip row.
   **P1**, ~6h. File: `app/(public)/page.tsx:386-460` (RealWins).

### Step 1. Signup → student signup (`app/(auth)/auth/signup/student/page.tsx`)

**Works**: short form (name, college email, stream, password). College
email is the only ID needed.

**Gaps:**

4. **The "must be a recognised .ac.in / .edu.in domain" hint
   is buried under the input.** Diya doesn't know what counts. If her
   college uses `.edu.in` she'll second-guess.
   *Fix*: replace the hint with a typeahead from `college_domains`.
   Live: hit `findCollegeForEmail` as she types; show "verified
   college: Lady Shri Ram College" or "not on the list, ask us to
   add it" with a one-tap request form.
   **P0**, ~8h. Files: `app/(auth)/auth/signup/student/page.tsx`,
   new `app/api/college-lookup/route.ts`, hook `lib/auth/college-domains.ts:findCollegeForEmail`.

5. **No password strength meter, no "show password" toggle.** Diya
   will type one of three weak passwords and forget it within a week.
   *Fix*: zxcvbn-style meter + visibility toggle.
   **P2**, ~3h. File: same page.

6. **No "what happens after I sign up" preview.** She does not know
   the OTP is the next screen.
   *Fix*: tiny stepper row at the top of every auth surface:
   "Verify email → Build profile → First match."
   **P1**, ~2h. File: same page.

### Step 2. OTP verify (`app/(auth)/auth/verify-email/page.tsx`)

**Works**: 6-digit code input is large + readable.

**Gaps:**

7. **"Resend code" button has no rate limit or feedback.** She'll
   tap it five times in a panic.
   *Fix*: visible 30-second countdown + cool-down state. The
   client-side enforcement is enough at first.
   **P1**, ~2h. File: same page.

8. **No "open Gmail" / "open Outlook" deep-link helpers.** Mobile
   users especially benefit.
   *Fix*: client-side detect of the email host and surface the
   right link. Minor but warm.
   **P2**, ~2h.

9. **Demo mode still prints "Demo mode: enter any code (or none)
   and continue."** In live mode that copy is wrong and confusing
   for testers using the production URL with a real key.
   *Fix*: gate the demo notice on `DEMO_MODE` client-side.
   **P0**, ~1h. File: `app/(auth)/auth/verify-email/page.tsx:42-46`.

### Step 3. Student onboarding (`app/(student)/student/onboarding/page.tsx`)

**Works**: clear 4-step stepper. Skill chips look good.

**Gaps:**

10. **The 4-step header is just decoration.** All four "steps" render
    on the same page; the stepper does not advance. Diya cannot tell
    where she is.
    *Fix*: either honest multi-page form (Server Action progresses
    state in URL) or remove the stepper and call it "Your starter
    profile."
    **P0**, ~8h. File: `app/(student)/student/onboarding/page.tsx:10-37`.

11. **No skill assessment actually runs.** Step 3 has a "Start the
    test" button that is `type="button"` with no `onClick`. The pitch
    on the landing page says "AI-graded skill assessment before
    listing"; here it is unimplemented.
    *Fix*: ship a single 5-question MCQ assessment per category
    (LLM-generated) that grades on submit. Or remove the step until
    it's real. **Right now the platform LIES on the landing about
    this.**
    **P0**, ~24h. Files: `app/(student)/student/onboarding/page.tsx:88-103`,
    new `lib/skills/assessment.ts`, new `app/(student)/student/skill-test/page.tsx`.

12. **Bio textarea has no character minimum or AI assist.** First-
    timers stare at the box.
    *Fix*: "Help me write this" button that uses the LLM client to
    propose 2 sentences from the skills they picked. Student edits.
    **P1**, ~6h. File: same page.

13. **No headshot upload.** Trust-tier badge is visible but the
    profile is initials-only.
    *Fix*: optional avatar upload via `lib/storage/files.ts` portfolio
    bucket prefix.
    **P1**, ~4h. File: same page.

14. **"Finish setup" button has the same form action as "Skip rest."**
    They both submit. Confusing.
    *Fix*: rename Skip to "I'll do these later" with a clear distinct
    action; or remove the duplicate submit.
    **P0**, ~1h. File: same page.

15. **No "what counts as a portfolio sample" guidance.** Diya has no
    portfolio. The form does not even ask for one. She'll be matched
    to jobs with no proof of work.
    *Fix*: a "Add one writing sample" step BEFORE the optional
    service. Even a Google Doc link.
    **P0**, ~6h. File: same page, plus
    `app/actions/onboarding.ts`.

16. **Pricing is set in step 4 (the optional service) without any
    guidance.** Diya doesn't know if Rs.2,500 basic / Rs.6,000
    standard / Rs.12,000 premium is too low or too high for content.
    *Fix*: tie the default tier numbers to the pricing engine
    (`lib/pricing/engine.ts`), not hard-coded Rs.2,500. Show a
    per-category floor + suggested range.
    **P1**, ~6h. Files: `app/(student)/student/onboarding/page.tsx:103-127`,
    `app/(student)/student/services/new/page.tsx:55-60`.

### Step 4. Dashboard (`app/(student)/student/dashboard/page.tsx`)

**Works**: "Matched for you" surfaces fit jobs with the score chip
right away. The 4 stat cards give an at-a-glance view.

**Gaps:**

17. **Empty-state for a brand-new student is wrong.** The page assumes
    `me.trustScore = 82`, `me.jobsCompleted = 14`, etc. (demo persona).
    Diya logs in for the first time and sees the demo persona's
    stats, not her own zero.
    *Fix*: when the live session resolves to a new user, render a
    "Welcome, you're new" hero with a single CTA, plus zero stats.
    **P0**, ~6h. File: same page; depends on real session resolution.

18. **No "your next action" recommendation.** With 0 reviews + 0
    jobs, Diya needs a "do this next" panel: take the skill test;
    submit your first proposal; etc.
    *Fix*: side card "Get to your first paid job in 3 steps."
    **P0**, ~6h. File: same page.

19. **No notification of unread messages or pending offers.**
    *Fix*: top-right bell with badge. Reuse `Badge` primitive.
    **P1**, ~4h. File: `components/layout/portal-shell.tsx:120-180`.

### Step 5. Find a first job (`app/(student)/student/jobs/page.tsx`)

**Works**: jobs are ranked by AI fit; score chip explains why.

**Gaps:**

20. **Skill mismatch produces 0% score with no explanation.** Diya
    is an English Lit student looking at a Python dedupe job; the
    score chip shows 24.9 with no "why this is a poor fit" hint.
    She doesn't know to filter.
    *Fix*: when score < 40, surface "Why low: skill overlap is 0;
    try Content & copywriting."
    **P1**, ~4h. File: `app/(student)/student/jobs/page.tsx:60-95`.

21. **No saved searches.** Diya cannot save "Content writing under
    Rs.8,000, due in 5+ days."
    *Fix*: simple URL bookmarks + a "Save this filter" toggle for
    later notification (lands with P5 email).
    **P2**, ~8h.

22. **No "students bidding on this job" social signal.** Aarav-style
    students need this; Diya is intimidated by it. Either is fine if
    intentional. Today it's just missing.
    *Decision needed*: do we show "7 proposals so far"? Currently
    we do, briefly. Add "first proposal landed 14 minutes ago" for
    velocity context.
    **P2**, ~4h.

### Step 6. Job detail + bid (`app/(student)/student/jobs/[id]/page.tsx`)

**Works**: AI pricing suggestion in sage card is a clear
recommendation with reasoning. AI-drafted proposal is the killer
feature for a first-timer.

**Gaps:**

23. **AI-drafted proposal is auto-populated in the textarea without
    a "regenerate" button.** Diya does not realise she can ask for a
    new draft.
    *Fix*: small "Regenerate" button + "Three variants" affordance.
    **P1**, ~3h. File: `app/(student)/student/jobs/[id]/page.tsx:99-130`.

24. **No proposal length feedback.** A 40-word proposal feels unsafe;
    a 500-word one is wasted on a Rs.2,000 job.
    *Fix*: live word count with target ("aim for 80 to 150 words").
    **P2**, ~2h. File: same page.

25. **Bid amount field is a raw `<Input type=number>` with no
    visual feedback for under/over budget.** Diya types Rs.500 and
    the form accepts it.
    *Fix*: live colour: green inside the suggested band, amber
    near the floor, red below floor.
    **P1**, ~3h. File: same page.

26. **No "view your proposal as the client would see it" preview.**
    *Fix*: small toggle. Cheap.
    **P2**, ~3h.

27. **"How payment works" sidebar is helpful but never says "you
    cannot withdraw less than Rs.X."** Razorpay has a minimum
    withdrawal of Rs.10. We should surface this.
    *Fix*: one-line note.
    **P2**, ~1h. File: same page (right rail).

### Step 7. Got hired → order detail

**Works**: order timeline is clear; "Ready to submit?" CTA is obvious.

**Gaps:**

28. **No client-side chat link IS surfaced from the order page.** The
    "Message client" button is on the right rail card but separated
    from the timeline. Diya might not realise she can ask
    clarifying questions before delivering.
    *Fix*: chat-bubble link in the timeline next to "Active."
    **P1**, ~3h. File: `app/(student)/student/orders/[id]/page.tsx`.

29. **No "ask the client a question before starting" prompt.** Diya
    will silently misinterpret the brief.
    *Fix*: a one-time modal on first visit: "Send your first
    check-in message?"
    **P2**, ~6h.

### Step 8. Submit work (`app/(student)/student/orders/[id]/submit/page.tsx`)

**Works**: file dropzone is large + clearly explains what the AI
checks.

**Gaps:**

30. **Submit form has no client-side validation.** Diya can submit
    with zero files + zero notes; the AI gate then has nothing to
    score.
    *Fix*: require at least one of (file, notes >= 100 chars).
    **P0**, ~2h. File: same page.

31. **No "AI review is running" intermediate state.** After submit,
    Diya is dropped back to the order page; the AI review runs
    synchronously in demo (fast) and asynchronously in live (slow).
    She has no idea what's happening for the 30 seconds it takes.
    *Fix*: optimistic UI: "AI is reviewing" pill + a Realtime
    subscription on `order:${id}` channel for the verdict.
    **P0**, ~8h. Files: same page + `lib/realtime/order.ts` (new).

32. **FAIL verdict has no in-context guidance on what to do.** The
    AI gate returns specific fixes (`issues` array) but the UI
    section that shows them is on the order page, not the submit
    page. Diya may submit again without addressing the issues.
    *Fix*: redirect to `?fail=1` and show the issues at the top of
    the resubmit form, with each issue as a checkbox she ticks
    before being allowed to resubmit.
    **P1**, ~6h. Files: same page +
    `components/feature/ai-review-panel.tsx`.

33. **No revision counter visible.** "You have up to 3 revisions" is
    in copy but the current count is not surfaced.
    *Fix*: "Attempt 1 of 3" pill near the submit button.
    **P0**, ~2h. File: same page.

### Step 9. Get paid (`app/(student)/student/earnings/page.tsx`)

**Works**: clean stat cards, withdrawal sidebar, transactions list
with sage/orange tones.

**Gaps:**

34. **No "scheduled / auto-withdraw" option.** Diya does not want to
    log in to tap Withdraw every week.
    *Fix*: "Auto-withdraw when balance > Rs.X" toggle.
    **P2**, ~6h. File: same page.

35. **No first-withdrawal coach.** Diya's first ₹4,250 withdrawal is
    a milestone; today it's a generic flow.
    *Fix*: confetti + share-to-WhatsApp prefilled with screenshot
    after first successful withdrawal.
    **P1**, ~6h (the asset matters more than the code).

36. **TDS surprise**: the first withdrawal above the threshold will
    silently deduct 5%. The wallet page does not warn before tipping
    over the threshold.
    *Fix*: row in the wallet sidebar: "You are Rs.X away from the
    Rs.30,000 TDS threshold." Tied to the tax engine.
    **P0**, ~4h. Files: `app/(student)/student/earnings/page.tsx`,
    `lib/tax/engine.ts:financialYear` already supports it.

---

## B. Aarav — experienced freelancer, 21, CS at IIT Bombay

Aarav has 80 Upwork jobs done; he is here because his friend showed
him a payout reel. He expects production tools. (Persona P1 in
[personas.md](./personas.md).)

### A1. Account migration

37. **No "import my Upwork / Fiverr profile" path.** Aarav already
    has 6 case studies; he is not going to retype them.
    *Fix*: paste a public URL (Behance, Dribbble, Github, Upwork)
    and let the LLM scrape skill + project list to seed his
    portfolio. Student approves each before publish.
    **P1**, ~24h. New `lib/import/profile.ts`, new
    `app/(student)/student/import/page.tsx`.

38. **No "GitHub connect"** for tech students. Their best portfolio
    item is their pinned repo.
    *Fix*: GitHub OAuth → import 5 most-starred repos as portfolio
    items.
    **P2**, ~12h.

### A2. Browsing jobs efficiently

39. **No keyboard navigation on `/student/jobs`** or `/student/matches`.
    Aarav is used to `j/k` from Reddit / GitHub.
    *Fix*: `j` next / `k` prev / `enter` open / `b` bid. Lib already
    has `Reveal` motion; key handlers go on the page.
    **P2**, ~6h. Files: `app/(student)/student/jobs/page.tsx`,
    `app/(student)/student/matches/page.tsx`.

40. **No bulk-shortlist.** Aarav scans 20 matches and wants to flag 5
    for "come back to."
    *Fix*: heart-icon → `saved_jobs` table; shows up in the side
    rail.
    **P1**, ~10h. New migration `0006_saved_jobs.sql`, queries.

41. **Pagination missing.** When match count > 20 the page just stops.
    *Fix*: cursor-based pagination via `?after=score:job_id`.
    **P0** once volume warrants it, **P1** before that. File:
    `app/(student)/student/matches/page.tsx`.

42. **No "I am unavailable this week" mode.** Aarav goes on vacation;
    today his only option is to set `isAvailable=false` permanently.
    The matching engine then hides him entirely.
    *Fix*: "Pause new matches until [date]" toggle in settings.
    Engine reads the pause date; UI reflects "Aarav is back Friday."
    **P1**, ~6h. Files: `app/(shared)/settings/page.tsx`,
    `lib/types.ts` add `availabilityResumeAt`, queries.

### A3. Bidding at scale

43. **No proposal templates.** Aarav re-uses 3 variants ("dev sample,"
    "deck sample," "data sample"). The AI proposal writer drafts
    fresh every time, ignoring his history.
    *Fix*: "Save as template" on submit; templates list at
    `/student/proposals?templates=1`.
    **P1**, ~10h. Files: `app/(student)/student/jobs/[id]/page.tsx`,
    new `proposal_templates` table.

44. **No bulk-bid.** Aarav cannot apply to 5 similar jobs in one go.
    *Fix*: matches page has a `[ ] select` checkbox row; "Apply with
    template" multi-action.
    **P2**, ~12h.

45. **Bid cap not surfaced.** Aarav (Gold) cannot bid above Rs.50,000.
    The job detail page allows him to TYPE a Rs.60,000 bid; only
    submit fails. Wasted UX.
    *Fix*: live cap shown on the bid input + warning before submit.
    Tied to `TIER_BUDGET_CEILING` in `lib/trust/score.ts`.
    **P1**, ~3h.

### A4. Running 4 concurrent orders

46. **Orders list has no "deadline" sort.** Two orders due tomorrow
    sit in same row as one due in 6 days.
    *Fix*: default sort by deadline ascending; toggle to recent.
    **P1**, ~2h. File: `app/(student)/student/orders/page.tsx`.

47. **No Kanban-style status view.** Aarav wants Active / Submitted /
    Awaiting / Disputed in columns.
    *Fix*: tab-strip view alongside the list. Reuses status pills.
    **P2**, ~10h.

48. **No "snooze a notification" for an order.** Client keeps
    pinging about a minor revision; Aarav wants 4 hours of focus.
    *Fix*: per-order "Snooze for 4h" → suppresses email + push
    + chat notifications until the snooze ends.
    **P2**, ~8h.

49. **No time tracking.** Aarav is used to Upwork's tracker; not
    central to our model (we are fixed-fee), but a basic timer per
    order would help his own reporting.
    *Skip*: out of scope. Stuviora is project-based, not hourly. Add
    to features.md rejected list.
    **R** (rejected).

### A5. Money + tax

50. **Quarterly tax summary missing.** Aarav files his own taxes
    quarterly. Today he has Form 16A annually only; he wants per-Q
    totals + downloadable CSV.
    *Fix*: quarterly summary on `/student/tax` + CSV export.
    **P1**, ~8h. Files: `app/(student)/student/tax/page.tsx`,
    `lib/tax/engine.ts` extend.

51. **No GSTIN field.** Aarav has registered for GST. He needs to
    provide his GSTIN so platform invoices can show it.
    *Fix*: optional GSTIN field in settings; persisted on student
    profile; surfaced on each order's GST invoice.
    **P1**, ~4h. Files: settings, types, queries.

52. **No multi-currency.** Aarav also takes jobs in USD off-platform.
    Out of v1 scope but he will ask.
    *Defer to v1.1*. **P2**.

53. **No bank-account screen.** Withdraw "to bank" assumes the
    razorpay-linked-account capture step has already happened, but
    there is no UI to update it.
    *Fix*: `/student/payouts` page with bank + UPI fields.
    **P0**, ~8h. New file
    `app/(student)/student/payouts/page.tsx`, action
    `app/actions/payouts.ts`, persists to `student_wallets` table
    (already exists).

### A6. Disputes + reputation

54. **Trust score breakdown does not show "ai pass rate" trend.**
    Aarav's curve over time matters more than the snapshot.
    *Fix*: 30-day sparkline per component.
    **P2**, ~6h. File: `app/(student)/student/trust/page.tsx`.

55. **No "appeal" button on a closed dispute.** If the founder
    resolves partial against Aarav and he disagrees, he has no
    recourse.
    *Fix*: 7-day appeal window on resolved disputes; reopens with
    `admin_review_2` state.
    **P1**, ~8h. Files: `lib/disputes/engine.ts`, dispute admin
    page.

56. **No "block this client" option.** A toxic client can hire Aarav
    again next month.
    *Fix*: "Don't show me jobs from this client" — reads into the
    matching engine's filter.
    **P2**, ~6h.

### A7. Mobile parity

57. **Sidebar collapses to a hamburger but no bottom nav on mobile.**
    Aarav lives on his phone.
    *Fix*: fixed bottom nav (Home / Matches / Orders / Chat / Me)
    on widths < 768.
    **P1**, ~10h. File: `components/layout/portal-shell.tsx`.

58. **No installable PWA.** Service-worker missing.
    *Fix*: `manifest.json` + minimal SW for offline-ish read.
    **P2**, ~8h.

59. **Modals are not full-screen on mobile.** Some dialogs (when we
    add them in P7) need to be.
    *Track*. **P1** when modals land.

### A8. Integration expectations

60. **No webhook out for the student** ("ping my Notion when an
    order is approved"). Aarav has scripts.
    *Skip for v1*. Document in features.md as v2 ambition.
    **R / v2**.

---

## C. Cross-cutting gaps both notice

### Trust + safety

61. **No "report this user" flow on freelancer profile or order
    detail.** If a client sends an inappropriate message, no
    in-product escalation.
    *Fix*: "Report" overflow menu on profile + message threads.
    Routes to admin queue.
    **P0**, ~8h. New `app/actions/report.ts`, new
    `admin_reports` migration.

62. **No two-factor auth.** Razorpay payouts go to a UPI on file;
    a stolen session can change it.
    *Fix*: TOTP via Supabase Auth's built-in MFA (P2 if not
    out-of-the-box; lib code exists).
    **P1**, ~10h.

63. **Active sessions list missing.** Logging in from a friend's
    laptop and leaving it is a real risk on campus.
    *Fix*: "Active sessions" panel in settings with revoke.
    **P1**, ~8h.

### Communication

64. **Messages have no file attachments.** Both personas need this.
    *Fix*: file picker → `lib/storage/files.ts` portfolio bucket
    prefix `messages/{conv}/`.
    **P0**, ~10h. Files: `app/(shared)/messages/[id]/page.tsx`.

65. **No typing indicator, no read receipts.** Demo-mode threads
    feel like email.
    *Fix*: lands with Supabase Realtime (already imported elsewhere).
    **P1**, ~10h.

66. **No call link.** Even an external Daily.co / Jitsi link
    generator inside the thread is missing.
    *Defer to v1.1*.

### Accessibility

67. **Trust ring SVG (`student/trust/page.tsx`)** has no `aria-label`
    describing the score.
    **P0**, ~30 min. File: `app/(student)/student/trust/page.tsx:54-71`.

68. **All success-banner toasts use `?saved=1` query param**, which
    is fine for SSR but screen readers do not announce them.
    *Fix*: `role="status" aria-live="polite"` on the banner.
    **P1**, ~2h.

69. **Modal focus traps missing** (none of the form pages have a
    real modal, but featured-listing checkout will land one in P9).
    *Track*.

### Empty / error / loading states

70. **No `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx`**.
    Generic Next pages leak.
    **P0**, ~3h. New files.

71. **Per-route-group `error.tsx`** missing for `(student)`,
    `(client)`, `(admin)`.
    **P1**, ~3h.

72. **`loading.tsx` skeletons** missing on all data-heavy pages.
    `EmptyState` primitive exists but `Skeleton` is unused.
    **P1**, ~6h across pages.

### Content + tone

73. **All onboarding copy assumes the student is English-fluent.**
    Even high-fluency LSR students appreciate a friendlier voice in
    Hindi/Hinglish for the welcome moment.
    *Defer to v1.1 (multilingual).* **P2**.

74. **No FAQ surface.** First-timers want "how does the AI gate
    work" + "what if I miss a deadline" answered without writing to
    support.
    *Fix*: `/help` page (or modal sheet) with 15 questions
    sourced from the master plan.
    **P1**, ~10h. New `app/(public)/help/page.tsx`.

---

## D. Prioritised fix list

Top 20 to close, in order, by leverage.

| Rank | Item | Persona | Severity | Effort |
|---:|---|---|---|---:|
| 1 | #11 Skill assessment actually runs (or remove the claim) | Both | **P0** | 24h |
| 2 | #15 Onboarding requires one portfolio sample | Diya | **P0** | 6h |
| 3 | #17 Dashboard zero-state for new user | Diya | **P0** | 6h |
| 4 | #18 "Next action" recommender on dashboard | Diya | **P0** | 6h |
| 5 | #4 College typeahead at signup | Diya | **P0** | 8h |
| 6 | #31 AI-review-running optimistic state | Both | **P0** | 8h |
| 7 | #33 Revision counter visible on submit | Both | **P0** | 2h |
| 8 | #61 Report-this-user flow | Both | **P0** | 8h |
| 9 | #64 Message attachments | Both | **P0** | 10h |
| 10 | #53 Payouts page for bank/UPI capture | Aarav | **P0** | 8h |
| 11 | #36 TDS threshold proximity warning on wallet | Both | **P0** | 4h |
| 12 | #30 Submit form client-side validation | Diya | **P0** | 2h |
| 13 | #70 Global error/404/loading boundaries | Both | **P0** | 3h |
| 14 | #67 A11y label on trust ring SVG | Both | **P0** | 30m |
| 15 | #10 Multi-page onboarding stepper | Diya | **P0** | 8h |
| 16 | #14 Distinct Skip / Finish buttons | Diya | **P0** | 1h |
| 17 | #9 Demo-mode notice off in live | Both | **P0** | 1h |
| 18 | #41 Pagination on matches | Aarav | **P0** | 6h |
| 19 | #57 Mobile bottom nav | Aarav | **P1** | 10h |
| 20 | #43 Save proposal as template | Aarav | **P1** | 10h |

**Aggregate P0 effort to close the audit list**: ~120 hours of focused
work (~3 weeks solo, ~10 days small team). Maps onto Phase **P7
(hardening)** and a new Phase **P7.5 (UX gaps)** that should slot in
before the public launch ops in P11.

## E. What the audit does NOT find (and why that matters)

Backend gaps invisible to the user:
- Notification deliverability (email lands but spam-folder rate).
- Webhook double-credit edge cases.
- DB connection pooling under load.
- LLM cost overrun monitoring.
- Cron drift.

These are real but covered in `build-status-and-honest-review.md` and
the runbooks. The student-audit lens here is intentionally narrow.

## F. Decision log entries to mirror

Add to `docs/product/features.md` decision log:

| Date | Feature | Decision | Reason |
|---|---|---|---|
| 2026-06-06 | Skill assessment | Promoted to **P0 blocker** | Landing page promises it; today the button is dead. Ship or remove. |
| 2026-06-06 | Time-tracking | Rejected | Stuviora is project-based fixed-fee; tracker conflicts with model. |
| 2026-06-06 | Multi-currency | Deferred to v1.1 | Indian focus first. |
| 2026-06-06 | Import-from-Upwork | Promoted to v1 | Experienced freelancers will not retype 6 portfolio items. |

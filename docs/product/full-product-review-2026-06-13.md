# Full product review (CTO / senior engineer / designer)

Date: 2026-06-13. Reviewer pass across security, architecture, code
quality, product integrity, design, UX, accessibility, and SEO. Every
headline claim below was verified against the actual code (greps + reading
the files + the compiled CSS), not taken on faith. Items marked **FIXED**
were corrected in this same branch (`claude/brave-sagan-ndn9s2`); the rest
are prioritized recommendations.

## TL;DR

- **Two issues were serious enough to fix immediately and were fixed:**
  a critical auth-bypass on privileged Server Actions, and a Tailwind v4
  token bug that silently disabled ~110 color/border utilities.
- **The biggest non-code issue is product honesty:** the public site shows
  fabricated social proof (named testimonials, "500+ verified colleges",
  "12L paid") with no real users behind it. This must be addressed before
  any public launch. It is a founder/product decision, so it is flagged,
  not unilaterally rewritten.
- **The architecture is genuinely good.** The engine/queries/actions
  split, the demo/live boundary, RLS service-role isolation, webhook
  idempotency, and Zod-validated LLM I/O are all sound. The gaps are
  concrete and listed.

---

## 1. Security  (CTO / security reviewer)

### 1.1 FIXED - Critical auth bypass on privileged Server Actions
`app/actions/admin.ts` exposed `resolveDispute`, `overridePayout`, and
`toggleUserActive` with **no authentication check at all**. Any
authenticated user (student or client) could POST to these and resolve
disputes, force payouts, or ban/reactivate users. `app/actions/orders.ts`
had the same gap on `approveOrder` (which releases escrow and completes the
order), `submitWork`, `requestRevision`, and `leaveReview`, and
`app/actions/portfolio.ts` on `generateCaseStudy`.

Fix applied: `requireRole(...)` as the first line of each, plus an
ownership check (`order.studentId/clientId === session.user.id`) on the
order actions to close the IDOR. This matches the established pattern in
`app/actions/jobs.ts` (`toggleSaveJob` etc.). The demo path is unaffected
because the demo session id equals the persona id.

### 1.2 FIXED - Non-constant-time webhook signature compare
`app/api/payments/webhook/route.ts` verified the Razorpay HMAC with
`expected === signature` (timing-leaky). Replaced with a length-checked,
constant-time compare.

### 1.3 OPEN (HIGH) - University cohort queries have no live path
`getCohortForCollege` / `listConsentedRoster` in `lib/data/queries.ts` are
demo-only (no `services.supabase` branch). In live mode they return stale
demo data, and once wired must scope strictly by the partner's college or a
University A could read University B's roster. Implement the live branch
with an explicit college filter before opening any multi-college partner.

### 1.4 OPEN (MEDIUM) - File-upload validation not proven on the live path
`lib/uploads/validate.ts` has a solid ZIP-traversal guard and is unit
tested, but `submitWork` does not visibly call `validateUpload()` before a
live Storage write (the live upload is still a TODO). Wire the validator
into the live submit path when files land.

### 1.5 OPEN (MEDIUM) - LLM gate swallows errors silently
`lib/ai/quality-gate.ts` catches all `chatJson` failures and falls back to
demo with no logging, so a schema-mismatch and a network blip look
identical. Add error logging now; route to Sentry in P6.

### 1.6 OPEN (LOW) - HMAC partner API replay protection incomplete
`lib/partners/*` verifies signature + a 5-minute timestamp window (good)
but there is no nonce de-duplication store yet, so a captured request can be
replayed within the window. Add a nonce store (P9.4).

### Verified-good (no action)
Service-role isolation on audit tables (`platform_ledger`,
`commission_events`, `webhook_events`, `admin_actions`) via RLS-enabled /
no-policy is correct. Webhook idempotency via `webhook_events` is correct.
The DAL (`requireSession`/`requireRole`) cross-checks Supabase Auth in live
mode. The dev `SESSION_SECRET` fallback is dev-only by design.

---

## 2. Architecture & code quality  (senior engineer)

- **Engine/queries/actions pattern is well honored.** Pure logic stays
  I/O-free in `lib/<domain>/`; data access is centralized in
  `lib/data/queries.ts`; actions are thin and (now) authenticated.
- **Demo/live boundary is the product's best architectural decision.**
  Almost every query has both a live and a demo path. Exceptions: the
  university cohort queries (1.3) are demo-only.
- **OPEN (MEDIUM) - split-math rounding inconsistency.**
  `lib/utils.ts:computeSplit` uses `Math.round` on rupees while
  `lib/tax/engine.ts:computeOrderTax` uses `round2` (paise precision). They
  can diverge by up to a rupee on fractional amounts. Unify on paise-level
  rounding so the ledger and the displayed split always agree.
- **OPEN (MEDIUM) - tax-engine test coverage.** The 194-O TDS threshold
  crossing (`priorFyGross` around the 5L boundary) needs explicit tests:
  TDS is 0 below the threshold, applies on crossing, and is computed on the
  gross. This is the India-compliance core; pin it with tests.
- Type safety is generally strong; a couple of non-null assertions on
  derived data (`mappers.ts` initials, `dal.ts` demo persona) are
  acceptable in demo context but worth a defensive `?? "?"`.

---

## 3. Product integrity / honesty  (the "no fake information" issue)

This is the most important non-engineering finding and connects directly to
the request to remove fake data. The app is in `DEMO_MODE` (no keys), which
is fine for development - the demo seed data in `lib/demo/data.ts` is an
honest, clearly-isolated fallback. The problem is **fabricated content
hardcoded into the public marketing pages** that reads as real:

- `app/(public)/page.tsx` ProofStrip: "12L+ paid to students", "500+
  verified colleges", "91% AI-gate first-pass", "4.8 / 5 client rating" -
  hardcoded, with no real users behind any of them.
- The "Real wins. Students paid this week." section presents three named
  testimonials (Diya Sharma / LSR, Aarav Mehta / IIT Bombay, Kabir Rao /
  NID) with specific payouts and quotes, under copy that says "Real names,
  real money." These are demo personas, not customers.
- `app/(public)/trust/page.tsx` repeats "91%" and "500+ verified colleges"
  hardcoded (the GMV figure there is at least wired to demo metrics).

**Recommendation (founder decision):** before launch, either (a) remove the
stats/testimonials entirely, (b) reframe them honestly as "how it works"
illustrations clearly labeled as examples, or (c) gate them behind real
`platformMetrics` so they show only true numbers (zeros until real
traction). Option (c) is the cleanest long-term: wire the strip to live
metrics and render nothing until the numbers are real. This was left for
the founder rather than rewritten unilaterally because it is positioning,
not a bug.

---

## 4. Design system  (designer / frontend)

### 4.1 FIXED - Tailwind v4 semantic tokens were not generating utilities
The semantic tokens (`--color-foreground`, `--color-muted`,
`--color-subtle`, `--color-border`, `--color-border-strong`,
`--color-surface-muted`, etc.) were declared in `:root`, **outside the
`@theme` block**. In Tailwind v4 only `@theme` tokens generate utilities,
so `text-muted` (47 uses), `text-foreground` (18), `text-subtle` (16),
`border-border` (10), `border-border-strong` (10), `bg-surface-muted` (9)
were silently no-ops: muted text rendered at full ink strength and
`border-border` rendered as `currentColor` instead of the subtle line tone.
Fix: moved the tokens into `@theme`; verified in the compiled CSS that all
the utilities now generate. (Note: an earlier automated pass mis-reported
this as "breaks layout across the app" - it was real but cosmetic, and
`bg-surface`/`ring-brand-*` already worked because they were inside
`@theme`.)

### 4.2 OPEN (LOW) - Form-primitive duplication
`app/(student)/student/services/new/page.tsx` re-implements `Field`/`Tier`
inputs inline instead of using `components/ui/input.tsx`. Consolidate onto
the primitives so token changes propagate.

### 4.3 OPEN (LOW) - error.tsx uses hardcoded hex
Intentional and acceptable: the error boundary renders its own `<html>`
without the theme class so it stays legible if the theme fails to load. Not
changed.

### Verified-good
Warm-earth palette is consistent, `prefers-reduced-motion` is honored
(`globals.css`), dark mode flips cleanly (after the 4.1 fix and the earlier
progress-track fix), and the UI primitives are otherwise well adopted.

---

## 5. Accessibility

Quick wins (all LOW/MEDIUM, low-risk, recommended next batch):
- `components/layout/portal-shell.tsx` logout button uses `title` instead
  of `aria-label` (screen readers miss it). Add `aria-label="Log out"`.
- `components/feature/consent-banner.tsx` dialog should add
  `aria-modal="true"` and move focus on mount.
- `components/feature/orders-views.tsx` tabs should wrap the active view in
  `role="tabpanel"` for the tablist relationship.

Verified-good: semantic HTML (`main`/`nav`/`header`/`section`), no images
missing alt, focus-visible ring styles, motion preferences.

---

## 6. SEO

- Verified-good: per-page `metadata`, `sitemap.ts`, `robots` (private
  portals disallowed), semantic structure.
- OPEN (MEDIUM): no `openGraph.image` (social shares show no preview) and no
  JSON-LD structured data (`Person`/`ProfessionalService` on freelancer
  profiles, `JobPosting` on job detail). Both improve discovery/CTR.

---

## Prioritized backlog (after the two fixes already shipped)

1. **Product honesty** - decide and apply the marketing-stats/testimonials
   approach (section 3). Pre-launch blocker.
2. **University cohort live path + college scoping** (1.3) - before any
   multi-college partner.
3. **Unify split-math rounding** (section 2) and **add 194-O TDS tests** -
   data/compliance correctness.
4. **Wire `validateUpload` into the live submit path** (1.4) and **add LLM
   error logging** (1.5).
5. **A11y quick wins** (section 5) and **OG image + JSON-LD** (section 6).
6. **Phase V live verification** once keys land (see
   `docs/product/go-live-keys.md`).

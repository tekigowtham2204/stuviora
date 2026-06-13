# Go-live: provisioning the keys (founder runbook)

This is the step-by-step to take Stuviora from `DEMO_MODE` to real data.
Nothing in the codebase is faked once these land: every query in
`lib/data/queries.ts` already branches on a `services.<flag>` (see
`lib/env.ts`) and switches from the demo fallback to your live backend the
moment the matching keys exist. No code change required.

Work top to bottom. **Supabase alone** flips the app onto a real database;
the rest light up their features independently. Start the **Razorpay Route**
application first anyway, because its approval is the longest pole.

For each service: create the resource, copy the value into `.env.local`
(use `.env.example` as the template), and for production set the same vars
in your host (Vercel) instead of the repo.

---

## 0. Local setup (2 min)

```bash
cp .env.example .env.local
```

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste it into `SESSION_SECRET`. You can boot the app now in demo mode;
each section below turns one more thing real.

---

## 1. Supabase  (THE critical one: database + auth + storage)

This is what makes the data real. Free tier is enough to start.

1. Create an account at supabase.com and a new **project**. Pick the region
   closest to your users (an India / Singapore region for latency). Save the
   database password it generates.
2. Project Settings -> **API**. Copy three values into `.env.local`:
   - Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`
     **(server-only, bypasses row-level security: treat like a root password,
     never expose it to the browser or commit it.)**
3. **Apply the 12 migrations in order.** They live in
   `supabase/migrations/0001_*.sql` ... `0012_*.sql`. Two ways:
   - **SQL Editor (simplest):** open each file in order, paste into the
     Supabase SQL editor, run. Do `0001` first (schema), then the rest.
   - **Supabase CLI:** `npx supabase link --project-ref <ref>` then
     `npx supabase db push`.
4. **Verify** after applying: in the Table editor you should see the tables
   from `0001_init_schema.sql`, and under Authentication -> Policies every
   sensitive table should show RLS enabled (from `0002_rls_policies.sql`).
   Take a structural backup (the deploy runbook calls for this).
5. **Auth:** Authentication -> Providers. Enable Email. Stuviora gates
   sign-up to allow-listed college domains (`lib/auth/college-domains.ts`),
   so confirm your test address uses one of those domains or add yours.
6. **Storage:** `0005_storage_buckets.sql` creates the buckets. Confirm they
   exist under Storage.

After this, restart the app. `DEMO_MODE` is now `false` and you are reading
and writing real rows. The demo seed data is gone; you start with an empty,
honest database. Do a real sign-up to confirm the round-trip.

> The demo dataset does **not** migrate into your real DB, and it should not:
> those students/clients/orders are illustrative, not real people. Your real
> data is whatever real users create.

---

## 2. Razorpay Route  (escrow payments + the 85/15 split)  -- start early

Razorpay Route lets the platform hold funds in escrow and split payouts to
student linked accounts. It needs an **activated** account, which means
business KYC, so begin this first.

1. Sign up at razorpay.com. Complete **business KYC** (PAN, bank account,
   business proof). This is the approval that takes days, not minutes.
2. Request / enable **Razorpay Route** for the account (it is a feature you
   activate, sometimes requiring a short application describing the
   marketplace model). This is the real longest pole; the rest of payments
   is wired and waiting.
3. Settings -> **API Keys**. Generate **Test** keys first:
   - Key Id (`rzp_test_...`) -> `RAZORPAY_KEY_ID`
   - Key Secret -> `RAZORPAY_KEY_SECRET`
4. Create a **webhook**: Settings -> Webhooks -> add
   `https://<your-domain>/api/payments/webhook`, subscribe to payment +
   transfer + payout events, set a secret -> `RAZORPAY_WEBHOOK_SECRET`. The
   handler (`app/api/payments/webhook/route.ts`) verifies this signature and
   is idempotent via the `webhook_events` table.
5. Run a **Rs.100 test transaction** end to end on test keys before
   switching to Live keys. Only swap to `rzp_live_...` after that passes and
   you have engaged a CA to confirm the 194-O TDS handling.

---

## 3. OpenRouter  (the AI quality gate + proposal writer)

The wedge. Powers the inline AI review of every deliverable.

1. Sign up at openrouter.ai, add a small credit balance.
2. Create an API key -> `OPENROUTER_API_KEY`.
3. Default model is `anthropic/claude-sonnet-4.5` (override with
   `OPENROUTER_MODEL` if you want). Leave the app-name/url defaults.
4. Smoke test: trigger one deliverable review and confirm a real JSON
   verdict comes back through the Zod-validated `chatJson` path.

(Optional: set `ANTHROPIC_API_KEY` to use Anthropic directly as a fallback.)

---

## 4. Resend  (transactional + retention email)

1. Sign up at resend.com.
2. **Verify a sending domain** (add the DNS records they give you). Email
   will not send from an unverified domain.
3. Create an API key -> `RESEND_API_KEY`. Set `RESEND_FROM` to an address on
   the verified domain. Unblocks match fan-out, weekly digest, and the
   payout-settled emails (with the 3-per-day cap from `notification_log`).

---

## 5. Inngest  (background jobs, fan-out, crons)

1. Sign up at inngest.com, create an app.
2. Copy the Event Key -> `INNGEST_EVENT_KEY` and Signing Key ->
   `INNGEST_SIGNING_KEY`.
3. Point Inngest at `https://<your-domain>/api/inngest`
   (`app/api/inngest/route.ts`) so the 10 registered functions (match
   fan-out, 72h auto-release, reconciler, digest) actually fire.

---

## 6. P6 services (search, rate limit, observability)  -- optional at launch

Each is independent and the app degrades gracefully without it.

- **Upstash Redis** (rate limiting): create a Redis DB at upstash.com, copy
  the REST URL + token -> `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
  Without it, the in-memory fallback is used.
- **Meilisearch** (search): host one (Meilisearch Cloud or self-host) ->
  `MEILISEARCH_HOST`, `MEILISEARCH_KEY`. Without it, search uses the DB query
  path.
- **Sentry** (errors): create a project -> `SENTRY_DSN`.
- **PostHog** (product analytics): create a project ->
  `NEXT_PUBLIC_POSTHOG_KEY` (and `NEXT_PUBLIC_POSTHOG_HOST` if not US).

---

## Priority order, in plain terms

1. **Supabase now** -> real data, the single biggest unlock.
2. **Start Razorpay KYC + Route in parallel** -> longest approval.
3. **OpenRouter** -> the AI wedge works live.
4. **Resend + Inngest** -> retention loops and background jobs.
5. **P6 (Upstash/Meili/Sentry/PostHog)** -> hardening, can trail launch.

## After keys land: Phase V verification

Once Supabase + Razorpay (test) + OpenRouter are in, run the live
verification before trusting anything:

- A real auth round-trip (sign up, confirm session, sign out).
- One real deliverable through the AI gate (real JSON verdict).
- A Rs.100 Razorpay test transaction end to end, including the webhook
  and the on-hold transfer.
- Confirm `/admin/ops` shows each integration as Live.

Hand me the keys (or set them in the environment) and I will drive that
verification and switch the app off the demo data onto your real backend.

## Where each var is consumed

`lib/env.ts` is the single source of truth: it reads every variable above
and derives the `services.*` flags. Grep for `services.supabase`,
`services.razorpay`, `services.llm`, etc. to see exactly which code path a
key activates.

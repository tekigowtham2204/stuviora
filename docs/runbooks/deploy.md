# Runbook: Deploy and key rotation

## Deploy

1. Merge to `main` only via a green PR (CI runs tsc, lint, test, build).
2. Vercel builds `main` automatically. Preview deploys run per PR.
3. Every live feature is gated on a `services.<flag>` from `lib/env.ts`.
   A missing key keeps the demo path; it never breaks the build.
4. After deploy, smoke-check `/admin/ops` for integration health, then run
   `loadtest/k6-smoke.js` against the deployed URL.

## Environment variables (set in Vercel, never in the repo)

Grouped by the phase that needs them: Supabase (P1+), Razorpay Route
(P3+), OpenRouter (P4+), Resend (P5+), Inngest (P4+), Upstash +
Meilisearch + Sentry + PostHog (P6). See `continue-prompt.md` for the
full table.

## Key rotation

1. Generate the new key in the provider dashboard.
2. Add it to Vercel env as the active value; keep the old key valid.
3. Redeploy; confirm `/admin/ops` still shows the integration Live.
4. Revoke the old key in the provider.
5. For `RAZORPAY_WEBHOOK_SECRET`, rotate during a low-traffic window and
   confirm a test webhook verifies before revoking the old secret.

## Migrations

Apply Supabase migrations in order (`supabase/migrations/000N_*.sql`).
Verify every table and RLS policy after applying, and take a structural
backup before and after.

# Runbook: Razorpay webhook replay

Razorpay delivers webhooks at least once and retries with backoff for up
to 24 hours, then disables the endpoint. Our handler must be idempotent.

## How idempotency works

Every inbound webhook is keyed by `x-razorpay-event-id`. The handler:

1. Verifies the HMAC-SHA256 signature against `RAZORPAY_WEBHOOK_SECRET`.
2. Inserts the event id into `webhook_events` (primary key). A duplicate
   insert means we already processed it: ack 200 and stop.
3. Only then performs the side effect (credit wallet, book commission).

Respond 2xx within 5 seconds or Razorpay retries.

## Replaying a missed event

1. Find the event in the Razorpay dashboard (Webhooks > recent deliveries).
2. If it shows non-2xx on our side, it will retry automatically within
   the 24h window. Prefer waiting for the retry.
3. To force it: use the dashboard "Resend" on that delivery.
4. Confirm in `webhook_events` that the id landed exactly once, then run
   the payout reconciler (`/admin/ops`) to confirm no drift.

## If the endpoint was disabled (past 24h)

1. Re-enable the webhook in the Razorpay dashboard.
2. For each missed payment, reconcile manually: check Razorpay for the
   settled transfer, then ensure the matching `commission_events` row
   exists (book it if not). See payout-reconciliation.md.

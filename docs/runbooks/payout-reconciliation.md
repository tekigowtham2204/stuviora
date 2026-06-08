# Runbook: Payout reconciliation

**Guardrail:** double-payout count is zero, ever (master plan section 7).

## What runs automatically

The `commissionReconciler` Inngest job runs daily at 02:00 IST. It loads
`commission_events`, runs the pure `reconcileCommissions` engine
(`lib/payments/reconcile.ts`), and captures any drift to the
observability sink. Drift kinds:

- `double_payout` two distinct settled transfers for one order
- `duplicate_event` the same Razorpay event id seen twice (idempotency breach)
- `missing_commission` a settled transfer with no commission booked
- `orphan_commission` a commission booked with no settled transfer
- `commission_mismatch` commission amount off by more than 1 rupee

## When drift is reported

1. Open `/admin/ops` and confirm the reconciliation panel shows the issue.
2. Pull the offending `order_id` from the captured issue detail.
3. Cross-check in Razorpay dashboard: how many `transfer.processed` events
   fired for that order's payment.
4. Decide:
   - **Double payout:** initiate a reversal on the duplicate transfer in
     Razorpay, then write a correcting `commission_events` row noting the
     reversal. Never delete ledger rows; append corrections.
   - **Missing commission:** book the commission row from the order amount
     using `computeSplit`.
   - **Mismatch:** recompute with `computeSplit(order.job_amount)`; correct
     the row to match.
5. Re-run the reconciler (replay the Inngest function) and confirm clean.

## Prevention

- The webhook handler must dedupe on `webhook_events.razorpay_event_id`
  before crediting. If a double payout reaches the ledger, the idempotency
  guard failed: audit the webhook handler first.

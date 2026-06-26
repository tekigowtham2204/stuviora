import "server-only";
import { razorpay } from "@/lib/razorpay/client";
import { services } from "@/lib/env";
import { trackEvent } from "@/lib/observability";

/**
 * Auth-and-capture verbs for the autonomous order loop (master plan
 * "no humans in the loop"). The order machine drives these via the
 * AuthAction emitted from resolveSubmissionOutcome + resolveClientDispute.
 *
 * Lifecycle:
 *   hire                   authorisePayment  (hold, do not charge)
 *   AI PASS                capturePayment    (charge on verified delivery)
 *   3x FAIL                voidPayment       (release the hold, no charge)
 *   client dispute (window) refundPayment    (reverse the capture)
 *
 * Live path uses Razorpay's payment_capture=0 + payments.capture/refund APIs.
 * The void verb is implemented as a normal Razorpay refund against an
 * uncaptured payment, which the gateway honours as a release of the hold.
 *
 * Demo path returns deterministic shapes so the UI loop is exercisable
 * without keys. Every call emits a funnel event for observability.
 */

export type AuthActionResult =
  | { kind: "authorised"; razorpayOrderId?: string; paymentId?: string; reused?: boolean }
  | { kind: "captured"; razorpayPaymentId?: string; amount: number }
  | { kind: "voided"; razorpayRefundId?: string }
  | { kind: "refunded"; razorpayRefundId?: string; amount: number };

export interface AuthorisePaymentInput {
  /** Stuviora order id. */
  orderId: string;
  /** INR rupees. */
  amount: number;
  clientId: string;
  notes?: Record<string, string>;
}

/**
 * Create a held authorisation against the client's payment method.
 *
 * Live: creates a Razorpay Order with `payment_capture: 0` so the
 * Checkout flow authorises but does not capture. We capture explicitly
 * once the AI gate returns PASS.
 *
 * Demo: returns a synthetic id so the UI flow can render the hold.
 */
export async function authorisePayment(
  input: AuthorisePaymentInput,
): Promise<AuthActionResult> {
  trackEvent(
    "payment_authorised",
    { orderId: input.orderId, amount: input.amount },
    input.clientId,
  );

  if (services.razorpay) {
    const rzp = razorpay();
    if (rzp) {
      const orderPayload = {
        amount: Math.round(input.amount * 100),
        currency: "INR",
        receipt: input.orderId,
        payment_capture: 0,
        notes: {
          order_id: input.orderId,
          client_id: input.clientId,
          kind: "auth_hold",
          ...input.notes,
        },
      } as unknown as Parameters<typeof rzp.orders.create>[0];
      const created = (await rzp.orders.create(orderPayload)) as { id: string };
      return { kind: "authorised", razorpayOrderId: created.id };
    }
  }

  return {
    kind: "authorised",
    razorpayOrderId: `auth_${input.orderId}_${Date.now()}`,
  };
}

export interface CaptureInput {
  orderId: string;
  amount: number;
  /** Razorpay payment id captured from the auth-success webhook. */
  razorpayPaymentId?: string;
}

/**
 * Capture the held authorisation: this is the moment the client is
 * actually charged. Triggered by the AI gate returning PASS.
 *
 * Live: payments.capture(payment_id, amount, currency). Idempotent on
 * Razorpay's side; replays return the captured payment unchanged.
 *
 * Demo: log + return a synthetic id.
 */
export async function capturePayment(
  input: CaptureInput,
): Promise<AuthActionResult> {
  trackEvent("payment_captured", {
    orderId: input.orderId,
    amount: input.amount,
  });

  if (services.razorpay && input.razorpayPaymentId) {
    const rzp = razorpay();
    if (rzp) {
      const captured = (await rzp.payments.capture(
        input.razorpayPaymentId,
        Math.round(input.amount * 100),
        "INR",
      )) as { id: string };
      return {
        kind: "captured",
        razorpayPaymentId: captured.id,
        amount: input.amount,
      };
    }
  }

  return {
    kind: "captured",
    razorpayPaymentId: `cap_${input.orderId}_${Date.now()}`,
    amount: input.amount,
  };
}

export interface VoidInput {
  orderId: string;
  /** Razorpay payment id for the (uncaptured) auth. */
  razorpayPaymentId?: string;
}

/**
 * Release the held authorisation without ever charging the client.
 * Triggered by 3x AI gate FAIL: terminal failure, no human dispute case.
 *
 * Live: a refund on an uncaptured payment releases the hold. Some banks
 * release the auth automatically on void; the explicit refund call is
 * the safe path that works across both.
 *
 * Demo: log + return a synthetic id.
 */
export async function voidPayment(input: VoidInput): Promise<AuthActionResult> {
  trackEvent("payment_voided", { orderId: input.orderId });

  if (services.razorpay && input.razorpayPaymentId) {
    const rzp = razorpay();
    if (rzp) {
      const voided = (await rzp.payments.refund(input.razorpayPaymentId, {
        notes: { order_id: input.orderId, kind: "auth_void" },
      })) as { id: string };
      return { kind: "voided", razorpayRefundId: voided.id };
    }
  }

  return {
    kind: "voided",
    razorpayRefundId: `void_${input.orderId}_${Date.now()}`,
  };
}

export interface RefundInput {
  orderId: string;
  amount: number;
  /** Razorpay payment id for the captured payment to reverse. */
  razorpayPaymentId?: string;
}

/**
 * Refund a captured payment. Triggered by a client-initiated dispute
 * during the awaiting_approval window: the engine reverses the capture
 * and either resets the order for a revision (if attempts remain) or
 * terminates it.
 *
 * Live: payments.refund(payment_id, { amount }).
 * Demo: log + return a synthetic id.
 */
export async function refundPayment(
  input: RefundInput,
): Promise<AuthActionResult> {
  trackEvent("payment_refunded", {
    orderId: input.orderId,
    amount: input.amount,
  });

  if (services.razorpay && input.razorpayPaymentId) {
    const rzp = razorpay();
    if (rzp) {
      const refunded = (await rzp.payments.refund(input.razorpayPaymentId, {
        amount: Math.round(input.amount * 100),
        notes: { order_id: input.orderId, kind: "client_dispute_refund" },
      })) as { id: string };
      return {
        kind: "refunded",
        razorpayRefundId: refunded.id,
        amount: input.amount,
      };
    }
  }

  return {
    kind: "refunded",
    razorpayRefundId: `ref_${input.orderId}_${Date.now()}`,
    amount: input.amount,
  };
}

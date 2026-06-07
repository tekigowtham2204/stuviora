import "server-only";
import Razorpay from "razorpay";
import { env, services } from "@/lib/env";

/**
 * Razorpay SDK wrapper (P3).
 *
 * Single source of the SDK + key id + key secret. Anything that talks
 * to Razorpay imports `razorpay()` from here.
 *
 * The client returns null in DEMO_MODE (no keys), and callers must
 * fall back to the demo split path. We never instantiate the SDK with
 * dummy keys; that hides misconfiguration.
 */

let _client: Razorpay | null = null;

export function razorpay(): Razorpay | null {
  if (!services.razorpay) return null;
  if (_client) return _client;
  _client = new Razorpay({
    key_id: env.razorpayKeyId!,
    key_secret: env.razorpayKeySecret!,
  });
  return _client;
}

/**
 * Public key id surfaced to the client-side Razorpay Checkout embed.
 * Safe to ship to the browser: it identifies the merchant but is not
 * the secret used to verify webhooks / authorise transfers.
 */
export function razorpayKeyIdPublic(): string | null {
  return env.razorpayKeyId ?? null;
}

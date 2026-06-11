/**
 * Partner request signing + verification (P9.4).
 *
 * The university B2B API (/api/v1/university/*) is machine-to-machine, so
 * it is authenticated with an HMAC-SHA256 signature rather than a session.
 * This module is pure (Node crypto only) and fully unit-tested; the route
 * guard (lib/partners/guard.ts) wires it to requests, and the partner
 * registry resolves the shared secret.
 *
 * Canonical string signed by both sides:
 *   METHOD \n PATH \n TIMESTAMP \n NONCE \n sha256hex(BODY)
 *
 * Replay defence: a timestamp outside +/- 5 minutes is rejected, and the
 * guard additionally rejects a reused nonce (live store).
 */

import { createHmac, createHash, timingSafeEqual } from "node:crypto";

export const MAX_CLOCK_SKEW_MS = 5 * 60_000; // 5 minutes

export interface SignParts {
  secret: string;
  method: string;
  path: string;
  timestamp: string; // epoch millis as string
  nonce: string;
  body?: string;
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

function canonicalString(p: Omit<SignParts, "secret">): string {
  return [
    p.method.toUpperCase(),
    p.path,
    p.timestamp,
    p.nonce,
    sha256Hex(p.body ?? ""),
  ].join("\n");
}

/** Compute the hex HMAC-SHA256 signature for a request. */
export function signRequest(parts: SignParts): string {
  const canonical = canonicalString(parts);
  return createHmac("sha256", parts.secret).update(canonical, "utf8").digest("hex");
}

/** Constant-time compare of two hex signatures of equal length. */
export function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export interface VerifyInput extends SignParts {
  signature: string;
  /** Current time; injectable for tests. */
  now?: number;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "stale_timestamp" | "bad_timestamp" | "bad_signature" };

/** Verify a signed request: timestamp freshness, then constant-time HMAC. */
export function verifyRequest(input: VerifyInput): VerifyResult {
  const now = input.now ?? Date.now();
  const ts = Number(input.timestamp);
  if (!Number.isFinite(ts)) return { ok: false, reason: "bad_timestamp" };
  if (Math.abs(now - ts) > MAX_CLOCK_SKEW_MS) {
    return { ok: false, reason: "stale_timestamp" };
  }
  const expected = signRequest(input);
  if (!safeEqualHex(expected, input.signature)) {
    return { ok: false, reason: "bad_signature" };
  }
  return { ok: true };
}

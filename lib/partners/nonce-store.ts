/**
 * Partner nonce replay store (P9.4).
 *
 * The HMAC guard (lib/partners/guard.ts) already rejects any request whose
 * timestamp falls outside a +/- 5 minute window. This store closes the
 * remaining gap: a request captured and replayed *inside* that window. A
 * nonce is single-use, so the second presentation of the same
 * (keyId, nonce) pair within the retention window is a replay.
 *
 * Implementation: an in-process, time-windowed map. It dedupes within a
 * warm server instance, which is the common replay path, and needs no
 * schema. A durable cross-instance store (a Supabase `partner_nonces` table
 * with a TTL sweep, or an Upstash SETNX with EX) drops in behind the same
 * `markNonceSeen` signature once the schema lands; the guard does not change.
 *
 * Retention equals the clock-skew window: outside it the timestamp check
 * already rejects, so a nonce never needs to be remembered longer.
 */

import { MAX_CLOCK_SKEW_MS } from "@/lib/partners/hmac";

const RETENTION_MS = MAX_CLOCK_SKEW_MS;

/** key (`${keyId}:${nonce}`) -> expiry epoch ms. */
const seen = new Map<string, number>();

function prune(now: number): void {
  for (const [k, expiry] of seen) {
    if (expiry <= now) seen.delete(k);
  }
}

/**
 * Record a nonce as used and report whether it was a replay.
 *
 * Returns `true` if this (keyId, nonce) pair was already seen within the
 * retention window (reject the request), `false` on first use (allow it).
 * Keyed by partner so two partners may independently use the same nonce
 * value. An empty nonce is not deduped here: the timestamp guard still
 * applies, and the canonical signed string binds whatever nonce was sent.
 */
export function markNonceSeen(
  keyId: string,
  nonce: string,
  now: number = Date.now()
): boolean {
  if (!nonce) return false;
  prune(now);
  const k = `${keyId}:${nonce}`;
  if (seen.has(k)) return true;
  seen.set(k, now + RETENTION_MS);
  return false;
}

/** Test-only: clear the store between cases. */
export function _resetNonceStore(): void {
  seen.clear();
}

/**
 * Rate limit (P6 / M6.2).
 *
 * Per-key fixed-window counter. Demo path uses an in-memory map; live
 * path (services.upstash) uses Upstash Redis over its REST API so the
 * limit holds across serverless replicas. On any live error we fall back
 * to the in-memory check so a Redis blip never hard-blocks users.
 *
 * Usage:
 *   const ok = await rateLimit({ key: `proposal:${userId}`, max: 5, windowMs: 60_000 });
 *   if (!ok.allowed) { ...redirect with ?error=rate_limited... }
 */

import { env, services } from "@/lib/env";

interface CheckArgs {
  key: string;
  max: number;
  windowMs: number;
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

type Bucket = { hits: number[]; updatedAt: number };
const buckets = new Map<string, Bucket>();

/** In-memory sliding window. Single-replica only; the demo default. */
export function rateLimitMemory({ key, max, windowMs }: CheckArgs): CheckResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { hits: [], updatedAt: now };
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
  const allowed = bucket.hits.length < max;
  if (allowed) bucket.hits.push(now);
  bucket.updatedAt = now;
  buckets.set(key, bucket);
  const resetAt = (bucket.hits[0] ?? now) + windowMs;
  return { allowed, remaining: Math.max(0, max - bucket.hits.length), resetAt };
}

/**
 * Upstash fixed-window via REST pipeline: INCR the window-bucketed key,
 * then set its TTL. Returns null on any failure so the caller can fall
 * back to the in-memory check.
 */
async function rateLimitUpstash({
  key,
  max,
  windowMs,
}: CheckArgs): Promise<CheckResult | null> {
  if (!env.upstashUrl || !env.upstashToken) return null;
  const window = Math.floor(Date.now() / windowMs);
  const bucketKey = `rl:${key}:${window}`;
  try {
    const res = await fetch(`${env.upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", bucketKey],
        ["PEXPIRE", bucketKey, String(windowMs), "NX"],
      ]),
    });
    if (!res.ok) return null;
    const out = (await res.json()) as Array<{ result: number }>;
    const count = Number(out?.[0]?.result ?? 0);
    if (!count) return null;
    const allowed = count <= max;
    return {
      allowed,
      remaining: Math.max(0, max - count),
      resetAt: (window + 1) * windowMs,
    };
  } catch {
    return null;
  }
}

export async function rateLimit(args: CheckArgs): Promise<CheckResult> {
  if (services.upstash) {
    const live = await rateLimitUpstash(args);
    if (live) return live;
  }
  return rateLimitMemory(args);
}

/** Periodic GC so the in-memory store does not grow forever in dev. */
export function cleanupRateLimitBuckets(maxAgeMs = 10 * 60_000) {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.updatedAt > maxAgeMs) buckets.delete(k);
  }
}

/** Test-only: clear the in-memory store between cases. */
export function _resetRateLimitForTests() {
  buckets.clear();
}

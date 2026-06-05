/**
 * Rate limit (M6.2).
 *
 * Sliding-window per-user / per-endpoint. Demo path uses an in-memory map;
 * live path (TODO) swaps to Upstash Redis behind `services.upstash` so the
 * limit holds across serverless replicas.
 *
 * Usage:
 *   const ok = await rateLimit({ key: `proposal:${userId}`, max: 5, windowMs: 60_000 });
 *   if (!ok.allowed) throw new Error("Too many requests");
 */

interface CheckArgs {
  key: string;
  max: number;
  windowMs: number;
}

interface CheckResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

type Bucket = { hits: number[]; updatedAt: number };
const buckets = new Map<string, Bucket>();

export async function rateLimit({ key, max, windowMs }: CheckArgs): Promise<CheckResult> {
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

/** Periodic GC so the in-memory store doesn't grow forever in long-running dev. */
export function cleanupRateLimitBuckets(maxAgeMs = 10 * 60_000) {
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.updatedAt > maxAgeMs) buckets.delete(k);
  }
}

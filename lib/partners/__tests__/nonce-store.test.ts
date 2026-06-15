import { describe, it, expect, beforeEach } from "vitest";
import {
  markNonceSeen,
  _resetNonceStore,
} from "@/lib/partners/nonce-store";
import { MAX_CLOCK_SKEW_MS } from "@/lib/partners/hmac";

describe("partner nonce store", () => {
  beforeEach(() => _resetNonceStore());

  it("allows the first use of a nonce and rejects the replay", () => {
    expect(markNonceSeen("key-a", "n1")).toBe(false);
    expect(markNonceSeen("key-a", "n1")).toBe(true);
  });

  it("scopes nonces per partner key", () => {
    expect(markNonceSeen("key-a", "shared")).toBe(false);
    // Same nonce value, different partner: not a replay.
    expect(markNonceSeen("key-b", "shared")).toBe(false);
    // But a repeat for the same partner is.
    expect(markNonceSeen("key-a", "shared")).toBe(true);
  });

  it("does not dedupe an empty nonce (timestamp guard still applies)", () => {
    expect(markNonceSeen("key-a", "")).toBe(false);
    expect(markNonceSeen("key-a", "")).toBe(false);
  });

  it("forgets a nonce once it falls outside the retention window", () => {
    const t0 = 1700000000000;
    expect(markNonceSeen("key-a", "n1", t0)).toBe(false);
    // Just past the skew window: the old nonce is pruned, so reusing it is
    // allowed again (the timestamp guard would have rejected it by now).
    const later = t0 + MAX_CLOCK_SKEW_MS + 1;
    expect(markNonceSeen("key-a", "n1", later)).toBe(false);
  });

  it("still rejects a replay within the retention window", () => {
    const t0 = 1700000000000;
    expect(markNonceSeen("key-a", "n1", t0)).toBe(false);
    const within = t0 + MAX_CLOCK_SKEW_MS - 1;
    expect(markNonceSeen("key-a", "n1", within)).toBe(true);
  });
});

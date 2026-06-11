import { describe, it, expect } from "vitest";
import {
  signRequest,
  verifyRequest,
  safeEqualHex,
  MAX_CLOCK_SKEW_MS,
  type SignParts,
} from "@/lib/partners/hmac";

const base: SignParts = {
  secret: "shared-secret",
  method: "GET",
  path: "/api/v1/university/students",
  timestamp: "1700000000000",
  nonce: "nonce-1",
  body: "",
};

describe("partner HMAC", () => {
  const now = 1700000000000;

  it("verifies a correctly signed request", () => {
    const signature = signRequest(base);
    const r = verifyRequest({ ...base, signature, now });
    expect(r.ok).toBe(true);
  });

  it("rejects a tampered path (signature no longer matches)", () => {
    const signature = signRequest(base);
    const r = verifyRequest({
      ...base,
      path: "/api/v1/university/gmv",
      signature,
      now,
    });
    expect(r).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a wrong secret", () => {
    const signature = signRequest({ ...base, secret: "attacker" });
    const r = verifyRequest({ ...base, signature, now });
    expect(r).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a body change", () => {
    const signature = signRequest({ ...base, method: "POST", body: '{"a":1}' });
    const r = verifyRequest({
      ...base,
      method: "POST",
      body: '{"a":2}',
      signature,
      now,
    });
    expect(r).toEqual({ ok: false, reason: "bad_signature" });
  });

  it("rejects a stale timestamp (replay defence)", () => {
    const signature = signRequest(base);
    const r = verifyRequest({
      ...base,
      signature,
      now: now + MAX_CLOCK_SKEW_MS + 1,
    });
    expect(r).toEqual({ ok: false, reason: "stale_timestamp" });
  });

  it("rejects a non-numeric timestamp", () => {
    const parts = { ...base, timestamp: "not-a-number" };
    const signature = signRequest(parts);
    const r = verifyRequest({ ...parts, signature, now });
    expect(r).toEqual({ ok: false, reason: "bad_timestamp" });
  });

  it("safeEqualHex is false for different-length inputs", () => {
    expect(safeEqualHex("ab", "abcd")).toBe(false);
    expect(safeEqualHex("abcd", "abcd")).toBe(true);
  });

  it("signature is deterministic for identical inputs", () => {
    expect(signRequest(base)).toBe(signRequest(base));
  });
});

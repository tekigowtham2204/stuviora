import { describe, it, expect, beforeEach } from "vitest";
import { rateLimitMemory, _resetRateLimitForTests } from "@/lib/ratelimit";

describe("rateLimitMemory", () => {
  beforeEach(() => _resetRateLimitForTests());

  it("allows up to max requests then blocks", () => {
    const args = { key: "k1", max: 3, windowMs: 60_000 };
    expect(rateLimitMemory(args).allowed).toBe(true);
    expect(rateLimitMemory(args).allowed).toBe(true);
    expect(rateLimitMemory(args).allowed).toBe(true);
    const fourth = rateLimitMemory(args);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("tracks remaining count", () => {
    const args = { key: "k2", max: 5, windowMs: 60_000 };
    expect(rateLimitMemory(args).remaining).toBe(4);
    expect(rateLimitMemory(args).remaining).toBe(3);
  });

  it("isolates separate keys", () => {
    const a = { key: "a", max: 1, windowMs: 60_000 };
    const b = { key: "b", max: 1, windowMs: 60_000 };
    expect(rateLimitMemory(a).allowed).toBe(true);
    expect(rateLimitMemory(b).allowed).toBe(true); // b unaffected by a
    expect(rateLimitMemory(a).allowed).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { computeSplit, formatINR, cn } from "@/lib/utils";

describe("computeSplit", () => {
  it("splits 85/15 with 18% GST on commission", () => {
    const r = computeSplit(10_000);
    expect(r.jobAmount).toBe(10_000);
    expect(r.commission).toBe(1_500);
    expect(r.studentPayout).toBe(8_500);
    expect(r.gst).toBe(270);
    expect(r.platformNet).toBe(1_230);
  });

  it("handles odd-rupee amounts cleanly", () => {
    const r = computeSplit(9_999);
    expect(r.commission + r.studentPayout).toBe(9_999);
  });

  it("honors custom commission rate", () => {
    const r = computeSplit(10_000, 0.1);
    expect(r.commission).toBe(1_000);
    expect(r.studentPayout).toBe(9_000);
  });
});

describe("formatINR", () => {
  it("uses Indian grouping with the rupee symbol", () => {
    expect(formatINR(1_23_456)).toMatch(/^₹/);
    expect(formatINR(1_23_456)).toContain("1,23,456");
  });

  it("drops fractional digits", () => {
    expect(formatINR(100.7)).not.toContain(".");
  });
});

describe("cn", () => {
  it("merges Tailwind classes with conflict resolution", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

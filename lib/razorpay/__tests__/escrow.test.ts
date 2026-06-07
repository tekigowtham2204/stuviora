import { describe, it, expect, beforeEach } from "vitest";
import {
  guardWebhookIdempotency,
  _resetWebhookIdempotencyCache,
} from "@/lib/razorpay/escrow";
import { computeSplit } from "@/lib/utils";

describe("computeSplit (pinned by escrow contract)", () => {
  it("rounds to whole rupees while preserving total", () => {
    const r = computeSplit(10_000);
    expect(r.studentPayout + r.commission).toBe(10_000);
  });

  it("85/15 base split", () => {
    const r = computeSplit(10_000);
    expect(r.studentPayout).toBe(8_500);
    expect(r.commission).toBe(1_500);
    expect(r.gst).toBe(270);
    expect(r.platformNet).toBe(1_230);
  });
});

describe("guardWebhookIdempotency (in-process demo path)", () => {
  beforeEach(() => {
    _resetWebhookIdempotencyCache();
  });

  it("returns true for a fresh event id", async () => {
    expect(await guardWebhookIdempotency("evt_1")).toBe(true);
  });

  it("returns false on the second sighting of the same id", async () => {
    expect(await guardWebhookIdempotency("evt_2")).toBe(true);
    expect(await guardWebhookIdempotency("evt_2")).toBe(false);
  });

  it("treats empty event id as fresh (avoids blocking)", async () => {
    expect(await guardWebhookIdempotency("")).toBe(true);
  });
});

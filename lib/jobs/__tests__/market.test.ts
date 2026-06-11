import { describe, it, expect } from "vitest";
import { marketSignalFor, marketSignals } from "@/lib/jobs/market";
import type { Proposal } from "@/lib/types";

const prop = (jobId: string, bidAmount: number): Proposal => ({
  id: `p-${jobId}-${bidAmount}`,
  jobId,
  studentId: "s",
  coverLetter: "",
  bidAmount,
  deliveryDays: 5,
  status: "submitted",
});

describe("marketSignalFor", () => {
  it("averages and counts bids for a job", () => {
    const s = marketSignalFor("a", [prop("a", 4000), prop("a", 6000), prop("b", 100)]);
    expect(s.bids).toBe(2);
    expect(s.avgBid).toBe(5000);
  });

  it("returns null avg when there are no bids", () => {
    const s = marketSignalFor("a", []);
    expect(s.bids).toBe(0);
    expect(s.avgBid).toBeNull();
  });

  it("batch variant maps every requested job", () => {
    const m = marketSignals(["a", "b"], [prop("a", 3000)]);
    expect(m.get("a")!.avgBid).toBe(3000);
    expect(m.get("b")!.bids).toBe(0);
  });
});

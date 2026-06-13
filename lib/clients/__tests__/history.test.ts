import { describe, it, expect } from "vitest";
import { computeClientHistory } from "@/lib/clients/history";
import type { Order, OrderStatus } from "@/lib/types";

let seq = 0;
const order = (over: Partial<Order> & { status: OrderStatus }): Order => ({
  id: `o-${seq++}`,
  jobId: "job-1",
  jobTitle: "T",
  clientId: "cli-1",
  studentId: "stu-1",
  amount: 1000,
  deadlineDays: 0,
  createdAgo: "1d ago",
  ...over,
});

describe("computeClientHistory", () => {
  it("computes hire rate from distinct funded jobs over jobs posted", () => {
    const h = computeClientHistory({
      client: { jobsPosted: 4 },
      orders: [
        order({ jobId: "job-1", status: "completed" }),
        order({ jobId: "job-2", status: "active" }),
      ],
    });
    expect(h.hires).toBe(2);
    expect(h.hireRatePct).toBe(50);
  });

  it("splits released spend from money in escrow", () => {
    const h = computeClientHistory({
      client: { jobsPosted: 3 },
      orders: [
        order({ jobId: "job-1", status: "completed", amount: 5000 }),
        order({ jobId: "job-2", status: "awaiting_approval", amount: 7000 }),
      ],
    });
    expect(h.totalSpent).toBe(5000);
    expect(h.inEscrow).toBe(7000);
    expect(h.avgOrderValue).toBe(6000);
  });

  it("ignores refunded, cancelled, and pending-payment orders", () => {
    const h = computeClientHistory({
      client: { jobsPosted: 5 },
      orders: [
        order({ jobId: "job-1", status: "refunded", amount: 9000 }),
        order({ jobId: "job-2", status: "cancelled", amount: 9000 }),
        order({ jobId: "job-3", status: "pending_payment", amount: 9000 }),
      ],
    });
    expect(h.ordersCount).toBe(0);
    expect(h.totalSpent).toBe(0);
    expect(h.inEscrow).toBe(0);
    expect(h.isNew).toBe(true);
    expect(h.avgOrderValue).toBeNull();
  });

  it("counts a student hired more than once as a repeat hire", () => {
    const h = computeClientHistory({
      client: { jobsPosted: 4 },
      orders: [
        order({ jobId: "job-1", studentId: "stu-a", status: "completed" }),
        order({ jobId: "job-2", studentId: "stu-a", status: "active" }),
        order({ jobId: "job-3", studentId: "stu-b", status: "completed" }),
      ],
    });
    expect(h.repeatHires).toBe(1);
  });

  it("caps hire rate at 100 and returns null with nothing posted", () => {
    const capped = computeClientHistory({
      client: { jobsPosted: 1 },
      orders: [
        order({ jobId: "job-1", status: "completed" }),
        order({ jobId: "job-2", status: "active" }),
      ],
    });
    expect(capped.hireRatePct).toBe(100);

    const none = computeClientHistory({ client: { jobsPosted: 0 }, orders: [] });
    expect(none.hireRatePct).toBeNull();
    expect(none.isNew).toBe(true);
  });
});

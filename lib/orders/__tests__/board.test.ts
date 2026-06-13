import { describe, it, expect } from "vitest";
import {
  groupOrdersByColumn,
  ORDER_BOARD_COLUMNS,
} from "@/lib/orders/board";
import type { Order, OrderStatus } from "@/lib/types";

const order = (id: string, status: OrderStatus): Order => ({
  id,
  jobId: "job-1",
  jobTitle: "T",
  clientId: "cli-1",
  studentId: "stu-1",
  amount: 1000,
  status,
  deadlineDays: 0,
  createdAgo: "1d ago",
});

describe("groupOrdersByColumn", () => {
  it("maps every order status into exactly one column", () => {
    const all: OrderStatus[] = [
      "pending_payment",
      "active",
      "submitted",
      "in_ai_review",
      "awaiting_approval",
      "revision_requested",
      "completed",
      "disputed",
      "refunded",
      "cancelled",
    ];
    const grouped = groupOrdersByColumn(all.map((s, i) => order(`o-${i}`, s)));
    const total = [...grouped.values()].reduce((n, list) => n + list.length, 0);
    expect(total).toBe(all.length);
  });

  it("groups active, payment-pending, and revision orders together", () => {
    const grouped = groupOrdersByColumn([
      order("a", "active"),
      order("b", "revision_requested"),
      order("c", "pending_payment"),
    ]);
    expect(grouped.get("active")!.map((o) => o.id)).toEqual(["a", "b", "c"]);
  });

  it("separates submitted, awaiting, disputed, and closed", () => {
    const grouped = groupOrdersByColumn([
      order("s", "submitted"),
      order("aw", "awaiting_approval"),
      order("d", "disputed"),
      order("done", "completed"),
    ]);
    expect(grouped.get("submitted")!.map((o) => o.id)).toEqual(["s"]);
    expect(grouped.get("awaiting")!.map((o) => o.id)).toEqual(["aw"]);
    expect(grouped.get("disputed")!.map((o) => o.id)).toEqual(["d"]);
    expect(grouped.get("closed")!.map((o) => o.id)).toEqual(["done"]);
  });

  it("returns an entry for every defined column even when empty", () => {
    const grouped = groupOrdersByColumn([]);
    for (const col of ORDER_BOARD_COLUMNS) {
      expect(grouped.get(col.key)).toEqual([]);
    }
  });
});

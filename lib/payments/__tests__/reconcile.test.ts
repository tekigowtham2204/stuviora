import { describe, it, expect } from "vitest";
import {
  reconcileCommissions,
  type TransferEvent,
  type CommissionEntry,
} from "@/lib/payments/reconcile";

const tx = (p: Partial<TransferEvent> = {}): TransferEvent => ({
  eventId: "evt_1",
  orderId: "ord_1",
  amount: 8500,
  status: "processed",
  ...p,
});

// 10000 order -> commission 1500, payout 8500.
const comm = (p: Partial<CommissionEntry> = {}): CommissionEntry => ({
  orderId: "ord_1",
  orderAmount: 10000,
  commission: 1500,
  ...p,
});

describe("reconcileCommissions", () => {
  it("passes a clean, matched ledger", () => {
    const r = reconcileCommissions([tx()], [comm()]);
    expect(r.ok).toBe(true);
    expect(r.issues).toHaveLength(0);
    expect(r.ordersChecked).toBe(1);
    expect(r.settledTransfers).toBe(1);
  });

  it("flags a double payout (two distinct settled transfers)", () => {
    const r = reconcileCommissions(
      [tx({ eventId: "evt_1" }), tx({ eventId: "evt_2" })],
      [comm()]
    );
    expect(r.ok).toBe(false);
    expect(r.issues.map((i) => i.kind)).toContain("double_payout");
  });

  it("does NOT flag a retried webhook with the same event id", () => {
    // Same eventId twice = idempotent retry, one real payout.
    const r = reconcileCommissions(
      [tx({ eventId: "evt_dup" }), tx({ eventId: "evt_dup" })],
      [comm()]
    );
    expect(r.issues.map((i) => i.kind)).toContain("duplicate_event");
    expect(r.issues.map((i) => i.kind)).not.toContain("double_payout");
  });

  it("flags a settled transfer with no commission booked", () => {
    const r = reconcileCommissions([tx()], []);
    expect(r.issues.map((i) => i.kind)).toContain("missing_commission");
  });

  it("flags an orphan commission with no settled transfer", () => {
    const r = reconcileCommissions(
      [tx({ status: "failed" })],
      [comm()]
    );
    expect(r.issues.map((i) => i.kind)).toContain("orphan_commission");
  });

  it("flags a commission amount mismatch beyond tolerance", () => {
    const r = reconcileCommissions([tx()], [comm({ commission: 999 })]);
    expect(r.issues.map((i) => i.kind)).toContain("commission_mismatch");
  });

  it("tolerates rounding within 1 rupee", () => {
    const r = reconcileCommissions([tx()], [comm({ commission: 1501 })]);
    expect(r.ok).toBe(true);
  });
});

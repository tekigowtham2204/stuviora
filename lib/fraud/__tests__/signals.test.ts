import { describe, it, expect } from "vitest";
import {
  evaluateRiskSignals,
  assessAccounts,
  type AccountActivity,
} from "@/lib/fraud/signals";
import { FRAUD_THRESHOLDS as T } from "@/lib/constants";

const base = (p: Partial<AccountActivity>): AccountActivity => ({
  accountId: "acc",
  accountAgeHours: 1000,
  ordersLast1h: 0,
  ordersLast24h: 0,
  largestOrderValue: 0,
  disputesLast30d: 0,
  sharedContactAccounts: 0,
  ...p,
});

describe("evaluateRiskSignals", () => {
  it("clean account has no signals and is low risk", () => {
    const r = evaluateRiskSignals(base({}));
    expect(r.signals).toHaveLength(0);
    expect(r.level).toBe("low");
  });

  it("hourly order velocity over threshold is high risk", () => {
    const r = evaluateRiskSignals(base({ ordersLast1h: T.ordersPerHour + 1 }));
    expect(r.level).toBe("high");
    expect(r.signals.map((s) => s.code)).toContain("order_velocity_hour");
  });

  it("daily velocity over threshold is elevated", () => {
    const r = evaluateRiskSignals(base({ ordersLast24h: T.ordersPerDay + 1 }));
    expect(r.level).toBe("elevated");
    expect(r.signals.map((s) => s.code)).toContain("order_velocity_day");
  });

  it("new account with a high-value order is high risk", () => {
    const r = evaluateRiskSignals(
      base({
        accountAgeHours: T.newAccountHours - 1,
        largestOrderValue: T.newAccountHighValue,
      })
    );
    expect(r.level).toBe("high");
    expect(r.signals.map((s) => s.code)).toContain("new_account_high_value");
  });

  it("an aged account with a high-value order does NOT trip the new-account rule", () => {
    const r = evaluateRiskSignals(
      base({
        accountAgeHours: T.newAccountHours + 1,
        largestOrderValue: T.newAccountHighValue * 10,
      })
    );
    expect(r.signals.map((s) => s.code)).not.toContain("new_account_high_value");
  });

  it("dispute concentration at the threshold is elevated", () => {
    const r = evaluateRiskSignals(base({ disputesLast30d: T.disputesPer30d }));
    expect(r.signals.map((s) => s.code)).toContain("dispute_concentration");
  });

  it("level is the most severe signal when several trip", () => {
    const r = evaluateRiskSignals(
      base({
        ordersLast1h: T.ordersPerHour + 1, // high
        disputesLast30d: T.disputesPer30d, // elevated
      })
    );
    expect(r.level).toBe("high");
    expect(r.signals.length).toBe(2);
  });
});

describe("assessAccounts", () => {
  it("returns only flagged accounts, most severe first", () => {
    const out = assessAccounts([
      base({ accountId: "clean" }),
      base({ accountId: "elevated", disputesLast30d: T.disputesPer30d }),
      base({ accountId: "high", ordersLast1h: T.ordersPerHour + 1 }),
    ]);
    expect(out.map((r) => r.accountId)).toEqual(["high", "elevated"]);
  });

  it("empty when nothing trips", () => {
    expect(assessAccounts([base({}), base({ accountId: "b" })])).toHaveLength(0);
  });
});

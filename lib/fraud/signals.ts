import { FRAUD_THRESHOLDS } from "@/lib/constants";

/**
 * Advisory fraud-risk signals.
 *
 * Pure functions over an account's recent activity. The output is ADVISORY:
 * it raises flags for a human to review and never auto-blocks, holds, or
 * penalises anyone. Enforcement is a human decision (see PRINCIPLES.md 5). The
 * same fold serves the live and demo paths and is fully testable.
 */

export type RiskLevel = "low" | "elevated" | "high";

export interface AccountActivity {
  accountId: string;
  /** Display label for the admin list (name or public id). */
  label?: string;
  /** Hours since the account signed up. */
  accountAgeHours: number;
  /** Orders placed in the last rolling hour. */
  ordersLast1h: number;
  /** Orders placed in the last rolling 24 hours. */
  ordersLast24h: number;
  /** Largest single order value, in rupees. */
  largestOrderValue: number;
  /** Disputes this account opened in the last 30 days. */
  disputesLast30d: number;
  /** Other accounts sharing a contact detail (email/phone/device). */
  sharedContactAccounts: number;
}

export interface RiskSignal {
  code: string;
  label: string;
  severity: RiskLevel;
  detail: string;
}

export interface RiskAssessment {
  accountId: string;
  label?: string;
  /** Highest severity among the signals; "low" when there are none. */
  level: RiskLevel;
  signals: RiskSignal[];
}

const RANK: Record<RiskLevel, number> = { low: 0, elevated: 1, high: 2 };

/** The more severe of two levels. */
function maxLevel(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RANK[a] >= RANK[b] ? a : b;
}

/** Evaluate one account's activity into an advisory risk assessment. */
export function evaluateRiskSignals(
  a: AccountActivity,
  t = FRAUD_THRESHOLDS
): RiskAssessment {
  const signals: RiskSignal[] = [];

  if (a.ordersLast1h > t.ordersPerHour) {
    signals.push({
      code: "order_velocity_hour",
      label: "Order velocity (1h)",
      severity: "high",
      detail: `${a.ordersLast1h} orders in an hour (over ${t.ordersPerHour}).`,
    });
  }
  if (a.ordersLast24h > t.ordersPerDay) {
    signals.push({
      code: "order_velocity_day",
      label: "Order velocity (24h)",
      severity: "elevated",
      detail: `${a.ordersLast24h} orders in a day (over ${t.ordersPerDay}).`,
    });
  }
  if (
    a.accountAgeHours < t.newAccountHours &&
    a.largestOrderValue >= t.newAccountHighValue
  ) {
    signals.push({
      code: "new_account_high_value",
      label: "New account, high value",
      severity: "high",
      detail: `Account ${Math.round(a.accountAgeHours)}h old with an order of Rs.${a.largestOrderValue}.`,
    });
  }
  if (a.disputesLast30d >= t.disputesPer30d) {
    signals.push({
      code: "dispute_concentration",
      label: "Dispute concentration",
      severity: "elevated",
      detail: `${a.disputesLast30d} disputes in 30 days (at or over ${t.disputesPer30d}).`,
    });
  }
  if (a.sharedContactAccounts >= t.sharedContactAccounts) {
    signals.push({
      code: "shared_contact",
      label: "Linked accounts",
      severity: "elevated",
      detail: `Shares a contact detail with ${a.sharedContactAccounts} other accounts.`,
    });
  }

  const level = signals.reduce<RiskLevel>(
    (acc, s) => maxLevel(acc, s.severity),
    "low"
  );
  return { accountId: a.accountId, label: a.label, level, signals };
}

/**
 * Assess many accounts, returning only those with at least one signal, most
 * severe first. The admin surface shows this list; an empty list is an honest
 * "nothing to review", not a hidden failure.
 */
export function assessAccounts(
  accounts: AccountActivity[],
  t = FRAUD_THRESHOLDS
): RiskAssessment[] {
  return accounts
    .map((a) => evaluateRiskSignals(a, t))
    .filter((r) => r.signals.length > 0)
    .sort((a, b) => RANK[b.level] - RANK[a.level]);
}

/**
 * AI-gate calibration logging (the data moat, deep-research S5/S6).
 *
 * Every gate decision is logged, and every eventual human outcome
 * (client approval, revision request, dispute result) is joined back to
 * it. The accumulated pairs are the proprietary dataset that keeps the
 * gate measurably better than any cold-start copy, and they feed the
 * public trust page's accuracy stats.
 *
 * Live: rows persist to ai_calibration_log (migration 0011).
 * Demo: an in-memory ring so the loop is observable without a database.
 */

import "server-only";
import { getServiceSupabase } from "@/lib/supabase/server";
import { services } from "@/lib/env";

export type HumanOutcome =
  | "approved"
  | "revision_requested"
  | "dispute_client_favour"
  | "dispute_student_favour"
  | "dispute_partial";

export interface GateDecision {
  orderId: string;
  score: number;
  verdict: "PASS" | "FAIL";
  promptVersion: string;
}

export interface CalibrationRow extends GateDecision {
  decidedAt: number;
  outcome?: HumanOutcome;
  outcomeAt?: number;
}

/** Demo ring buffer (newest first, capped). */
const demoLog: CalibrationRow[] = [];
const DEMO_CAP = 500;

/** Record the gate's decision at review time. */
export async function recordGateDecision(d: GateDecision): Promise<void> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase.from("ai_calibration_log").insert({
        order_id: d.orderId,
        score: d.score,
        verdict: d.verdict,
        prompt_version: d.promptVersion,
      });
      return;
    }
  }
  demoLog.unshift({ ...d, decidedAt: Date.now() });
  if (demoLog.length > DEMO_CAP) demoLog.pop();
}

/** Join the eventual human outcome back to the decision. */
export async function recordHumanOutcome(
  orderId: string,
  outcome: HumanOutcome
): Promise<void> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      await supabase
        .from("ai_calibration_log")
        .update({ outcome, outcome_at: new Date().toISOString() })
        .eq("order_id", orderId)
        .is("outcome", null);
      return;
    }
  }
  const row = demoLog.find((r) => r.orderId === orderId && !r.outcome);
  if (row) {
    row.outcome = outcome;
    row.outcomeAt = Date.now();
  }
}

export interface CalibrationStats {
  decisions: number;
  labeled: number;
  /** PASS decisions later approved without dispute = gate agreed with humans. */
  agreementRate: number | null;
  passRate: number | null;
  /** Labeled PASS decisions (the denominator for precision). */
  passLabeled: number;
  /**
   * Gate precision vs human approval: of the PASS decisions a human later
   * judged, the fraction the human agreed with (approved, or won the dispute
   * as the student). This is the headline "is the gate right when it says
   * ship it" number.
   */
  passPrecision: number | null;
  /** Labeled FAIL decisions (the denominator for catch rate). */
  failLabeled: number;
  /**
   * Of the FAIL decisions a human later judged, the fraction the gate was
   * right to hold back (revision requested, or the client won the dispute).
   */
  failCatchRate: number | null;
}

/** A PASS the human agreed with (good work shipped). */
function passAgreed(r: CalibrationRow): boolean {
  return r.outcome === "approved" || r.outcome === "dispute_student_favour";
}

/** A FAIL the human agreed with (bad work correctly held back). */
function failAgreed(r: CalibrationRow): boolean {
  return (
    r.outcome === "revision_requested" || r.outcome === "dispute_client_favour"
  );
}

/** Aggregate stats for the ops dashboard + public trust page. */
export function calibrationStatsFrom(rows: CalibrationRow[]): CalibrationStats {
  const decisions = rows.length;
  const labeled = rows.filter((r) => r.outcome).length;
  const passes = rows.filter((r) => r.verdict === "PASS").length;

  const passLabeledRows = rows.filter((r) => r.outcome && r.verdict === "PASS");
  const failLabeledRows = rows.filter((r) => r.outcome && r.verdict === "FAIL");
  const agreeing =
    passLabeledRows.filter(passAgreed).length +
    failLabeledRows.filter(failAgreed).length;

  return {
    decisions,
    labeled,
    agreementRate: labeled ? agreeing / labeled : null,
    passRate: decisions ? passes / decisions : null,
    passLabeled: passLabeledRows.length,
    passPrecision: passLabeledRows.length
      ? passLabeledRows.filter(passAgreed).length / passLabeledRows.length
      : null,
    failLabeled: failLabeledRows.length,
    failCatchRate: failLabeledRows.length
      ? failLabeledRows.filter(failAgreed).length / failLabeledRows.length
      : null,
  };
}

/** Demo-path stats accessor (live reads the table and reuses the fold). */
export function demoCalibrationStats(): CalibrationStats {
  return calibrationStatsFrom(demoLog);
}

/**
 * Live-aware stats accessor for the ops dashboard. Reads ai_calibration_log
 * when Supabase is configured, otherwise folds the in-memory demo ring. Both
 * paths reuse calibrationStatsFrom so the numbers are computed identically.
 */
export async function getCalibrationStats(): Promise<CalibrationStats> {
  if (services.supabase) {
    const supabase = getServiceSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("ai_calibration_log")
        .select("order_id, score, verdict, prompt_version, outcome, outcome_at")
        .order("created_at", { ascending: false })
        .limit(DEMO_CAP);
      const rows: CalibrationRow[] = (data ?? []).map((r) => ({
        orderId: r.order_id as string,
        score: r.score as number,
        verdict: r.verdict as "PASS" | "FAIL",
        promptVersion: (r.prompt_version as string) ?? "",
        decidedAt: 0,
        outcome: (r.outcome as HumanOutcome | null) ?? undefined,
        outcomeAt: r.outcome_at ? Date.parse(r.outcome_at as string) : undefined,
      }));
      return calibrationStatsFrom(rows);
    }
  }
  return calibrationStatsFrom(demoLog);
}

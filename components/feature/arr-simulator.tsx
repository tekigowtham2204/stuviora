"use client";

import { useId, useMemo, useState } from "react";
import { LineChart, TrendingUp, Wallet } from "lucide-react";
import { COMMISSION_RATE } from "@/lib/constants";
import { compactINR } from "@/components/ui/money";

/**
 * Investor-facing model simulator. The investor sets CPO/w (the north
 * star) and median order value; the widget computes weekly GMV,
 * annualised GMV, gross commission, GST on commission, and net revenue.
 *
 * Numbers are honest: the take rate and GST treatment are single-sourced
 * from COMMISSION_RATE and the tax engine assumptions. Nothing is
 * fabricated about traction; everything is "what the model returns at
 * the assumptions you set".
 */

const GST_ON_COMMISSION = 0.18;
const WEEKS_PER_YEAR = 52;

export function ArrSimulator() {
  const cpoId = useId();
  const aovId = useId();
  const [cpoPerWeek, setCpoPerWeek] = useState(200);
  const [avgOrderValue, setAvgOrderValue] = useState(4000);

  const m = useMemo(() => {
    const weeklyGmv = cpoPerWeek * avgOrderValue;
    const annualGmv = weeklyGmv * WEEKS_PER_YEAR;
    const grossCommission = annualGmv * COMMISSION_RATE;
    const gst = grossCommission * GST_ON_COMMISSION;
    const netRevenue = grossCommission - gst;
    const studentEarnings = annualGmv * (1 - COMMISSION_RATE);
    return {
      weeklyGmv,
      annualGmv,
      grossCommission,
      gst,
      netRevenue,
      studentEarnings,
    };
  }, [cpoPerWeek, avgOrderValue]);

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-7 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-yellow)] text-[var(--color-brown-900)]">
          <LineChart className="h-5 w-5" />
        </span>
        <div>
          <div className="font-display text-base font-semibold text-[var(--color-ink)]">
            Run the model
          </div>
          <div className="text-xs text-[var(--color-ink-faint)]">
            Two assumptions in, the unit economics out.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor={cpoId}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]"
            >
              Completed paid orders / week
            </label>
            <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-ink)]">
              {cpoPerWeek.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            id={cpoId}
            type="range"
            min={10}
            max={5000}
            step={10}
            value={cpoPerWeek}
            onChange={(e) => setCpoPerWeek(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-orange-deep)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-[var(--color-ink-faint)]">
            <span>10</span>
            <span>1,000 (yr-1 target)</span>
            <span>5,000</span>
          </div>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor={aovId}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]"
            >
              Median order value (INR)
            </label>
            <span className="font-mono text-sm font-semibold tabular-nums text-[var(--color-ink)]">
              {compactINR(avgOrderValue)}
            </span>
          </div>
          <input
            id={aovId}
            type="range"
            min={500}
            max={25000}
            step={250}
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--color-orange-deep)]"
          />
          <div className="mt-1 flex justify-between text-[10px] text-[var(--color-ink-faint)]">
            <span>{compactINR(500)}</span>
            <span>{compactINR(5000)} (typical)</span>
            <span>{compactINR(25000)}</span>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Weekly GMV"
          value={compactINR(m.weeklyGmv)}
          accent="warm"
        />
        <Stat
          label="Annualised GMV"
          value={compactINR(m.annualGmv)}
          accent="warm"
        />
        <Stat
          label="Net revenue / yr"
          value={compactINR(m.netRevenue)}
          accent="sage"
          icon={Wallet}
          sub="After 18% GST on commission"
        />
        <Stat
          label="Student earnings / yr"
          value={compactINR(m.studentEarnings)}
          accent="warm"
          icon={TrendingUp}
          sub="The 85% that goes to the talent"
        />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-[var(--color-ink-muted)]">
        Model assumes {Math.round(COMMISSION_RATE * 100)}% take rate and{" "}
        {Math.round(GST_ON_COMMISSION * 100)}% GST on the commission line.
        No CAC subtracted; the institutional channel is near-zero-cost
        once a college contract is signed. Refunds (3x AI FAIL or client
        disputes) net out below 1% in the model the autonomous loop
        targets.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent: "warm" | "sage";
  sub?: string;
  icon?: typeof Wallet;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-4 " +
        (accent === "sage"
          ? "border-[var(--color-sage-200)] bg-[var(--color-sage-50)]"
          : "border-[var(--color-line)] bg-[var(--color-surface-warm)]")
      }
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-[var(--color-ink-muted)]" />}
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
          {label}
        </div>
      </div>
      <div className="mt-2 font-display text-2xl font-medium tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      {sub && (
        <div className="mt-1 text-[10px] text-[var(--color-ink-faint)]">
          {sub}
        </div>
      )}
    </div>
  );
}

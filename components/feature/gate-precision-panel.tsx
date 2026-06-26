import { Bot, Target, ShieldCheck, GitCompare } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalibrationStats } from "@/lib/ai/calibration";

/**
 * Ops view of the data moat: how often the AI gate's verdict matched the
 * human's later decision. PASS precision answers "when the gate shipped it,
 * was it right"; catch rate answers "when the gate held it back, was it
 * right". Numbers are real and accumulate as orders flow through; until
 * enough decisions are labeled we say so rather than invent a figure.
 */
export function GatePrecisionPanel({
  stats,
  className,
}: {
  stats: CalibrationStats;
  className?: string;
}) {
  const pct = (v: number | null) =>
    v == null ? "--" : `${Math.round(v * 100)}%`;

  const hasData = stats.labeled > 0;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-sage)] text-[var(--color-brown-900)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Gate precision vs human approval</CardTitle>
            <div className="text-xs text-[var(--color-ink-muted)]">
              The data moat: AI verdict measured against the client&apos;s
              decision.
            </div>
          </div>
        </div>
        <Badge tone="neutral">
          {stats.labeled} of {stats.decisions} labeled
        </Badge>
      </div>

      {hasData ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Metric
            icon={<Target className="h-4 w-4" />}
            label="PASS precision"
            value={pct(stats.passPrecision)}
            sub={`${stats.passLabeled} labeled PASS`}
            hint="Shipped work the client kept"
          />
          <Metric
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Catch rate"
            value={pct(stats.failCatchRate)}
            sub={`${stats.failLabeled} labeled FAIL`}
            hint="Held-back work that was right to hold"
          />
          <Metric
            icon={<GitCompare className="h-4 w-4" />}
            label="Overall agreement"
            value={pct(stats.agreementRate)}
            sub={`pass rate ${pct(stats.passRate)}`}
            hint="Gate and human reached the same call"
          />
        </div>
      ) : (
        <p className="mt-5 rounded-lg bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-ink-muted)]">
          Not enough labeled decisions yet. Precision appears here once orders
          have passed the gate and been approved or sent back, so the numbers
          stay honest instead of estimated.
        </p>
      )}
    </Card>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-muted)]">
        <span className="text-[var(--color-sage-deep)]">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
        {value}
      </div>
      <div className="mt-1 text-xs text-[var(--color-ink-faint)]">{sub}</div>
      <div className="mt-2 text-xs text-[var(--color-ink-muted)]">{hint}</div>
    </div>
  );
}

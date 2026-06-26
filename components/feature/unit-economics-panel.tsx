import { Repeat, Timer, Percent, Bot, Calculator } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils";
import { COST_ASSUMPTIONS } from "@/lib/constants";
import type { BusinessMetrics } from "@/lib/metrics/business";

/**
 * Investor-grade unit economics. The first four tiles are measured from real
 * data (or an honest "--" until there is enough); the contribution margin is
 * a transparent model whose cost assumptions are printed below it, so it is
 * never mistaken for a measured figure.
 */
export function UnitEconomicsPanel({
  metrics,
  className,
}: {
  metrics: BusinessMetrics;
  className?: string;
}) {
  const pct = (v: number | null) =>
    v == null ? "--" : `${Math.round(v * 100)}%`;
  const days = (v: number | null) =>
    v == null ? "--" : `${v.toFixed(v < 10 ? 1 : 0)}d`;

  const cm = metrics.contributionMargin;

  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <CardTitle>Unit economics</CardTitle>
        <Badge tone="neutral">measured + modeled</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile
          icon={<Repeat className="h-4 w-4" />}
          label="Repeat-client rate"
          value={pct(metrics.repeatClientRate)}
          hint="Clients with 2+ completed orders"
        />
        <Tile
          icon={<Timer className="h-4 w-4" />}
          label="Time to first order"
          value={days(metrics.medianDaysToFirstOrder)}
          hint="Median, signup to first order"
        />
        <Tile
          icon={<Percent className="h-4 w-4" />}
          label="Take rate"
          value={pct(metrics.takeRate)}
          hint="Net revenue over GMV"
        />
        <Tile
          icon={<Bot className="h-4 w-4" />}
          label="Gate precision"
          value={pct(metrics.gatePrecision)}
          hint="PASS verdicts the client kept"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-muted)]">
          <Calculator className="h-4 w-4 text-[var(--color-sage-deep)]" />
          Contribution margin per order
          <Badge tone="yellow">modeled</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="font-display text-3xl font-medium tabular-nums text-[var(--color-ink)]">
            {pct(cm.marginRate)}
          </span>
          <span className="text-sm text-[var(--color-ink-muted)]">
            {formatINR(Math.round(cm.marginPerOrder))} on an average order of{" "}
            {formatINR(Math.round(metrics.avgOrderValue))}
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--color-ink-faint)]">
          Revenue {formatINR(Math.round(cm.revenuePerOrder))} (commission), less
          modeled variable cost {formatINR(Math.round(cm.variableCostPerOrder))}.
          Assumptions: payment processing{" "}
          {Math.round(COST_ASSUMPTIONS.paymentProcessingRate * 100)}% of order,
          gate {formatINR(COST_ASSUMPTIONS.gateCostPerOrder)}, payout{" "}
          {formatINR(COST_ASSUMPTIONS.payoutFeePerOrder)}. Replace with measured
          costs once a cost ledger exists.
        </p>
      </div>
    </Card>
  );
}

function Tile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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
      <div className="mt-1 text-xs text-[var(--color-ink-faint)]">{hint}</div>
    </div>
  );
}

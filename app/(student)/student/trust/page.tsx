import { ShieldCheck, TrendingUp, TrendingDown, Lock, Unlock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTrustBreakdown, listTrustHistory } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { nextTier, TIER_BUDGET_CEILING } from "@/lib/trust/score";
import { TRUST_TIERS } from "@/lib/constants";
import { formatINR, cn } from "@/lib/utils";
import type { TrustTier } from "@/lib/types";

export const metadata = { title: "Trust score" };

const TIER_TONE: Record<TrustTier, "warning" | "neutral" | "trust" | "brand"> = {
  bronze: "warning",
  silver: "neutral",
  gold: "trust",
  platinum: "brand",
};

export default async function TrustPage() {
  const me = currentStudent();
  const breakdown = await getTrustBreakdown(me.id);
  const history = await listTrustHistory();
  if (!breakdown) return null;

  const next = nextTier(breakdown.score);
  const ceiling = TIER_BUDGET_CEILING[breakdown.tier];

  return (
    <>
      <PageHeader
        title="Trust score"
        subtitle="The single number clients trust. It gates higher-budget work and earns your tier."
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Score + tier */}
        <aside className="space-y-4">
          <Card className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-brand-gradient text-white">
              <div>
                <div className="text-3xl font-semibold leading-none">{breakdown.score}</div>
                <div className="text-[11px] opacity-80">/ 100</div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <Badge tone={TIER_TONE[breakdown.tier]} className="capitalize">
                {breakdown.tier} tier
              </Badge>
            </div>
            {next ? (
              <p className="mt-3 text-xs text-muted">
                <strong className="text-foreground">{next.pointsAway} points</strong> to{" "}
                {next.name}.
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted">Top tier. Keep it up.</p>
            )}
          </Card>

          <Card>
            <CardTitle>Tiers &amp; what they unlock</CardTitle>
            <ul className="mt-3 space-y-2">
              {TRUST_TIERS.map((t) => {
                const tier = t.name.toLowerCase() as TrustTier;
                const reached = breakdown.score >= t.min;
                const cap = TIER_BUDGET_CEILING[tier];
                return (
                  <li
                    key={t.name}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                      tier === breakdown.tier ? "bg-brand-100" : "bg-surface-muted"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {reached ? (
                        <Unlock className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-subtle" />
                      )}
                      <span className="font-medium capitalize">{t.name}</span>
                      <span className="text-xs text-subtle">{t.min}+</span>
                    </span>
                    <span className="text-xs text-muted">
                      {cap === Infinity ? "Any budget" : `up to ${formatINR(cap)}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>

        {/* Breakdown + history */}
        <div className="space-y-6">
          <Card>
            <CardTitle>How your score is calculated</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Four weighted signals. Improve any one and your score moves the next time an
              order completes.
            </p>
            <div className="mt-4 space-y-4">
              {breakdown.components.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted">
                      {c.value}/100 · weight {Math.round(c.weight * 100)}% ·{" "}
                      <span className="font-medium text-foreground">+{c.contribution}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className="h-full rounded-full bg-brand-gradient"
                      style={{ width: `${c.value}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-subtle">{c.hint}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-lg bg-surface-muted p-3 text-xs text-muted">
              Your tier currently lets you accept jobs{" "}
              {ceiling === Infinity ? "of any budget" : `up to ${formatINR(ceiling)}`}. Higher
              tiers unlock higher-value work.
            </p>
          </Card>

          <div>
            <CardTitle>Recent movements</CardTitle>
            <Card className="mt-3 divide-y divide-border p-0">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        h.delta >= 0 ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
                      )}
                    >
                      {h.delta >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{h.reason}</div>
                      <div className="text-xs text-muted">{h.ago}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        h.delta >= 0 ? "text-success" : "text-danger"
                      )}
                    >
                      {h.delta >= 0 ? "+" : ""}
                      {h.delta}
                    </div>
                    <div className="text-xs text-subtle">{h.score}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

import { ShieldCheck, TrendingUp, TrendingDown, Lock, Unlock } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardTitle } from "@/components/ui/card";
import { TrustTierBadge } from "@/components/ui/trust-tier-badge";
import { Money } from "@/components/ui/money";
import { getTrustBreakdown, listTrustHistory } from "@/lib/data/queries";
import { currentStudent } from "@/lib/auth/session";
import { nextTier, TIER_BUDGET_CEILING } from "@/lib/trust/score";
import { TRUST_TIERS } from "@/lib/constants";
import type { TrustTier } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata = { title: "Trust score" };

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
        eyebrow="Earned trust"
        title="Trust score."
        subtitle="The single number clients trust. It gates higher-budget work and earns your tier."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Score ring */}
        <aside className="space-y-6">
          <Card surface="glow" className="text-center">
            <div className="relative mx-auto h-44 w-44">
              <svg
                viewBox="0 0 100 100"
                className="h-full w-full -rotate-90"
                role="img"
                aria-label={`Trust score: ${breakdown.score} of 100, ${breakdown.tier} tier`}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="var(--color-surface-warm)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="var(--color-sage-deep)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(breakdown.score / 100) * 276.46} 276.46`}
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-display text-5xl font-medium tabular-nums text-[var(--color-ink)]">
                  {breakdown.score}
                </div>
                <div className="text-xs text-[var(--color-ink-faint)]">/ 100</div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--color-sage-deep)]" />
              <TrustTierBadge tier={breakdown.tier} />
            </div>
            {next ? (
              <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
                <span className="font-semibold text-[var(--color-ink)]">
                  {next.pointsAway} points
                </span>{" "}
                to {next.name}.
              </p>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-ink-muted)]">
                Top tier. Keep it up.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Tiers and what they unlock</CardTitle>
            <ul className="mt-4 space-y-2">
              {TRUST_TIERS.map((t) => {
                const tier = t.name.toLowerCase() as TrustTier;
                const reached = breakdown.score >= t.min;
                const cap = TIER_BUDGET_CEILING[tier];
                return (
                  <li
                    key={t.name}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm",
                      tier === breakdown.tier
                        ? "bg-[var(--color-sage-50)] ring-1 ring-[var(--color-sage-300)]"
                        : "bg-[var(--color-surface-warm)]"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {reached ? (
                        <Unlock className="h-3.5 w-3.5 text-[var(--color-sage-deep)]" />
                      ) : (
                        <Lock className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />
                      )}
                      <span className="font-medium text-[var(--color-ink)]">{t.name}</span>
                      <span className="text-xs text-[var(--color-ink-faint)]">{t.min}+</span>
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      {cap === Infinity ? (
                        "Any budget"
                      ) : (
                        <>up to <Money value={cap} compact /></>
                      )}
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
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Four weighted signals. Improve any one and your score moves the next
              time an order completes.
            </p>
            <div className="mt-6 space-y-5">
              {breakdown.components.map((c) => (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[var(--color-ink)]">{c.label}</span>
                    <span className="text-[var(--color-ink-muted)]">
                      {c.value}/100 · weight {Math.round(c.weight * 100)}% ·{" "}
                      <span className="font-medium text-[var(--color-ink)]">
                        +{c.contribution}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-surface-warm)]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--color-sage)] to-[var(--color-sage-deep)]"
                      style={{ width: `${c.value}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--color-ink-faint)]">{c.hint}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 rounded-2xl bg-[var(--color-surface-warm)] p-4 text-xs leading-relaxed text-[var(--color-ink-muted)]">
              Your tier currently lets you accept jobs{" "}
              {ceiling === Infinity ? (
                "of any budget"
              ) : (
                <>up to <Money value={ceiling} compact /></>
              )}
              . Higher tiers unlock higher-value work.
            </p>
          </Card>

          <div>
            <h2 className="mb-3 font-display text-xl font-medium text-[var(--color-ink)]">
              Recent movements
            </h2>
            <Card className="divide-y divide-[var(--color-line)] p-0">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        h.delta >= 0
                          ? "bg-[var(--color-sage-100)] text-[var(--color-sage-900)]"
                          : "bg-[var(--color-danger-soft)] text-[var(--color-danger-deep)]"
                      )}
                    >
                      {h.delta >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-[var(--color-ink)]">
                        {h.reason}
                      </div>
                      <div className="text-xs text-[var(--color-ink-muted)]">{h.ago}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        "font-display text-lg tabular-nums",
                        h.delta >= 0
                          ? "text-[var(--color-sage-900)]"
                          : "text-[var(--color-danger-deep)]"
                      )}
                    >
                      {h.delta >= 0 ? "+" : ""}
                      {h.delta}
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)]">{h.score}</div>
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

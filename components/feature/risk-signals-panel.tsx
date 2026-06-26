import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RiskAssessment, RiskLevel } from "@/lib/fraud/signals";

const TONE: Record<RiskLevel, "danger" | "orange" | "neutral"> = {
  high: "danger",
  elevated: "orange",
  low: "neutral",
};

/**
 * Advisory fraud-risk view. Lists accounts the signal engine flagged, most
 * severe first. These are prompts for a human to look, never automatic
 * actions: nothing here blocks, holds, or penalises anyone. An empty list is
 * an honest "nothing to review", not a hidden failure.
 */
export function RiskSignalsPanel({
  flags,
  className,
}: {
  flags: RiskAssessment[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-orange-100)] text-[var(--color-orange-900)]">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <CardTitle>Risk signals</CardTitle>
            <div className="text-xs text-[var(--color-ink-muted)]">
              Advisory only. Flags for review; nothing is auto-blocked.
            </div>
          </div>
        </div>
        <Badge tone="neutral">{flags.length} flagged</Badge>
      </div>

      {flags.length === 0 ? (
        <div className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-ink-muted)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--color-sage-deep)]" />
          No accounts are tripping a risk signal right now.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {flags.map((f) => (
            <li
              key={f.accountId}
              className="rounded-2xl border border-[var(--color-line)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-[var(--color-ink)]">
                  {f.label ?? f.accountId}
                </span>
                <Badge tone={TONE[f.level]}>{f.level}</Badge>
              </div>
              <ul className="mt-2 space-y-1.5">
                {f.signals.map((s) => (
                  <li
                    key={s.code}
                    className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--color-orange)]" />
                    <span>
                      <span className="font-medium text-[var(--color-ink)]">
                        {s.label}:
                      </span>{" "}
                      {s.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

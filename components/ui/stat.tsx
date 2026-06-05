import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  /** Optional accent for the value digit. */
  accent?: "ink" | "sage" | "orange" | "yellow";
  /** Optional small icon shown next to the label. */
  icon?: React.ReactNode;
}

const accentColor = {
  ink: "text-[var(--color-ink)]",
  sage: "text-[var(--color-sage-700)]",
  orange: "text-[var(--color-orange-700)]",
  yellow: "text-[var(--color-yellow-700)]",
} as const;

export function Stat({ label, value, sub, accent = "ink", icon }: StatProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className={cn(
          "mt-3 font-display text-3xl font-medium tabular-nums tracking-tight",
          accentColor[accent]
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-[var(--color-ink-faint)]">{sub}</div>}
    </Card>
  );
}

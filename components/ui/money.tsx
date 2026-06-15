import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MoneyProps {
  value: number;
  /** Show as a range, e.g. ₹6k - ₹10k. */
  to?: number;
  /** Compact form (₹6k) vs full (₹6,000). */
  compact?: boolean;
  className?: string;
}

export function compactINR(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `₹${amount}`;
}

export function Money({ value, to, compact, className }: MoneyProps) {
  const fmt = compact ? compactINR : formatINR;
  return (
    <span className={cn("font-medium tabular-nums text-[var(--color-ink)]", className)}>
      {to == null ? fmt(value) : `${fmt(value)} - ${fmt(to)}`}
    </span>
  );
}

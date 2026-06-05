import { ShieldCheck, Award, Gem, Star } from "lucide-react";
import type { TrustTier } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TrustTierBadgeProps {
  tier: TrustTier;
  size?: "sm" | "md";
  withLabel?: boolean;
  className?: string;
}

const TIER = {
  bronze: {
    label: "Bronze",
    icon: ShieldCheck,
    classes:
      "bg-[var(--color-brown-100)] text-[var(--color-brown-700)] border-[var(--color-brown-300)]",
  },
  silver: {
    label: "Silver",
    icon: Star,
    classes:
      "bg-[var(--color-surface-warm)] text-[var(--color-ink)] border-[var(--color-line-strong)]",
  },
  gold: {
    label: "Gold",
    icon: Award,
    classes:
      "bg-[var(--color-yellow-50)] text-[var(--color-yellow-900)] border-[var(--color-yellow-200)]",
  },
  platinum: {
    label: "Platinum",
    icon: Gem,
    classes:
      "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] border-[var(--color-sage-300)]",
  },
} as const;

export function TrustTierBadge({ tier, size = "md", withLabel = true, className }: TrustTierBadgeProps) {
  const t = TIER[tier];
  const Icon = t.icon;
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium tracking-tight",
        sizeClass,
        t.classes,
        className
      )}
    >
      <Icon className={iconSize} />
      {withLabel && t.label}
    </span>
  );
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight border",
  {
    variants: {
      tone: {
        brand: "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] border-[var(--color-sage-200)]",
        trust: "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] border-[var(--color-sage-200)]",
        sage: "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] border-[var(--color-sage-200)]",
        yellow: "bg-[var(--color-yellow-50)] text-[var(--color-yellow-900)] border-[var(--color-yellow-200)]",
        orange: "bg-[var(--color-orange-50)] text-[var(--color-orange-900)] border-[var(--color-orange-200)]",
        warning: "bg-[var(--color-orange-50)] text-[var(--color-orange-900)] border-[var(--color-orange-200)]",
        danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger-deep)] border-[color-mix(in_oklab,var(--color-danger)_30%,transparent)]",
        success: "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] border-[var(--color-sage-200)]",
        info: "bg-[var(--color-cream-deep)] text-[var(--color-brown)] border-[var(--color-line-strong)]",
        neutral: "bg-[var(--color-surface-warm)] text-[var(--color-ink-muted)] border-[var(--color-line)]",
        dark: "bg-[var(--color-brown)] text-[var(--color-cream)] border-[var(--color-brown-900)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

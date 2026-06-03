import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        brand: "bg-brand-100 text-brand-700",
        trust: "bg-trust-100 text-trust-700",
        info: "bg-info-bg text-info",
        warning: "bg-warning-bg text-warning",
        danger: "bg-danger-bg text-danger",
        success: "bg-success-bg text-success",
        neutral: "bg-surface-muted text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

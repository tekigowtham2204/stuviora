import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `flat` = no shadow, `raised` = card shadow (default), `glow` = extra-soft warm glow. */
  surface?: "flat" | "raised" | "glow";
  /** `cream` = warm surface, `white` = pure surface (default). */
  tint?: "white" | "cream" | "sage" | "warm";
}

const tintClass = {
  white: "bg-[var(--color-surface)]",
  cream: "bg-[var(--color-surface-muted)]",
  sage: "bg-[var(--color-sage-50)]",
  warm: "bg-[var(--color-surface-warm)]",
} as const;

const surfaceClass = {
  flat: "",
  raised: "shadow-[var(--shadow-card)]",
  glow: "shadow-[var(--shadow-card-lg)]",
} as const;

export function Card({ className, surface = "raised", tint = "white", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-line)] p-6",
        tintClass[tint],
        surfaceClass[surface],
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold tracking-tight text-[var(--color-ink)]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-sm leading-relaxed text-[var(--color-ink-muted)]", className)}
      {...props}
    />
  );
}

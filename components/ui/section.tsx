import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Vertical rhythm: tight, comfortable (default), generous. */
  spacing?: "tight" | "default" | "generous";
  /** Background variant. */
  tone?: "cream" | "white" | "warm" | "dark";
}

const spacingClass = {
  tight: "py-12",
  default: "py-16 sm:py-20",
  generous: "py-24 sm:py-32",
} as const;

const toneClass = {
  cream: "bg-[var(--color-background)]",
  white: "bg-[var(--color-surface)]",
  warm: "bg-[var(--color-surface-warm)]",
  dark: "bg-[var(--color-brown)] text-[var(--color-cream)]",
} as const;

export function Section({
  className,
  spacing = "default",
  tone = "cream",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(spacingClass[spacing], toneClass[tone], className)}
      {...props}
    />
  );
}

export function SectionEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--color-ink-muted)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  className,
  as: As = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <As
      className={cn(
        "mt-3 font-display text-balance text-3xl font-medium tracking-tight text-[var(--color-ink)] sm:text-4xl",
        className
      )}
    >
      {children}
    </As>
  );
}

export function SectionLede({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "mt-4 max-w-xl text-pretty text-base leading-relaxed text-[var(--color-ink-muted)]",
        className
      )}
    >
      {children}
    </p>
  );
}

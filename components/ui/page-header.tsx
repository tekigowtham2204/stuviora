import * as React from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  /** Small kicker text shown above the title, in uppercase. */
  eyebrow?: string;
}

export function PageHeader({ title, subtitle, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-ink-muted)]">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-medium tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

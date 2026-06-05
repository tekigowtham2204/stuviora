import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <Card
      tint="warm"
      surface="flat"
      className={cn("flex flex-col items-center gap-3 py-12 text-center", className)}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-sage-100)] text-[var(--color-sage-700)]">
          {icon}
        </div>
      )}
      <div className="font-display text-xl text-[var(--color-ink)]">{title}</div>
      {body && (
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-ink-muted)]">{body}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </Card>
  );
}

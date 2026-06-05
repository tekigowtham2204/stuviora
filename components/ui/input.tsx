import * as React from "react";
import { cn } from "@/lib/utils";

const baseClass =
  "w-full rounded-xl border border-[var(--color-line-strong)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] transition-colors focus:border-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)]/15 disabled:opacity-60";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseClass, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(baseClass, "min-h-[120px] py-3", className)} {...props} />;
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        baseClass,
        "h-12 appearance-none bg-[image:linear-gradient(45deg,transparent_50%,var(--color-ink-muted)_50%),linear-gradient(135deg,var(--color-ink-muted)_50%,transparent_50%)] bg-[length:5px_5px,5px_5px] bg-[position:calc(100%-15px)_calc(50%-2px),calc(100%-10px)_calc(50%-2px)] bg-no-repeat pr-10",
        className
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-[var(--color-ink)]",
        className
      )}
      {...props}
    />
  );
}

export function FieldHint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1.5 text-xs text-[var(--color-ink-muted)]",
        className
      )}
      {...props}
    />
  );
}

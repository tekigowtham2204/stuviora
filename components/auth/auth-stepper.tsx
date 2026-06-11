import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Verify email", "Build profile", "First match"] as const;

/**
 * Compact progress row shown across the auth surfaces so a first-time
 * student knows what comes after signup (audit #6). `current` is the
 * zero-based index of the active step.
 */
export function AuthStepper({ current = 0 }: { current?: number }) {
  return (
    <ol className="mb-6 flex items-center justify-center gap-2 text-xs">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium tracking-tight",
                active &&
                  "bg-[var(--color-sage-50)] text-[var(--color-sage-900)] ring-1 ring-[var(--color-sage-200)]",
                done && "text-[var(--color-sage-900)]",
                !active && !done && "text-[var(--color-ink-faint)]"
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Check className="h-3 w-3" aria-hidden />
              ) : (
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px] tabular-nums",
                    active
                      ? "bg-[var(--color-sage)] text-[var(--color-brown-900)]"
                      : "bg-[var(--color-surface-warm)] text-[var(--color-ink-faint)]"
                  )}
                  aria-hidden
                >
                  {i + 1}
                </span>
              )}
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="h-px w-4 bg-[var(--color-line-strong)]"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

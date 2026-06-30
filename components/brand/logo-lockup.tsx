import * as React from "react";
import { cn } from "@/lib/utils";
import { Logomark } from "@/components/brand/logomark";
import { Wordmark } from "@/components/brand/wordmark";

interface LogoLockupProps {
  /** `horizontal` (mark beside word) or `stacked` (mark above word). */
  orientation?: "horizontal" | "stacked";
  /** Seal color passed through to the mark; defaults to the sage token. */
  accent?: string;
  /** Force a single color across mark + word. */
  mono?: boolean;
  className?: string;
  /** Tailwind size for the mark (height + width). */
  markClassName?: string;
  /** Tailwind size for the wordmark text. */
  wordClassName?: string;
}

/**
 * The primary Stuviora logo lockup: the Gate Seal mark composed with the
 * Fraunces wordmark. Clear space is baked in as the gap so the two never
 * crowd. Use `horizontal` in headers/footers and `stacked` for auth,
 * narrow, and receipt-header contexts.
 *
 * Color follows currentColor for the wordmark and `accent` for the seal,
 * so dropping the lockup onto a brown block (text-cream) or a cream block
 * (text-ink) just works.
 */
export function LogoLockup({
  orientation = "horizontal",
  accent = "var(--color-sage)",
  mono = false,
  className,
  markClassName,
  wordClassName,
}: LogoLockupProps) {
  return (
    <span
      className={cn(
        "inline-flex select-none",
        orientation === "horizontal"
          ? "flex-row items-center gap-2.5"
          : "flex-col items-center gap-3",
        className,
      )}
    >
      <Logomark
        accent={accent}
        mono={mono}
        className={cn("h-8 w-8", markClassName)}
      />
      <Wordmark className={cn("text-xl", wordClassName)} />
    </span>
  );
}

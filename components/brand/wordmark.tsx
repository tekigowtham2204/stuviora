import * as React from "react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/constants";

interface WordmarkProps {
  className?: string;
  /** Optional color override; defaults to currentColor (inherits ink/cream). */
  tone?: string;
  /** Render as an h1 on hero surfaces; defaults to a span. */
  as?: "span" | "h1" | "div";
}

/**
 * Stuviora wordmark. Set in Fraunces (the display font, loaded as
 * `--font-display` in app/layout.tsx) with tightened tracking and a soft
 * optical weight so the word owns itself rather than just being typed. Pair
 * with the Logomark via LogoLockup; use standalone where the mark would be
 * redundant.
 */
export function Wordmark({ className, tone, as: As = "span" }: WordmarkProps) {
  return (
    <As
      className={cn(
        "font-display font-medium tracking-[-0.02em] leading-none",
        className,
      )}
      style={tone ? { color: tone } : undefined}
    >
      {BRAND.name}
    </As>
  );
}

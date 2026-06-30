import * as React from "react";

interface LogomarkProps extends React.SVGProps<SVGSVGElement> {
  /** Outer-band color (the widest arc of the aurora). Call sites pass the
   *  sage token; defaults to currentColor so the mark still renders in one
   *  color when omitted. */
  accent?: string;
  /** Collapse the whole mark to a single color (favicon, embossing, and
   *  one-color print). Every band and the horizon follow currentColor. */
  mono?: boolean;
  /**
   * - `full`  three aurora bands + horizon (default; the brand mark).
   * - `mark`  two bands + horizon (cleanest at favicon sizes).
   * - `stamp` adds the outer seal ring; for the receipt verdict header.
   */
  variant?: "full" | "mark" | "stamp";
}

/**
 * Stuviora logomark: "The Aurora".
 *
 * The idea is hidden in the name: Stu-VIORA -> aurora, the dawn. The mark is
 * a sunrise of warm light lifting over a steady horizon: bands of sage, gold,
 * and amber rising off a brown ground line. It reads as the dawn of a
 * student's career and the warm field ("aura") around their work; the horizon
 * line is the quiet trust anchor underneath.
 *
 * Multi-tone by default (outer = `accent`, then yellow, then orange; the
 * horizon follows currentColor so it inherits ink on light and cream on
 * dark). `mono` collapses everything to currentColor; `stamp` adds the seal
 * ring used on verdict receipts.
 */
export function Logomark({
  accent = "currentColor",
  mono = false,
  variant = "full",
  className,
  ...props
}: LogomarkProps) {
  const outer = mono ? "currentColor" : accent;
  const mid = mono ? "currentColor" : "var(--color-yellow)";
  const inner = mono ? "currentColor" : "var(--color-orange)";
  const showMid = variant !== "mark";
  const showRing = variant === "stamp";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Seal ring: the official-stamp border on verdict receipts. */}
      {showRing && (
        <circle
          cx="16"
          cy="16"
          r="14.5"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
      )}

      {/* Outer band of the aurora. */}
      <path
        d="M4 22 A12 12 0 0 1 28 22"
        stroke={outer}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Middle band (dropped in the compact `mark` variant). */}
      {showMid && (
        <path
          d="M8 22 A8 8 0 0 1 24 22"
          stroke={mid}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )}

      {/* Inner band: the warm core of the dawn. */}
      <path
        d="M12 22 A4 4 0 0 1 20 22"
        stroke={inner}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Horizon: the steady trust line the dawn rises over. */}
      <path
        d="M4 22 H28"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

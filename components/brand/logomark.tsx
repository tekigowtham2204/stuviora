import * as React from "react";

interface LogomarkProps extends React.SVGProps<SVGSVGElement> {
  /** Seal-ring color. Existing call sites pass the sage token; defaults to
   *  currentColor so the mark still renders as one color when omitted. */
  accent?: string;
  /** Spark color. Defaults to the warm orange token; ignored when `mono`. */
  spark?: string;
  /** Collapse to a single color (seal + spark follow currentColor). Use for
   *  favicons, embossing, and one-color print. */
  mono?: boolean;
  /**
   * - `full`  seal + check + spark (default; the brand mark).
   * - `mark`  seal + check only, no spark (cleanest at favicon sizes).
   * - `stamp` adds the outer "official stamp" ring; for the receipt PASS seal.
   */
  variant?: "full" | "mark" | "stamp";
}

/**
 * Stuviora logomark: "The Gate Seal".
 *
 * A protective seal (trust, escrow) with a deliberate gate-opening at the
 * top-right through which a verified check passes, resolving in a spark.
 * The mark encodes the moat in one glyph: the seal is "Trust the platform",
 * the gap is the AI quality gate, the check is PASS, the spark is the
 * student's brilliance emerging ("Viora").
 *
 * Two-tone by default (seal = `accent`, check = currentColor, spark =
 * `spark`); degrades cleanly to one color via `mono`. The check reads as
 * "approved" down to 16px, and the `stamp` variant doubles as the PASS
 * seal on verdict receipts.
 */
export function Logomark({
  accent = "currentColor",
  spark = "var(--color-orange)",
  mono = false,
  variant = "full",
  className,
  ...props
}: LogomarkProps) {
  const sealColor = mono ? "currentColor" : accent;
  const sparkColor = mono ? "currentColor" : spark;
  const showSpark = variant !== "mark";
  const showStampRing = variant === "stamp";

  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Optional outer ring: the "official stamp" double edge. */}
      {showStampRing && (
        <path
          d="M30.5 11 V21 A10.5 10.5 0 0 1 21 30.5 H11 A10.5 10.5 0 0 1 1.5 21 V11 A10.5 10.5 0 0 1 11 1.5 H21 A10.5 10.5 0 0 1 30.5 11 Z"
          stroke={sealColor}
          strokeWidth="1"
          opacity="0.55"
        />
      )}

      {/* The seal: a rounded-square ring left open at the top-right (the gate). */}
      <path
        d="M28 13 V19 A9 9 0 0 1 19 28 H13 A9 9 0 0 1 4 19 V13 A9 9 0 0 1 13 4 H18"
        stroke={sealColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* S — left letter of the SV monogram. */}
      <path
        d="M12 9 C12 6 6 6 6 11 C6 15 12 15 12 19 C12 23 6 23 6 21"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* V — right letter; arm exits through the gate notch. */}
      <path
        d="M15 9 L20.5 23 L26 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The spark: brilliance emerging where the check clears the gate. */}
      {showSpark && (
        <path
          d="M26 3.4 C26 5.6 26.4 6 28.6 6 C26.4 6 26 6.4 26 8.6 C26 6.4 25.6 6 23.4 6 C25.6 6 26 5.6 26 3.4 Z"
          fill={sparkColor}
        />
      )}
    </svg>
  );
}

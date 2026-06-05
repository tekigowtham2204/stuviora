import * as React from "react";

interface LogomarkProps extends React.SVGProps<SVGSVGElement> {
  /** Optional duotone. When set, the leaf fill uses this accent. */
  accent?: string;
}

/**
 * Stuviora logomark. A stylized leaf-and-arc — the student (leaf) growing
 * inside the platform's protective curve (arc). Two-tone friendly.
 */
export function Logomark({ accent = "currentColor", className, ...props }: LogomarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M4 16C4 9.373 9.373 4 16 4c5.523 0 10 4.477 10 10v14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M16 22c0-4 2.5-7 6-7-1 3.5-3.5 6-6 7Z"
        fill={accent}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="22" r="1.6" fill="currentColor" />
    </svg>
  );
}

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,background-color,color,box-shadow] duration-150 ease-out-strong active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        /* Primary CTA: warm orange. Ink text for AA contrast. */
        primary:
          "bg-[var(--color-orange)] text-[var(--color-brown-900)] hover:bg-[var(--color-orange-deep)] hover:shadow-[var(--shadow-glow-orange)]",
        /* Secondary: outline on cream. */
        secondary:
          "border border-[var(--color-ink)] bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)]",
        /* Sage variant for trust/student-portal actions. */
        sage:
          "bg-[var(--color-sage)] text-[var(--color-brown-900)] hover:bg-[var(--color-sage-deep)] hover:shadow-[var(--shadow-glow-sage)]",
        /* Yellow variant for earnings / premium actions. */
        yellow:
          "bg-[var(--color-yellow)] text-[var(--color-brown-900)] hover:bg-[var(--color-yellow-deep)]",
        /* Dark for admin / contrast surfaces. */
        dark:
          "bg-[var(--color-brown)] text-[var(--color-cream)] hover:bg-[var(--color-brown-900)]",
        outline:
          "border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]",
        ghost:
          "text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]",
        /* Kept for back-compat with the old "trust" variant usage. */
        trust:
          "bg-[var(--color-sage-deep)] text-[var(--color-cream)] hover:bg-[var(--color-sage-700)]",
        gradient:
          "bg-warm-gradient text-[var(--color-brown-900)] hover:opacity-95",
      },
      size: {
        sm: "h-9 px-4 text-sm rounded-full",
        md: "h-11 px-5 text-sm rounded-full",
        lg: "h-13 px-7 text-base rounded-full py-3.5",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { href?: string };

export function Button({ className, variant, size, href, ...props }: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (href) {
    return <Link href={href} className={classes} {...(props as Record<string, unknown>)} />;
  }
  return <button className={classes} {...props} />;
}

export { buttonVariants };

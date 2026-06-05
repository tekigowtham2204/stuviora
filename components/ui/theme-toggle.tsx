"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dark/light toggle.
 *
 * `suppressHydrationWarning` is on the icon wrapper because next-themes
 * resolves the active theme from localStorage on the client; the server-
 * rendered tree always picks the default (light), and the client may flip
 * to dark on hydration. Suppressing the warning here is the documented
 * next-themes pattern and avoids a state-in-effect lint violation under
 * React 19's stricter purity rules.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-lg",
        "text-muted transition-[transform,background-color,color] duration-200 ease-out-strong",
        "hover:bg-[var(--color-surface-muted)] hover:text-foreground active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400",
        className
      )}
    >
      <span suppressHydrationWarning className="inline-flex h-4 w-4 items-center justify-center">
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider for Stuviora.
 * - Light is the brand default (warm cream + sage/orange/yellow).
 * - Dark is the warm-night variant (deep brown background).
 * - Class strategy so Tailwind v4's `.dark` selector and our CSS vars switch together.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

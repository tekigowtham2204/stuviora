"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Theme provider for Stuviora.
 * - Dark is the cinematic default; light is editorial-premium.
 * - We DO honor system preference; users can override with the toggle.
 * - Class strategy so Tailwind v4's `.dark` selector and our CSS vars switch together.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

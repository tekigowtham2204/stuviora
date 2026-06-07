import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Vitest config for Stuviora.
 *
 * Unit tests live in `lib/<domain>/__tests__/*.test.ts`. They exercise
 * pure engines (trust, matching, pricing, tax, disputes, teams) plus the
 * data mappers.
 *
 * Integration tests against a local Supabase (`supabase start`) live in
 * `lib/data/__tests__/queries.integration.test.ts` and are skipped when
 * `SUPABASE_URL` is not set.
 *
 * Playwright E2E lives outside vitest (separate runner) in `e2e/`.
 */
export default defineConfig({
  test: {
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "playwright-report", "e2e"],
    environment: "node",
    globals: false,
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.test.ts", "lib/**/__tests__/**", "lib/demo/**"],
      thresholds: {
        // Lifted as more libs gain coverage. P0 starts at the pure engines.
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

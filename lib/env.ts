/**
 * Centralized environment + runtime-mode configuration.
 *
 * Stuviora integrates several external services (Supabase, Razorpay, Claude,
 * Resend, Inngest). To let the full product run locally before live keys exist,
 * each integration checks `isConfigured(...)`. When a service is not configured,
 * the app falls back to a deterministic DEMO implementation so the entire core
 * loop is demonstrable end-to-end without credentials.
 */

function read(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

export const env = {
  appUrl: read("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",

  supabaseUrl: read("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: read("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceKey: read("SUPABASE_SERVICE_ROLE_KEY"),

  razorpayKeyId: read("RAZORPAY_KEY_ID"),
  razorpayKeySecret: read("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: read("RAZORPAY_WEBHOOK_SECRET"),

  anthropicApiKey: read("ANTHROPIC_API_KEY"),
  resendApiKey: read("RESEND_API_KEY"),
  inngestEventKey: read("INNGEST_EVENT_KEY"),

  sessionSecret: read("SESSION_SECRET") ?? "stuviora-dev-secret-change-me",
} as const;

export const services = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  razorpay: Boolean(env.razorpayKeyId && env.razorpayKeySecret),
  anthropic: Boolean(env.anthropicApiKey),
  resend: Boolean(env.resendApiKey),
  inngest: Boolean(env.inngestEventKey),
} as const;

/**
 * DEMO_MODE is on whenever the database isn't wired up. In demo mode the app
 * serves seeded data and simulates payments + AI review so the product is
 * fully clickable. Set the Supabase env vars to switch to live mode.
 */
export const DEMO_MODE = !services.supabase;

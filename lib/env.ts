/**
 * Centralized environment + runtime-mode configuration.
 *
 * Stuviora integrates several external services (Supabase, Razorpay, Groq,
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
  // Accepts either Supabase key format: the legacy JWT anon key or the new
  // `sb_publishable_...` key (Supabase's new API-key system). Both authorize
  // the public client at the `anon` RLS role, so either works here.
  supabaseAnonKey:
    read("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
    read("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  supabaseServiceKey: read("SUPABASE_SERVICE_ROLE_KEY"),

  razorpayKeyId: read("RAZORPAY_KEY_ID"),
  razorpayKeySecret: read("RAZORPAY_KEY_SECRET"),
  razorpayWebhookSecret: read("RAZORPAY_WEBHOOK_SECRET"),

  anthropicApiKey: read("ANTHROPIC_API_KEY"),
  // Groq is the primary LLM provider (OpenAI-compatible API, open-weight
  // models). Per-tier model ids are env-overridable since Groq's catalogue
  // changes; the defaults below are real Groq model ids at time of writing,
  // but confirm against console.groq.com/docs/models before go-live.
  groqApiKey: read("GROQ_API_KEY"),
  groqModelFast: read("GROQ_MODEL_FAST") ?? "llama-3.1-8b-instant",
  groqModelBalanced: read("GROQ_MODEL_BALANCED") ?? "llama-3.3-70b-versatile",
  groqModelMax:
    read("GROQ_MODEL_MAX") ?? "meta-llama/llama-4-maverick-17b-128e-instruct",
  openrouterApiKey: read("OPENROUTER_API_KEY"),
  openrouterModel: read("OPENROUTER_MODEL") ?? "anthropic/claude-sonnet-4.5",
  openrouterAppName: read("OPENROUTER_APP_NAME") ?? "Stuviora",
  openrouterAppUrl: read("OPENROUTER_APP_URL") ?? "https://stuviora.com",
  resendApiKey: read("RESEND_API_KEY"),
  resendFrom: read("RESEND_FROM") ?? "Stuviora <noreply@stuviora.com>",
  inngestEventKey: read("INNGEST_EVENT_KEY"),
  inngestSigningKey: read("INNGEST_SIGNING_KEY"),

  upstashUrl: read("UPSTASH_REDIS_REST_URL"),
  upstashToken: read("UPSTASH_REDIS_REST_TOKEN"),
  meilisearchHost: read("MEILISEARCH_HOST"),
  meilisearchKey: read("MEILISEARCH_KEY"),
  sentryDsn: read("SENTRY_DSN"),
  posthogKey: read("NEXT_PUBLIC_POSTHOG_KEY"),
  posthogHost: read("NEXT_PUBLIC_POSTHOG_HOST") ?? "https://us.i.posthog.com",

  sessionSecret: read("SESSION_SECRET") ?? "stuviora-dev-secret-change-me",
} as const;

export const services = {
  supabase: Boolean(env.supabaseUrl && env.supabaseAnonKey),
  razorpay: Boolean(env.razorpayKeyId && env.razorpayKeySecret),
  anthropic: Boolean(env.anthropicApiKey),
  /** Groq is the primary LLM provider (open-weight models, OpenAI-compatible). */
  groq: Boolean(env.groqApiKey),
  /** OpenRouter kept as an alternate route (e.g. to reach Claude). */
  openrouter: Boolean(env.openrouterApiKey),
  /** Any LLM is live: Groq is primary, then OpenRouter, then Anthropic. */
  llm: Boolean(env.groqApiKey ?? env.openrouterApiKey ?? env.anthropicApiKey),
  resend: Boolean(env.resendApiKey),
  inngest: Boolean(env.inngestEventKey),
  upstash: Boolean(env.upstashUrl && env.upstashToken),
  meilisearch: Boolean(env.meilisearchHost && env.meilisearchKey),
  sentry: Boolean(env.sentryDsn),
  posthog: Boolean(env.posthogKey),
} as const;

/**
 * DEMO_MODE is on whenever the database isn't wired up. In demo mode the app
 * serves seeded data and simulates payments + AI review so the product is
 * fully clickable. Set the Supabase env vars to switch to live mode.
 */
export const DEMO_MODE = !services.supabase;

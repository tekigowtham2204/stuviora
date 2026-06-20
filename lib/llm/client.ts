import "server-only";
import OpenAI from "openai";
import type { z } from "zod";
import { env, services } from "@/lib/env";
import { modelForTier } from "@/lib/llm/models";
import { platformModel } from "@/lib/demo/state";

/**
 * LLM client (P4).
 *
 * Single source of truth for calling an LLM. The primary provider is Groq
 * (OpenAI-compatible API, open-weight models); OpenRouter is kept as an
 * alternate route (e.g. to reach Claude) if its key is set instead. The
 * default model follows the admin-selected tier (lib/llm/models.ts), and the
 * UI only ever shows the real model id - no model is labelled as something it
 * is not.
 *
 * The two helpers we expose:
 *   - `chat()` for plain string responses
 *   - `chatJson()` for typed JSON, validated by a Zod schema
 *
 * Both return `null` when no LLM key is configured (DEMO_MODE) so callers can
 * fall back to a deterministic demo path.
 */

let _client: OpenAI | null = null;
let _provider: "groq" | "openrouter" | null = null;

interface Provider {
  client: OpenAI;
  kind: "groq" | "openrouter";
}

/** Resolve the configured provider, Groq first. Null in demo. */
function provider(): Provider | null {
  if (_client && _provider) return { client: _client, kind: _provider };
  if (services.groq) {
    _client = new OpenAI({
      apiKey: env.groqApiKey!,
      baseURL: "https://api.groq.com/openai/v1",
    });
    _provider = "groq";
  } else if (services.openrouter) {
    _client = new OpenAI({
      apiKey: env.openrouterApiKey!,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": env.openrouterAppUrl,
        "X-Title": env.openrouterAppName,
      },
    });
    _provider = "openrouter";
  } else {
    return null;
  }
  return { client: _client, kind: _provider };
}

/** The default model for the active provider (Groq follows the admin tier). */
function defaultModel(kind: "groq" | "openrouter"): string {
  return kind === "groq"
    ? modelForTier(platformModel.tier)
    : env.openrouterModel;
}

export interface ChatOptions {
  /** Override the default model id. */
  model?: string;
  /** Sampling temperature. Default 0.3 (we want consistency). */
  temperature?: number;
  /** Hard cap on tokens. Default 1024. */
  maxTokens?: number;
}

/**
 * Plain chat completion. Returns the assistant content as a string,
 * or null when no LLM is configured.
 */
export async function chat(
  system: string,
  user: string,
  opts: ChatOptions = {}
): Promise<string | null> {
  const p = provider();
  if (!p) return null;
  const completion = await p.client.chat.completions.create({
    model: opts.model ?? defaultModel(p.kind),
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 1024,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return completion.choices[0]?.message?.content ?? null;
}

/**
 * Typed JSON chat completion. The model is instructed to return ONLY
 * JSON matching the provided Zod schema; the response is parsed +
 * validated before returning. Returns null when no LLM is configured.
 *
 * If validation fails we retry once with a stricter "fix the JSON"
 * prompt. Two failures in a row throws JsonChatValidationError.
 */
export async function chatJson<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  opts: ChatOptions = {}
): Promise<T | null> {
  const p = provider();
  if (!p) return null;
  const model = opts.model ?? defaultModel(p.kind);

  const jsonSystem = `${system}\n\nReturn ONLY valid JSON. No code fences, no commentary.`;

  const first = await runJsonOnce(p.client, model, jsonSystem, user, schema, opts);
  if (first.ok) return first.value;

  const fixSystem = `${jsonSystem}\n\nYour previous reply was not valid JSON. Reply with ONLY the JSON object now, nothing else.`;
  const second = await runJsonOnce(p.client, model, fixSystem, user, schema, opts);
  if (second.ok) return second.value;

  throw new JsonChatValidationError(
    "LLM did not return schema-conformant JSON after retry",
    second.raw
  );
}

interface RunResult<T> {
  ok: boolean;
  value: T;
  raw: string;
}

async function runJsonOnce<T>(
  client: OpenAI,
  model: string,
  system: string,
  user: string,
  schema: z.ZodType<T>,
  opts: ChatOptions
): Promise<RunResult<T>> {
  const completion = await client.chat.completions.create({
    model,
    temperature: opts.temperature ?? 0.2,
    max_tokens: opts.maxTokens ?? 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(raw);
    const checked = schema.parse(parsed);
    return { ok: true, value: checked, raw };
  } catch {
    return { ok: false, value: null as unknown as T, raw };
  }
}

export class JsonChatValidationError extends Error {
  raw: string;
  constructor(message: string, raw: string) {
    super(message);
    this.name = "JsonChatValidationError";
    this.raw = raw;
  }
}

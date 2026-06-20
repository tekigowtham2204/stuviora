import "server-only";
import OpenAI from "openai";
import type { z } from "zod";
import { env, services } from "@/lib/env";
import { modelForTier } from "@/lib/llm/models";
import { platformModel } from "@/lib/demo/state";

/**
 * LLM client (P4). Groq only.
 *
 * Groq's OpenAI-compatible API is the sole provider. The model follows the
 * admin-selected tier (lib/llm/models.ts), and the UI only ever shows the
 * real model id - no model is labelled as something it is not.
 *
 *   - `chat()` for plain string responses
 *   - `chatJson()` for typed JSON, validated by a Zod schema
 *
 * Both return `null` when GROQ_API_KEY is not configured (DEMO_MODE) so
 * callers can fall back to a deterministic demo path.
 */

let _client: OpenAI | null = null;

/** The Groq client, or null in demo (no key). */
function groq(): OpenAI | null {
  if (!services.groq) return null;
  if (_client) return _client;
  _client = new OpenAI({
    apiKey: env.groqApiKey!,
    baseURL: "https://api.groq.com/openai/v1",
  });
  return _client;
}

/** The model for the admin-selected tier. */
function currentModel(): string {
  return modelForTier(platformModel.tier);
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
  const client = groq();
  if (!client) return null;
  const completion = await client.chat.completions.create({
    model: opts.model ?? currentModel(),
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
  const client = groq();
  if (!client) return null;
  const model = opts.model ?? currentModel();

  const jsonSystem = `${system}\n\nReturn ONLY valid JSON. No code fences, no commentary.`;

  const first = await runJsonOnce(client, model, jsonSystem, user, schema, opts);
  if (first.ok) return first.value;

  const fixSystem = `${jsonSystem}\n\nYour previous reply was not valid JSON. Reply with ONLY the JSON object now, nothing else.`;
  const second = await runJsonOnce(client, model, fixSystem, user, schema, opts);
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

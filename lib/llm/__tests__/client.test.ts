import { describe, it, expect } from "vitest";
import { JsonChatValidationError } from "@/lib/llm/client";

// chat() and chatJson() require a real OpenRouter key to exercise.
// Their unit tests pin the contract; live integration runs are
// captured in the build-checklist as T2 (live OpenRouter probe).

describe("JsonChatValidationError", () => {
  it("carries the raw model output for debugging", () => {
    const err = new JsonChatValidationError("bad", "not json");
    expect(err.name).toBe("JsonChatValidationError");
    expect(err.raw).toBe("not json");
  });
});

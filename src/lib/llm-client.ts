import OpenAI from "openai";

export type ServerLlmKind = "groq" | "openai";

export type ServerLlm = {
  client: OpenAI;
  kind: ServerLlmKind;
  gapModel: string;
  hotSeatModel: string;
};

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Server-side LLM client. Prefers Groq when `GROQ_API_KEY` is set (OpenAI-compatible API).
 * Otherwise uses `OPENAI_API_KEY` with the default OpenAI base URL.
 */
export function getServerLlmOrNull(): ServerLlm | null {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      client: new OpenAI({
        apiKey: groqKey,
        baseURL: GROQ_BASE_URL,
      }),
      kind: "groq",
      gapModel:
        process.env.GROQ_GAP_MODEL?.trim() ||
        process.env.GROQ_MODEL?.trim() ||
        "llama-3.3-70b-versatile",
      hotSeatModel:
        process.env.GROQ_HOTSEAT_MODEL?.trim() ||
        process.env.GROQ_CHAT_MODEL?.trim() ||
        process.env.GROQ_MODEL?.trim() ||
        "llama-3.3-70b-versatile",
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openaiKey) return null;

  return {
    client: new OpenAI({ apiKey: openaiKey }),
    kind: "openai",
    gapModel: process.env.OPENAI_GAP_MODEL?.trim() || "gpt-4o-mini",
    hotSeatModel: process.env.OPENAI_HOTSEAT_MODEL?.trim() || "gpt-4o-mini",
  };
}

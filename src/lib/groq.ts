import Groq from "groq-sdk";

/** Default chat model for gap analysis and Hot Seat (Groq). */
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

/** Single-request timeout (ms) for slower networks. */
export const GROQ_TIMEOUT_MS = 60_000;

export function getGroqApiKey(): string | undefined {
  return process.env.GROQ_API_KEY?.trim() || undefined;
}

/** Groq client with API key from `GROQ_API_KEY` and a 60s request timeout. */
export function createGroqClient(): Groq | null {
  const apiKey = getGroqApiKey();
  if (!apiKey) return null;
  return new Groq({ apiKey, timeout: GROQ_TIMEOUT_MS });
}

export function defaultGapModel(): string {
  return process.env.GROQ_GAP_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

export function defaultHotSeatModel(): string {
  return process.env.GROQ_HOTSEAT_MODEL?.trim() || DEFAULT_GROQ_MODEL;
}

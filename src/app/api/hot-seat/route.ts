import { NextResponse } from "next/server";
import { APIError } from "groq-sdk";
import { z } from "zod";

import { createGroqClient, defaultHotSeatModel } from "@/lib/groq";


import { getServerLlmOrNull } from "@/lib/llm-client";

export const runtime = "nodejs";

const bodySchema = z.object({
  mode: z.enum(["student", "career"]),
  weaknesses: z.array(z.string()),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    }),
  ),
});

const SESSION_BOOTSTRAP_USER =
  "Session start. Open the interrogation immediately per your system instructions. Output only your interrogation message.";

const HOTSEAT_QUOTA_FALLBACK =
  "Live Groq is rate-limited right now, so you get me in offline form: pick the single worst gap from your analysis and defend, in one tight paragraph, exactly how you would close it this week. No hedging.";

function isGroqQuotaOrServerError(e: unknown): boolean {
  return e instanceof APIError && (e.status === 429 || e.status === 500);
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const { mode, weaknesses, messages } = parsed.data;
    const groq = createGroqClient();

    if (!groq) {
      return NextResponse.json(
        {
          ok: false,
          error: "GROQ_API_KEY is missing. The Hot Seat requires an active AI engine to grill you.",
    const llm = getServerLlmOrNull();

    if (!llm) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "GROQ_API_KEY or OPENAI_API_KEY is missing. The Hot Seat needs an active LLM key on the server.",
        },
        { status: 401 },
      );
    }

    const persona =
      mode === "student"
        ? "You are a strict lecturer and examiner."
        : "You are a brutal technical interviewer.";

    const systemPrompt = `
${persona}
You are Delta. You conduct a high-stakes oral examination. Your goal is to grill the user only on the weak points discovered during a gap analysis for a ${
      mode === "student" ? "course or exam" : "job role"
    const { client, hotSeatModel } = llm;

    const systemPrompt = `
You are AmICooked, a high-stakes AI interrogator. 
Your goal is to grill the user on their specific weak points discovered during a gap analysis for a ${
      mode === "student" ? "course/exam" : "job role"
    }.

CONTEXT — weak points you must focus on (do not drift to unrelated topics):
${weaknesses.map((w) => `- ${w}`).join("\n")}

INSTRUCTIONS:
1. Be sharp, relentless, and demand technical precision.
2. Do not be "helpful" in the traditional sense. Be a challenger.
3. Ask one pointed question at a time.
4. If the user's answer is vague, expose the flaw and double down.
5. Keep your responses concise and intimidating.
6. Your tone is cold, professional, and slightly aggressive.
7. Tie every follow-up to the listed weak points. If they are weak in a topic, ask a difficult, specific question about that topic.

Start the interrogation immediately on the first turn. On later turns, respond only to the user's latest message while staying anchored to the weak points.
`.trim();

    const modelName = defaultHotSeatModel();
    const response = await client.chat.completions.create({
      model: hotSeatModel,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const filtered = messages.filter((m) => m.role !== "system");
    type Msg = { role: "user" | "assistant"; content: string };
    let conv: Msg[] = filtered.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
    if (conv.length === 0) {
      conv = [{ role: "user", content: SESSION_BOOTSTRAP_USER }];
    } else if (conv[0].role === "assistant") {
      conv = [{ role: "user", content: SESSION_BOOTSTRAP_USER }, ...conv];
    }

    let content: string;
    try {
      const completion = await groq.chat.completions.create({
        model: modelName,
        temperature: 0.7,
        messages: [{ role: "system", content: systemPrompt }, ...conv],
      });
      content = completion.choices[0]?.message?.content ?? "";
    } catch (e) {
      console.error("[Groq-Error]", e);
      if (isGroqQuotaOrServerError(e)) {
        return NextResponse.json({ ok: true, content: HOTSEAT_QUOTA_FALLBACK });
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[hot-seat-api]", e);
      return NextResponse.json({ ok: false, error: msg || "Interrogation failed." }, { status: 500 });
    }

    if (!content.trim()) {
      return NextResponse.json({ ok: false, error: "Empty response from AI." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, content: content.trim() });
  } catch (err) {
    console.error("[Groq-Error]", err);
    console.error("[hot-seat-api]", err);
    return NextResponse.json({ ok: false, error: "Interrogation failed." }, { status: 500 });
  }
}

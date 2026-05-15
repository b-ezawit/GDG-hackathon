import { NextResponse } from "next/server";
import { z } from "zod";

import { getServerLlmOrNull } from "@/lib/llm-client";

export const runtime = "nodejs";

const bodySchema = z.object({
  mode: z.enum(["student", "career"]),
  weaknesses: z.array(z.string()),
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
    }

    const { mode, weaknesses, messages } = parsed.data;
    const llm = getServerLlmOrNull();

    if (!llm) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "GROQ_API_KEY or OPENAI_API_KEY is missing. The Hot Seat needs an active LLM key on the server.",
        },
        { status: 401 }
      );
    }

    const { client, hotSeatModel } = llm;

    const systemPrompt = `
You are AmICooked, a high-stakes AI interrogator. 
Your goal is to grill the user on their specific weak points discovered during a gap analysis for a ${
      mode === "student" ? "course/exam" : "job role"
    }.

CONTEXT (Weaknesses to attack):
${weaknesses.map((w) => `- ${w}`).join("\n")}

INSTRUCTIONS:
1. Be sharp, relentless, and demand technical precision.
2. Do not be "helpful" in the traditional sense. Be a challenger.
3. Ask one pointed question at a time.
4. If the user's answer is vague, expose the flaw and double down.
5. Keep your responses concise and intimidating.
6. Your tone is "cold, professional, and slightly aggressive".
7. Use the weaknesses provided to structure your "attack". If they are weak in "React Hooks", ask a difficult question about "useMemo vs useCallback" or stale closures.

Start the interrogation immediately if this is the first message.
`.trim();

    const response = await client.chat.completions.create({
      model: hotSeatModel,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from AI.");

    return NextResponse.json({ ok: true, content });
  } catch (err) {
    console.error("[hot-seat-api]", err);
    return NextResponse.json({ ok: false, error: "Interrogation failed." }, { status: 500 });
  }
}

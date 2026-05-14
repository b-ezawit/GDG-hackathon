import { NextResponse } from "next/server";
import { z } from "zod";

import { runGapAnalysis } from "@/lib/gap-engine";

export const runtime = "nodejs";

const bodySchema = z.object({
  mode: z.enum(["student", "career"]),
  targetText: z.string().min(30, "Target text is too short — add syllabus/JD content."),
  currentText: z.string().min(30, "Current text is too short — add notes or resume extract."),
});

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(" ");
      return NextResponse.json({ ok: false, error: msg || "Invalid request body." }, { status: 400 });
    }

    const { mode, targetText, currentText } = parsed.data;
    const analysis = await runGapAnalysis(mode, targetText, currentText);
    return NextResponse.json({ ok: true, analysis });
  } catch (err) {
    console.error("[gap-analysis]", err);
    const message = err instanceof Error ? err.message : "Gap analysis failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

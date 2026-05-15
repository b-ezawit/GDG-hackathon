import type { GapMode } from "@/lib/gap-schema";

const SHARED_JSON_RULES = `You must respond with a single JSON object only (no markdown fences, no prose before or after).
Use this exact key set and types:
{
  "survivalScore": number (0-100 integer, holistic readiness for the target),
  "headline": string (one punchy line, <= 120 chars),
  "summary": string (2-4 sentences explaining the delta),
  "targetHighlights": string[] (3-8 bullets: what the target emphasizes),
  "currentHighlights": string[] (3-8 bullets: what the current materials show the user actually knows/has done),
  "topics": [
    {
      "id": string (short slug, e.g. "redux-state"),
      "name": string (human label),
      "importance": number (0-100, how critical this is in the target),
      "coverage": number (0-100, how well the current state demonstrates this),
      "gap": number (0-100, size of the shortfall; use max(0, importance - coverage) if unsure),
      "notes": string (one sentence, concrete evidence from the texts)
    }
  ],
  "strengths": string[] (2-6),
  "weaknesses": string[] (2-8, tie to target requirements),
  "bridges": string[] (3-5 atomic tasks the user can do in under 45 minutes each),
  "radar": [
    { "axis": string, "target": number (0-100), "current": number (0-100) }
  ]
}

Rules:
- "topics" must have at least 5 items, at most 12. Each importance/coverage/gap must be integers 0-100.
- "radar" must have the same axes as the highest-importance topics (same count and order as the first N topics), N between 5 and 8. "target" = importance, "current" = coverage.
- Be specific: quote or paraphrase concrete nouns/skills/modules from the provided texts.
- If the current text is thin, lower coverage honestly and reflect uncertainty in notes.
- survivalScore should align with the average gap (do not claim 90% if coverage is weak across high-importance topics).`;

export function buildSystemPrompt(mode: GapMode): string {
  if (mode === "student") {
    return `You are AmICooked, an academic "reality-gap" analyst for students.
Compare TARGET_STATE (syllabus, exam outline, learning outcomes, weighting by section) to CURRENT_STATE (notes, quizzes, problem sets).
Extract course topics/modules/skills from the target and estimate how well the current materials cover each.
${SHARED_JSON_RULES}`;
  }
  return `You are AmICooked, a career "reality-gap" analyst for job seekers.
Compare TARGET_STATE (job description: responsibilities, stack, seniority signals) to CURRENT_STATE (resume/CV: skills, experience, impact).
Extract skills, tools, and domains from the JD and map them to evidence (or absence) in the resume.
${SHARED_JSON_RULES}`;
}

export function buildUserPrompt(mode: GapMode, targetText: string, currentText: string): string {
  const label =
    mode === "student"
      ? "TARGET_STATE = syllabus/exam outline. CURRENT_STATE = student notes/quizzes."
      : "TARGET_STATE = job description. CURRENT_STATE = resume/CV text.";
  return `${label}

--- TARGET_STATE ---
${targetText}

--- CURRENT_STATE ---
${currentText}

Analyze the gap and output the JSON object now.`;
}

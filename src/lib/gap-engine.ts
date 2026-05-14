import OpenAI from "openai";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/gap-prompts";
import {
  gapAnalysisPayloadSchema,
  type GapAnalysisResult,
  type GapMode,
  type GapAnalysisPayload,
  type TopicGap,
  type RadarPoint,
} from "@/lib/gap-schema";

const MAX_INPUT_CHARS = 48_000;

const STOPWORDS = new Set(
  "the and for that with from this have were been will your you are was can has not but what when how any our out all new more one two may use using used such than then them they their into also only over other".split(
    " ",
  ),
);

function clampInt(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(Number.isFinite(n) ? n : lo)));
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + "\n…[truncated for model context]";
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w));
}

function wordFreq(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function buildFallback(mode: GapMode, targetText: string, currentText: string): GapAnalysisPayload {
  const tt = tokenize(targetText);
  const ct = tokenize(currentText);
  const tf = wordFreq(tt);
  const cf = wordFreq(ct);
  const targetSet = new Set(tf.keys());
  const currentSet = new Set(cf.keys());
  let inter = 0;
  for (const w of targetSet) if (currentSet.has(w)) inter += 1;
  const union = new Set([...targetSet, ...currentSet]).size || 1;
  const jaccard = inter / union;
  const survivalScore = clampInt(jaccard * 92 + (mode === "student" ? 4 : 2), 8, 88);

  const topTarget = [...tf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  let topics: TopicGap[] = topTarget.slice(0, 8).map(([word, freq], i) => {
    const importance = clampInt(100 - i * 8 - (10 - Math.min(freq, 10)) * 2, 15, 100);
    const inCur = cf.get(word) ?? 0;
    const coverage = clampInt(inCur > 0 ? 55 + Math.min(inCur, 5) * 8 : 5 + (jaccard * 30), 0, 100);
    const gap = clampInt(Math.max(0, importance - coverage), 0, 100);
    return {
      id: `kw-${word.slice(0, 24)}`,
      name: word.replace(/[-.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      importance,
      coverage,
      gap,
      notes:
        inCur > 0
          ? `Keyword overlap suggests some exposure to "${word}" in current materials.`
          : `Little or no signal for "${word}" in current materials vs target text.`,
    };
  });

  if (topics.length === 0) {
    topics = [
      {
        id: "insufficient-signal",
        name: "Not enough overlapping text",
        importance: 80,
        coverage: 10,
        gap: 70,
        notes: "Upload longer PDFs with selectable text, or paste more JD/resume content.",
      },
    ];
  }

  const radar: RadarPoint[] = topics.slice(0, 6).map((t) => ({
    axis: t.name,
    target: t.importance,
    current: t.coverage,
  }));

  const label = mode === "student" ? "course" : "role";
  return {
    survivalScore,
    headline: `Heuristic gap scan (${label}) — set OPENAI_API_KEY for full AI analysis.`,
    summary:
      "No LLM key was configured on the server, so this is a fast lexical overlap estimate. Upload richer PDFs or paste fuller JD text, then configure OPENAI_API_KEY for calibrated topic extraction and narrative.",
    targetHighlights: topTarget.slice(0, 5).map(([w]) => `Recurring target theme: ${w}`),
    currentHighlights: [...cf.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => `Recurring current theme: ${w}`),
    topics,
    strengths: inter > 0 ? ["Some terminology overlap between target and current texts."] : [],
    weaknesses:
      inter < 3
        ? ["Very low overlap — texts may be unrelated or one extract is empty/scanned."]
        : ["Several high-signal target terms are missing from the current extract."],
    bridges: [
      "Paste or upload a denser current-state document (notes or resume) and re-run.",
      "Ensure the target PDF has selectable text (not only scanned images).",
      "Add OPENAI_API_KEY to enable structured skill/topic mapping.",
    ],
    radar,
  };
}

function normalizePayload(mode: GapMode, raw: GapAnalysisPayload): GapAnalysisResult {
  const topics = raw.topics.map((t, i) => {
    const importance = clampInt(t.importance, 0, 100);
    const coverage = clampInt(t.coverage, 0, 100);
    const gap = clampInt(t.gap ?? Math.max(0, importance - coverage), 0, 100);
    return {
      ...t,
      id: t.id?.trim() || `topic-${i}`,
      importance,
      coverage,
      gap,
    };
  });

  let radar: RadarPoint[] =
    raw.radar?.map((r) => ({
      axis: r.axis,
      target: clampInt(r.target, 0, 100),
      current: clampInt(r.current, 0, 100),
    })) ?? [];

  if (radar.length < 3) {
    radar = topics.slice(0, Math.min(8, Math.max(5, topics.length))).map((t) => ({
      axis: t.name,
      target: t.importance,
      current: t.coverage,
    }));
  }

  const survivalScore = clampInt(raw.survivalScore, 0, 100);

  return {
    version: 1,
    mode,
    survivalScore,
    headline: raw.headline.trim(),
    summary: raw.summary.trim(),
    targetHighlights: raw.targetHighlights.map((s) => s.trim()).filter(Boolean),
    currentHighlights: raw.currentHighlights.map((s) => s.trim()).filter(Boolean),
    topics,
    strengths: raw.strengths.map((s) => s.trim()).filter(Boolean),
    weaknesses: raw.weaknesses.map((s) => s.trim()).filter(Boolean),
    bridges: raw.bridges.map((s) => s.trim()).filter(Boolean),
    radar,
    model: "normalized",
    usedFallback: false,
  };
}

function parseJsonContent(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    }
    throw new Error("Model did not return valid JSON.");
  }
}

export async function runGapAnalysis(
  mode: GapMode,
  targetText: string,
  currentText: string,
): Promise<GapAnalysisResult> {
  const target = truncate(targetText.trim(), MAX_INPUT_CHARS);
  const current = truncate(currentText.trim(), MAX_INPUT_CHARS);

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    const fb = buildFallback(mode, target, current);
    return { ...normalizePayload(mode, fb), model: "heuristic-fallback", usedFallback: true };
  }

  const client = new OpenAI({ apiKey });
  const system = buildSystemPrompt(mode);
  const user = buildUserPrompt(mode, target, current);

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_GAP_MODEL?.trim() || "gpt-4o-mini",
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty model response.");

  const parsed = parseJsonContent(content);
  const payload = gapAnalysisPayloadSchema.parse(parsed);
  const normalized = normalizePayload(mode, payload);
  return {
    ...normalized,
    model: completion.model ?? "gpt-4o-mini",
    usedFallback: false,
  };
}

import { z } from "zod";

/** One row for spider/radar charts in Phase 3 */
export const radarPointSchema = z.object({
  axis: z.string().min(1),
  target: z.coerce.number(),
  current: z.coerce.number(),
});

export const topicGapSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  importance: z.coerce.number(),
  coverage: z.coerce.number(),
  /** Optional; if omitted we derive importance − coverage */
  gap: z.coerce.number().optional(),
  notes: z.string().optional(),
});

/** Shape returned by the model (we add version + normalize after parse) */
export const gapAnalysisPayloadSchema = z.object({
  survivalScore: z.coerce.number(),
  headline: z.string(),
  summary: z.string(),
  targetHighlights: z.array(z.string()),
  currentHighlights: z.array(z.string()),
  topics: z.array(topicGapSchema).min(1).max(24),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  bridges: z.array(z.string()),
  radar: z.array(radarPointSchema).max(12).optional(),
});

export type RadarPoint = z.infer<typeof radarPointSchema>;
export type TopicGap = z.infer<typeof topicGapSchema>;
export type GapAnalysisPayload = z.infer<typeof gapAnalysisPayloadSchema>;

export type GapMode = "student" | "career";

export type GapAnalysisResult = GapAnalysisPayload & {
  version: 1;
  mode: GapMode;
  model: string;
  usedFallback: boolean;
};

"use client";

import { motion } from "framer-motion";

import { GapRadarChart } from "@/components/gap-radar-chart";
import { SurvivalMeter } from "@/components/survival-meter";
import { HotSeat } from "@/components/hot-seat";
import { Zap } from "lucide-react";
import { useState } from "react";
import type { GapAnalysisResult } from "@/lib/gap-schema";

type Props = {
  analysis: GapAnalysisResult | null;
  loading: boolean;
  error: string | null;
};

export function GapAnalysisPanel({ analysis, loading, error }: Props) {
  const [isHotSeatOpen, setIsHotSeatOpen] = useState(false);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200/90 bg-white p-10 text-center shadow-md dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] dark:backdrop-blur-2xl">
        <p className="inline-flex items-center justify-center gap-3 text-sm text-cyan-700 dark:text-cyan-200/90">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-600 dark:border-cyan-400/30 dark:border-t-cyan-400" />
          Running gap engine — comparing target vs current…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-3xl border border-rose-300/90 bg-rose-50 p-6 text-sm text-rose-800 backdrop-blur-2xl dark:border-rose-500/25 dark:bg-rose-500/5 dark:text-rose-200/90"
        role="alert"
      >
        {error}
      </div>
    );
  }

  if (!analysis) return null;

  const topicRows = analysis.topics.map((t) => ({
    subject: t.name,
    Target: t.importance,
    You: t.coverage,
  }));

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-10"
      aria-label="Gap analysis results"
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/80 to-violet-50/40 p-6 shadow-md dark:border-white/[0.1] dark:from-white/[0.07] dark:via-white/[0.02] dark:to-transparent dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] dark:backdrop-blur-2xl sm:p-8">
          <SurvivalMeter score={analysis.survivalScore} />
          <div className="mt-8 space-y-3">
            <p className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-slate-900 dark:text-white">{analysis.headline}</p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{analysis.summary}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] dark:backdrop-blur-2xl sm:p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-600">Engine</p>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            Model <span className="font-mono text-slate-900 dark:text-zinc-200">{analysis.model}</span>
            {analysis.usedFallback && (
              <span className="mt-2 block text-amber-200/85">
                Powered by Groq (Llama 3.3) — offline estimate while the API is unavailable.
              <span className="mt-2 block text-amber-800 dark:text-amber-200/85">
                Heuristic mode — add <span className="font-mono text-slate-900 dark:text-zinc-200">GROQ_API_KEY</span> or{" "}
                <span className="font-mono text-slate-900 dark:text-zinc-200">OPENAI_API_KEY</span> for full LLM scoring.
              </span>
            )}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Target signals</p>
              <ul className="space-y-2 text-slate-700 dark:text-zinc-300">
                {analysis.targetHighlights.slice(0, 6).map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-cyan-600 dark:text-cyan-400/70">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Current signals</p>
              <ul className="space-y-2 text-slate-700 dark:text-zinc-300">
                {analysis.currentHighlights.slice(0, 6).map((t) => (
                  <li key={t} className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-violet-600 dark:text-violet-400/70">▸</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <GapRadarChart radar={analysis.radar ?? []} topicsFallback={topicRows} />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-xl sm:p-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Strengths</h3>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200/85">
            {analysis.strengths.length === 0 ? <li className="text-slate-500 dark:text-zinc-500">—</li> : analysis.strengths.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-xl sm:p-8">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Weaknesses</h3>
          <ul className="space-y-2 text-sm text-rose-700 dark:text-rose-200/85">
            {analysis.weaknesses.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-slate-50 p-6 shadow-sm dark:border-white/[0.08] dark:bg-black/35 dark:backdrop-blur-xl sm:p-8">
        <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Topic delta</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-black/40">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 dark:border-white/[0.06] dark:text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Topic</th>
                <th className="px-4 py-3 font-medium">Target</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Gap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-white/[0.04] dark:text-zinc-300">
              {analysis.topics.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">{row.name}</div>
                    {row.notes && <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">{row.notes}</p>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-cyan-700 dark:text-cyan-200/90">{row.importance}</td>
                  <td className="px-4 py-3 font-mono text-xs text-violet-700 dark:text-violet-200/90">{row.coverage}</td>
                  <td className="px-4 py-3 font-mono text-xs text-rose-700 dark:text-rose-200/90">{row.gap ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] dark:backdrop-blur-xl sm:p-8">
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-zinc-500">Micro-skill bridges</h3>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-zinc-300">
          {analysis.bridges.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ol>
      </div>

      <div className="relative group overflow-hidden rounded-3xl border border-rose-200/90 bg-gradient-to-br from-rose-50 via-white to-violet-50 p-1 shadow-md dark:border-rose-500/30 dark:from-rose-500/15 dark:via-zinc-900/40 dark:to-transparent dark:shadow-[0_0_20px_rgba(244,63,94,0.1)]">
        <div className="relative z-10 rounded-[22px] bg-white/90 p-8 text-center backdrop-blur-2xl dark:bg-zinc-950/40 sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-md dark:bg-rose-500/20 dark:text-rose-500 dark:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <Zap className="h-8 w-8" />
          </div>
          <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Enter the Hot Seat
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-base">
            Gap analysis is just the map. The Hot Seat is the training ground. Enter a high-stakes interrogation session
            where AmICooked grills you specifically on your identified weak points. Perfect for pressure-testing your
            defense before the real interview or exam.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              onClick={() => setIsHotSeatOpen(true)}
              className="group relative flex items-center gap-2 rounded-2xl bg-rose-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-500 active:scale-95 dark:bg-rose-500 dark:shadow-[0_0_20px_rgba(244,63,94,0.3)] dark:hover:bg-rose-400 dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            >
              Start Interrogation
              <Zap className="h-4 w-4 fill-current transition group-hover:scale-125" />
            </button>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-rose-600/90 font-mono dark:text-rose-400/60">
            Warning: Relentless AI mode active
          </p>
        </div>
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-rose-200/50 blur-[100px] dark:bg-rose-500/10" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-200/50 blur-[100px] dark:bg-violet-500/10" />
      </div>

      <details className="group rounded-3xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-black/30 dark:backdrop-blur-md">
        <summary className="cursor-pointer font-mono text-xs text-slate-500 marker:content-none dark:text-zinc-500 [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-slate-300 underline-offset-2 group-open:no-underline dark:decoration-white/20">
            Raw analysis JSON
          </span>
        </summary>
        <pre className="mt-3 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-[10px] leading-relaxed text-slate-600 dark:border-white/[0.06] dark:bg-black/50 dark:text-zinc-500">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      </details>

      <HotSeat
        isOpen={isHotSeatOpen}
        onClose={() => setIsHotSeatOpen(false)}
        weaknesses={analysis.weaknesses}
        mode={analysis.mode}
      />
    </motion.section>
  );
}

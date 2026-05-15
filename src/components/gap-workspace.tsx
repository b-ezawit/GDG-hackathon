"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Flame } from "lucide-react";

import { GapAnalysisPanel } from "@/components/gap-analysis-panel";
import { AmICookedLogo } from "@/components/amicooked-logo";
import { PdfDropCard, type ParsePdfSuccess } from "@/components/pdf-drop-card";
import { ThemeToggle } from "@/components/app-theme";
import type { GapAnalysisResult, GapMode } from "@/lib/gap-schema";

function textFromPdf(d: ParsePdfSuccess): string {
  return (d.extractedText || d.preview || "").trim();
}

type Props = {
  mode: GapMode;
  /** Server-derived: whether `GROQ_API_KEY` is set (never expose the key to the client). */
  liveAnalysisAvailable?: boolean;
};

export function GapWorkspace({ mode, liveAnalysisAvailable = false }: Props) {
  const [jdText, setJdText] = useState("");
  const [studentTarget, setStudentTarget] = useState("");
  const [studentCurrent, setStudentCurrent] = useState("");
  const [careerResume, setCareerResume] = useState("");
  const [careerJdPdf, setCareerJdPdf] = useState("");

  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const targetText = useMemo(() => {
    if (mode === "student") return studentTarget.trim();
    return [jdText.trim(), careerJdPdf.trim()].filter(Boolean).join("\n\n");
  }, [mode, studentTarget, jdText, careerJdPdf]);

  const currentText = useMemo(() => {
    if (mode === "student") return studentCurrent.trim();
    return careerResume.trim();
  }, [mode, studentCurrent, careerResume]);

  const canRun = targetText.length >= 30 && currentText.length >= 30;

  const runGap = useCallback(async () => {
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          targetText,
          currentText,
        }),
      });
      const data = (await res.json()) as { ok: boolean; analysis?: GapAnalysisResult; error?: string };
      if (!res.ok || !data.ok) {
        setAnalysisError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      if (data.analysis) setAnalysis(data.analysis);
    } catch {
      setAnalysisError("Network error while calling the gap engine.");
    } finally {
      setAnalysisLoading(false);
    }
  }, [mode, targetText, currentText]);

  const accent = mode === "student" ? "cyan" : "rose";

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-[#06050a] dark:text-zinc-100">
      <div
        className={`pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full blur-[120px] ds-aurora ${
          mode === "student" ? "bg-cyan-400/25 dark:bg-cyan-500/18" : "bg-rose-300/30 dark:bg-rose-500/16"
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-48 h-[380px] w-[380px] rounded-full bg-violet-300/30 blur-[110px] dark:bg-violet-600/18 ds-aurora"
        style={{ animationDelay: "-8s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-100/40 blur-[100px] dark:bg-amber-900/8"
        aria-hidden
      />
      <div className="ds-grid-bg pointer-events-none absolute inset-0 opacity-70 dark:opacity-[0.32]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(124,58,237,0.06),transparent_50%)] opacity-100 dark:opacity-[0.08] dark:mix-blend-overlay dark:bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.2),transparent_50%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-2xl dark:border-white/[0.06] dark:bg-black/45 dark:shadow-none sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-2 py-1 shadow-sm transition hover:border-violet-300 dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none dark:hover:border-white/15"
            >
              <AmICookedLogo nestEagle />
              <span className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold tracking-tight text-violet-700 dark:text-white">
                AmICooked
              </span>
            </Link>
            <span className="hidden h-6 w-px bg-slate-200 dark:bg-white/10 sm:block" aria-hidden />
            <div className="hidden flex-col sm:flex">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-zinc-500">
                {mode === "student" ? "Academic" : "Career"}
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-slate-700 dark:text-zinc-200">
                {mode === "student" ? "Student workspace" : "Job seeker workspace"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 shadow-sm sm:inline-flex dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:shadow-none">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              AI online
            </span>
            <ThemeToggle />
            <Link
              href={mode === "student" ? "/career" : "/student"}
              className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-violet-300 dark:border-white/[0.08] dark:bg-transparent dark:text-zinc-400 dark:shadow-none dark:hover:border-white/15 dark:hover:text-zinc-200"
            >
              Switch path
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-violet-300 dark:border-white/[0.08] dark:bg-transparent dark:text-zinc-400 dark:shadow-none dark:hover:border-white/15 dark:hover:text-zinc-200"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-5xl flex-col px-5 pb-20 pt-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {mode === "student" ? "Course gap lab" : "Role gap lab"}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <Flame className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              Cooked-aware
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-base">
            {mode === "student"
              ? "Drop your syllabus and notes — AmICooked returns a survival score, a cooked meter, and a radar of topic pressure vs your coverage."
              : "Paste the JD and upload your résumé — AmICooked maps stack and story gaps with the same radar treatment."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-8 lg:grid-cols-2"
        >
          {mode === "student" ? (
            <>
              <article className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] dark:backdrop-blur-2xl sm:p-8">
                <h2 className="mb-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-slate-900 dark:text-white">
                  Academic mode
                </h2>
                <p className="mb-8 text-sm text-slate-500 dark:text-zinc-500">Target = syllabus or exam outline. Current = notes or quiz exports (PDF).</p>
                <div className="space-y-10">
                  <PdfDropCard
                    accent="cyan"
                    label="Target state (PDF)"
                    hint="Course syllabus, exam blueprint, or lecturer-provided outline."
                    onParsed={(d) => setStudentTarget(textFromPdf(d))}
                  />
                  <PdfDropCard
                    accent="violet"
                    label="Current state (PDF)"
                    hint="Lecture notes, problem sets, or exported quiz results."
                    onParsed={(d) => setStudentCurrent(textFromPdf(d))}
                  />
                </div>
              </article>
              <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-cyan-200/80 bg-gradient-to-b from-cyan-50 to-white p-6 shadow-md dark:border-cyan-500/20 dark:from-cyan-500/8 dark:to-transparent dark:shadow-[0_0_0_1px_rgba(46,233,217,0.08)_inset] dark:backdrop-blur-2xl sm:p-8">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-cyan-900 dark:text-cyan-100/90">
                    AmICooked dashboard
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                    Charts and the cooked meter light up after you run analysis. Golden demo pairs still land best on
                    stage.
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-slate-600 dark:text-zinc-500">
                  <li className="flex gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400/80">01</span>
                    Radar: target vs you
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400/80">02</span>
                    Cooked meter & survival %
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400/80">03</span>
                    Atomic bridges list
                  </li>
                </ul>
              </aside>
            </>
          ) : (
            <>
              <article className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md dark:border-white/[0.1] dark:bg-white/[0.04] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] dark:backdrop-blur-2xl sm:p-8">
                <h2 className="mb-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-slate-900 dark:text-white">
                  Career mode
                </h2>
                <p className="mb-8 text-sm text-slate-500 dark:text-zinc-500">Target = job description (paste and/or PDF). Current = resume (PDF).</p>
                <div className="space-y-10">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(251,113,133,0.5)]"
                        aria-hidden
                      />
                      <span className="text-sm font-medium tracking-wide text-slate-800 dark:text-zinc-200">Job description (text)</span>
                    </div>
                    <p className="mb-2 text-xs text-slate-500 dark:text-zinc-500">Paste from LinkedIn, Greenhouse, or Notion.</p>
                    <textarea
                      rows={6}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste the full job description here…"
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-white/[0.1] dark:bg-black/45 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-rose-400/40 dark:focus:ring-rose-400/20"
                    />
                    <p className="mt-1.5 text-right text-[11px] text-slate-500 dark:text-zinc-600">
                      {jdText.length.toLocaleString()} characters · merged with optional JD PDF
                    </p>
                  </div>
                  <PdfDropCard
                    accent="rose"
                    label="Resume (PDF)"
                    hint="Exported résumé or CV."
                    onParsed={(d) => setCareerResume(textFromPdf(d))}
                  />
                  <PdfDropCard
                    accent="cyan"
                    label="Optional: JD as PDF"
                    hint="Appended after the textarea when present."
                    onParsed={(d) => setCareerJdPdf(textFromPdf(d))}
                  />
                </div>
              </article>
              <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50 to-white p-6 shadow-md dark:border-rose-500/20 dark:from-rose-500/8 dark:to-transparent dark:shadow-[0_0_0_1px_rgba(251,113,133,0.08)_inset] dark:backdrop-blur-2xl sm:p-8">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-rose-100/90">LLM + fallback</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {liveAnalysisAvailable
                      ? "Live Analysis Active"
                      : "Running in Heuristic Mode: Connect your AI engine for live scoring."}
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-rose-900 dark:text-rose-100/90">
                    LLM + fallback
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                    Set <span className="font-mono text-slate-800 dark:text-zinc-300">GROQ_API_KEY</span> or{" "}
                    <span className="font-mono text-slate-800 dark:text-zinc-300">OPENAI_API_KEY</span> for structured scoring. Without it,
                    AmICooked still renders radar + meter from heuristics.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px] leading-relaxed text-slate-600 dark:border-white/[0.06] dark:bg-black/35 dark:text-zinc-500">
                  <span className="text-rose-600 dark:text-rose-300/80">tip</span> — Keep a golden JD + resume pair for finals.
                </div>
              </aside>
            </>
          )}
        </motion.div>

        <section className="mt-12 space-y-6" aria-label="Run gap analysis">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600 dark:text-zinc-500">
              <span className="text-slate-800 dark:text-zinc-300">Target</span> {targetText.length.toLocaleString()} chars ·{" "}
              <span className="text-slate-800 dark:text-zinc-300">Current</span> {currentText.length.toLocaleString()} chars
              {!canRun && (
                <span className="block pt-1 text-xs text-slate-500 dark:text-zinc-600">Need ≥ 30 characters in both to run analysis.</span>
              )}
            </div>
            <button
              type="button"
              disabled={!canRun || analysisLoading}
              onClick={() => void runGap()}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
                accent === "cyan"
                  ? "bg-gradient-to-r from-cyan-500/95 via-violet-600/95 to-emerald-500/90 shadow-cyan-500/20 dark:from-cyan-500/90 dark:via-violet-500/85 dark:to-emerald-500/80 dark:shadow-cyan-500/15"
                  : "bg-gradient-to-r from-rose-500/95 via-violet-600/95 to-cyan-500/85 shadow-rose-500/20 dark:from-rose-500/90 dark:via-violet-500/85 dark:to-cyan-500/75 dark:shadow-rose-500/15"
              }`}
            >
              {analysisLoading ? "Scoring…" : "Run gap analysis"}
            </button>
          </div>

          <GapAnalysisPanel analysis={analysis} loading={analysisLoading} error={analysisError} />
        </section>

        <footer className="pt-16 text-center text-xs text-slate-500 dark:text-zinc-600">AmICooked · gap engine + dashboard</footer>
      </div>
    </div>
  );
}

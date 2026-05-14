"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { GapAnalysisPanel } from "@/components/gap-analysis-panel";
import { DeltaLogo } from "@/components/delta-logo";
import { PdfDropCard, type ParsePdfSuccess } from "@/components/pdf-drop-card";
import type { GapAnalysisResult, GapMode } from "@/lib/gap-schema";

function textFromPdf(d: ParsePdfSuccess): string {
  return (d.extractedText || d.preview || "").trim();
}

type Props = {
  mode: GapMode;
};

export function GapWorkspace({ mode }: Props) {
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
    <div className="relative isolate min-h-screen overflow-hidden">
      <div
        className={`pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full blur-[120px] ds-aurora ${
          mode === "student" ? "bg-cyan-500/18" : "bg-rose-500/16"
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-48 h-[380px] w-[380px] rounded-full bg-violet-600/18 blur-[110px] ds-aurora"
        style={{ animationDelay: "-8s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-900/8 blur-[100px]"
        aria-hidden
      />
      <div className="ds-grid-bg pointer-events-none absolute inset-0 opacity-[0.32]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay bg-[radial-gradient(ellipse_at_20%_0%,rgba(255,255,255,0.2),transparent_50%)]"
        aria-hidden
      />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/45 px-4 py-3 backdrop-blur-2xl sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1 transition hover:border-white/15">
              <DeltaLogo nestEagle />
              <span className="font-[family-name:var(--font-space-grotesk)] text-base font-semibold tracking-tight text-white">
                Delta
              </span>
            </Link>
            <span className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
            <div className="hidden flex-col sm:flex">
              <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                {mode === "student" ? "Academic" : "Career"}
              </span>
              <span className="font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-zinc-200">
                {mode === "student" ? "Student workspace" : "Job seeker workspace"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={mode === "student" ? "/career" : "/student"}
              className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:text-zinc-200"
            >
              Switch path
            </Link>
            <Link href="/" className="rounded-xl border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/15 hover:text-zinc-200">
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
          <h1 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {mode === "student" ? "Course gap lab" : "Role gap lab"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {mode === "student"
              ? "Drop your syllabus and notes — Delta returns a survival score, a cooked meter, and a radar of topic pressure vs your coverage."
              : "Paste the JD and upload your résumé — Delta maps stack and story gaps with the same radar treatment."}
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
              <article className="rounded-3xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-2xl sm:p-8">
                <h2 className="mb-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">Academic mode</h2>
                <p className="mb-8 text-sm text-zinc-500">Target = syllabus or exam outline. Current = notes or quiz exports (PDF).</p>
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
              <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/8 to-transparent p-6 shadow-[0_0_0_1px_rgba(46,233,217,0.08)_inset] backdrop-blur-2xl sm:p-8">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-cyan-100/90">Delta dashboard</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Charts and the cooked meter light up after you run analysis. Golden demo pairs still land best on
                    stage.
                  </p>
                </div>
                <ul className="space-y-3 text-sm text-zinc-500">
                  <li className="flex gap-2">
                    <span className="text-cyan-400/80">01</span>
                    Radar: target vs you
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400/80">02</span>
                    Cooked meter & survival %
                  </li>
                  <li className="flex gap-2">
                    <span className="text-cyan-400/80">03</span>
                    Atomic bridges list
                  </li>
                </ul>
              </aside>
            </>
          ) : (
            <>
              <article className="rounded-3xl border border-white/[0.1] bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-2xl sm:p-8">
                <h2 className="mb-1 font-[family-name:var(--font-space-grotesk)] text-xl font-semibold text-white">Career mode</h2>
                <p className="mb-8 text-sm text-zinc-500">Target = job description (paste and/or PDF). Current = resume (PDF).</p>
                <div className="space-y-10">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.5)]"
                        aria-hidden
                      />
                      <span className="text-sm font-medium tracking-wide text-zinc-200">Job description (text)</span>
                    </div>
                    <p className="mb-2 text-xs text-zinc-500">Paste from LinkedIn, Greenhouse, or Notion.</p>
                    <textarea
                      rows={6}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste the full job description here…"
                      className="w-full resize-y rounded-2xl border border-white/[0.1] bg-black/45 px-4 py-3 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:border-rose-400/40 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
                    />
                    <p className="mt-1.5 text-right text-[11px] text-zinc-600">
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
              <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-500/8 to-transparent p-6 shadow-[0_0_0_1px_rgba(251,113,133,0.08)_inset] backdrop-blur-2xl sm:p-8">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-lg font-medium text-rose-100/90">LLM + fallback</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    Set <span className="font-mono text-zinc-300">OPENAI_API_KEY</span> for structured scoring. Without it,
                    Delta still renders radar + meter from heuristics.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.06] bg-black/35 p-4 font-mono text-[11px] leading-relaxed text-zinc-500">
                  <span className="text-rose-300/80">tip</span> — Keep a golden JD + resume pair for finals.
                </div>
              </aside>
            </>
          )}
        </motion.div>

        <section className="mt-12 space-y-6" aria-label="Run gap analysis">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-zinc-500">
              <span className="text-zinc-300">Target</span> {targetText.length.toLocaleString()} chars ·{" "}
              <span className="text-zinc-300">Current</span> {currentText.length.toLocaleString()} chars
              {!canRun && (
                <span className="block pt-1 text-xs text-zinc-600">Need ≥ 30 characters in both to run analysis.</span>
              )}
            </div>
            <button
              type="button"
              disabled={!canRun || analysisLoading}
              onClick={() => void runGap()}
              className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
                accent === "cyan"
                  ? "bg-gradient-to-r from-cyan-500/90 via-violet-500/85 to-emerald-500/80 shadow-cyan-500/15"
                  : "bg-gradient-to-r from-rose-500/90 via-violet-500/85 to-cyan-500/75 shadow-rose-500/15"
              }`}
            >
              {analysisLoading ? "Scoring…" : "Run gap analysis"}
            </button>
          </div>

          <GapAnalysisPanel analysis={analysis} loading={analysisLoading} error={analysisError} />
        </section>

        <footer className="pt-16 text-center text-xs text-zinc-600">Delta · gap engine + dashboard</footer>
      </div>
    </div>
  );
}

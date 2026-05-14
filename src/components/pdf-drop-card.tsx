"use client";

import { useCallback, useId, useState } from "react";

export type ParsePdfSuccess = {
  ok: true;
  fileName: string;
  numPages: number | null;
  charCount: number;
  preview: string;
  truncated: boolean;
  extractedText: string;
  truncatedExtracted: boolean;
};

type ParsePdfFail = { ok: false; error: string };

export type ParsePdfResponse = ParsePdfSuccess | ParsePdfFail;

type Props = {
  label: string;
  hint: string;
  accent: "cyan" | "violet" | "rose";
  onParsed?: (data: ParsePdfSuccess) => void;
};

const accentRing: Record<Props["accent"], string> = {
  cyan: "focus-visible:ring-cyan-500/40 hover:border-cyan-400/60 dark:focus-visible:ring-cyan-400/40 dark:hover:border-cyan-400/35",
  violet: "focus-visible:ring-violet-500/40 hover:border-violet-400/60 dark:focus-visible:ring-violet-400/40 dark:hover:border-violet-400/35",
  rose: "focus-visible:ring-rose-500/40 hover:border-rose-400/60 dark:focus-visible:ring-rose-400/40 dark:hover:border-rose-400/35",
};

const accentDot: Record<Props["accent"], string> = {
  cyan: "bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.35)] dark:bg-cyan-400 dark:shadow-[0_0_12px_rgba(34,211,238,0.5)]",
  violet: "bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.35)] dark:bg-violet-400 dark:shadow-[0_0_12px_rgba(167,139,250,0.5)]",
  rose: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.35)] dark:bg-rose-400 dark:shadow-[0_0_12px_rgba(251,113,133,0.5)]",
};

export function PdfDropCard({ label, hint, accent, onParsed }: Props) {
  const inputId = useId();
  const [drag, setDrag] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<ParsePdfSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/parse-pdf", { method: "POST", body });
      const data = (await res.json()) as ParsePdfResponse;
      if (!data.ok) {
        setError(data.error);
        setStatus("error");
        return;
      }
      setResult(data);
      setStatus("done");
      onParsed?.(data);
    } catch {
      setError("Network error while uploading.");
      setStatus("error");
    }
  }, [onParsed]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void parseFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void parseFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accentDot[accent]}`} aria-hidden />
        <label htmlFor={inputId} className="text-sm font-medium tracking-wide text-slate-800 dark:text-zinc-200">
          {label}
        </label>
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-zinc-500">{hint}</p>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={[
          "relative cursor-pointer rounded-2xl border border-dashed border-slate-300/90 bg-white p-6 transition-all dark:border-white/[0.12] dark:bg-white/[0.03] dark:backdrop-blur-md",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0 dark:focus-within:ring-offset-0",
          accentRing[accent],
          drag ? "scale-[1.01] border-violet-400/50 bg-violet-50/50 dark:border-white/25 dark:bg-white/[0.06]" : "",
        ].join(" ")}
      >
        <input
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={onInputChange}
        />
        <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center gap-2 text-center">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
            Drop PDF or browse
          </span>
          <span className="text-sm text-slate-600 dark:text-zinc-400">
            {status === "loading" ? (
              <span className="inline-flex items-center gap-2 text-cyan-700 dark:text-cyan-300/90">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-600 dark:border-cyan-400/30 dark:border-t-cyan-400" />
                Extracting text…
              </span>
            ) : (
              "Syllabus, past paper, resume — we extract text for the gap engine."
            )}
          </span>
        </label>
      </div>

      {status === "error" && error && (
        <p className="text-sm text-rose-700 dark:text-rose-300/90" role="alert">
          {error}
        </p>
      )}

      {status === "done" && result && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm dark:border-white/[0.08] dark:bg-black/40">
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-500">
            <span className="text-slate-800 dark:text-zinc-300">{result.fileName}</span>
            {result.numPages != null && <span>{result.numPages} pages</span>}
            <span>{result.charCount.toLocaleString()} characters</span>
            {result.truncated && <span className="text-amber-700 dark:text-amber-300/90">Preview truncated</span>}
          </div>
          <details className="group">
            <summary className="cursor-pointer list-none text-xs font-medium text-cyan-700 marker:content-none dark:text-cyan-300/90 [&::-webkit-details-marker]:hidden">
              <span className="underline decoration-cyan-500/40 underline-offset-2 group-open:no-underline dark:decoration-cyan-500/40">
                Show text preview
              </span>
            </summary>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 font-mono text-[11px] leading-relaxed text-slate-600 dark:border-black/50 dark:bg-black/50 dark:text-zinc-400">
              {result.preview || "— No extractable text (scanned PDF?). —"}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

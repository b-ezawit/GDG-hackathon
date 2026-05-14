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
  cyan: "focus-visible:ring-cyan-400/40 hover:border-cyan-400/35",
  violet: "focus-visible:ring-violet-400/40 hover:border-violet-400/35",
  rose: "focus-visible:ring-rose-400/40 hover:border-rose-400/35",
};

const accentDot: Record<Props["accent"], string> = {
  cyan: "bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.5)]",
  violet: "bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.5)]",
  rose: "bg-rose-400 shadow-[0_0_12px_rgba(251,113,133,0.5)]",
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
        <label htmlFor={inputId} className="text-sm font-medium tracking-wide text-zinc-200">
          {label}
        </label>
      </div>
      <p className="text-xs leading-relaxed text-zinc-500">{hint}</p>
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
          "relative cursor-pointer rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.03] p-6 transition-all backdrop-blur-md",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0",
          accentRing[accent],
          drag ? "scale-[1.01] border-white/25 bg-white/[0.06]" : "",
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
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Drop PDF or browse
          </span>
          <span className="text-sm text-zinc-400">
            {status === "loading" ? (
              <span className="inline-flex items-center gap-2 text-cyan-300/90">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />
                Extracting text…
              </span>
            ) : (
              "Syllabus, past paper, resume — we extract text for the gap engine."
            )}
          </span>
        </label>
      </div>

      {status === "error" && error && (
        <p className="text-sm text-rose-300/90" role="alert">
          {error}
        </p>
      )}

      {status === "done" && result && (
        <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left text-sm">
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
            <span className="text-zinc-300">{result.fileName}</span>
            {result.numPages != null && <span>{result.numPages} pages</span>}
            <span>{result.charCount.toLocaleString()} characters</span>
            {result.truncated && <span className="text-amber-300/90">Preview truncated</span>}
          </div>
          <details className="group">
            <summary className="cursor-pointer list-none text-xs font-medium text-cyan-300/90 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="underline decoration-cyan-500/40 underline-offset-2 group-open:no-underline">
                Show text preview
              </span>
            </summary>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
              {result.preview || "— No extractable text (scanned PDF?). —"}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

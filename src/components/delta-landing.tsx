"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

import { DeltaIntroSequence } from "@/components/delta-intro-sequence";
import { DeltaLogo } from "@/components/delta-logo";

const GlitterField = dynamic(() => import("@/components/glitter-field").then((m) => m.GlitterField), {
  ssr: false,
  loading: () => null,
});

export function DeltaLanding() {
  const [nestEagle, setNestEagle] = useState(false);
  const nestOnce = useRef(false);
  const logoAnchorRef = useRef<HTMLAnchorElement>(null);

  const handleNest = () => {
    if (nestOnce.current) return;
    nestOnce.current = true;
    setNestEagle(true);
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <GlitterField />

      <div
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-[120px] ds-aurora"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-48 h-[380px] w-[380px] rounded-full bg-violet-600/20 blur-[110px] ds-aurora"
        style={{ animationDelay: "-8s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-amber-900/10 blur-[100px]"
        aria-hidden
      />
      <div className="ds-grid-bg pointer-events-none absolute inset-0 opacity-[0.28]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-screen bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_55%)]"
        aria-hidden
      />

      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-8">
        <Link
          ref={logoAnchorRef}
          href="/"
          className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/35 px-2 py-1.5 pr-4 shadow-[0_0_0_1px_rgba(255,255,255,0.03)_inset] backdrop-blur-xl transition hover:border-cyan-400/25"
        >
          <DeltaLogo nestEagle={nestEagle} />
          <span className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold tracking-tight text-white">
            Delta
          </span>
        </Link>
        <span className="hidden font-mono text-[10px] text-zinc-600 sm:block">3D field · glass · motion</span>
      </header>

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto w-full max-w-2xl pb-2">
          <div className="mx-auto min-h-[10.5rem] w-full max-w-lg sm:min-h-[11.5rem]">
            <DeltaIntroSequence logoAnchorRef={logoAnchorRef} onNest={handleNest} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-2xl text-center"
        >
          <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
            Upload your materials and let Delta compare what matters in your target to what you have today — with a
            survival score and a radar you can feel.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-14 w-full max-w-xl"
          aria-label="Choose your path"
        >
          <p className="mb-5 text-center font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-zinc-400">
            Choose your path
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link href="/student" className="group relative block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/15 via-white/[0.04] to-transparent p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl transition group-hover:bg-cyan-400/30" />
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                  Academic
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-white">Student</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Syllabus or exam outline vs your notes — close the course gap.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-200/90">
                  Enter workspace
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </motion.div>
            </Link>

            <Link href="/career" className="group relative block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative overflow-hidden rounded-3xl border border-rose-500/25 bg-gradient-to-br from-rose-500/12 via-white/[0.04] to-transparent p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-rose-400/15 blur-3xl transition group-hover:bg-rose-400/25" />
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.28em] text-rose-200/80">
                  Career
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-white">Job seeker</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  Job description vs resume — see the exact stack and story gaps.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-rose-200/90">
                  Enter workspace
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        <footer className="mt-auto pt-24 text-center text-xs text-zinc-600">
          Delta · Phase 3 delta dashboard polish
        </footer>
      </main>
    </div>
  );
}

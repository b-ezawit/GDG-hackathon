"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type Props = {
  score: number;
  className?: string;
};

function scoreHue(s: number): string {
  if (s >= 72) return "from-emerald-400 via-teal-300 to-cyan-300";
  if (s >= 44) return "from-amber-400 via-orange-400 to-rose-400";
  return "from-rose-700 via-red-500 to-orange-500";
}

/** “Cooked meter” — survival score as a vivid gradient bar + glow. */
export function SurvivalMeter({ score, className }: Props) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const spring = useSpring(0, { stiffness: 90, damping: 22, mass: 0.9 });
  const width = useTransform(spring, (v) => `${v}%`);

  useEffect(() => {
    spring.set(clamped);
  }, [clamped, spring]);

  return (
    <div className={className}>
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Cooked meter
          </p>
          <p className="mt-1 text-[11px] text-zinc-600">Deep red = cooked · vibrant green = surviving</p>
        </div>
        <motion.span
          key={clamped}
          initial={{ scale: 0.92, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-gradient-to-br bg-clip-text font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tabular-nums tracking-tight text-transparent sm:text-5xl ${scoreHue(clamped)}`}
        >
          {clamped}%
        </motion.span>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-black/50 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="relative h-4 w-full overflow-hidden rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900">
          <div className="absolute inset-y-0 left-0 w-full opacity-40 mix-blend-screen bg-[repeating-linear-gradient(110deg,transparent,transparent_6px,rgba(255,255,255,0.06)_6px,rgba(255,255,255,0.06)_12px)]" />
          <motion.div
            style={{ width }}
            className={`relative h-full rounded-xl bg-gradient-to-r shadow-[0_0_32px_rgba(46,233,217,0.25)] ${scoreHue(clamped)}`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 to-transparent" />
            <motion.div
              className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/25 blur-md"
              animate={{ opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
        <div className="mt-2 flex justify-between px-0.5 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <span className="text-rose-400/80">Cooked</span>
          <span className="text-emerald-400/80">Surviving</span>
        </div>
      </div>
    </div>
  );
}

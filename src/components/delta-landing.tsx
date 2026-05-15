"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

import { DeltaIntroSequence } from "@/components/delta-intro-sequence";
import { AmICookedLogo } from "@/components/amicooked-logo";
import { ThemeToggle } from "@/components/app-theme";

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
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-white to-[#ffcccc] text-slate-900 dark:bg-none dark:bg-[#06050a] dark:text-zinc-100">
      <div className="hidden dark:block">
        <GlitterField />
      </div>

      <div
        className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-violet-400/20 blur-[120px] dark:bg-cyan-500/15 ds-aurora"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-48 h-[380px] w-[380px] rounded-full bg-indigo-400/25 blur-[110px] dark:bg-violet-600/20 ds-aurora"
        style={{ animationDelay: "-8s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-amber-200/30 blur-[100px] dark:bg-amber-900/10"
        aria-hidden
      />
      <div className="ds-grid-bg pointer-events-none absolute inset-0 opacity-60 dark:opacity-[0.28]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.08),transparent_55%)] opacity-100 dark:opacity-[0.12] dark:mix-blend-screen dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.16),transparent_55%)]"
        aria-hidden
      />

      <header className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl dark:border-white/[0.06] dark:bg-black/45 dark:shadow-none sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Link
            ref={logoAnchorRef}
            href="/"
            className="group flex items-center gap-3"
          >
            <AmICookedLogo nestEagle={nestEagle} />
            <span className="font-['Trajan',serif] text-lg font-semibold tracking-tight text-[#ff5a00] dark:text-[#ff5a00]">
              AmICooked
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <Link href="/student" className="text-slate-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors">Student</Link>
            <Link href="/career" className="text-slate-600 hover:text-violet-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors">Job Seeker</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm sm:inline-flex dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI online
            </span>
            <ThemeToggle />
          </div>
        </div>
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
          <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400 sm:text-base">
            Upload your materials and AmICooked measures how cooked you are target vs what you actually have with a
            survival score, a cooked meter, and a radar you can feel.
          </p>
        </motion.div>

        <CarouselSection />

        <motion.section
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-14 w-full max-w-xl"
          aria-label="Choose your path"
        >
          <p className="mb-5 text-center font-[family-name:var(--font-space-grotesk)] text-sm font-medium text-slate-500 dark:text-zinc-400">
            Choose your path
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <Link href="/student" className="group relative block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative overflow-hidden rounded-3xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50 via-white to-white p-8 shadow-md dark:border-cyan-500/25 dark:from-cyan-500/15 dark:via-white/[0.04] dark:to-transparent dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] dark:backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-cyan-300/40 blur-3xl transition group-hover:bg-cyan-300/55 dark:bg-cyan-400/20 dark:group-hover:bg-cyan-400/30" />
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700 dark:text-cyan-200/80">
                  Academic
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 dark:text-white">
                  Student
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  Syllabus or exam outline vs your notes see how cooked you are for the course.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 dark:text-cyan-200/90">
                  Enter workspace
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </motion.div>
            </Link>

            <Link href="/career" className="group relative block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60">
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 28 }}
                className="relative overflow-hidden rounded-3xl border border-rose-200/90 bg-gradient-to-br from-rose-50 via-white to-white p-8 shadow-md dark:border-rose-500/25 dark:from-rose-500/12 dark:via-white/[0.04] dark:to-transparent dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset] dark:backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute -right-10 top-0 h-36 w-36 rounded-full bg-rose-200/50 blur-3xl transition group-hover:bg-rose-300/60 dark:bg-rose-400/15 dark:group-hover:bg-rose-400/25" />
                <p className="font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.28em] text-rose-700 dark:text-rose-200/80">
                  Career
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 dark:text-white">
                  Job seeker
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
                  Job description vs résumé map stack and story gaps before the loop.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-200/90">
                  Enter workspace
                  <span aria-hidden className="transition group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </motion.div>
            </Link>
          </div>
        </motion.section>

        <footer className="mt-auto pt-24 text-center text-xs text-slate-500 dark:text-zinc-600">
          AmICooked · gap engine + cooked meter
        </footer>
      </main>
    </div>
  );
}

function CarouselSection() {
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      icon: <LayoutDashboard className="h-4 w-4" strokeWidth={1.75} />,
      iconColor: "text-violet-600 dark:text-violet-300",
      title: "Dashboard",
      heading: "Cooked meter + radar",
      desc: "One glance at how exam or interview ready you look on paper."
    },
    {
      icon: <Sparkles className="h-4 w-4" strokeWidth={1.75} />,
      iconColor: "text-amber-600 dark:text-amber-300",
      title: "AI insight",
      heading: "Topic pressure map",
      desc: "Highlights what the syllabus or JD keeps asking for that your notes or résumé barely touch."
    },
    {
      icon: <BookOpen className="h-4 w-4" strokeWidth={1.75} />,
      iconColor: "text-teal-600 dark:text-teal-300",
      title: "Prep loop",
      heading: "Hot Seat drill",
      desc: "Short, sharp practice on your weakest gaps before the real room."
    }
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.52, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-10 relative flex h-[160px] w-full max-w-4xl items-center justify-center overflow-visible"
      aria-label="Product snapshot"
    >
      {cards.map((card, i) => {
        const isActive = i === activeCard;
        const isLeft = i === (activeCard + 2) % 3;
        const isRight = i === (activeCard + 1) % 3;

        let x = 0;
        let zIndex = 10;
        let scale = 1;
        let filter = "blur(0px)";
        let opacity = 1;

        if (isLeft) {
          x = -240;
          zIndex = 5;
          scale = 0.85;
          filter = "blur(4px)";
          opacity = 0.6;
        } else if (isRight) {
          x = 240;
          zIndex = 5;
          scale = 0.85;
          filter = "blur(4px)";
          opacity = 0.6;
        }

        return (
          <motion.div
            key={i}
            animate={{ x, scale, filter, opacity, zIndex }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
            className="absolute w-[300px] sm:w-[320px] rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none"
          >
            <div className={`mb-2 flex items-center gap-2 ${card.iconColor}`}>
              {card.icon}
              <span className="text-[11px] font-semibold uppercase tracking-wider">{card.title}</span>
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{card.heading}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-zinc-500">
              {card.desc}
            </p>
          </motion.div>
        );
      })}
    </motion.section>
  );
}

"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { EAGLE_PHOTO_URL } from "@/lib/eagle-assets";

const LETTERS = ["C", "O", "O", "K", "E", "D", "?"] as const;

const HOOK =
  "How cooked are you really — before the exam hall or the interview room decides for you?";

const EAGLE_W = 76;
const EAGLE_H = 58;

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function Letter({ x, lx, ch }: { x: MotionValue<number>; lx: number; ch: string }) {
  const opacity = useTransform(x, (v) => {
    const tail = v;
    const start = lx - 52;
    const end = lx + 8;
    return clamp01((tail - start) / (end - start));
  });

  return (
    <motion.span
      className="pointer-events-none absolute top-1/2 -translate-y-1/2 font-[family-name:var(--font-space-grotesk)] text-[clamp(2.5rem,7.5vw,3.8rem)] font-bold uppercase tracking-[0.12em] text-transparent"
      style={{
        left: lx,
        opacity,
        backgroundImage: "linear-gradient(135deg, #ff7e00, #ff3c00)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        filter: "drop-shadow(0 6px 20px rgba(255,90,0,0.3))",
      }}
      aria-hidden
    >
      {ch}
    </motion.span>
  );
}

type Props = {
  logoAnchorRef: RefObject<HTMLElement | null>;
  onNest: () => void;
};

/**
 * Eagle flies along the DELTA track; each letter fades in as the bird passes (wake on its tail).
 * Phase 2: same eagle stays visible while it glides into the header; logo receives the bird, then the overlay fades.
 */
export function DeltaIntroSequence({ logoAnchorRef, onNest }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const eagleImgRef = useRef<HTMLImageElement>(null);
  const nestOnce = useRef(false);
  const passStarted = useRef(false);
  const passCtrl = useRef<ReturnType<typeof animate> | null>(null);
  const onNestRef = useRef(onNest);

  useEffect(() => {
    onNestRef.current = onNest;
  }, [onNest]);

  const [trackW, setTrackW] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);
  const trackWRef = useRef(0);

  const x = useMotionValue(-EAGLE_W - 8);

  const [phase, setPhase] = useState<"pass" | "bridge" | "done">("pass");
  const [bridge, setBridge] = useState<{ left: number; top: number; w: number; h: number } | null>(null);
  const [fly, setFly] = useState({ left: 0, top: 0, w: EAGLE_W, h: EAGLE_H });
  const flyOpacity = useMotionValue(1);

  const letterLefts =
    trackW > 80
      ? LETTERS.map((_, i) => {
          const gap = (trackW - 48) / (LETTERS.length + 1);
          return 16 + i * gap * 1.05;
        })
      : LETTERS.map((_, i) => 20 + i * 56);

  const hookOpacity = useTransform(x, (v) => {
    const w = Math.max(120, trackWRef.current);
    const gap = (w - 48) / (LETTERS.length + 1);
    const lastIdx = LETTERS.length - 1;
    const lastL = 16 + lastIdx * gap * 1.05;
    const start = lastL + 24;
    const end = lastL + 130;
    return clamp01((v - start) / (end - start));
  });

  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const measureTrack = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 40) {
      trackWRef.current = w;
      setTrackW(w);
    }
  }, []);

  useLayoutEffect(() => {
    measureTrack();
  }, [measureTrack]);

  /** Measure + one-shot pass (single ResizeObserver). */
  useEffect(() => {
    if (phase !== "pass" || passStarted.current) return;
    const el = trackRef.current;
    if (!el) return;

    const tryStart = () => {
      if (passStarted.current || phaseRef.current !== "pass") return;
      const w = el.getBoundingClientRect().width;
      if (w < 120) return;
      passStarted.current = true;

      const start = -EAGLE_W - 12;
      const end = w + EAGLE_W * 0.35;
      x.set(start);

      passCtrl.current?.stop();
      passCtrl.current = animate(x, end, {
        duration: 4.45,
        ease: "linear",
        onComplete: () => {
          const img = eagleImgRef.current;
          const anchor = logoAnchorRef.current;
          if (!img || !anchor) {
            if (!nestOnce.current) {
              nestOnce.current = true;
              onNestRef.current();
            }
            setPhase("done");
            return;
          }
          const r = img.getBoundingClientRect();
          setBridge({ left: r.left, top: r.top, w: r.width, h: r.height });
          setFly({ left: r.left, top: r.top, w: r.width, h: r.height });
          setPhase("bridge");
        },
      });
    };

    const ro = new ResizeObserver(() => {
      measureTrack();
      tryStart();
    });
    ro.observe(el);
    measureTrack();
    tryStart();
    const t = window.setTimeout(tryStart, 120);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
      passCtrl.current?.stop();
      passStarted.current = false;
    };
  }, [phase, logoAnchorRef, x, measureTrack]);

  useEffect(() => {
    if (phase !== "bridge" || !bridge) return;
    const anchor = logoAnchorRef.current;
    if (!anchor) {
      if (!nestOnce.current) {
        nestOnce.current = true;
        onNestRef.current();
      }
      setPhase("done");
      return;
    }

    const logoR = anchor.getBoundingClientRect();
    const targetW = Math.max(28, logoR.width * 0.52);
    const targetH = (targetW * EAGLE_H) / EAGLE_W;
    const targetLeft = logoR.left + logoR.width / 2 - targetW / 2;
    const targetTop = logoR.top + logoR.height / 2 - targetH / 2;

    let fadeCtrl: ReturnType<typeof animate> | null = null;

    const moveCtrl = animate(0, 1, {
      duration: 2.65,
      ease: [0.18, 0.92, 0.32, 1],
      onUpdate: (t) => {
        setFly({
          left: bridge.left + (targetLeft - bridge.left) * t,
          top: bridge.top + (targetTop - bridge.top) * t,
          w: bridge.w + (targetW - bridge.w) * t,
          h: bridge.h + (targetH - bridge.h) * t,
        });
      },
      onComplete: () => {
        if (!nestOnce.current) {
          nestOnce.current = true;
          onNestRef.current();
        }
        flyOpacity.set(1);
        fadeCtrl = animate(1, 0, {
          duration: 0.32,
          ease: "linear",
          onUpdate: (v) => flyOpacity.set(v),
          onComplete: () => setPhase("done"),
        });
      },
    });

    return () => {
      moveCtrl.stop();
      fadeCtrl?.stop();
    };
  }, [phase, bridge, logoAnchorRef, flyOpacity]);

  const showEmoji = true; // Always show emoji (🔥) instead of the eagle image

  return (
    <div className="relative z-[24] mx-auto w-full max-w-2xl px-4 pt-2">
      <div ref={trackRef} className="relative mx-auto h-[5.5rem] w-full max-w-xl overflow-visible sm:h-[6rem]">
        {LETTERS.map((ch, i) => (
          <Letter key={`${ch}-${i}`} x={x} lx={letterLefts[i] ?? 0} ch={ch} />
        ))}

        {phase === "pass" && (
          <motion.div
            className="pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 will-change-transform"
            style={{ left: 0, x }}
          >
            {showEmoji ? (
              <span
                className="flex h-[58px] w-[76px] select-none items-center justify-center text-[3.35rem] leading-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)] sm:h-[62px] sm:w-[82px] sm:text-[3.65rem]"
                role="img"
                aria-label="Fire"
              >
                🔥
              </span>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- Wikimedia; onError → emoji
              <img
                ref={eagleImgRef}
                src={EAGLE_PHOTO_URL}
                alt=""
                width={EAGLE_W}
                height={EAGLE_H}
                className="h-[58px] w-[76px] rounded-lg border border-slate-200 object-cover shadow-lg ring-1 ring-slate-200/80 dark:border-white/15 dark:shadow-[0_12px_36px_rgba(0,0,0,0.55)] dark:ring-white/10 sm:h-[62px] sm:w-[82px]"
                draggable={false}
                onError={() => setImgFailed(true)}
              />
            )}
          </motion.div>
        )}
      </div>

      <motion.p
        className="mx-auto mt-3 max-w-[22rem] text-center text-[0.8125rem] font-medium leading-snug text-slate-500 dark:text-zinc-500 sm:max-w-md sm:text-sm"
        style={{ opacity: hookOpacity }}
      >
        {HOOK}
      </motion.p>

      {phase === "bridge" && bridge && (
        <motion.div
          className="pointer-events-none fixed z-[45] will-change-transform"
          style={{
            left: fly.left,
            top: fly.top,
            width: fly.w,
            height: fly.h,
            opacity: flyOpacity,
          }}
        >
          {showEmoji ? (
            <span
              className="flex h-full w-full items-center justify-center text-[2.75rem] leading-none drop-shadow-lg sm:text-[3.1rem]"
              role="img"
              aria-label="Fire"
            >
              🔥
            </span>
          ) : (
            <img
              src={EAGLE_PHOTO_URL}
              alt=""
              width={Math.round(fly.w)}
              height={Math.round(fly.h)}
              className="h-full w-full rounded-lg border border-slate-200 object-cover shadow-2xl ring-1 ring-slate-200/80 dark:border-white/15 dark:ring-white/10"
              draggable={false}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

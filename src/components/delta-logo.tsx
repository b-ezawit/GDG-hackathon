"use client";

import { useId, useState } from "react";

import { EAGLE_PHOTO_URL } from "@/lib/eagle-assets";

type Props = {
  /** When true, eagle sits inside the delta mark (post-intro). */
  nestEagle: boolean;
  className?: string;
};

/** Δ mark with optional nested eagle — same photo as intro when available. */
export function DeltaLogo({ nestEagle, className }: Props) {
  const rid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const strokeId = `deltaStroke-${rid}`;
  const glowId = `deltaGlow-${rid}`;
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={`relative flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16 ${className ?? ""}`}
      aria-label="Delta"
    >
      <svg
        viewBox="0 0 64 64"
        className="h-full w-full drop-shadow-[0_0_18px_rgba(46,233,217,0.18)]"
        aria-hidden
      >
        <defs>
          <linearGradient id={strokeId} x1="10" y1="54" x2="54" y2="54" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2ee9d9" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#a78bfa" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fb7185" stopOpacity="0.9" />
          </linearGradient>
          <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M8 52 L32 10 L56 52 Z"
          fill="rgba(255,255,255,0.04)"
          stroke={`url(#${strokeId})`}
          strokeWidth="2.2"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />
      </svg>
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          nestEagle ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
        aria-hidden
      >
        {imgFailed ? (
          <span className="translate-y-[1px] text-[1.2rem] leading-none sm:text-[1.35rem]" role="img">
            🦅
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={EAGLE_PHOTO_URL}
            alt=""
            width={36}
            height={28}
            className="translate-y-[1px] rounded-md border border-white/15 object-cover shadow-md ring-1 ring-white/10"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
    </div>
  );
}

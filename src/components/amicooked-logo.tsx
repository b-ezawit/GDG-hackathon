"use client";

import { useId } from "react";

type Props = {
  /** When true, optional nested mark (kept for landing intro compatibility). */
  nestEagle: boolean;
  className?: string;
};

/** AmICooked mark — purple flame in a soft circle (matches light dashboard reference). */
export function AmICookedLogo({ nestEagle, className }: Props) {
  const rid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const gradId = `amicookedFlame-${rid}`;

  return (
    <div
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25 ring-1 ring-white/25 sm:h-12 sm:w-12 ${className ?? ""}`}
      aria-label="AmICooked"
    >
      <svg viewBox="0 0 64 64" className="h-[62%] w-[62%] text-white drop-shadow-md" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="32" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradId})`}
          d="M32 10c-4 8-12 14-12 26 0 10 6 18 12 18s12-8 12-18c0-8-4-14-8-18 2 6 2 12-2 16 1-8-1-16-2-24z"
        />
      </svg>
      {nestEagle ? (
        <span
          className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-bold text-emerald-950 shadow-sm ring-2 ring-white dark:ring-violet-950"
          aria-hidden
        >
          ✓
        </span>
      ) : null}
    </div>
  );
}

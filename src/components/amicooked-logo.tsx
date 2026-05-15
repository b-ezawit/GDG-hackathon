"use client";

import { useId } from "react";

type Props = {
  /** When true, optional nested mark (kept for landing intro compatibility). */
  nestEagle: boolean;
  className?: string;
};

/** AmICooked mark — purple flame in a soft circle (matches light dashboard reference). */
export function AmICookedLogo({ nestEagle, className }: Props) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${className ?? ""}`}
      aria-label="AmICooked"
    >
      <img src="/logo.png" alt="Logo" className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover" />
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

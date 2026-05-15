"use client";

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

export type AppTheme = "light" | "dark";

const STORAGE_KEY = "amicooked-theme";

const ThemeContext = createContext<{
  theme: AppTheme;
  toggleTheme: () => void;
  mounted: boolean;
}>({
  theme: "light",
  toggleTheme: () => {},
  mounted: false,
});

function readStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  try {
    const s = localStorage.getItem(STORAGE_KEY) as AppTheme | null;
    if (s === "dark" || s === "light") return s;
  } catch {
    /* ignore */
  }
  return "light";
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<AppTheme>("light");
  const [mounted, setMounted] = useState(false);
  const didHydrate = useRef(false);

  useLayoutEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const initial = readStoredTheme();
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initial);
    requestAnimationFrame(() => {
      setTheme(initial);
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useAppTheme();
  const isLight = !mounted || theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        className ??
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:border-white/20 dark:hover:text-white"
      }
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
    >
      {isLight ? <Sun className="h-[18px] w-[18px]" strokeWidth={1.75} /> : <Moon className="h-[18px] w-[18px]" strokeWidth={1.75} />}
    </button>
  );
}

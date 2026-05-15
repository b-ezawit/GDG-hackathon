"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { useAppTheme } from "@/components/app-theme";
import type { RadarPoint } from "@/lib/gap-schema";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

type Row = { subject: string; Target: number; You: number };

export function GapRadarChart({ radar, topicsFallback }: { radar: RadarPoint[]; topicsFallback?: Row[] }) {
  const { theme } = useAppTheme();
  const isDark = theme === "dark";

  const fromRadar: Row[] | null =
    radar.length >= 3
      ? radar.map((r) => ({
          subject: truncate(r.axis, 18),
          Target: r.target,
          You: r.current,
        }))
      : null;

  const fromTopics = (topicsFallback ?? []).map((r) => ({
    subject: truncate(r.subject, 18),
    Target: r.Target,
    You: r.You,
  }));

  const data: Row[] = fromRadar ?? (fromTopics.length >= 3 ? fromTopics.slice(0, 10) : []);

  if (data.length < 3) {
    return (
      <p className="rounded-2xl border border-slate-200/90 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-white/[0.06] dark:bg-black/30 dark:text-zinc-500 dark:backdrop-blur-md">
        Not enough radar points yet — run analysis again after richer uploads.
      </p>
    );
  }

  const gridStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";
  const tickFill = isDark ? "#a1a1aa" : "#64748b";
  const radiusTick = isDark ? "#71717a" : "#94a3b8";
  const legendColor = isDark ? "#a1a1aa" : "#64748b";
  const tipBg = isDark ? "rgba(8,6,14,0.92)" : "rgba(255,255,255,0.96)";
  const tipBorder = isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(15,23,42,0.12)";
  const labelColor = isDark ? "#e4e4e7" : "#0f172a";

  return (
    <div className="relative h-[min(420px,70vw)] w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50 p-4 shadow-md dark:border-white/[0.08] dark:from-white/[0.06] dark:to-transparent dark:shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] dark:backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(124,58,237,0.08),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_30%_0%,rgba(46,233,217,0.12),transparent_50%)]" />
      <p className="relative mb-2 font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-zinc-500">
        Skill gap radar
      </p>
      <div className="relative h-[calc(100%-1.5rem)] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="52%" outerRadius="70%" data={data}>
            <PolarGrid stroke={gridStroke} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: tickFill, fontSize: 11 }} />
            <PolarRadiusAxis angle={32} domain={[0, 100]} tick={{ fill: radiusTick, fontSize: 9 }} />
            <Radar name="Target" dataKey="Target" stroke="#0891b2" strokeWidth={1.6} fill="#06b6d4" fillOpacity={isDark ? 0.22 : 0.18} />
            <Radar name="You" dataKey="You" stroke="#7c3aed" strokeWidth={1.6} fill="#8b5cf6" fillOpacity={isDark ? 0.28 : 0.2} />
            <Legend
              wrapperStyle={{ color: legendColor, fontSize: 12 }}
              formatter={(value) => <span className="text-slate-600 dark:text-zinc-400">{value}</span>}
            />
            <Tooltip
              contentStyle={{
                background: tipBg,
                border: tipBorder,
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: labelColor }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

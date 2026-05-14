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

import type { RadarPoint } from "@/lib/gap-schema";

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

type Row = { subject: string; Target: number; You: number };

export function GapRadarChart({ radar, topicsFallback }: { radar: RadarPoint[]; topicsFallback?: Row[] }) {
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
      <p className="rounded-2xl border border-white/[0.06] bg-black/30 p-6 text-sm text-zinc-500 backdrop-blur-md">
        Not enough radar points yet — run analysis again after richer uploads.
      </p>
    );
  }

  return (
    <div className="relative h-[min(420px,70vw)] w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-transparent p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(46,233,217,0.12),transparent_50%)]" />
      <p className="relative mb-2 font-[family-name:var(--font-space-grotesk)] text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
        Skill gap radar
      </p>
      <div className="relative h-[calc(100%-1.5rem)] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="52%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
            <PolarRadiusAxis angle={32} domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 9 }} />
            <Radar name="Target" dataKey="Target" stroke="#2ee9d9" strokeWidth={1.6} fill="#2ee9d9" fillOpacity={0.22} />
            <Radar name="You" dataKey="You" stroke="#c4b5fd" strokeWidth={1.6} fill="#a78bfa" fillOpacity={0.28} />
            <Legend
              wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }}
              formatter={(value) => <span className="text-zinc-400">{value}</span>}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(8,6,14,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e4e4e7" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CheckIn, Impulse } from "@/types/database";

// --------------- Types ---------------

interface WeekChartsProps {
  checkIns: CheckIn[];
  impulses: Impulse[];
  habitCompletionRate?: number; // 0-100
  className?: string;
}

// --------------- Mock data (demonstration) ---------------

const MOCK_CHECK_INS: Pick<CheckIn, "date" | "energy" | "mood" | "anxiety" | "focus">[] = [
  { date: "2026-03-16", energy: 3, mood: 3, anxiety: 4, focus: 2 },
  { date: "2026-03-17", energy: 4, mood: 4, anxiety: 3, focus: 3 },
  { date: "2026-03-18", energy: 2, mood: 2, anxiety: 5, focus: 1 },
  { date: "2026-03-19", energy: 3, mood: 3, anxiety: 3, focus: 3 },
  { date: "2026-03-20", energy: 4, mood: 4, anxiety: 2, focus: 4 },
  { date: "2026-03-21", energy: 5, mood: 5, anxiety: 1, focus: 4 },
  { date: "2026-03-22", energy: 4, mood: 4, anxiety: 2, focus: 3 },
];

const DAY_LABELS: Record<string, string> = {
  "2026-03-16": "Seg",
  "2026-03-17": "Ter",
  "2026-03-18": "Qua",
  "2026-03-19": "Qui",
  "2026-03-20": "Sex",
  "2026-03-21": "Sab",
  "2026-03-22": "Dom",
};

// --------------- Chart config ---------------

const ACCENT = "var(--accent)";
const ACCENT_HOVER = "var(--accent-hover)";
const WARNING = "var(--warning)";
const TEXT_MUTED = "var(--text-muted)";
const BORDER_SUBTLE = "var(--border-subtle)";

// Custom tooltip
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface px-3 py-2 shadow-md",
        "text-xs"
      )}
    >
      <p className="font-medium text-text-primary mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-text-secondary">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

// --------------- Component ---------------

export function WeekCharts({
  checkIns,
  impulses,
  habitCompletionRate,
  className,
}: WeekChartsProps) {
  // Use real data if available, otherwise mock
  const hasRealData = checkIns.length > 0;
  const sourceData = hasRealData ? checkIns : MOCK_CHECK_INS;

  const chartData = sourceData.map((ci) => ({
    day: DAY_LABELS[ci.date] ?? ci.date.slice(5),
    energia: ci.energy,
    humor: ci.mood,
    ansiedade: ci.anxiety,
    foco: ci.focus,
  }));

  // Impulse count by type for bar chart
  const impulseByType: Record<string, number> = {};
  for (const imp of impulses) {
    const label = IMPULSE_TYPE_LABELS[imp.type] ?? imp.type;
    impulseByType[label] = (impulseByType[label] ?? 0) + 1;
  }
  const impulseBarData = Object.entries(impulseByType).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div className={cn("space-y-5", className)}>
      {/* Mood / Energy line chart */}
      <Card className="border-border-subtle">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Humor e Energia</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {!hasRealData && (
            <p className="text-[10px] text-text-muted mb-2">
              Dados de demonstracao
            </p>
          )}
          <div className="h-44 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={BORDER_SUBTLE}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: TEXT_MUTED }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 3, 5]}
                  tick={{ fontSize: 11, fill: TEXT_MUTED }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="humor"
                  name="Humor"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: ACCENT }}
                />
                <Line
                  type="monotone"
                  dataKey="energia"
                  name="Energia"
                  stroke={ACCENT_HOVER}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 3, fill: ACCENT_HOVER }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Anxiety trend */}
      <Card className="border-border-subtle">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm">Ansiedade</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-36 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={BORDER_SUBTLE}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: TEXT_MUTED }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 3, 5]}
                  tick={{ fontSize: 11, fill: TEXT_MUTED }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="ansiedade"
                  name="Ansiedade"
                  stroke={WARNING}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: WARNING }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Habits completion (simple visual) */}
      {habitCompletionRate !== undefined && (
        <Card className="border-border-subtle">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Habitos concluidos</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={BORDER_SUBTLE}
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={ACCENT}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(habitCompletionRate / 100) * 94.2} 94.2`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-text-primary tabular-nums">
                  {Math.round(habitCompletionRate)}%
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {habitCompletionRate >= 70
                  ? "Semana consistente. Isso importa."
                  : habitCompletionRate >= 40
                    ? "Alguns dias foram mais dificeis, e tudo bem."
                    : "Semana de desafios. O que voce pode ajustar?"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impulses by type (bar chart) */}
      {impulseBarData.length > 0 && (
        <Card className="border-border-subtle">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Impulsos por tipo</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-36 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={impulseBarData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={BORDER_SUBTLE}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="type"
                    tick={{ fontSize: 10, fill: TEXT_MUTED }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: TEXT_MUTED }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Impulsos"
                    fill={ACCENT}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// --------------- Helpers ---------------

const IMPULSE_TYPE_LABELS: Record<string, string> = {
  smoking: "Cigarro",
  social_media: "Redes",
  pornography: "Porn.",
  binge_eating: "Compulsao",
  substance: "Subst.",
  other: "Outro",
};

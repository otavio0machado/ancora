"use client";

import { useMemo } from "react";
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
  ReferenceDot,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import type { CheckIn, Impulse } from "@/types/database";

// --------------- Types ---------------

interface WeekChartsProps {
  checkIns: CheckIn[];
  impulses: Impulse[];
  prevWeekCheckIns?: CheckIn[];
  habitCompletionRate?: number; // 0-100
  className?: string;
}

// --------------- Mock data (demonstration) ---------------

const MOCK_CHECK_INS: Pick<
  CheckIn,
  "date" | "energy" | "mood" | "anxiety" | "focus" | "sleep_quality"
>[] = [
  { date: "2026-03-16", energy: 3, mood: 3, anxiety: 4, focus: 2, sleep_quality: 2 },
  { date: "2026-03-17", energy: 4, mood: 4, anxiety: 3, focus: 3, sleep_quality: 3 },
  { date: "2026-03-18", energy: 2, mood: 2, anxiety: 5, focus: 1, sleep_quality: 2 },
  { date: "2026-03-19", energy: 3, mood: 3, anxiety: 3, focus: 3, sleep_quality: 4 },
  { date: "2026-03-20", energy: 4, mood: 4, anxiety: 2, focus: 4, sleep_quality: 4 },
  { date: "2026-03-21", energy: 5, mood: 5, anxiety: 1, focus: 4, sleep_quality: 5 },
  { date: "2026-03-22", energy: 4, mood: 4, anxiety: 2, focus: 3, sleep_quality: 3 },
];

const MOCK_PREV_WEEK: Pick<
  CheckIn,
  "date" | "energy" | "mood" | "anxiety" | "focus" | "sleep_quality"
>[] = [
  { date: "2026-03-09", energy: 2, mood: 2, anxiety: 4, focus: 2, sleep_quality: 2 },
  { date: "2026-03-10", energy: 3, mood: 3, anxiety: 4, focus: 2, sleep_quality: 3 },
  { date: "2026-03-11", energy: 2, mood: 3, anxiety: 3, focus: 2, sleep_quality: 2 },
  { date: "2026-03-12", energy: 3, mood: 2, anxiety: 4, focus: 3, sleep_quality: 3 },
  { date: "2026-03-13", energy: 3, mood: 3, anxiety: 3, focus: 3, sleep_quality: 3 },
  { date: "2026-03-14", energy: 4, mood: 4, anxiety: 2, focus: 4, sleep_quality: 4 },
  { date: "2026-03-15", energy: 3, mood: 3, anxiety: 3, focus: 3, sleep_quality: 3 },
];

const MOCK_IMPULSES: Impulse[] = [
  {
    id: "imp-1", user_id: "user-1", type: "smoking", intensity: 7,
    trigger: "Tedio", context: "Em casa a noite", emotion_before: "Ansioso",
    technique_used: "breathing", resisted: true, notes: null,
    duration_minutes: 15, technique_effectiveness: 4, linked_value: "saude",
    recovery_entry_id: null, created_at: "2026-03-18T22:30:00Z",
  },
  {
    id: "imp-2", user_id: "user-1", type: "social_media", intensity: 5,
    trigger: "Tedio", context: "Intervalo do trabalho", emotion_before: "Cansado",
    technique_used: "delay", resisted: true, notes: null,
    duration_minutes: 5, technique_effectiveness: 3, linked_value: null,
    recovery_entry_id: null, created_at: "2026-03-17T14:00:00Z",
  },
  {
    id: "imp-3", user_id: "user-1", type: "smoking", intensity: 8,
    trigger: "Estresse", context: "Apos discussao", emotion_before: "Raiva",
    technique_used: "tip", resisted: false, notes: null,
    duration_minutes: null, technique_effectiveness: 2, linked_value: "saude",
    recovery_entry_id: null, created_at: "2026-03-18T20:00:00Z",
  },
  {
    id: "imp-4", user_id: "user-1", type: "social_media", intensity: 4,
    trigger: "Tedio", context: "Na fila", emotion_before: "Entediado",
    technique_used: null, resisted: false, notes: null,
    duration_minutes: null, technique_effectiveness: null, linked_value: null,
    recovery_entry_id: null, created_at: "2026-03-19T11:00:00Z",
  },
  {
    id: "imp-5", user_id: "user-1", type: "smoking", intensity: 6,
    trigger: "Cansaco", context: "Fim do dia", emotion_before: "Exausto",
    technique_used: "breathing", resisted: true, notes: null,
    duration_minutes: 10, technique_effectiveness: 4, linked_value: "saude",
    recovery_entry_id: null, created_at: "2026-03-20T23:00:00Z",
  },
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

const PREV_DAY_LABELS: Record<string, string> = {
  "2026-03-09": "Seg",
  "2026-03-10": "Ter",
  "2026-03-11": "Qua",
  "2026-03-12": "Qui",
  "2026-03-13": "Sex",
  "2026-03-14": "Sab",
  "2026-03-15": "Dom",
};

// --------------- Chart config ---------------

const ACCENT = "var(--accent)";
const ACCENT_HOVER = "var(--accent-hover)";
const WARNING = "var(--warning)";
const TEXT_MUTED = "var(--text-muted)";
const BORDER_SUBTLE = "var(--border-subtle)";
const SLEEP_COLOR = "#8B9DC3";

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

// Trend arrow component
function TrendArrow({
  current,
  previous,
  inverted,
}: {
  current: number;
  previous: number;
  inverted?: boolean; // true for anxiety where lower is better
}) {
  const diff = current - previous;
  const threshold = 0.3;

  let isImproving: boolean;
  if (inverted) {
    isImproving = diff < -threshold;
  } else {
    isImproving = diff > threshold;
  }
  const isDeclining = inverted ? diff > threshold : diff < -threshold;

  if (isImproving) {
    return (
      <span className="inline-flex items-center gap-0.5 text-accent">
        <TrendingUp size={12} strokeWidth={2} />
      </span>
    );
  }
  if (isDeclining) {
    return (
      <span className="inline-flex items-center gap-0.5 text-warning">
        <TrendingDown size={12} strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-text-muted">
      <Minus size={12} strokeWidth={2} />
    </span>
  );
}

// --------------- Component ---------------

export function WeekCharts({
  checkIns,
  impulses,
  prevWeekCheckIns,
  habitCompletionRate,
  className,
}: WeekChartsProps) {
  // Use real data if available, otherwise mock
  const hasRealData = checkIns.length > 0;
  const sourceData = hasRealData ? checkIns : MOCK_CHECK_INS;
  const prevData = hasRealData
    ? prevWeekCheckIns ?? []
    : MOCK_PREV_WEEK;
  const impulseData = hasRealData ? impulses : MOCK_IMPULSES;

  // Build chart data with previous week overlay
  const chartData = sourceData.map((ci, i) => {
    const prev = prevData[i];
    return {
      day: DAY_LABELS[ci.date] ?? ci.date.slice(5),
      energia: ci.energy,
      humor: ci.mood,
      sono: (ci as { sleep_quality?: number | null }).sleep_quality ?? null,
      ansiedade: ci.anxiety,
      foco: ci.focus,
      // Previous week (dotted lines)
      energiaPrev: prev?.energy ?? null,
      humorPrev: prev?.mood ?? null,
      ansiedadePrev: prev?.anxiety ?? null,
    };
  });

  // Find best day (highest combined mood + energy)
  const bestDayIndex = useMemo(() => {
    let bestIdx = 0;
    let bestScore = 0;
    chartData.forEach((d, i) => {
      const score = d.humor + d.energia;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    });
    return bestIdx;
  }, [chartData]);

  // Calculate averages for trends
  const avgMood =
    chartData.reduce((s, d) => s + d.humor, 0) / chartData.length;
  const avgEnergy =
    chartData.reduce((s, d) => s + d.energia, 0) / chartData.length;
  const avgAnxiety =
    chartData.reduce((s, d) => s + d.ansiedade, 0) / chartData.length;

  const prevAvgMood =
    prevData.length > 0
      ? prevData.reduce((s, d) => s + d.mood, 0) / prevData.length
      : avgMood;
  const prevAvgEnergy =
    prevData.length > 0
      ? prevData.reduce((s, d) => s + d.energy, 0) / prevData.length
      : avgEnergy;
  const prevAvgAnxiety =
    prevData.length > 0
      ? prevData.reduce((s, d) => s + d.anxiety, 0) / prevData.length
      : avgAnxiety;

  // Impulse count by day for anxiety correlation marks
  const impulseByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const imp of impulseData) {
      const date = imp.created_at.split("T")[0];
      const day = DAY_LABELS[date];
      if (day) {
        map[day] = (map[day] ?? 0) + 1;
      }
    }
    return map;
  }, [impulseData]);

  // Impulse count by type for bar chart
  const impulseByType: Record<string, number> = {};
  for (const imp of impulseData) {
    const label = IMPULSE_TYPE_LABELS[imp.type] ?? imp.type;
    impulseByType[label] = (impulseByType[label] ?? 0) + 1;
  }
  const impulseBarData = Object.entries(impulseByType).map(([type, count]) => ({
    type,
    count,
  }));

  return (
    <div className={cn("space-y-5", className)}>
      {/* Mood / Energy / Sleep line chart */}
      <Card className="border-border-subtle">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm flex items-center gap-2">
            Humor e Energia
            <TrendArrow current={avgMood} previous={prevAvgMood} />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {!hasRealData && (
            <p className="text-[10px] text-text-muted mb-2">
              Dados de demonstração
            </p>
          )}
          <div className="h-48 -ml-2">
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
                  yAxisId="left"
                  domain={[1, 5]}
                  ticks={[1, 3, 5]}
                  tick={{ fontSize: 11, fill: TEXT_MUTED }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <Tooltip content={<ChartTooltip />} />
                {/* Current week - Mood */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humor"
                  name="Humor"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: ACCENT }}
                />
                {/* Current week - Energy */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="energia"
                  name="Energia"
                  stroke={ACCENT_HOVER}
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 3, fill: ACCENT_HOVER }}
                />
                {/* Sleep quality overlay */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sono"
                  name="Sono"
                  stroke={SLEEP_COLOR}
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  activeDot={{ r: 2, fill: SLEEP_COLOR }}
                  connectNulls
                />
                {/* Previous week - Mood (faded dotted) */}
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="humorPrev"
                  name="Humor (sem. ant.)"
                  stroke={ACCENT}
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  strokeOpacity={0.3}
                  dot={false}
                  connectNulls
                />
                {/* Best day marker */}
                <ReferenceDot
                  yAxisId="left"
                  x={chartData[bestDayIndex]?.day}
                  y={chartData[bestDayIndex]?.humor}
                  r={4}
                  fill={ACCENT}
                  fillOpacity={0.2}
                  stroke={ACCENT}
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Best day label */}
          <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
            <Star size={10} strokeWidth={1.5} className="text-accent" />
            Melhor dia: {chartData[bestDayIndex]?.day}
          </p>
        </CardContent>
      </Card>

      {/* Anxiety trend with impulse correlation */}
      <Card className="border-border-subtle">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm flex items-center gap-2">
            Ansiedade
            <TrendArrow
              current={avgAnxiety}
              previous={prevAvgAnxiety}
              inverted
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-40 -ml-2">
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
                {/* Previous week anxiety (faded) */}
                <Line
                  type="monotone"
                  dataKey="ansiedadePrev"
                  name="Ansied. (sem. ant.)"
                  stroke={WARNING}
                  strokeWidth={1}
                  strokeDasharray="2 4"
                  strokeOpacity={0.3}
                  dot={false}
                  connectNulls
                />
                {/* Mark impulse events on anxiety line */}
                {chartData.map((d) => {
                  const count = impulseByDay[d.day];
                  if (!count) return null;
                  return (
                    <ReferenceDot
                      key={`imp-${d.day}`}
                      x={d.day}
                      y={d.ansiedade}
                      r={count * 2 + 2}
                      fill={WARNING}
                      fillOpacity={0.15}
                      stroke={WARNING}
                      strokeWidth={1}
                      strokeOpacity={0.4}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Correlation note */}
          {Object.keys(impulseByDay).length > 0 && (
            <p className="text-[10px] text-text-muted mt-1">
              Círculos indicam dias com impulsos registrados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Habits completion (simple visual) */}
      {habitCompletionRate !== undefined && (
        <Card className="border-border-subtle">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm">Hábitos concluídos</CardTitle>
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
                    ? "Alguns dias foram mais difíceis, e tudo bem."
                    : "Semana de desafios. O que você pode ajustar?"}
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
  binge_eating: "Compulsão",
  substance: "Subst.",
  other: "Outro",
};

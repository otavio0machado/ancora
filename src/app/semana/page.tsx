"use client";

import { useState, useMemo, useCallback } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Brain,
  Fingerprint,
  Sparkles,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { WeekCharts } from "@/components/semana/week-charts";
import { PatternAnalysis } from "@/components/semana/pattern-analysis";
import { IdentityProgress } from "@/components/semana/identity-progress";
import { WeeklyInsights } from "@/components/semana/weekly-insights";
import {
  WeeklyReflectionForm,
  type WeeklyReflectionData,
} from "@/components/semana/weekly-reflection-form";
import type {
  CheckIn,
  Impulse,
  Identity,
  Habit,
  HabitLog,
  TechniqueLog,
} from "@/types/database";

// --------------- Mock data ---------------

const MOCK_IDENTITIES: Identity[] = [
  {
    id: "id-1",
    user_id: "user-1",
    name: "Estudioso equilibrado",
    description: "Aprender com constância, sem perfeccionismo",
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 0,
    linked_values: ["Crescimento", "Conhecimento"],
    strength: 72,
  },
  {
    id: "id-2",
    user_id: "user-1",
    name: "Corpo em construção",
    description: null,
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 1,
    linked_values: ["Saúde", "Presença"],
    strength: 61,
  },
  {
    id: "id-3",
    user_id: "user-1",
    name: "Não fumante em construção",
    description: null,
    icon: null,
    active: true,
    created_at: "2026-01-01T00:00:00Z",
    order_index: 2,
    linked_values: ["Saúde"],
    strength: 38,
  },
];

const MOCK_HABITS: Habit[] = [
  {
    id: "hab-1", user_id: "user-1", identity_id: "id-1", name: "Estudar",
    ideal_version: "2h de estudo focado", minimum_version: "Abrir o livro por 10 min",
    common_saboteurs: ["perfeccionismo"], frequency: "daily", custom_days: null,
    active: true, created_at: "2026-01-01T00:00:00Z", order_index: 0, species_id: "ipe_amarelo",
  },
  {
    id: "hab-2", user_id: "user-1", identity_id: "id-1", name: "Ler",
    ideal_version: "30 páginas", minimum_version: "1 página",
    common_saboteurs: ["cansaço"], frequency: "daily", custom_days: null,
    active: true, created_at: "2026-01-01T00:00:00Z", order_index: 1, species_id: "lavanda",
  },
  {
    id: "hab-3", user_id: "user-1", identity_id: "id-2", name: "Treinar",
    ideal_version: "Treino completo", minimum_version: "15 min em casa",
    common_saboteurs: ["cansaço"], frequency: "weekdays", custom_days: null,
    active: true, created_at: "2026-01-01T00:00:00Z", order_index: 0, species_id: "bambu",
  },
  {
    id: "hab-5", user_id: "user-1", identity_id: "id-3", name: "Não fumar",
    ideal_version: "Dia inteiro sem cigarro", minimum_version: "Não fumar nas primeiras 4h",
    common_saboteurs: ["cansaço"], frequency: "daily", custom_days: null,
    active: true, created_at: "2026-01-01T00:00:00Z", order_index: 0, species_id: "araucaria",
  },
];

// Generate this week and previous week habit logs
function generateWeekLogs(weekOffset: number): HabitLog[] {
  const logs: HabitLog[] = [];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const base = addWeeks(weekStart, weekOffset);

  const habitIds = ["hab-1", "hab-2", "hab-3", "hab-5"];
  for (let day = 0; day < 7; day++) {
    const d = new Date(base);
    d.setDate(d.getDate() + day);
    const date = d.toISOString().split("T")[0];

    for (const hid of habitIds) {
      // Simulate varied completions
      const rand = Math.random();
      if (rand > 0.3) {
        logs.push({
          id: `wlog-${weekOffset}-${day}-${hid}`,
          habit_id: hid,
          user_id: "user-1",
          date,
          version: rand > 0.6 ? "ideal" : "minimum",
          notes: null,
          created_at: d.toISOString(),
        });
      } else if (rand > 0.15) {
        logs.push({
          id: `wlog-${weekOffset}-${day}-${hid}`,
          habit_id: hid,
          user_id: "user-1",
          date,
          version: "skipped",
          notes: null,
          created_at: d.toISOString(),
        });
      }
    }
  }
  return logs;
}

const MOCK_WEEK_LOGS = generateWeekLogs(0);
const MOCK_PREV_WEEK_LOGS = generateWeekLogs(-1);

const MOCK_CHECK_INS: CheckIn[] = [
  {
    id: "ci-1", user_id: "user-1", date: "2026-03-16",
    energy: 3, mood: 3, anxiety: 4, focus: 2, impulsivity: 3,
    notes: null, sleep_quality: 2, sleep_hours: 5.5, created_at: "2026-03-16T08:00:00Z",
  },
  {
    id: "ci-2", user_id: "user-1", date: "2026-03-17",
    energy: 4, mood: 4, anxiety: 3, focus: 3, impulsivity: 2,
    notes: null, sleep_quality: 3, sleep_hours: 7, created_at: "2026-03-17T08:00:00Z",
  },
  {
    id: "ci-3", user_id: "user-1", date: "2026-03-18",
    energy: 2, mood: 2, anxiety: 5, focus: 1, impulsivity: 5,
    notes: "Dia muito difícil", sleep_quality: 2, sleep_hours: 4, created_at: "2026-03-18T08:00:00Z",
  },
  {
    id: "ci-4", user_id: "user-1", date: "2026-03-19",
    energy: 3, mood: 3, anxiety: 3, focus: 3, impulsivity: 3,
    notes: null, sleep_quality: 4, sleep_hours: 7.5, created_at: "2026-03-19T08:00:00Z",
  },
  {
    id: "ci-5", user_id: "user-1", date: "2026-03-20",
    energy: 4, mood: 4, anxiety: 2, focus: 4, impulsivity: 2,
    notes: null, sleep_quality: 4, sleep_hours: 8, created_at: "2026-03-20T08:00:00Z",
  },
  {
    id: "ci-6", user_id: "user-1", date: "2026-03-21",
    energy: 5, mood: 5, anxiety: 1, focus: 4, impulsivity: 1,
    notes: "Melhor dia", sleep_quality: 5, sleep_hours: 8, created_at: "2026-03-21T08:00:00Z",
  },
  {
    id: "ci-7", user_id: "user-1", date: "2026-03-22",
    energy: 4, mood: 4, anxiety: 2, focus: 3, impulsivity: 2,
    notes: null, sleep_quality: 3, sleep_hours: 6.5, created_at: "2026-03-22T08:00:00Z",
  },
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
    trigger: "Tedio", context: "Intervalo", emotion_before: "Cansado",
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

const MOCK_TECHNIQUE_LOGS: TechniqueLog[] = [
  {
    id: "tl-1", user_id: "user-1", impulse_id: "imp-1",
    technique: "breathing", context: "impulse", effectiveness: 4,
    duration_seconds: 240, notes: null, created_at: "2026-03-18T22:30:00Z",
  },
  {
    id: "tl-2", user_id: "user-1", impulse_id: "imp-2",
    technique: "delay", context: "impulse", effectiveness: 3,
    duration_seconds: 600, notes: null, created_at: "2026-03-17T14:00:00Z",
  },
  {
    id: "tl-3", user_id: "user-1", impulse_id: "imp-3",
    technique: "tip", context: "impulse", effectiveness: 2,
    duration_seconds: 120, notes: null, created_at: "2026-03-18T20:00:00Z",
  },
  {
    id: "tl-4", user_id: "user-1", impulse_id: "imp-5",
    technique: "breathing", context: "impulse", effectiveness: 4,
    duration_seconds: 300, notes: null, created_at: "2026-03-20T23:00:00Z",
  },
  {
    id: "tl-5", user_id: "user-1", impulse_id: null,
    technique: "grounding", context: "proactive", effectiveness: 5,
    duration_seconds: 180, notes: "Manhã de sábado", created_at: "2026-03-21T07:00:00Z",
  },
];

// --------------- Helpers ---------------

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

function formatWeekRange(ws: Date): string {
  const we = getWeekEnd(ws);
  const startStr = format(ws, "d MMM", { locale: ptBR });
  const endStr = format(we, "d MMM", { locale: ptBR });
  return `${startStr} - ${endStr}`;
}

function formatWeekStartISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// --------------- Page Component ---------------

export default function SemanaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(new Date())
  );

  // In a real app these would come from Supabase
  const [checkIns] = useState<CheckIn[]>(MOCK_CHECK_INS);
  const [impulses] = useState<Impulse[]>(MOCK_IMPULSES);
  const [techniqueLogs] = useState<TechniqueLog[]>(MOCK_TECHNIQUE_LOGS);
  const [isSaving, setIsSaving] = useState(false);

  const isCurrentWeek = useMemo(() => {
    const thisWeek = getWeekStart(new Date());
    return currentWeekStart.getTime() === thisWeek.getTime();
  }, [currentWeekStart]);

  const canGoForward = !isCurrentWeek;

  const handlePrevWeek = useCallback(() => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1));
  }, []);

  const handleNextWeek = useCallback(() => {
    if (canGoForward) {
      setCurrentWeekStart((prev) => addWeeks(prev, 1));
    }
  }, [canGoForward]);

  const handleSaveReflection = useCallback(
    async (data: WeeklyReflectionData) => {
      setIsSaving(true);
      try {
        // In a real app, save to Supabase weekly_reviews table
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        setIsSaving(false);
      }
    },
    [currentWeekStart]
  );

  // Calculate habit completion rate for this week
  const habitCompletionRate = useMemo(() => {
    const completed = MOCK_WEEK_LOGS.filter(
      (l) => l.version === "ideal" || l.version === "minimum"
    ).length;
    const total = MOCK_HABITS.length * 7;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, []);

  const weekStartISO = formatWeekStartISO(currentWeekStart);

  return (
    <div className="ancora-container py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Semana
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Olhe para trás com curiosidade, não com julgamento.
          </p>
        </div>

        {/* Week selector */}
        <div
          className={cn(
            "flex items-center justify-between",
            "rounded-xl border border-border-subtle p-3"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevWeek}
            aria-label="Semana anterior"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </Button>

          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">
              {formatWeekRange(currentWeekStart)}
            </p>
            {isCurrentWeek && (
              <p className="text-[10px] text-accent font-medium mt-0.5">
                Semana atual
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            disabled={!canGoForward}
            aria-label="Próxima semana"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Section 1: Week at a glance - Charts */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <BarChart3 size={14} strokeWidth={1.5} />
            Visão geral
          </h2>
          <WeekCharts
            checkIns={checkIns}
            impulses={impulses}
            habitCompletionRate={habitCompletionRate}
          />
        </div>

        {/* Section 2: Impulse & Emotional pattern analysis */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Brain size={14} strokeWidth={1.5} />
            Padrões detectados
          </h2>
          <PatternAnalysis
            checkIns={checkIns}
            impulses={impulses}
            techniqueLogs={techniqueLogs}
          />
        </div>

        {/* Section 3: Identity progress */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Fingerprint size={14} strokeWidth={1.5} />
            Progresso das identidades
          </h2>
          <IdentityProgress
            identities={MOCK_IDENTITIES}
            habits={MOCK_HABITS}
            weekLogs={MOCK_WEEK_LOGS}
            prevWeekLogs={MOCK_PREV_WEEK_LOGS}
          />
        </div>

        {/* Section 4: AI Insights */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.5} />
            Insights
          </h2>
          <WeeklyInsights weekStart={weekStartISO} />
        </div>

        {/* Section 5: Guided reflection */}
        <div className="space-y-3">
          <WeeklyReflectionForm
            onSave={handleSaveReflection}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}

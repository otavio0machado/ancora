"use client";

import { useState, useMemo, useCallback } from "react";
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { WeekCharts } from "@/components/semana/week-charts";
import { WeeklyInsights } from "@/components/semana/weekly-insights";
import {
  WeeklyReflectionForm,
  type WeeklyReflectionData,
} from "@/components/semana/weekly-reflection-form";
import type { CheckIn, Impulse } from "@/types/database";

// --------------- Helpers ---------------

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

function getWeekEnd(date: Date): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = getWeekEnd(weekStart);
  const startStr = format(weekStart, "d MMM", { locale: ptBR });
  const endStr = format(weekEnd, "d MMM", { locale: ptBR });
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

  // In a real app these would come from Supabase. For now, empty arrays.
  const [checkIns] = useState<CheckIn[]>([]);
  const [impulses] = useState<Impulse[]>([]);
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
        // await supabase.from("weekly_reviews").upsert({
        //   user_id: ...,
        //   week_start: formatWeekStartISO(currentWeekStart),
        //   patterns: data.whatWorked,
        //   triggers: data.whatWasHard,
        //   adjustments: data.whatToAdjust,
        // });

        // For now, just simulate a save
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        setIsSaving(false);
      }
    },
    [currentWeekStart]
  );

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
            Olhe para tras com curiosidade, nao com julgamento.
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
            aria-label="Proxima semana"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </Button>
        </div>

        {/* Charts */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2">
            <BarChart3 size={14} strokeWidth={1.5} />
            Visao geral
          </h2>
          <WeekCharts
            checkIns={checkIns}
            impulses={impulses}
            habitCompletionRate={65}
          />
        </div>

        {/* AI Insights */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-text-secondary">
            Insights
          </h2>
          <WeeklyInsights weekStart={weekStartISO} />
        </div>

        {/* Manual reflection */}
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

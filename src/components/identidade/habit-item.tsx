"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Habit, HabitLog } from "@/types/database";

interface HabitItemProps {
  habit: Habit;
  todayLog: HabitLog | null;
  allLogs: HabitLog[];
  onLogVersion: (habitId: string, version: "ideal" | "minimum") => void;
}

export function HabitItem({
  habit,
  todayLog,
  allLogs,
  onLogVersion,
}: HabitItemProps) {
  const [expanded, setExpanded] = useState(false);

  const completedVersion = todayLog?.version;
  const isCompleted =
    completedVersion === "ideal" || completedVersion === "minimum";

  // Calculate streak (consecutive days with ideal or minimum)
  const streak = useMemo(() => {
    if (allLogs.length === 0) return 0;

    const sortedByDate = [...allLogs]
      .filter((l) => l.version === "ideal" || l.version === "minimum")
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    if (sortedByDate.length === 0) return 0;

    let count = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const hasLog = sortedByDate.some((l) => l.date === dateStr);
      if (hasLog) {
        count++;
      } else if (i === 0) {
        // Today might not have a log yet, skip it
        continue;
      } else {
        break;
      }
    }

    return count;
  }, [allLogs]);

  // Consistency rate: completions / last 30 days
  const consistencyRate = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = allLogs.filter((l) => {
      const d = new Date(l.date);
      return (
        d >= thirtyDaysAgo &&
        (l.version === "ideal" || l.version === "minimum")
      );
    });

    return Math.round((recentLogs.length / 30) * 100);
  }, [allLogs]);

  // Best version rate: ideal / (ideal + minimum) over last 30 days
  const bestVersionRate = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentLogs = allLogs.filter((l) => {
      const d = new Date(l.date);
      return (
        d >= thirtyDaysAgo &&
        (l.version === "ideal" || l.version === "minimum")
      );
    });

    if (recentLogs.length === 0) return 0;

    const idealCount = recentLogs.filter(
      (l) => l.version === "ideal"
    ).length;
    return Math.round((idealCount / recentLogs.length) * 100);
  }, [allLogs]);

  // Most common blocking saboteur (from skipped logs)
  const blockingSaboteur = useMemo(() => {
    const skipped = allLogs.filter((l) => l.version === "skipped");
    if (skipped.length === 0 || habit.common_saboteurs.length === 0)
      return null;

    // If there are skipped days with this habit, the most likely saboteur
    // is the most common one associated with this habit
    if (skipped.length >= 3) {
      return habit.common_saboteurs[0] ?? null;
    }
    return null;
  }, [allLogs, habit.common_saboteurs]);

  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle p-4",
        "transition-all duration-200",
        isCompleted && "bg-success-subtle/50 border-success/20"
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {isCompleted && (
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-success" />
            </div>
          )}
          <span
            className={cn(
              "text-sm font-medium text-text-primary truncate",
              isCompleted && "text-success"
            )}
          >
            {habit.name}
          </span>
          {isCompleted && (
            <Badge variant="success" className="flex-shrink-0 text-[10px]">
              {completedVersion === "ideal" ? "Ideal" : "Minimo"}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          )}
        </button>

        {/* Action buttons */}
        {!isCompleted && (
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={() => onLogVersion(habit.id, "ideal")}
              className="text-xs h-7 px-2.5"
            >
              Ideal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLogVersion(habit.id, "minimum")}
              className="text-xs h-7 px-2.5"
            >
              Minimo
            </Button>
          </div>
        )}
      </div>

      {/* Stats row - subtle inline stats */}
      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {streak > 0 && (
          <span className="text-[10px] text-text-muted">
            {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
          </span>
        )}
        {consistencyRate > 0 && (
          <span className="text-[10px] text-text-muted">
            {consistencyRate}% nos ultimos 30 dias
          </span>
        )}
      </div>

      {/* ACT message for minimum completion */}
      {completedVersion === "minimum" && (
        <p className="text-[10px] text-accent mt-1.5 italic leading-relaxed">
          O minimo hoje E o maximo. Consistencia &gt; perfeicao.
        </p>
      )}

      {/* Saboteur warnings */}
      {!isCompleted && habit.common_saboteurs.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertTriangle className="w-3 h-3 text-warning flex-shrink-0" />
          <div className="flex gap-1 flex-wrap">
            {habit.common_saboteurs.map((saboteur) => (
              <Badge key={saboteur} variant="warning" className="text-[10px]">
                {saboteur}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border-subtle space-y-2">
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Versao ideal
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              {habit.ideal_version}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
              Versao minima
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              {habit.minimum_version}
            </p>
          </div>
          {habit.frequency !== "daily" && (
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Frequencia
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {habit.frequency === "weekdays"
                  ? "Dias uteis"
                  : "Personalizado"}
              </p>
            </div>
          )}

          {/* Best version rate */}
          {consistencyRate > 0 && (
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Taxa de versao ideal
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {bestVersionRate}% das vezes que completou, foi na versao ideal
              </p>
            </div>
          )}

          {/* Blocking saboteur */}
          {blockingSaboteur && (
            <div>
              <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Bloqueado mais vezes por
              </p>
              <p className="text-sm text-text-secondary mt-0.5">
                {blockingSaboteur}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { IdentityStrength } from "./identity-strength";
import { HabitItem } from "./habit-item";
import { AddHabitDialog } from "./add-habit-dialog";
import { calculateIdentityStrength } from "@/lib/utils/patterns";
import type { Identity, Habit, HabitLog } from "@/types/database";

interface IdentityCardProps {
  identity: Identity;
  habits: Habit[];
  todayLogs: HabitLog[];
  allLogs: HabitLog[];
  onLogVersion: (habitId: string, version: "ideal" | "minimum") => void;
  onAddHabit: (
    identityId: string,
    habit: {
      name: string;
      ideal_version: string;
      minimum_version: string;
      common_saboteurs: string[];
      frequency: "daily" | "weekdays" | "custom";
      saboteur_description?: string;
    }
  ) => void;
}

export function IdentityCard({
  identity,
  habits,
  todayLogs,
  allLogs,
  onLogVersion,
  onAddHabit,
}: IdentityCardProps) {
  // Calculate progress: how many habits completed today
  const totalHabits = habits.length;
  const completedHabits = habits.filter((habit) =>
    todayLogs.some(
      (log) =>
        log.habit_id === habit.id &&
        (log.version === "ideal" || log.version === "minimum")
    )
  ).length;
  const progressPercent =
    totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  // Calculate strength from logs
  const calculatedStrength = useMemo(() => {
    if (allLogs.length === 0) return identity.strength;
    return calculateIdentityStrength(allLogs, totalHabits);
  }, [allLogs, totalHabits, identity.strength]);

  // Calculate 7-day trend vs previous 7 days
  const trend = useMemo((): "improving" | "stable" | "declining" => {
    if (allLogs.length < 4) return "stable";

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentLogs = allLogs.filter((log) => {
      const d = new Date(log.date);
      return d >= sevenDaysAgo && d <= now;
    });

    const previousLogs = allLogs.filter((log) => {
      const d = new Date(log.date);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    });

    const scoreLog = (log: HabitLog) =>
      log.version === "ideal" ? 1 : log.version === "minimum" ? 0.6 : 0;

    const recentScore = recentLogs.reduce((s, l) => s + scoreLog(l), 0);
    const previousScore = previousLogs.reduce((s, l) => s + scoreLog(l), 0);

    // Normalize by number of possible days
    const recentRate = totalHabits > 0 ? recentScore / (totalHabits * 7) : 0;
    const previousRate = totalHabits > 0 ? previousScore / (totalHabits * 7) : 0;

    const diff = recentRate - previousRate;
    if (diff > 0.05) return "improving";
    if (diff < -0.05) return "declining";
    return "stable";
  }, [allLogs, totalHabits]);

  // Find most common saboteur across skipped logs
  const topSaboteur = useMemo((): string | null => {
    const skippedLogs = allLogs.filter((l) => l.version === "skipped");
    if (skippedLogs.length === 0) return null;

    // Count saboteurs from habits that were skipped
    const saboteurCounts: Record<string, number> = {};
    for (const log of skippedLogs) {
      const habit = habits.find((h) => h.id === log.habit_id);
      if (!habit) continue;
      for (const s of habit.common_saboteurs) {
        saboteurCounts[s] = (saboteurCounts[s] ?? 0) + 1;
      }
    }

    const sorted = Object.entries(saboteurCounts).sort(
      ([, a], [, b]) => b - a
    );
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [allLogs, habits]);

  return (
    <Card className="p-6 rounded-2xl">
      <CardHeader className="p-0 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">{identity.name}</CardTitle>
              {/* Trend indicator */}
              {trend === "improving" && (
                <TrendingUp className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={2} />
              )}
              {trend === "declining" && (
                <TrendingDown className="w-3.5 h-3.5 text-warning flex-shrink-0" strokeWidth={2} />
              )}
              {trend === "stable" && (
                <Minus className="w-3.5 h-3.5 text-text-muted flex-shrink-0" strokeWidth={2} />
              )}
            </div>
            {identity.description && (
              <CardDescription className="mt-1">
                {identity.description}
              </CardDescription>
            )}

            {/* Value tags */}
            {identity.linked_values.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {identity.linked_values.map((value) => (
                  <Badge
                    key={value}
                    variant="default"
                    className="text-[10px] px-2 py-0"
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Strength meter */}
          <IdentityStrength
            strength={calculatedStrength}
            trend={trend}
            size="sm"
            className="flex-shrink-0"
          />
        </div>

        {/* Today's progress bar */}
        {totalHabits > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted">Hoje</span>
              <span className="text-[10px] text-text-muted">
                {completedHabits}/{totalHabits}
              </span>
            </div>
            <Progress value={progressPercent} />
          </div>
        )}

        {/* Saboteur frequency */}
        {topSaboteur && (
          <p className="text-[10px] text-text-muted mt-2 italic">
            Sabotador mais frequente: {topSaboteur}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0 space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-text-muted py-2">
            Nenhum habito adicionado ainda.
          </p>
        ) : (
          habits.map((habit) => {
            const todayLog =
              todayLogs.find((log) => log.habit_id === habit.id) ?? null;
            const habitLogs = allLogs.filter(
              (log) => log.habit_id === habit.id
            );
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                todayLog={todayLog}
                allLogs={habitLogs}
                onLogVersion={onLogVersion}
              />
            );
          })
        )}
      </CardContent>

      <CardFooter className="p-0 pt-3">
        <AddHabitDialog
          identityId={identity.id}
          identityName={identity.name}
          onAdd={(habit) => onAddHabit(identity.id, habit)}
        />
      </CardFooter>
    </Card>
  );
}

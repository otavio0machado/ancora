"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HabitItem } from "./habit-item";
import { AddHabitDialog } from "./add-habit-dialog";
import type { Identity, Habit, HabitLog } from "@/types/database";

interface IdentityCardProps {
  identity: Identity;
  habits: Habit[];
  todayLogs: HabitLog[];
  onLogVersion: (habitId: string, version: "ideal" | "minimum") => void;
  onAddHabit: (
    identityId: string,
    habit: {
      name: string;
      ideal_version: string;
      minimum_version: string;
      common_saboteurs: string[];
      frequency: "daily" | "weekdays" | "custom";
    }
  ) => void;
}

export function IdentityCard({
  identity,
  habits,
  todayLogs,
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{identity.name}</CardTitle>
            {identity.description && (
              <CardDescription className="mt-1">
                {identity.description}
              </CardDescription>
            )}
          </div>
          <span className="text-xs text-text-muted flex-shrink-0 pt-0.5">
            {completedHabits}/{totalHabits}
          </span>
        </div>
        {totalHabits > 0 && (
          <Progress value={progressPercent} className="mt-3" />
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {habits.length === 0 ? (
          <p className="text-sm text-text-muted py-2">
            Nenhum habito adicionado ainda.
          </p>
        ) : (
          habits.map((habit) => {
            const todayLog =
              todayLogs.find((log) => log.habit_id === habit.id) ?? null;
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                todayLog={todayLog}
                onLogVersion={onLogVersion}
              />
            );
          })
        )}
      </CardContent>

      <CardFooter>
        <AddHabitDialog
          identityId={identity.id}
          identityName={identity.name}
          onAdd={(habit) => onAddHabit(identity.id, habit)}
        />
      </CardFooter>
    </Card>
  );
}

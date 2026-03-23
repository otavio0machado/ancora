"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IdentityStrength } from "@/components/identidade/identity-strength";
import type { Identity, Habit, HabitLog } from "@/types/database";

// --------------- Types ---------------

interface IdentityProgressProps {
  identities: Identity[];
  habits: Habit[];
  weekLogs: HabitLog[];
  prevWeekLogs: HabitLog[];
  className?: string;
}

// --------------- Component ---------------

export function IdentityProgress({
  identities,
  habits,
  weekLogs,
  prevWeekLogs,
  className,
}: IdentityProgressProps) {
  if (identities.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {identities.map((identity) => (
        <IdentityWeekCard
          key={identity.id}
          identity={identity}
          habits={habits.filter((h) => h.identity_id === identity.id)}
          weekLogs={weekLogs}
          prevWeekLogs={prevWeekLogs}
        />
      ))}
    </div>
  );
}

// --------------- Sub-component ---------------

function IdentityWeekCard({
  identity,
  habits,
  weekLogs,
  prevWeekLogs,
}: {
  identity: Identity;
  habits: Habit[];
  weekLogs: HabitLog[];
  prevWeekLogs: HabitLog[];
}) {
  // Filter logs for this identity's habits
  const habitIds = new Set(habits.map((h) => h.id));

  const thisWeekLogs = weekLogs.filter((l) => habitIds.has(l.habit_id));
  const lastWeekLogs = prevWeekLogs.filter((l) => habitIds.has(l.habit_id));

  // Calculate completion stats
  const stats = useMemo(() => {
    const completed = thisWeekLogs.filter(
      (l) => l.version === "ideal" || l.version === "minimum"
    );
    const ideal = thisWeekLogs.filter((l) => l.version === "ideal");
    const minimum = thisWeekLogs.filter((l) => l.version === "minimum");
    const skipped = thisWeekLogs.filter((l) => l.version === "skipped");

    // Expected: habits * 7 days (simplified)
    const expected = habits.length * 7;
    const completionRate =
      expected > 0 ? Math.round((completed.length / expected) * 100) : 0;

    // Previous week rate
    const prevCompleted = lastWeekLogs.filter(
      (l) => l.version === "ideal" || l.version === "minimum"
    );
    const prevRate =
      expected > 0 ? Math.round((prevCompleted.length / expected) * 100) : 0;

    const delta = completionRate - prevRate;

    // Most consistent habit
    const habitCompletions: Record<string, number> = {};
    const habitSkips: Record<string, number> = {};
    for (const log of thisWeekLogs) {
      if (log.version === "ideal" || log.version === "minimum") {
        habitCompletions[log.habit_id] =
          (habitCompletions[log.habit_id] ?? 0) + 1;
      }
      if (log.version === "skipped") {
        habitSkips[log.habit_id] = (habitSkips[log.habit_id] ?? 0) + 1;
      }
    }

    const sortedByCompletion = Object.entries(habitCompletions).sort(
      ([, a], [, b]) => b - a
    );
    const sortedBySkips = Object.entries(habitSkips).sort(
      ([, a], [, b]) => b - a
    );

    const mostConsistentId =
      sortedByCompletion.length > 0 ? sortedByCompletion[0][0] : null;
    const mostSkippedId =
      sortedBySkips.length > 0 ? sortedBySkips[0][0] : null;

    const mostConsistent = mostConsistentId
      ? habits.find((h) => h.id === mostConsistentId)?.name ?? null
      : null;
    const mostSkipped = mostSkippedId
      ? habits.find((h) => h.id === mostSkippedId)?.name ?? null
      : null;

    return {
      completionRate,
      delta,
      idealCount: ideal.length,
      minimumCount: minimum.length,
      skippedCount: skipped.length,
      mostConsistent,
      mostSkipped,
    };
  }, [thisWeekLogs, lastWeekLogs, habits]);

  const trend: "improving" | "stable" | "declining" =
    stats.delta > 5
      ? "improving"
      : stats.delta < -5
        ? "declining"
        : "stable";

  return (
    <Card className="p-5 rounded-2xl border-border-subtle">
      <div className="flex items-start gap-3">
        {/* Strength circle */}
        <IdentityStrength
          strength={stats.completionRate}
          trend={trend}
          size="sm"
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {identity.name}
            </h3>
            {/* Delta badge */}
            {stats.delta !== 0 && (
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  stats.delta > 0 ? "text-accent" : "text-warning"
                )}
              >
                {stats.delta > 0 ? "+" : ""}
                {stats.delta}%
              </span>
            )}
          </div>

          {/* Value tags */}
          {identity.linked_values.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1">
              {identity.linked_values.map((v) => (
                <Badge key={v} variant="default" className="text-[9px] px-1.5 py-0">
                  {v}
                </Badge>
              ))}
            </div>
          )}

          {/* Week details */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-text-muted">
            {stats.idealCount > 0 && (
              <span>{stats.idealCount} ideal</span>
            )}
            {stats.minimumCount > 0 && (
              <span>{stats.minimumCount} minimo</span>
            )}
            {stats.skippedCount > 0 && (
              <span>{stats.skippedCount} pulado</span>
            )}
          </div>

          {/* Most consistent / most skipped */}
          <div className="mt-2 space-y-0.5">
            {stats.mostConsistent && (
              <p className="text-[10px] text-text-muted">
                Mais consistente: {stats.mostConsistent}
              </p>
            )}
            {stats.mostSkipped && (
              <p className="text-[10px] text-text-muted">
                Mais pulado: {stats.mostSkipped}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

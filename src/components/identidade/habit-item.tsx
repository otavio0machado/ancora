"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Habit, HabitLog } from "@/types/database";

interface HabitItemProps {
  habit: Habit;
  todayLog: HabitLog | null;
  onLogVersion: (habitId: string, version: "ideal" | "minimum") => void;
}

export function HabitItem({ habit, todayLog, onLogVersion }: HabitItemProps) {
  const [expanded, setExpanded] = useState(false);

  const completedVersion = todayLog?.version;
  const isCompleted = completedVersion === "ideal" || completedVersion === "minimum";

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
        </div>
      )}
    </div>
  );
}

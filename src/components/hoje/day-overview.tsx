"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils/cn";
import { useCheckInStore } from "@/lib/stores/checkin-store";

// --------------- Dimension display ---------------

interface DimensionBarProps {
  label: string;
  icon: string;
  value: number;
  reverse?: boolean;
}

function DimensionBar({ label, icon, value, reverse }: DimensionBarProps) {
  const percentage = (value / 5) * 100;

  const getBarColor = () => {
    if (reverse) {
      if (value <= 2) return "bg-success";
      if (value === 3) return "bg-text-muted";
      return "bg-alert";
    }
    if (value <= 2) return "bg-alert";
    if (value === 3) return "bg-text-muted";
    return "bg-success";
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs opacity-50 w-4 text-center" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs text-text-secondary w-24 truncate">
        {label}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-surface-sunken overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            getBarColor()
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-text-muted tabular-nums w-3 text-right">
        {value}
      </span>
    </div>
  );
}

// --------------- Component ---------------

interface DayOverviewProps {
  /** Number of habits completed today */
  habitsCompleted?: number;
  /** Total habits for today */
  habitsTotal?: number;
  /** Current focus session status */
  focusStatus?: "active" | "completed" | "none";
  /** Focus session objective */
  focusObjective?: string;
}

export function DayOverview({
  habitsCompleted = 0,
  habitsTotal = 0,
  focusStatus = "none",
  focusObjective,
}: DayOverviewProps) {
  const { todayCheckIn } = useCheckInStore();

  if (!todayCheckIn) return null;

  const habitsPercentage =
    habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Visao do dia</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Check-in summary */}
        <div className="flex flex-col gap-2.5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Seu estado
          </p>
          <div className="flex flex-col gap-2">
            <DimensionBar
              label="Energia"
              icon={"\u2600"}
              value={todayCheckIn.energy}
            />
            <DimensionBar
              label="Humor"
              icon={"\u263A"}
              value={todayCheckIn.mood}
            />
            <DimensionBar
              label="Ansiedade"
              icon={"\u26A1"}
              value={todayCheckIn.anxiety}
              reverse
            />
            <DimensionBar
              label="Foco"
              icon={"\u25CE"}
              value={todayCheckIn.focus}
            />
            <DimensionBar
              label="Impulsividade"
              icon={"\u21AF"}
              value={todayCheckIn.impulsivity}
              reverse
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* Habits summary */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Habitos
            </p>
            <span className="text-xs text-text-muted tabular-nums">
              {habitsCompleted}/{habitsTotal}
            </span>
          </div>
          {habitsTotal > 0 ? (
            <Progress value={habitsPercentage} />
          ) : (
            <p className="text-xs text-text-muted">
              Nenhum habito configurado para hoje.
            </p>
          )}
        </div>

        {/* Focus session status */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Foco
          </p>
          {focusStatus === "active" && focusObjective ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-sm text-text-primary">{focusObjective}</span>
              <Badge variant="default" className="ml-auto">
                Em andamento
              </Badge>
            </div>
          ) : focusStatus === "completed" ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">
                Sessao concluida
              </span>
              <Badge variant="success" className="ml-auto">
                Feito
              </Badge>
            </div>
          ) : (
            <p className="text-xs text-text-muted">
              Nenhuma sessao de foco ativa.
            </p>
          )}
        </div>

        {/* Encouraging note */}
        {todayCheckIn.notes && (
          <>
            <div className="h-px bg-border-subtle" />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                Suas anotacoes
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {todayCheckIn.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

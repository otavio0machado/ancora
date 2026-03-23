"use client";

import { Moon, AlertTriangle, Heart } from "lucide-react";
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

// --------------- Sleep quality display ---------------

function getSleepQualityLabel(quality: number): string {
  switch (quality) {
    case 1: return "Pessimo";
    case 2: return "Ruim";
    case 3: return "Regular";
    case 4: return "Bom";
    case 5: return "Otimo";
    default: return "N/A";
  }
}

function getSleepQualityColor(quality: number): string {
  if (quality <= 2) return "text-alert";
  if (quality === 3) return "text-text-secondary";
  return "text-success";
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
  /** Whether there are recent impulses (last 24h) */
  hasRecentImpulses?: boolean;
  /** Number of recent impulses */
  recentImpulseCount?: number;
  /** Whether the current time is a historically risky window */
  isRiskyTimeWindow?: boolean;
  /** Risk window description */
  riskyTimeDescription?: string;
  /** Value name the day aligns with */
  alignedValueName?: string;
  /** Value icon (emoji) */
  alignedValueIcon?: string | null;
}

export function DayOverview({
  habitsCompleted = 0,
  habitsTotal = 0,
  focusStatus = "none",
  focusObjective,
  hasRecentImpulses = false,
  recentImpulseCount = 0,
  isRiskyTimeWindow = false,
  riskyTimeDescription,
  alignedValueName,
  alignedValueIcon,
}: DayOverviewProps) {
  const { todayCheckIn } = useCheckInStore();

  if (!todayCheckIn) return null;

  const habitsPercentage =
    habitsTotal > 0 ? Math.round((habitsCompleted / habitsTotal) * 100) : 0;

  const hasSleepData = todayCheckIn.sleep_quality != null;

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Visao do dia</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Sleep summary */}
        {hasSleepData && (
          <>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Moon size={12} className="text-text-muted" strokeWidth={1.5} />
                <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Sono
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Qualidade:</span>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      getSleepQualityColor(todayCheckIn.sleep_quality!)
                    )}
                  >
                    {getSleepQualityLabel(todayCheckIn.sleep_quality!)}
                  </span>
                </div>
                {todayCheckIn.sleep_hours != null && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Horas:</span>
                    <span className="text-xs font-semibold text-text-primary">
                      {todayCheckIn.sleep_hours}h
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="h-px bg-border-subtle" />
          </>
        )}

        {/* Risk indicators */}
        {(hasRecentImpulses || isRiskyTimeWindow) && (
          <>
            <div className="flex flex-col gap-2">
              {hasRecentImpulses && (
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2",
                    "bg-warning-subtle border border-warning/15",
                    "animate-fade-in"
                  )}
                >
                  <AlertTriangle size={13} className="text-warning flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-xs text-text-secondary leading-relaxed">
                    {recentImpulseCount} impulso{recentImpulseCount !== 1 ? "s" : ""} recente{recentImpulseCount !== 1 ? "s" : ""} registrado{recentImpulseCount !== 1 ? "s" : ""}. Atencao extra hoje.
                  </p>
                </div>
              )}
              {isRiskyTimeWindow && (
                <div
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2",
                    "bg-surface-sunken border border-border-subtle",
                    "animate-fade-in"
                  )}
                >
                  <AlertTriangle size={13} className="text-text-muted flex-shrink-0" strokeWidth={1.5} />
                  <p className="text-xs text-text-muted leading-relaxed">
                    {riskyTimeDescription || "Horario historicamente mais vulneravel. Esteja atento."}
                  </p>
                </div>
              )}
            </div>
            <div className="h-px bg-border-subtle" />
          </>
        )}

        {/* Value connection */}
        {alignedValueName && (
          <>
            <div
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5",
                "bg-accent-subtle/50 border border-accent/10",
                "animate-fade-in"
              )}
            >
              {alignedValueIcon ? (
                <span className="text-sm" aria-hidden="true">{alignedValueIcon}</span>
              ) : (
                <Heart size={13} className="text-accent flex-shrink-0" strokeWidth={1.5} />
              )}
              <p className="text-xs text-accent leading-relaxed">
                Hoje esta alinhado com: <span className="font-semibold">{alignedValueName}</span>
              </p>
            </div>
            <div className="h-px bg-border-subtle" />
          </>
        )}

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

        {/* Notes */}
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

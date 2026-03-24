"use client";

import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Cigarette,
  Smartphone,
  EyeOff,
  UtensilsCrossed,
  Pill,
  HelpCircle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Sun,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { Impulse } from "@/types/database";

// --------------- Constants ---------------

const TYPE_LABELS: Record<Impulse["type"], string> = {
  smoking: "Cigarro",
  social_media: "Redes sociais",
  pornography: "Pornografia",
  binge_eating: "Compulsão alimentar",
  substance: "Substância",
  other: "Outro",
};

const TYPE_ICONS: Record<Impulse["type"], typeof Cigarette> = {
  smoking: Cigarette,
  social_media: Smartphone,
  pornography: EyeOff,
  binge_eating: UtensilsCrossed,
  substance: Pill,
  other: HelpCircle,
};

// --------------- Helpers ---------------

interface PatternBadge {
  label: string;
  icon: typeof Moon;
}

function detectPatterns(impulses: Impulse[]): PatternBadge[] {
  if (impulses.length < 3) return [];

  const patterns: PatternBadge[] = [];

  // Time of day analysis
  const hours = impulses.map((i) => new Date(i.created_at).getHours());
  const nightCount = hours.filter((h) => h >= 20 || h < 6).length;
  const morningCount = hours.filter((h) => h >= 6 && h < 12).length;
  const afternoonCount = hours.filter((h) => h >= 12 && h < 20).length;

  if (nightCount > impulses.length * 0.5) {
    patterns.push({ label: "Mais frequente a noite", icon: Moon });
  } else if (morningCount > impulses.length * 0.5) {
    patterns.push({ label: "Mais frequente de manha", icon: Sun });
  } else if (afternoonCount > impulses.length * 0.5) {
    patterns.push({ label: "Mais frequente a tarde", icon: Cloud });
  }

  // Emotion trigger analysis
  const emotions = impulses
    .map((i) => i.emotion_before)
    .filter(Boolean) as string[];

  if (emotions.length >= 3) {
    const emotionCounts: Record<string, number> = {};
    for (const e of emotions) {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    }
    const topEmotion = Object.entries(emotionCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    if (topEmotion && topEmotion[1] >= 2) {
      const emotionLabels: Record<string, string> = {
        ansiedade: "ansiedade",
        tedio: "tédio",
        solidao: "solidão",
        raiva: "raiva",
        tristeza: "tristeza",
        cansaco: "cansaço",
        estresse: "estresse",
        frustracao: "frustração",
      };
      const label = emotionLabels[topEmotion[0]] || topEmotion[0];
      patterns.push({ label: `Gatilho: ${label}`, icon: Cloud });
    }
  }

  return patterns.slice(0, 2);
}

function computeResistanceTrend(
  impulses: Impulse[]
): "improving" | "declining" | "stable" {
  if (impulses.length < 4) return "stable";

  const half = Math.floor(impulses.length / 2);
  // Impulses are newest-first, so first half = recent, second half = older
  const recentHalf = impulses.slice(0, half);
  const olderHalf = impulses.slice(half);

  const recentRate =
    recentHalf.filter((i) => i.resisted).length / recentHalf.length;
  const olderRate =
    olderHalf.filter((i) => i.resisted).length / olderHalf.length;

  const diff = recentRate - olderRate;
  if (diff > 0.1) return "improving";
  if (diff < -0.1) return "declining";
  return "stable";
}

// --------------- Types ---------------

interface GroupedImpulses {
  type: Impulse["type"];
  label: string;
  impulses: Impulse[];
  resistRate: number;
}

// --------------- Component ---------------

interface ImpulseLogProps {
  impulses: Impulse[];
  className?: string;
}

export function ImpulseLog({ impulses, className }: ImpulseLogProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null);

  const grouped = useMemo((): GroupedImpulses[] => {
    const byType: Record<string, Impulse[]> = {};
    for (const impulse of impulses) {
      if (!byType[impulse.type]) byType[impulse.type] = [];
      byType[impulse.type].push(impulse);
    }

    return Object.entries(byType)
      .map(([type, items]) => ({
        type: type as Impulse["type"],
        label: TYPE_LABELS[type as Impulse["type"]] ?? type,
        impulses: items,
        resistRate:
          items.length > 0
            ? (items.filter((i) => i.resisted).length / items.length) * 100
            : 0,
      }))
      .sort((a, b) => b.impulses.length - a.impulses.length);
  }, [impulses]);

  const trend = useMemo(() => computeResistanceTrend(impulses), [impulses]);
  const patterns = useMemo(() => detectPatterns(impulses), [impulses]);

  const overallResistRate = useMemo(() => {
    if (impulses.length === 0) return 0;
    return Math.round(
      (impulses.filter((i) => i.resisted).length / impulses.length) * 100
    );
  }, [impulses]);

  if (impulses.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border-subtle p-6",
          "flex flex-col items-center gap-2",
          className
        )}
      >
        <p className="text-sm text-text-muted text-center">
          Nenhum impulso registrado recentemente.
        </p>
        <p className="text-xs text-text-muted text-center">
          Registros aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Resistance rate overview */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-surface-sunken border border-border-subtle">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">
            Taxa de resistência
          </span>
          {trend === "improving" && (
            <TrendingUp
              size={14}
              className="text-accent"
              strokeWidth={1.5}
            />
          )}
          {trend === "declining" && (
            <TrendingDown
              size={14}
              className="text-text-muted"
              strokeWidth={1.5}
            />
          )}
          {trend === "stable" && (
            <Minus
              size={14}
              className="text-text-muted"
              strokeWidth={1.5}
            />
          )}
        </div>
        <span className="text-sm font-medium text-text-primary tabular-nums">
          {overallResistRate}%
        </span>
      </div>

      {/* Pattern badges */}
      {patterns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {patterns.map((pattern) => {
            const Icon = pattern.icon;
            return (
              <Badge
                key={pattern.label}
                variant="outline"
                className="text-xs text-text-secondary gap-1"
              >
                <Icon size={10} strokeWidth={1.5} />
                {pattern.label}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Grouped impulses */}
      <div className="space-y-2">
        {grouped.map((group) => {
          const Icon = TYPE_ICONS[group.type];
          const isExpanded = expandedType === group.type;

          return (
            <div
              key={group.type}
              className="rounded-xl border border-border-subtle overflow-hidden"
            >
              {/* Group header */}
              <button
                type="button"
                onClick={() =>
                  setExpandedType(isExpanded ? null : group.type)
                }
                className={cn(
                  "w-full flex items-center justify-between p-4",
                  "hover:bg-surface-sunken/50 transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-surface-sunken text-text-muted">
                    <Icon size={14} strokeWidth={1.5} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-text-primary">
                      {group.label}
                    </p>
                    <p className="text-xs text-text-muted">
                      {group.impulses.length}x - {Math.round(group.resistRate)}%
                      resistiu
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  className={cn(
                    "text-text-muted transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Expanded entries */}
              {isExpanded && (
                <div className="border-t border-border-subtle animate-fade-in">
                  {group.impulses.map((impulse) => {
                    const timeAgo = formatDistanceToNow(
                      new Date(impulse.created_at),
                      { addSuffix: true, locale: ptBR }
                    );

                    return (
                      <div
                        key={impulse.id}
                        className="px-4 py-3 border-b border-border-subtle last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-text-muted tabular-nums">
                              {impulse.intensity}/10
                            </span>
                            <span className="text-xs text-text-muted">
                              {timeAgo}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px]",
                              impulse.resisted
                                ? "bg-accent-subtle/40 text-accent"
                                : "bg-surface-sunken text-text-muted"
                            )}
                          >
                            {impulse.resisted ? "Resistiu" : "Cedeu"}
                          </Badge>
                        </div>

                        {(impulse.emotion_before ||
                          impulse.technique_used) && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {impulse.emotion_before && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-text-muted"
                              >
                                {impulse.emotion_before}
                              </Badge>
                            )}
                            {impulse.technique_used && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-text-muted"
                              >
                                {impulse.technique_used}
                              </Badge>
                            )}
                            {impulse.technique_effectiveness != null && (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-text-muted"
                              >
                                Eficácia: {impulse.technique_effectiveness}/5
                              </Badge>
                            )}
                          </div>
                        )}

                        {impulse.trigger && (
                          <p className="text-xs text-text-muted mt-1.5 truncate">
                            {impulse.trigger}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

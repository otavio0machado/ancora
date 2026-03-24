"use client";

import { useMemo } from "react";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CheckIn } from "@/types/database";

// --------------- Insight derivation ---------------

interface StateInsight {
  text: string;
  type: "warning" | "insight" | "pattern";
}

function deriveInsights(checkIn: CheckIn): StateInsight[] {
  const insights: StateInsight[] = [];
  const { energy, mood, anxiety, focus, impulsivity } = checkIn;
  const hour = new Date().getHours();

  // Night vulnerability
  if (hour >= 21 && impulsivity >= 3) {
    insights.push({
      text: "Noite + impulsividade: janela de risco. Evite telas e situações de gatilho.",
      type: "warning",
    });
  }

  // Anxiety-impulsivity combo
  if (anxiety >= 3 && impulsivity >= 3) {
    insights.push({
      text: "Ansiedade alta amplifica impulsos. Qualquer técnica de regulação agora previne uma espiral.",
      type: "warning",
    });
  }

  // Low energy predicts impulsivity
  if (energy <= 2 && impulsivity <= 3) {
    insights.push({
      text: "Energia baixa costuma preceder picos de impulsividade. Considere descansar antes que o corpo busque atalhos.",
      type: "pattern",
    });
  }

  // Mood-anxiety disconnect
  if (mood >= 4 && anxiety >= 4) {
    insights.push({
      text: "Humor bom com ansiedade alta pode indicar excitação ou hiperativação. Fique atento à euforia mascarando tensão.",
      type: "insight",
    });
  }

  // Focus-energy mismatch
  if (focus >= 4 && energy <= 2) {
    insights.push({
      text: "Foco alto com energia baixa: possível hiperfoco compensatório. Cuide para não esgotar.",
      type: "insight",
    });
  }

  // Bad sleep cascade
  if (checkIn.sleep_quality != null && checkIn.sleep_quality <= 2 && anxiety >= 3) {
    insights.push({
      text: "Sono ruim + ansiedade: ciclo que se retroalimenta. Priorize descanso hoje para quebrar o padrão.",
      type: "pattern",
    });
  }

  // Afternoon slump warning
  if (hour >= 13 && hour <= 15 && energy <= 3) {
    insights.push({
      text: "Início da tarde com energia caindo: normal. Não force produtividade agora. Pausa curta rende mais que insistir.",
      type: "insight",
    });
  }

  return insights.slice(0, 2); // Max 2 insights at a time
}

// --------------- Style helpers ---------------

function getInsightStyle(type: StateInsight["type"]) {
  switch (type) {
    case "warning":
      return {
        bg: "bg-warning-subtle",
        border: "border-warning/15",
        icon: AlertTriangle,
        iconColor: "text-warning",
      };
    case "insight":
      return {
        bg: "bg-accent-subtle/30",
        border: "border-accent/10",
        icon: Lightbulb,
        iconColor: "text-accent",
      };
    case "pattern":
      return {
        bg: "bg-surface-sunken",
        border: "border-border-subtle",
        icon: Lightbulb,
        iconColor: "text-text-muted",
      };
  }
}

// --------------- Component ---------------

interface StateInsightProps {
  checkIn: CheckIn;
}

export function StateInsight({ checkIn }: StateInsightProps) {
  const insights = useMemo(() => deriveInsights(checkIn), [checkIn]);

  if (insights.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Insights
      </p>
      {insights.map((insight, i) => {
        const style = getInsightStyle(insight.type);
        const Icon = style.icon;
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2.5 rounded-xl px-3 py-2.5 border",
              style.bg,
              style.border,
            )}
          >
            <Icon
              size={13}
              className={cn("flex-shrink-0 mt-0.5", style.iconColor)}
              strokeWidth={1.5}
            />
            <p className="text-xs text-text-secondary leading-relaxed">
              {insight.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

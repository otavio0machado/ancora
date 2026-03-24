"use client";

import { useMemo } from "react";
import { Shield, Flame, Wind, Eye, Sparkles, Heart, Target, Anchor } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CheckIn } from "@/types/database";

// --------------- Mission derivation ---------------

interface Mission {
  title: string;
  description: string;
  mode: "rescue" | "regulation" | "survival" | "minimum" | "mindful" | "flow" | "gentle" | "deep" | "stable";
  icon: typeof Shield;
  color: string;
  bgColor: string;
  borderColor: string;
}

function deriveMission(checkIn: CheckIn): Mission {
  const { energy, mood, anxiety, focus, impulsivity } = checkIn;
  const sleepBad = (checkIn.sleep_quality != null && checkIn.sleep_quality <= 2) ||
    (checkIn.sleep_hours != null && checkIn.sleep_hours < 5);

  // Critical: system overwhelmed
  if (anxiety >= 4 && impulsivity >= 4 && energy <= 2) {
    return {
      title: "Proteção",
      description: "Hoje é sobre se cuidar. Nada mais é necessário.",
      mode: "rescue",
      icon: Shield,
      color: "text-alert",
      bgColor: "bg-alert/8",
      borderColor: "border-alert/20",
    };
  }

  // High anxiety → regulation first
  if (anxiety >= 4) {
    return {
      title: "Regulação primeiro",
      description: "Ansiedade alta. Regule antes de produzir. Respire antes de decidir.",
      mode: "regulation",
      icon: Wind,
      color: "text-warning",
      bgColor: "bg-warning/8",
      borderColor: "border-warning/20",
    };
  }

  // Depression day: low energy + low mood
  if (energy <= 2 && mood <= 2) {
    return {
      title: "Sobreviver com dignidade",
      description: "Dia pesado. Existir hoje já é suficiente. Gentileza máxima.",
      mode: "survival",
      icon: Heart,
      color: "text-accent",
      bgColor: "bg-accent/8",
      borderColor: "border-accent/20",
    };
  }

  // Low energy (not necessarily low mood)
  if (energy <= 2 || sleepBad) {
    return {
      title: "Versão mínima",
      description: "Energia baixa. Faça apenas o essencial com presença.",
      mode: "minimum",
      icon: Anchor,
      color: "text-text-secondary",
      bgColor: "bg-surface-sunken",
      borderColor: "border-border-subtle",
    };
  }

  // High impulsivity → conscious choice
  if (impulsivity >= 4) {
    return {
      title: "Escolha consciente",
      description: "Impulsividade alta. Observe antes de agir. Vontade não é ordem.",
      mode: "mindful",
      icon: Eye,
      color: "text-warning",
      bgColor: "bg-warning/8",
      borderColor: "border-warning/20",
    };
  }

  // Great day → leverage it
  if (energy >= 4 && mood >= 4 && anxiety <= 2) {
    return {
      title: "Aproveitar a onda",
      description: "Dia bom. Faça o que importa com presença total.",
      mode: "flow",
      icon: Flame,
      color: "text-success",
      bgColor: "bg-success/8",
      borderColor: "border-success/20",
    };
  }

  // Low mood → gentleness
  if (mood <= 2) {
    return {
      title: "Gentileza",
      description: "Humor baixo. Cuide de si como cuidaria de um amigo.",
      mode: "gentle",
      icon: Heart,
      color: "text-accent",
      bgColor: "bg-accent/8",
      borderColor: "border-accent/20",
    };
  }

  // High focus, low anxiety → deep work
  if (focus >= 4 && anxiety <= 2) {
    return {
      title: "Foco profundo",
      description: "Mente clara. Bom momento para trabalho que importa.",
      mode: "deep",
      icon: Target,
      color: "text-accent",
      bgColor: "bg-accent/8",
      borderColor: "border-accent/20",
    };
  }

  // Default → consistency
  return {
    title: "Consistência",
    description: "Dia estável. Uma coisa de cada vez, com presença.",
    mode: "stable",
    icon: Sparkles,
    color: "text-text-secondary",
    bgColor: "bg-surface-sunken",
    borderColor: "border-border-subtle",
  };
}

// --------------- Component ---------------

interface DayMissionProps {
  checkIn: CheckIn;
}

export function DayMission({ checkIn }: DayMissionProps) {
  const mission = useMemo(() => deriveMission(checkIn), [checkIn]);
  const Icon = mission.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 animate-scale-in",
        mission.bgColor,
        mission.borderColor,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-white/60 dark:bg-white/10 border",
            mission.borderColor,
          )}
        >
          <Icon size={20} className={mission.color} strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1">
            Missão de hoje
          </p>
          <h2 className={cn("text-lg font-semibold", mission.color)}>
            {mission.title}
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mt-1">
            {mission.description}
          </p>
        </div>
      </div>
    </div>
  );
}

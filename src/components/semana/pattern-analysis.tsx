"use client";

import {
  Clock,
  Calendar,
  Zap,
  Brain,
  Wind,
  TrendingUp,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import {
  detectTimePatterns,
  detectTriggerCorrelations,
  detectEmotionalCycles,
  calculateTechniqueEffectiveness,
  calculateResistanceRate,
  generateRiskWindows,
} from "@/lib/utils/patterns";
import type {
  TimePattern,
  TriggerCorrelation,
  EmotionalCycle,
  TechniqueStats,
  ResistanceRate,
  RiskWindow,
} from "@/lib/utils/patterns";
import type { CheckIn, Impulse, TechniqueLog } from "@/types/database";

// --------------- Types ---------------

interface PatternAnalysisProps {
  checkIns: CheckIn[];
  impulses: Impulse[];
  techniqueLogs: TechniqueLog[];
  className?: string;
}

// --------------- Translators (PT-BR) ---------------

const TIME_OF_DAY_PT: Record<string, string> = {
  morning: "Manhã (5h-12h)",
  afternoon: "Tarde (12h-18h)",
  evening: "Noite (18h-22h)",
  night: "Madrugada (22h-5h)",
};

const DAY_NAMES_PT: Record<string, string> = {
  Sunday: "domingos",
  Monday: "segundas-feiras",
  Tuesday: "terças-feiras",
  Wednesday: "quartas-feiras",
  Thursday: "quintas-feiras",
  Friday: "sextas-feiras",
  Saturday: "sábados",
};

const IMPULSE_TYPE_PT: Record<string, string> = {
  smoking: "cigarro",
  social_media: "redes sociais",
  pornography: "pornografia",
  binge_eating: "compulsão alimentar",
  substance: "substâncias",
  other: "outro",
};

const TECHNIQUE_NAMES_PT: Record<string, string> = {
  tip: "TIP (Temperatura)",
  stop: "STOP",
  grounding: "Ancoragem sensorial",
  breathing: "Respiração 4-7-8",
  opposite_action: "Ação oposta",
  delay: "Adiamento",
};

// --------------- Pattern card ---------------

function PatternCard({
  icon,
  text,
  severity,
}: {
  icon: React.ReactNode;
  text: string;
  severity?: "info" | "warning" | "positive";
}) {
  return (
    <Card
      className={cn(
        "border-border-subtle",
        severity === "warning" && "border-warning/20",
        severity === "positive" && "border-accent/20"
      )}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <span
          className={cn(
            "flex-shrink-0 mt-0.5",
            severity === "warning"
              ? "text-warning"
              : severity === "positive"
                ? "text-accent"
                : "text-text-muted"
          )}
        >
          {icon}
        </span>
        <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}

// --------------- Main component ---------------

export function PatternAnalysis({
  checkIns,
  impulses,
  techniqueLogs,
  className,
}: PatternAnalysisProps) {
  // Run all pattern detection
  const timePatterns = detectTimePatterns(impulses);
  const triggerCorrelations = detectTriggerCorrelations(impulses);
  const emotionalCycles = detectEmotionalCycles(checkIns);
  const techniqueStats = calculateTechniqueEffectiveness(techniqueLogs);
  const resistanceRate = calculateResistanceRate(impulses, "month");
  const riskWindows = generateRiskWindows(impulses, checkIns);

  const hasPatterns =
    timePatterns.length > 0 ||
    triggerCorrelations.length > 0 ||
    emotionalCycles.length > 0 ||
    techniqueStats.length > 0 ||
    riskWindows.length > 0;

  if (!hasPatterns) {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-text-muted text-center py-4">
          Registre mais dados ao longo da semana para revelar padrões.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Time patterns */}
      {timePatterns.slice(0, 2).map((pattern, i) => (
        <PatternCard
          key={`time-${i}`}
          icon={<Clock size={16} strokeWidth={1.5} />}
          text={`Impulsos sao mais frequentes ${TIME_OF_DAY_PT[pattern.timeOfDay] ? `durante a ${TIME_OF_DAY_PT[pattern.timeOfDay].toLowerCase()}` : pattern.hourRange} (${pattern.percentage}%)`}
          severity="info"
        />
      ))}

      {/* Trigger correlations */}
      {triggerCorrelations.slice(0, 2).map((corr, i) => {
        const types = corr.associatedImpulseTypes
          .map((t) => IMPULSE_TYPE_PT[t] ?? t)
          .join(", ");
        const resistPct = Math.round(corr.resistanceRate * 100);
        return (
          <PatternCard
            key={`trigger-${i}`}
            icon={<Zap size={16} strokeWidth={1.5} />}
            text={`${corr.trigger} é o gatilho mais comum para ${types} (${resistPct}% de resistência)`}
            severity="warning"
          />
        );
      })}

      {/* Emotional cycles */}
      {emotionalCycles.slice(0, 2).map((cycle, i) => {
        // Translate common patterns to PT-BR
        let ptText = cycle.insight;
        if (cycle.pattern.includes("Mood drops")) {
          ptText =
            "Quando seu humor cai, a ansiedade tende a subir. Esse ciclo é comum - reconhecê-lo é o primeiro passo.";
        } else if (cycle.pattern.includes("Low energy")) {
          ptText =
            "Dias de baixa energia costumam ser seguidos por alta impulsividade. Priorize descanso nesses dias.";
        } else if (cycle.pattern.includes("Anxiety tends to build")) {
          ptText =
            "Sua ansiedade se acumula ao longo de dias consecutivos. Intervir cedo com técnicas de ancoragem pode prevenir a escalada.";
        } else if (cycle.pattern.includes("Mood is noticeably")) {
          ptText =
            "Há uma diferença de humor entre dias úteis e fins de semana. O que muda entre eles?";
        }
        return (
          <PatternCard
            key={`cycle-${i}`}
            icon={<Brain size={16} strokeWidth={1.5} />}
            text={ptText}
            severity="info"
          />
        );
      })}

      {/* Technique effectiveness */}
      {techniqueStats.slice(0, 1).map((tech, i) => {
        const name = TECHNIQUE_NAMES_PT[tech.technique] ?? tech.technique;
        return (
          <PatternCard
            key={`tech-${i}`}
            icon={<Wind size={16} strokeWidth={1.5} />}
            text={`${name} é sua técnica mais efetiva (${tech.avgEffectiveness}/5)`}
            severity="positive"
          />
        );
      })}

      {/* Risk windows */}
      {riskWindows.slice(0, 2).map((window, i) => {
        const dayPt = window.dayOfWeek
          ? DAY_NAMES_PT[window.dayOfWeek] ?? window.dayOfWeek
          : "";
        const timePt = window.timeOfDay ?? "";
        return (
          <PatternCard
            key={`risk-${i}`}
            icon={<AlertTriangle size={16} strokeWidth={1.5} />}
            text={`Alto risco: ${dayPt} ${timePt ? `a ${timePt.toLowerCase()}` : ""}`}
            severity="warning"
          />
        );
      })}

      {/* Resistance rate */}
      {impulses.length > 0 && (
        <PatternCard
          icon={<Shield size={16} strokeWidth={1.5} />}
          text={`Taxa de resistência a impulsos: ${Math.round(resistanceRate.rate * 100)}% (${
            resistanceRate.trend === "improving"
              ? "melhorando"
              : resistanceRate.trend === "declining"
                ? "em queda"
                : "estável"
          })`}
          severity={
            resistanceRate.trend === "improving"
              ? "positive"
              : resistanceRate.trend === "declining"
                ? "warning"
                : "info"
          }
        />
      )}
    </div>
  );
}

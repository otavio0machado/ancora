"use client";

import { useState } from "react";
import { Quote, Brain, Wind } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TechniqueCard,
  BUILTIN_TECHNIQUES,
  type Technique,
} from "@/components/impulsos/technique-card";
import { DelayTimer } from "@/components/impulsos/delay-timer";
import { OutcomeForm } from "@/components/impulsos/outcome-form";
import { BreathingExercise } from "@/components/hoje/breathing-exercise";
import type { AIImpulseOutput } from "@/types/ai";

// --------------- Types ---------------

type ProtocolPhase = "protocol" | "timer" | "outcome" | "done";

interface ProtocolDisplayProps {
  protocol: AIImpulseOutput;
  onComplete: (resisted: boolean, notes: string, techniqueUsed?: string) => void;
  isSubmitting?: boolean;
}

// --------------- Helpers ---------------

/** Match AI immediate action text to a built-in technique for richer display */
function matchTechnique(actionText: string): Technique | null {
  const lower = actionText.toLowerCase();
  if (lower.includes("tip") || lower.includes("temperatura") || lower.includes("agua gelada")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "tip") ?? null;
  }
  if (lower.includes("4-7-8") || lower.includes("4-4-6") || lower.includes("respira")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "breathing-478") ?? null;
  }
  if (lower.includes("5-4-3-2-1") || lower.includes("grounding") || lower.includes("aterramento")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "grounding-54321") ?? null;
  }
  if (lower.includes("stop") || lower.includes("pare")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "stop") ?? null;
  }
  if (lower.includes("oposta") || lower.includes("oposto")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "opposite-action") ?? null;
  }
  if (lower.includes("ambiente") || lower.includes("comodo") || lower.includes("saia")) {
    return BUILTIN_TECHNIQUES.find((t) => t.id === "environment-change") ?? null;
  }
  return null;
}

// --------------- Component ---------------

export function ProtocolDisplay({
  protocol,
  onComplete,
  isSubmitting = false,
}: ProtocolDisplayProps) {
  const [phase, setPhase] = useState<ProtocolPhase>("protocol");
  const [showBreathing, setShowBreathing] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);

  const handleTimerEnd = () => {
    setPhase("outcome");
  };

  const handleDismissEarly = () => {
    setPhase("outcome");
  };

  const handleOutcome = (resisted: boolean, notes: string) => {
    onComplete(resisted, notes, selectedTechnique ?? undefined);
    setPhase("done");
  };

  if (phase === "done") {
    return null;
  }

  if (phase === "timer") {
    return (
      <div className="space-y-5">
        <DelayTimer
          onTimerEnd={handleTimerEnd}
          onDismissEarly={handleDismissEarly}
        />
      </div>
    );
  }

  if (phase === "outcome") {
    return <OutcomeForm onSubmit={handleOutcome} isSubmitting={isSubmitting} />;
  }

  // Phase: protocol
  return (
    <div className="space-y-5 animate-slide-up">
      {/* Regulatory phrase - prominent */}
      <Card className="border-accent/20 bg-accent-subtle/20">
        <CardContent className="p-5 flex items-start gap-3">
          <Quote
            size={18}
            className="text-accent flex-shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium text-text-primary leading-relaxed ancora-text-balance">
            {protocol.regulatoryPhrase}
          </p>
        </CardContent>
      </Card>

      {/* Immediate actions as technique cards */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-medium text-text-secondary flex items-center gap-2">
          <span>Acoes imediatas</span>
        </h3>

        <div className="space-y-2">
          {protocol.immediateActions.map((action, i) => {
            const matched = matchTechnique(action);

            if (matched) {
              return (
                <TechniqueCard
                  key={matched.id}
                  technique={matched}
                  onSelect={(t) => setSelectedTechnique(t.id)}
                />
              );
            }

            // Fallback: plain card for actions that don't match built-ins
            return (
              <div
                key={i}
                className={cn(
                  "rounded-xl border border-border-subtle p-4",
                  "text-sm text-text-secondary leading-relaxed"
                )}
              >
                {action}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pattern reading */}
      {protocol.patternReading && (
        <Card className="border-border-subtle">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain size={14} strokeWidth={1.5} className="text-text-muted" />
              Leitura de padrao
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <p className="text-sm text-text-secondary leading-relaxed">
              {protocol.patternReading}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Breathing exercise trigger */}
      {protocol.breathingExercise && !showBreathing && (
        <Button
          variant="outline"
          size="md"
          className="w-full"
          onClick={() => setShowBreathing(true)}
        >
          <Wind size={16} strokeWidth={1.5} />
          Exercicio de respiracao{" "}
          {protocol.breathingExercise.inhale}-{protocol.breathingExercise.hold}-
          {protocol.breathingExercise.exhale}
        </Button>
      )}

      {showBreathing && protocol.breathingExercise && (
        <BreathingExercise
          inhale={protocol.breathingExercise.inhale}
          hold={protocol.breathingExercise.hold}
          exhale={protocol.breathingExercise.exhale}
          onClose={() => setShowBreathing(false)}
        />
      )}

      {/* Proceed to timer */}
      <div className="pt-2">
        <Button
          size="lg"
          className="w-full"
          onClick={() => setPhase("timer")}
        >
          Iniciar espera de 10 minutos
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-text-muted"
          onClick={() => setPhase("outcome")}
        >
          Ja estou pronto para registrar
        </Button>
      </div>
    </div>
  );
}

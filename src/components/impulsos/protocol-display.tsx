"use client";

import { useState, useCallback } from "react";
import {
  Quote,
  Brain,
  Heart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  TechniqueCard,
  BUILTIN_TECHNIQUES,
  type Technique,
} from "@/components/impulsos/technique-card";
import { DelayTimer } from "@/components/impulsos/delay-timer";
import { OutcomeForm } from "@/components/impulsos/outcome-form";
import { BreathingExercise } from "@/components/hoje/breathing-exercise";
import { GroundingPractice } from "@/components/impulsos/grounding-practice";
import { StopWalkthrough } from "@/components/impulsos/stop-walkthrough";
import type { AIImpulseOutput } from "@/types/ai";
import type { Impulse } from "@/types/database";
import type { TechniqueId } from "@/lib/stores/impulse-store";

// --------------- Types ---------------

type InterventionPhase =
  | "defusion"
  | "values"
  | "techniques"
  | "practice"
  | "reevaluation"
  | "delay"
  | "outcome"
  | "done";

interface ProtocolDisplayProps {
  protocol: AIImpulseOutput;
  impulseType: Impulse["type"];
  intensity: number;
  emotion: string | null;
  onComplete: (
    resisted: boolean,
    notes: string,
    techniqueUsed?: string,
    techniqueEffectiveness?: number,
    recoveryData?: {
      triggerAnalysis: string;
      whatToDoDifferently: string;
      selfCompassionNote: string;
      returnAction: string;
    }
  ) => void;
  isSubmitting?: boolean;
}

// --------------- Helpers ---------------

const TYPE_LABELS: Record<Impulse["type"], string> = {
  smoking: "fumar",
  social_media: "usar redes sociais",
  pornography: "acessar pornografia",
  binge_eating: "comer compulsivamente",
  substance: "usar uma substancia",
  other: "agir por impulso",
};

function matchTechniques(actions: string[]): Technique[] {
  const matched: Technique[] = [];
  const seen = new Set<string>();

  for (const action of actions) {
    const lower = action.toLowerCase();
    for (const t of BUILTIN_TECHNIQUES) {
      if (seen.has(t.id)) continue;

      const keywords: Record<string, string[]> = {
        tip: ["tip", "temperatura", "agua gelada", "gelo"],
        breathing: ["4-7-8", "4-4-6", "respira"],
        grounding: ["5-4-3-2-1", "grounding", "aterramento"],
        stop: ["stop", "pare"],
        opposite_action: ["oposta", "oposto"],
        environment_change: ["ambiente", "comodo", "saia"],
        delay: ["adiamento", "10 minutos", "esperar"],
      };

      const techKeywords = keywords[t.id] || [];
      if (techKeywords.some((kw) => lower.includes(kw))) {
        matched.push(t);
        seen.add(t.id);
      }
    }
  }

  // If nothing matched, return breathing + grounding + stop as defaults
  if (matched.length === 0) {
    return BUILTIN_TECHNIQUES.filter((t) =>
      ["breathing", "grounding", "stop"].includes(t.id)
    );
  }

  return matched.slice(0, 3);
}

function getDelayDuration(intensity: number): number {
  if (intensity <= 3) return 300; // 5 min
  if (intensity <= 7) return 600; // 10 min
  return 900; // 15 min
}

// --------------- Component ---------------

export function ProtocolDisplay({
  protocol,
  impulseType,
  intensity,
  emotion,
  onComplete,
  isSubmitting = false,
}: ProtocolDisplayProps) {
  const [phase, setPhase] = useState<InterventionPhase>("defusion");
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [postIntensity, setPostIntensity] = useState(intensity);
  const [techniquesUsed, setTechniquesUsed] = useState<TechniqueId[]>([]);

  const matchedTechniques = matchTechniques(protocol.immediateActions);
  const delayDuration = getDelayDuration(intensity);
  const impulseLabel = TYPE_LABELS[impulseType];

  const handleSelectTechnique = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
    setTechniquesUsed((prev) => [...new Set([...prev, technique.id])]);
  }, []);

  const handleStartPractice = useCallback((technique: Technique) => {
    setSelectedTechnique(technique);
    setTechniquesUsed((prev) => [...new Set([...prev, technique.id])]);
    setPhase("practice");
  }, []);

  const handlePracticeComplete = useCallback(() => {
    setPhase("reevaluation");
  }, []);

  const handleReevaluationDone = useCallback(() => {
    // If intensity dropped significantly, go straight to outcome
    if (postIntensity <= 3) {
      setPhase("outcome");
    } else {
      // Offer delay or another technique
      setPhase("delay");
    }
  }, [postIntensity]);

  const handleTryAnotherTechnique = useCallback(() => {
    setPhase("techniques");
    setSelectedTechnique(null);
  }, []);

  const handleTimerEnd = useCallback(() => {
    setPhase("outcome");
  }, []);

  const handleOutcome = useCallback(
    (
      resisted: boolean,
      notes: string,
      effectiveness?: number,
      recoveryData?: {
        triggerAnalysis: string;
        whatToDoDifferently: string;
        selfCompassionNote: string;
        returnAction: string;
      }
    ) => {
      onComplete(
        resisted,
        notes,
        selectedTechnique?.id ?? techniquesUsed[0],
        effectiveness,
        recoveryData
      );
    },
    [onComplete, selectedTechnique, techniquesUsed]
  );

  if (phase === "done") return null;

  // --------------- Phase: Delay ---------------
  if (phase === "delay") {
    return (
      <div className="space-y-4">
        <DelayTimer
          duration={delayDuration}
          impulseType={impulseType}
          intensity={intensity}
          onTimerEnd={handleTimerEnd}
          onDismissEarly={() => setPhase("outcome")}
        />
      </div>
    );
  }

  // --------------- Phase: Outcome ---------------
  if (phase === "outcome") {
    return (
      <OutcomeForm
        onSubmit={handleOutcome}
        isSubmitting={isSubmitting}
        techniquesUsed={techniquesUsed}
        matchedTechniques={matchedTechniques}
      />
    );
  }

  // --------------- Phase: Practice ---------------
  if (phase === "practice" && selectedTechnique) {
    return (
      <div className="space-y-4 animate-slide-up">
        <button
          type="button"
          onClick={() => setPhase("techniques")}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary">
            {selectedTechnique.name}
          </h2>
          <p className="text-sm text-text-muted">
            Pratique com calma. O tempo que precisar.
          </p>
        </div>

        {/* Breathing practice */}
        {(selectedTechnique.practiceType === "breathing" || selectedTechnique.id === "tip") && (
          <div className="space-y-4">
            {selectedTechnique.id === "tip" && (
              <div className="rounded-xl border border-border-subtle bg-surface-sunken p-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Enquanto aplica agua gelada ou segura gelo, acompanhe a respiracao:
                </p>
              </div>
            )}
            <BreathingExercise
              inhale={4}
              hold={7}
              exhale={8}
              onClose={handlePracticeComplete}
            />
          </div>
        )}

        {/* Grounding practice */}
        {selectedTechnique.practiceType === "grounding" && (
          <GroundingPractice onComplete={handlePracticeComplete} />
        )}

        {/* STOP walkthrough */}
        {selectedTechnique.practiceType === "stop_walkthrough" && (
          <StopWalkthrough onComplete={handlePracticeComplete} />
        )}

        {/* Opposite action guidance */}
        {selectedTechnique.practiceType === "opposite_action" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-surface-sunken p-5 space-y-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                O impulso de <strong>{impulseLabel}</strong> pede uma acao.
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                Qual e o oposto dessa acao? Faca isso agora.
              </p>
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Sugestoes de acao oposta:
                </p>
                <ul className="space-y-1.5">
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    Se o impulso pede isolamento, va ate alguem
                  </li>
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    Se pede passividade, mova o corpo
                  </li>
                  <li className="text-sm text-text-secondary flex items-start gap-2">
                    <span className="text-accent mt-0.5">-</span>
                    Se pede consumo, faca algo com as maos
                  </li>
                </ul>
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handlePracticeComplete}
            >
              Fiz a acao oposta
            </Button>
          </div>
        )}

        {/* Timer practice */}
        {selectedTechnique.practiceType === "timer" && (
          <DelayTimer
            duration={delayDuration}
            impulseType={impulseType}
            intensity={intensity}
            onTimerEnd={handlePracticeComplete}
            onDismissEarly={handlePracticeComplete}
          />
        )}

        {/* Fallback for techniques without specific practice */}
        {!selectedTechnique.practiceType && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border-subtle bg-surface-sunken p-5">
              <p className="text-sm text-text-secondary leading-relaxed">
                {selectedTechnique.fullInstruction}
              </p>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={handlePracticeComplete}
            >
              Concluir pratica
            </Button>
          </div>
        )}
      </div>
    );
  }

  // --------------- Phase: Reevaluation ---------------
  if (phase === "reevaluation") {
    const intensityDrop = intensity - postIntensity;
    const improved = intensityDrop >= 2;

    return (
      <div className="space-y-6 animate-slide-up">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Como esta a intensidade agora?
          </h2>
          <p className="text-sm text-text-muted">
            Avalie novamente. Antes estava em {intensity}.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <span className="text-4xl font-light tabular-nums text-text-primary">
              {postIntensity}
            </span>
          </div>

          <Slider
            min={1}
            max={10}
            step={1}
            value={[postIntensity]}
            onValueChange={([v]) => setPostIntensity(v)}
            className="py-4"
          />
        </div>

        {improved && (
          <div className="rounded-xl border border-accent/20 bg-accent-subtle/20 p-4 animate-fade-in">
            <p className="text-sm text-text-primary font-medium">
              A intensidade caiu de {intensity} para {postIntensity}.
            </p>
            <p className="text-sm text-text-secondary mt-1">
              A tecnica funcionou. Registrando.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handleReevaluationDone}
          >
            Continuar
          </Button>

          {!improved && (
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleTryAnotherTechnique}
            >
              <RotateCcw size={14} strokeWidth={1.5} />
              Tentar outra tecnica
            </Button>
          )}
        </div>
      </div>
    );
  }

  // --------------- Intervention Phases (defusion -> values -> techniques) ---------------

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Phase: Cognitive Defusion (ACT) */}
      {phase === "defusion" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Brain size={14} strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Defusao cognitiva
              </span>
            </div>
          </div>

          {/* Thought bubble */}
          <div className="relative">
            <div
              className={cn(
                "rounded-2xl border border-accent/15 bg-accent-subtle/15 p-6",
                "text-center space-y-4"
              )}
            >
              <p className="text-base text-text-primary leading-relaxed font-medium">
                &ldquo;Estou tendo o pensamento de que preciso {impulseLabel}.&rdquo;
              </p>

              <div className="w-12 h-px bg-border-subtle mx-auto" />

              <p className="text-sm text-text-secondary leading-relaxed">
                Observe esse pensamento. Ele e real, mas nao e uma ordem.
              </p>

              <p className="text-sm font-medium text-accent">
                Vontade nao e necessidade.
              </p>
            </div>

            {/* Thought bubble tail */}
            <div className="flex gap-1.5 mt-2 ml-8">
              <div className="w-3 h-3 rounded-full bg-accent-subtle/20 border border-accent/10" />
              <div className="w-2 h-2 rounded-full bg-accent-subtle/15 border border-accent/8" />
            </div>
          </div>

          {protocol.defusionExercise && (
            <div className="rounded-xl border border-border-subtle p-4">
              <p className="text-sm text-text-secondary leading-relaxed">
                {protocol.defusionExercise}
              </p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={() => setPhase("values")}
          >
            Entendi, proximo
            <ChevronRight size={16} strokeWidth={2} />
          </Button>
        </div>
      )}

      {/* Phase: Value Reminder (ACT) */}
      {phase === "values" && (
        <div className="space-y-6">
          <button
            type="button"
            onClick={() => setPhase("defusion")}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Heart size={14} strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Conexao com valores
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-sunken p-6 space-y-4">
            {protocol.valueReminder ? (
              <p className="text-sm text-text-primary leading-relaxed">
                {protocol.valueReminder}
              </p>
            ) : (
              <p className="text-sm text-text-primary leading-relaxed">
                Que tipo de pessoa voce quer ser nesse momento?
              </p>
            )}

            <div className="w-12 h-px bg-border-subtle" />

            <p className="text-sm text-text-secondary leading-relaxed italic">
              Esse impulso te afasta de quem voce quer ser.
              Lembre por que seus valores importam.
            </p>
          </div>

          {/* Regulatory phrase */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-subtle/10 border border-accent/10">
            <Quote
              size={16}
              className="text-accent flex-shrink-0 mt-0.5"
              strokeWidth={1.5}
            />
            <p className="text-sm text-text-primary leading-relaxed">
              {protocol.regulatoryPhrase}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => setPhase("techniques")}
          >
            Escolher uma tecnica
            <ChevronRight size={16} strokeWidth={2} />
          </Button>
        </div>
      )}

      {/* Phase: Technique Selection */}
      {phase === "techniques" && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setPhase("values")}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-text-muted">
              <Sparkles size={14} strokeWidth={1.5} />
              <span className="text-xs font-medium uppercase tracking-wider">
                Acoes imediatas
              </span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              Escolha uma tecnica para praticar agora
            </h2>
            <p className="text-sm text-text-muted">
              Toque em uma tecnica para ver os detalhes e iniciar.
            </p>
          </div>

          <div className="space-y-2.5">
            {matchedTechniques.map((technique) => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                isSelected={selectedTechnique?.id === technique.id}
                onSelect={() => handleSelectTechnique(technique)}
                onStartPractice={() => handleStartPractice(technique)}
              />
            ))}
          </div>

          {/* Pattern reading */}
          {protocol.patternReading && (
            <div className="rounded-xl border border-border-subtle p-4 mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={14} strokeWidth={1.5} className="text-text-muted" />
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  Leitura de padrao
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {protocol.patternReading}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-muted"
              onClick={() => setPhase("delay")}
            >
              Pular para a espera
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-text-muted"
              onClick={() => setPhase("outcome")}
            >
              Ja estou pronto para registrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

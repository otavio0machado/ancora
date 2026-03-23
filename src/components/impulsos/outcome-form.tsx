"use client";

import { useState } from "react";
import {
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MicrocopyDisplay } from "@/components/shared/microcopy-display";
import { BUILTIN_TECHNIQUES, type Technique } from "@/components/impulsos/technique-card";
import type { TechniqueId } from "@/lib/stores/impulse-store";

// --------------- Types ---------------

interface OutcomeFormProps {
  onSubmit: (
    resisted: boolean,
    notes: string,
    effectiveness?: number,
    recoveryData?: {
      triggerAnalysis: string;
      whatToDoDifferently: string;
      selfCompassionNote: string;
      returnAction: string;
    }
  ) => void;
  isSubmitting?: boolean;
  techniquesUsed?: TechniqueId[];
  matchedTechniques?: Technique[];
}

type OutcomePhase =
  | "choice"
  | "resisted_detail"
  | "gave_in_comfort"
  | "gave_in_recovery";

// --------------- Component ---------------

export function OutcomeForm({
  onSubmit,
  isSubmitting = false,
  techniquesUsed = [],
  matchedTechniques = [],
}: OutcomeFormProps) {
  const [phase, setPhase] = useState<OutcomePhase>("choice");
  const [outcome, setOutcome] = useState<"resisted" | "gave_in" | null>(null);

  // Resisted state
  const [bestTechnique, setBestTechnique] = useState<TechniqueId | null>(null);
  const [effectiveness, setEffectiveness] = useState(3);
  const [resistedNotes, setResistedNotes] = useState("");

  // Recovery state
  const [triggerAnalysis, setTriggerAnalysis] = useState("");
  const [whatToDoDifferently, setWhatToDoDifferently] = useState("");
  const [selfCompassionNote, setSelfCompassionNote] = useState("");
  const [returnAction, setReturnAction] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(0);

  // Get technique names for display
  const usedTechniquesList = techniquesUsed.length > 0
    ? techniquesUsed
        .map((id) => {
          const found = BUILTIN_TECHNIQUES.find((t) => t.id === id);
          return found ? { id: found.id, name: found.name } : null;
        })
        .filter(Boolean) as { id: TechniqueId; name: string }[]
    : matchedTechniques.map((t) => ({ id: t.id, name: t.name }));

  const handleChoiceResisted = () => {
    setOutcome("resisted");
    setPhase("resisted_detail");
  };

  const handleChoiceGaveIn = () => {
    setOutcome("gave_in");
    setPhase("gave_in_comfort");
  };

  const handleSubmitResisted = () => {
    onSubmit(true, resistedNotes, effectiveness);
  };

  const handleStartRecovery = () => {
    setPhase("gave_in_recovery");
    setRecoveryStep(0);
  };

  const handleNextRecoveryStep = () => {
    if (recoveryStep < 3) {
      setRecoveryStep((prev) => prev + 1);
    } else {
      // Submit with recovery data
      onSubmit(false, "", undefined, {
        triggerAnalysis,
        whatToDoDifferently,
        selfCompassionNote,
        returnAction,
      });
    }
  };

  const handleSkipRecovery = () => {
    onSubmit(false, "", undefined);
  };

  // --------------- Phase: Choice ---------------
  if (phase === "choice") {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-text-primary">
            Como foi?
          </h3>
          <p className="text-sm text-text-secondary">
            Sem julgamento. Apenas um registro.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleChoiceResisted}
            className={cn(
              "flex-1 rounded-xl border p-5 text-left",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:border-accent/30 hover:bg-accent-subtle/20",
              "active:scale-[0.98]",
              "border-border-subtle"
            )}
          >
            <p className="text-sm font-medium text-text-primary">
              Consegui resistir
            </p>
            <p className="text-xs text-text-muted mt-1">
              O impulso passou ou diminuiu
            </p>
          </button>

          <button
            type="button"
            onClick={handleChoiceGaveIn}
            className={cn(
              "flex-1 rounded-xl border p-5 text-left",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:border-border hover:bg-surface-sunken/50",
              "active:scale-[0.98]",
              "border-border-subtle"
            )}
          >
            <p className="text-sm font-medium text-text-primary">
              Nao dessa vez
            </p>
            <p className="text-xs text-text-muted mt-1">
              Tudo bem. Registrar ja ajuda.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // --------------- Phase: Resisted Detail ---------------
  if (phase === "resisted_detail") {
    return (
      <div className="space-y-6 animate-slide-up">
        {/* Subtle celebration */}
        <div className="rounded-xl border border-accent/15 bg-accent-subtle/10 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" strokeWidth={1.5} />
            <p className="text-sm font-medium text-text-primary">
              Voce escolheu diferente.
            </p>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Isso fortalece o caminho. Cada vez que voce resiste, a proxima vez fica um pouco mais facil.
          </p>
        </div>

        {/* Best technique */}
        {usedTechniquesList.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Qual tecnica mais ajudou?
            </label>
            <div className="flex flex-wrap gap-2">
              {usedTechniquesList.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setBestTechnique(tech.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    bestTechnique === tech.id
                      ? "border-accent bg-accent-subtle/30 text-accent font-medium"
                      : "border-border-subtle text-text-secondary hover:border-accent/30"
                  )}
                >
                  {tech.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Effectiveness rating */}
        {bestTechnique && (
          <div className="space-y-3 animate-fade-in">
            <label className="text-sm font-medium text-text-primary">
              Quao eficaz foi? (1-5)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setEffectiveness(rating)}
                  className={cn(
                    "flex-1 h-11 rounded-lg border text-sm font-medium",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    rating <= effectiveness
                      ? "border-accent bg-accent-subtle/30 text-accent"
                      : "border-border-subtle text-text-muted hover:border-accent/30"
                  )}
                >
                  <Star
                    size={16}
                    strokeWidth={1.5}
                    className={cn(
                      "mx-auto",
                      rating <= effectiveness ? "fill-accent/30" : ""
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-text-muted px-1">
              <span>Pouco eficaz</span>
              <span>Muito eficaz</span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Observacoes{" "}
            <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <Textarea
            value={resistedNotes}
            onChange={(e) => setResistedNotes(e.target.value)}
            placeholder="O que ajudou? Como se sente agora?"
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmitResisted}
          disabled={isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    );
  }

  // --------------- Phase: Gave In - Comfort ---------------
  if (phase === "gave_in_comfort") {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="rounded-xl border border-border-subtle bg-surface-sunken p-5 space-y-4">
          <p className="text-base font-medium text-text-primary">
            Tudo bem. Isso e informacao, nao sentenca.
          </p>

          <div className="w-12 h-px bg-border-subtle" />

          <p className="text-sm text-text-secondary leading-relaxed">
            Seu progresso nao e zerado. Uma recaida nao apaga dias de esforco.
            Cada tentativa de resistir fortaleceu circuitos no seu cerebro, mesmo
            quando nao deu certo.
          </p>

          <MicrocopyDisplay context="impulse_gave_in" />
        </div>

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handleStartRecovery}
          >
            Quero refletir sobre isso
            <ChevronRight size={16} strokeWidth={2} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-text-muted"
            onClick={handleSkipRecovery}
            disabled={isSubmitting}
          >
            Pular e salvar
          </Button>
        </div>
      </div>
    );
  }

  // --------------- Phase: Gave In - Recovery Flow ---------------
  if (phase === "gave_in_recovery") {
    const recoverySteps = [
      {
        title: "O que te levou a ceder?",
        description: "Tente identificar o que aconteceu. Nao para se culpar, mas para entender.",
        value: triggerAnalysis,
        setter: setTriggerAnalysis,
        placeholder: "O que voce acha que levou a essa escolha?",
      },
      {
        title: "O que pode fazer diferente?",
        description: "Pense em uma coisa - so uma - que poderia tentar da proxima vez.",
        value: whatToDoDifferently,
        setter: setWhatToDoDifferently,
        placeholder: "Uma coisa que posso tentar na proxima vez...",
      },
      {
        title: "Escreva algo gentil para si",
        description: "O que voce diria a um amigo nessa situacao? Diga a si mesmo.",
        value: selfCompassionNote,
        setter: setSelfCompassionNote,
        placeholder: "Voce fez o melhor que podia naquele momento...",
      },
      {
        title: "Qual e uma acao pequena para retomar?",
        description: "Algo simples que voce pode fazer agora para se reconectar consigo.",
        value: returnAction,
        setter: setReturnAction,
        placeholder: "Beber agua, caminhar, respirar, ligar para alguem...",
      },
    ];

    const currentRecovery = recoverySteps[recoveryStep];
    const isLastRecoveryStep = recoveryStep === recoverySteps.length - 1;

    return (
      <div className="space-y-5 animate-slide-up" key={recoveryStep}>
        {/* Progress */}
        <div className="flex items-center gap-2">
          {recoverySteps.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-all duration-300",
                i <= recoveryStep ? "bg-accent" : "bg-border-subtle"
              )}
            />
          ))}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">
            {currentRecovery.title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {currentRecovery.description}
          </p>
        </div>

        <Textarea
          value={currentRecovery.value}
          onChange={(e) => currentRecovery.setter(e.target.value)}
          placeholder={currentRecovery.placeholder}
          rows={4}
          autoFocus
        />

        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            className="w-full"
            onClick={handleNextRecoveryStep}
            disabled={isSubmitting && isLastRecoveryStep}
          >
            {isLastRecoveryStep
              ? isSubmitting
                ? "Salvando..."
                : "Salvar e seguir em frente"
              : "Proximo"
            }
            {!isLastRecoveryStep && <ChevronRight size={16} strokeWidth={2} />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full text-text-muted"
            onClick={() => {
              onSubmit(false, "", undefined, {
                triggerAnalysis,
                whatToDoDifferently,
                selfCompassionNote,
                returnAction,
              });
            }}
            disabled={isSubmitting}
          >
            Pular e salvar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

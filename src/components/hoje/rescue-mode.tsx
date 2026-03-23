"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  Droplets,
  MapPin,
  Phone,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/stores/app-store";
import { BreathingExercise } from "./breathing-exercise";
import { Textarea } from "@/components/ui/textarea";

// --------------- Types ---------------

type RescuePhase =
  | "breathing"
  | "grounding"
  | "actions"
  | "defusion"
  | "exit_check";

interface GroundingResponse {
  see: string;
  touch: string;
  hear: string;
  smell: string;
  taste: string;
}

// --------------- Grounding Interactive ---------------

function InteractiveGrounding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<GroundingResponse>({
    see: "",
    touch: "",
    hear: "",
    smell: "",
    taste: "",
  });

  const steps = [
    {
      count: 5,
      key: "see" as const,
      label: "coisas que voce ve",
      prompt: "Olhe ao redor. Nomeie 5 coisas que voce ve.",
    },
    {
      count: 4,
      key: "touch" as const,
      label: "coisas que voce toca",
      prompt: "Sinta 4 texturas ao redor.",
    },
    {
      count: 3,
      key: "hear" as const,
      label: "coisas que voce ouve",
      prompt: "Fique em silencio. 3 sons.",
    },
    {
      count: 2,
      key: "smell" as const,
      label: "coisas que voce cheira",
      prompt: "2 cheiros, mesmo sutis.",
    },
    {
      count: 1,
      key: "taste" as const,
      label: "coisa que voce saboreia",
      prompt: "1 sabor na boca.",
    },
  ];

  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Minimal progress */}
      <div className="flex gap-1.5 justify-center">
        {steps.map((s, i) => (
          <div
            key={s.count}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              "transition-all duration-300",
              i < step
                ? "bg-accent/10 text-accent"
                : i === step
                  ? "bg-accent text-white"
                  : "bg-surface-sunken text-text-muted"
            )}
          >
            {s.count}
          </div>
        ))}
      </div>

      <div className="space-y-2" key={step}>
        <p className="text-sm font-medium text-text-primary text-center">
          {currentStep.prompt}
        </p>
        <Textarea
          value={responses[currentStep.key]}
          onChange={(e) =>
            setResponses((prev) => ({
              ...prev,
              [currentStep.key]: e.target.value,
            }))
          }
          placeholder={`${currentStep.count} ${currentStep.label}...`}
          rows={2}
          className="text-sm"
          autoFocus
        />
      </div>

      <Button size="md" className="w-full" onClick={handleNext}>
        {isLast ? "Concluir" : "Proximo"}
      </Button>
    </div>
  );
}

// --------------- Main Component ---------------

export function RescueMode() {
  const { rescueMode, toggleRescueMode } = useAppStore();
  const [phase, setPhase] = useState<RescuePhase>("breathing");
  // Reset phase when rescue mode is toggled on
  useEffect(() => {
    if (rescueMode) {
      setPhase("breathing");
    }
  }, [rescueMode]);

  const handleBreathingDone = useCallback(() => {
    setPhase("grounding");
  }, []);

  const handleGroundingDone = useCallback(() => {
    setPhase("actions");
  }, []);

  const handleExitCheck = useCallback(() => {
    setPhase("exit_check");
  }, []);

  const handleExitConfirm = useCallback(() => {
    setPhase("breathing");
    toggleRescueMode();
  }, [toggleRescueMode]);

  if (!rescueMode) {
    return (
      <Button
        variant="rescue"
        size="lg"
        onClick={toggleRescueMode}
        className="w-full"
      >
        <Shield size={16} strokeWidth={2} />
        Modo Resgate
      </Button>
    );
  }

  // Rescue mode is active - FULL SCREEN, minimal content
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-surface overflow-y-auto",
        "animate-fade-in"
      )}
    >
      <div className="min-h-screen flex flex-col px-6 py-8 max-w-lg mx-auto">
        {/* Minimal header - no metrics, no numbers */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Modo Resgate
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitCheck}
            className="text-text-muted"
          >
            Estou melhor
          </Button>
        </div>

        {/* Phase content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Phase 1: Auto-start breathing */}
          {phase === "breathing" && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center space-y-2">
                <p className="text-base font-medium text-text-primary">
                  Respire.
                </p>
                <p className="text-sm text-text-secondary">
                  Nada mais importa agora.
                </p>
              </div>

              <BreathingExercise
                inhale={4}
                hold={7}
                exhale={8}
                onClose={handleBreathingDone}
              />

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-text-muted"
                onClick={handleBreathingDone}
              >
                Pular para aterramento
              </Button>
            </div>
          )}

          {/* Phase 2: Interactive grounding */}
          {phase === "grounding" && (
            <div className="space-y-6 animate-slide-up">
              <button
                type="button"
                onClick={() => setPhase("breathing")}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
                Voltar
              </button>

              <div className="text-center space-y-2">
                <p className="text-base font-medium text-text-primary">
                  Aterramento 5-4-3-2-1
                </p>
                <p className="text-sm text-text-secondary">
                  Traga sua atencao para o momento presente.
                </p>
              </div>

              <InteractiveGrounding onComplete={handleGroundingDone} />
            </div>
          )}

          {/* Phase 3: Simple action options */}
          {phase === "actions" && (
            <div className="space-y-6 animate-slide-up">
              <button
                type="button"
                onClick={() => setPhase("grounding")}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
                Voltar
              </button>

              <div className="text-center space-y-2">
                <p className="text-base font-medium text-text-primary">
                  Escolha uma acao simples
                </p>
                <p className="text-sm text-text-secondary">
                  Uma coisa so. A menor possivel.
                </p>
              </div>

              {/* 3 simple actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setPhase("defusion")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border border-border-subtle p-5",
                    "text-left hover:bg-surface-sunken/50 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-[0.98]"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Droplets size={18} className="text-blue-500" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Beber agua
                    </p>
                    <p className="text-xs text-text-muted">
                      Levante, pegue um copo, beba devagar.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPhase("defusion")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border border-border-subtle p-5",
                    "text-left hover:bg-surface-sunken/50 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-[0.98]"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-green-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Mudar de lugar
                    </p>
                    <p className="text-xs text-text-muted">
                      Va para outro comodo. Mude o cenario.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPhase("defusion")}
                  className={cn(
                    "w-full flex items-center gap-4 rounded-xl border border-border-subtle p-5",
                    "text-left hover:bg-surface-sunken/50 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-[0.98]"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Ligar para alguem
                    </p>
                    <p className="text-xs text-text-muted">
                      Nao precisa explicar. So ouvir uma voz.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Phase 4: ACT Defusion */}
          {phase === "defusion" && (
            <div className="space-y-8 animate-slide-up">
              <button
                type="button"
                onClick={() => setPhase("actions")}
                className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary transition-colors -ml-1"
              >
                <ChevronLeft size={16} strokeWidth={1.5} />
                Voltar
              </button>

              <div className="text-center space-y-6">
                <div className="rounded-2xl border border-border-subtle bg-surface-sunken p-8 space-y-6">
                  <p className="text-base text-text-primary leading-relaxed font-medium">
                    Estou tendo pensamentos dificeis.
                  </p>

                  <div className="w-12 h-px bg-border-subtle mx-auto" />

                  <p className="text-sm text-text-secondary leading-relaxed">
                    Eles nao me definem.
                  </p>

                  <p className="text-sm text-text-secondary leading-relaxed">
                    Sao pensamentos, nao fatos. Sao ondas, nao o mar.
                    Posso observa-los sem agir.
                  </p>
                </div>

                <div className="rounded-xl bg-accent-subtle/10 border border-accent/10 p-4">
                  <p className="text-sm text-accent font-medium">
                    Vontade nao e ordem.
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Voce pode sentir e escolher nao agir.
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleExitCheck}
              >
                Estou melhor
              </Button>
            </div>
          )}

          {/* Phase 5: Exit check */}
          {phase === "exit_check" && (
            <div className="space-y-8 animate-slide-up text-center">
              <div className="space-y-4">
                <p className="text-base font-medium text-text-primary">
                  Como voce esta se sentindo?
                </p>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Se ainda nao estiver bem, fique aqui o tempo que precisar.
                  Nao tem pressa.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleExitConfirm}
                >
                  Estou melhor, pode sair
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setPhase("breathing")}
                >
                  Preciso de mais um momento
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

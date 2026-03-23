"use client";

import { useState } from "react";
import { Check, ChevronRight, Pause, ArrowLeft, Eye, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";

// --------------- Types ---------------

interface StopWalkthroughProps {
  onComplete: () => void;
}

interface StopStep {
  letter: string;
  word: string;
  instruction: string;
  detail: string;
  icon: typeof Pause;
  duration: number; // seconds to hold on this step
}

const STEPS: StopStep[] = [
  {
    letter: "S",
    word: "PARE",
    instruction: "Pare o que esta fazendo. Congele.",
    detail:
      "Nao faca nada. Nao pegue nada. Nao abra nada. Apenas pare onde esta.",
    icon: Pause,
    duration: 5,
  },
  {
    letter: "T",
    word: "PASSO ATRAS",
    instruction: "De um passo atras. Respire.",
    detail:
      "Literalmente ou mentalmente, crie distancia. Inspire pelo nariz, expire pela boca. Nao reaja automaticamente.",
    icon: ArrowLeft,
    duration: 10,
  },
  {
    letter: "O",
    word: "OBSERVE",
    instruction: "Observe o que esta acontecendo dentro de voce.",
    detail:
      "Que pensamentos estao passando? Que sensacoes no corpo? Que emocoes voce identifica? Apenas observe, sem julgar.",
    icon: Eye,
    duration: 10,
  },
  {
    letter: "P",
    word: "PROSSIGA",
    instruction: "Prossiga com consciencia.",
    detail:
      "Agora escolha uma acao alinhada com seus valores, nao com o impulso. O que a pessoa que voce quer ser faria agora?",
    icon: Play,
    duration: 5,
  },
];

// --------------- Component ---------------

export function StopWalkthrough({ onComplete }: StopWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStarted, setStepStarted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(STEPS[0].duration);

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const Icon = step.icon;

  const handleStart = () => {
    setStepStarted(true);
    setSecondsLeft(step.duration);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
      setStepStarted(false);
      setSecondsLeft(STEPS[currentStep + 1].duration);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-3 justify-center">
        {STEPS.map((s, i) => (
          <div
            key={s.letter}
            className={cn(
              "flex items-center justify-center",
              "w-10 h-10 rounded-full text-base font-bold",
              "transition-all duration-300",
              i < currentStep
                ? "bg-accent/10 text-accent"
                : i === currentStep
                  ? "bg-accent text-white scale-110"
                  : "bg-surface-sunken text-text-muted"
            )}
          >
            {i < currentStep ? (
              <Check size={16} strokeWidth={2} />
            ) : (
              s.letter
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div
        className={cn(
          "rounded-2xl border border-border-subtle bg-surface-sunken p-6",
          "text-center space-y-4"
        )}
        key={currentStep}
      >
        <div
          className={cn(
            "mx-auto w-14 h-14 rounded-full flex items-center justify-center",
            "bg-accent/10 text-accent"
          )}
        >
          <Icon size={24} strokeWidth={1.5} />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
            {step.letter} - {step.word}
          </p>
          <p className="text-base font-semibold text-text-primary">
            {step.instruction}
          </p>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          {step.detail}
        </p>

        {stepStarted && secondsLeft > 0 && (
          <div className="flex items-center justify-center gap-2 animate-fade-in">
            <span className="text-2xl font-light text-accent tabular-nums">
              {secondsLeft}s
            </span>
          </div>
        )}
      </div>

      {!stepStarted ? (
        <Button size="lg" className="w-full" onClick={handleStart}>
          Comecar - {step.word}
        </Button>
      ) : secondsLeft <= 0 ? (
        <Button size="lg" className="w-full" onClick={handleNext}>
          {isLast ? "Concluir STOP" : "Proximo passo"}
          {!isLast && <ChevronRight size={16} strokeWidth={2} />}
        </Button>
      ) : (
        <p className="text-sm text-text-muted text-center">
          Fique neste passo por mais {secondsLeft} segundos...
        </p>
      )}
    </div>
  );
}

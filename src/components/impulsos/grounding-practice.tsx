"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// --------------- Types ---------------

interface GroundingPracticeProps {
  onComplete: () => void;
}

interface GroundingStep {
  count: number;
  sense: string;
  prompt: string;
  placeholder: string;
}

const STEPS: GroundingStep[] = [
  {
    count: 5,
    sense: "coisas que voce ve",
    prompt: "Olhe ao redor. Nomeie 5 coisas que voce ve agora.",
    placeholder: "Ex: a luz do abajur, minha caneca azul, o teclado...",
  },
  {
    count: 4,
    sense: "coisas que voce toca",
    prompt: "Preste atencao ao tato. 4 texturas ou temperaturas ao redor.",
    placeholder: "Ex: o tecido da camisa, a mesa lisa, o ar frio...",
  },
  {
    count: 3,
    sense: "coisas que voce ouve",
    prompt: "Fique em silencio por um instante. 3 sons ao redor.",
    placeholder: "Ex: o ventilador, carros la fora, minha respiracao...",
  },
  {
    count: 2,
    sense: "coisas que voce cheira",
    prompt: "Tente perceber 2 cheiros, mesmo sutis.",
    placeholder: "Ex: o ar, cafe da cozinha...",
  },
  {
    count: 1,
    sense: "coisa que voce saboreia",
    prompt: "1 sabor na sua boca agora, mesmo que fraco.",
    placeholder: "Ex: sabor de agua, cafe, pasta de dentes...",
  },
];

// --------------- Component ---------------

export function GroundingPractice({ onComplete }: GroundingPracticeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<string[]>(
    Array(STEPS.length).fill("")
  );

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleResponse = (value: string) => {
    const updated = [...responses];
    updated[currentStep] = value;
    setResponses(updated);
  };

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div
            key={s.count}
            className={cn(
              "flex items-center justify-center",
              "w-8 h-8 rounded-full text-sm font-medium",
              "transition-all duration-300",
              i < currentStep
                ? "bg-accent/10 text-accent"
                : i === currentStep
                  ? "bg-accent text-white"
                  : "bg-surface-sunken text-text-muted"
            )}
          >
            {i < currentStep ? (
              <Check size={14} strokeWidth={2} />
            ) : (
              s.count
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <div className="space-y-3" key={currentStep}>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">
            {step.count} {step.sense}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {step.prompt}
          </p>
        </div>

        <Textarea
          value={responses[currentStep]}
          onChange={(e) => handleResponse(e.target.value)}
          placeholder={step.placeholder}
          rows={3}
          className="animate-fade-in"
          autoFocus
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleNext}
      >
        {isLast ? "Concluir aterramento" : "Proximo"}
        {!isLast && <ChevronRight size={16} strokeWidth={2} />}
      </Button>
    </div>
  );
}

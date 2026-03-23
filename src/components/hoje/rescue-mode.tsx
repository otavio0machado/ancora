"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/lib/stores/app-store";
import { BreathingExercise } from "./breathing-exercise";

// --------------- Sub-sections ---------------

type RescueSection = "grounding" | "breathing" | "defusion" | "impulse" | null;

// --------------- Grounding 5-4-3-2-1 ---------------

function GroundingExercise() {
  const steps = [
    { count: 5, sense: "coisas que voce ve", icon: "\uD83D\uDC41" },
    { count: 4, sense: "coisas que voce toca", icon: "\u270B" },
    { count: 3, sense: "coisas que voce ouve", icon: "\uD83D\uDC42" },
    { count: 2, sense: "coisas que voce cheira", icon: "\uD83D\uDC43" },
    { count: 1, sense: "coisa que voce sente o gosto", icon: "\uD83D\uDC45" },
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-sm text-text-secondary leading-relaxed">
        Nomeie devagar, sem pressa. O objetivo e trazer sua atencao para o
        momento presente.
      </p>
      <ul className="flex flex-col gap-3">
        {steps.map((step) => (
          <li
            key={step.count}
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              "bg-surface-sunken border border-border-subtle"
            )}
          >
            <span className="text-lg mt-0.5" aria-hidden="true">
              {step.count}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                {step.sense}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --------------- ACT Defusion ---------------

function DefusionExercise() {
  const techniques = [
    {
      title: "Observe o pensamento",
      description:
        'Diga para si: "Estou tendo o pensamento de que..." e complete. Isso cria distancia entre voce e o pensamento.',
    },
    {
      title: "Folhas no rio",
      description:
        "Imagine cada pensamento como uma folha flutuando num rio. Voce esta na margem, observando as folhas passarem. Nao precisa pegar nenhuma.",
    },
    {
      title: "Repita em voz engraçada",
      description:
        "Pegue o pensamento mais insistente e repita em voz de desenho animado. Ele perde a forca quando muda de forma.",
    },
  ];

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-sm text-text-secondary leading-relaxed">
        Defusao cognitiva: separar voce dos seus pensamentos. Voce nao e o que
        pensa.
      </p>
      <ul className="flex flex-col gap-3">
        {techniques.map((tech) => (
          <li
            key={tech.title}
            className={cn(
              "flex flex-col gap-1 rounded-xl px-4 py-3",
              "bg-surface-sunken border border-border-subtle"
            )}
          >
            <span className="text-sm font-medium text-text-primary">
              {tech.title}
            </span>
            <span className="text-xs text-text-secondary leading-relaxed">
              {tech.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --------------- Impulse Quick Log ---------------

function ImpulseQuickAccess() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-sm text-text-secondary leading-relaxed">
        Registrar o impulso e uma forma de observar sem agir. Voce nao precisa
        lutar contra ele - apenas anotar.
      </p>
      <div
        className={cn(
          "rounded-xl px-4 py-4 text-center",
          "bg-rescue-subtle border border-rescue/20"
        )}
      >
        <p className="text-sm font-medium text-text-primary mb-3">
          Vontade nao e ordem.
        </p>
        <p className="text-xs text-text-secondary leading-relaxed">
          Voce pode sentir vontade e escolher nao agir. O impulso vai passar.
          Ele sempre passa.
        </p>
      </div>
      <Button variant="outline" size="md" className="w-full" asChild>
        <a href="/impulsos">Registrar impulso no diario</a>
      </Button>
    </div>
  );
}

// --------------- Main Component ---------------

export function RescueMode() {
  const { rescueMode, toggleRescueMode } = useAppStore();
  const [activeSection, setActiveSection] = useState<RescueSection>(null);

  if (!rescueMode) {
    return (
      <Button
        variant="rescue"
        size="lg"
        onClick={toggleRescueMode}
        className="w-full"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Modo Resgate
      </Button>
    );
  }

  // Rescue mode is active
  return (
    <Card className="animate-scale-in border-rescue/30 bg-rescue-subtle/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-rescue">Modo Resgate</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveSection(null);
              toggleRescueMode();
            }}
          >
            Sair
          </Button>
        </div>
        <CardDescription>
          Voce esta seguro. Uma coisa de cada vez. Escolha o que precisa agora.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Regulatory phrase - always visible */}
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-center",
            "bg-surface border border-border-subtle"
          )}
        >
          <p className="text-sm text-text-primary font-medium leading-relaxed">
            Vontade nao e ordem.
          </p>
          <p className="text-xs text-text-muted mt-1">
            Voce pode sentir e escolher nao agir.
          </p>
        </div>

        {/* Section buttons */}
        {!activeSection && (
          <div className="grid grid-cols-2 gap-3 animate-fade-in">
            <button
              type="button"
              onClick={() => setActiveSection("grounding")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-4",
                "bg-surface border border-border-subtle",
                "hover:bg-surface-sunken transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span className="text-2xl">5-4-3-2-1</span>
              <span className="text-xs text-text-secondary">Aterramento</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("breathing")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-4",
                "bg-surface border border-border-subtle",
                "hover:bg-surface-sunken transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span className="text-2xl">4-7-8</span>
              <span className="text-xs text-text-secondary">Respiracao</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("defusion")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-4",
                "bg-surface border border-border-subtle",
                "hover:bg-surface-sunken transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span className="text-2xl opacity-70">
                <svg
                  className="w-7 h-7 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <span className="text-xs text-text-secondary">Defusao</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("impulse")}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-4",
                "bg-surface border border-border-subtle",
                "hover:bg-surface-sunken transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <span className="text-2xl opacity-70">
                <svg
                  className="w-7 h-7 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </span>
              <span className="text-xs text-text-secondary">Impulso</span>
            </button>
          </div>
        )}

        {/* Active section content */}
        {activeSection && (
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(null)}
              className="self-start -ml-2"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Voltar
            </Button>

            {activeSection === "grounding" && <GroundingExercise />}
            {activeSection === "breathing" && (
              <BreathingExercise
                inhale={4}
                hold={7}
                exhale={8}
                onClose={() => setActiveSection(null)}
              />
            )}
            {activeSection === "defusion" && <DefusionExercise />}
            {activeSection === "impulse" && <ImpulseQuickAccess />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

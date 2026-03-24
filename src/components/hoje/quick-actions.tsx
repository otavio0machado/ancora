"use client";

import { useState } from "react";
import { Wind, Droplets, Footprints, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { BreathingExercise } from "./breathing-exercise";

// --------------- Types ---------------

type QuickAction = "breathe" | "ground" | "move" | "water";

interface ActionConfig {
  id: QuickAction;
  label: string;
  sublabel: string;
  icon: typeof Wind;
  color: string;
  bgColor: string;
}

const ACTIONS: ActionConfig[] = [
  {
    id: "breathe",
    label: "Respirar",
    sublabel: "1 min",
    icon: Wind,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20",
  },
  {
    id: "ground",
    label: "Reset mental",
    sublabel: "Aterrar",
    icon: RotateCcw,
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20",
  },
  {
    id: "move",
    label: "Mover corpo",
    sublabel: "2 min",
    icon: Footprints,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20",
  },
  {
    id: "water",
    label: "Beber água",
    sublabel: "Agora",
    icon: Droplets,
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-500/10 border-sky-100 dark:border-sky-500/20",
  },
];

// --------------- Grounding micro exercise ---------------

function QuickGrounding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  const prompts = [
    "Olhe ao redor. Nomeie 3 coisas que você vê.",
    "Sinta seus pés no chão. A cadeira te segurando.",
    "Ouça. Qual é o som mais distante que consegue ouvir?",
    "Respire fundo uma vez. Devagar.",
  ];

  const isLast = step === prompts.length - 1;

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-xl bg-surface-sunken border border-border-subtle p-5">
        <p className="text-sm text-text-primary leading-relaxed text-center font-medium">
          {prompts[step]}
        </p>
      </div>
      <div className="flex gap-1.5 justify-center">
        {prompts.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i <= step ? "bg-accent" : "bg-surface-sunken",
            )}
          />
        ))}
      </div>
      <Button
        size="md"
        variant={isLast ? "default" : "outline"}
        className="w-full"
        onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
      >
        {isLast ? "Pronto" : "Próximo"}
      </Button>
    </div>
  );
}

// --------------- Body movement prompt ---------------

function QuickMove({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 animate-fade-in py-2">
        <p className="text-sm text-success font-medium">Corpo ativado. Isso muda o estado.</p>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-xl bg-surface-sunken border border-border-subtle p-5">
        <p className="text-sm text-text-primary text-center font-medium mb-3">
          Escolha uma:
        </p>
        <ul className="flex flex-col gap-2 text-sm text-text-secondary">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            10 agachamentos
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            Caminhe pelo cômodo por 2 minutos
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            Estique os braços acima da cabeça 10 vezes
          </li>
        </ul>
      </div>
      <Button size="md" className="w-full" onClick={() => setDone(true)}>
        Fiz!
      </Button>
    </div>
  );
}

// --------------- Water prompt ---------------

function QuickWater({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 animate-fade-in py-2">
        <p className="text-sm text-success font-medium">Hidratado. Ação simples, efeito real.</p>
        <Button size="sm" variant="ghost" onClick={onDone}>
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <div className="rounded-xl bg-surface-sunken border border-border-subtle p-5 text-center">
        <p className="text-sm text-text-primary font-medium mb-2">
          Levante agora.
        </p>
        <p className="text-sm text-text-secondary leading-relaxed">
          Pegue um copo de água. Beba devagar. Sinta a temperatura.
        </p>
      </div>
      <Button size="md" className="w-full" onClick={() => setDone(true)}>
        Bebi
      </Button>
    </div>
  );
}

// --------------- Main Component ---------------

export function QuickActions() {
  const [activeAction, setActiveAction] = useState<QuickAction | null>(null);

  const handleDone = () => setActiveAction(null);

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
        Ações imediatas
      </p>

      {/* Action buttons grid */}
      {!activeAction && (
        <div className="grid grid-cols-4 gap-2">
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => setActiveAction(action.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3",
                  "transition-all duration-200",
                  "hover:scale-[1.02] active:scale-[0.97]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  action.bgColor,
                )}
              >
                <Icon size={20} className={action.color} strokeWidth={1.5} />
                <span className="text-[11px] font-medium text-text-primary leading-tight">
                  {action.label}
                </span>
                <span className="text-[10px] text-text-muted">{action.sublabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active action inline display */}
      {activeAction === "breathe" && (
        <div className="animate-fade-in">
          <BreathingExercise inhale={4} hold={4} exhale={6} onClose={handleDone} />
        </div>
      )}

      {activeAction === "ground" && <QuickGrounding onDone={handleDone} />}
      {activeAction === "move" && <QuickMove onDone={handleDone} />}
      {activeAction === "water" && <QuickWater onDone={handleDone} />}

      {/* Back button when action is active */}
      {activeAction && activeAction !== "breathe" && (
        <button
          type="button"
          onClick={handleDone}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors text-center"
        >
          Voltar
        </button>
      )}
    </div>
  );
}

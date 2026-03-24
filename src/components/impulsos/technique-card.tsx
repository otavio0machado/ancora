"use client";

import { useState } from "react";
import {
  Snowflake,
  Wind,
  Eye,
  Hand,
  ArrowLeftRight,
  DoorOpen,
  Timer,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TechniqueId } from "@/lib/stores/impulse-store";

// --------------- Built-in DBT/ACT Techniques ---------------

export interface Technique {
  id: TechniqueId;
  name: string;
  shortInstruction: string;
  fullInstruction: string;
  icon: keyof typeof TECHNIQUE_ICONS;
  hasPractice: boolean;
  practiceType?: "breathing" | "grounding" | "stop_walkthrough" | "opposite_action" | "timer";
}

const TECHNIQUE_ICONS = {
  snowflake: Snowflake,
  wind: Wind,
  eye: Eye,
  hand: Hand,
  arrowLeftRight: ArrowLeftRight,
  doorOpen: DoorOpen,
  timer: Timer,
} as const;

export const BUILTIN_TECHNIQUES: Technique[] = [
  {
    id: "tip",
    name: "TIP (Temperatura)",
    shortInstruction:
      "Mergulhe o rosto em água gelada por 30s ou segure gelo nas mãos",
    fullInstruction:
      "A mudança brusca de temperatura ativa o reflexo de mergulho, desacelerando os batimentos cardíacos e acalmando o sistema nervoso. Segure gelo nas mãos, coloque água gelada no rosto, ou segure um pano frio no pescoço por pelo menos 30 segundos. Respire devagar enquanto faz isso.",
    icon: "snowflake",
    hasPractice: true,
    practiceType: "breathing",
  },
  {
    id: "breathing",
    name: "Respiração 4-7-8",
    shortInstruction: "Inspire 4s, segure 7s, expire 8s",
    fullInstruction:
      "Inspire pelo nariz contando até 4. Segure o ar contando até 7. Expire pela boca lentamente contando até 8. A expiração longa ativa o sistema parassimpático, reduzindo a ativação do impulso. Repita pelo menos 3 ciclos.",
    icon: "wind",
    hasPractice: true,
    practiceType: "breathing",
  },
  {
    id: "grounding",
    name: "Grounding 5-4-3-2-1",
    shortInstruction:
      "5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia",
    fullInstruction:
      "Olhe ao redor e nomeie: 5 coisas que você VÊ (detalhes de cor, forma). 4 coisas que você pode TOCAR (textura, temperatura). 3 coisas que você OUVE (sons próximos e distantes). 2 coisas que você CHEIRA. 1 coisa que você pode SABOREAR. Isso ancora você no presente e tira o foco do impulso.",
    icon: "eye",
    hasPractice: true,
    practiceType: "grounding",
  },
  {
    id: "stop",
    name: "STOP",
    shortInstruction:
      "Pare. Dê um passo atrás. Observe. Prossiga com consciência",
    fullInstruction:
      "S - PARE o que está fazendo. Congele. T - dê um PASSO ATRÁS. Respire. Não reaja automaticamente. O - OBSERVE o que está acontecendo dentro de você (pensamentos, sensações, emoções) e ao redor. P - PROSSIGA com consciência. Escolha uma ação alinhada com seus valores, não com o impulso.",
    icon: "hand",
    hasPractice: true,
    practiceType: "stop_walkthrough",
  },
  {
    id: "opposite_action",
    name: "Ação oposta",
    shortInstruction: "Faça o oposto do que o impulso pede",
    fullInstruction:
      "Identifique o que o impulso está pedindo (ficar parado, se isolar, consumir algo). Agora faça o OPOSTO: se o impulso pede isolamento, vá até alguém. Se pede passividade, mova o corpo. Se pede consumo, faça algo com as mãos. A ação oposta interrompe o ciclo automático do impulso.",
    icon: "arrowLeftRight",
    hasPractice: true,
    practiceType: "opposite_action",
  },
  {
    id: "environment_change",
    name: "Mudança de ambiente",
    shortInstruction:
      "Levante e mude de cômodo ou saia do ambiente",
    fullInstruction:
      "Mude fisicamente de lugar. Saia do cômodo, vá para outro andar, saia de casa se possível. A mudança de contexto físico interrompe a associação entre o ambiente e o impulso. Mesmo uma mudança pequena (mudar de cadeira, ir até a janela) já altera o estado interno.",
    icon: "doorOpen",
    hasPractice: false,
  },
  {
    id: "delay",
    name: "Adiamento de 10 min",
    shortInstruction:
      "Comprometa-se a esperar 10 minutos antes de decidir",
    fullInstruction:
      "A maioria dos impulsos perde força em 10-15 minutos. Prometa a si mesmo: 'Vou esperar 10 minutos e reavaliar.' Use esse tempo para fazer qualquer outra coisa. Se depois de 10 minutos ainda quiser, você decide conscientemente.",
    icon: "timer",
    hasPractice: true,
    practiceType: "timer",
  },
];

// --------------- Component ---------------

interface TechniqueCardProps {
  technique: Technique;
  isSelected?: boolean;
  onSelect?: (technique: Technique) => void;
  onStartPractice?: (technique: Technique) => void;
  className?: string;
}

export function TechniqueCard({
  technique,
  isSelected = false,
  onSelect,
  onStartPractice,
  className,
}: TechniqueCardProps) {
  const [expanded, setExpanded] = useState(false);

  const IconComponent = TECHNIQUE_ICONS[technique.icon];

  const handleClick = () => {
    setExpanded(!expanded);
    onSelect?.(technique);
  };

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        isSelected
          ? "border-accent/40 bg-accent-subtle/20 shadow-sm"
          : "border-border-subtle hover:border-accent/30 hover:bg-accent-subtle/10",
        className
      )}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "w-full text-left p-4",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-xl",
          "active:scale-[0.99]"
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
              "transition-colors duration-200",
              isSelected
                ? "bg-accent/10 text-accent"
                : "bg-surface-sunken text-text-muted"
            )}
          >
            <IconComponent size={18} strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                {technique.name}
              </p>
              <div className="flex items-center gap-1.5">
                {isSelected && (
                  <Check size={14} className="text-accent" strokeWidth={2} />
                )}
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={cn(
                    "text-text-muted transition-transform duration-200",
                    expanded && "rotate-180"
                  )}
                />
              </div>
            </div>
            <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">
              {technique.shortInstruction}
            </p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="ml-[52px]">
            <p className="text-sm text-text-secondary leading-relaxed pt-3 border-t border-border-subtle">
              {technique.fullInstruction}
            </p>

            {technique.hasPractice && onStartPractice && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartPractice(technique);
                }}
                className={cn(
                  "mt-3 w-full rounded-lg py-2.5 px-4",
                  "text-sm font-medium",
                  "bg-accent text-white",
                  "hover:bg-accent/90 active:scale-[0.98]",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
              >
                Praticar agora
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

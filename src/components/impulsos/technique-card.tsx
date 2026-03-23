"use client";

import { useState } from "react";
import {
  Snowflake,
  Wind,
  Eye,
  Hand,
  ArrowLeftRight,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// --------------- Built-in DBT Techniques ---------------

export interface Technique {
  id: string;
  name: string;
  shortInstruction: string;
  fullInstruction: string;
  icon: keyof typeof TECHNIQUE_ICONS;
}

const TECHNIQUE_ICONS = {
  snowflake: Snowflake,
  wind: Wind,
  eye: Eye,
  hand: Hand,
  arrowLeftRight: ArrowLeftRight,
  doorOpen: DoorOpen,
} as const;

export const BUILTIN_TECHNIQUES: Technique[] = [
  {
    id: "tip",
    name: "TIP (Temperatura)",
    shortInstruction:
      "Mergulhe o rosto em agua gelada por 30s ou segure gelo nas maos",
    fullInstruction:
      "A mudanca brusca de temperatura ativa o reflexo de mergulho, desacelerando os batimentos cardiacos e acalmando o sistema nervoso. Segure gelo nas maos, coloque agua gelada no rosto, ou segure um pano frio no pescoco por pelo menos 30 segundos. Respire devagar enquanto faz isso.",
    icon: "snowflake",
  },
  {
    id: "breathing-478",
    name: "Respiracao 4-7-8",
    shortInstruction: "Inspire 4s, segure 7s, expire 8s",
    fullInstruction:
      "Inspire pelo nariz contando ate 4. Segure o ar contando ate 7. Expire pela boca lentamente contando ate 8. A expiracao longa ativa o sistema parassimpatico, reduzindo a ativacao do impulso. Repita pelo menos 3 ciclos.",
    icon: "wind",
  },
  {
    id: "grounding-54321",
    name: "Grounding 5-4-3-2-1",
    shortInstruction:
      "5 coisas que ve, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia",
    fullInstruction:
      "Olhe ao redor e nomeie: 5 coisas que voce VE (detalhes de cor, forma). 4 coisas que voce pode TOCAR (textura, temperatura). 3 coisas que voce OUVE (sons proximos e distantes). 2 coisas que voce CHEIRA. 1 coisa que voce pode SABOREAR. Isso ancora voce no presente e tira o foco do impulso.",
    icon: "eye",
  },
  {
    id: "stop",
    name: "STOP",
    shortInstruction:
      "Pare. De um passo atras. Observe. Prossiga com consciencia",
    fullInstruction:
      "S - PARE o que esta fazendo. Congele. T - de um PASSO ATRAS. Respire. Nao reaja automaticamente. O - OBSERVE o que esta acontecendo dentro de voce (pensamentos, sensacoes, emocoes) e ao redor. P - PROSSIGA com consciencia. Escolha uma acao alinhada com seus valores, nao com o impulso.",
    icon: "hand",
  },
  {
    id: "opposite-action",
    name: "Acao oposta",
    shortInstruction: "Faca o oposto do que o impulso pede",
    fullInstruction:
      "Identifique o que o impulso esta pedindo (ficar parado, se isolar, consumir algo). Agora faca o OPOSTO: se o impulso pede isolamento, va ate alguem. Se pede passividade, mova o corpo. Se pede consumo, faca algo com as maos. A acao oposta interrompe o ciclo automatico do impulso.",
    icon: "arrowLeftRight",
  },
  {
    id: "environment-change",
    name: "Mudanca de ambiente",
    shortInstruction:
      "Levante e mude de comodo ou saia do ambiente",
    fullInstruction:
      "Mude fisicamente de lugar. Saia do comodo, va para outro andar, saia de casa se possivel. A mudanca de contexto fisico interrompe a associacao entre o ambiente e o impulso. Mesmo uma mudanca pequena (mudar de cadeira, ir ate a janela) ja altera o estado interno.",
    icon: "doorOpen",
  },
];

// --------------- Component ---------------

interface TechniqueCardProps {
  technique: Technique;
  onSelect?: (technique: Technique) => void;
  className?: string;
}

export function TechniqueCard({
  technique,
  onSelect,
  className,
}: TechniqueCardProps) {
  const [expanded, setExpanded] = useState(false);

  const IconComponent = TECHNIQUE_ICONS[technique.icon];

  return (
    <button
      type="button"
      onClick={() => {
        setExpanded(!expanded);
        onSelect?.(technique);
      }}
      className={cn(
        "w-full text-left rounded-xl border border-border-subtle p-4",
        "transition-all duration-200",
        "hover:border-accent/30 hover:bg-accent-subtle/30",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        expanded && "border-accent/40 bg-accent-subtle/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-accent-subtle/60 text-accent",
            "transition-colors duration-200"
          )}
        >
          <IconComponent size={16} strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {technique.name}
          </p>
          <p className="text-sm text-text-secondary mt-0.5 leading-relaxed">
            {technique.shortInstruction}
          </p>

          {expanded && (
            <p className="text-sm text-text-secondary mt-3 pt-3 border-t border-border-subtle leading-relaxed animate-fade-in">
              {technique.fullInstruction}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

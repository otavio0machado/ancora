"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, X, Award, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Impulse } from "@/types/database";

// --------------- Types ---------------

interface DelayTimerProps {
  /** Duration in seconds (default adaptive based on intensity) */
  duration?: number;
  impulseType: Impulse["type"];
  intensity: number;
  onTimerEnd: () => void;
  onDismissEarly: () => void;
}

// --------------- Messages ---------------

const GENERIC_MESSAGES = [
  "A maioria dos impulsos diminui em 10 minutos.",
  "Voce nao precisa decidir agora. Apenas espere.",
  "Observe o impulso como uma onda: ele sobe, atinge o pico e desce.",
  "Enquanto espera, respire devagar. O tempo esta ao seu lado.",
  "Cada segundo que passa, o impulso perde forca.",
  "Voce ja esperou ate aqui. Continue.",
  "O desconforto e temporario. Sua escolha e permanente.",
];

const TYPE_MESSAGES: Record<Impulse["type"], string[]> = {
  smoking: [
    "O pico da vontade de fumar dura cerca de 3 minutos. Voce ja esta superando.",
    "Cada impulso resistido enfraquece o proximo.",
    "Seus pulmoes estao agradecendo por esses minutos sem fumaca.",
    "A nicotina mente sobre o alivio. O alivio real vem de superar isso.",
  ],
  social_media: [
    "O que voce procura nas redes sociais pode ser encontrado de outra forma.",
    "A dopamina das redes e breve. A satisfacao de resistir dura mais.",
    "Nada la e urgente. Nada. Voce nao esta perdendo nada essencial.",
    "Depois de rolar o feed, voce se sentiria melhor? Provavelmente nao.",
  ],
  pornography: [
    "Esse impulso nao e sobre desejo - e sobre regulacao emocional.",
    "Voce esta buscando alivio de algo. Pode encontrar de outro jeito.",
    "Cada vez que voce escolhe diferente, fortalece a pessoa que quer ser.",
    "O alivio e momentaneo. O custo emocional vem depois.",
  ],
  binge_eating: [
    "Voce esta com fome fisica ou emocional? As duas sao validas, mas pedem respostas diferentes.",
    "Comer agora vai resolver o que voce esta sentindo?",
    "Voce merece cuidado. Existem formas de cuidado que nao custam depois.",
    "Se em 10 minutos ainda quiser comer, coma com presenca. Sem pressa.",
  ],
  substance: [
    "Voce ja sobreviveu a impulsos antes. Esse tambem vai passar.",
    "O escape e temporario. A recuperacao e duradoura.",
    "Uma substancia nao pode te dar o que voce realmente precisa.",
    "Voce e mais forte do que esse momento. Ja provou isso antes.",
  ],
  other: [
    "O impulso e informacao, nao instrucao.",
    "Voce pode sentir e escolher nao agir.",
    "Esse momento vai passar. Voce vai estar do outro lado.",
    "Observe o impulso sem se fundir com ele.",
  ],
};

const MILESTONE_MESSAGES: Record<number, string> = {
  60: "1 minuto. Voce esta se regulando.",
  180: "3 minutos. O pico do impulso provavelmente ja passou.",
  300: "5 minutos. A intensidade provavelmente ja caiu.",
  600: "10 minutos. Voce conseguiu. A maioria dos impulsos nao sobrevive isso.",
};

const MINI_ACTIVITIES = [
  "Nomeie 3 coisas boas da ultima semana.",
  "Pense em alguem que voce admira. O que essa pessoa faria agora?",
  "Lembre-se de um momento em que voce se sentiu genuinamente em paz.",
  "Descreva mentalmente o comodo onde voce esta, como se explicasse para alguem.",
  "Conte de tras para frente de 100, de 7 em 7.",
  "Pense em 3 coisas pelas quais voce e grato hoje.",
];

const HEALTHY_ALTERNATIVES: Record<Impulse["type"], string[]> = {
  smoking: [
    "Beber um copo de agua gelada devagar",
    "Fazer 10 respiracoes profundas",
    "Mascar algo (chiclete, bala de menta)",
  ],
  social_media: [
    "Ler uma pagina de um livro",
    "Fazer um alongamento de 2 minutos",
    "Escrever algo em papel",
  ],
  pornography: [
    "Fazer exercicio intenso por 5 minutos",
    "Tomar um banho frio rapido",
    "Ligar para alguem",
  ],
  binge_eating: [
    "Beber um cha ou cafe quente devagar",
    "Sair para uma caminhada curta",
    "Lavar as maos com agua fria e prestar atencao nas sensacoes",
  ],
  substance: [
    "Ligar para alguem de confianca",
    "Sair de casa e caminhar",
    "Fazer algo com as maos (desenhar, arrumar)",
  ],
  other: [
    "Beber agua",
    "Mudar de lugar",
    "Fazer 10 respiracoes profundas",
  ],
};

// --------------- Helpers ---------------

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  return `${m} minuto${m !== 1 ? "s" : ""}`;
}

// --------------- Component ---------------

export function DelayTimer({
  duration = 600,
  impulseType,
  intensity,
  onTimerEnd,
  onDismissEarly,
}: DelayTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [showMilestone, setShowMilestone] = useState<string | null>(null);
  const [activityIndex] = useState(() =>
    Math.floor(Math.random() * MINI_ACTIVITIES.length)
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = ((duration - secondsLeft) / duration) * 100;
  const elapsed = duration - secondsLeft;

  // Combine generic + type-specific messages
  const messages = [
    ...TYPE_MESSAGES[impulseType],
    ...GENERIC_MESSAGES,
  ];

  const alternatives = HEALTHY_ALTERNATIVES[impulseType];

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          cleanup();
          onTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return cleanup;
  }, [duration, onTimerEnd, cleanup]);

  // Rotate messages every 90 seconds
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 90_000);

    return () => clearInterval(msgInterval);
  }, [messages.length]);

  // Check for milestones
  useEffect(() => {
    const milestoneMsg = MILESTONE_MESSAGES[elapsed];
    if (milestoneMsg) {
      setShowMilestone(milestoneMsg);
      const timeout = setTimeout(() => setShowMilestone(null), 5000);
      return () => clearTimeout(timeout);
    }
  }, [elapsed]);

  const handleDismissRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirmDismiss = () => {
    cleanup();
    setShowConfirm(false);
    onDismissEarly();
  };

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-border bg-surface p-6",
          "flex flex-col items-center gap-5",
          "animate-fade-in"
        )}
      >
        <div className="flex items-center gap-2 text-text-muted">
          <Timer size={16} strokeWidth={1.5} />
          <span className="text-xs font-medium uppercase tracking-wider">
            Espere {formatDuration(duration)}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl font-light text-text-primary tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <Progress value={progress} className="w-48 h-1.5" />
        </div>

        {/* Milestone celebration */}
        {showMilestone && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-subtle/20 border border-accent/15 animate-fade-in">
            <Award size={14} className="text-accent flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-accent font-medium">
              {showMilestone}
            </p>
          </div>
        )}

        {/* Rotating message */}
        {!showMilestone && (
          <p
            key={messageIndex}
            className="text-sm text-text-secondary text-center max-w-[280px] leading-relaxed ancora-text-balance animate-fade-in"
          >
            {messages[messageIndex]}
          </p>
        )}

        {/* Mini activity */}
        {elapsed >= 60 && elapsed < duration - 60 && (
          <div className="w-full rounded-xl border border-border-subtle bg-surface-sunken p-4 space-y-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-text-muted" strokeWidth={1.5} />
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Enquanto espera
              </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {MINI_ACTIVITIES[activityIndex]}
            </p>
          </div>
        )}

        {/* Healthy alternatives */}
        {elapsed >= 120 && (
          <div className="w-full space-y-2 animate-fade-in">
            <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Alternativas saudaveis
            </span>
            <div className="flex flex-wrap gap-2">
              {alternatives.map((alt) => (
                <span
                  key={alt}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full",
                    "bg-surface-sunken border border-border-subtle",
                    "text-text-secondary"
                  )}
                >
                  {alt}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dismiss early */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismissRequest}
          className="text-text-muted"
        >
          <X size={14} />
          Pular espera
        </Button>
      </div>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar a espera?</DialogTitle>
            <DialogDescription>
              Ainda faltam {formatTime(secondsLeft)}. Impulsos geralmente perdem
              forca com o tempo. Tem certeza que quer pular?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowConfirm(false)}
            >
              Continuar esperando
            </Button>
            <Button variant="ghost" size="md" onClick={handleConfirmDismiss}>
              Sim, pular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  "Você não precisa decidir agora. Apenas espere.",
  "Observe o impulso como uma onda: ele sobe, atinge o pico e desce.",
  "Enquanto espera, respire devagar. O tempo está ao seu lado.",
  "Cada segundo que passa, o impulso perde força.",
  "Você já esperou até aqui. Continue.",
  "O desconforto é temporário. Sua escolha é permanente.",
];

const TYPE_MESSAGES: Record<Impulse["type"], string[]> = {
  smoking: [
    "O pico da vontade de fumar dura cerca de 3 minutos. Você já está superando.",
    "Cada impulso resistido enfraquece o próximo.",
    "Seus pulmões estão agradecendo por esses minutos sem fumaça.",
    "A nicotina mente sobre o alívio. O alívio real vem de superar isso.",
  ],
  social_media: [
    "O que você procura nas redes sociais pode ser encontrado de outra forma.",
    "A dopamina das redes é breve. A satisfação de resistir dura mais.",
    "Nada lá é urgente. Nada. Você não está perdendo nada essencial.",
    "Depois de rolar o feed, você se sentiria melhor? Provavelmente não.",
  ],
  pornography: [
    "Esse impulso não é sobre desejo - é sobre regulação emocional.",
    "Você está buscando alívio de algo. Pode encontrar de outro jeito.",
    "Cada vez que você escolhe diferente, fortalece a pessoa que quer ser.",
    "O alívio é momentâneo. O custo emocional vem depois.",
  ],
  binge_eating: [
    "Você está com fome física ou emocional? As duas são válidas, mas pedem respostas diferentes.",
    "Comer agora vai resolver o que você está sentindo?",
    "Você merece cuidado. Existem formas de cuidado que não custam depois.",
    "Se em 10 minutos ainda quiser comer, coma com presença. Sem pressa.",
  ],
  substance: [
    "Você já sobreviveu a impulsos antes. Esse também vai passar.",
    "O escape é temporário. A recuperação é duradoura.",
    "Uma substância não pode te dar o que você realmente precisa.",
    "Você é mais forte do que esse momento. Já provou isso antes.",
  ],
  other: [
    "O impulso é informação, não instrução.",
    "Você pode sentir e escolher não agir.",
    "Esse momento vai passar. Voce vai estar do outro lado.",
    "Observe o impulso sem se fundir com ele.",
  ],
};

const MILESTONE_MESSAGES: Record<number, string> = {
  60: "1 minuto. Você está se regulando.",
  180: "3 minutos. O pico do impulso provavelmente já passou.",
  300: "5 minutos. A intensidade provavelmente já caiu.",
  600: "10 minutos. Você conseguiu. A maioria dos impulsos não sobrevive isso.",
};

const MINI_ACTIVITIES = [
  "Nomeie 3 coisas boas da última semana.",
  "Pense em alguém que você admira. O que essa pessoa faria agora?",
  "Lembre-se de um momento em que você se sentiu genuinamente em paz.",
  "Descreva mentalmente o cômodo onde você está, como se explicasse para alguém.",
  "Conte de trás para frente de 100, de 7 em 7.",
  "Pense em 3 coisas pelas quais você é grato hoje.",
];

const HEALTHY_ALTERNATIVES: Record<Impulse["type"], string[]> = {
  smoking: [
    "Beber um copo de água gelada devagar",
    "Fazer 10 respirações profundas",
    "Mascar algo (chiclete, bala de menta)",
  ],
  social_media: [
    "Ler uma página de um livro",
    "Fazer um alongamento de 2 minutos",
    "Escrever algo em papel",
  ],
  pornography: [
    "Fazer exercício intenso por 5 minutos",
    "Tomar um banho frio rápido",
    "Ligar para alguém",
  ],
  binge_eating: [
    "Beber um chá ou café quente devagar",
    "Sair para uma caminhada curta",
    "Lavar as mãos com água fria e prestar atenção nas sensações",
  ],
  substance: [
    "Ligar para alguém de confiança",
    "Sair de casa e caminhar",
    "Fazer algo com as mãos (desenhar, arrumar)",
  ],
  other: [
    "Beber água",
    "Mudar de lugar",
    "Fazer 10 respirações profundas",
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
              Alternativas saudáveis
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
              força com o tempo. Tem certeza que quer pular?
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

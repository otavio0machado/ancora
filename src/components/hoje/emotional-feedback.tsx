"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type { CheckIn } from "@/types/database";

// --------------- Feedback derivation ---------------

interface EmotionalMessage {
  message: string;
  tone: "gentle" | "grounding" | "validating" | "encouraging";
}

function deriveEmotionalFeedback(checkIn: CheckIn): EmotionalMessage {
  const { energy, mood, anxiety, focus, impulsivity } = checkIn;
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 6;

  // Critical state
  if (anxiety >= 4 && impulsivity >= 4 && energy <= 2) {
    return {
      message: "Seu sistema está pedindo pausa. Não é fraqueza, é inteligência. Cuide-se primeiro.",
      tone: "gentle",
    };
  }

  // Night + high anxiety (possible avoidance pattern)
  if (isNight && anxiety >= 4) {
    return {
      message: "Noite com ansiedade alta. Isso é descanso ou fuga? Seja honesto consigo.",
      tone: "grounding",
    };
  }

  // High anxiety
  if (anxiety >= 4) {
    return {
      message: "Hoje não é sobre performar. É sobre se manter no eixo. Uma coisa de cada vez.",
      tone: "grounding",
    };
  }

  // High impulsivity
  if (impulsivity >= 4) {
    return {
      message: "Sentir o impulso é humano. Escolher o que fazer com ele é poder. Você tem esse poder.",
      tone: "validating",
    };
  }

  // Depression day
  if (energy <= 2 && mood <= 2) {
    return {
      message: "Dias assim passam, mesmo quando parece que não. Você não precisa ser produtivo para ter valor.",
      tone: "gentle",
    };
  }

  // Low energy
  if (energy <= 2) {
    return {
      message: "Energia baixa pede gentileza, não produtividade. Faça o mínimo com presença.",
      tone: "gentle",
    };
  }

  // Low mood
  if (mood <= 2) {
    return {
      message: "Humor baixo não define quem você é. É um estado, não uma sentença. Vai passar.",
      tone: "validating",
    };
  }

  // Bad sleep
  if (checkIn.sleep_quality != null && checkIn.sleep_quality <= 2) {
    return {
      message: "Noite ruim impacta tudo. Ajuste as expectativas. Hoje a régua é mais baixa — e tudo bem.",
      tone: "grounding",
    };
  }

  // Great day
  if (energy >= 4 && mood >= 4 && anxiety <= 2) {
    return {
      message: "Dia bom é recurso, não obrigação. Aproveite sem culpa. Você merece dias assim.",
      tone: "encouraging",
    };
  }

  // Good focus
  if (focus >= 4 && anxiety <= 2) {
    return {
      message: "Mente clara hoje. Use isso a seu favor — foque no que realmente importa para você.",
      tone: "encouraging",
    };
  }

  // Night time, stable state
  if (isNight) {
    return {
      message: "Noite chegou. O que precisou acontecer, aconteceu. Agora é hora de desacelerar.",
      tone: "gentle",
    };
  }

  // Default balanced
  return {
    message: "Você está aqui, presente, registrando. Isso já é regulação em ação.",
    tone: "validating",
  };
}

// --------------- Tone styling ---------------

function getToneStyle(tone: EmotionalMessage["tone"]) {
  switch (tone) {
    case "gentle":
      return "bg-accent-subtle/50 border-accent/10 text-accent";
    case "grounding":
      return "bg-surface-sunken border-border-subtle text-text-secondary";
    case "validating":
      return "bg-accent-subtle/30 border-accent/10 text-text-primary";
    case "encouraging":
      return "bg-success/5 border-success/15 text-success";
  }
}

// --------------- Component ---------------

interface EmotionalFeedbackProps {
  checkIn: CheckIn;
}

export function EmotionalFeedback({ checkIn }: EmotionalFeedbackProps) {
  const feedback = useMemo(() => deriveEmotionalFeedback(checkIn), [checkIn]);

  return (
    <div
      className={cn(
        "rounded-xl px-4 py-3.5 border animate-fade-in",
        getToneStyle(feedback.tone),
      )}
    >
      <p className="text-sm leading-relaxed font-medium italic">
        &ldquo;{feedback.message}&rdquo;
      </p>
    </div>
  );
}

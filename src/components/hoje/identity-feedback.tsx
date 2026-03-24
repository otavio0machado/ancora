"use client";

import { useMemo } from "react";
import { Sparkles, TrendingUp, ShieldCheck, Heart } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CheckIn } from "@/types/database";

// --------------- Types ---------------

interface IdentityMessage {
  text: string;
  icon: typeof Sparkles;
  type: "identity" | "value" | "progress" | "compassion";
}

// --------------- Value connection per priority ---------------

const VALUE_MAP: Record<string, { value: string; icon: string }> = {
  estudar: { value: "Conhecimento", icon: "📚" },
  estudo: { value: "Conhecimento", icon: "📚" },
  ler: { value: "Conhecimento", icon: "📚" },
  leitura: { value: "Conhecimento", icon: "📚" },
  treinar: { value: "Saúde", icon: "💪" },
  treino: { value: "Saúde", icon: "💪" },
  exercício: { value: "Saúde", icon: "💪" },
  academia: { value: "Saúde", icon: "💪" },
  correr: { value: "Saúde", icon: "💪" },
  meditar: { value: "Presença", icon: "🧘" },
  meditação: { value: "Presença", icon: "🧘" },
  dormir: { value: "Saúde", icon: "😴" },
  sono: { value: "Saúde", icon: "😴" },
  trabalhar: { value: "Propósito", icon: "🎯" },
  trabalho: { value: "Propósito", icon: "🎯" },
  família: { value: "Conexão", icon: "❤️" },
  amigos: { value: "Conexão", icon: "❤️" },
  ligar: { value: "Conexão", icon: "📞" },
  cozinhar: { value: "Autonomia", icon: "🍳" },
  limpar: { value: "Autonomia", icon: "🏠" },
  organizar: { value: "Autonomia", icon: "📋" },
};

/**
 * Match a priority text to an ACT value.
 */
export function matchPriorityToValue(text: string): { value: string; icon: string } | null {
  const lower = text.toLowerCase();
  for (const [keyword, mapping] of Object.entries(VALUE_MAP)) {
    if (lower.includes(keyword)) return mapping;
  }
  return null;
}

// --------------- Identity derivation ---------------

function deriveIdentityMessages(checkIn: CheckIn): IdentityMessage[] {
  const messages: IdentityMessage[] = [];
  const { energy, mood, anxiety, impulsivity } = checkIn;

  // If the user checked in despite difficult state → resilience
  if (anxiety >= 4 || energy <= 2 || mood <= 2) {
    messages.push({
      text: "Você fez check-in mesmo num dia difícil. Isso é autorregulação em prática.",
      icon: ShieldCheck,
      type: "identity",
    });
  }

  // High impulsivity but registered it → awareness
  if (impulsivity >= 4) {
    messages.push({
      text: "Reconhecer a impulsividade é o primeiro passo. Observar sem agir é uma habilidade que você está construindo.",
      icon: Sparkles,
      type: "progress",
    });
  }

  // Good day → leverage identity
  if (energy >= 4 && mood >= 4 && anxiety <= 2) {
    messages.push({
      text: "Dias bons são combustível. Use essa energia alinhado com quem você quer ser.",
      icon: TrendingUp,
      type: "value",
    });
  }

  // Low mood → compassion
  if (mood <= 2) {
    messages.push({
      text: "Cuidar de si nos dias ruins é o ato mais corajoso. Você está fazendo isso agora.",
      icon: Heart,
      type: "compassion",
    });
  }

  // Default: always show at least one
  if (messages.length === 0) {
    messages.push({
      text: "Cada check-in é um micro-ato de presença. Você está construindo consistência.",
      icon: Sparkles,
      type: "identity",
    });
  }

  return messages.slice(0, 1); // Show only the most relevant one
}

// --------------- Style helpers ---------------

function getTypeStyle(type: IdentityMessage["type"]) {
  switch (type) {
    case "identity":
      return "text-accent";
    case "value":
      return "text-success";
    case "progress":
      return "text-warning";
    case "compassion":
      return "text-accent";
  }
}

// --------------- Component ---------------

interface IdentityFeedbackProps {
  checkIn: CheckIn;
}

export function IdentityFeedback({ checkIn }: IdentityFeedbackProps) {
  const messages = useMemo(() => deriveIdentityMessages(checkIn), [checkIn]);

  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 animate-fade-in">
      {messages.map((msg, i) => {
        const Icon = msg.icon;
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              "bg-surface border border-border-subtle",
            )}
          >
            <Icon
              size={16}
              className={cn("flex-shrink-0 mt-0.5", getTypeStyle(msg.type))}
              strokeWidth={1.5}
            />
            <p className="text-sm text-text-secondary leading-relaxed">
              {msg.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

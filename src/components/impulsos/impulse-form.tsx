"use client";

import { useState } from "react";
import {
  Cigarette,
  Smartphone,
  EyeOff,
  UtensilsCrossed,
  Pill,
  HelpCircle,
  ChevronLeft,
  SkipForward,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { Impulse } from "@/types/database";

// --------------- Constants ---------------

const EMOTIONS = [
  { value: "ansiedade", label: "Ansiedade", color: "bg-amber-50 border-amber-200 text-amber-800" },
  { value: "tedio", label: "Tedio", color: "bg-slate-50 border-slate-200 text-slate-700" },
  { value: "solidao", label: "Solidao", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { value: "raiva", label: "Raiva", color: "bg-rose-50 border-rose-200 text-rose-800" },
  { value: "tristeza", label: "Tristeza", color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
  { value: "cansaco", label: "Cansaco", color: "bg-stone-50 border-stone-200 text-stone-700" },
  { value: "estresse", label: "Estresse", color: "bg-orange-50 border-orange-200 text-orange-800" },
  { value: "frustracao", label: "Frustracao", color: "bg-red-50 border-red-200 text-red-700" },
] as const;

const IMPULSE_TYPES: {
  value: Impulse["type"];
  label: string;
  icon: typeof Cigarette;
}[] = [
  { value: "smoking", label: "Cigarro", icon: Cigarette },
  { value: "social_media", label: "Redes sociais", icon: Smartphone },
  { value: "pornography", label: "Pornografia", icon: EyeOff },
  { value: "binge_eating", label: "Compulsao alimentar", icon: UtensilsCrossed },
  { value: "substance", label: "Substancia", icon: Pill },
  { value: "other", label: "Outro", icon: HelpCircle },
];

// --------------- Types ---------------

type FormStep = "emotion" | "type" | "intensity" | "context";

export interface ImpulseFormData {
  type: Impulse["type"];
  intensity: number;
  trigger: string;
  context: string;
  emotion_before: string;
}

interface ImpulseFormProps {
  onSubmit: (data: ImpulseFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const STEPS: FormStep[] = ["emotion", "type", "intensity", "context"];

// --------------- Component ---------------

export function ImpulseForm({ onSubmit, onCancel, isSubmitting = false }: ImpulseFormProps) {
  const [step, setStep] = useState<FormStep>("emotion");
  const [emotion, setEmotion] = useState<string>("");
  const [impulseType, setImpulseType] = useState<Impulse["type"] | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const [context, setContext] = useState("");

  const currentStepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length;

  const handleBack = () => {
    if (currentStepIndex === 0) {
      onCancel();
      return;
    }
    setStep(STEPS[currentStepIndex - 1]);
  };

  const handleEmotionSelect = (value: string) => {
    setEmotion(value);
    setStep("type");
  };

  const handleTypeSelect = (value: Impulse["type"]) => {
    setImpulseType(value);
    setStep("intensity");
  };

  const handleIntensityNext = () => {
    setStep("context");
  };

  const handleSubmit = () => {
    if (!impulseType) return;
    onSubmit({
      type: impulseType,
      intensity,
      trigger,
      context,
      emotion_before: emotion,
    });
  };

  const intensityLabel = () => {
    if (intensity <= 2) return "Fraco (posso ignorar)";
    if (intensity <= 4) return "Leve (incomoda, mas controlo)";
    if (intensity <= 6) return "Moderado (exige esforco)";
    if (intensity <= 8) return "Forte (dificil resistir)";
    return "Muito forte (dificil resistir)";
  };

  const intensityColor = () => {
    if (intensity <= 3) return "text-text-secondary";
    if (intensity <= 6) return "text-amber-600";
    if (intensity <= 8) return "text-orange-600";
    return "text-rose-600";
  };

  return (
    <div className="flex flex-col min-h-[420px]">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pb-6">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentStepIndex
                ? "w-6 bg-accent"
                : i < currentStepIndex
                  ? "w-1.5 bg-accent/50"
                  : "w-1.5 bg-border-subtle"
            )}
          />
        ))}
      </div>

      {/* Back button */}
      <button
        type="button"
        onClick={handleBack}
        className={cn(
          "flex items-center gap-1 text-sm text-text-muted mb-4",
          "hover:text-text-secondary transition-colors",
          "self-start -ml-1"
        )}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        {currentStepIndex === 0 ? "Cancelar" : "Voltar"}
      </button>

      {/* Step content with transition */}
      <div className="flex-1 animate-slide-up">
        {/* Step 1: Emotion */}
        {step === "emotion" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">
                O que voce esta sentindo agora?
              </h2>
              <p className="text-sm text-text-muted">
                Nomeie a emocao. Sem pressa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {EMOTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleEmotionSelect(value)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border p-4",
                    "text-sm font-medium",
                    "transition-all duration-200",
                    "hover:shadow-sm active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "min-h-[56px]",
                    emotion === value
                      ? cn(color, "shadow-sm")
                      : "border-border-subtle bg-surface hover:border-accent/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Impulse Type */}
        {step === "type" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">
                Qual impulso esta sentindo?
              </h2>
              <p className="text-sm text-text-muted">
                Identifique o impulso.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {IMPULSE_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleTypeSelect(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-5",
                    "text-sm font-medium",
                    "transition-all duration-200",
                    "hover:shadow-sm active:scale-[0.97]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "min-h-[80px]",
                    impulseType === value
                      ? "border-accent bg-accent-subtle/30 shadow-sm"
                      : "border-border-subtle bg-surface hover:border-accent/30"
                  )}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className={cn(
                      impulseType === value
                        ? "text-accent"
                        : "text-text-muted"
                    )}
                  />
                  <span className="text-text-primary">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Intensity */}
        {step === "intensity" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">
                Qual a intensidade?
              </h2>
              <p className="text-sm text-text-muted">
                De 1 a 10, o quanto esse impulso esta forte agora.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    "text-5xl font-light tabular-nums transition-colors duration-300",
                    intensityColor()
                  )}
                >
                  {intensity}
                </span>
              </div>

              <Slider
                min={1}
                max={10}
                step={1}
                value={[intensity]}
                onValueChange={([v]) => setIntensity(v)}
                className="py-4"
              />

              <p
                className={cn(
                  "text-sm text-center transition-colors duration-300",
                  intensityColor()
                )}
              >
                {intensityLabel()}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full mt-4"
              onClick={handleIntensityNext}
            >
              Continuar
            </Button>
          </div>
        )}

        {/* Step 4: Context */}
        {step === "context" && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-text-primary">
                Contexto
              </h2>
              <p className="text-sm text-text-muted">
                Opcional, mas ajuda a entender padroes.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  O que estava fazendo?
                </label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Trabalhando, descansando, navegando..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  O que aconteceu antes?
                </label>
                <Textarea
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="O que pode ter disparado esse impulso?"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processando..." : "Iniciar protocolo"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-text-muted"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                <SkipForward size={14} strokeWidth={1.5} />
                Pular contexto e iniciar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

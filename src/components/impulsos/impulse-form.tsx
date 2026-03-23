"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Impulse } from "@/types/database";

// --------------- Constants ---------------

const IMPULSE_TYPES: { value: Impulse["type"]; label: string }[] = [
  { value: "smoking", label: "Cigarro" },
  { value: "social_media", label: "Redes sociais" },
  { value: "pornography", label: "Pornografia" },
  { value: "binge_eating", label: "Compulsao alimentar" },
  { value: "substance", label: "Substancia" },
  { value: "other", label: "Outro" },
];

const EMOTIONS: { value: string; label: string }[] = [
  { value: "ansiedade", label: "Ansiedade" },
  { value: "tedio", label: "Tedio" },
  { value: "solidao", label: "Solidao" },
  { value: "raiva", label: "Raiva" },
  { value: "tristeza", label: "Tristeza" },
  { value: "cansaco", label: "Cansaco" },
  { value: "estresse", label: "Estresse" },
];

// --------------- Types ---------------

export interface ImpulseFormData {
  type: Impulse["type"];
  intensity: number;
  trigger: string;
  context: string;
  emotion_before: string;
}

interface ImpulseFormProps {
  onSubmit: (data: ImpulseFormData) => void;
  isSubmitting?: boolean;
}

// --------------- Component ---------------

export function ImpulseForm({ onSubmit, isSubmitting = false }: ImpulseFormProps) {
  const [type, setType] = useState<Impulse["type"]>("other");
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState("");
  const [context, setContext] = useState("");
  const [emotionBefore, setEmotionBefore] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      intensity,
      trigger,
      context,
      emotion_before: emotionBefore,
    });
  };

  const intensityLabel = () => {
    if (intensity <= 3) return "Leve";
    if (intensity <= 6) return "Moderado";
    if (intensity <= 8) return "Forte";
    return "Muito forte";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Impulse type */}
      <div className="space-y-2">
        <Label>Tipo de impulso</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as Impulse["type"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {IMPULSE_TYPES.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Intensity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Intensidade</Label>
          <span className="text-sm text-text-secondary tabular-nums">
            {intensity}/10{" "}
            <span className="text-text-muted">({intensityLabel()})</span>
          </span>
        </div>
        <Slider
          min={1}
          max={10}
          step={1}
          value={[intensity]}
          onValueChange={([v]) => setIntensity(v)}
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>Leve</span>
          <span>Muito forte</span>
        </div>
      </div>

      {/* Emotion before */}
      <div className="space-y-2">
        <Label>Emocao antes do impulso</Label>
        <Select value={emotionBefore} onValueChange={setEmotionBefore}>
          <SelectTrigger>
            <SelectValue placeholder="O que voce esta sentindo?" />
          </SelectTrigger>
          <SelectContent>
            {EMOTIONS.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Trigger */}
      <div className="space-y-2">
        <Label>
          O que aconteceu?{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </Label>
        <Textarea
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          placeholder="O que disparou esse impulso?"
          rows={2}
        />
      </div>

      {/* Context */}
      <div className="space-y-2">
        <Label>
          Contexto{" "}
          <span className="font-normal text-text-muted">(opcional)</span>
        </Label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Onde voce esta? O que estava fazendo?"
          rows={2}
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className={cn("w-full")}
      >
        {isSubmitting ? "Processando..." : "Iniciar protocolo"}
      </Button>
    </form>
  );
}

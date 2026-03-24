"use client";

import { useState } from "react";
import { Moon, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { detectOverloadRisk, type OverloadRisk } from "@/lib/utils/patterns";

// --------------- Slider dimension config ---------------

interface SliderDimension {
  key: "energy" | "mood" | "anxiety" | "focus" | "impulsivity";
  label: string;
  icon: string;
  lowLabel: string;
  highLabel: string;
  /** When true, higher values are concerning (anxiety, impulsivity) */
  reverseColor: boolean;
}

const DIMENSIONS: SliderDimension[] = [
  {
    key: "energy",
    label: "Energia",
    icon: "\u2600",
    lowLabel: "Muito baixa",
    highLabel: "Muito alta",
    reverseColor: false,
  },
  {
    key: "mood",
    label: "Humor",
    icon: "\u263A",
    lowLabel: "Muito baixo",
    highLabel: "Muito alto",
    reverseColor: false,
  },
  {
    key: "anxiety",
    label: "Ansiedade",
    icon: "\u26A1",
    lowLabel: "Muito baixa",
    highLabel: "Muito alta",
    reverseColor: true,
  },
  {
    key: "focus",
    label: "Foco",
    icon: "\u25CE",
    lowLabel: "Muito baixo",
    highLabel: "Muito alto",
    reverseColor: false,
  },
  {
    key: "impulsivity",
    label: "Impulsividade",
    icon: "\u21AF",
    lowLabel: "Muito baixa",
    highLabel: "Muito alta",
    reverseColor: true,
  },
];

// --------------- Sleep quality labels ---------------

const SLEEP_QUALITY_LABELS: Record<number, string> = {
  1: "Péssimo",
  2: "Ruim",
  3: "Regular",
  4: "Bom",
  5: "Ótimo",
};

// --------------- Value label ---------------

const VALUE_LABELS: Record<number, string> = {
  1: "1",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
};

function getValueColor(value: number, reverse: boolean): string {
  if (reverse) {
    // High = concerning
    if (value <= 2) return "text-success";
    if (value === 3) return "text-text-secondary";
    return "text-alert";
  }
  // High = good
  if (value <= 2) return "text-alert";
  if (value === 3) return "text-text-secondary";
  return "text-success";
}

function getSleepQualityColor(value: number): string {
  if (value <= 2) return "text-alert";
  if (value === 3) return "text-text-secondary";
  return "text-success";
}

// --------------- Component ---------------

interface CheckInFormProps {
  onComplete?: (overloadRisk: OverloadRisk) => void;
}

export function CheckInForm({ onComplete }: CheckInFormProps) {
  const { checkIn, setCheckIn, isSubmitting } = useCheckInStore();
  const [notes, setNotes] = useState(checkIn?.notes ?? "");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [sleepHours, setSleepHours] = useState("7");
  const [submitted, setSubmitted] = useState(false);
  const [overloadWarning, setOverloadWarning] = useState<OverloadRisk | null>(null);

  const values = checkIn ?? {
    energy: 3,
    mood: 3,
    anxiety: 3,
    focus: 3,
    impulsivity: 3,
  };

  const handleSubmit = async () => {
    const parsedHours = Math.min(16, Math.max(0, parseFloat(sleepHours) || 0));

    setCheckIn({ notes: notes.trim() || undefined });

    // Build a mock check-in for local state
    const mockCheckIn = {
      id: crypto.randomUUID(),
      user_id: "local-user",
      date: new Date().toISOString().slice(0, 10),
      energy: values.energy,
      mood: values.mood,
      anxiety: values.anxiety,
      focus: values.focus,
      impulsivity: values.impulsivity,
      notes: notes.trim() || null,
      sleep_quality: sleepQuality,
      sleep_hours: parsedHours,
      created_at: new Date().toISOString(),
    };

    // Set it directly in the store as todayCheckIn
    useCheckInStore.setState({ todayCheckIn: mockCheckIn, isSubmitting: false });

    // Detect overload risk
    const risk = detectOverloadRisk({
      energy: values.energy,
      anxiety: values.anxiety,
      impulsivity: values.impulsivity,
      focus: values.focus,
    });

    setSubmitted(true);

    // Show overload warning if high or critical
    if (risk.risk === "high" || risk.risk === "critical") {
      setOverloadWarning(risk);
    }

    onComplete?.(risk);
  };

  if (submitted && overloadWarning && (overloadWarning.risk === "high" || overloadWarning.risk === "critical")) {
    return (
      <Card className="animate-scale-in border-0">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl",
                "flex items-center justify-center",
                "bg-warning-subtle border border-warning/20"
              )}
            >
              <AlertTriangle size={20} className="text-warning" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-semibold text-text-primary">
                Alerta de sobrecarga detectado
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                {overloadWarning.risk === "critical"
                  ? "Seu sistema está sobrecarregado. Considere ativar o modo resgate ou reduzir ao mínimo."
                  : "Sobrecarga alta detectada. Considere reduzir suas prioridades e focar no básico."}
              </p>
            </div>
            <p className="text-xs text-text-muted">
              Registrado. Nomear o que se sente já é uma forma de regulação.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <Card className="animate-scale-in">
        <CardContent className="p-6 text-center">
          <p className="text-text-secondary text-sm">
            Registrado. Nomear o que se sente já é uma forma de regulação.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Como você está agora?</CardTitle>
        <CardDescription>
          Sem certo ou errado. Apenas observe e registre.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-8 pt-6">
        {/* ===== SLEEP SECTION ===== */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <Moon size={16} className="text-text-muted" strokeWidth={1.5} />
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
              Sono
            </p>
          </div>

          {/* Sleep quality slider */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">
                Como foi seu sono?
              </span>
              <span
                className={cn(
                  "text-sm font-semibold transition-colors duration-200",
                  getSleepQualityColor(sleepQuality)
                )}
              >
                {SLEEP_QUALITY_LABELS[sleepQuality]}
              </span>
            </div>

            <Slider
              min={1}
              max={5}
              step={1}
              value={[sleepQuality]}
              onValueChange={([v]) => setSleepQuality(v)}
              aria-label="Qualidade do sono"
            />

            <div className="flex justify-between">
              <span className="text-[11px] text-text-muted">Péssimo</span>
              <span className="text-[11px] text-text-muted">Ótimo</span>
            </div>
          </div>

          {/* Sleep hours input */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="sleep-hours"
              className="text-sm font-medium text-text-primary"
            >
              Quantas horas dormiu?
            </label>
            <Input
              id="sleep-hours"
              type="number"
              min={0}
              max={16}
              step={0.5}
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              placeholder="7"
              className="w-24"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* ===== EMOTIONAL DIMENSIONS ===== */}
        <div className="flex flex-col gap-6">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Estado emocional
          </p>

          {DIMENSIONS.map((dim) => {
            const val = values[dim.key];
            return (
              <div key={dim.key} className="flex flex-col gap-3">
                {/* Label row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base opacity-60" aria-hidden="true">
                      {dim.icon}
                    </span>
                    <span className="text-sm font-medium text-text-primary">
                      {dim.label}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums transition-colors duration-200",
                      getValueColor(val, dim.reverseColor)
                    )}
                  >
                    {VALUE_LABELS[val]}
                  </span>
                </div>

                {/* Slider */}
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[val]}
                  onValueChange={([v]) => setCheckIn({ [dim.key]: v })}
                  aria-label={dim.label}
                />

                {/* Extreme labels */}
                <div className="flex justify-between">
                  <span className="text-[11px] text-text-muted">
                    {dim.lowLabel}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {dim.highLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-border-subtle" />

        {/* ===== NOTES ===== */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="checkin-notes"
            className="text-sm text-text-secondary"
          >
            Algo mais que queira registrar? (opcional)
          </label>
          <Textarea
            id="checkin-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como está seu dia, o que está sentindo..."
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Submit */}
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Registrando..." : "Registrar check-in"}
        </Button>
      </CardContent>
    </Card>
  );
}

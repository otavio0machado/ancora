"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
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

// --------------- Component ---------------

interface CheckInFormProps {
  onComplete?: () => void;
}

export function CheckInForm({ onComplete }: CheckInFormProps) {
  const { checkIn, setCheckIn, isSubmitting } = useCheckInStore();
  const [notes, setNotes] = useState(checkIn?.notes ?? "");
  const [submitted, setSubmitted] = useState(false);

  const values = checkIn ?? {
    energy: 3,
    mood: 3,
    anxiety: 3,
    focus: 3,
    impulsivity: 3,
  };

  const handleSubmit = async () => {
    setCheckIn({ notes: notes.trim() || undefined });

    // For MVP, simulate a local submit instead of Supabase
    // The store's submitCheckIn calls Supabase; here we do a local-only approach
    const { todayCheckIn } = useCheckInStore.getState();

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
      created_at: new Date().toISOString(),
    };

    // Set it directly in the store as todayCheckIn
    useCheckInStore.setState({ todayCheckIn: mockCheckIn, isSubmitting: false });

    setSubmitted(true);
    onComplete?.();
  };

  if (submitted) {
    return (
      <Card className="animate-scale-in">
        <CardContent className="p-6 text-center">
          <p className="text-text-secondary text-sm">
            Registrado. Nomear o que se sente ja e uma forma de regulacao.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Como voce esta agora?</CardTitle>
        <CardDescription>
          Sem certo ou errado. Apenas observe e registre.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-8 pt-6">
        {/* Slider dimensions */}
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

        {/* Notes */}
        <div className="flex flex-col gap-2 pt-2">
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
            placeholder="Como esta seu dia, o que esta sentindo..."
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

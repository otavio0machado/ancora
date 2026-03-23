"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MicrocopyDisplay } from "@/components/shared/microcopy-display";

interface OutcomeFormProps {
  onSubmit: (resisted: boolean, notes: string) => void;
  isSubmitting?: boolean;
}

export function OutcomeForm({ onSubmit, isSubmitting = false }: OutcomeFormProps) {
  const [outcome, setOutcome] = useState<"resisted" | "gave_in" | null>(null);
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (outcome === null) return;
    onSubmit(outcome === "resisted", notes);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-text-primary">
          Como foi?
        </h3>
        <p className="text-sm text-text-secondary">
          Sem julgamento. Apenas um registro.
        </p>
      </div>

      {/* Outcome buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOutcome("resisted")}
          className={cn(
            "flex-1 rounded-xl border p-4 text-left",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            outcome === "resisted"
              ? "border-accent bg-accent-subtle/40 shadow-xs"
              : "border-border-subtle hover:border-accent/30 hover:bg-surface-sunken/50"
          )}
        >
          <p className="text-sm font-medium text-text-primary">
            Consegui esperar
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            O impulso passou ou diminuiu
          </p>
        </button>

        <button
          type="button"
          onClick={() => setOutcome("gave_in")}
          className={cn(
            "flex-1 rounded-xl border p-4 text-left",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            outcome === "gave_in"
              ? "border-rescue bg-rescue-subtle/40 shadow-xs"
              : "border-border-subtle hover:border-rescue/30 hover:bg-surface-sunken/50"
          )}
        >
          <p className="text-sm font-medium text-text-primary">
            Nao dessa vez
          </p>
          <p className="text-xs text-text-muted mt-0.5">
            Tudo bem. Registrar ja ajuda.
          </p>
        </button>
      </div>

      {/* Validating message */}
      {outcome !== null && (
        <Card className="border-border-subtle animate-fade-in">
          <CardContent className="p-4">
            {outcome === "resisted" ? (
              <MicrocopyDisplay context="impulse_resisted" />
            ) : (
              <MicrocopyDisplay context="impulse_gave_in" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {outcome !== null && (
        <div className="space-y-2 animate-fade-in">
          <label className="text-sm font-medium text-text-primary">
            Observacoes{" "}
            <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              outcome === "resisted"
                ? "O que ajudou? Como se sente agora?"
                : "O que aconteceu? Como voce pode se cuidar agora?"
            }
            rows={3}
          />
        </div>
      )}

      {/* Submit */}
      {outcome !== null && (
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full animate-fade-in"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </Button>
      )}
    </div>
  );
}

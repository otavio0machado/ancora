"use client";

import { useState, useCallback, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { OverloadRisk } from "@/lib/utils/patterns";

// --------------- Types ---------------

interface LocalPriority {
  id: string;
  text: string;
  completed: boolean;
  order_index: number;
}

interface DayPrioritiesProps {
  overloadRisk?: OverloadRisk;
  /** Current anxiety level from check-in (1-5) */
  anxietyLevel?: number;
}

// --------------- Component ---------------

export function DayPriorities({ overloadRisk, anxietyLevel = 3 }: DayPrioritiesProps) {
  const [priorities, setPriorities] = useState<LocalPriority[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [anxietyWarningDismissed, setAnxietyWarningDismissed] = useState(false);
  const [showThirdWarning, setShowThirdWarning] = useState(false);

  // Calculate effective max priorities based on overload risk
  const maxPriorities = useMemo(() => {
    if (!overloadRisk) return 3;
    if (overloadRisk.risk === "critical") return 0;
    return overloadRisk.suggestedMaxTasks;
  }, [overloadRisk]);

  // Whether we should show anxiety-based warnings
  const isHighAnxiety = anxietyLevel >= 4;

  const addPriority = useCallback(() => {
    const text = inputValue.trim();
    if (!text || priorities.length >= maxPriorities) return;

    // If high anxiety and trying to add 3rd priority, show warning first
    if (isHighAnxiety && priorities.length === 2 && !anxietyWarningDismissed) {
      setShowThirdWarning(true);
      return;
    }

    setPriorities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        order_index: prev.length,
      },
    ]);
    setInputValue("");
    setShowThirdWarning(false);
  }, [inputValue, priorities.length, maxPriorities, isHighAnxiety, anxietyWarningDismissed]);

  const confirmThirdPriority = useCallback(() => {
    const text = inputValue.trim();
    if (!text) return;

    setPriorities((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text,
        completed: false,
        order_index: prev.length,
      },
    ]);
    setInputValue("");
    setShowThirdWarning(false);
    setAnxietyWarningDismissed(true);
  }, [inputValue]);

  const togglePriority = useCallback((id: string) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  }, []);

  const removePriority = useCallback((id: string) => {
    setPriorities((prev) =>
      prev
        .filter((p) => p.id !== id)
        .map((p, i) => ({ ...p, order_index: i }))
    );
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPriority();
    }
  };

  const completedCount = priorities.filter((p) => p.completed).length;

  // Determine the description based on overload risk
  const getDescription = () => {
    if (overloadRisk?.risk === "critical") {
      return "Sem prioridades hoje. Cuide do basico.";
    }
    if (overloadRisk?.risk === "high") {
      return "Apenas 1 coisa. O que mais importa agora?";
    }
    if (overloadRisk?.risk === "medium") {
      return "Ate 2 coisas. Mantenha simples.";
    }
    return "Ate 3 coisas. O que realmente importa hoje?";
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Prioridades do dia</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Overload reduction notice */}
        {overloadRisk && overloadRisk.risk !== "low" && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl px-4 py-3",
              "border animate-fade-in",
              overloadRisk.risk === "critical"
                ? "bg-alert/5 border-alert/15"
                : overloadRisk.risk === "high"
                  ? "bg-warning-subtle border-warning/20"
                  : "bg-surface-sunken border-border-subtle"
            )}
          >
            <AlertTriangle
              size={14}
              className={cn(
                "flex-shrink-0 mt-0.5",
                overloadRisk.risk === "critical" ? "text-alert" : "text-warning"
              )}
              strokeWidth={1.5}
            />
            <p className="text-xs text-text-secondary leading-relaxed">
              {overloadRisk.risk === "critical"
                ? "Prioridades desativadas. Cuide de voce primeiro."
                : overloadRisk.risk === "high"
                  ? "Limite reduzido para 1 prioridade. Menos e mais em dias assim."
                  : "Limite reduzido para 2 prioridades. Gentileza com voce."}
            </p>
          </div>
        )}

        {/* Priority list */}
        {priorities.length > 0 && (
          <ul className="flex flex-col gap-2">
            {priorities.map((priority) => (
              <li
                key={priority.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5",
                  "border border-border-subtle bg-surface",
                  "transition-all duration-200",
                  "animate-fade-in",
                  priority.completed && "bg-surface-sunken"
                )}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => togglePriority(priority.id)}
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200",
                    "flex items-center justify-center",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    priority.completed
                      ? "border-accent bg-accent"
                      : "border-border hover:border-text-muted"
                  )}
                  aria-label={
                    priority.completed
                      ? `Desmarcar: ${priority.text}`
                      : `Marcar como feito: ${priority.text}`
                  }
                >
                  {priority.completed && (
                    <svg
                      className="w-3 h-3 text-accent-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span
                  className={cn(
                    "flex-1 text-sm transition-all duration-200",
                    priority.completed
                      ? "text-text-muted"
                      : "text-text-primary"
                  )}
                >
                  {priority.text}
                </span>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removePriority(priority.id)}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-md",
                    "flex items-center justify-center",
                    "text-text-muted hover:text-alert hover:bg-alert-subtle",
                    "transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label={`Remover: ${priority.text}`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Subtle progress indicator */}
        {priorities.length > 0 && (
          <p className="text-xs text-text-muted">
            {completedCount} de {priorities.length} feita
            {completedCount !== 1 ? "s" : ""}
          </p>
        )}

        {/* High anxiety + 3 priorities gentle message */}
        {isHighAnxiety && priorities.length >= 3 && (
          <div
            className={cn(
              "rounded-xl px-4 py-3",
              "bg-accent-subtle/50 border border-accent/10",
              "animate-fade-in"
            )}
          >
            <p className="text-xs text-accent leading-relaxed">
              Considere focar em apenas uma. Menos e mais em dias assim.
            </p>
          </div>
        )}

        {/* Third priority warning for high anxiety */}
        {showThirdWarning && (
          <div
            className={cn(
              "rounded-xl px-4 py-3",
              "bg-warning-subtle border border-warning/20",
              "animate-fade-in"
            )}
          >
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Sua ansiedade esta alta. Tem certeza que precisa de uma terceira prioridade?
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={confirmThirdPriority}
                className="text-xs"
              >
                Sim, adicionar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowThirdWarning(false);
                  setInputValue("");
                }}
                className="text-xs"
              >
                Nao, vou simplificar
              </Button>
            </div>
          </div>
        )}

        {/* Input to add new priority */}
        {priorities.length < maxPriorities && maxPriorities > 0 && !showThirdWarning && (
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                priorities.length === 0
                  ? "Qual e a prioridade mais importante?"
                  : "Adicionar prioridade..."
              }
              maxLength={300}
            />
            <Button
              variant="outline"
              size="md"
              onClick={addPriority}
              disabled={!inputValue.trim()}
              aria-label="Adicionar prioridade"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </Button>
          </div>
        )}

        {priorities.length >= maxPriorities && maxPriorities > 0 && (
          <p className="text-xs text-text-muted text-center">
            {maxPriorities < 3
              ? `Limite reduzido para ${maxPriorities}. Cuide de voce.`
              : "Maximo de 3 prioridades. Menos e mais."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

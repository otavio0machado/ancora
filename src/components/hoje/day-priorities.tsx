"use client";

import { useState, useCallback } from "react";
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

// --------------- Types ---------------

interface LocalPriority {
  id: string;
  text: string;
  completed: boolean;
  order_index: number;
}

// --------------- Component ---------------

export function DayPriorities() {
  const [priorities, setPriorities] = useState<LocalPriority[]>([]);
  const [inputValue, setInputValue] = useState("");

  const addPriority = useCallback(() => {
    const text = inputValue.trim();
    if (!text || priorities.length >= 3) return;

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
  }, [inputValue, priorities.length]);

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

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Prioridades do dia</CardTitle>
        <CardDescription>
          Ate 3 coisas. O que realmente importa hoje?
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
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

        {/* Input to add new priority */}
        {priorities.length < 3 && (
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

        {priorities.length >= 3 && (
          <p className="text-xs text-text-muted text-center">
            Maximo de 3 prioridades. Menos e mais.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

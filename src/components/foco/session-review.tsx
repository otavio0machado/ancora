"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface SessionReviewProps {
  objective: string;
  durationMinutes: number;
  onSave: (review: {
    focus: number;
    progress: string;
    notes: string;
  }) => void;
}

const FOCUS_LABELS = [
  "Muito disperso",
  "Disperso",
  "Razoavel",
  "Focado",
  "Muito focado",
];

export function SessionReview({
  objective,
  durationMinutes,
  onSave,
}: SessionReviewProps) {
  const [focusRating, setFocusRating] = useState(3);
  const [progress, setProgress] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      focus: focusRating,
      progress: progress.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Como foi a sessao?</CardTitle>
        <CardDescription>
          {objective} &middot; {durationMinutes} min
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Focus rating */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary">
              Como foi seu foco?
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFocusRating(value)}
                  className={cn(
                    "flex-1 h-10 rounded-lg border text-sm font-medium",
                    "transition-all duration-200 cursor-pointer",
                    focusRating === value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border bg-transparent text-text-muted hover:bg-surface-sunken hover:text-text-secondary"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted text-center">
              {FOCUS_LABELS[focusRating - 1]}
            </p>
          </div>

          {/* Progress notes */}
          <div className="space-y-2">
            <label
              htmlFor="session-progress"
              className="text-sm font-medium text-text-primary"
            >
              O que voce avancou?
            </label>
            <textarea
              id="session-progress"
              placeholder="Descreva brevemente o que conseguiu fazer..."
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              rows={2}
              className={cn(
                "flex w-full rounded-xl border border-border bg-surface px-3 py-2",
                "text-sm text-text-primary resize-none",
                "placeholder:text-text-muted",
                "transition-colors duration-200",
                "hover:border-text-muted",
                "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              )}
            />
          </div>

          {/* Additional notes */}
          <div className="space-y-2">
            <label
              htmlFor="session-notes"
              className="text-sm font-medium text-text-primary"
            >
              Observacoes{" "}
              <span className="text-text-muted font-normal">(opcional)</span>
            </label>
            <textarea
              id="session-notes"
              placeholder="Algo que queira registrar sobre a sessao..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={cn(
                "flex w-full rounded-xl border border-border bg-surface px-3 py-2",
                "text-sm text-text-primary resize-none",
                "placeholder:text-text-muted",
                "transition-colors duration-200",
                "hover:border-text-muted",
                "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              )}
            />
          </div>

          {/* Save */}
          <Button type="submit" size="lg" className="w-full">
            Salvar reflexao
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

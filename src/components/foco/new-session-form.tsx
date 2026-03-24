"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const DURATION_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 25, label: "25 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
];

interface NewSessionFormProps {
  onStart: (objective: string, durationMinutes: number) => void;
}

export function NewSessionForm({ onStart }: NewSessionFormProps) {
  const [objective, setObjective] = useState("");
  const [duration, setDuration] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objective.trim()) return;
    onStart(objective.trim(), duration);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova sessão de foco</CardTitle>
        <CardDescription>
          O que você quer trabalhar agora?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Objective */}
          <div className="space-y-2">
            <label
              htmlFor="focus-objective"
              className="text-sm font-medium text-text-primary"
            >
              Objetivo
            </label>
            <Input
              id="focus-objective"
              placeholder="Ex: Revisar capítulo 3 de estatística"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              autoFocus
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Duração
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDuration(option.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5",
                    "text-sm font-medium transition-all duration-200",
                    "cursor-pointer",
                    duration === option.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border bg-transparent text-text-secondary hover:bg-surface-sunken"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <Button
            type="submit"
            size="lg"
            className="w-full gap-2"
            disabled={!objective.trim()}
          >
            <Play className="w-4 h-4" />
            Iniciar sessão
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SpeciesPicker } from "@/components/floresta/species-picker";
import { SPECIES_CATALOG } from "@/lib/floresta/constants";
import type { SpeciesId } from "@/types/forest";

const SABOTEUR_OPTIONS = [
  "perfeccionismo",
  "tudo-ou-nada",
  "procrastinação",
  "comparação",
  "cansaço",
] as const;

const SABOTEUR_EXAMPLES: Record<string, string> = {
  perfeccionismo: "Sentir que a versão mínima não conta",
  "tudo-ou-nada": "Se não fizer completo, não faz nada",
  "procrastinação": "Achar que ainda tem tempo e adiar",
  "comparação": "Ver o progresso dos outros e desanimar",
  "cansaço": "Usar o cansaço como desculpa para não começar",
};

const FREQUENCY_OPTIONS = [
  { value: "daily" as const, label: "Diário" },
  { value: "weekdays" as const, label: "Dias úteis" },
  { value: "custom" as const, label: "Personalizado" },
];

interface AddHabitDialogProps {
  identityId: string;
  identityName: string;
  onAdd: (habit: {
    name: string;
    ideal_version: string;
    minimum_version: string;
    common_saboteurs: string[];
    frequency: "daily" | "weekdays" | "custom";
    saboteur_description?: string;
    species_id?: string;
  }) => void;
}

export function AddHabitDialog({
  identityId,
  identityName,
  onAdd,
}: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [idealVersion, setIdealVersion] = useState("");
  const [minimumVersion, setMinimumVersion] = useState("");
  const [saboteurs, setSaboteurs] = useState<string[]>([]);
  const [saboteurDescription, setSaboteurDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekdays" | "custom">(
    "daily"
  );
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(null);

  const toggleSaboteur = (saboteur: string) => {
    setSaboteurs((prev) =>
      prev.includes(saboteur)
        ? prev.filter((s) => s !== saboteur)
        : [...prev, saboteur]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !idealVersion.trim() || !minimumVersion.trim()) return;

    onAdd({
      name: name.trim(),
      ideal_version: idealVersion.trim(),
      minimum_version: minimumVersion.trim(),
      common_saboteurs: saboteurs,
      frequency,
      saboteur_description: saboteurDescription.trim() || undefined,
      species_id: speciesId ?? SPECIES_CATALOG[Math.floor(Math.random() * SPECIES_CATALOG.length)].id,
    });

    setName("");
    setIdealVersion("");
    setMinimumVersion("");
    setSaboteurs([]);
    setSaboteurDescription("");
    setFrequency("daily");
    setSpeciesId(null);
    setOpen(false);
  };

  const isValid = name.trim() && idealVersion.trim() && minimumVersion.trim();

  // Build a suggestion based on selected saboteurs
  const saboteurSuggestion =
    saboteurs.length > 0 ? SABOTEUR_EXAMPLES[saboteurs[0]] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" />
          Adicionar hábito
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo hábito</DialogTitle>
          <DialogDescription>
            Adicionar hábito a &quot;{identityName}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <label
              htmlFor={`habit-name-${identityId}`}
              className="text-sm font-medium text-text-primary"
            >
              Nome do hábito
            </label>
            <Input
              id={`habit-name-${identityId}`}
              placeholder='Ex: "Estudar"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Ideal version */}
          <div className="space-y-2">
            <label
              htmlFor={`habit-ideal-${identityId}`}
              className="text-sm font-medium text-text-primary"
            >
              Versão ideal
            </label>
            <p className="text-xs text-text-muted">
              Como é esse hábito no seu melhor dia?
            </p>
            <Input
              id={`habit-ideal-${identityId}`}
              placeholder='Ex: "2h de estudo focado"'
              value={idealVersion}
              onChange={(e) => setIdealVersion(e.target.value)}
            />
          </div>

          {/* Minimum version */}
          <div className="space-y-2">
            <label
              htmlFor={`habit-min-${identityId}`}
              className="text-sm font-medium text-text-primary"
            >
              Versão mínima
            </label>
            <p className="text-xs text-text-muted">
              O mínimo absoluto - para os dias difíceis.
            </p>
            <Input
              id={`habit-min-${identityId}`}
              placeholder='Ex: "Abrir o livro por 10 min"'
              value={minimumVersion}
              onChange={(e) => setMinimumVersion(e.target.value)}
            />
          </div>

          {/* Saboteurs */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Sabotadores comuns
            </label>
            <p className="text-xs text-text-muted">
              O que costuma te impedir de fazer esse hábito?
            </p>
            <div className="flex flex-wrap gap-2">
              {SABOTEUR_OPTIONS.map((saboteur) => {
                const isSelected = saboteurs.includes(saboteur);
                return (
                  <button
                    key={saboteur}
                    type="button"
                    onClick={() => toggleSaboteur(saboteur)}
                    className={cn(
                      "inline-flex items-center rounded-full border px-3 py-1.5",
                      "text-xs font-medium transition-all duration-200",
                      "cursor-pointer",
                      isSelected
                        ? "border-warning bg-warning-subtle text-warning"
                        : "border-border bg-transparent text-text-secondary hover:bg-surface-sunken"
                    )}
                  >
                    {saboteur}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Saboteur description */}
          {saboteurs.length > 0 && (
            <div className="space-y-2">
              <label
                htmlFor={`habit-saboteur-desc-${identityId}`}
                className="text-sm font-medium text-text-primary"
              >
                O que o sabotador parece?
              </label>
              <p className="text-xs text-text-muted">
                {saboteurSuggestion
                  ? `Para "${saboteurs[0]}": ${saboteurSuggestion}`
                  : "Descreva brevemente como a sabotagem aparece nesse hábito."}
              </p>
              <Textarea
                id={`habit-saboteur-desc-${identityId}`}
                placeholder="Descreva como a sabotagem se manifesta..."
                value={saboteurDescription}
                onChange={(e) => setSaboteurDescription(e.target.value)}
                rows={2}
              />
            </div>
          )}

          {/* Species picker for forest */}
          <SpeciesPicker
            selectedId={speciesId}
            onSelect={setSpeciesId}
          />

          {/* Frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Frequência
            </label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value)}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2",
                    "text-xs font-medium transition-all duration-200",
                    "cursor-pointer",
                    frequency === option.value
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-border bg-transparent text-text-secondary hover:bg-surface-sunken"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid}>
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

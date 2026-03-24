"use client";

import { Sprout, Calendar, TrendingUp, X, Leaf, TreePine, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { getSpecies } from "@/lib/floresta/constants";
import { calculateGrowthStage } from "@/lib/utils/forest-engine";
import { GROWTH_THRESHOLDS } from "@/types/forest";
import type { SpeciesId, GrowthStage, PlantCategory } from "@/types/forest";

const STAGE_LABELS: Record<GrowthStage, string> = {
  0: "Semente",
  1: "Broto",
  2: "Jovem",
  3: "Adulta",
  4: "Florescente",
};

const STAGE_DESCRIPTIONS: Record<GrowthStage, string> = {
  0: "Acabou de ser plantada. Cada conclusao a fara crescer.",
  1: "Firme no solo. Ja mostra sinais de vida.",
  2: "Crescendo com forca. O cuidado esta dando resultado.",
  3: "Exemplar adulto. Prova viva da sua constancia.",
  4: "Variacao rara e florescente. Um marco de dedicacao.",
};

const CATEGORY_INFO: Record<PlantCategory, { icon: typeof TreePine; label: string }> = {
  tree: { icon: TreePine, label: "Arvore" },
  shrub: { icon: Leaf, label: "Arbusto" },
  flower: { icon: Flower2, label: "Flor" },
};

export function PlantInspector() {
  const { selectedPlantId, plants, selectPlant } = useForestStore();

  if (!selectedPlantId) return null;

  const plant = plants.find((p) => p.id === selectedPlantId);
  if (!plant) return null;

  const species = getSpecies(plant.species_id as SpeciesId);
  const stage = calculateGrowthStage(plant.total_completions) as GrowthStage;
  const category: PlantCategory = species?.category ?? "tree";
  const categoryInfo = CATEGORY_INFO[category];
  const CategoryIcon = categoryInfo.icon;

  const plantedDate = new Date(plant.planted_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Next growth stage info
  const nextThreshold = GROWTH_THRESHOLDS.find((t) => t.minCompletions > plant.total_completions);
  const nextStageLabel = nextThreshold ? STAGE_LABELS[nextThreshold.stage] : null;
  const completionsToNext = nextThreshold ? nextThreshold.minCompletions - plant.total_completions : 0;

  return (
    <div
      className={cn(
        "absolute bottom-3 left-3 right-3 z-20",
        "bg-background/90 backdrop-blur-md",
        "rounded-2xl border border-border-subtle",
        "p-4 animate-slide-up shadow-lg",
        "pointer-events-auto max-w-sm mx-auto"
      )}
    >
      <button
        onClick={() => selectPlant(null)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-primary ancora-transition"
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <Sprout size={20} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary">
            {species?.name ?? plant.species_id}
          </h3>
          <p className="text-[10px] text-accent font-medium">
            {species?.symbolism}
          </p>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-sunken shrink-0">
          <CategoryIcon size={10} className="text-text-muted" />
          <span className="text-[10px] text-text-muted">{categoryInfo.label}</span>
        </div>
      </div>

      {/* Habit name */}
      <div className="bg-surface-sunken rounded-lg px-3 py-2 mb-3">
        <span className="text-[10px] text-text-muted">Habito vinculado</span>
        <p className="text-sm font-medium text-text-primary">{plant.habit_name || plant.habit_id}</p>
      </div>

      {/* Growth stage */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={12} className="text-accent shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-primary">
              {STAGE_LABELS[stage]}
            </span>
            <span className="text-[10px] text-text-muted">
              {plant.total_completions} conclusoes
            </span>
          </div>
          <p className="text-[10px] text-text-muted">
            {STAGE_DESCRIPTIONS[stage]}
          </p>
        </div>
      </div>

      {/* Progress to next stage */}
      {nextStageLabel && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-text-muted mb-0.5">
            <span>Proximo: {nextStageLabel}</span>
            <span>faltam {completionsToNext}</span>
          </div>
          <div className="h-1.5 bg-surface-sunken rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{
                width: `${nextThreshold ? ((plant.total_completions - (GROWTH_THRESHOLDS.find((t) => t.stage === stage)?.minCompletions ?? 0)) / (nextThreshold.minCompletions - (GROWTH_THRESHOLDS.find((t) => t.stage === stage)?.minCompletions ?? 0))) * 100 : 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Planted date */}
      <div className="flex items-center gap-2">
        <Calendar size={12} className="text-text-muted shrink-0" />
        <span className="text-[10px] text-text-muted">
          Plantada em {plantedDate}
        </span>
      </div>
    </div>
  );
}

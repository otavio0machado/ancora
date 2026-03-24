"use client";

import { Sprout, Calendar, TrendingUp, X, Leaf, TreePine, Flower2, Droplets } from "lucide-react";
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

const CATEGORY_INFO: Record<PlantCategory, { icon: typeof TreePine; label: string; emoji: string }> = {
  tree: { icon: TreePine, label: "Arvore", emoji: "🌳" },
  shrub: { icon: Leaf, label: "Arbusto", emoji: "🌿" },
  flower: { icon: Flower2, label: "Flor", emoji: "🌸" },
};

const STAGE_VISUAL: Record<GrowthStage, string> = {
  0: "🌱",
  1: "🌿",
  2: "🪴",
  3: "🌳",
  4: "✨🌳✨",
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

  const plantedDate = new Date(plant.planted_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Next growth stage
  const nextThreshold = GROWTH_THRESHOLDS.find((t) => t.minCompletions > plant.total_completions);
  const currentThreshold = GROWTH_THRESHOLDS.find((t) => t.stage === stage);
  const nextStageLabel = nextThreshold ? STAGE_LABELS[nextThreshold.stage] : null;
  const completionsToNext = nextThreshold ? nextThreshold.minCompletions - plant.total_completions : 0;
  const stageProgress = nextThreshold && currentThreshold
    ? (plant.total_completions - currentThreshold.minCompletions) / (nextThreshold.minCompletions - currentThreshold.minCompletions)
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => selectPlant(null)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className={cn(
          "relative w-full max-w-lg",
          "bg-background rounded-t-3xl",
          "border-t border-border-subtle",
          "animate-slide-up",
          "max-h-[80vh] overflow-y-auto"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => selectPlant(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-text-muted hover:text-text-primary ancora-transition z-10"
        >
          <X size={16} />
        </button>

        {/* Big plant visual */}
        <div className="flex flex-col items-center pt-8 pb-4 bg-gradient-to-b from-accent/5 to-transparent">
          <div className="text-6xl mb-3">
            {STAGE_VISUAL[stage]}
          </div>
          <h2 className="text-xl font-bold text-text-primary">
            {species?.name ?? plant.species_id}
          </h2>
          <p className="text-sm text-accent font-medium mt-0.5">
            {species?.symbolism}
          </p>
          <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-surface-sunken">
            <categoryInfo.icon size={12} className="text-text-muted" />
            <span className="text-xs text-text-muted">{categoryInfo.label}</span>
          </div>
        </div>

        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {/* Habit link */}
          <div className="bg-surface-sunken rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <Droplets size={14} className="text-accent shrink-0" />
              <div>
                <span className="text-[10px] text-text-muted block">Habito vinculado</span>
                <span className="text-sm font-semibold text-text-primary">
                  {plant.habit_name || plant.habit_id}
                </span>
              </div>
            </div>
          </div>

          {/* Growth stage card */}
          <div className="bg-surface-sunken rounded-xl px-4 py-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-accent" />
                <span className="text-sm font-semibold text-text-primary">
                  {STAGE_LABELS[stage]}
                </span>
              </div>
              <span className="text-xs text-text-muted font-medium">
                {plant.total_completions} conclusoes
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              {STAGE_DESCRIPTIONS[stage]}
            </p>

            {/* Progress to next stage */}
            {nextStageLabel ? (
              <div>
                <div className="flex justify-between text-[10px] text-text-muted mb-1">
                  <span>Proximo: {nextStageLabel}</span>
                  <span>faltam {completionsToNext}</span>
                </div>
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(stageProgress * 100, 2)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-accent font-medium">
                Estagio maximo alcancado!
              </div>
            )}
          </div>

          {/* Description */}
          {species?.description && (
            <div className="bg-surface-sunken rounded-xl px-4 py-3 mb-4">
              <p className="text-xs text-text-secondary leading-relaxed italic">
                &ldquo;{species.description}&rdquo;
              </p>
            </div>
          )}

          {/* Planted date */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Calendar size={12} />
            <span>Plantada em {plantedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

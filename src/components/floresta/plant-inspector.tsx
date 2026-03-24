"use client";

import { Sprout, Calendar, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { getSpecies } from "@/lib/floresta/constants";
import { calculateGrowthStage } from "@/lib/utils/forest-engine";
import type { SpeciesId, GrowthStage } from "@/types/forest";

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

interface PlantInspectorProps {
  habitName: string;
}

export function PlantInspector({ habitName }: PlantInspectorProps) {
  const { selectedPlantId, plants, selectPlant } = useForestStore();

  if (!selectedPlantId) return null;

  const plant = plants.find((p) => p.id === selectedPlantId);
  if (!plant) return null;

  const species = getSpecies(plant.species_id as SpeciesId);
  const stage = calculateGrowthStage(plant.total_completions) as GrowthStage;
  const plantedDate = new Date(plant.planted_at).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "absolute bottom-16 left-3 right-3 z-10",
        "bg-background/90 backdrop-blur-md",
        "rounded-xl border border-border-subtle",
        "p-4 animate-slide-up",
        "pointer-events-auto"
      )}
    >
      <button
        onClick={() => selectPlant(null)}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Sprout size={20} className="text-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary">
            {species?.name ?? plant.species_id}
          </h3>
          <p className="text-xs text-accent font-medium">
            {species?.symbolism}
          </p>
          <p className="text-[10px] text-text-muted mt-0.5">
            Habito: {habitName}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {/* Growth stage */}
        <div className="flex items-center gap-2">
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
            <p className="text-[10px] text-text-muted mt-0.5">
              {STAGE_DESCRIPTIONS[stage]}
            </p>
          </div>
        </div>

        {/* Growth progress bar */}
        <div className="h-1.5 bg-surface-sunken rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((plant.total_completions / 50) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Planted date */}
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-text-muted shrink-0" />
          <span className="text-[10px] text-text-muted">
            Plantada em {plantedDate}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Sprout, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { MILESTONES, getSpecies } from "@/lib/floresta/constants";
import { calculateGrowthStage } from "@/lib/utils/forest-engine";
import type { SpeciesId, GrowthStage } from "@/types/forest";

const STAGE_LABELS: Record<GrowthStage, string> = {
  0: "Semente",
  1: "Broto",
  2: "Jovem",
  3: "Adulta",
  4: "Florescente",
};

interface ForestStatsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ForestStatsPanel({ open, onClose }: ForestStatsPanelProps) {
  const { forestState, plants } = useForestStore();

  if (!open || !forestState) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "relative w-full max-w-lg",
          "bg-background rounded-t-2xl",
          "border-t border-border-subtle",
          "p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]",
          "animate-slide-up",
          "max-h-[70vh] overflow-y-auto"
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sprout size={16} className="text-accent" />
          <h2 className="text-base font-semibold text-text-primary">
            Meu Jardim
          </h2>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-sunken rounded-lg p-3">
            <span className="text-xs text-text-muted">Plantas</span>
            <div className="text-lg font-semibold text-text-primary">{plants.length}</div>
          </div>
          <div className="bg-surface-sunken rounded-lg p-3">
            <span className="text-xs text-text-muted">Crescimento total</span>
            <div className="text-lg font-semibold text-text-primary">{forestState.total_growth_xp} xp</div>
          </div>
        </div>

        {/* Plants list (herbário) */}
        {plants.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-medium text-text-muted mb-2">
              Herbario pessoal
            </h3>
            <div className="space-y-2">
              {plants.map((plant) => {
                const species = getSpecies(plant.species_id as SpeciesId);
                const stage = calculateGrowthStage(plant.total_completions) as GrowthStage;
                return (
                  <div
                    key={plant.id}
                    className="flex items-center justify-between bg-surface-sunken rounded-lg p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp size={12} className="text-accent" />
                      <div>
                        <span className="text-sm font-medium text-text-primary">
                          {species?.name ?? plant.species_id}
                        </span>
                        <span className="text-[10px] text-text-muted ml-1.5">
                          {species?.category === "flower" ? "Flor" : species?.category === "shrub" ? "Arbusto" : "Arvore"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-text-primary">
                        {STAGE_LABELS[stage]}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {plant.total_completions} conclusoes
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Milestones */}
        <div>
          <h3 className="text-xs font-medium text-text-muted mb-2">Marcos</h3>
          <div className="space-y-2">
            {MILESTONES.map((milestone) => {
              const unlocked = forestState.unlocked_milestones.includes(milestone.id);
              return (
                <div
                  key={milestone.id}
                  className={cn(
                    "flex items-center gap-2 text-sm",
                    unlocked ? "text-text-primary" : "text-text-muted"
                  )}
                >
                  <Award size={14} className={unlocked ? "text-accent" : "text-text-muted"} />
                  <span className={unlocked ? "font-medium" : ""}>{milestone.name}</span>
                  <span className="text-xs ml-auto">{milestone.requiredTotalGrowth} xp</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

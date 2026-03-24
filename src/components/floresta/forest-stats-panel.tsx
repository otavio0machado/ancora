"use client";

import { TreePine, Sprout, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { MILESTONES, SPECIES_NAMES } from "@/lib/floresta/constants";
import type { TreeSpecies } from "@/types/forest";

interface ForestStatsPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ForestStatsPanel({ open, onClose }: ForestStatsPanelProps) {
  const { forestState, trees } = useForestStore();

  if (!open || !forestState) return null;

  // Calculate stats
  const speciesCount: Record<string, number> = {};
  for (const tree of trees) {
    speciesCount[tree.species] = (speciesCount[tree.species] || 0) + 1;
  }

  const idealCount = trees.filter((t) => t.version === "ideal").length;
  const minimumCount = trees.filter((t) => t.version === "minimum").length;

  const sortedSpecies = Object.entries(speciesCount)
    .sort(([, a], [, b]) => b - a);

  const groundPercent = Math.min((forestState.ground_level / 4) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
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
          <TreePine size={16} className="text-accent" />
          <h2 className="text-base font-semibold text-text-primary">
            Estatisticas da Floresta
          </h2>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-surface-sunken rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TreePine size={12} className="text-accent" />
              <span className="text-xs text-text-muted">Total</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {forestState.total_trees}
            </span>
          </div>
          <div className="bg-surface-sunken rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Sprout size={12} className="text-accent" />
              <span className="text-xs text-text-muted">Recuperacao</span>
            </div>
            <span className="text-lg font-semibold text-text-primary">
              {groundPercent.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Version split */}
        <div className="bg-surface-sunken rounded-lg p-3 mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Calendar size={12} className="text-accent" />
            <span className="text-xs text-text-muted">Versoes completadas</span>
          </div>
          <div className="flex gap-4">
            <div>
              <span className="text-sm font-semibold text-text-primary">{idealCount}</span>
              <span className="text-xs text-text-muted ml-1">ideal</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-text-primary">{minimumCount}</span>
              <span className="text-xs text-text-muted ml-1">minimo</span>
            </div>
          </div>
        </div>

        {/* Species breakdown */}
        {sortedSpecies.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs font-medium text-text-muted mb-2">
              Especies plantadas
            </h3>
            <div className="space-y-1.5">
              {sortedSpecies.map(([species, count]) => (
                <div key={species} className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    {SPECIES_NAMES[species as TreeSpecies] ?? species}
                  </span>
                  <span className="text-text-muted">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        <div>
          <h3 className="text-xs font-medium text-text-muted mb-2">
            Marcos
          </h3>
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
                  <Award
                    size={14}
                    className={unlocked ? "text-accent" : "text-text-muted"}
                  />
                  <span className={unlocked ? "font-medium" : ""}>
                    {milestone.name}
                  </span>
                  <span className="text-xs ml-auto">
                    {milestone.requiredTrees} arvores
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

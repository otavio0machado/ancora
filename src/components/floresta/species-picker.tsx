"use client";

import { useState } from "react";
import { Leaf, TreePine, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SPECIES_CATALOG, getSpeciesByCategory } from "@/lib/floresta/constants";
import type { PlantCategory, SpeciesId } from "@/types/forest";

interface SpeciesPickerProps {
  selectedId: SpeciesId | null;
  onSelect: (id: SpeciesId) => void;
}

const CATEGORY_TABS: { id: PlantCategory; label: string; icon: typeof TreePine }[] = [
  { id: "tree", label: "Arvores", icon: TreePine },
  { id: "shrub", label: "Arbustos", icon: Leaf },
  { id: "flower", label: "Flores", icon: Flower2 },
];

export function SpeciesPicker({ selectedId, onSelect }: SpeciesPickerProps) {
  const [activeCategory, setActiveCategory] = useState<PlantCategory>("tree");

  const species = getSpeciesByCategory(activeCategory);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary">
        Escolha a planta desse habito
      </label>
      <p className="text-xs text-text-muted">
        A planta representa esse compromisso e cresce com cada conclusao.
      </p>

      {/* Category tabs */}
      <div className="flex gap-1.5">
        {CATEGORY_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveCategory(id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg",
              "text-xs font-medium transition-all duration-200",
              activeCategory === id
                ? "bg-accent-subtle text-accent border border-accent"
                : "bg-transparent text-text-secondary border border-border hover:bg-surface-sunken"
            )}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Species grid */}
      <div className="grid grid-cols-2 gap-2">
        {species.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all duration-200",
                "cursor-pointer",
                isSelected
                  ? "border-accent bg-accent-subtle ring-1 ring-accent"
                  : "border-border bg-transparent hover:bg-surface-sunken"
              )}
            >
              <div className="text-sm font-medium text-text-primary mb-0.5">
                {s.name}
              </div>
              <div className="text-[10px] text-accent font-medium mb-1">
                {s.symbolism}
              </div>
              <div className="text-[10px] text-text-muted leading-relaxed">
                {s.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

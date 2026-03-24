// ============================================================
// Forest constants and configuration
// ============================================================

import type { Milestone, MilestoneId, GroundLevel, TreeSpecies } from "@/types/forest";

// --------------- Grid ---------------

export const GRID_WIDTH = 10;
export const GRID_HEIGHT = 10;
export const TILE_WIDTH = 64; // isometric diamond width
export const TILE_HEIGHT = 32; // isometric diamond height

// --------------- Ground level thresholds ---------------

export const GROUND_LEVEL_THRESHOLDS: { min: number; level: GroundLevel }[] = [
  { min: 31, level: 4 }, // lush grass with flowers
  { min: 16, level: 3 }, // green grass
  { min: 6, level: 2 },  // sparse grass
  { min: 1, level: 1 },  // dry earth
  { min: 0, level: 0 },  // burned soil
];

// --------------- Tree growth stages (days since planting) ---------------

export const GROWTH_STAGE_THRESHOLDS = [
  { minDays: 10, stage: 3 as const }, // large tree
  { minDays: 5, stage: 2 as const },  // medium tree
  { minDays: 2, stage: 1 as const },  // small tree
  { minDays: 0, stage: 0 as const },  // sapling
];

// --------------- Species pools ---------------

export const IDEAL_SPECIES: TreeSpecies[] = ["oak", "pine", "birch", "cherry"];
export const MINIMUM_SPECIES: TreeSpecies[] = ["birch", "pine"];
export const STREAK_7_BONUS_SPECIES: TreeSpecies = "cherry";
export const STREAK_30_BONUS_SPECIES: TreeSpecies = "golden";

// --------------- Milestones ---------------

export const MILESTONES: Milestone[] = [
  { id: "rocks_stumps", name: "Primeiros sinais", description: "Pedras e troncos aparecem no terreno", requiredTrees: 5 },
  { id: "pond", name: "Nascente", description: "Um pequeno lago surge na floresta", requiredTrees: 10 },
  { id: "animals", name: "Vida selvagem", description: "Passaros e coelhos aparecem", requiredTrees: 20 },
  { id: "cabin", name: "Refúgio", description: "Uma cabana acolhedora surge entre as arvores", requiredTrees: 30 },
  { id: "rainbow", name: "Arco-iris", description: "Um arco-iris aparece apos a chuva", requiredTrees: 50 },
  { id: "fireflies", name: "Vagalumes", description: "Vagalumes iluminam a noite na floresta", requiredTrees: 75 },
  { id: "restored", name: "Floresta restaurada", description: "A floresta esta completamente restaurada!", requiredTrees: 100 },
];

// --------------- Species display data ---------------

export const SPECIES_NAMES: Record<TreeSpecies, string> = {
  oak: "Carvalho",
  pine: "Pinheiro",
  birch: "Vidoeiro",
  cherry: "Cerejeira",
  golden: "Arvore Dourada",
};

// --------------- Isometric rendering ---------------

export const ISO_OFFSET_X = 320; // center offset for canvas
export const ISO_OFFSET_Y = 40;  // top padding

export function gridToScreen(gridX: number, gridY: number): { screenX: number; screenY: number } {
  return {
    screenX: (gridX - gridY) * (TILE_WIDTH / 2) + ISO_OFFSET_X,
    screenY: (gridX + gridY) * (TILE_HEIGHT / 2) + ISO_OFFSET_Y,
  };
}

export function getMilestoneById(id: MilestoneId): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

// ============================================================
// Sprite definitions for isometric forest rendering
// Procedural pixel art generation (no external assets needed)
// ============================================================

import type { GroundLevel, TreeSpecies, GrowthStage, ForestWeather } from "@/types/forest";

// --------------- Color palettes ---------------

export const GROUND_COLORS: Record<GroundLevel, { fill: string; stroke: string; detail?: string }> = {
  0: { fill: "#3D3028", stroke: "#2A211B", detail: "#4A3A2F" },   // burned
  1: { fill: "#6B5B4E", stroke: "#54473C", detail: "#7D6D5F" },   // dry earth
  2: { fill: "#6B8C42", stroke: "#5A7A35", detail: "#8BAA5A" },   // sparse grass
  3: { fill: "#4CAF50", stroke: "#388E3C", detail: "#66BB6A" },   // grass
  4: { fill: "#2E7D32", stroke: "#1B5E20", detail: "#43A047" },   // lush
};

export const TREE_COLORS: Record<TreeSpecies, { trunk: string; foliage: string; highlight: string }> = {
  oak:    { trunk: "#5D4037", foliage: "#2E7D32", highlight: "#43A047" },
  pine:   { trunk: "#4E342E", foliage: "#1B5E20", highlight: "#2E7D32" },
  birch:  { trunk: "#D7CCC8", foliage: "#66BB6A", highlight: "#81C784" },
  cherry: { trunk: "#5D4037", foliage: "#E91E63", highlight: "#F06292" },
  golden: { trunk: "#5D4037", foliage: "#FFD700", highlight: "#FFEB3B" },
};

// Tree sizes per growth stage (width, height in pixels)
export const TREE_SIZES: Record<GrowthStage, { w: number; h: number }> = {
  0: { w: 8, h: 12 },   // sapling
  1: { w: 16, h: 24 },  // small
  2: { w: 24, h: 36 },  // medium
  3: { w: 32, h: 48 },  // large
};

// --------------- Decoration data ---------------

export const DECORATION_COLORS = {
  rock: { fill: "#78909C", stroke: "#546E7A", highlight: "#90A4AE" },
  stump: { fill: "#5D4037", stroke: "#4E342E", highlight: "#6D4C41" },
  pond: { fill: "#4FC3F7", stroke: "#29B6F6", highlight: "#81D4FA" },
  cabin: { wall: "#8D6E63", roof: "#5D4037", door: "#3E2723", window: "#FFF9C4" },
};

// --------------- Weather particle configs ---------------

export const WEATHER_PARTICLES: Record<ForestWeather, { color: string; count: number; speed: number } | null> = {
  sunny: null,
  clear: null,
  overcast: null,
  rain: { color: "#90CAF9", count: 40, speed: 6 },
  storm: { color: "#64B5F6", count: 80, speed: 10 },
};

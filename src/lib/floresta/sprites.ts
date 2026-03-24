// ============================================================
// Sprite definitions for isometric forest rendering
// Procedural pixel art - supports trees, shrubs, flowers
// ============================================================

import type { GroundLevel, ForestWeather, PlantCategory, GrowthStage } from "@/types/forest";

// --------------- Ground colors ---------------

export const GROUND_COLORS: Record<GroundLevel, { fill: string; stroke: string; detail?: string }> = {
  0: { fill: "#3D3028", stroke: "#2A211B", detail: "#4A3A2F" },
  1: { fill: "#6B5B4E", stroke: "#54473C", detail: "#7D6D5F" },
  2: { fill: "#6B8C42", stroke: "#5A7A35", detail: "#8BAA5A" },
  3: { fill: "#4CAF50", stroke: "#388E3C", detail: "#66BB6A" },
  4: { fill: "#2E7D32", stroke: "#1B5E20", detail: "#43A047" },
};

// --------------- Plant color palettes by species ---------------

export const PLANT_PALETTES: Record<string, { trunk: string; foliage: string; highlight: string; bloom?: string }> = {
  // Trees
  ipe_amarelo:  { trunk: "#5D4037", foliage: "#2E7D32", highlight: "#43A047", bloom: "#FFD600" },
  araucaria:    { trunk: "#4E342E", foliage: "#1B5E20", highlight: "#2E7D32" },
  cerejeira:    { trunk: "#5D4037", foliage: "#C62828", highlight: "#E91E63", bloom: "#F48FB1" },
  jacaranda:    { trunk: "#5D4037", foliage: "#4A148C", highlight: "#7B1FA2", bloom: "#CE93D8" },
  carvalho:     { trunk: "#5D4037", foliage: "#2E7D32", highlight: "#43A047" },
  pinheiro:     { trunk: "#4E342E", foliage: "#1B5E20", highlight: "#2E7D32" },
  // Shrubs
  lavanda:      { trunk: "#6D4C41", foliage: "#4CAF50", highlight: "#66BB6A", bloom: "#9C27B0" },
  alecrim:      { trunk: "#6D4C41", foliage: "#558B2F", highlight: "#7CB342", bloom: "#81D4FA" },
  hortensia:    { trunk: "#5D4037", foliage: "#388E3C", highlight: "#4CAF50", bloom: "#E91E63" },
  bambu:        { trunk: "#8BC34A", foliage: "#4CAF50", highlight: "#66BB6A" },
  // Flowers
  girassol:     { trunk: "#558B2F", foliage: "#7CB342", highlight: "#8BC34A", bloom: "#FFD600" },
  lirio:        { trunk: "#558B2F", foliage: "#66BB6A", highlight: "#81C784", bloom: "#FFFFFF" },
  camelia:      { trunk: "#558B2F", foliage: "#4CAF50", highlight: "#66BB6A", bloom: "#F44336" },
  margarida:    { trunk: "#558B2F", foliage: "#7CB342", highlight: "#8BC34A", bloom: "#FFFFFF" },
};

// --------------- Plant sizes per category and growth stage ---------------

export const PLANT_SIZES: Record<PlantCategory, Record<GrowthStage, { w: number; h: number }>> = {
  tree: {
    0: { w: 6, h: 10 },
    1: { w: 14, h: 22 },
    2: { w: 22, h: 34 },
    3: { w: 30, h: 46 },
    4: { w: 34, h: 52 },
  },
  shrub: {
    0: { w: 6, h: 8 },
    1: { w: 12, h: 14 },
    2: { w: 18, h: 20 },
    3: { w: 24, h: 24 },
    4: { w: 28, h: 28 },
  },
  flower: {
    0: { w: 4, h: 6 },
    1: { w: 8, h: 12 },
    2: { w: 12, h: 16 },
    3: { w: 14, h: 20 },
    4: { w: 16, h: 24 },
  },
};

// --------------- Decoration colors ---------------

export const DECORATION_COLORS = {
  rock: { fill: "#78909C", stroke: "#546E7A", highlight: "#90A4AE" },
  path: { fill: "#A1887F", stroke: "#8D6E63" },
  pond: { fill: "#4FC3F7", stroke: "#29B6F6", highlight: "#81D4FA" },
  bench: { fill: "#8D6E63", seat: "#A1887F" },
  cabin: { wall: "#8D6E63", roof: "#5D4037", door: "#3E2723", window: "#FFF9C4" },
  lantern: { post: "#5D4037", light: "#FFE082" },
};

// --------------- Avatar palettes ---------------

export const AVATAR_SKIN_COLORS = [0xFDBB97, 0xD4956B, 0xA0674B, 0x6B3F2E, 0x3D2317, 0xF5D6BA];

export const AVATAR_HAIR_COLORS = [
  0x3E2723, // castanho escuro
  0x212121, // preto
  0xF9A825, // loiro
  0xD84315, // ruivo
  0x5D4037, // marrom
  0x9E9E9E, // grisalho
  0xE91E63, // rosa
  0x2196F3, // azul
];

export const AVATAR_OUTFIT_COLORS = [
  0x5C6BC0, // casual (indigo)
  0x43A047, // esportivo (verde)
  0x6D4C41, // florestal (marrom)
  0xFF7043, // aventureiro (laranja)
  0x1565C0, // estudante (azul)
  0xAB47BC, // artista (roxo)
  0x2E7D32, // jardineiro (verde escuro)
  0x795548, // explorador (marrom)
  0x78909C, // tranquilo (cinza)
  0xFFB74D, // cozy (amarelo)
];

export const AVATAR_ACCESSORY_COLORS: Record<number, { color: number; type: string }> = {
  0: { color: 0, type: "none" },
  1: { color: 0x90CAF9, type: "glasses" },    // oculos
  2: { color: 0x8D6E63, type: "hat" },        // chapeu
  3: { color: 0xE57373, type: "scarf" },       // cachecol
  4: { color: 0x795548, type: "backpack" },    // mochila
  5: { color: 0xFF7043, type: "bandana" },     // bandana
};

// --------------- Weather particles ---------------

export const WEATHER_PARTICLES: Record<ForestWeather, { color: string; count: number; speed: number } | null> = {
  sunny: null,
  clear: null,
  overcast: null,
  rain: { color: "#90CAF9", count: 40, speed: 6 },
  wind: { color: "#A5D6A7", count: 20, speed: 3 }, // leaves
  dawn: null,
  fireflies: { color: "#FFEB3B", count: 15, speed: 0.5 },
};

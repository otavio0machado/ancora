// ============================================================
// Forest mini-game types
// ============================================================

export type TreeSpecies = "oak" | "pine" | "birch" | "cherry" | "golden";

export type ForestWeather =
  | "sunny"
  | "clear"
  | "overcast"
  | "rain"
  | "storm";

export type GrowthStage = 0 | 1 | 2 | 3; // sapling, small, medium, large

export type GroundLevel = 0 | 1 | 2 | 3 | 4; // burned, dry, sparse, grass, lush

export type GridCell = {
  x: number;
  y: number;
  occupied: boolean;
};

export type IsometricPosition = {
  screenX: number;
  screenY: number;
};

export type MilestoneId =
  | "rocks_stumps"
  | "pond"
  | "animals"
  | "cabin"
  | "rainbow"
  | "fireflies"
  | "restored";

export type Milestone = {
  id: MilestoneId;
  name: string;
  description: string;
  requiredTrees: number;
};

export type AvatarConfig = {
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  outfit: number;
  accessory: number;
};

// ============================================================
// Forest types - Jardim Terapêutico Vivo
// ============================================================

// --------------- Species catalog ---------------

export type PlantCategory = "tree" | "shrub" | "flower";

export type SpeciesId =
  // Trees - hábitos estruturantes
  | "ipe_amarelo"
  | "araucaria"
  | "cerejeira"
  | "jacaranda"
  | "carvalho"
  | "pinheiro"
  // Shrubs - hábitos de manutenção
  | "lavanda"
  | "alecrim"
  | "hortensia"
  | "bambu"
  // Flowers - microvitórias e autocuidado
  | "girassol"
  | "lirio"
  | "camelia"
  | "margarida";

export type PlantSpecies = {
  id: SpeciesId;
  name: string;
  category: PlantCategory;
  symbolism: string; // short emotional description
  description: string; // why choose this plant
  growthStages: number; // how many visual stages (typically 5)
};

// --------------- Growth system ---------------

export type GrowthStage = 0 | 1 | 2 | 3 | 4;
// 0 = seed/muda, 1 = sprout, 2 = young, 3 = adult, 4 = flourishing (rare variant)

export const GROWTH_THRESHOLDS: { minCompletions: number; stage: GrowthStage }[] = [
  { minCompletions: 50, stage: 4 }, // flourishing - rare variant
  { minCompletions: 21, stage: 3 }, // adult
  { minCompletions: 7, stage: 2 },  // young
  { minCompletions: 3, stage: 1 },  // sprout
  { minCompletions: 0, stage: 0 },  // seed
];

// --------------- Ground & weather ---------------

export type GroundLevel = 0 | 1 | 2 | 3 | 4;

export type ForestWeather =
  | "sunny"       // abertura
  | "clear"       // tranquilidade
  | "overcast"    // sobrecarga
  | "rain"        // recolhimento
  | "wind"        // agitação
  | "dawn"        // esperança
  | "fireflies";  // gentileza consigo

// --------------- Zones ---------------

export type ZoneTheme =
  | "study"     // Clareira do Estudo
  | "body"      // Jardim do Corpo
  | "calm"      // Bosque da Calma
  | "courage"   // Trilha da Coragem
  | "presence"  // Lago da Presença
  | "rest"      // Refúgio do Sono
  | "general";  // Área livre

// --------------- Milestones ---------------

export type MilestoneId =
  | "first_plant"
  | "garden_path"
  | "pond"
  | "animals"
  | "bench"
  | "cabin"
  | "lantern"
  | "rainbow"
  | "fireflies"
  | "restored";

export type Milestone = {
  id: MilestoneId;
  name: string;
  description: string;
  requiredTotalGrowth: number; // sum of all plant growth XP
};

// --------------- Plant instance ---------------

export type PlantInspection = {
  speciesName: string;
  habitName: string;
  totalCompletions: number;
  currentStage: GrowthStage;
  plantedAt: string;
  lastGrownAt: string | null;
  symbolism: string;
};

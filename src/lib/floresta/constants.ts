// ============================================================
// Forest constants - Jardim Terapêutico Vivo
// ============================================================

import type {
  PlantSpecies,
  SpeciesId,
  Milestone,
  MilestoneId,
  GroundLevel,
  ZoneTheme,
} from "@/types/forest";

// --------------- Grid ---------------

export const GRID_WIDTH = 12;
export const GRID_HEIGHT = 10;
export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

// --------------- Species Catalog ---------------

export const SPECIES_CATALOG: PlantSpecies[] = [
  // === Trees ===
  {
    id: "ipe_amarelo",
    name: "Ipe-amarelo",
    category: "tree",
    symbolism: "Persistencia e florescimento",
    description:
      "Floresce com forca depois de periodos secos. Para habitos de estudo e persistencia.",
    growthStages: 5,
  },
  {
    id: "araucaria",
    name: "Araucaria",
    category: "tree",
    symbolism: "Presenca firme e raizes profundas",
    description:
      "Crescimento lento e constante. Para habitos identitarios profundos.",
    growthStages: 5,
  },
  {
    id: "cerejeira",
    name: "Cerejeira",
    category: "tree",
    symbolism: "Beleza efemera e renovacao",
    description:
      "Lembra que cada fase tem sua beleza. Para habitos de autocuidado e presenca.",
    growthStages: 5,
  },
  {
    id: "jacaranda",
    name: "Jacaranda",
    category: "tree",
    symbolism: "Criatividade e expressao",
    description:
      "Flores vibrantes que colorem tudo ao redor. Para habitos criativos e artisticos.",
    growthStages: 5,
  },
  {
    id: "carvalho",
    name: "Carvalho",
    category: "tree",
    symbolism: "Forca e estabilidade",
    description:
      "Tronco forte que resiste a tempestades. Para habitos de disciplina e resiliencia.",
    growthStages: 5,
  },
  {
    id: "pinheiro",
    name: "Pinheiro",
    category: "tree",
    symbolism: "Constancia e serenidade",
    description:
      "Verde o ano inteiro, sem depender de estacoes. Para habitos diarios e consistentes.",
    growthStages: 5,
  },

  // === Shrubs ===
  {
    id: "lavanda",
    name: "Lavanda",
    category: "shrub",
    symbolism: "Calma e ritual",
    description:
      "Associa-se a calma, ritual e cuidado gentil. Para leitura, descanso e autocuidado.",
    growthStages: 5,
  },
  {
    id: "alecrim",
    name: "Alecrim",
    category: "shrub",
    symbolism: "Memoria e clareza",
    description:
      "Estimula a mente e clarifica pensamentos. Para habitos de estudo e reflexao.",
    growthStages: 5,
  },
  {
    id: "hortensia",
    name: "Hortensia",
    category: "shrub",
    symbolism: "Gratidao e abundancia",
    description:
      "Floresce em cachos generosos. Para habitos de conexao e gratidao.",
    growthStages: 5,
  },
  {
    id: "bambu",
    name: "Bambu",
    category: "shrub",
    symbolism: "Flexibilidade e disciplina",
    description:
      "Flexivel e resistente, cresce rapido. Para treino, disciplina e recomecos.",
    growthStages: 5,
  },

  // === Flowers ===
  {
    id: "girassol",
    name: "Girassol",
    category: "flower",
    symbolism: "Otimismo e direcao",
    description:
      "Sempre busca a luz. Para habitos de positividade e intencao diaria.",
    growthStages: 5,
  },
  {
    id: "lirio",
    name: "Lirio",
    category: "flower",
    symbolism: "Pureza e recomeço",
    description:
      "Renasce com delicadeza. Para habitos de meditacao e limpeza mental.",
    growthStages: 5,
  },
  {
    id: "camelia",
    name: "Camelia",
    category: "flower",
    symbolism: "Dedicacao silenciosa",
    description:
      "Floresce sem alarde. Para habitos discretos mas transformadores.",
    growthStages: 5,
  },
  {
    id: "margarida",
    name: "Margarida",
    category: "flower",
    symbolism: "Simplicidade e alegria",
    description:
      "Pequena mas ilumina qualquer jardim. Para microvitorias e celebracoes diarias.",
    growthStages: 5,
  },
];

export function getSpecies(id: SpeciesId): PlantSpecies | undefined {
  return SPECIES_CATALOG.find((s) => s.id === id);
}

export function getSpeciesByCategory(category: PlantSpecies["category"]): PlantSpecies[] {
  return SPECIES_CATALOG.filter((s) => s.category === category);
}

// --------------- Growth thresholds (by completions) ---------------

export const GROWTH_XP_PER_COMPLETION = {
  ideal: 3,
  minimum: 2,
} as const;

// --------------- Ground level thresholds ---------------

export const GROUND_LEVEL_THRESHOLDS: { min: number; level: GroundLevel }[] = [
  { min: 200, level: 4 }, // lush (many completions)
  { min: 80, level: 3 },  // green grass
  { min: 30, level: 2 },  // sparse grass
  { min: 5, level: 1 },   // dry earth
  { min: 0, level: 0 },   // burned soil
];

// --------------- Zone themes ---------------

export const ZONE_THEMES: { id: ZoneTheme; name: string; description: string }[] = [
  { id: "study", name: "Clareira do Estudo", description: "Onde o conhecimento cria raizes" },
  { id: "body", name: "Jardim do Corpo", description: "Movimento e saude florescem aqui" },
  { id: "calm", name: "Bosque da Calma", description: "Espaco de paz e regulacao" },
  { id: "courage", name: "Trilha da Coragem", description: "Para os habitos que desafiam" },
  { id: "presence", name: "Lago da Presença", description: "Reflexao e atencao plena" },
  { id: "rest", name: "Refugio do Sono", description: "Descanso que restaura" },
  { id: "general", name: "Area Livre", description: "Para todo o resto" },
];

// --------------- Milestones (by total growth XP across all plants) ---------------

export const MILESTONES: Milestone[] = [
  { id: "first_plant", name: "Primeira semente", description: "Voce plantou sua primeira semente", requiredTotalGrowth: 2 },
  { id: "garden_path", name: "Trilha do jardim", description: "Uma trilha comeca a se formar entre as plantas", requiredTotalGrowth: 15 },
  { id: "pond", name: "Nascente", description: "Um pequeno lago surge no jardim", requiredTotalGrowth: 40 },
  { id: "bench", name: "Banco do jardim", description: "Um lugar para sentar e apreciar o que voce cultivou", requiredTotalGrowth: 70 },
  { id: "animals", name: "Vida selvagem", description: "Passaros e borboletas encontraram seu jardim", requiredTotalGrowth: 100 },
  { id: "lantern", name: "Lanterna", description: "Uma lanterna ilumina o caminho mesmo nos dias escuros", requiredTotalGrowth: 150 },
  { id: "cabin", name: "Refugio", description: "Uma cabana acolhedora surge entre as plantas", requiredTotalGrowth: 200 },
  { id: "rainbow", name: "Arco-iris", description: "Depois da chuva, cores no ceu", requiredTotalGrowth: 300 },
  { id: "fireflies", name: "Vagalumes", description: "Vagalumes iluminam as noites do jardim", requiredTotalGrowth: 400 },
  { id: "restored", name: "Jardim restaurado", description: "O jardim esta completamente vivo. Voce fez isso.", requiredTotalGrowth: 500 },
];

export function getMilestoneById(id: MilestoneId): Milestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

// --------------- Isometric rendering ---------------

export const ISO_OFFSET_X = 320;
export const ISO_OFFSET_Y = 60;

export function gridToScreen(gridX: number, gridY: number): { screenX: number; screenY: number } {
  return {
    screenX: (gridX - gridY) * (TILE_WIDTH / 2) + ISO_OFFSET_X,
    screenY: (gridX + gridY) * (TILE_HEIGHT / 2) + ISO_OFFSET_Y,
  };
}

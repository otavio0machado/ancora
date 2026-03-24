// ============================================================
// Forest engine - Jardim Terapêutico Vivo
// Pure functions for forest logic
// ============================================================

import type { GroundLevel, GrowthStage, MilestoneId, ZoneTheme } from "@/types/forest";
import type { ForestPlant } from "@/types/database";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  GROUND_LEVEL_THRESHOLDS,
  MILESTONES,
  GROWTH_XP_PER_COMPLETION,
} from "@/lib/floresta/constants";
import { GROWTH_THRESHOLDS } from "@/types/forest";

// --------------- Growth ---------------

export function calculateGrowthStage(totalCompletions: number): GrowthStage {
  for (const threshold of GROWTH_THRESHOLDS) {
    if (totalCompletions >= threshold.minCompletions) return threshold.stage;
  }
  return 0;
}

export function getGrowthXP(version: "ideal" | "minimum"): number {
  return GROWTH_XP_PER_COMPLETION[version];
}

// --------------- Ground level ---------------

export function calculateGroundLevel(totalGrowthXP: number): GroundLevel {
  for (const threshold of GROUND_LEVEL_THRESHOLDS) {
    if (totalGrowthXP >= threshold.min) return threshold.level;
  }
  return 0;
}

// --------------- Zone-based positioning ---------------

// Each zone owns a region of the grid. Plants cluster within their zone.
const ZONE_REGIONS: Record<ZoneTheme, { x1: number; y1: number; x2: number; y2: number }> = {
  study:    { x1: 0, y1: 0, x2: 3, y2: 3 },   // top-left
  body:     { x1: 4, y1: 0, x2: 7, y2: 3 },   // top-center
  courage:  { x1: 8, y1: 0, x2: 11, y2: 3 },  // top-right
  calm:     { x1: 0, y1: 4, x2: 3, y2: 6 },   // mid-left
  presence: { x1: 8, y1: 4, x2: 11, y2: 6 },  // mid-right
  rest:     { x1: 0, y1: 7, x2: 3, y2: 9 },   // bottom-left
  general:  { x1: 4, y1: 4, x2: 7, y2: 9 },   // center-bottom
};

export function getZonePositions(zone: ZoneTheme): { x: number; y: number }[] {
  const region = ZONE_REGIONS[zone] ?? ZONE_REGIONS.general;
  const positions: { x: number; y: number }[] = [];
  for (let x = region.x1; x <= region.x2 && x < GRID_WIDTH; x++) {
    for (let y = region.y1; y <= region.y2 && y < GRID_HEIGHT; y++) {
      positions.push({ x, y });
    }
  }
  return positions;
}

// Auto-assign zone from identity's linked values
export function inferZoneFromValues(linkedValues: string[]): ZoneTheme {
  const lower = linkedValues.map((v) => v.toLowerCase());

  if (lower.some((v) => v.includes("conhecimento") || v.includes("crescimento") || v.includes("estudo")))
    return "study";
  if (lower.some((v) => v.includes("saude") || v.includes("saúde") || v.includes("corpo")))
    return "body";
  if (lower.some((v) => v.includes("coragem") || v.includes("disciplina")))
    return "courage";
  if (lower.some((v) => v.includes("calma") || v.includes("paz") || v.includes("regulacao") || v.includes("regulação")))
    return "calm";
  if (lower.some((v) => v.includes("presenca") || v.includes("presença") || v.includes("atencao") || v.includes("atenção")))
    return "presence";
  if (lower.some((v) => v.includes("descanso") || v.includes("sono") || v.includes("repouso")))
    return "rest";
  if (lower.some((v) => v.includes("conexao") || v.includes("conexão")))
    return "calm";

  return "general";
}

export function findAvailablePosition(
  existingPlants: ForestPlant[],
  zone?: ZoneTheme
): { x: number; y: number } | null {
  const occupied = new Set(
    existingPlants.map((p) => `${p.grid_x},${p.grid_y}`)
  );

  // Try zone positions first
  if (zone) {
    const zonePositions = getZonePositions(zone);
    // Shuffle for slight randomness within zone
    for (let i = zonePositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [zonePositions[i], zonePositions[j]] = [zonePositions[j], zonePositions[i]];
    }
    for (const pos of zonePositions) {
      if (!occupied.has(`${pos.x},${pos.y}`)) {
        return pos;
      }
    }
  }

  // Fallback: any available position
  const available: { x: number; y: number }[] = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// --------------- Milestones ---------------

export function checkNewMilestones(
  totalGrowthXP: number,
  alreadyUnlocked: string[]
): MilestoneId[] {
  const newMilestones: MilestoneId[] = [];
  for (const milestone of MILESTONES) {
    if (
      totalGrowthXP >= milestone.requiredTotalGrowth &&
      !alreadyUnlocked.includes(milestone.id)
    ) {
      newMilestones.push(milestone.id);
    }
  }
  return newMilestones;
}

export function getNextMilestone(
  totalGrowthXP: number
): { milestone: typeof MILESTONES[number]; progress: number } | null {
  for (const milestone of MILESTONES) {
    if (totalGrowthXP < milestone.requiredTotalGrowth) {
      return {
        milestone,
        progress: totalGrowthXP / milestone.requiredTotalGrowth,
      };
    }
  }
  return null;
}

// --------------- Time of day ---------------

export type TimeOfDay = "dawn" | "day" | "evening" | "night";

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

// --------------- Recovery / re-entry ---------------

export function getDaysSinceLastActivity(plants: ForestPlant[]): number {
  if (plants.length === 0) return 999;

  let lastDate = 0;
  for (const plant of plants) {
    const d = plant.last_grown_at
      ? new Date(plant.last_grown_at).getTime()
      : new Date(plant.planted_at).getTime();
    if (d > lastDate) lastDate = d;
  }

  if (lastDate === 0) return 999;
  const diffMs = Date.now() - lastDate;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getReentryMessage(daysSince: number): string | null {
  if (daysSince <= 1) return null; // active
  if (daysSince <= 3) return "Que bom te ver de volta. Suas plantas sentiram sua falta.";
  if (daysSince <= 7) return "O jardim te esperou. Vamos regar so uma parte hoje?";
  if (daysSince <= 14) return "Faz alguns dias. Tudo bem — o jardim nao morreu. Ele so descansou, como voce.";
  if (daysSince <= 30) return "Voce voltou. Isso e o que importa. Suas plantas ainda estao aqui, esperando.";
  return "O jardim ficou em silencio, mas nenhuma planta morreu. Cada retorno e um recomeço valido.";
}

// --------------- Companion animal ---------------

export type CompanionAnimal = "none" | "bird" | "butterfly" | "rabbit" | "cat";

export function getUnlockedCompanion(totalGrowthXP: number): CompanionAnimal {
  if (totalGrowthXP >= 300) return "cat";
  if (totalGrowthXP >= 150) return "rabbit";
  if (totalGrowthXP >= 60) return "butterfly";
  if (totalGrowthXP >= 20) return "bird";
  return "none";
}

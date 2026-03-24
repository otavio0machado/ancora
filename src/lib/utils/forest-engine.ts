// ============================================================
// Forest engine - pure functions for forest logic
// ============================================================

import type { GroundLevel, GrowthStage, TreeSpecies, MilestoneId } from "@/types/forest";
import type { ForestTree } from "@/types/database";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  GROUND_LEVEL_THRESHOLDS,
  GROWTH_STAGE_THRESHOLDS,
  IDEAL_SPECIES,
  MINIMUM_SPECIES,
  STREAK_7_BONUS_SPECIES,
  STREAK_30_BONUS_SPECIES,
  MILESTONES,
} from "@/lib/floresta/constants";

// --------------- Ground level ---------------

export function calculateGroundLevel(totalTrees: number): GroundLevel {
  for (const threshold of GROUND_LEVEL_THRESHOLDS) {
    if (totalTrees >= threshold.min) return threshold.level;
  }
  return 0;
}

// --------------- Tree growth ---------------

export function calculateGrowthStage(plantedAt: string): GrowthStage {
  const now = new Date();
  const planted = new Date(plantedAt);
  const diffMs = now.getTime() - planted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  for (const threshold of GROWTH_STAGE_THRESHOLDS) {
    if (diffDays >= threshold.minDays) return threshold.stage;
  }
  return 0;
}

// --------------- Species selection ---------------

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function selectSpecies(
  version: "ideal" | "minimum",
  streakDays: number
): TreeSpecies {
  // Streak bonuses
  if (streakDays >= 30 && Math.random() < 0.15) {
    return STREAK_30_BONUS_SPECIES;
  }
  if (streakDays >= 7 && Math.random() < 0.25) {
    return STREAK_7_BONUS_SPECIES;
  }

  return version === "ideal"
    ? randomFrom(IDEAL_SPECIES)
    : randomFrom(MINIMUM_SPECIES);
}

// --------------- Grid position ---------------

export function findAvailablePosition(
  existingTrees: ForestTree[]
): { x: number; y: number } | null {
  const occupied = new Set(
    existingTrees.map((t) => `${t.grid_x},${t.grid_y}`)
  );

  const available: { x: number; y: number }[] = [];

  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) return null;

  return randomFrom(available);
}

// --------------- Milestones ---------------

export function checkNewMilestones(
  totalTrees: number,
  alreadyUnlocked: string[]
): MilestoneId[] {
  const newMilestones: MilestoneId[] = [];

  for (const milestone of MILESTONES) {
    if (
      totalTrees >= milestone.requiredTrees &&
      !alreadyUnlocked.includes(milestone.id)
    ) {
      newMilestones.push(milestone.id);
    }
  }

  return newMilestones;
}

export function getNextMilestone(
  totalTrees: number
): { milestone: typeof MILESTONES[number]; progress: number } | null {
  for (const milestone of MILESTONES) {
    if (totalTrees < milestone.requiredTrees) {
      return {
        milestone,
        progress: totalTrees / milestone.requiredTrees,
      };
    }
  }
  return null; // all milestones unlocked
}

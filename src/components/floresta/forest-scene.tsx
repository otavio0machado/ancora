"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";
import { useForestStore } from "@/lib/stores/forest-store";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { deriveWeather } from "@/lib/utils/forest-weather";
import {
  calculateGroundLevel,
  getNextMilestone,
  getTimeOfDay,
  getDaysSinceLastActivity,
  getReentryMessage,
  getUnlockedCompanion,
} from "@/lib/utils/forest-engine";
import type { GroundLevel } from "@/types/forest";
import { ForestHud } from "./forest-hud";

const ForestCanvas = dynamic(
  () => import("./forest-canvas").then((mod) => ({ default: mod.ForestCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#E8F4F0]">
        <div className="text-text-muted text-sm animate-pulse">
          Preparando seu jardim...
        </div>
      </div>
    ),
  }
);

export function ForestScene() {
  const { forestState, plants, avatar, selectedPlantId, selectPlant } = useForestStore();
  const { todayCheckIn } = useCheckInStore();

  const handlePlantTap = useCallback((plantId: string | null) => {
    selectPlant(plantId === selectedPlantId ? null : plantId);
  }, [selectPlant, selectedPlantId]);

  if (!forestState) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#E8F4F0]">
        <div className="text-text-muted text-sm">Preparando seu jardim...</div>
      </div>
    );
  }

  const weather = deriveWeather(todayCheckIn);
  const groundLevel = calculateGroundLevel(forestState.total_growth_xp) as GroundLevel;
  const nextMilestone = getNextMilestone(forestState.total_growth_xp);
  const timeOfDay = getTimeOfDay();
  const companion = getUnlockedCompanion(forestState.total_growth_xp);
  const daysSince = getDaysSinceLastActivity(plants);
  const reentryMessage = getReentryMessage(daysSince);

  return (
    <div className="relative w-full h-full">
      <ForestCanvas
        groundLevel={groundLevel}
        plants={plants}
        milestones={forestState.unlocked_milestones}
        weather={weather}
        avatar={{
          skinTone: avatar?.skin_tone ?? 0,
          hairColor: avatar?.hair_color ?? 0,
          outfit: avatar?.outfit ?? 0,
          accessory: avatar?.accessory ?? 0,
        }}
        selectedPlantId={selectedPlantId}
        companion={companion}
        timeOfDay={timeOfDay}
        onPlantTap={handlePlantTap}
      />
      <ForestHud
        totalPlants={plants.length}
        totalGrowthXP={forestState.total_growth_xp}
        weather={weather}
        nextMilestone={nextMilestone}
        reentryMessage={reentryMessage}
        companion={companion}
      />
    </div>
  );
}

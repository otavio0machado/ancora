"use client";

import dynamic from "next/dynamic";
import { useForestStore } from "@/lib/stores/forest-store";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { deriveWeather } from "@/lib/utils/forest-weather";
import { getNextMilestone } from "@/lib/utils/forest-engine";
import type { GroundLevel } from "@/types/forest";
import { ForestHud } from "./forest-hud";

// Dynamic import for PixiJS canvas (ssr: false)
const ForestCanvas = dynamic(
  () => import("./forest-canvas").then((mod) => ({ default: mod.ForestCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-surface-sunken">
        <div className="text-text-muted text-sm animate-pulse">
          Carregando floresta...
        </div>
      </div>
    ),
  }
);

export function ForestScene() {
  const { forestState, trees, avatar } = useForestStore();
  const { todayCheckIn } = useCheckInStore();

  if (!forestState) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-sunken">
        <div className="text-text-muted text-sm">Inicializando floresta...</div>
      </div>
    );
  }

  const weather = deriveWeather(todayCheckIn);
  const groundLevel = forestState.ground_level as GroundLevel;
  const nextMilestone = getNextMilestone(forestState.total_trees);

  return (
    <div className="relative w-full h-full">
      <ForestCanvas
        groundLevel={groundLevel}
        trees={trees}
        milestones={forestState.unlocked_milestones}
        weather={weather}
        skinTone={avatar?.skin_tone ?? 0}
      />

      <ForestHud
        totalTrees={forestState.total_trees}
        weather={weather}
        nextMilestone={nextMilestone}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { BarChart3, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { ForestScene } from "@/components/floresta/forest-scene";
import { AvatarCustomizer } from "@/components/floresta/avatar-customizer";
import { ForestStatsPanel } from "@/components/floresta/forest-stats-panel";
import { MilestoneToast } from "@/components/floresta/milestone-toast";
import { PlantInspector } from "@/components/floresta/plant-inspector";

export default function FlorestaPage() {
  const { forestState, plants, selectedPlantId, initializeForest } = useForestStore();
  const [showAvatar, setShowAvatar] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!forestState) initializeForest();
  }, [forestState, initializeForest]);

  // Find habit name for selected plant
  const selectedPlant = plants.find((p) => p.id === selectedPlantId);

  return (
    <div className="fixed inset-0 pt-14 pb-[calc(4rem+env(safe-area-inset-bottom))] flex flex-col bg-background">
      <div className="flex-1 relative overflow-hidden">
        <ForestScene />

        {/* Plant inspector overlay */}
        {selectedPlant && (
          <PlantInspector habitName={selectedPlant.habit_id} />
        )}

        {/* Floating action buttons */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={() => setShowStats(true)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-background/80 backdrop-blur-md shadow-md",
              "text-text-secondary hover:text-text-primary",
              "active:scale-95 ancora-transition"
            )}
          >
            <BarChart3 size={18} />
          </button>
          <button
            onClick={() => setShowAvatar(true)}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              "bg-background/80 backdrop-blur-md shadow-md",
              "text-text-secondary hover:text-text-primary",
              "active:scale-95 ancora-transition"
            )}
          >
            <User size={18} />
          </button>
        </div>
      </div>

      <AvatarCustomizer open={showAvatar} onClose={() => setShowAvatar(false)} />
      <ForestStatsPanel open={showStats} onClose={() => setShowStats(false)} />
      <MilestoneToast />
    </div>
  );
}

"use client";

import { TreePine, Cloud, Sun, CloudRain, CloudLightning, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ForestWeather, Milestone } from "@/types/forest";
import { WEATHER_LABELS } from "@/lib/utils/forest-weather";

interface ForestHudProps {
  totalTrees: number;
  weather: ForestWeather;
  nextMilestone: { milestone: Milestone; progress: number } | null;
}

const WEATHER_ICONS: Record<ForestWeather, typeof Sun> = {
  sunny: Sun,
  clear: CloudSun,
  overcast: Cloud,
  rain: CloudRain,
  storm: CloudLightning,
};

export function ForestHud({ totalTrees, weather, nextMilestone }: ForestHudProps) {
  const WeatherIcon = WEATHER_ICONS[weather];

  return (
    <div className="absolute inset-x-0 top-0 p-3 pointer-events-none">
      <div className="flex items-start justify-between">
        {/* Tree count */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
            "bg-background/70 backdrop-blur-sm",
            "text-text-primary text-xs font-medium",
            "pointer-events-auto"
          )}
        >
          <TreePine size={14} className="text-accent" />
          <span>{totalTrees} {totalTrees === 1 ? "arvore" : "arvores"}</span>
        </div>

        {/* Weather indicator */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
            "bg-background/70 backdrop-blur-sm",
            "text-text-secondary text-xs",
            "pointer-events-auto"
          )}
        >
          <WeatherIcon size={14} />
          <span>{WEATHER_LABELS[weather]}</span>
        </div>
      </div>

      {/* Next milestone progress */}
      {nextMilestone && (
        <div
          className={cn(
            "absolute bottom-3 left-3 right-3",
            "bg-background/70 backdrop-blur-sm",
            "rounded-lg px-3 py-2",
            "pointer-events-auto"
          )}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-secondary">
              Proximo: {nextMilestone.milestone.name}
            </span>
            <span className="text-text-muted">
              {totalTrees}/{nextMilestone.milestone.requiredTrees}
            </span>
          </div>
          <div className="h-1.5 bg-surface-sunken rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min(nextMilestone.progress * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

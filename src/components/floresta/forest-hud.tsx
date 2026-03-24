"use client";

import { useState, useEffect } from "react";
import { Sprout, Cloud, Sun, CloudRain, CloudSun, Wind, Sunrise, Sparkles, Heart, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ForestWeather, Milestone } from "@/types/forest";
import { WEATHER_LABELS } from "@/lib/utils/forest-weather";

interface ForestHudProps {
  totalPlants: number;
  totalGrowthXP: number;
  weather: ForestWeather;
  nextMilestone: { milestone: Milestone; progress: number } | null;
  reentryMessage: string | null;
  companion: string;
}

const WEATHER_ICONS: Record<ForestWeather, typeof Sun> = {
  sunny: Sun,
  clear: CloudSun,
  overcast: Cloud,
  rain: CloudRain,
  wind: Wind,
  dawn: Sunrise,
  fireflies: Sparkles,
};

const COMPANION_NAMES: Record<string, string> = {
  bird: "Passarinho",
  butterfly: "Borboleta",
  rabbit: "Coelho",
  cat: "Gato",
};

export function ForestHud({ totalPlants, totalGrowthXP, weather, nextMilestone, reentryMessage, companion }: ForestHudProps) {
  const WeatherIcon = WEATHER_ICONS[weather];
  const [showReentry, setShowReentry] = useState(false);

  useEffect(() => {
    if (reentryMessage) {
      const timer = setTimeout(() => setShowReentry(true), 800);
      return () => clearTimeout(timer);
    }
  }, [reentryMessage]);

  return (
    <>
      {/* Top-left: plant count + XP */}
      <div className="absolute top-3 left-3 pointer-events-none z-10">
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-full",
            "bg-background/80 backdrop-blur-md shadow-sm",
            "text-text-primary text-xs font-semibold"
          )}
        >
          <Sprout size={14} className="text-accent" />
          <span>{totalPlants}</span>
          <span className="text-text-muted font-normal">· {totalGrowthXP} xp</span>
        </div>
      </div>

      {/* Below count: weather + companion */}
      <div className="absolute top-14 left-3 pointer-events-none z-10 flex items-center gap-1.5">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full",
            "bg-background/60 backdrop-blur-md",
            "text-text-secondary text-[10px]"
          )}
        >
          <WeatherIcon size={12} />
          <span>{WEATHER_LABELS[weather]}</span>
        </div>
        {companion !== "none" && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1.5 rounded-full",
              "bg-background/60 backdrop-blur-md",
              "text-text-secondary text-[10px]"
            )}
          >
            <Heart size={10} className="text-accent" />
            <span>{COMPANION_NAMES[companion]}</span>
          </div>
        )}
      </div>

      {/* Bottom: next milestone */}
      {nextMilestone && (
        <div className="absolute bottom-3 left-3 right-16 pointer-events-none z-10">
          <div
            className={cn(
              "bg-background/80 backdrop-blur-md shadow-sm",
              "rounded-full px-3 py-2"
            )}
          >
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-text-secondary font-medium">
                {nextMilestone.milestone.name}
              </span>
              <span className="text-text-muted">
                {Math.round(nextMilestone.progress * 100)}%
              </span>
            </div>
            <div className="h-1 bg-surface-sunken rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(nextMilestone.progress * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Re-entry welcome message */}
      {showReentry && reentryMessage && (
        <div className="absolute bottom-16 left-3 right-3 z-20 pointer-events-auto animate-fade-in">
          <div
            className={cn(
              "bg-accent/90 backdrop-blur-md text-white",
              "rounded-2xl px-4 py-3 shadow-lg",
              "flex items-start gap-3"
            )}
          >
            <Heart size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm leading-relaxed">{reentryMessage}</p>
            </div>
            <button
              onClick={() => setShowReentry(false)}
              className="shrink-0 mt-0.5 opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

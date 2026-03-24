// ============================================================
// Forest weather - maps check-in mood data to forest weather
// ============================================================

import type { ForestWeather } from "@/types/forest";
import type { CheckIn } from "@/types/database";

export function deriveWeather(checkIn: CheckIn | null): ForestWeather {
  if (!checkIn) return "clear";

  const { mood, energy, anxiety } = checkIn;

  if (mood >= 4 && energy >= 4) return "sunny";
  if (mood >= 3 && anxiety <= 2) return "clear";
  if (anxiety >= 4) return "overcast";
  if (mood <= 2 && energy <= 2) return "rain";
  if (mood <= 1) return "storm";

  return "clear";
}

export const WEATHER_LABELS: Record<ForestWeather, string> = {
  sunny: "Ensolarado",
  clear: "Limpo",
  overcast: "Nublado",
  rain: "Chuva leve",
  storm: "Tempestade",
};

export const WEATHER_SKY_COLORS: Record<ForestWeather, { top: string; bottom: string }> = {
  sunny: { top: "#87CEEB", bottom: "#E0F4FF" },
  clear: { top: "#A8D8EA", bottom: "#E8F4F0" },
  overcast: { top: "#8E99A4", bottom: "#C4CCD4" },
  rain: { top: "#6B7B8D", bottom: "#9EAAB6" },
  storm: { top: "#4A5568", bottom: "#718096" },
};

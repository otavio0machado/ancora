// ============================================================
// Forest weather - maps check-in mood data to forest weather
// Weather never communicates failure - only emotional states
// ============================================================

import type { ForestWeather } from "@/types/forest";
import type { CheckIn } from "@/types/database";

export function deriveWeather(checkIn: CheckIn | null): ForestWeather {
  if (!checkIn) return "clear";

  const { mood, energy, anxiety } = checkIn;

  // Gentileza consigo - low mood, low energy but calm
  if (mood <= 2 && energy <= 2 && anxiety <= 2) return "fireflies";

  // Esperança - moderate mood with good energy
  if (mood >= 3 && energy >= 4 && anxiety <= 2) return "dawn";

  // Abertura - high mood and energy
  if (mood >= 4 && energy >= 4) return "sunny";

  // Tranquilidade
  if (mood >= 3 && anxiety <= 2) return "clear";

  // Agitação - high anxiety with energy
  if (anxiety >= 4 && energy >= 3) return "wind";

  // Sobrecarga - high anxiety
  if (anxiety >= 4) return "overcast";

  // Recolhimento - low mood
  if (mood <= 2) return "rain";

  return "clear";
}

export const WEATHER_LABELS: Record<ForestWeather, string> = {
  sunny: "Abertura",
  clear: "Tranquilidade",
  overcast: "Sobrecarga",
  rain: "Recolhimento",
  wind: "Agitacao",
  dawn: "Esperanca",
  fireflies: "Gentileza consigo",
};

// ============================================================
// Zustand store - Global App State
// ============================================================

import { create } from "zustand";
import { format } from "date-fns";
import type { User } from "@/types/database";

interface AppStore {
  // Rescue mode - simplified UI for high-distress moments
  rescueMode: boolean;
  toggleRescueMode: () => void;

  // Current date (YYYY-MM-DD) for the app context
  currentDate: string;
  setCurrentDate: (date: string) => void;
  refreshDate: () => void;

  // User profile
  user: User | null;
  setUser: (user: User | null) => void;

  // User preferences
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: "pt-BR" | "en";
  };
  setPreferences: (prefs: Partial<AppStore["preferences"]>) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  rescueMode: false,
  toggleRescueMode: () => {
    set((state) => ({ rescueMode: !state.rescueMode }));
  },

  currentDate: format(new Date(), "yyyy-MM-dd"),
  setCurrentDate: (date) => {
    set({ currentDate: date });
  },
  refreshDate: () => {
    set({ currentDate: format(new Date(), "yyyy-MM-dd") });
  },

  user: null,
  setUser: (user) => {
    set({ user });
  },

  preferences: {
    notifications: true,
    darkMode: false,
    language: "pt-BR",
  },
  setPreferences: (prefs) => {
    const current = get().preferences;
    set({ preferences: { ...current, ...prefs } });
  },

  isLoading: false,
  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

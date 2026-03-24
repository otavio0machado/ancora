// ============================================================
// Zustand store - Jardim Terapêutico Vivo
// Each habit has ONE persistent plant that grows with use
// ============================================================

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { ForestState, ForestPlant, ForestAvatar } from "@/types/database";
import type { MilestoneId, ZoneTheme } from "@/types/forest";
import {
  calculateGroundLevel,
  findAvailablePosition,
  checkNewMilestones,
  getGrowthXP,
} from "@/lib/utils/forest-engine";

interface GrowHabitPlantParams {
  habitId: string;
  habitName: string;
  habitLogId: string;
  completionType: "ideal" | "minimum";
  speciesId: string;
  zone?: ZoneTheme;
}

interface ForestStore {
  forestState: ForestState | null;
  plants: ForestPlant[];
  avatar: ForestAvatar | null;
  isLoading: boolean;
  error: string | null;
  newMilestones: MilestoneId[];
  selectedPlantId: string | null;

  loadForest: (userId?: string) => Promise<void>;
  initializeForest: () => void;
  growHabitPlant: (params: GrowHabitPlantParams) => void;
  updateAvatar: (updates: Partial<Pick<ForestAvatar, "skin_tone" | "hair_style" | "hair_color" | "outfit" | "accessory">>) => void;
  clearNewMilestones: () => void;
  selectPlant: (plantId: string | null) => void;
}

function createDefaultForestState(): ForestState {
  return {
    id: `forest-${Date.now()}`,
    user_id: "local",
    total_growth_xp: 0,
    unlocked_milestones: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function createDefaultAvatar(): ForestAvatar {
  return {
    id: `avatar-${Date.now()}`,
    user_id: "local",
    skin_tone: 0,
    hair_style: 0,
    hair_color: 0,
    outfit: 0,
    accessory: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const useForestStore = create<ForestStore>((set, get) => ({
  forestState: null,
  plants: [],
  avatar: null,
  isLoading: false,
  error: null,
  newMilestones: [],
  selectedPlantId: null,

  initializeForest: () => {
    const { forestState } = get();
    if (forestState) return;

    // Demo: seed a lush forest for visual testing
    const allMilestones: MilestoneId[] = [
      "first_plant", "garden_path", "pond", "bench", "animals",
      "lantern", "cabin", "rainbow", "fireflies", "restored",
    ];

    const speciesPool: { id: string; zone: string; name: string }[] = [
      { id: "ipe_amarelo", zone: "study", name: "Estudar" },
      { id: "araucaria", zone: "study", name: "Pesquisar" },
      { id: "cerejeira", zone: "presence", name: "Meditar" },
      { id: "jacaranda", zone: "courage", name: "Enfrentar medo" },
      { id: "carvalho", zone: "courage", name: "Disciplina" },
      { id: "pinheiro", zone: "body", name: "Treinar" },
      { id: "lavanda", zone: "calm", name: "Ler" },
      { id: "alecrim", zone: "study", name: "Revisar" },
      { id: "hortensia", zone: "calm", name: "Gratidao" },
      { id: "bambu", zone: "body", name: "Alongar" },
      { id: "girassol", zone: "general", name: "Sorrir" },
      { id: "lirio", zone: "presence", name: "Respirar" },
      { id: "camelia", zone: "rest", name: "Dormir cedo" },
      { id: "margarida", zone: "general", name: "Celebrar" },
    ];

    const demoPlants: ForestPlant[] = [];
    const occupied = new Set<string>();
    let totalXP = 0;
    const GRID_W = 12;
    const GRID_H = 10;
    const TARGET_PLANTS = 55;

    for (let i = 0; i < TARGET_PLANTS; i++) {
      let gx: number, gy: number;
      let attempts = 0;
      do {
        gx = Math.floor(Math.random() * GRID_W);
        gy = Math.floor(Math.random() * GRID_H);
        attempts++;
      } while (occupied.has(`${gx},${gy}`) && attempts < 200);
      if (occupied.has(`${gx},${gy}`)) break;
      occupied.add(`${gx},${gy}`);

      const spec = speciesPool[i % speciesPool.length];
      const completions = i < 35 ? 50 + Math.floor(Math.random() * 60)
        : i < 45 ? 21 + Math.floor(Math.random() * 20)
        : 7 + Math.floor(Math.random() * 10);
      const xp = completions * 3;
      totalXP += xp;

      const daysAgo = 30 + Math.floor(Math.random() * 90);
      const plantedDate = new Date(Date.now() - daysAgo * 86400000).toISOString();

      demoPlants.push({
        id: `demo-plant-${i}`,
        user_id: "local",
        habit_id: `demo-habit-${i}`,
        habit_name: spec.name,
        species_id: spec.id,
        zone: spec.zone,
        grid_x: gx,
        grid_y: gy,
        growth_xp: xp,
        total_completions: completions,
        planted_at: plantedDate,
        last_grown_at: new Date().toISOString(),
        created_at: plantedDate,
      });
    }

    set({
      forestState: {
        ...createDefaultForestState(),
        total_growth_xp: totalXP,
        unlocked_milestones: allMilestones,
      },
      avatar: createDefaultAvatar(),
      plants: demoPlants,
    });
  },

  loadForest: async (userId) => {
    const supabase = getSupabase();
    if (!supabase || !userId) {
      get().initializeForest();
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const [stateRes, plantsRes, avatarRes] = await Promise.all([
        supabase.from("forest_state").select("*").eq("user_id", userId).single(),
        supabase.from("forest_plants").select("*").eq("user_id", userId).order("planted_at", { ascending: true }),
        supabase.from("forest_avatar").select("*").eq("user_id", userId).single(),
      ]);

      const state = stateRes.data as ForestState | null;
      const plants = (plantsRes.data as ForestPlant[] | null) ?? [];
      const avatar = avatarRes.data as ForestAvatar | null;

      if (state) {
        set({ forestState: state, plants, avatar: avatar ?? createDefaultAvatar(), isLoading: false });
      } else {
        const newState: ForestState = { ...createDefaultForestState(), user_id: userId };
        const newAvatar: ForestAvatar = { ...createDefaultAvatar(), user_id: userId };

        await supabase.from("forest_state").insert(newState);
        await supabase.from("forest_avatar").insert(newAvatar);

        set({ forestState: newState, plants: [], avatar: newAvatar, isLoading: false });
      }
    } catch (err) {
      console.error("[forest] Failed to load:", err);
      get().initializeForest();
      set({ isLoading: false });
    }
  },

  growHabitPlant: ({ habitId, habitName, habitLogId, completionType, speciesId, zone }) => {
    // Ensure store is initialized
    if (!get().forestState) get().initializeForest();

    const currentState = get().forestState!;
    const currentPlants = get().plants;
    const xpGain = getGrowthXP(completionType);

    // Find existing plant for this habit
    const plant = currentPlants.find((p) => p.habit_id === habitId);

    if (plant) {
      // Grow existing plant
      const updatedPlant: ForestPlant = {
        ...plant,
        growth_xp: plant.growth_xp + xpGain,
        total_completions: plant.total_completions + 1,
        last_grown_at: new Date().toISOString(),
      };

      const updatedPlants = currentPlants.map((p) =>
        p.id === plant.id ? updatedPlant : p
      );

      const newTotalXP = currentState.total_growth_xp + xpGain;
      const newMilestones = checkNewMilestones(newTotalXP, currentState.unlocked_milestones);

      const updatedState: ForestState = {
        ...currentState,
        total_growth_xp: newTotalXP,
        unlocked_milestones: [...currentState.unlocked_milestones, ...newMilestones],
        updated_at: new Date().toISOString(),
      };

      set({
        plants: updatedPlants,
        forestState: updatedState,
        newMilestones: newMilestones.length > 0 ? newMilestones : get().newMilestones,
      });

      // Persist with error handling
      const supabase = getSupabase();
      if (supabase && currentState.user_id !== "local") {
        supabase.from("forest_plants").update({
          growth_xp: updatedPlant.growth_xp,
          total_completions: updatedPlant.total_completions,
          last_grown_at: updatedPlant.last_grown_at,
        }).eq("id", plant.id).then(null, (e: unknown) => console.error("[forest] persist failed:", e));

        supabase.from("forest_state").update({
          total_growth_xp: newTotalXP,
          unlocked_milestones: updatedState.unlocked_milestones,
        }).eq("user_id", currentState.user_id).then(null, (e: unknown) => console.error("[forest] persist failed:", e));
      }
    } else {
      // First completion: plant a new seed
      const position = findAvailablePosition(currentPlants, zone as ZoneTheme | undefined);
      if (!position) return;

      const newPlant: ForestPlant = {
        id: `plant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: currentState.user_id,
        habit_id: habitId,
        habit_name: habitName,
        species_id: speciesId,
        zone: zone ?? "general",
        grid_x: position.x,
        grid_y: position.y,
        growth_xp: xpGain,
        total_completions: 1,
        planted_at: new Date().toISOString(),
        last_grown_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const newTotalXP = currentState.total_growth_xp + xpGain;
      const newMilestones = checkNewMilestones(newTotalXP, currentState.unlocked_milestones);

      const updatedState: ForestState = {
        ...currentState,
        total_growth_xp: newTotalXP,
        unlocked_milestones: [...currentState.unlocked_milestones, ...newMilestones],
        updated_at: new Date().toISOString(),
      };

      set({
        plants: [...currentPlants, newPlant],
        forestState: updatedState,
        newMilestones: newMilestones.length > 0 ? newMilestones : get().newMilestones,
      });

      // Persist with error handling
      const supabase = getSupabase();
      if (supabase && currentState.user_id !== "local") {
        supabase.from("forest_plants").insert(newPlant).then(null, (e: unknown) => console.error("[forest] persist failed:", e));
        supabase.from("forest_state").update({
          total_growth_xp: newTotalXP,
          unlocked_milestones: updatedState.unlocked_milestones,
        }).eq("user_id", currentState.user_id).then(null, (e: unknown) => console.error("[forest] persist failed:", e));
      }
    }
  },

  updateAvatar: (updates) => {
    const { avatar, forestState } = get();
    if (!avatar) return;

    const updatedAvatar: ForestAvatar = {
      ...avatar,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    set({ avatar: updatedAvatar });

    const supabase = getSupabase();
    if (supabase && forestState && forestState.user_id !== "local") {
      supabase.from("forest_avatar").update(updates)
        .eq("user_id", forestState.user_id)
        .then(null, (e: unknown) => console.error("[forest] persist failed:", e));
    }
  },

  clearNewMilestones: () => set({ newMilestones: [] }),

  selectPlant: (plantId) => set({ selectedPlantId: plantId }),
}));

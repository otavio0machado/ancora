// ============================================================
// Zustand store - Forest mini-game
// Works with local state; Supabase sync is optional
// ============================================================

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { ForestState, ForestTree, ForestAvatar } from "@/types/database";
import type { MilestoneId } from "@/types/forest";
import {
  calculateGroundLevel,
  selectSpecies,
  findAvailablePosition,
  checkNewMilestones,
} from "@/lib/utils/forest-engine";
import { GRID_WIDTH, GRID_HEIGHT } from "@/lib/floresta/constants";

interface ForestStore {
  // State
  forestState: ForestState | null;
  trees: ForestTree[];
  avatar: ForestAvatar | null;
  isLoading: boolean;
  error: string | null;
  newMilestones: MilestoneId[]; // recently unlocked, for toast display

  // Actions
  loadForest: (userId?: string) => Promise<void>;
  initializeForest: () => void;
  plantTree: (habitLogId: string, version: "ideal" | "minimum", streakDays?: number) => ForestTree | null;
  updateAvatar: (updates: Partial<Pick<ForestAvatar, "skin_tone" | "hair_style" | "hair_color" | "outfit" | "accessory">>) => void;
  clearNewMilestones: () => void;
}

function createDefaultForestState(): ForestState {
  return {
    id: `forest-${Date.now()}`,
    user_id: "local",
    grid_width: GRID_WIDTH,
    grid_height: GRID_HEIGHT,
    ground_level: 0,
    total_trees: 0,
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
  trees: [],
  avatar: null,
  isLoading: false,
  error: null,
  newMilestones: [],

  initializeForest: () => {
    const { forestState } = get();
    if (forestState) return; // already initialized

    set({
      forestState: createDefaultForestState(),
      avatar: createDefaultAvatar(),
      trees: [],
    });
  },

  loadForest: async (userId) => {
    const supabase = getSupabase();
    if (!supabase || !userId) {
      // Local-only: initialize if needed
      get().initializeForest();
      return;
    }

    set({ isLoading: true, error: null });

    try {
      // Load forest state, trees, and avatar in parallel
      const [stateRes, treesRes, avatarRes] = await Promise.all([
        supabase.from("forest_state").select("*").eq("user_id", userId).single(),
        supabase.from("forest_trees").select("*").eq("user_id", userId).order("planted_at", { ascending: true }),
        supabase.from("forest_avatar").select("*").eq("user_id", userId).single(),
      ]);

      const state = stateRes.data as ForestState | null;
      const trees = (treesRes.data as ForestTree[] | null) ?? [];
      const avatar = avatarRes.data as ForestAvatar | null;

      if (state) {
        set({
          forestState: state,
          trees,
          avatar: avatar ?? createDefaultAvatar(),
          isLoading: false,
        });
      } else {
        // First time: create forest state in Supabase
        const newState: ForestState = {
          ...createDefaultForestState(),
          user_id: userId,
        };

        await supabase.from("forest_state").insert(newState);
        const newAvatar: ForestAvatar = {
          ...createDefaultAvatar(),
          user_id: userId,
        };
        await supabase.from("forest_avatar").insert(newAvatar);

        set({
          forestState: newState,
          trees: [],
          avatar: newAvatar,
          isLoading: false,
        });
      }
    } catch {
      // Fallback to local
      get().initializeForest();
      set({ isLoading: false });
    }
  },

  plantTree: (habitLogId, version, streakDays = 0) => {
    const { trees, forestState } = get();
    if (!forestState) {
      get().initializeForest();
    }

    const currentState = get().forestState!;
    const currentTrees = get().trees;

    // Find available position
    const position = findAvailablePosition(currentTrees);
    if (!position) return null; // grid is full

    // Select species
    const species = selectSpecies(version, streakDays);

    // Create tree
    const newTree: ForestTree = {
      id: `tree-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: currentState.user_id,
      habit_log_id: habitLogId,
      grid_x: position.x,
      grid_y: position.y,
      species,
      growth_stage: 0,
      version,
      planted_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newTotalTrees = currentState.total_trees + 1;
    const newGroundLevel = calculateGroundLevel(newTotalTrees);

    // Check milestones
    const newMilestones = checkNewMilestones(
      newTotalTrees,
      currentState.unlocked_milestones
    );

    const updatedState: ForestState = {
      ...currentState,
      total_trees: newTotalTrees,
      ground_level: newGroundLevel,
      unlocked_milestones: [
        ...currentState.unlocked_milestones,
        ...newMilestones,
      ],
      updated_at: new Date().toISOString(),
    };

    set({
      trees: [...currentTrees, newTree],
      forestState: updatedState,
      newMilestones: newMilestones.length > 0 ? newMilestones : get().newMilestones,
    });

    // Try to persist to Supabase
    const supabase = getSupabase();
    if (supabase && currentState.user_id !== "local") {
      supabase.from("forest_trees").insert(newTree).then(() => {});
      supabase
        .from("forest_state")
        .update({
          total_trees: newTotalTrees,
          ground_level: newGroundLevel,
          unlocked_milestones: updatedState.unlocked_milestones,
        })
        .eq("user_id", currentState.user_id)
        .then(() => {});
    }

    return newTree;
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

    // Persist to Supabase
    const supabase = getSupabase();
    if (supabase && forestState && forestState.user_id !== "local") {
      supabase
        .from("forest_avatar")
        .update(updates)
        .eq("user_id", forestState.user_id)
        .then(() => {});
    }
  },

  clearNewMilestones: () => {
    set({ newMilestones: [] });
  },
}));

// ============================================================
// Zustand store - Impulse Tracking
// Works with local state; Supabase sync is optional
// ============================================================

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { Impulse } from "@/types/database";

interface ImpulseFormData {
  type: Impulse["type"];
  intensity: number;
  trigger?: string;
  context?: string;
  emotion_before?: string;
  technique_used?: string;
  resisted: boolean;
  notes?: string;
}

interface ProtocolState {
  active: boolean;
  currentTechnique: string | null;
  timerSeconds: number;
  timerRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;
}

interface ImpulseStore {
  currentImpulse: ImpulseFormData | null;
  recentImpulses: Impulse[];
  isSubmitting: boolean;
  error: string | null;

  protocol: ProtocolState;

  setCurrentImpulse: (data: Partial<ImpulseFormData>) => void;
  resetCurrentImpulse: () => void;
  addImpulse: (data?: Partial<ImpulseFormData>) => Promise<Impulse | null>;
  loadRecentImpulses: (userId?: string) => Promise<void>;

  startProtocol: (technique: string, timerSeconds?: number) => void;
  stopProtocol: () => void;
  tickProtocol: () => void;
}

const defaultImpulse: ImpulseFormData = {
  type: "other",
  intensity: 5,
  resisted: false,
};

export const useImpulseStore = create<ImpulseStore>((set, get) => ({
  currentImpulse: null,
  recentImpulses: [],
  isSubmitting: false,
  error: null,

  protocol: {
    active: false,
    currentTechnique: null,
    timerSeconds: 0,
    timerRunning: false,
    intervalId: null,
  },

  setCurrentImpulse: (data) => {
    const current = get().currentImpulse ?? { ...defaultImpulse };
    set({ currentImpulse: { ...current, ...data }, error: null });
  },

  resetCurrentImpulse: () => {
    set({ currentImpulse: null, error: null });
  },

  addImpulse: async (data) => {
    const impulseData = data
      ? { ...defaultImpulse, ...get().currentImpulse, ...data }
      : get().currentImpulse;
    if (!impulseData) return null;

    set({ isSubmitting: true, error: null });

    // Create a local Impulse object
    const localImpulse: Impulse = {
      id: crypto.randomUUID(),
      user_id: "local",
      type: impulseData.type,
      intensity: impulseData.intensity,
      trigger: impulseData.trigger ?? null,
      context: impulseData.context ?? null,
      emotion_before: impulseData.emotion_before ?? null,
      technique_used: impulseData.technique_used ?? null,
      resisted: impulseData.resisted,
      notes: impulseData.notes ?? null,
      created_at: new Date().toISOString(),
    };

    // Try to persist to Supabase
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: dbData, error } = await supabase
            .from("impulses")
            .insert({ ...localImpulse, user_id: userData.user.id })
            .select()
            .single();

          if (!error && dbData) {
            const result = dbData as Impulse;
            set((state) => ({
              isSubmitting: false,
              currentImpulse: null,
              recentImpulses: [result, ...state.recentImpulses],
            }));
            return result;
          }
        }
      } catch {
        // Fall through to local
      }
    }

    // Local-only mode
    set((state) => ({
      isSubmitting: false,
      currentImpulse: null,
      recentImpulses: [localImpulse, ...state.recentImpulses],
    }));

    return localImpulse;
  },

  loadRecentImpulses: async (userId) => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data } = await supabase
      .from("impulses")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (data) {
      set({ recentImpulses: data as Impulse[] });
    }
  },

  startProtocol: (technique, timerSeconds = 0) => {
    const { protocol } = get();

    if (protocol.intervalId) {
      clearInterval(protocol.intervalId);
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (timerSeconds > 0) {
      intervalId = setInterval(() => {
        get().tickProtocol();
      }, 1000);
    }

    set({
      protocol: {
        active: true,
        currentTechnique: technique,
        timerSeconds,
        timerRunning: timerSeconds > 0,
        intervalId,
      },
    });
  },

  stopProtocol: () => {
    const { protocol } = get();
    if (protocol.intervalId) {
      clearInterval(protocol.intervalId);
    }

    set({
      protocol: {
        active: false,
        currentTechnique: null,
        timerSeconds: 0,
        timerRunning: false,
        intervalId: null,
      },
    });
  },

  tickProtocol: () => {
    const { protocol } = get();
    if (!protocol.timerRunning) return;

    if (protocol.timerSeconds <= 1) {
      if (protocol.intervalId) {
        clearInterval(protocol.intervalId);
      }
      set({
        protocol: {
          ...protocol,
          timerSeconds: 0,
          timerRunning: false,
          intervalId: null,
        },
      });
      return;
    }

    set({
      protocol: {
        ...protocol,
        timerSeconds: protocol.timerSeconds - 1,
      },
    });
  },
}));

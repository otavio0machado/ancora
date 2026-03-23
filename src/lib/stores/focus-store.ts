// ============================================================
// Zustand store - Focus Sessions
// Works with local state; Supabase sync is optional
// ============================================================

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { FocusSession } from "@/types/database";

interface FocusStore {
  currentSession: FocusSession | null;
  timeRemaining: number; // seconds
  isRunning: boolean;
  intervalId: ReturnType<typeof setInterval> | null;

  startSession: (objective: string, durationMinutes: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  completeSession: (review?: {
    focus?: number;
    progress?: string;
    notes?: string;
  }) => Promise<void>;
  abandonSession: () => Promise<void>;
  tick: () => void;
  reset: () => void;
}

export const useFocusStore = create<FocusStore>((set, get) => ({
  currentSession: null,
  timeRemaining: 0,
  isRunning: false,
  intervalId: null,

  startSession: (objective, durationMinutes) => {
    const session: FocusSession = {
      id: crypto.randomUUID(),
      user_id: "local",
      objective,
      duration_planned: durationMinutes,
      duration_actual: null,
      started_at: new Date().toISOString(),
      ended_at: null,
      status: "active",
      review_focus: null,
      review_progress: null,
      review_notes: null,
      created_at: new Date().toISOString(),
    };

    // Try to persist to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase
            .from("focus_sessions")
            .insert({ ...session, user_id: data.user.id })
            .select()
            .single()
            .then(({ data: dbSession }) => {
              if (dbSession) {
                set({ currentSession: dbSession as FocusSession });
              }
            });
        }
      });
    }

    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({
      currentSession: session,
      timeRemaining: durationMinutes * 60,
      isRunning: true,
      intervalId,
    });
  },

  pauseSession: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({ isRunning: false, intervalId: null });
  },

  resumeSession: () => {
    const { isRunning, currentSession } = get();
    if (isRunning || !currentSession) return;

    const intervalId = setInterval(() => {
      get().tick();
    }, 1000);

    set({ isRunning: true, intervalId });
  },

  completeSession: async (review) => {
    const { currentSession, intervalId } = get();
    if (!currentSession) return;

    if (intervalId) {
      clearInterval(intervalId);
    }

    const now = new Date();
    const startedAt = new Date(currentSession.started_at);
    const durationActual = Math.round(
      (now.getTime() - startedAt.getTime()) / 60000
    );

    // Try to persist to Supabase
    const supabase = getSupabase();
    if (supabase && currentSession.user_id !== "local") {
      await supabase
        .from("focus_sessions")
        .update({
          status: "completed" as const,
          ended_at: now.toISOString(),
          duration_actual: durationActual,
          review_focus: review?.focus ?? null,
          review_progress: review?.progress ?? null,
          review_notes: review?.notes ?? null,
        })
        .eq("id", currentSession.id);
    }

    set({
      currentSession: null,
      timeRemaining: 0,
      isRunning: false,
      intervalId: null,
    });
  },

  abandonSession: async () => {
    const { currentSession, intervalId } = get();
    if (!currentSession) return;

    if (intervalId) {
      clearInterval(intervalId);
    }

    const now = new Date();
    const startedAt = new Date(currentSession.started_at);
    const durationActual = Math.round(
      (now.getTime() - startedAt.getTime()) / 60000
    );

    const supabase = getSupabase();
    if (supabase && currentSession.user_id !== "local") {
      await supabase
        .from("focus_sessions")
        .update({
          status: "abandoned" as const,
          ended_at: now.toISOString(),
          duration_actual: durationActual,
        })
        .eq("id", currentSession.id);
    }

    set({
      currentSession: null,
      timeRemaining: 0,
      isRunning: false,
      intervalId: null,
    });
  },

  tick: () => {
    const { timeRemaining, isRunning } = get();
    if (!isRunning) return;

    if (timeRemaining <= 1) {
      get().pauseSession();
      set({ timeRemaining: 0 });
      return;
    }

    set({ timeRemaining: timeRemaining - 1 });
  },

  reset: () => {
    const { intervalId } = get();
    if (intervalId) {
      clearInterval(intervalId);
    }
    set({
      currentSession: null,
      timeRemaining: 0,
      isRunning: false,
      intervalId: null,
    });
  },
}));

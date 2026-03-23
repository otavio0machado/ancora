// ============================================================
// Zustand store - Daily Check-in
// Works with local state; Supabase sync is optional
// ============================================================

import { create } from "zustand";
import { format } from "date-fns";
import { getSupabase } from "@/lib/supabase/client";
import type { CheckIn } from "@/types/database";

interface CheckInData {
  energy: number;
  mood: number;
  anxiety: number;
  focus: number;
  impulsivity: number;
  notes?: string;
}

interface CheckInStore {
  checkIn: CheckInData | null;
  todayCheckIn: CheckIn | null;
  isSubmitting: boolean;
  isCompleted: boolean;
  error: string | null;

  setCheckIn: (data: Partial<CheckInData>) => void;
  resetCheckIn: () => void;
  submitCheckIn: () => Promise<void>;
  loadTodayCheckIn: (userId?: string) => Promise<void>;
}

const defaultCheckIn: CheckInData = {
  energy: 3,
  mood: 3,
  anxiety: 3,
  focus: 3,
  impulsivity: 3,
};

export const useCheckInStore = create<CheckInStore>((set, get) => ({
  checkIn: { ...defaultCheckIn },
  todayCheckIn: null,
  isSubmitting: false,
  isCompleted: false,
  error: null,

  setCheckIn: (data) => {
    const current = get().checkIn ?? { ...defaultCheckIn };
    set({ checkIn: { ...current, ...data }, error: null });
  },

  resetCheckIn: () => {
    set({ checkIn: { ...defaultCheckIn }, error: null, isCompleted: false });
  },

  submitCheckIn: async () => {
    const { checkIn } = get();
    if (!checkIn) return;

    set({ isSubmitting: true, error: null });

    const today = format(new Date(), "yyyy-MM-dd");

    // Create a local CheckIn object
    const localCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      user_id: "local",
      date: today,
      energy: checkIn.energy,
      mood: checkIn.mood,
      anxiety: checkIn.anxiety,
      focus: checkIn.focus,
      impulsivity: checkIn.impulsivity,
      notes: checkIn.notes ?? null,
      created_at: new Date().toISOString(),
    };

    // Try to persist to Supabase if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data, error } = await supabase
            .from("check_ins")
            .upsert(
              {
                user_id: userData.user.id,
                date: today,
                energy: checkIn.energy,
                mood: checkIn.mood,
                anxiety: checkIn.anxiety,
                focus: checkIn.focus,
                impulsivity: checkIn.impulsivity,
                notes: checkIn.notes ?? null,
              },
              { onConflict: "user_id,date" }
            )
            .select()
            .single();

          if (!error && data) {
            set({
              isSubmitting: false,
              isCompleted: true,
              todayCheckIn: data as CheckIn,
            });
            return;
          }
        }
      } catch {
        // Fall through to local storage
      }
    }

    // Local-only mode
    set({ isSubmitting: false, isCompleted: true, todayCheckIn: localCheckIn });
  },

  loadTodayCheckIn: async (userId) => {
    const supabase = getSupabase();
    if (!supabase || !userId) return;

    const today = format(new Date(), "yyyy-MM-dd");

    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (data) {
      const checkIn = data as CheckIn;
      set({
        todayCheckIn: checkIn,
        isCompleted: true,
        checkIn: {
          energy: checkIn.energy,
          mood: checkIn.mood,
          anxiety: checkIn.anxiety,
          focus: checkIn.focus,
          impulsivity: checkIn.impulsivity,
          notes: checkIn.notes ?? undefined,
        },
      });
    }
  },
}));

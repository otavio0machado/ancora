// ============================================================
// Zustand store - Impulse Tracking (Full Circuit)
// State machine: idle -> form steps -> intervention -> delay -> outcome -> done
// ============================================================

import { create } from "zustand";
import { getSupabase } from "@/lib/supabase/client";
import type { Impulse, RecoveryEntry } from "@/types/database";

// --------------- Flow Steps ---------------

export type FlowStep =
  | "idle"
  | "form_emotion"
  | "form_type"
  | "form_intensity"
  | "form_context"
  | "intervention_defusion"
  | "intervention_values"
  | "intervention_techniques"
  | "intervention_practice"
  | "intervention_reevaluation"
  | "delay"
  | "outcome"
  | "outcome_resisted"
  | "outcome_gave_in"
  | "recovery"
  | "done";

export type TechniqueId =
  | "tip"
  | "stop"
  | "grounding"
  | "breathing"
  | "opposite_action"
  | "delay"
  | "environment_change";

// --------------- Form Data ---------------

export interface ImpulseFormData {
  emotion: string | null;
  type: Impulse["type"] | null;
  intensity: number;
  context: string;
  trigger: string;
}

export interface RecoveryData {
  triggerAnalysis: string;
  whatToDoDifferently: string;
  selfCompassionNote: string;
  returnAction: string;
}

// --------------- Store ---------------

interface ImpulseStore {
  // Flow state
  flowStep: FlowStep;
  flowHistory: FlowStep[];

  // Form data (collected across steps)
  formData: ImpulseFormData;

  // Intervention state
  selectedTechnique: TechniqueId | null;
  techniqueStartTime: number | null;
  practiceElapsedSeconds: number;
  postIntensity: number | null;
  techniquesUsed: TechniqueId[];

  // Outcome state
  resisted: boolean | null;
  outcomeNotes: string;
  techniqueEffectiveness: number | null;
  recoveryData: RecoveryData | null;

  // Persisted data
  recentImpulses: Impulse[];
  isSubmitting: boolean;
  error: string | null;

  // Flow actions
  goToStep: (step: FlowStep) => void;
  goBack: () => void;
  resetFlow: () => void;

  // Form actions
  setEmotion: (emotion: string) => void;
  setImpulseType: (type: Impulse["type"]) => void;
  setIntensity: (intensity: number) => void;
  setContext: (context: string) => void;
  setTrigger: (trigger: string) => void;

  // Intervention actions
  selectTechnique: (technique: TechniqueId) => void;
  startPractice: () => void;
  endPractice: () => void;
  setPostIntensity: (intensity: number) => void;
  addTechniqueUsed: (technique: TechniqueId) => void;

  // Outcome actions
  setResisted: (resisted: boolean) => void;
  setOutcomeNotes: (notes: string) => void;
  setTechniqueEffectiveness: (rating: number) => void;
  setRecoveryData: (data: Partial<RecoveryData>) => void;

  // Persistence
  saveImpulse: () => Promise<Impulse | null>;
  loadRecentImpulses: (userId?: string) => Promise<void>;
}

const defaultFormData: ImpulseFormData = {
  emotion: null,
  type: null,
  intensity: 5,
  context: "",
  trigger: "",
};

const defaultRecoveryData: RecoveryData = {
  triggerAnalysis: "",
  whatToDoDifferently: "",
  selfCompassionNote: "",
  returnAction: "",
};

export const useImpulseStore = create<ImpulseStore>((set, get) => ({
  // Flow state
  flowStep: "idle",
  flowHistory: [],

  // Form data
  formData: { ...defaultFormData },

  // Intervention state
  selectedTechnique: null,
  techniqueStartTime: null,
  practiceElapsedSeconds: 0,
  postIntensity: null,
  techniquesUsed: [],

  // Outcome state
  resisted: null,
  outcomeNotes: "",
  techniqueEffectiveness: null,
  recoveryData: null,

  // Persisted data
  recentImpulses: [],
  isSubmitting: false,
  error: null,

  // --------------- Flow Actions ---------------

  goToStep: (step) => {
    const currentStep = get().flowStep;
    set((state) => ({
      flowStep: step,
      flowHistory: [...state.flowHistory, currentStep],
    }));
  },

  goBack: () => {
    const { flowHistory } = get();
    if (flowHistory.length === 0) {
      set({ flowStep: "idle" });
      return;
    }
    const previousStep = flowHistory[flowHistory.length - 1];
    set({
      flowStep: previousStep,
      flowHistory: flowHistory.slice(0, -1),
    });
  },

  resetFlow: () => {
    set({
      flowStep: "idle",
      flowHistory: [],
      formData: { ...defaultFormData },
      selectedTechnique: null,
      techniqueStartTime: null,
      practiceElapsedSeconds: 0,
      postIntensity: null,
      techniquesUsed: [],
      resisted: null,
      outcomeNotes: "",
      techniqueEffectiveness: null,
      recoveryData: null,
      error: null,
    });
  },

  // --------------- Form Actions ---------------

  setEmotion: (emotion) => {
    set((state) => ({
      formData: { ...state.formData, emotion },
    }));
  },

  setImpulseType: (type) => {
    set((state) => ({
      formData: { ...state.formData, type },
    }));
  },

  setIntensity: (intensity) => {
    set((state) => ({
      formData: { ...state.formData, intensity },
    }));
  },

  setContext: (context) => {
    set((state) => ({
      formData: { ...state.formData, context },
    }));
  },

  setTrigger: (trigger) => {
    set((state) => ({
      formData: { ...state.formData, trigger },
    }));
  },

  // --------------- Intervention Actions ---------------

  selectTechnique: (technique) => {
    set({ selectedTechnique: technique });
  },

  startPractice: () => {
    set({ techniqueStartTime: Date.now(), practiceElapsedSeconds: 0 });
  },

  endPractice: () => {
    const { techniqueStartTime, selectedTechnique, techniquesUsed } = get();
    const elapsed = techniqueStartTime
      ? Math.round((Date.now() - techniqueStartTime) / 1000)
      : 0;

    set({
      practiceElapsedSeconds: elapsed,
      techniqueStartTime: null,
      techniquesUsed: selectedTechnique
        ? [...new Set([...techniquesUsed, selectedTechnique])]
        : techniquesUsed,
    });
  },

  setPostIntensity: (intensity) => {
    set({ postIntensity: intensity });
  },

  addTechniqueUsed: (technique) => {
    set((state) => ({
      techniquesUsed: [...new Set([...state.techniquesUsed, technique])],
    }));
  },

  // --------------- Outcome Actions ---------------

  setResisted: (resisted) => {
    set({ resisted });
  },

  setOutcomeNotes: (notes) => {
    set({ outcomeNotes: notes });
  },

  setTechniqueEffectiveness: (rating) => {
    set({ techniqueEffectiveness: rating });
  },

  setRecoveryData: (data) => {
    const current = get().recoveryData ?? { ...defaultRecoveryData };
    set({ recoveryData: { ...current, ...data } });
  },

  // --------------- Persistence ---------------

  saveImpulse: async () => {
    const state = get();
    const { formData, resisted, outcomeNotes, selectedTechnique, techniqueEffectiveness, recoveryData, practiceElapsedSeconds } = state;

    if (!formData.type) return null;

    set({ isSubmitting: true, error: null });

    const localImpulse: Impulse = {
      id: crypto.randomUUID(),
      user_id: "local",
      type: formData.type,
      intensity: formData.intensity,
      trigger: formData.trigger || null,
      context: formData.context || null,
      emotion_before: formData.emotion || null,
      technique_used: selectedTechnique || null,
      resisted: resisted ?? false,
      notes: outcomeNotes || null,
      duration_minutes: practiceElapsedSeconds > 0 ? Math.ceil(practiceElapsedSeconds / 60) : null,
      technique_effectiveness: techniqueEffectiveness,
      linked_value: null,
      recovery_entry_id: null,
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

            // Save recovery entry if applicable
            if (!resisted && recoveryData) {
              const recoveryEntry: Omit<RecoveryEntry, "id" | "created_at"> & { id?: string; created_at?: string } = {
                user_id: userData.user.id,
                impulse_id: result.id,
                trigger_analysis: recoveryData.triggerAnalysis || null,
                what_to_do_differently: recoveryData.whatToDoDifferently || null,
                self_compassion_note: recoveryData.selfCompassionNote || null,
                return_action: recoveryData.returnAction || null,
              };

              await supabase
                .from("recovery_entries")
                .insert(recoveryEntry);
            }

            // Save technique log if applicable
            if (selectedTechnique) {
              await supabase
                .from("technique_logs")
                .insert({
                  user_id: userData.user.id,
                  impulse_id: result.id,
                  technique: selectedTechnique,
                  context: "impulse" as const,
                  effectiveness: techniqueEffectiveness,
                  duration_seconds: practiceElapsedSeconds > 0 ? practiceElapsedSeconds : null,
                  notes: null,
                });
            }

            set((s) => ({
              isSubmitting: false,
              recentImpulses: [result, ...s.recentImpulses],
            }));
            return result;
          }
        }
      } catch {
        // Fall through to local
      }
    }

    // Local-only mode
    set((s) => ({
      isSubmitting: false,
      recentImpulses: [localImpulse, ...s.recentImpulses],
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
}));

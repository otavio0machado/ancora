// ============================================================
// AI request / response types for Ancora
// ============================================================

import type { CheckIn, DayPriority, FocusSession, HabitLog, Impulse } from "./database";

// --------------- Day Adjustment ---------------

export type AIDayAdjustInput = {
  checkIn: CheckIn;
  priorities: DayPriority[];
  recentHabitLogs: HabitLog[];
};

export type AIDayAdjustOutput = {
  suggestedPlan: string;
  minimumVersion: string;
  overloadAlert: boolean;
  overloadMessage?: string;
  encouragement: string;
};

// --------------- Impulse Protocol ---------------

export type AIImpulseInput = {
  impulse: Pick<
    Impulse,
    "type" | "intensity" | "trigger" | "context" | "emotion_before"
  >;
  recentImpulses: Impulse[]; // last 7 days
};

export type AIImpulseOutput = {
  immediateActions: string[]; // DBT techniques
  patternReading: string;
  regulatoryPhrase: string;
  breathingExercise?: {
    inhale: number;
    hold: number;
    exhale: number;
  };
};

// --------------- Weekly Reflection ---------------

export type AIWeeklyInput = {
  checkIns: CheckIn[];
  habitLogs: HabitLog[];
  impulses: Impulse[];
  focusSessions: FocusSession[];
};

export type AIWeeklyOutput = {
  patterns: string[];
  triggers: string[];
  adjustments: string[];
  wins: string[];
  weekSummary: string;
};

// --------------- Microcopy ---------------

export type MicrocopyContext =
  | "greeting"
  | "checkin_complete"
  | "impulse_resisted"
  | "impulse_gave_in"
  | "habit_minimum"
  | "return_after_absence"
  | "rescue_mode";

export type MicrocopyTone =
  | "gentle"
  | "grounding"
  | "validating"
  | "encouraging";

export type AIMicrocopyInput = {
  context: MicrocopyContext;
  userData?: {
    name?: string;
    mood?: number;
    energy?: number;
  };
};

export type AIMicrocopyOutput = {
  message: string;
  tone: MicrocopyTone;
};

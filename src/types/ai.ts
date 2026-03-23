// ============================================================
// AI request / response types for Ancora
// Deeply informed by DBT/ACT therapeutic frameworks
// ============================================================

import type {
  CheckIn,
  DayPriority,
  FocusSession,
  HabitLog,
  Impulse,
  TechniqueLog,
} from "./database";

// --------------- Day Adjustment ---------------

export type AIDayAdjustInput = {
  checkIn: CheckIn;
  priorities: DayPriority[];
  recentHabitLogs: HabitLog[];
  userValues?: string[]; // ACT values
  habits?: { id: string; name: string; ideal_version: string; minimum_version: string }[];
};

export type AIDayAdjustOutput = {
  suggestedPlan: string;
  minimumVersion: string;
  overloadAlert: boolean;
  overloadMessage?: string;
  encouragement: string;
  habitsToSkip: string[]; // habits to reduce/skip today
  valueConnection: string; // how today connects to values
  riskPrediction?: string; // "High impulse risk tonight if..."
};

// --------------- Impulse Protocol ---------------

export type AIImpulseInput = {
  impulse: Pick<
    Impulse,
    "type" | "intensity" | "trigger" | "context" | "emotion_before"
  >;
  recentImpulses: Impulse[]; // last 7 days
  userValues?: string[];
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
  defusionExercise: string; // ACT cognitive defusion prompt
  valueReminder: string; // connects to user's values
  successProbability?: string; // "Based on your history..."
  alternativeBehaviors: string[]; // healthy alternatives
};

// --------------- Weekly Reflection ---------------

export type AIWeeklyInput = {
  checkIns: CheckIn[];
  habitLogs: HabitLog[];
  impulses: Impulse[];
  focusSessions: FocusSession[];
  userValues?: string[];
};

export type AIWeeklyOutput = {
  patterns: string[];
  triggers: string[];
  adjustments: string[];
  wins: string[];
  weekSummary: string;
  techniqueEffectiveness?: string;
  substitutionAlert?: string;
  trajectoryInsight?: string;
  valueAlignment?: string;
};

// --------------- Microcopy ---------------

export type MicrocopyContext =
  | "greeting"
  | "checkin_complete"
  | "impulse_resisted"
  | "impulse_gave_in"
  | "habit_minimum"
  | "habit_ideal"
  | "return_after_absence"
  | "rescue_mode"
  | "recovery_start"
  | "overload_detected"
  | "pattern_insight"
  | "value_reminder"
  | "anti_obsession";

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

// --------------- Pattern Analysis ---------------

export type AIPatternInput = {
  checkIns: CheckIn[];
  impulses: Impulse[];
  habitLogs: HabitLog[];
  techniqueLogs: TechniqueLog[];
  userValues?: string[];
  timeframe: "week" | "month";
};

export type AIPatternOutput = {
  timePatterns: Array<{
    description: string;
    dayOfWeek?: string;
    timeOfDay?: string;
    frequency: string;
  }>;
  triggerCorrelations: Array<{
    trigger: string;
    associatedImpulseTypes: string[];
    resistanceRate: number;
  }>;
  emotionalCycles: Array<{
    pattern: string;
    insight: string;
  }>;
  techniqueEffectiveness: Array<{
    technique: string;
    avgEffectiveness: number;
    bestFor: string;
  }>;
  riskWindows: Array<{
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  progressIndicators: Array<{
    metric: string;
    trend: "improving" | "stable" | "declining";
    detail: string;
  }>;
};

// --------------- Recovery Guidance ---------------

export type AIRecoveryInput = {
  impulseType: string;
  trigger?: string;
  context?: string;
  emotionBefore?: string;
  emotionAfter?: string;
  userValues?: string[];
  recentImpulses?: Impulse[];
};

export type AIRecoveryOutput = {
  compassionMessage: string;
  triggerAnalysis: string;
  returnAction: string;
  valueReconnection: string;
  nextTimeStrategy: string;
};

// ============================================================
// Zod validation schemas for Ancora
// ============================================================

import { z } from "zod";

// --------------- Shared helpers ---------------

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD");
const rating1to5 = z.number().int().min(1).max(5);
const rating1to10 = z.number().int().min(1).max(10);

// --------------- Database schemas ---------------

export const checkInSchema = z.object({
  user_id: z.string().uuid(),
  date: dateString,
  energy: rating1to5,
  mood: rating1to5,
  anxiety: rating1to5,
  focus: rating1to5,
  impulsivity: rating1to5,
  notes: z.string().nullable(),
});

export const identitySchema = z.object({
  user_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  icon: z.string().max(10).nullable(),
  active: z.boolean(),
  order_index: z.number().int().min(0),
});

export const habitSchema = z.object({
  user_id: z.string().uuid(),
  identity_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  ideal_version: z.string().min(1).max(500),
  minimum_version: z.string().min(1).max(500),
  common_saboteurs: z.array(z.string()),
  frequency: z.enum(["daily", "weekdays", "custom"]),
  custom_days: z.array(z.number().int().min(0).max(6)).nullable(),
  active: z.boolean(),
  order_index: z.number().int().min(0),
});

export const habitLogSchema = z.object({
  habit_id: z.string().uuid(),
  user_id: z.string().uuid(),
  date: dateString,
  version: z.enum(["ideal", "minimum", "skipped"]),
  notes: z.string().nullable(),
});

export const dayPrioritySchema = z.object({
  user_id: z.string().uuid(),
  date: dateString,
  text: z.string().min(1).max(300),
  completed: z.boolean(),
  order_index: z.number().int().min(0).max(2), // max 3 priorities (0, 1, 2)
});

export const focusSessionSchema = z.object({
  user_id: z.string().uuid(),
  objective: z.string().min(1).max(300),
  duration_planned: z.number().int().min(1),
  duration_actual: z.number().int().min(0).nullable(),
  started_at: z.string(),
  ended_at: z.string().nullable(),
  status: z.enum(["active", "completed", "abandoned"]),
  review_focus: rating1to5.nullable(),
  review_progress: z.string().nullable(),
  review_notes: z.string().nullable(),
});

const impulseTypeEnum = z.enum([
  "smoking",
  "social_media",
  "pornography",
  "binge_eating",
  "substance",
  "other",
]);

export const impulseSchema = z.object({
  user_id: z.string().uuid(),
  type: impulseTypeEnum,
  intensity: rating1to10,
  trigger: z.string().nullable(),
  context: z.string().nullable(),
  emotion_before: z.string().nullable(),
  technique_used: z.string().nullable(),
  resisted: z.boolean(),
  notes: z.string().nullable(),
});

export const weeklyReviewSchema = z.object({
  user_id: z.string().uuid(),
  week_start: dateString,
  patterns: z.string().nullable(),
  triggers: z.string().nullable(),
  adjustments: z.string().nullable(),
  wins: z.string().nullable(),
  ai_insights: z.string().nullable(),
});

// --------------- Full row schemas (include server-generated fields) ---------------

const rowFields = {
  id: z.string().uuid(),
  created_at: z.string(),
};

const checkInRowSchema = checkInSchema.extend(rowFields);
const habitLogRowSchema = habitLogSchema.extend(rowFields);
const impulseRowSchema = impulseSchema.extend(rowFields);
const focusSessionRowSchema = focusSessionSchema.extend(rowFields);
const dayPriorityRowSchema = dayPrioritySchema.extend(rowFields);

// --------------- AI schemas ---------------

// Day Adjustment
export const aiDayAdjustInputSchema = z.object({
  checkIn: checkInRowSchema,
  priorities: z.array(dayPriorityRowSchema),
  recentHabitLogs: z.array(habitLogRowSchema),
});

export const aiDayAdjustOutputSchema = z.object({
  suggestedPlan: z.string(),
  minimumVersion: z.string(),
  overloadAlert: z.boolean(),
  overloadMessage: z.string().optional(),
  encouragement: z.string(),
});

// Impulse Protocol
export const aiImpulseInputSchema = z.object({
  impulse: z.object({
    type: impulseTypeEnum,
    intensity: rating1to10,
    trigger: z.string().nullable(),
    context: z.string().nullable(),
    emotion_before: z.string().nullable(),
  }),
  recentImpulses: z.array(impulseRowSchema),
});

export const aiImpulseOutputSchema = z.object({
  immediateActions: z.array(z.string()),
  patternReading: z.string(),
  regulatoryPhrase: z.string(),
  breathingExercise: z
    .object({
      inhale: z.number(),
      hold: z.number(),
      exhale: z.number(),
    })
    .optional(),
});

// Weekly Reflection
export const aiWeeklyInputSchema = z.object({
  checkIns: z.array(checkInRowSchema),
  habitLogs: z.array(habitLogRowSchema),
  impulses: z.array(impulseRowSchema),
  focusSessions: z.array(focusSessionRowSchema),
});

export const aiWeeklyOutputSchema = z.object({
  patterns: z.array(z.string()),
  triggers: z.array(z.string()),
  adjustments: z.array(z.string()),
  wins: z.array(z.string()),
  weekSummary: z.string(),
});

// Microcopy
export const aiMicrocopyInputSchema = z.object({
  context: z.enum([
    "greeting",
    "checkin_complete",
    "impulse_resisted",
    "impulse_gave_in",
    "habit_minimum",
    "return_after_absence",
    "rescue_mode",
  ]),
  userData: z
    .object({
      name: z.string().optional(),
      mood: z.number().optional(),
      energy: z.number().optional(),
    })
    .optional(),
});

export const aiMicrocopyOutputSchema = z.object({
  message: z.string(),
  tone: z.enum(["gentle", "grounding", "validating", "encouraging"]),
});

// --------------- Inferred types ---------------

export type CheckInInput = z.infer<typeof checkInSchema>;
export type IdentityInput = z.infer<typeof identitySchema>;
export type HabitInput = z.infer<typeof habitSchema>;
export type HabitLogInput = z.infer<typeof habitLogSchema>;
export type DayPriorityInput = z.infer<typeof dayPrioritySchema>;
export type FocusSessionInput = z.infer<typeof focusSessionSchema>;
export type ImpulseInput = z.infer<typeof impulseSchema>;
export type WeeklyReviewInput = z.infer<typeof weeklyReviewSchema>;

export type AIDayAdjustInputZ = z.infer<typeof aiDayAdjustInputSchema>;
export type AIDayAdjustOutputZ = z.infer<typeof aiDayAdjustOutputSchema>;
export type AIImpulseInputZ = z.infer<typeof aiImpulseInputSchema>;
export type AIImpulseOutputZ = z.infer<typeof aiImpulseOutputSchema>;
export type AIWeeklyInputZ = z.infer<typeof aiWeeklyInputSchema>;
export type AIWeeklyOutputZ = z.infer<typeof aiWeeklyOutputSchema>;
export type AIMicrocopyInputZ = z.infer<typeof aiMicrocopyInputSchema>;
export type AIMicrocopyOutputZ = z.infer<typeof aiMicrocopyOutputSchema>;

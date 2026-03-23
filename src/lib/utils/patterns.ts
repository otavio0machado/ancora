// ============================================================
// Pattern Detection Engine for Ancora
// Pure client-side analysis - works WITHOUT AI
// ============================================================

import {
  parseISO,
  getDay,
  getHours,
  differenceInDays,
  subDays,
  startOfWeek,
  format,
  isWithinInterval,
} from "date-fns";
import type { CheckIn, Impulse, HabitLog, TechniqueLog } from "@/types/database";

// --------------- Helper types ---------------

export type TimePattern = {
  description: string;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  hourRange: string; // e.g. "22:00-02:00"
  count: number;
  percentage: number; // of total impulses
};

export type DayPattern = {
  description: string;
  dayOfWeek: string; // e.g. "Monday"
  dayIndex: number; // 0-6
  count: number;
  percentage: number;
};

export type TriggerCorrelation = {
  trigger: string;
  associatedImpulseTypes: string[];
  totalCount: number;
  resistedCount: number;
  resistanceRate: number; // 0-1
};

export type EmotionalCycle = {
  pattern: string;
  insight: string;
  dataPoints: number;
};

export type TechniqueStats = {
  technique: string;
  timesUsed: number;
  avgEffectiveness: number;
  bestContext: "impulse" | "rescue" | "proactive" | null;
  avgDurationSeconds: number | null;
};

export type SubstitutionPattern = {
  from: string;
  to: string;
  occurrences: number;
  timeframeDays: number;
  description: string;
};

export type OverloadRisk = {
  risk: "low" | "medium" | "high" | "critical";
  message: string;
  autoReduce: boolean;
  suggestedMaxTasks: number;
};

export type ResistanceRate = {
  rate: number;
  trend: "improving" | "stable" | "declining";
  byType: Record<string, number>;
};

export type RiskWindow = {
  description: string;
  dayOfWeek: string | null;
  timeOfDay: string | null;
  severity: "low" | "medium" | "high";
  impulseCount: number;
};

// --------------- Day name helper ---------------

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getTimeOfDay(hour: number): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 22) return "evening";
  return "night";
}

function getTimeOfDayLabel(tod: "morning" | "afternoon" | "evening" | "night"): string {
  switch (tod) {
    case "morning":
      return "Morning (5h-12h)";
    case "afternoon":
      return "Afternoon (12h-18h)";
    case "evening":
      return "Evening (18h-22h)";
    case "night":
      return "Night (22h-5h)";
  }
}

function getTimeOfDayRange(tod: "morning" | "afternoon" | "evening" | "night"): string {
  switch (tod) {
    case "morning":
      return "05:00-12:00";
    case "afternoon":
      return "12:00-18:00";
    case "evening":
      return "18:00-22:00";
    case "night":
      return "22:00-05:00";
  }
}

// --------------- Detection Functions ---------------

/**
 * Detect time-of-day patterns for impulses.
 * Groups impulses by morning/afternoon/evening/night and returns
 * patterns sorted by frequency (most common first).
 */
export function detectTimePatterns(impulses: Impulse[]): TimePattern[] {
  if (impulses.length === 0) return [];

  const buckets: Record<string, number> = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  for (const impulse of impulses) {
    const hour = getHours(parseISO(impulse.created_at));
    const tod = getTimeOfDay(hour);
    buckets[tod]++;
  }

  const total = impulses.length;

  return (Object.entries(buckets) as Array<[string, number]>)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([tod, count]) => {
      const typedTod = tod as "morning" | "afternoon" | "evening" | "night";
      const pct = Math.round((count / total) * 100);
      return {
        description: `${pct}% of impulses happen during ${getTimeOfDayLabel(typedTod)}`,
        timeOfDay: typedTod,
        hourRange: getTimeOfDayRange(typedTod),
        count,
        percentage: pct,
      };
    });
}

/**
 * Detect day-of-week patterns for impulses.
 * Returns days with above-average impulse counts, sorted by frequency.
 */
export function detectDayPatterns(impulses: Impulse[]): DayPattern[] {
  if (impulses.length === 0) return [];

  const dayCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

  for (const impulse of impulses) {
    const dayIdx = getDay(parseISO(impulse.created_at));
    dayCounts[dayIdx]++;
  }

  const total = impulses.length;

  return dayCounts
    .map((count, idx) => ({
      description: `${DAY_NAMES[idx]}: ${count} impulse${count !== 1 ? "s" : ""} (${Math.round((count / total) * 100)}%)`,
      dayOfWeek: DAY_NAMES[idx],
      dayIndex: idx,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);
}

/**
 * Detect trigger correlations: which triggers are most common,
 * and what is the resistance rate for each.
 */
export function detectTriggerCorrelations(impulses: Impulse[]): TriggerCorrelation[] {
  if (impulses.length === 0) return [];

  const triggerMap = new Map<
    string,
    { types: Set<string>; total: number; resisted: number }
  >();

  for (const impulse of impulses) {
    const trigger = impulse.trigger?.trim();
    if (!trigger) continue;

    const existing = triggerMap.get(trigger);
    if (existing) {
      existing.types.add(impulse.type);
      existing.total++;
      if (impulse.resisted) existing.resisted++;
    } else {
      triggerMap.set(trigger, {
        types: new Set([impulse.type]),
        total: 1,
        resisted: impulse.resisted ? 1 : 0,
      });
    }
  }

  return Array.from(triggerMap.entries())
    .map(([trigger, data]) => ({
      trigger,
      associatedImpulseTypes: Array.from(data.types),
      totalCount: data.total,
      resistedCount: data.resisted,
      resistanceRate: data.total > 0 ? data.resisted / data.total : 0,
    }))
    .sort((a, b) => b.totalCount - a.totalCount);
}

/**
 * Detect emotional cycles from check-ins.
 * Looks for repeating patterns in mood/energy/anxiety over time.
 */
export function detectEmotionalCycles(checkIns: CheckIn[]): EmotionalCycle[] {
  if (checkIns.length < 3) return [];

  const sorted = [...checkIns].sort(
    (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );

  const cycles: EmotionalCycle[] = [];

  // Detect mood drops followed by anxiety spikes
  let moodDropAnxietySpike = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.mood < prev.mood && curr.anxiety > prev.anxiety) {
      moodDropAnxietySpike++;
    }
  }
  if (moodDropAnxietySpike >= 2) {
    cycles.push({
      pattern: "Mood drops correlate with anxiety spikes",
      insight:
        "When your mood decreases, anxiety tends to rise. This is a common cycle - recognizing it is the first step to breaking it.",
      dataPoints: moodDropAnxietySpike,
    });
  }

  // Detect low energy preceding high impulsivity
  let lowEnergyHighImpulse = 0;
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (prev.energy <= 2 && curr.impulsivity >= 4) {
      lowEnergyHighImpulse++;
    }
  }
  if (lowEnergyHighImpulse >= 2) {
    cycles.push({
      pattern: "Low energy days are followed by high impulsivity",
      insight:
        "When energy drops, impulsivity tends to spike the next day. Prioritize rest on low-energy days to prevent this cycle.",
      dataPoints: lowEnergyHighImpulse,
    });
  }

  // Detect anxiety buildup (3+ consecutive days of rising anxiety)
  let anxietyBuildups = 0;
  let consecutiveRises = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].anxiety > sorted[i - 1].anxiety) {
      consecutiveRises++;
      if (consecutiveRises >= 2) {
        anxietyBuildups++;
        consecutiveRises = 0;
      }
    } else {
      consecutiveRises = 0;
    }
  }
  if (anxietyBuildups >= 1) {
    cycles.push({
      pattern: "Anxiety tends to build over multiple consecutive days",
      insight:
        "Your anxiety accumulates gradually. Intervening early with grounding techniques can prevent the buildup from reaching critical levels.",
      dataPoints: anxietyBuildups,
    });
  }

  // Detect weekend vs weekday differences
  const weekdayCheckins = sorted.filter((c) => {
    const day = getDay(parseISO(c.date));
    return day >= 1 && day <= 5;
  });
  const weekendCheckins = sorted.filter((c) => {
    const day = getDay(parseISO(c.date));
    return day === 0 || day === 6;
  });

  if (weekdayCheckins.length >= 3 && weekendCheckins.length >= 2) {
    const avgWeekdayMood =
      weekdayCheckins.reduce((s, c) => s + c.mood, 0) / weekdayCheckins.length;
    const avgWeekendMood =
      weekendCheckins.reduce((s, c) => s + c.mood, 0) / weekendCheckins.length;
    const diff = Math.abs(avgWeekdayMood - avgWeekendMood);

    if (diff >= 0.8) {
      const better = avgWeekendMood > avgWeekdayMood ? "weekends" : "weekdays";
      const worse = better === "weekends" ? "weekdays" : "weekends";
      cycles.push({
        pattern: `Mood is noticeably ${better === "weekends" ? "higher" : "lower"} on weekends`,
        insight: `Your mood tends to be better on ${better}. Consider what makes ${better} different and how to bring some of that into ${worse}.`,
        dataPoints: weekdayCheckins.length + weekendCheckins.length,
      });
    }
  }

  return cycles;
}

/**
 * Calculate technique effectiveness from technique logs.
 */
export function calculateTechniqueEffectiveness(
  logs: TechniqueLog[]
): TechniqueStats[] {
  if (logs.length === 0) return [];

  const techniqueMap = new Map<
    string,
    {
      totalEffectiveness: number;
      effectivenessCount: number;
      totalDuration: number;
      durationCount: number;
      contextCounts: Record<string, number>;
      total: number;
    }
  >();

  for (const log of logs) {
    const key = log.technique;
    const existing = techniqueMap.get(key) ?? {
      totalEffectiveness: 0,
      effectivenessCount: 0,
      totalDuration: 0,
      durationCount: 0,
      contextCounts: {} as Record<string, number>,
      total: 0,
    };

    existing.total++;

    if (log.effectiveness != null) {
      existing.totalEffectiveness += log.effectiveness;
      existing.effectivenessCount++;
    }

    if (log.duration_seconds != null) {
      existing.totalDuration += log.duration_seconds;
      existing.durationCount++;
    }

    existing.contextCounts[log.context] =
      (existing.contextCounts[log.context] ?? 0) + 1;

    techniqueMap.set(key, existing);
  }

  return Array.from(techniqueMap.entries())
    .map(([technique, data]) => {
      // Find the most common context
      let bestContext: "impulse" | "rescue" | "proactive" | null = null;
      let maxContextCount = 0;
      for (const [ctx, count] of Object.entries(data.contextCounts)) {
        if (count > maxContextCount) {
          maxContextCount = count;
          bestContext = ctx as "impulse" | "rescue" | "proactive";
        }
      }

      return {
        technique,
        timesUsed: data.total,
        avgEffectiveness:
          data.effectivenessCount > 0
            ? Math.round((data.totalEffectiveness / data.effectivenessCount) * 10) / 10
            : 0,
        bestContext,
        avgDurationSeconds:
          data.durationCount > 0
            ? Math.round(data.totalDuration / data.durationCount)
            : null,
      };
    })
    .sort((a, b) => b.avgEffectiveness - a.avgEffectiveness);
}

/**
 * Detect impulse substitution patterns.
 * Looks for cases where one impulse type decreases while another increases.
 */
export function detectImpulseSubstitution(
  impulses: Impulse[]
): SubstitutionPattern[] {
  if (impulses.length < 4) return [];

  const sorted = [...impulses].sort(
    (a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
  );

  if (sorted.length === 0) return [];

  const firstDate = parseISO(sorted[0].created_at);
  const lastDate = parseISO(sorted[sorted.length - 1].created_at);
  const totalDays = differenceInDays(lastDate, firstDate) + 1;

  if (totalDays < 7) return [];

  const midpoint = new Date(
    firstDate.getTime() + (lastDate.getTime() - firstDate.getTime()) / 2
  );

  // Count types in first half vs second half
  const firstHalf: Record<string, number> = {};
  const secondHalf: Record<string, number> = {};

  for (const impulse of sorted) {
    const d = parseISO(impulse.created_at);
    if (d.getTime() <= midpoint.getTime()) {
      firstHalf[impulse.type] = (firstHalf[impulse.type] ?? 0) + 1;
    } else {
      secondHalf[impulse.type] = (secondHalf[impulse.type] ?? 0) + 1;
    }
  }

  const allTypes = new Set([
    ...Object.keys(firstHalf),
    ...Object.keys(secondHalf),
  ]);

  const patterns: SubstitutionPattern[] = [];

  // Look for types that decreased paired with types that increased
  const decreased: Array<{ type: string; diff: number }> = [];
  const increased: Array<{ type: string; diff: number }> = [];

  for (const type of allTypes) {
    const before = firstHalf[type] ?? 0;
    const after = secondHalf[type] ?? 0;
    if (after < before && before >= 2) {
      decreased.push({ type, diff: before - after });
    } else if (after > before && after >= 2) {
      increased.push({ type, diff: after - before });
    }
  }

  for (const dec of decreased) {
    for (const inc of increased) {
      patterns.push({
        from: dec.type,
        to: inc.type,
        occurrences: inc.diff,
        timeframeDays: totalDays,
        description: `"${dec.type}" impulses decreased while "${inc.type}" impulses increased over ${totalDays} days. Possible substitution pattern.`,
      });
    }
  }

  return patterns;
}

/**
 * Calculate identity strength from habit logs.
 * Returns a score 0-100 based on the ratio of ideal/minimum completions
 * versus total expected habits.
 */
export function calculateIdentityStrength(
  habitLogs: HabitLog[],
  totalHabits: number
): number {
  if (totalHabits === 0 || habitLogs.length === 0) return 0;

  // Only consider last 30 days
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const recentLogs = habitLogs.filter((log) =>
    isWithinInterval(parseISO(log.date), { start: thirtyDaysAgo, end: now })
  );

  if (recentLogs.length === 0) return 0;

  // Score: ideal = 1.0, minimum = 0.6, skipped = 0
  let totalScore = 0;
  for (const log of recentLogs) {
    if (log.version === "ideal") totalScore += 1.0;
    else if (log.version === "minimum") totalScore += 0.6;
    // skipped = 0
  }

  // Max possible: totalHabits * 30 days
  const maxPossible = totalHabits * 30;
  const raw = (totalScore / maxPossible) * 100;

  return Math.round(Math.min(100, Math.max(0, raw)));
}

/**
 * Detect overload risk from a check-in's state values.
 * Returns risk level, message, whether auto-reduce should trigger,
 * and suggested max tasks.
 */
export function detectOverloadRisk(checkIn: {
  energy: number;
  anxiety: number;
  impulsivity: number;
  focus: number;
}): OverloadRisk {
  const { energy, anxiety, impulsivity, focus } = checkIn;

  // Critical: anxiety >= 4 AND impulsivity >= 4 AND energy <= 2
  if (anxiety >= 4 && impulsivity >= 4 && energy <= 2) {
    return {
      risk: "critical",
      message:
        "Your system is overwhelmed. This is not the time to push through. Activate rescue mode and focus only on self-care.",
      autoReduce: true,
      suggestedMaxTasks: 0,
    };
  }

  // High: anxiety >= 4 AND (impulsivity >= 3 OR energy <= 2)
  if (anxiety >= 4 && (impulsivity >= 3 || energy <= 2)) {
    return {
      risk: "high",
      message:
        "High overload detected. Reduce demands to the bare minimum. One small thing is enough today.",
      autoReduce: true,
      suggestedMaxTasks: 1,
    };
  }

  // Medium: anxiety >= 3 AND impulsivity >= 3
  if (anxiety >= 3 && impulsivity >= 3) {
    return {
      risk: "medium",
      message:
        "Moderate overload. Keep it simple today - focus on minimum versions and be gentle with yourself.",
      autoReduce: false,
      suggestedMaxTasks: 2,
    };
  }

  // Low: everything else
  return {
    risk: "low",
    message:
      "Your system is within a manageable range. You can engage with your full plan if it feels right.",
    autoReduce: false,
    suggestedMaxTasks: 3,
  };
}

/**
 * Calculate resistance rate over time.
 * Returns overall rate, trend (improving/stable/declining), and by-type breakdown.
 */
export function calculateResistanceRate(
  impulses: Impulse[],
  period: "week" | "month"
): ResistanceRate {
  if (impulses.length === 0) {
    return { rate: 0, trend: "stable", byType: {} };
  }

  const now = new Date();
  const cutoff = period === "week" ? subDays(now, 7) : subDays(now, 30);

  const recent = impulses.filter((i) =>
    isWithinInterval(parseISO(i.created_at), { start: cutoff, end: now })
  );

  if (recent.length === 0) {
    return { rate: 0, trend: "stable", byType: {} };
  }

  // Overall rate
  const resisted = recent.filter((i) => i.resisted).length;
  const rate = resisted / recent.length;

  // By type
  const byType: Record<string, number> = {};
  const typeCounters: Record<string, { resisted: number; total: number }> = {};

  for (const impulse of recent) {
    const existing = typeCounters[impulse.type] ?? { resisted: 0, total: 0 };
    existing.total++;
    if (impulse.resisted) existing.resisted++;
    typeCounters[impulse.type] = existing;
  }

  for (const [type, data] of Object.entries(typeCounters)) {
    byType[type] = data.total > 0 ? Math.round((data.resisted / data.total) * 100) / 100 : 0;
  }

  // Trend: compare first half vs second half
  const sorted = [...recent].sort(
    (a, b) => parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
  );

  let trend: "improving" | "stable" | "declining" = "stable";

  if (sorted.length >= 4) {
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, mid);
    const secondHalf = sorted.slice(mid);

    const firstRate =
      firstHalf.filter((i) => i.resisted).length / firstHalf.length;
    const secondRate =
      secondHalf.filter((i) => i.resisted).length / secondHalf.length;

    const diff = secondRate - firstRate;

    if (diff > 0.1) trend = "improving";
    else if (diff < -0.1) trend = "declining";
  }

  return {
    rate: Math.round(rate * 100) / 100,
    trend,
    byType,
  };
}

/**
 * Generate risk windows: time/day combinations where the user
 * is most likely to experience impulses.
 */
export function generateRiskWindows(
  impulses: Impulse[],
  checkIns: CheckIn[]
): RiskWindow[] {
  if (impulses.length < 3) return [];

  // Build a grid: day x timeOfDay -> impulse count
  const grid: Record<string, Record<string, number>> = {};
  const timeSlots = ["morning", "afternoon", "evening", "night"] as const;

  for (const day of DAY_NAMES) {
    grid[day] = {};
    for (const slot of timeSlots) {
      grid[day][slot] = 0;
    }
  }

  for (const impulse of impulses) {
    const date = parseISO(impulse.created_at);
    const day = DAY_NAMES[getDay(date)];
    const tod = getTimeOfDay(getHours(date));
    grid[day][tod]++;
  }

  // Build average check-in anxiety by day for severity weighting
  const dayAnxiety: Record<string, { sum: number; count: number }> = {};
  for (const ci of checkIns) {
    const day = DAY_NAMES[getDay(parseISO(ci.date))];
    const existing = dayAnxiety[day] ?? { sum: 0, count: 0 };
    existing.sum += ci.anxiety;
    existing.count++;
    dayAnxiety[day] = existing;
  }

  // Find cells with above-average counts
  const allCounts: number[] = [];
  for (const day of DAY_NAMES) {
    for (const slot of timeSlots) {
      allCounts.push(grid[day][slot]);
    }
  }

  const avg = allCounts.reduce((s, c) => s + c, 0) / allCounts.length;

  const windows: RiskWindow[] = [];

  for (const day of DAY_NAMES) {
    for (const slot of timeSlots) {
      const count = grid[day][slot];
      if (count <= avg || count < 2) continue;

      const avgAnxiety =
        dayAnxiety[day] && dayAnxiety[day].count > 0
          ? dayAnxiety[day].sum / dayAnxiety[day].count
          : 3;

      // Determine severity based on count relative to average and anxiety
      let severity: "low" | "medium" | "high" = "low";
      if (count >= avg * 2 && avgAnxiety >= 3.5) {
        severity = "high";
      } else if (count >= avg * 1.5 || avgAnxiety >= 3) {
        severity = "medium";
      }

      windows.push({
        description: `${day} ${getTimeOfDayLabel(slot)}: ${count} impulse${count !== 1 ? "s" : ""} recorded`,
        dayOfWeek: day,
        timeOfDay: getTimeOfDayLabel(slot),
        severity,
        impulseCount: count,
      });
    }
  }

  return windows.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return (
      severityOrder[a.severity] - severityOrder[b.severity] ||
      b.impulseCount - a.impulseCount
    );
  });
}

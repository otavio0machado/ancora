// ============================================================
// AI Service for Ancora
// Orchestrates AI calls with validation and fallbacks
// AI is a COPILOT - app works completely without it
// Chain: AI call -> JSON parse -> Zod validation -> fallback
// NEVER throws - always returns a valid response
// ============================================================

import type {
  AIDayAdjustInput,
  AIDayAdjustOutput,
  AIImpulseInput,
  AIImpulseOutput,
  AIWeeklyInput,
  AIWeeklyOutput,
  AIMicrocopyInput,
  AIMicrocopyOutput,
  AIPatternInput,
  AIPatternOutput,
  AIRecoveryInput,
  AIRecoveryOutput,
} from "@/types/ai";

import {
  aiDayAdjustOutputSchema,
  aiImpulseOutputSchema,
  aiWeeklyOutputSchema,
  aiMicrocopyOutputSchema,
  aiPatternOutputSchema,
  aiRecoveryOutputSchema,
} from "@/lib/schemas";

import { type AIProvider, GeminiProvider } from "./provider";
import {
  DAY_ADJUST_PROMPT,
  IMPULSE_PROTOCOL_PROMPT,
  WEEKLY_REFLECTION_PROMPT,
  MICROCOPY_PROMPT,
  PATTERN_ANALYSIS_PROMPT,
  RECOVERY_PROMPT,
} from "./prompts";
import {
  getFallbackDayAdjust,
  getFallbackImpulseProtocol,
  getFallbackMicrocopy,
  getFallbackRecovery,
  FALLBACK_PATTERN_ANALYSIS,
} from "./fallbacks";

// --------------- AI Service ---------------

class AIService {
  private provider: AIProvider | null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.provider = apiKey ? new GeminiProvider(apiKey) : null;

    if (!this.provider) {
      console.warn(
        "[Ancora AI] No GEMINI_API_KEY found. AI features will use local fallbacks."
      );
    }
  }

  // =====================================================================
  //  Day Adjustment
  //  Considers sleep, habits, values, risk prediction
  // =====================================================================

  async adjustDay(input: AIDayAdjustInput): Promise<AIDayAdjustOutput> {
    const fallback = getFallbackDayAdjust(input.checkIn);

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildDayAdjustPrompt(input);
      const raw = await this.provider.generate(prompt, DAY_ADJUST_PROMPT);
      const parsed = JSON.parse(raw);
      const validated = aiDayAdjustOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Day adjust output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIDayAdjustOutput;
    } catch (error) {
      console.error("[Ancora AI] Day adjust failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Impulse Protocol
  //  With defusion, values, alternatives, success probability
  // =====================================================================

  async impulseProtocol(input: AIImpulseInput): Promise<AIImpulseOutput> {
    const fallback = getFallbackImpulseProtocol(
      input.impulse.type,
      input.impulse.intensity
    );

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildImpulsePrompt(input);
      const raw = await this.provider.generate(prompt, IMPULSE_PROTOCOL_PROMPT);
      const parsed = JSON.parse(raw);
      const validated = aiImpulseOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Impulse protocol output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIImpulseOutput;
    } catch (error) {
      console.error("[Ancora AI] Impulse protocol failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Weekly Reflection
  //  With technique effectiveness, substitution detection, trajectory
  // =====================================================================

  async weeklyReflection(input: AIWeeklyInput): Promise<AIWeeklyOutput> {
    const fallback: AIWeeklyOutput = {
      patterns: [
        "Sem dados suficientes para análise de IA esta semana.",
      ],
      triggers: [],
      adjustments: [
        "Continue registrando check-ins e impulsos para que a análise semanal fique mais precisa.",
      ],
      wins: [
        "Você completou mais uma semana de registro. Consistência importa.",
      ],
      weekSummary:
        "Semana registrada. Cada semana de dados melhora o autoconhecimento. Continue observando sem julgar.",
      techniqueEffectiveness: undefined,
      substitutionAlert: undefined,
      trajectoryInsight: undefined,
      valueAlignment: undefined,
    };

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildWeeklyPrompt(input);
      const raw = await this.provider.generate(
        prompt,
        WEEKLY_REFLECTION_PROMPT
      );
      const parsed = JSON.parse(raw);
      const validated = aiWeeklyOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Weekly reflection output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIWeeklyOutput;
    } catch (error) {
      console.error("[Ancora AI] Weekly reflection failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Microcopy
  //  All contexts including new ones (recovery_start, overload, etc.)
  // =====================================================================

  async microcopy(input: AIMicrocopyInput): Promise<AIMicrocopyOutput> {
    const fallback = getFallbackMicrocopy(input.context);

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildMicrocopyPrompt(input);
      const raw = await this.provider.generate(prompt, MICROCOPY_PROMPT);
      const parsed = JSON.parse(raw);
      const validated = aiMicrocopyOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Microcopy output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIMicrocopyOutput;
    } catch (error) {
      console.error("[Ancora AI] Microcopy failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Pattern Analysis (NEW)
  //  Deep behavioral pattern detection over time
  // =====================================================================

  async analyzePatterns(input: AIPatternInput): Promise<AIPatternOutput> {
    const fallback = FALLBACK_PATTERN_ANALYSIS;

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildPatternAnalysisPrompt(input);
      const raw = await this.provider.generate(prompt, PATTERN_ANALYSIS_PROMPT);
      const parsed = JSON.parse(raw);
      const validated = aiPatternOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Pattern analysis output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIPatternOutput;
    } catch (error) {
      console.error("[Ancora AI] Pattern analysis failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Recovery Guidance (NEW)
  //  Compassionate support after relapse
  // =====================================================================

  async recoveryGuidance(input: AIRecoveryInput): Promise<AIRecoveryOutput> {
    const fallback = getFallbackRecovery(input.impulseType);

    if (!this.provider) {
      return fallback;
    }

    try {
      const prompt = this.buildRecoveryPrompt(input);
      const raw = await this.provider.generate(prompt, RECOVERY_PROMPT);
      const parsed = JSON.parse(raw);
      const validated = aiRecoveryOutputSchema.safeParse(parsed);

      if (!validated.success) {
        console.error(
          "[Ancora AI] Recovery guidance output validation failed:",
          validated.error
        );
        return fallback;
      }

      return validated.data as AIRecoveryOutput;
    } catch (error) {
      console.error("[Ancora AI] Recovery guidance failed:", error);
      return fallback;
    }
  }

  // =====================================================================
  //  Prompt Builders
  //  Minimize context sent to AI - only send what's needed
  // =====================================================================

  private buildDayAdjustPrompt(input: AIDayAdjustInput): string {
    const { checkIn, priorities, recentHabitLogs, userValues, habits } = input;

    const parts: string[] = [
      `Estado atual do usuário:`,
      `- Energia: ${checkIn.energy}/5`,
      `- Humor: ${checkIn.mood}/5`,
      `- Ansiedade: ${checkIn.anxiety}/5`,
      `- Foco: ${checkIn.focus}/5`,
      `- Impulsividade: ${checkIn.impulsivity}/5`,
    ];

    // Sleep data (critical for day planning)
    if (checkIn.sleep_quality !== null && checkIn.sleep_quality !== undefined) {
      parts.push(`- Qualidade do sono: ${checkIn.sleep_quality}/5`);
    }
    if (checkIn.sleep_hours !== null && checkIn.sleep_hours !== undefined) {
      parts.push(`- Horas de sono: ${checkIn.sleep_hours}h`);
    }

    if (checkIn.notes) {
      parts.push(`- Observações: "${checkIn.notes}"`);
    }

    // User values (ACT connection)
    if (userValues && userValues.length > 0) {
      parts.push(`\nValores do usuário (ACT): ${userValues.join(", ")}`);
    }

    if (priorities.length > 0) {
      parts.push(
        `\nPrioridades do dia: ${priorities.map((p) => p.text).join(", ")}`
      );
    }

    // Habits with names for skip suggestions
    if (habits && habits.length > 0) {
      parts.push(`\nHábitos configurados:`);
      habits.forEach((h) => {
        parts.push(`  - ${h.name} (ideal: ${h.ideal_version} | mínimo: ${h.minimum_version})`);
      });
    }

    if (recentHabitLogs.length > 0) {
      const ideal = recentHabitLogs.filter((l) => l.version === "ideal").length;
      const minimum = recentHabitLogs.filter((l) => l.version === "minimum").length;
      const skipped = recentHabitLogs.filter((l) => l.version === "skipped").length;
      parts.push(
        `\nÚltimos logs de hábitos (7 dias): ${ideal} ideal, ${minimum} mínimo, ${skipped} pulados`
      );
    }

    return parts.join("\n");
  }

  private buildImpulsePrompt(input: AIImpulseInput): string {
    const { impulse, recentImpulses, userValues } = input;

    const parts: string[] = [
      `Impulso atual:`,
      `- Tipo: ${impulse.type}`,
      `- Intensidade: ${impulse.intensity}/10`,
    ];

    if (impulse.trigger) {
      parts.push(`- Gatilho: "${impulse.trigger}"`);
    }
    if (impulse.context) {
      parts.push(`- Contexto: "${impulse.context}"`);
    }
    if (impulse.emotion_before) {
      parts.push(`- Emoção antes: "${impulse.emotion_before}"`);
    }

    // User values for ACT connection
    if (userValues && userValues.length > 0) {
      parts.push(`\nValores do usuário (ACT): ${userValues.join(", ")}`);
    }

    if (recentImpulses.length > 0) {
      // Calculate resistance stats for success probability
      const sameType = recentImpulses.filter((i) => i.type === impulse.type);
      const resistedSameType = sameType.filter((i) => i.resisted).length;
      const totalSameType = sameType.length;

      parts.push(`\nImpulsos recentes (últimos 7 dias):`);
      parts.push(
        `- Total: ${recentImpulses.length} impulsos, ${recentImpulses.filter((i) => i.resisted).length} resistidos`
      );

      if (totalSameType > 0) {
        parts.push(
          `- Mesmo tipo (${impulse.type}): ${totalSameType} impulsos, ${resistedSameType} resistidos (${Math.round((resistedSameType / totalSameType) * 100)}% de taxa de resistência)`
        );
      }

      // Show technique usage patterns
      const techniquesUsed = recentImpulses
        .filter((i) => i.technique_used)
        .map((i) => i.technique_used);
      if (techniquesUsed.length > 0) {
        parts.push(`- Técnicas usadas recentemente: ${[...new Set(techniquesUsed)].join(", ")}`);
      }

      // Recent impulse timeline
      recentImpulses.slice(0, 5).forEach((imp) => {
        parts.push(
          `  - ${imp.type} (intensidade ${imp.intensity}/10, ${imp.resisted ? "resistiu" : "cedeu"}${imp.technique_used ? `, técnica: ${imp.technique_used}` : ""}) em ${imp.created_at}`
        );
      });
    }

    return parts.join("\n");
  }

  private buildWeeklyPrompt(input: AIWeeklyInput): string {
    const { checkIns, habitLogs, impulses, focusSessions, userValues } = input;

    const parts: string[] = ["Dados da semana:\n"];

    // User values
    if (userValues && userValues.length > 0) {
      parts.push(`Valores do usuário (ACT): ${userValues.join(", ")}\n`);
    }

    // Check-ins summary with sleep
    if (checkIns.length > 0) {
      parts.push("Check-ins:");
      checkIns.forEach((ci) => {
        let line = `  ${ci.date}: energia=${ci.energy} humor=${ci.mood} ansiedade=${ci.anxiety} foco=${ci.focus} impulsividade=${ci.impulsivity}`;
        if (ci.sleep_quality !== null && ci.sleep_quality !== undefined) {
          line += ` sono_qualidade=${ci.sleep_quality}`;
        }
        if (ci.sleep_hours !== null && ci.sleep_hours !== undefined) {
          line += ` sono_horas=${ci.sleep_hours}`;
        }
        parts.push(line);
      });
    }

    // Habit logs summary
    if (habitLogs.length > 0) {
      const ideal = habitLogs.filter((l) => l.version === "ideal").length;
      const minimum = habitLogs.filter((l) => l.version === "minimum").length;
      const skipped = habitLogs.filter((l) => l.version === "skipped").length;
      parts.push(
        `\nHábitos: ${ideal} ideal, ${minimum} mínimo, ${skipped} pulados (total: ${habitLogs.length})`
      );
    }

    // Impulses detailed summary
    if (impulses.length > 0) {
      const resisted = impulses.filter((i) => i.resisted).length;
      const gave_in = impulses.length - resisted;
      parts.push(
        `\nImpulsos: ${impulses.length} total, ${resisted} resistidos, ${gave_in} cedidos`
      );
      const types = [...new Set(impulses.map((i) => i.type))];
      parts.push(`  Tipos: ${types.join(", ")}`);

      // Detect substitution patterns: did reducing one type lead to increase in another?
      const typeGroups: Record<string, { resisted: number; total: number }> = {};
      impulses.forEach((i) => {
        if (!typeGroups[i.type]) typeGroups[i.type] = { resisted: 0, total: 0 };
        typeGroups[i.type].total++;
        if (i.resisted) typeGroups[i.type].resisted++;
      });
      parts.push(`  Por tipo:`);
      Object.entries(typeGroups).forEach(([type, stats]) => {
        parts.push(
          `    ${type}: ${stats.total} impulsos, ${stats.resisted} resistidos`
        );
      });

      // Technique usage
      const techniques = impulses
        .filter((i) => i.technique_used)
        .map((i) => ({
          technique: i.technique_used,
          resisted: i.resisted,
          effectiveness: i.technique_effectiveness,
        }));
      if (techniques.length > 0) {
        parts.push(`  Técnicas usadas esta semana:`);
        const techMap: Record<string, { uses: number; successes: number; avgEff: number[] }> = {};
        techniques.forEach((t) => {
          const key = t.technique ?? "desconhecida";
          if (!techMap[key]) techMap[key] = { uses: 0, successes: 0, avgEff: [] };
          techMap[key].uses++;
          if (t.resisted) techMap[key].successes++;
          if (t.effectiveness !== null && t.effectiveness !== undefined) {
            techMap[key].avgEff.push(t.effectiveness);
          }
        });
        Object.entries(techMap).forEach(([tech, stats]) => {
          const effStr = stats.avgEff.length > 0
            ? `, eficácia média: ${(stats.avgEff.reduce((a, b) => a + b, 0) / stats.avgEff.length).toFixed(1)}/5`
            : "";
          parts.push(
            `    ${tech}: ${stats.uses} usos, ${stats.successes} sucessos${effStr}`
          );
        });
      }
    }

    // Focus sessions summary
    if (focusSessions.length > 0) {
      const completed = focusSessions.filter(
        (s) => s.status === "completed"
      ).length;
      const abandoned = focusSessions.filter(
        (s) => s.status === "abandoned"
      ).length;
      parts.push(
        `\nSessões de foco: ${focusSessions.length} total, ${completed} completadas, ${abandoned} abandonadas`
      );
    }

    return parts.join("\n");
  }

  private buildMicrocopyPrompt(input: AIMicrocopyInput): string {
    const parts: string[] = [`Contexto: ${input.context}`];

    if (input.userData?.name) {
      parts.push(`Nome do usuário: ${input.userData.name}`);
    }
    if (input.userData?.mood !== undefined) {
      parts.push(`Humor atual: ${input.userData.mood}/5`);
    }
    if (input.userData?.energy !== undefined) {
      parts.push(`Energia atual: ${input.userData.energy}/5`);
    }

    return parts.join("\n");
  }

  private buildPatternAnalysisPrompt(input: AIPatternInput): string {
    const { checkIns, impulses, habitLogs, techniqueLogs, userValues, timeframe } = input;

    const parts: string[] = [
      `Período de análise: ${timeframe === "week" ? "última semana" : "último mês"}`,
      `Total de dados: ${checkIns.length} check-ins, ${impulses.length} impulsos, ${habitLogs.length} logs de hábitos, ${techniqueLogs.length} logs de técnicas\n`,
    ];

    // User values
    if (userValues && userValues.length > 0) {
      parts.push(`Valores do usuário (ACT): ${userValues.join(", ")}\n`);
    }

    // Check-ins with full detail
    if (checkIns.length > 0) {
      parts.push("Check-ins:");
      checkIns.forEach((ci) => {
        let line = `  ${ci.date} (${ci.created_at}): energia=${ci.energy} humor=${ci.mood} ansiedade=${ci.anxiety} foco=${ci.focus} impulsividade=${ci.impulsivity}`;
        if (ci.sleep_quality !== null && ci.sleep_quality !== undefined) {
          line += ` sono_q=${ci.sleep_quality}`;
        }
        if (ci.sleep_hours !== null && ci.sleep_hours !== undefined) {
          line += ` sono_h=${ci.sleep_hours}`;
        }
        parts.push(line);
      });
    }

    // Impulses with full detail for pattern detection
    if (impulses.length > 0) {
      parts.push("\nImpulsos:");
      impulses.forEach((imp) => {
        let line = `  ${imp.created_at}: tipo=${imp.type} intensidade=${imp.intensity} ${imp.resisted ? "RESISTIU" : "CEDEU"}`;
        if (imp.trigger) line += ` gatilho="${imp.trigger}"`;
        if (imp.context) line += ` contexto="${imp.context}"`;
        if (imp.emotion_before) line += ` emoção="${imp.emotion_before}"`;
        if (imp.technique_used) line += ` técnica="${imp.technique_used}"`;
        if (imp.technique_effectiveness !== null && imp.technique_effectiveness !== undefined) {
          line += ` eficácia=${imp.technique_effectiveness}/5`;
        }
        parts.push(line);
      });
    }

    // Habit logs
    if (habitLogs.length > 0) {
      const ideal = habitLogs.filter((l) => l.version === "ideal").length;
      const minimum = habitLogs.filter((l) => l.version === "minimum").length;
      const skipped = habitLogs.filter((l) => l.version === "skipped").length;
      parts.push(
        `\nHábitos: ${ideal} ideal, ${minimum} mínimo, ${skipped} pulados`
      );

      // Per-day breakdown
      const byDate: Record<string, { ideal: number; minimum: number; skipped: number }> = {};
      habitLogs.forEach((l) => {
        if (!byDate[l.date]) byDate[l.date] = { ideal: 0, minimum: 0, skipped: 0 };
        byDate[l.date][l.version]++;
      });
      parts.push("  Por dia:");
      Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([date, counts]) => {
          parts.push(
            `    ${date}: ${counts.ideal}i ${counts.minimum}m ${counts.skipped}p`
          );
        });
    }

    // Technique logs
    if (techniqueLogs.length > 0) {
      parts.push("\nLogs de técnicas:");
      techniqueLogs.forEach((tl) => {
        let line = `  ${tl.created_at}: técnica="${tl.technique}" contexto=${tl.context}`;
        if (tl.effectiveness !== null && tl.effectiveness !== undefined) {
          line += ` eficácia=${tl.effectiveness}/5`;
        }
        if (tl.duration_seconds !== null && tl.duration_seconds !== undefined) {
          line += ` duração=${tl.duration_seconds}s`;
        }
        parts.push(line);
      });
    }

    return parts.join("\n");
  }

  private buildRecoveryPrompt(input: AIRecoveryInput): string {
    const parts: string[] = [
      `O usuário cedeu a um impulso e precisa de apoio para se recuperar.`,
      `\nTipo do impulso: ${input.impulseType}`,
    ];

    if (input.trigger) {
      parts.push(`Gatilho: "${input.trigger}"`);
    }
    if (input.context) {
      parts.push(`Contexto: "${input.context}"`);
    }
    if (input.emotionBefore) {
      parts.push(`Emoção antes: "${input.emotionBefore}"`);
    }
    if (input.emotionAfter) {
      parts.push(`Emoção depois: "${input.emotionAfter}"`);
    }

    // User values for ACT reconnection
    if (input.userValues && input.userValues.length > 0) {
      parts.push(`\nValores do usuário (ACT): ${input.userValues.join(", ")}`);
    }

    // Recent impulse history for context
    if (input.recentImpulses && input.recentImpulses.length > 0) {
      const sameType = input.recentImpulses.filter((i) => i.type === input.impulseType);
      const resistedCount = sameType.filter((i) => i.resisted).length;

      parts.push(`\nHistórico recente (mesmo tipo):`);
      parts.push(
        `- ${sameType.length} impulsos nos últimos 7 dias, ${resistedCount} resistidos`
      );

      if (resistedCount > 0) {
        parts.push(
          `- O usuário JÁ RESISTIU ${resistedCount} vezes recentemente - isso é importante para a mensagem de compaixão`
        );
      }
    }

    return parts.join("\n");
  }
}

// Singleton export
export const aiService = new AIService();

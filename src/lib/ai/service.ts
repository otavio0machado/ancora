// ============================================================
// AI Service for Ancora
// Orchestrates AI calls with validation and fallbacks
// AI is a COPILOT - app works completely without it
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
} from "@/types/ai";

import {
  aiDayAdjustOutputSchema,
  aiImpulseOutputSchema,
  aiWeeklyOutputSchema,
  aiMicrocopyOutputSchema,
} from "@/lib/schemas";

import { type AIProvider, GeminiProvider } from "./provider";
import {
  DAY_ADJUST_PROMPT,
  IMPULSE_PROTOCOL_PROMPT,
  WEEKLY_REFLECTION_PROMPT,
  MICROCOPY_PROMPT,
} from "./prompts";
import {
  getFallbackDayAdjust,
  getFallbackImpulseProtocol,
  getFallbackMicrocopy,
  FALLBACK_DAY_ADJUST,
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

  // --- Day Adjustment ---

  async adjustDay(input: AIDayAdjustInput): Promise<AIDayAdjustOutput> {
    // Always have a fallback ready based on check-in data
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

  // --- Impulse Protocol ---

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

  // --- Weekly Reflection ---

  async weeklyReflection(input: AIWeeklyInput): Promise<AIWeeklyOutput> {
    const fallback: AIWeeklyOutput = {
      patterns: [
        "Sem dados suficientes para analise de IA esta semana.",
      ],
      triggers: [],
      adjustments: [
        "Continue registrando check-ins e impulsos para que a analise semanal fique mais precisa.",
      ],
      wins: [
        "Voce completou mais uma semana de registro. Consistencia importa.",
      ],
      weekSummary:
        "Semana registrada. Cada semana de dados melhora o autoconhecimento. Continue observando sem julgar.",
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

  // --- Microcopy ---

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

  // --------------- Prompt Builders ---------------
  // Minimize context sent to AI - only send what's needed

  private buildDayAdjustPrompt(input: AIDayAdjustInput): string {
    const { checkIn, priorities, recentHabitLogs } = input;

    const parts: string[] = [
      `Estado atual do usuario:`,
      `- Energia: ${checkIn.energy}/5`,
      `- Humor: ${checkIn.mood}/5`,
      `- Ansiedade: ${checkIn.anxiety}/5`,
      `- Foco: ${checkIn.focus}/5`,
      `- Impulsividade: ${checkIn.impulsivity}/5`,
    ];

    if (checkIn.notes) {
      parts.push(`- Observacoes: "${checkIn.notes}"`);
    }

    if (priorities.length > 0) {
      parts.push(
        `\nPrioridades do dia: ${priorities.map((p) => p.text).join(", ")}`
      );
    }

    if (recentHabitLogs.length > 0) {
      const summary = recentHabitLogs
        .slice(0, 5)
        .map((log) => `${log.version}`)
        .join(", ");
      parts.push(
        `\nUltimos logs de habitos: ${summary}`
      );
    }

    return parts.join("\n");
  }

  private buildImpulsePrompt(input: AIImpulseInput): string {
    const { impulse, recentImpulses } = input;

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
      parts.push(`- Emocao antes: "${impulse.emotion_before}"`);
    }

    if (recentImpulses.length > 0) {
      parts.push(`\nImpulsos recentes (ultimos 7 dias):`);
      recentImpulses.slice(0, 10).forEach((imp) => {
        parts.push(
          `- ${imp.type} (intensidade ${imp.intensity}/10, ${imp.resisted ? "resistiu" : "cedeu"}) em ${imp.created_at}`
        );
      });
    }

    return parts.join("\n");
  }

  private buildWeeklyPrompt(input: AIWeeklyInput): string {
    const { checkIns, habitLogs, impulses, focusSessions } = input;

    const parts: string[] = ["Dados da semana:\n"];

    // Check-ins summary
    if (checkIns.length > 0) {
      parts.push("Check-ins:");
      checkIns.forEach((ci) => {
        parts.push(
          `  ${ci.date}: energia=${ci.energy} humor=${ci.mood} ansiedade=${ci.anxiety} foco=${ci.focus} impulsividade=${ci.impulsivity}`
        );
      });
    }

    // Habit logs summary
    if (habitLogs.length > 0) {
      const ideal = habitLogs.filter((l) => l.version === "ideal").length;
      const minimum = habitLogs.filter((l) => l.version === "minimum").length;
      const skipped = habitLogs.filter((l) => l.version === "skipped").length;
      parts.push(
        `\nHabitos: ${ideal} ideal, ${minimum} minimo, ${skipped} pulados`
      );
    }

    // Impulses summary
    if (impulses.length > 0) {
      const resisted = impulses.filter((i) => i.resisted).length;
      parts.push(
        `\nImpulsos: ${impulses.length} total, ${resisted} resistidos`
      );
      const types = [...new Set(impulses.map((i) => i.type))];
      parts.push(`  Tipos: ${types.join(", ")}`);
    }

    // Focus sessions summary
    if (focusSessions.length > 0) {
      const completed = focusSessions.filter(
        (s) => s.status === "completed"
      ).length;
      parts.push(
        `\nSessoes de foco: ${focusSessions.length} total, ${completed} completadas`
      );
    }

    return parts.join("\n");
  }

  private buildMicrocopyPrompt(input: AIMicrocopyInput): string {
    const parts: string[] = [`Contexto: ${input.context}`];

    if (input.userData?.name) {
      parts.push(`Nome do usuario: ${input.userData.name}`);
    }
    if (input.userData?.mood !== undefined) {
      parts.push(`Humor atual: ${input.userData.mood}/5`);
    }
    if (input.userData?.energy !== undefined) {
      parts.push(`Energia atual: ${input.userData.energy}/5`);
    }

    return parts.join("\n");
  }
}

// Singleton export
export const aiService = new AIService();

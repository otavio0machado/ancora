"use client";

import { useState, useCallback } from "react";
import { Zap, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ImpulseForm,
  type ImpulseFormData,
} from "@/components/impulsos/impulse-form";
import { ProtocolDisplay } from "@/components/impulsos/protocol-display";
import { ImpulseLog } from "@/components/impulsos/impulse-log";
import { Badge } from "@/components/ui/badge";
import { useImpulseStore } from "@/lib/stores/impulse-store";
import { getFallbackImpulseProtocol } from "@/lib/ai/fallbacks";
import type { AIImpulseOutput } from "@/types/ai";
import type { Impulse } from "@/types/database";

// --------------- View States ---------------

type PageView = "home" | "form" | "protocol";

// --------------- Page Component ---------------

export default function ImpulsosPage() {
  const [view, setView] = useState<PageView>("home");
  const [protocol, setProtocol] = useState<AIImpulseOutput | null>(null);
  const [pendingFormData, setPendingFormData] = useState<ImpulseFormData | null>(null);

  const {
    recentImpulses,
    setCurrentImpulse,
    addImpulse,
    isSubmitting,
  } = useImpulseStore();

  // Handle form submission -> trigger protocol
  const handleFormSubmit = useCallback(
    async (data: ImpulseFormData) => {
      // Store impulse data in Zustand (not yet saved to DB)
      setCurrentImpulse({
        type: data.type,
        intensity: data.intensity,
        trigger: data.trigger || undefined,
        context: data.context || undefined,
        emotion_before: data.emotion_before || undefined,
        resisted: false,
      });

      setPendingFormData(data);

      // Try AI first, fall back to local protocol
      let protocolResult: AIImpulseOutput;
      try {
        const response = await fetch("/api/ai/impulso", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            impulse: {
              type: data.type,
              intensity: data.intensity,
              trigger: data.trigger || null,
              context: data.context || null,
              emotion_before: data.emotion_before || null,
            },
            recentImpulses,
          }),
        });

        if (response.ok) {
          protocolResult = await response.json();
        } else {
          protocolResult = getFallbackImpulseProtocol(data.type, data.intensity);
        }
      } catch {
        protocolResult = getFallbackImpulseProtocol(data.type, data.intensity);
      }

      setProtocol(protocolResult);
      setView("protocol");
    },
    [recentImpulses, setCurrentImpulse]
  );

  // Handle protocol completion -> save impulse to DB
  const handleProtocolComplete = useCallback(
    async (resisted: boolean, notes: string, techniqueUsed?: string) => {
      setCurrentImpulse({
        resisted,
        notes: notes || undefined,
        technique_used: techniqueUsed ?? undefined,
      });

      await addImpulse();

      // Reset view
      setProtocol(null);
      setPendingFormData(null);
      setView("home");
    },
    [setCurrentImpulse, addImpulse]
  );

  // Compute pattern summary
  const patternSummary = computePatternSummary(recentImpulses);

  return (
    <div className="ancora-container py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Impulsos
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            Um espaco seguro para observar e responder a impulsos.
          </p>
        </div>

        {/* Active protocol area */}
        {view === "form" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap size={16} className="text-accent" strokeWidth={2} />
                Registrar impulso
              </CardTitle>
              <CardDescription>
                Nomeie o que esta sentindo. Sem pressa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImpulseForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3 text-text-muted"
                onClick={() => setView("home")}
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        )}

        {view === "protocol" && protocol && (
          <ProtocolDisplay
            protocol={protocol}
            onComplete={handleProtocolComplete}
            isSubmitting={isSubmitting}
          />
        )}

        {/* CTA button (home view) */}
        {view === "home" && (
          <Button
            size="lg"
            className="w-full"
            onClick={() => setView("form")}
          >
            <Plus size={18} strokeWidth={2} />
            Registrar impulso
          </Button>
        )}

        {/* Pattern summary */}
        {view === "home" && patternSummary.length > 0 && (
          <Card className="border-border-subtle">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm">Padroes recentes</CardTitle>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {patternSummary.map((pattern) => (
                  <div
                    key={pattern.type}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-text-secondary">
                      {pattern.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">
                        {pattern.count}x
                      </Badge>
                      {pattern.resistRate > 0 && (
                        <span className="text-xs text-text-muted">
                          {Math.round(pattern.resistRate)}% resistiu
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent impulse log */}
        {view === "home" && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-text-secondary">
              Registros recentes
            </h2>
            <ImpulseLog impulses={recentImpulses} />
          </div>
        )}
      </div>
    </div>
  );
}

// --------------- Helpers ---------------

const TYPE_LABELS: Record<Impulse["type"], string> = {
  smoking: "Cigarro",
  social_media: "Redes sociais",
  pornography: "Pornografia",
  binge_eating: "Compulsao alimentar",
  substance: "Substancia",
  other: "Outro",
};

interface PatternItem {
  type: Impulse["type"];
  label: string;
  count: number;
  resistRate: number;
}

function computePatternSummary(impulses: Impulse[]): PatternItem[] {
  if (impulses.length === 0) return [];

  const byType: Record<string, { count: number; resisted: number }> = {};

  for (const impulse of impulses) {
    if (!byType[impulse.type]) {
      byType[impulse.type] = { count: 0, resisted: 0 };
    }
    byType[impulse.type].count++;
    if (impulse.resisted) {
      byType[impulse.type].resisted++;
    }
  }

  return Object.entries(byType)
    .map(([type, { count, resisted }]) => ({
      type: type as Impulse["type"],
      label: TYPE_LABELS[type as Impulse["type"]] ?? type,
      count,
      resistRate: count > 0 ? (resisted / count) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

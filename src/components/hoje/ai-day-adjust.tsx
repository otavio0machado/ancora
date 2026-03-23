"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { getFallbackDayAdjust } from "@/lib/ai/fallbacks";
import type { AIDayAdjustOutput } from "@/types/ai";

// --------------- Component ---------------

export function AIDayAdjust() {
  const { todayCheckIn } = useCheckInStore();
  const [adjustment, setAdjustment] = useState<AIDayAdjustOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const fetchAdjustment = useCallback(async () => {
    if (!todayCheckIn) return;

    setIsLoading(true);
    setError(null);
    setIsVisible(true);

    try {
      const response = await fetch("/api/ai/ajuste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checkIn: todayCheckIn,
          priorities: [],
          recentHabitLogs: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel obter a sugestao");
      }

      const data: AIDayAdjustOutput = await response.json();
      setAdjustment(data);
    } catch {
      // Fallback to local content if API fails
      const fallback = getFallbackDayAdjust(todayCheckIn);
      setAdjustment(fallback);
      setError("Usando sugestao local (sem conexao com IA)");
    } finally {
      setIsLoading(false);
    }
  }, [todayCheckIn]);

  // Don't render until check-in is done
  if (!todayCheckIn) return null;

  // Button state - before fetching
  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={fetchAdjustment}
        className="w-full animate-fade-in"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
          />
        </svg>
        Ver sugestao do dia
      </Button>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
            <p className="text-sm text-text-muted">
              Analisando seu estado de hoje...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Result display
  if (!adjustment) return null;

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sugestao para hoje</CardTitle>
          {adjustment.overloadAlert && (
            <Badge variant="warning">Alerta</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {/* Overload alert */}
        {adjustment.overloadAlert && adjustment.overloadMessage && (
          <div
            className={cn(
              "rounded-xl px-4 py-3",
              "bg-warning-subtle border border-warning/20"
            )}
          >
            <p className="text-sm text-warning leading-relaxed">
              {adjustment.overloadMessage}
            </p>
          </div>
        )}

        {/* Suggested plan */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Plano sugerido
          </p>
          <p className="text-sm text-text-primary leading-relaxed">
            {adjustment.suggestedPlan}
          </p>
        </div>

        {/* Minimum version */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Versao minima
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            {adjustment.minimumVersion}
          </p>
        </div>

        {/* Encouragement */}
        <div
          className={cn(
            "rounded-xl px-4 py-3",
            "bg-accent-subtle border border-accent/10"
          )}
        >
          <p className="text-sm text-text-primary leading-relaxed italic">
            {adjustment.encouragement}
          </p>
        </div>

        {/* Error note (using local fallback) */}
        {error && (
          <p className="text-xs text-text-muted text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

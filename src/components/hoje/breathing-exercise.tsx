"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type Phase = "inhale" | "hold" | "exhale" | "idle";

interface BreathingExerciseProps {
  inhale?: number;
  hold?: number;
  exhale?: number;
  onClose?: () => void;
}

const PHASE_LABELS: Record<Phase, string> = {
  inhale: "Inspire",
  hold: "Segure",
  exhale: "Expire",
  idle: "Preparar",
};

export function BreathingExercise({
  inhale = 4,
  hold = 7,
  exhale = 8,
  onClose,
}: BreathingExerciseProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    cleanup();
    setIsRunning(false);
    setPhase("idle");
    setSecondsLeft(0);
  }, [cleanup]);

  const start = useCallback(() => {
    setCycles(0);
    setIsRunning(true);
    setPhase("inhale");
    setSecondsLeft(inhale);
  }, [inhale]);

  // Main timer loop
  useEffect(() => {
    if (!isRunning) return;

    cleanup();

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        setPhase((currentPhase) => {
          if (currentPhase === "inhale") {
            setSecondsLeft(hold);
            return "hold";
          }
          if (currentPhase === "hold") {
            setSecondsLeft(exhale);
            return "exhale";
          }
          // exhale -> inhale (new cycle)
          setCycles((c) => c + 1);
          setSecondsLeft(inhale);
          return "inhale";
        });

        return prev;
      });
    }, 1000);

    return cleanup;
  }, [isRunning, inhale, hold, exhale, cleanup]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const getCircleScale = () => {
    if (!isRunning || phase === "idle") return "scale-75";
    if (phase === "inhale") return "scale-100";
    if (phase === "hold") return "scale-100";
    return "scale-75";
  };

  const getCircleOpacity = () => {
    if (!isRunning || phase === "idle") return "opacity-40";
    if (phase === "hold") return "opacity-70";
    return "opacity-60";
  };

  const getPhaseDuration = () => {
    if (phase === "inhale") return inhale;
    if (phase === "hold") return hold;
    if (phase === "exhale") return exhale;
    return 0;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-6 p-6">
        <p className="text-sm text-text-secondary">
          Respiracao {inhale}-{hold}-{exhale}
        </p>

        {/* Animated circle */}
        <div className="relative flex items-center justify-center h-48 w-48">
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-accent-subtle border border-accent/20",
              "transition-all ease-in-out",
              getCircleScale(),
              getCircleOpacity()
            )}
            style={{
              transitionDuration: isRunning
                ? `${getPhaseDuration()}s`
                : "0.3s",
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-1">
            <span
              className={cn(
                "text-lg font-medium text-text-primary transition-opacity duration-300",
                !isRunning && "opacity-50"
              )}
            >
              {PHASE_LABELS[phase]}
            </span>
            {isRunning && phase !== "idle" && (
              <span className="text-3xl font-light text-accent tabular-nums animate-fade-in">
                {secondsLeft}
              </span>
            )}
          </div>
        </div>

        {/* Cycle counter */}
        {cycles > 0 && (
          <p className="text-xs text-text-muted animate-fade-in">
            {cycles} {cycles === 1 ? "ciclo completo" : "ciclos completos"}
          </p>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {isRunning ? (
            <Button variant="outline" size="md" onClick={stop}>
              Parar
            </Button>
          ) : (
            <Button variant="default" size="md" onClick={start}>
              {cycles > 0 ? "Reiniciar" : "Iniciar"}
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="md" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>

        {/* Technique info */}
        <p className="text-xs text-text-muted text-center max-w-[260px] leading-relaxed">
          Inspire pelo nariz, segure, expire pela boca lentamente. Foque apenas
          na respiracao.
        </p>
      </CardContent>
    </Card>
  );
}

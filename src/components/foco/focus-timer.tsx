"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Pause, Play, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface FocusTimerProps {
  objective: string;
  durationMinutes: number;
  onComplete: () => void;
  onAbandon: () => void;
}

export function FocusTimer({
  objective,
  durationMinutes,
  onComplete,
  onAbandon,
}: FocusTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    if (!isRunning || isFinished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isFinished]);

  // Auto-transition after completion (brief celebration moment)
  useEffect(() => {
    if (!isFinished) return;
    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);
    return () => clearTimeout(timeout);
  }, [isFinished, onComplete]);

  const togglePause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleAbandon = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onAbandon();
  }, [onAbandon]);

  // Format time
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  // Progress calculation
  const elapsed = totalSeconds - secondsLeft;
  const progressPercent = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  // SVG circle dimensions
  const size = 220;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (isFinished) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-success-subtle flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <p className="text-lg font-semibold text-text-primary">
            Sessão concluída
          </p>
          <p className="text-sm text-text-secondary mt-1">{objective}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center py-8">
        {/* Objective */}
        <p className="text-sm text-text-secondary mb-6 text-center max-w-xs">
          {objective}
        </p>

        {/* Circular timer */}
        <div className="relative mb-8">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--surface-sunken)"
              strokeWidth={strokeWidth}
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                "text-4xl font-light tracking-wider text-text-primary tabular-nums",
                !isRunning && "text-text-muted"
              )}
            >
              {timeDisplay}
            </span>
            {!isRunning && (
              <span className="text-xs text-text-muted mt-1">pausado</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAbandonConfirm(true)}
            className="text-text-muted hover:text-alert"
          >
            <X className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={togglePause}
            className="w-14 h-14 rounded-full p-0"
          >
            {isRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Spacer to center the play/pause button */}
          <div className="w-10" />
        </div>

        {/* Abandon confirmation */}
        {showAbandonConfirm && (
          <div className="mt-6 p-4 rounded-xl bg-surface-sunken border border-border-subtle text-center">
            <p className="text-sm text-text-secondary mb-3">
              Deseja abandonar esta sessão?
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAbandonConfirm(false)}
              >
                Continuar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleAbandon}
              >
                Abandonar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

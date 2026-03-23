"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DelayTimerProps {
  /** Duration in seconds (default 600 = 10 minutes) */
  duration?: number;
  onTimerEnd: () => void;
  onDismissEarly: () => void;
}

const MESSAGES = [
  "A maioria dos impulsos diminui em 10 minutos.",
  "Voce nao precisa decidir agora. Apenas espere.",
  "Observe o impulso como uma onda: ele sobe, atinge o pico e desce.",
  "Enquanto espera, respire devagar. O tempo esta ao seu lado.",
  "Cada segundo que passa, o impulso perde forca.",
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function DelayTimer({
  duration = 600,
  onTimerEnd,
  onDismissEarly,
}: DelayTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const [showConfirm, setShowConfirm] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progress = ((duration - secondsLeft) / duration) * 100;

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start the timer
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          cleanup();
          onTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return cleanup;
  }, [duration, onTimerEnd, cleanup]);

  // Rotate messages every 2 minutes
  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 120_000);

    return () => clearInterval(msgInterval);
  }, []);

  const handleDismissRequest = () => {
    setShowConfirm(true);
  };

  const handleConfirmDismiss = () => {
    cleanup();
    setShowConfirm(false);
    onDismissEarly();
  };

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-border bg-surface p-6",
          "flex flex-col items-center gap-5",
          "animate-fade-in"
        )}
      >
        <div className="flex items-center gap-2 text-text-muted">
          <Timer size={16} strokeWidth={1.5} />
          <span className="text-xs font-medium uppercase tracking-wider">
            Espere 10 minutos
          </span>
        </div>

        {/* Countdown */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl font-light text-text-primary tabular-nums tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <Progress value={progress} className="w-48 h-1" />
        </div>

        {/* Rotating message */}
        <p
          key={messageIndex}
          className="text-sm text-text-secondary text-center max-w-[280px] leading-relaxed ancora-text-balance animate-fade-in"
        >
          {MESSAGES[messageIndex]}
        </p>

        {/* Dismiss early */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismissRequest}
          className="text-text-muted"
        >
          <X size={14} />
          Pular espera
        </Button>
      </div>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar a espera?</DialogTitle>
            <DialogDescription>
              Ainda faltam {formatTime(secondsLeft)}. Impulsos geralmente perdem
              forca com o tempo. Tem certeza que quer pular?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowConfirm(false)}
            >
              Continuar esperando
            </Button>
            <Button variant="ghost" size="md" onClick={handleConfirmDismiss}>
              Sim, pular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

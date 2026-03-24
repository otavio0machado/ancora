"use client";

import { useState, useMemo } from "react";
import { Zap } from "lucide-react";
import Link from "next/link";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { useAppStore } from "@/lib/stores/app-store";
import { getFallbackMicrocopy } from "@/lib/ai/fallbacks";
import { CheckInForm } from "@/components/hoje/check-in-form";
import { DayPriorities } from "@/components/hoje/day-priorities";
import { DayOverview } from "@/components/hoje/day-overview";
import { RescueMode } from "@/components/hoje/rescue-mode";
import { AIDayAdjust } from "@/components/hoje/ai-day-adjust";
import { OverloadAlert } from "@/components/hoje/overload-alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { OverloadRisk } from "@/lib/utils/patterns";

// --------------- Greeting helper ---------------

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function getTimeMicrocopy(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Ainda está cedo. Descansou o suficiente?";
  if (hour < 9) return "Comece o dia com intenção.";
  if (hour < 12) return "Manhã é um bom momento pra se organizar.";
  if (hour < 14) return "Já fez uma pausa hoje?";
  if (hour < 18) return "Tarde é tempo de ajustar o ritmo.";
  if (hour < 21) return "Noite chegou. Como foi o dia?";
  return "Hora de desacelerar. Amanhã é um novo dia.";
}

// --------------- Page ---------------

export default function HojePage() {
  const { todayCheckIn } = useCheckInStore();
  const { user, rescueMode, toggleRescueMode } = useAppStore();
  const [checkInJustCompleted, setCheckInJustCompleted] = useState(false);
  const [overloadRisk, setOverloadRisk] = useState<OverloadRisk | null>(null);
  const [overloadAccepted, setOverloadAccepted] = useState(false);

  const hasCheckIn = !!todayCheckIn;

  // Greeting microcopy
  const greeting = useMemo(() => {
    if (checkInJustCompleted) {
      return getFallbackMicrocopy("checkin_complete");
    }
    return getFallbackMicrocopy("greeting");
  }, [checkInJustCompleted]);

  const greetingPrefix = useMemo(() => getGreetingPrefix(), []);
  const timeMicrocopy = useMemo(() => getTimeMicrocopy(), []);
  const userName = user?.name;

  const handleCheckInComplete = (risk: OverloadRisk) => {
    setCheckInJustCompleted(true);
    setOverloadRisk(risk);
  };

  const handleAcceptReduction = () => {
    setOverloadAccepted(true);
  };

  const handleActivateRescue = () => {
    toggleRescueMode();
  };

  // Determine if overload alert should show
  const showOverloadAlert =
    hasCheckIn &&
    overloadRisk &&
    (overloadRisk.risk === "medium" || overloadRisk.risk === "high" || overloadRisk.risk === "critical") &&
    !overloadAccepted &&
    !rescueMode;

  // Determine anxiety level for day-priorities anti-obsession
  const anxietyLevel = todayCheckIn?.anxiety ?? 3;

  // Effective overload risk for components (only pass if accepted or auto)
  const effectiveOverloadRisk = overloadRisk && (overloadAccepted || overloadRisk.autoReduce)
    ? overloadRisk
    : undefined;

  return (
    <main className="ancora-container py-8 pb-24">
      <div className="flex flex-col gap-8">
        {/* ---- Greeting ---- */}
        <header className="flex flex-col gap-2 animate-fade-in">
          <h1 className="text-xl font-semibold text-text-primary">
            {greetingPrefix}
            {userName ? `, ${userName}` : ""}
          </h1>
          <p className="text-sm text-text-secondary leading-relaxed ancora-text-balance">
            {hasCheckIn ? greeting.message : timeMicrocopy}
          </p>
        </header>

        {/* ---- Rescue mode panel (when active) ---- */}
        {rescueMode && (
          <section aria-label="Modo Resgate">
            <RescueMode />
          </section>
        )}

        {/* ---- Check-in (if not completed today) ---- */}
        {!hasCheckIn && !rescueMode && (
          <section aria-label="Check-in emocional">
            <CheckInForm onComplete={handleCheckInComplete} />
          </section>
        )}

        {/* ---- Post check-in content ---- */}
        {hasCheckIn && !rescueMode && (
          <>
            {/* Overload Alert - shown first if detected */}
            {showOverloadAlert && (
              <section aria-label="Alerta de sobrecarga" className="animate-scale-in">
                <OverloadAlert
                  overloadRisk={overloadRisk}
                  onAcceptReduction={handleAcceptReduction}
                  onActivateRescue={handleActivateRescue}
                />
              </section>
            )}

            {/* Day Overview with patterns */}
            <section aria-label="Visão do dia">
              <DayOverview
                habitsCompleted={0}
                habitsTotal={0}
                focusStatus="none"
              />
            </section>

            {/* Day Priorities with anti-obsession */}
            {(!overloadRisk || overloadRisk.risk !== "critical" || overloadAccepted) && (
              <section aria-label="Prioridades do dia">
                <DayPriorities
                  overloadRisk={effectiveOverloadRisk}
                  anxietyLevel={anxietyLevel}
                />
              </section>
            )}

            {/* AI Day Adjustment */}
            <section aria-label="Sugestão da IA">
              <AIDayAdjust />
            </section>

            {/* Quick access to impulse log if needed */}
            {(anxietyLevel >= 4 || (todayCheckIn?.impulsivity ?? 3) >= 4) && (
              <section aria-label="Acesso rápido a impulsos" className="animate-fade-in">
                <Link href="/impulsos">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-4",
                      "border border-border-subtle bg-surface",
                      "hover:bg-surface-sunken transition-colors duration-200",
                      "active:scale-[0.98]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl",
                        "flex items-center justify-center",
                        "bg-warning-subtle border border-warning/15"
                      )}
                    >
                      <Zap size={16} className="text-warning" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        Registrar impulso
                      </p>
                      <p className="text-xs text-text-muted">
                        Se sentir um impulso, registre aqui. Não julgue, observe.
                      </p>
                    </div>
                  </div>
                </Link>
              </section>
            )}
          </>
        )}

        {/* ---- Rescue mode button (when not active) ---- */}
        {!rescueMode && (
          <section aria-label="Modo Resgate" className="pt-2">
            <RescueMode />
          </section>
        )}
      </div>
    </main>
  );
}

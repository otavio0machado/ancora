"use client";

import { useState, useMemo } from "react";
import { useCheckInStore } from "@/lib/stores/checkin-store";
import { useAppStore } from "@/lib/stores/app-store";
import { getFallbackMicrocopy } from "@/lib/ai/fallbacks";
import { CheckInForm } from "@/components/hoje/check-in-form";
import { DayPriorities } from "@/components/hoje/day-priorities";
import { DayOverview } from "@/components/hoje/day-overview";
import { RescueMode } from "@/components/hoje/rescue-mode";
import { AIDayAdjust } from "@/components/hoje/ai-day-adjust";

// --------------- Greeting helper ---------------

function getGreetingPrefix(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

// --------------- Page ---------------

export default function HojePage() {
  const { todayCheckIn } = useCheckInStore();
  const { user, rescueMode } = useAppStore();
  const [checkInJustCompleted, setCheckInJustCompleted] = useState(false);

  const hasCheckIn = !!todayCheckIn;

  // Greeting microcopy
  const greeting = useMemo(() => {
    if (checkInJustCompleted) {
      return getFallbackMicrocopy("checkin_complete");
    }
    return getFallbackMicrocopy("greeting");
  }, [checkInJustCompleted]);

  const greetingPrefix = useMemo(() => getGreetingPrefix(), []);
  const userName = user?.name;

  const handleCheckInComplete = () => {
    setCheckInJustCompleted(true);
  };

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
            {greeting.message}
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
            {/* Day Overview */}
            <section aria-label="Visao do dia">
              <DayOverview
                habitsCompleted={0}
                habitsTotal={0}
                focusStatus="none"
              />
            </section>

            {/* Day Priorities */}
            <section aria-label="Prioridades do dia">
              <DayPriorities />
            </section>

            {/* AI Day Adjustment */}
            <section aria-label="Sugestao da IA">
              <AIDayAdjust />
            </section>
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

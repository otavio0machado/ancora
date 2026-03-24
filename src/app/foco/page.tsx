"use client";

import { useState, useCallback } from "react";
import { Crosshair } from "lucide-react";
import { NewSessionForm } from "@/components/foco/new-session-form";
import { FocusTimer } from "@/components/foco/focus-timer";
import { SessionReview } from "@/components/foco/session-review";
import { RecentSessions } from "@/components/foco/recent-sessions";
import type { FocusSession } from "@/types/database";

// --------------- Mock recent sessions ---------------

const MOCK_SESSIONS: FocusSession[] = [
  {
    id: "fs-1",
    user_id: "user-1",
    objective: "Revisar capítulo 3 de estatística",
    duration_planned: 25,
    duration_actual: 25,
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
    ended_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
    status: "completed",
    review_focus: 4,
    review_progress: "Consegui revisar todo o capítulo e fazer anotações.",
    review_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "fs-2",
    user_id: "user-1",
    objective: "Projeto de programação - módulo de auth",
    duration_planned: 45,
    duration_actual: 45,
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // yesterday
    ended_at: new Date(Date.now() - 1000 * 60 * 60 * 25.25).toISOString(),
    status: "completed",
    review_focus: 5,
    review_progress: "Implementei login e registro completos.",
    review_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: "fs-3",
    user_id: "user-1",
    objective: "Leitura - artigo sobre DBT",
    duration_planned: 25,
    duration_actual: 12,
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2 days ago
    ended_at: new Date(Date.now() - 1000 * 60 * 60 * 49.8).toISOString(),
    status: "abandoned",
    review_focus: 2,
    review_progress: null,
    review_notes: "Estava muito cansado, tentei forçar e não deu.",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
  {
    id: "fs-4",
    user_id: "user-1",
    objective: "Estudar para prova de cálculo",
    duration_planned: 60,
    duration_actual: 58,
    started_at: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(), // 3 days ago
    ended_at: new Date(Date.now() - 1000 * 60 * 60 * 73).toISOString(),
    status: "completed",
    review_focus: 3,
    review_progress: "Fiz metade dos exercícios da lista.",
    review_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 74).toISOString(),
  },
];

// --------------- Page states ---------------

type PageState =
  | { mode: "idle" }
  | { mode: "timer"; objective: string; durationMinutes: number }
  | { mode: "review"; objective: string; durationMinutes: number };

// --------------- Page ---------------

export default function FocoPage() {
  const [pageState, setPageState] = useState<PageState>({ mode: "idle" });
  const [recentSessions, setRecentSessions] =
    useState<FocusSession[]>(MOCK_SESSIONS);

  // Start a new session
  const handleStart = useCallback(
    (objective: string, durationMinutes: number) => {
      setPageState({ mode: "timer", objective, durationMinutes });
    },
    []
  );

  // Timer completed, transition to review
  const handleTimerComplete = useCallback(() => {
    setPageState((prev) => {
      if (prev.mode !== "timer") return prev;
      return {
        mode: "review",
        objective: prev.objective,
        durationMinutes: prev.durationMinutes,
      };
    });
  }, []);

  // Timer abandoned
  const handleTimerAbandon = useCallback(() => {
    setPageState((prev) => {
      if (prev.mode !== "timer") return prev;

      // Record the abandoned session
      const abandonedSession: FocusSession = {
        id: `fs-${Date.now()}`,
        user_id: "user-1",
        objective: prev.objective,
        duration_planned: prev.durationMinutes,
        duration_actual: 0,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        status: "abandoned",
        review_focus: null,
        review_progress: null,
        review_notes: null,
        created_at: new Date().toISOString(),
      };

      setRecentSessions((sessions) => [abandonedSession, ...sessions]);
      return { mode: "idle" };
    });
  }, []);

  // Review saved
  const handleReviewSave = useCallback(
    (review: { focus: number; progress: string; notes: string }) => {
      setPageState((prev) => {
        if (prev.mode !== "review") return prev;

        const completedSession: FocusSession = {
          id: `fs-${Date.now()}`,
          user_id: "user-1",
          objective: prev.objective,
          duration_planned: prev.durationMinutes,
          duration_actual: prev.durationMinutes,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          status: "completed",
          review_focus: review.focus,
          review_progress: review.progress || null,
          review_notes: review.notes || null,
          created_at: new Date().toISOString(),
        };

        setRecentSessions((sessions) => [completedSession, ...sessions]);
        return { mode: "idle" };
      });
    },
    []
  );

  return (
    <div className="ancora-container py-6 space-y-6">
      {/* Header - only show when idle */}
      {pageState.mode === "idle" && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-accent" />
            <h1 className="text-xl font-semibold text-text-primary">Foco</h1>
          </div>
          <p className="text-sm text-text-secondary">
            Uma coisa de cada vez, com intenção.
          </p>
        </div>
      )}

      {/* Main content based on state */}
      {pageState.mode === "idle" && (
        <>
          <NewSessionForm onStart={handleStart} />
          <RecentSessions sessions={recentSessions.slice(0, 7)} />
        </>
      )}

      {pageState.mode === "timer" && (
        <FocusTimer
          objective={pageState.objective}
          durationMinutes={pageState.durationMinutes}
          onComplete={handleTimerComplete}
          onAbandon={handleTimerAbandon}
        />
      )}

      {pageState.mode === "review" && (
        <SessionReview
          objective={pageState.objective}
          durationMinutes={pageState.durationMinutes}
          onSave={handleReviewSave}
        />
      )}
    </div>
  );
}

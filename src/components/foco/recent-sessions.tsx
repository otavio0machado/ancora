"use client";

import { Clock, Target, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FocusSession } from "@/types/database";

interface RecentSessionsProps {
  sessions: FocusSession[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atras`;

  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
  });
}

function FocusRatingDots({ rating }: { rating: number | null }) {
  if (rating === null) return null;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors duration-200",
            i <= rating ? "bg-accent" : "bg-surface-sunken"
          )}
        />
      ))}
    </div>
  );
}

export function RecentSessions({ sessions }: RecentSessionsProps) {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-text-secondary">
          Sessoes recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 -mt-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={cn(
              "flex items-center justify-between gap-3 py-3",
              "border-b border-border-subtle last:border-0"
            )}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">
                {session.objective}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.duration_actual ?? session.duration_planned} min
                </span>
                <span className="text-xs text-text-muted">
                  {formatDate(session.started_at)}
                </span>
                {session.status === "abandoned" && (
                  <Badge variant="alert" className="text-[10px]">
                    abandonada
                  </Badge>
                )}
              </div>
            </div>
            <FocusRatingDots rating={session.review_focus} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

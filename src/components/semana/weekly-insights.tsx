"use client";

import { useState } from "react";
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Lightbulb, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AIWeeklyOutput } from "@/types/ai";

// --------------- Fallback content ---------------

const FALLBACK_INSIGHTS: AIWeeklyOutput = {
  patterns: [
    "Observe seus check-ins ao longo da semana: ha dias em que a energia cai consistentemente?",
    "Preste atencao ao que muda entre dias bons e dificeis.",
  ],
  triggers: [
    "Identifique momentos em que impulsos ou desregulacao aparecem. Sao sempre nos mesmos horarios ou contextos?",
  ],
  adjustments: [
    "Se a semana foi pesada, considere reduzir expectativas para a proxima.",
    "Versao minima existe por um motivo: use-a sem culpa nos dias mais dificeis.",
  ],
  wins: [
    "Voce esteve presente. Registrar e refletir ja sao conquistas.",
  ],
  weekSummary:
    "Gere os insights com os dados da sua semana para uma leitura mais personalizada.",
};

// --------------- Component ---------------

interface WeeklyInsightsProps {
  weekStart: string; // YYYY-MM-DD
  className?: string;
}

export function WeeklyInsights({ weekStart, className }: WeeklyInsightsProps) {
  const [insights, setInsights] = useState<AIWeeklyOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/reflexao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart }),
      });

      if (response.ok) {
        const data: AIWeeklyOutput = await response.json();
        setInsights(data);
      } else {
        // Use fallback
        setInsights(FALLBACK_INSIGHTS);
      }
    } catch {
      setInsights(FALLBACK_INSIGHTS);
    } finally {
      setIsLoading(false);
    }
  };

  const data = insights;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Generate button */}
      {!data && !isLoading && (
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={handleGenerate}
        >
          <Sparkles size={16} strokeWidth={1.5} />
          Gerar insights da semana
        </Button>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-8 animate-fade-in">
          <Loader2 size={24} className="text-accent animate-spin" />
          <p className="text-sm text-text-muted">
            Analisando sua semana...
          </p>
        </div>
      )}

      {/* Error fallback note */}
      {error && (
        <p className="text-xs text-text-muted text-center">{error}</p>
      )}

      {/* Insights display */}
      {data && !isLoading && (
        <div className="space-y-4 animate-slide-up">
          {/* Week summary */}
          <Card className="border-accent/20 bg-accent-subtle/20">
            <CardContent className="p-5">
              <p className="text-sm text-text-primary leading-relaxed ancora-text-balance">
                {data.weekSummary}
              </p>
            </CardContent>
          </Card>

          {/* Wins */}
          {data.wins.length > 0 && (
            <InsightSection
              icon={<Trophy size={14} strokeWidth={1.5} />}
              title="Conquistas"
              items={data.wins}
              badgeVariant="success"
            />
          )}

          {/* Patterns */}
          {data.patterns.length > 0 && (
            <InsightSection
              icon={<TrendingUp size={14} strokeWidth={1.5} />}
              title="Padroes"
              items={data.patterns}
              badgeVariant="default"
            />
          )}

          {/* Triggers */}
          {data.triggers.length > 0 && (
            <InsightSection
              icon={<AlertTriangle size={14} strokeWidth={1.5} />}
              title="Gatilhos"
              items={data.triggers}
              badgeVariant="warning"
            />
          )}

          {/* Adjustments */}
          {data.adjustments.length > 0 && (
            <InsightSection
              icon={<Lightbulb size={14} strokeWidth={1.5} />}
              title="Ajustes"
              items={data.adjustments}
              badgeVariant="secondary"
            />
          )}

          {/* Re-generate */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-text-muted"
            onClick={handleGenerate}
          >
            <Sparkles size={14} />
            Gerar novamente
          </Button>
        </div>
      )}
    </div>
  );
}

// --------------- Sub-component ---------------

function InsightSection({
  icon,
  title,
  items,
  badgeVariant,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  badgeVariant: "default" | "secondary" | "warning" | "success";
}) {
  return (
    <Card className="border-border-subtle">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="text-text-muted">{icon}</span>
          {title}
          <Badge variant={badgeVariant} className="text-[10px] ml-auto">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="text-sm text-text-secondary leading-relaxed flex items-start gap-2"
            >
              <span className="text-text-muted mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-text-muted" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

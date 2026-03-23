"use client";

import { Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { OverloadRisk } from "@/lib/utils/patterns";

// --------------- Types ---------------

interface OverloadAlertProps {
  overloadRisk: OverloadRisk;
  onAcceptReduction: () => void;
  onActivateRescue: () => void;
}

// --------------- Messages by risk level ---------------

function getRiskContent(risk: OverloadRisk["risk"]) {
  switch (risk) {
    case "medium":
      return {
        title: "Dia pede cuidado",
        message: "Considere reduzir suas prioridades para 2. Foque no que realmente importa.",
        icon: "bg-warning-subtle border-warning/20",
        iconColor: "text-warning",
      };
    case "high":
      return {
        title: "Sobrecarga detectada",
        message: "Apenas 1 prioridade hoje. Cuide do basico. Voce nao precisa dar conta de tudo.",
        icon: "bg-alert/10 border-alert/20",
        iconColor: "text-alert",
      };
    case "critical":
      return {
        title: "Sobrecarga critica",
        message: "Modo resgate sugerido. Sem prioridades hoje. Esse nao e o momento de produzir, e o momento de se cuidar.",
        icon: "bg-alert/10 border-alert/20",
        iconColor: "text-alert",
      };
    default:
      return null;
  }
}

// --------------- Component ---------------

export function OverloadAlert({
  overloadRisk,
  onAcceptReduction,
  onActivateRescue,
}: OverloadAlertProps) {
  const content = getRiskContent(overloadRisk.risk);
  if (!content) return null;

  return (
    <Card className="animate-scale-in border-0">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Shield icon */}
          <div
            className={cn(
              "w-14 h-14 rounded-2xl",
              "flex items-center justify-center",
              "border",
              content.icon
            )}
          >
            <Shield size={24} className={content.iconColor} strokeWidth={1.5} />
          </div>

          {/* Title and message */}
          <div className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-text-primary">
              {content.title}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
              {content.message}
            </p>
          </div>

          {/* Suggestion badge */}
          {overloadRisk.suggestedMaxTasks > 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5",
                "px-3 py-1.5 rounded-full",
                "bg-surface-sunken border border-border-subtle",
                "text-xs text-text-secondary"
              )}
            >
              <ChevronDown size={12} strokeWidth={2} />
              Maximo sugerido: {overloadRisk.suggestedMaxTasks} prioridade{overloadRisk.suggestedMaxTasks !== 1 ? "s" : ""}
            </div>
          )}

          {overloadRisk.suggestedMaxTasks === 0 && (
            <div
              className={cn(
                "inline-flex items-center gap-1.5",
                "px-3 py-1.5 rounded-full",
                "bg-surface-sunken border border-border-subtle",
                "text-xs text-text-secondary"
              )}
            >
              <Shield size={12} strokeWidth={2} />
              Sem prioridades hoje. So cuidado.
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full mt-2">
            <Button
              size="lg"
              onClick={onAcceptReduction}
              className="w-full"
            >
              Aceitar reducao
            </Button>

            {overloadRisk.risk === "critical" && (
              <Button
                variant="rescue"
                size="lg"
                onClick={onActivateRescue}
                className="w-full"
              >
                <Shield size={16} strokeWidth={2} />
                Ativar modo resgate
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Cigarette,
  Smartphone,
  Eye,
  UtensilsCrossed,
  Pill,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";
import type { Impulse } from "@/types/database";

// --------------- Constants ---------------

const TYPE_LABELS: Record<Impulse["type"], string> = {
  smoking: "Cigarro",
  social_media: "Redes sociais",
  pornography: "Pornografia",
  binge_eating: "Compulsao alimentar",
  substance: "Substancia",
  other: "Outro",
};

const TYPE_ICONS: Record<Impulse["type"], typeof Cigarette> = {
  smoking: Cigarette,
  social_media: Smartphone,
  pornography: Eye,
  binge_eating: UtensilsCrossed,
  substance: Pill,
  other: HelpCircle,
};

// --------------- Component ---------------

interface ImpulseLogProps {
  impulses: Impulse[];
  className?: string;
}

export function ImpulseLog({ impulses, className }: ImpulseLogProps) {
  if (impulses.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border-subtle p-6",
          "flex flex-col items-center gap-2",
          className
        )}
      >
        <p className="text-sm text-text-muted text-center">
          Nenhum impulso registrado recentemente.
        </p>
        <p className="text-xs text-text-muted text-center">
          Registros aparecerao aqui.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {impulses.map((impulse) => {
        const Icon = TYPE_ICONS[impulse.type];
        const timeAgo = formatDistanceToNow(new Date(impulse.created_at), {
          addSuffix: true,
          locale: ptBR,
        });

        return (
          <div
            key={impulse.id}
            className={cn(
              "rounded-xl border border-border-subtle p-4",
              "transition-colors duration-200"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                    "bg-surface-sunken text-text-muted"
                  )}
                >
                  <Icon size={14} strokeWidth={1.5} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {TYPE_LABELS[impulse.type]}
                    </span>
                    <span className="text-xs text-text-muted tabular-nums flex-shrink-0">
                      {impulse.intensity}/10
                    </span>
                  </div>
                  <span className="text-xs text-text-muted">{timeAgo}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {impulse.resisted ? (
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-accent-subtle/60 text-accent"
                  >
                    Resistiu
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-rescue-subtle/60 text-rescue"
                  >
                    Cedeu
                  </Badge>
                )}
              </div>
            </div>

            {/* Emotion + trigger if available */}
            {(impulse.emotion_before || impulse.trigger) && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {impulse.emotion_before && (
                  <Badge variant="outline" className="text-[10px]">
                    {impulse.emotion_before}
                  </Badge>
                )}
                {impulse.trigger && (
                  <p className="text-xs text-text-muted truncate w-full mt-1">
                    {impulse.trigger}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

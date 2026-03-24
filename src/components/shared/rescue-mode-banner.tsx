"use client";

import { ShieldCheck, X } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function RescueModeBanner() {
  const rescueMode = useAppStore((s) => s.rescueMode);
  const toggleRescueMode = useAppStore((s) => s.toggleRescueMode);

  if (!rescueMode) return null;

  return (
    <div
      className={cn(
        "fixed top-14 left-0 right-0 z-40",
        "pt-[env(safe-area-inset-top)]",
        "bg-rescue-subtle border-b border-rescue/20",
        "animate-slide-down"
      )}
    >
      <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
        <ShieldCheck
          size={20}
          className="text-rescue shrink-0"
          strokeWidth={2}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            Modo Resgate ativo
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            Respire. Sinta os pés no chão. Você está seguro.
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleRescueMode}
          className="shrink-0 h-8 w-8 text-text-muted hover:text-text-primary"
          aria-label="Desativar modo resgate"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}

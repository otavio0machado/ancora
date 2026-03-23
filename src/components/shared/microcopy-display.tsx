"use client";

import { useMicrocopy } from "@/lib/hooks/use-microcopy";
import { cn } from "@/lib/utils/cn";
import type { MicrocopyContext } from "@/types/ai";

interface MicrocopyDisplayProps {
  context: MicrocopyContext;
  userData?: {
    name?: string;
    mood?: number;
    energy?: number;
  };
  className?: string;
}

export function MicrocopyDisplay({
  context,
  userData,
  className,
}: MicrocopyDisplayProps) {
  const { message, isLoading } = useMicrocopy(context, userData);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 w-3/4 rounded-md bg-surface-sunken" />
      </div>
    );
  }

  if (!message) return null;

  return (
    <p
      className={cn(
        "text-sm text-text-secondary leading-relaxed",
        "ancora-text-balance",
        "animate-fade-in",
        className
      )}
    >
      {message}
    </p>
  );
}

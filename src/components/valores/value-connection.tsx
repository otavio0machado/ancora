"use client";

import { cn } from "@/lib/utils/cn";

// --------------- Types ---------------

interface ValueConnectionProps {
  valueName: string;
  valueIcon?: string | null;
  /** Optional custom text. Defaults to "Isso te aproxima de [valor]" */
  customText?: string;
  className?: string;
}

// --------------- Component ---------------

export function ValueConnection({
  valueName,
  valueIcon,
  customText,
  className,
}: ValueConnectionProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2",
        "px-3 py-2 rounded-xl",
        "bg-accent-subtle/50 border border-accent/10",
        "animate-fade-in",
        className
      )}
    >
      {valueIcon && (
        <span className="text-sm" aria-hidden="true">
          {valueIcon}
        </span>
      )}
      <p className="text-xs text-accent leading-relaxed">
        {customText || `Isso te aproxima de ${valueName}`}
      </p>
    </div>
  );
}

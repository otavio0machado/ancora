"use client";

import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface IdentityStrengthProps {
  strength: number; // 0-100
  trend?: "improving" | "stable" | "declining";
  size?: "sm" | "md";
  className?: string;
}

export function IdentityStrength({
  strength,
  trend = "stable",
  size = "md",
  className,
}: IdentityStrengthProps) {
  const clampedStrength = Math.min(100, Math.max(0, strength));

  // SVG circle dimensions
  const isSm = size === "sm";
  const viewBox = 36;
  const center = viewBox / 2;
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(clampedStrength / 100) * circumference} ${circumference}`;

  // Color gradient based on strength
  const getStrokeColor = (value: number): string => {
    if (value >= 70) return "var(--accent)";
    if (value >= 40) return "var(--accent-hover)";
    return "var(--text-muted)";
  };

  const strokeColor = getStrokeColor(clampedStrength);

  const TrendIcon =
    trend === "improving"
      ? TrendingUp
      : trend === "declining"
        ? TrendingDown
        : Minus;

  const trendColor =
    trend === "improving"
      ? "text-accent"
      : trend === "declining"
        ? "text-warning"
        : "text-text-muted";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "relative",
          isSm ? "w-12 h-12" : "w-16 h-16"
        )}
      >
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={isSm ? 2.5 : 3}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={isSm ? 2.5 : 3}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            className="transition-all duration-700 ease-out"
            style={{ opacity: clampedStrength === 0 ? 0.2 : 1 }}
          />
        </svg>
        {/* Center label */}
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-medium text-text-primary tabular-nums",
            isSm ? "text-[11px]" : "text-sm"
          )}
        >
          {Math.round(clampedStrength)}%
        </span>
      </div>

      {/* Label and trend */}
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-text-muted",
            isSm ? "text-[9px]" : "text-[10px]"
          )}
        >
          Força
        </span>
        <TrendIcon
          className={cn(
            trendColor,
            isSm ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
          strokeWidth={2}
        />
      </div>
    </div>
  );
}

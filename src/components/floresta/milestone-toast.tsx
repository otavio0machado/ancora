"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { getMilestoneById } from "@/lib/floresta/constants";

export function MilestoneToast() {
  const { newMilestones, clearNewMilestones } = useForestStore();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<{ name: string; description: string } | null>(null);

  useEffect(() => {
    if (newMilestones.length > 0) {
      const milestone = getMilestoneById(newMilestones[0]);
      if (milestone) {
        setCurrent({ name: milestone.name, description: milestone.description });
        setVisible(true);

        const timeout = setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            clearNewMilestones();
            setCurrent(null);
          }, 300);
        }, 4000);

        return () => clearTimeout(timeout);
      }
    }
  }, [newMilestones, clearNewMilestones]);

  if (!current) return null;

  return (
    <div
      className={cn(
        "fixed top-20 left-1/2 -translate-x-1/2 z-50",
        "bg-accent text-white",
        "rounded-xl px-4 py-3 shadow-lg",
        "flex items-center gap-3",
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}
    >
      <Sparkles size={20} className="shrink-0" />
      <div>
        <div className="text-sm font-semibold">{current.name}</div>
        <div className="text-xs opacity-90">{current.description}</div>
      </div>
    </div>
  );
}

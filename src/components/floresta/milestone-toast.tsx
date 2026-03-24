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
          }, 400);
        }, 4000);

        return () => clearTimeout(timeout);
      }
    }
  }, [newMilestones, clearNewMilestones]);

  if (!current) return null;

  return (
    <div
      className={cn(
        "fixed z-[60] left-4 right-4 max-w-sm mx-auto",
        "top-[calc(4rem+env(safe-area-inset-top))]",
        "bg-accent text-white",
        "rounded-2xl px-4 py-3.5 shadow-lg",
        "flex items-center gap-3",
        "transition-all duration-400 ease-out",
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-3 scale-95 pointer-events-none"
      )}
    >
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Sparkles size={20} />
      </div>
      <div>
        <div className="text-sm font-semibold">{current.name}</div>
        <div className="text-xs opacity-85 leading-snug">{current.description}</div>
      </div>
    </div>
  );
}

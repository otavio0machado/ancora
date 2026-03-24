"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { getMilestoneById } from "@/lib/floresta/constants";
import type { MilestoneId } from "@/types/forest";

export function MilestoneToast() {
  const { newMilestones, clearNewMilestones } = useForestStore();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<{ name: string; description: string } | null>(null);
  const queueRef = useRef<MilestoneId[]>([]);
  const showingRef = useRef(false);

  useEffect(() => {
    if (newMilestones.length > 0) {
      // Add to queue
      queueRef.current = [...queueRef.current, ...newMilestones];
      clearNewMilestones();

      // Start showing if not already
      if (!showingRef.current) {
        showNext();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newMilestones]);

  function showNext() {
    const next = queueRef.current.shift();
    if (!next) {
      showingRef.current = false;
      return;
    }

    showingRef.current = true;
    const milestone = getMilestoneById(next);
    if (!milestone) {
      showNext();
      return;
    }

    setCurrent({ name: milestone.name, description: milestone.description });
    setVisible(true);

    // Auto-hide after 3.5s, then show next
    setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(null);
        showNext();
      }, 400);
    }, 3500);
  }

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

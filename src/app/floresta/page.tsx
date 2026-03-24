"use client";

import { useEffect, useState } from "react";
import { TreePine, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useForestStore } from "@/lib/stores/forest-store";
import { ForestScene } from "@/components/floresta/forest-scene";
import { AvatarCustomizer } from "@/components/floresta/avatar-customizer";
import { ForestStatsPanel } from "@/components/floresta/forest-stats-panel";
import { MilestoneToast } from "@/components/floresta/milestone-toast";

export default function FlorestaPage() {
  const { forestState, initializeForest } = useForestStore();
  const [showAvatar, setShowAvatar] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (!forestState) {
      initializeForest();
    }
  }, [forestState, initializeForest]);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem-4rem)] relative">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5 text-accent" />
          <h1 className="text-xl font-semibold text-text-primary">
            Minha Floresta
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(true)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "text-text-muted hover:text-text-secondary",
              "hover:bg-surface-sunken ancora-transition"
            )}
            aria-label="Estatisticas"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => setShowAvatar(true)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              "text-text-muted hover:text-text-secondary",
              "hover:bg-surface-sunken ancora-transition"
            )}
            aria-label="Personalizar avatar"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      {/* Forest Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <ForestScene />
      </div>

      {/* Panels */}
      <AvatarCustomizer open={showAvatar} onClose={() => setShowAvatar(false)} />
      <ForestStatsPanel open={showStats} onClose={() => setShowStats(false)} />
      <MilestoneToast />
    </div>
  );
}

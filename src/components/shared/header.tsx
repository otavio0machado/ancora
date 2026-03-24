"use client";

import { Anchor, Settings, TreePine } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Header() {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "bg-background/80 backdrop-blur-xl",
        "border-b border-border-subtle",
        "pt-[env(safe-area-inset-top)]"
      )}
    >
      <div className="flex items-center justify-between h-14 max-w-lg mx-auto px-4">
        <Link
          href="/hoje"
          className="flex items-center gap-2 ancora-transition hover:opacity-80"
        >
          <Anchor size={20} className="text-accent" strokeWidth={2.5} />
          <span className="text-base font-semibold tracking-tight text-text-primary">
            Âncora
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/floresta"
            className={cn(
              "flex items-center gap-1.5",
              "px-3 h-8 rounded-lg",
              "bg-accent/10 text-accent",
              "hover:bg-accent/20",
              "ancora-transition",
              "text-xs font-medium"
            )}
          >
            <TreePine size={14} strokeWidth={2} />
            Floresta
          </Link>
          <Link
            href="/configuracoes"
            className={cn(
              "flex items-center justify-center",
              "w-9 h-9 rounded-lg",
              "text-text-muted hover:text-text-secondary",
              "hover:bg-surface-sunken",
              "ancora-transition"
            )}
            aria-label="Configurações"
          >
            <Settings size={18} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </header>
  );
}

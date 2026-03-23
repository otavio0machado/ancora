"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sun,
  Fingerprint,
  Target,
  Zap,
  Heart,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/hoje", label: "Hoje", icon: Sun },
  { href: "/identidade", label: "Identidade", icon: Fingerprint },
  { href: "/foco", label: "Foco", icon: Target },
  { href: "/impulsos", label: "Impulsos", icon: Zap },
  { href: "/valores", label: "Valores", icon: Heart },
  { href: "/semana", label: "Semana", icon: BarChart3 },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-surface/80 backdrop-blur-xl",
        "border-t border-border-subtle",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5",
                "w-full h-full",
                "text-[10px] font-medium tracking-wide",
                "transition-colors duration-200 ease-out",
                "relative",
                "active:scale-95 transition-transform",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:text-text-secondary"
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    "absolute -top-px left-1/2 -translate-x-1/2",
                    "h-0.5 w-6 rounded-full bg-accent",
                    "animate-fade-in"
                  )}
                />
              )}
              <Icon
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "stroke-[2.5]" : "stroke-[1.5]"
                )}
                size={22}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

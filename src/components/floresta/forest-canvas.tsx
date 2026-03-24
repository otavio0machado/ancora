"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Application } from "pixi.js";
import type { ForestTree } from "@/types/database";
import type { GroundLevel, ForestWeather } from "@/types/forest";
import type { ForestRenderState } from "@/lib/floresta/renderer";

interface ForestCanvasProps {
  groundLevel: GroundLevel;
  trees: ForestTree[];
  milestones: string[];
  weather: ForestWeather;
  skinTone: number;
}

export function ForestCanvas({
  groundLevel,
  trees,
  milestones,
  weather,
  skinTone,
}: ForestCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const animFrameRef = useRef<number>(0);

  const renderScene = useCallback(async () => {
    if (!appRef.current) return;

    const { renderFullScene, updateParticles } = await import(
      "@/lib/floresta/renderer"
    );

    // Avatar patrol: random position within grid
    const avatarX = Math.floor(Math.random() * 8) + 1;
    const avatarY = Math.floor(Math.random() * 8) + 1;

    const state: ForestRenderState = {
      groundLevel,
      trees,
      milestones,
      weather,
      avatarGridX: avatarX,
      avatarGridY: avatarY,
      skinTone,
    };

    renderFullScene(appRef.current, state);

    // Animation loop for particles
    const app = appRef.current;
    const animate = () => {
      updateParticles(app.screen.width, app.screen.height);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    cancelAnimationFrame(animFrameRef.current);
    if (weather === "rain" || weather === "storm") {
      animate();
    }
  }, [groundLevel, trees, milestones, weather, skinTone]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;

    async function init() {
      const { createForestApp } = await import("@/lib/floresta/renderer");

      if (destroyed || !container) return;

      const rect = container.getBoundingClientRect();
      const app = await createForestApp(
        container,
        rect.width,
        rect.height
      );

      if (destroyed) {
        const { destroyForestApp } = await import("@/lib/floresta/renderer");
        destroyForestApp(app, container);
        return;
      }

      appRef.current = app;
      await renderScene();
    }

    init();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animFrameRef.current);
      if (appRef.current && container) {
        import("@/lib/floresta/renderer").then(({ destroyForestApp }) => {
          if (appRef.current && container) {
            destroyForestApp(appRef.current, container);
            appRef.current = null;
          }
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render when props change
  useEffect(() => {
    renderScene();
  }, [renderScene]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

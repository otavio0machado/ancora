"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { Application } from "pixi.js";
import type { ForestPlant } from "@/types/database";
import type { GroundLevel, ForestWeather } from "@/types/forest";
import type { ForestRenderState, AvatarRenderData } from "@/lib/floresta/renderer";

interface ForestCanvasProps {
  groundLevel: GroundLevel;
  plants: ForestPlant[];
  milestones: string[];
  weather: ForestWeather;
  avatar: AvatarRenderData;
  selectedPlantId: string | null;
  companion: string;
  timeOfDay: string;
  onPlantTap?: (plantId: string | null) => void;
}

export function ForestCanvas({
  groundLevel,
  plants,
  milestones,
  weather,
  avatar,
  selectedPlantId,
  companion,
  timeOfDay,
  onPlantTap,
}: ForestCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const animFrameRef = useRef<number>(0);
  const weatherRef = useRef(weather);
  const plantsRef = useRef(plants);
  const onPlantTapRef = useRef(onPlantTap);
  const [ready, setReady] = useState(false);

  // Keep refs in sync without triggering effects
  weatherRef.current = weather;
  plantsRef.current = plants;
  onPlantTapRef.current = onPlantTap;

  const renderScene = useCallback(async () => {
    if (!appRef.current) return;
    const { renderFullScene } = await import("@/lib/floresta/renderer");

    const state: ForestRenderState = {
      groundLevel,
      plants,
      milestones,
      weather,
      avatarGridX: 5,
      avatarGridY: 4,
      avatar,
      selectedPlantId,
      companion,
      timeOfDay,
    };

    renderFullScene(appRef.current, state);
  }, [groundLevel, plants, milestones, weather, avatar, selectedPlantId, companion, timeOfDay]);

  // Initialize PixiJS ONCE — stable effect, no dependency on callbacks
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let app: Application | null = null;

    // Stable click handler that reads from ref
    function handleClick(e: Event) {
      const tapFn = onPlantTapRef.current;
      if (!tapFn) return;

      const canvas = container!.querySelector("canvas");
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      let clientX: number, clientY: number;

      if ("touches" in e) {
        const te = e as TouchEvent;
        if (te.touches.length === 0) return;
        clientX = te.touches[0].clientX;
        clientY = te.touches[0].clientY;
      } else {
        const me = e as MouseEvent;
        clientX = me.clientX;
        clientY = me.clientY;
      }

      const dpr = Math.min(window.devicePixelRatio, 2);
      const screenX = (clientX - rect.left) * (canvas.width / rect.width) / dpr;
      const screenY = (clientY - rect.top) * (canvas.height / rect.height) / dpr;

      import("@/lib/floresta/renderer").then(({ hitTestPlant }) => {
        const hitId = hitTestPlant(screenX, screenY, plantsRef.current);
        // Only call tap if we actually hit a plant
        if (hitId) {
          tapFn(hitId);
        }
      });
    }

    async function initApp(width: number, height: number) {
      if (destroyed || width < 10 || height < 10) return;

      const { createForestApp, updateParticles } = await import("@/lib/floresta/renderer");
      if (destroyed) return;

      const existingCanvas = container!.querySelector("canvas");
      if (existingCanvas) container!.removeChild(existingCanvas);
      if (app) { try { app.destroy(true); } catch { /* */ } }

      app = await createForestApp(container!, width, height);
      if (destroyed) { try { app.destroy(true); } catch { /* */ } return; }

      appRef.current = app;
      setReady(true);

      const animate = () => {
        if (!destroyed && app) {
          updateParticles(app.screen.width, app.screen.height, weatherRef.current);
        }
        if (!destroyed) animFrameRef.current = requestAnimationFrame(animate);
      };
      animate();
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      if (width > 10 && height > 10 && !appRef.current) {
        initApp(Math.floor(width), Math.floor(height));
      }
    });
    observer.observe(container);

    const rect = container.getBoundingClientRect();
    if (rect.width > 10 && rect.height > 10) {
      initApp(Math.floor(rect.width), Math.floor(rect.height));
    }

    container.addEventListener("click", handleClick);
    container.addEventListener("touchstart", handleClick, { passive: true });

    return () => {
      destroyed = true;
      observer.disconnect();
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener("click", handleClick);
      container.removeEventListener("touchstart", handleClick);
      if (app) {
        const canvas = container.querySelector("canvas");
        if (canvas) { try { container.removeChild(canvas); } catch { /* */ } }
        try { app.destroy(true); } catch { /* */ }
        app = null;
        appRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render scene when props change (does NOT recreate the canvas)
  useEffect(() => {
    if (ready) renderScene();
  }, [ready, renderScene]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

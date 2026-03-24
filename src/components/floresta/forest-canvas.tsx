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
  const [ready, setReady] = useState(false);
  weatherRef.current = weather;
  plantsRef.current = plants;

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

  // Handle canvas tap/click
  const handleCanvasClick = useCallback(async (e: MouseEvent | TouchEvent) => {
    if (!onPlantTap) return;

    const container = containerRef.current;
    if (!container) return;

    const canvas = container.querySelector("canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Account for device pixel ratio
    const dpr = Math.min(window.devicePixelRatio, 2);
    const screenX = (clientX - rect.left) * (canvas.width / rect.width) / dpr;
    const screenY = (clientY - rect.top) * (canvas.height / rect.height) / dpr;

    const { hitTestPlant } = await import("@/lib/floresta/renderer");
    const hitId = hitTestPlant(screenX, screenY, plantsRef.current);
    onPlantTap(hitId);
  }, [onPlantTap]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;
    let app: Application | null = null;

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

    // Add click/tap listener
    container.addEventListener("click", handleCanvasClick as any);
    container.addEventListener("touchstart", handleCanvasClick as any, { passive: true });

    return () => {
      destroyed = true;
      observer.disconnect();
      cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener("click", handleCanvasClick as any);
      container.removeEventListener("touchstart", handleCanvasClick as any);
      if (app) {
        const canvas = container.querySelector("canvas");
        if (canvas) { try { container.removeChild(canvas); } catch { /* */ } }
        try { app.destroy(true); } catch { /* */ }
        app = null;
        appRef.current = null;
      }
    };
  }, [handleCanvasClick]);

  useEffect(() => {
    if (ready) renderScene();
  }, [ready, renderScene]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

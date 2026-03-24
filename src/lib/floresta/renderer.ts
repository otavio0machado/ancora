// ============================================================
// PixiJS isometric renderer - Jardim Terapêutico Vivo
// Auto-scales to fill viewport. Rich procedural pixel art.
// ============================================================

import { Application, Container, Graphics } from "pixi.js";
import type { ForestPlant } from "@/types/database";
import type { GroundLevel, ForestWeather, GrowthStage, PlantCategory } from "@/types/forest";
import { GRID_WIDTH, GRID_HEIGHT, getSpecies } from "./constants";
import { GROUND_COLORS, PLANT_PALETTES, DECORATION_COLORS, WEATHER_PARTICLES } from "./sprites";
import { calculateGrowthStage } from "@/lib/utils/forest-engine";

// --------------- Dynamic tile sizing ---------------

function calculateLayout(canvasW: number, canvasH: number) {
  // Scale grid to fill ~90% of canvas width
  const gridPixelWidth = canvasW * 0.92;
  const tileW = Math.floor(gridPixelWidth / GRID_WIDTH);
  const tileH = Math.floor(tileW / 2); // 2:1 isometric ratio

  const ox = canvasW / 2;
  // Center vertically: grid height in iso is (GRID_WIDTH + GRID_HEIGHT) * tileH / 2
  const gridPixelHeight = (GRID_WIDTH + GRID_HEIGHT) * tileH / 2;
  const oy = Math.max(tileH, (canvasH - gridPixelHeight) / 2 + tileH);

  return { tileW, tileH, ox, oy };
}

// --------------- Application ---------------

export async function createForestApp(
  container: HTMLElement,
  width: number,
  height: number
): Promise<Application> {
  const app = new Application();
  await app.init({
    width,
    height,
    backgroundAlpha: 1,
    background: 0xE8F4F0,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio, 2),
    autoDensity: true,
  });
  container.appendChild(app.canvas as HTMLCanvasElement);
  return app;
}

export function destroyForestApp(app: Application, container: HTMLElement) {
  const canvas = container.querySelector("canvas");
  if (canvas) container.removeChild(canvas);
  app.destroy(true);
}

// --------------- Iso helpers ---------------

function gts(gx: number, gy: number, tileW: number, tileH: number, ox: number, oy: number) {
  return {
    sx: (gx - gy) * (tileW / 2) + ox,
    sy: (gx + gy) * (tileH / 2) + oy,
  };
}

// --------------- Sky ---------------

export function renderSky(container: Container, w: number, h: number, weather: ForestWeather) {
  container.removeChildren();
  const colors: Record<ForestWeather, [number, number, number]> = {
    sunny:     [0x87CEEB, 0xB5E3F5, 0xE0F4FF],
    clear:     [0xA8D8EA, 0xC8E6EF, 0xE8F4F0],
    overcast:  [0x8E99A4, 0xA8B2BC, 0xC4CCD4],
    rain:      [0x6B7B8D, 0x8494A4, 0x9EAAB6],
    wind:      [0x90A4AE, 0xA4B8C2, 0xB8CCD6],
    dawn:      [0xFFAB91, 0xFFCC80, 0xFFE0B2],
    fireflies: [0x1A237E, 0x283593, 0x37474F],
  };
  const [top, mid, bottom] = colors[weather];
  const sky = new Graphics();
  const third = Math.ceil(h / 3);
  sky.rect(0, 0, w, third).fill(top);
  sky.rect(0, third, w, third).fill(mid);
  sky.rect(0, third * 2, w, h - third * 2).fill(bottom);
  container.addChild(sky);
}

// --------------- Ground ---------------

export function renderGround(
  container: Container, level: GroundLevel,
  tileW: number, tileH: number, ox: number, oy: number
) {
  container.removeChildren();
  const c = GROUND_COLORS[level];
  const fillColor = parseInt(c.fill.replace("#", ""), 16);
  const strokeColor = parseInt(c.stroke.replace("#", ""), 16);
  const detailColor = c.detail ? parseInt(c.detail.replace("#", ""), 16) : 0;

  // Pseudo-random seed for consistent detail placement
  const seed = (x: number, y: number) => ((x * 7 + y * 13) % 17);

  for (let gx = 0; gx < GRID_WIDTH; gx++) {
    for (let gy = 0; gy < GRID_HEIGHT; gy++) {
      const { sx, sy } = gts(gx, gy, tileW, tileH, ox, oy);
      const t = new Graphics();
      const hw = tileW / 2;
      const hh = tileH / 2;
      const pts = [
        { x: sx, y: sy - hh },
        { x: sx + hw, y: sy },
        { x: sx, y: sy + hh },
        { x: sx - hw, y: sy },
      ];

      // Tile fill with slight per-tile color variation
      const variation = seed(gx, gy) % 3;
      const tintOffset = variation === 0 ? 0 : variation === 1 ? 0x050505 : -0x030303;
      t.poly(pts).fill(Math.max(0, fillColor + tintOffset));

      // Border
      t.poly(pts).stroke({ width: 0.5, color: strokeColor, alpha: 0.2 });

      // Ground details based on level
      const s = seed(gx, gy);

      if (level === 0) {
        // Burned: ash, embers, cracks
        if (s % 3 === 0) {
          t.circle(sx + hw * 0.2, sy - hh * 0.1, tileW * 0.02).fill(0x555555);
          t.circle(sx - hw * 0.3, sy + hh * 0.2, tileW * 0.015).fill(0x444444);
        }
        if (s % 5 === 0) {
          // Ember glow
          t.circle(sx + hw * 0.1, sy + hh * 0.1, tileW * 0.01).fill(0xFF6D00);
        }
      } else if (level === 1) {
        // Dry: small stones, cracks
        if (s % 3 === 0) {
          t.circle(sx - hw * 0.2, sy, tileW * 0.02).fill(0x8D8D8D);
        }
      } else if (level === 2) {
        // Sparse grass: small grass tufts
        if (s % 2 === 0 && detailColor) {
          const gw = tileW * 0.04;
          t.rect(sx - hw * 0.15 - gw / 2, sy - gw * 2, gw, gw * 2).fill(detailColor);
          t.rect(sx + hw * 0.2 - gw / 2, sy + hh * 0.1 - gw * 2, gw, gw * 2).fill(detailColor);
        }
      } else if (level === 3) {
        // Grass: thicker tufts, small patches
        if (s % 2 === 0 && detailColor) {
          const gw = tileW * 0.03;
          for (let i = 0; i < 3; i++) {
            const dx = (s * (i + 1) % 7 - 3) / 7 * hw * 0.6;
            const dy = (s * (i + 2) % 5 - 2) / 5 * hh * 0.5;
            t.rect(sx + dx - gw / 2, sy + dy - gw * 3, gw, gw * 3).fill(detailColor);
          }
        }
      } else if (level === 4) {
        // Lush: flowers, dense grass, sparkles
        if (detailColor) {
          const gw = tileW * 0.025;
          for (let i = 0; i < 4; i++) {
            const dx = (s * (i + 1) % 9 - 4) / 9 * hw * 0.7;
            const dy = (s * (i + 3) % 7 - 3) / 7 * hh * 0.6;
            t.rect(sx + dx - gw / 2, sy + dy - gw * 3, gw, gw * 3).fill(detailColor);
          }
        }
        // Flowers
        if (s % 3 === 0) {
          const flowerColors = [0xFFEB3B, 0xF48FB1, 0xCE93D8, 0xFF8A65, 0x81D4FA];
          const fc = flowerColors[s % flowerColors.length];
          t.circle(sx + hw * 0.15, sy - hh * 0.1, tileW * 0.02).fill(fc);
          t.circle(sx - hw * 0.25, sy + hh * 0.15, tileW * 0.018).fill(fc);
        }
      }

      container.addChild(t);
    }
  }
}

// --------------- Plants ---------------

function drawPlant(
  g: Graphics, x: number, y: number,
  speciesId: string, category: PlantCategory, stage: GrowthStage,
  isSelected: boolean, scale: number
) {
  const palette = PLANT_PALETTES[speciesId] ?? PLANT_PALETTES.carvalho;
  const trunkColor = parseInt(palette.trunk.replace("#", ""), 16);
  const foliageColor = parseInt(palette.foliage.replace("#", ""), 16);
  const highlightColor = parseInt(palette.highlight.replace("#", ""), 16);
  const bloomColor = palette.bloom ? parseInt(palette.bloom.replace("#", ""), 16) : highlightColor;

  // Selection glow
  if (isSelected) {
    g.circle(x, y, 20 * scale).fill({ color: 0xFFEB3B, alpha: 0.2 });
    g.circle(x, y, 14 * scale).fill({ color: 0xFFEB3B, alpha: 0.15 });
  }

  // Shadow
  const shadowW = (8 + stage * 4) * scale;
  g.ellipse(x, y + 2 * scale, shadowW, 3 * scale).fill({ color: 0x000000, alpha: 0.12 });

  if (category === "flower") {
    drawFlower(g, x, y, stage, scale, trunkColor, foliageColor, highlightColor, bloomColor);
  } else if (category === "shrub") {
    drawShrub(g, x, y, stage, scale, trunkColor, foliageColor, highlightColor, bloomColor);
  } else {
    drawTree(g, x, y, stage, scale, speciesId, trunkColor, foliageColor, highlightColor, bloomColor);
  }
}

function drawTree(
  g: Graphics, x: number, y: number, stage: GrowthStage, s: number,
  speciesId: string,
  trunk: number, foliage: number, highlight: number, bloom: number
) {
  // Sizes that scale with the tile
  const sizes = [
    { tw: 3 * s, th: 8 * s, fw: 6 * s, fh: 8 * s },     // seed
    { tw: 4 * s, th: 14 * s, fw: 14 * s, fh: 16 * s },   // sprout
    { tw: 5 * s, th: 20 * s, fw: 22 * s, fh: 26 * s },   // young
    { tw: 6 * s, th: 26 * s, fw: 30 * s, fh: 34 * s },   // adult
    { tw: 7 * s, th: 30 * s, fw: 36 * s, fh: 40 * s },   // flourishing
  ];
  const sz = sizes[stage];

  // Trunk
  g.rect(x - sz.tw / 2, y - sz.th, sz.tw, sz.th).fill(trunk);
  // Trunk highlight
  g.rect(x - sz.tw / 2 + 1, y - sz.th, Math.max(1, sz.tw / 3), sz.th).fill({ color: 0xFFFFFF, alpha: 0.1 });

  if (stage === 0) {
    // Tiny seedling leaves
    g.circle(x, y - sz.th - 3 * s, 3 * s).fill(foliage);
    g.circle(x - 1 * s, y - sz.th - 4 * s, 2 * s).fill(highlight);
    return;
  }

  const isPine = speciesId === "pinheiro" || speciesId === "araucaria";
  const canopyBottom = y - sz.th;

  if (isPine) {
    // Triangular conifer
    const layers = stage <= 1 ? 2 : stage <= 2 ? 3 : stage >= 4 ? 5 : 4;
    for (let i = 0; i < layers; i++) {
      const layerH = sz.fh / layers;
      const layerY = canopyBottom - layerH * i;
      const layerW = sz.fw * (layers - i) / layers;
      g.poly([
        { x, y: layerY - layerH },
        { x: x + layerW / 2, y: layerY },
        { x: x - layerW / 2, y: layerY },
      ]).fill(i % 2 === 0 ? foliage : highlight);
    }
    // Snow/frost tips for araucaria stage 4
    if (stage >= 4 && speciesId === "araucaria") {
      g.circle(x, canopyBottom - sz.fh, 3 * s).fill(0xE0E0E0);
    }
  } else {
    // Deciduous round canopy
    const r = sz.fw / 2;
    const cy = canopyBottom - sz.fh / 2;

    // Main canopy (overlapping circles for organic shape)
    g.circle(x, cy, r).fill(foliage);
    g.circle(x - r * 0.35, cy - r * 0.25, r * 0.7).fill(highlight);
    g.circle(x + r * 0.3, cy - r * 0.15, r * 0.55).fill(highlight);

    // Extra volume for bigger stages
    if (stage >= 2) {
      g.circle(x + r * 0.4, cy + r * 0.1, r * 0.5).fill(foliage);
      g.circle(x - r * 0.3, cy + r * 0.2, r * 0.45).fill(foliage);
    }

    // Blooms
    if (stage >= 3) {
      const bloomCount = stage >= 4 ? 8 : 4;
      for (let i = 0; i < bloomCount; i++) {
        const angle = (i / bloomCount) * Math.PI * 2;
        const br = r * 0.6;
        const bx = x + Math.cos(angle) * br;
        const by = cy + Math.sin(angle) * br * 0.7;
        g.circle(bx, by, r * 0.15).fill(bloom);
      }
    }

    // Flourishing glow
    if (stage >= 4) {
      g.circle(x, cy, r * 1.3).fill({ color: bloom, alpha: 0.08 });
    }
  }
}

function drawShrub(
  g: Graphics, x: number, y: number, stage: GrowthStage, s: number,
  trunk: number, foliage: number, highlight: number, bloom: number
) {
  const sizes = [
    { w: 6 * s, h: 5 * s },
    { w: 14 * s, h: 10 * s },
    { w: 20 * s, h: 14 * s },
    { w: 26 * s, h: 18 * s },
    { w: 30 * s, h: 22 * s },
  ];
  const sz = sizes[stage];

  if (stage === 0) {
    g.rect(x - 1, y - 5 * s, 2, 5 * s).fill(trunk);
    g.circle(x, y - 6 * s, 3 * s).fill(foliage);
    return;
  }

  // Bush body: wide ellipse
  g.ellipse(x, y - sz.h / 2, sz.w / 2, sz.h / 2).fill(foliage);
  // Highlight
  g.ellipse(x - sz.w * 0.12, y - sz.h * 0.65, sz.w * 0.3, sz.h * 0.25).fill(highlight);

  if (stage >= 2) {
    // Side bumps
    g.circle(x - sz.w * 0.35, y - sz.h * 0.4, sz.w * 0.2).fill(foliage);
    g.circle(x + sz.w * 0.35, y - sz.h * 0.35, sz.w * 0.18).fill(foliage);
  }

  // Blooms
  if (stage >= 3) {
    const count = stage >= 4 ? 7 : 4;
    for (let i = 0; i < count; i++) {
      const bx = x + ((i * 7 % 11) - 5) / 11 * sz.w * 0.7;
      const by = y - sz.h * 0.3 - ((i * 5 % 7) - 3) / 7 * sz.h * 0.4;
      g.circle(bx, by, 2.5 * s).fill(bloom);
    }
  }
}

function drawFlower(
  g: Graphics, x: number, y: number, stage: GrowthStage, s: number,
  trunk: number, foliage: number, highlight: number, bloom: number
) {
  const heights = [6 * s, 14 * s, 20 * s, 26 * s, 30 * s];
  const stemH = heights[stage];

  // Stem
  g.rect(x - 1, y - stemH, 2, stemH).fill(trunk);

  if (stage === 0) {
    g.circle(x, y - stemH - 2 * s, 2 * s).fill(foliage);
    return;
  }

  // Leaves
  if (stage >= 1) {
    g.ellipse(x - 5 * s, y - stemH * 0.45, 4 * s, 2 * s).fill(foliage);
  }
  if (stage >= 2) {
    g.ellipse(x + 5 * s, y - stemH * 0.6, 4 * s, 2 * s).fill(foliage);
  }

  // Flower head
  const headR = (3 + stage * 2) * s;
  const headY = y - stemH - headR;

  if (stage >= 3) {
    // Petals
    const petalCount = stage >= 4 ? 7 : 5;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * headR * 1.1;
      const py = headY + Math.sin(angle) * headR * 1.1;
      g.circle(px, py, headR * 0.55).fill(bloom);
    }
    // Center
    g.circle(x, headY, headR * 0.45).fill(0xFFD600);
  } else {
    // Bud
    g.circle(x, headY, headR).fill(bloom);
  }

  // Flourishing glow
  if (stage >= 4) {
    g.circle(x, headY, headR * 2.5).fill({ color: bloom, alpha: 0.06 });
  }
}

export function renderPlants(
  container: Container, plants: ForestPlant[],
  tileW: number, tileH: number, ox: number, oy: number,
  selectedPlantId: string | null
) {
  container.removeChildren();

  const scale = tileW / 64; // scale relative to base tile size
  const sorted = [...plants].sort(
    (a, b) => (a.grid_x + a.grid_y) - (b.grid_x + b.grid_y)
  );

  for (const plant of sorted) {
    const { sx, sy } = gts(plant.grid_x, plant.grid_y, tileW, tileH, ox, oy);
    const stage = calculateGrowthStage(plant.total_completions) as GrowthStage;
    const species = getSpecies(plant.species_id as any);
    const category: PlantCategory = species?.category ?? "tree";

    const pg = new Graphics();
    drawPlant(pg, sx, sy, plant.species_id, category, stage, plant.id === selectedPlantId, scale);
    container.addChild(pg);
  }
}

// --------------- Decorations ---------------

export function renderDecorations(
  container: Container, milestones: string[],
  tileW: number, tileH: number, ox: number, oy: number
) {
  container.removeChildren();
  const s = tileW / 64;

  if (milestones.includes("garden_path")) {
    const pathTiles = [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [5, 4], [5, 6]];
    for (const [px, py] of pathTiles) {
      const { sx, sy } = gts(px, py, tileW, tileH, ox, oy);
      const g = new Graphics();
      const dc = DECORATION_COLORS.path;
      g.ellipse(sx, sy, 10 * s, 5 * s).fill(parseInt(dc.fill.replace("#", ""), 16));
      g.ellipse(sx - 3 * s, sy - 1 * s, 4 * s, 2 * s).fill(parseInt(dc.stroke.replace("#", ""), 16));
      container.addChild(g);
    }
  }

  if (milestones.includes("pond")) {
    const { sx, sy } = gts(9, 8, tileW, tileH, ox, oy);
    const g = new Graphics();
    const pc = DECORATION_COLORS.pond;
    g.ellipse(sx, sy, tileW * 0.7, tileH * 0.6).fill(parseInt(pc.fill.replace("#", ""), 16));
    g.ellipse(sx - 5 * s, sy - 3 * s, tileW * 0.3, tileH * 0.2).fill(parseInt(pc.highlight.replace("#", ""), 16));
    container.addChild(g);
  }

  if (milestones.includes("bench")) {
    const { sx, sy } = gts(5, 3, tileW, tileH, ox, oy);
    const g = new Graphics();
    const bc = DECORATION_COLORS.bench;
    g.rect(sx - 10 * s, sy - 8 * s, 20 * s, 5 * s).fill(parseInt(bc.seat.replace("#", ""), 16));
    g.rect(sx - 12 * s, sy - 3 * s, 3 * s, 8 * s).fill(parseInt(bc.fill.replace("#", ""), 16));
    g.rect(sx + 9 * s, sy - 3 * s, 3 * s, 8 * s).fill(parseInt(bc.fill.replace("#", ""), 16));
    container.addChild(g);
  }

  if (milestones.includes("lantern")) {
    const { sx, sy } = gts(2, 7, tileW, tileH, ox, oy);
    const g = new Graphics();
    const lc = DECORATION_COLORS.lantern;
    g.rect(sx - 1.5 * s, sy - 28 * s, 3 * s, 26 * s).fill(parseInt(lc.post.replace("#", ""), 16));
    g.circle(sx, sy - 30 * s, 5 * s).fill(parseInt(lc.light.replace("#", ""), 16));
    g.circle(sx, sy - 30 * s, 12 * s).fill({ color: 0xFFE082, alpha: 0.12 });
    container.addChild(g);
  }

  if (milestones.includes("cabin")) {
    const { sx, sy } = gts(1, 1, tileW, tileH, ox, oy);
    const g = new Graphics();
    const cc = DECORATION_COLORS.cabin;
    g.rect(sx - 18 * s, sy - 32 * s, 36 * s, 28 * s).fill(parseInt(cc.wall.replace("#", ""), 16));
    g.poly([
      { x: sx - 22 * s, y: sy - 32 * s },
      { x: sx, y: sy - 48 * s },
      { x: sx + 22 * s, y: sy - 32 * s },
    ]).fill(parseInt(cc.roof.replace("#", ""), 16));
    g.rect(sx - 5 * s, sy - 16 * s, 10 * s, 16 * s).fill(parseInt(cc.door.replace("#", ""), 16));
    g.rect(sx + 8 * s, sy - 26 * s, 8 * s, 8 * s).fill(parseInt(cc.window.replace("#", ""), 16));
    container.addChild(g);
  }

  if (milestones.includes("animals")) {
    // Birds
    for (const [bx, by] of [[6, 1], [3, 2]]) {
      const { sx, sy } = gts(bx, by, tileW, tileH, ox, oy);
      const bird = new Graphics();
      bird.poly([
        { x: sx - 5 * s, y: sy - 40 * s },
        { x: sx, y: sy - 44 * s },
        { x: sx + 5 * s, y: sy - 40 * s },
      ]).stroke({ width: 2 * s, color: 0x37474F });
      container.addChild(bird);
    }
    // Butterfly
    const { sx: btx, sy: bty } = gts(7, 4, tileW, tileH, ox, oy);
    const bf = new Graphics();
    bf.ellipse(btx - 4 * s, bty - 25 * s, 4 * s, 3 * s).fill(0xFFAB40);
    bf.ellipse(btx + 4 * s, bty - 25 * s, 4 * s, 3 * s).fill(0xFFAB40);
    bf.circle(btx, bty - 25 * s, 1.5 * s).fill(0x3E2723);
    container.addChild(bf);
  }
}

// --------------- Avatar ---------------

export function renderAvatar(
  container: Container, ax: number, ay: number,
  tileW: number, tileH: number, ox: number, oy: number,
  skinTone: number
) {
  container.removeChildren();
  const { sx, sy } = gts(ax, ay, tileW, tileH, ox, oy);
  const skins = [0xFDBB97, 0xD4956B, 0xA0674B, 0x6B3F2E, 0x3D2317, 0xF5D6BA];
  const skin = skins[skinTone % skins.length];
  const s = tileW / 64;

  const g = new Graphics();
  // Shadow
  g.ellipse(sx, sy + 3 * s, 8 * s, 4 * s).fill({ color: 0x000000, alpha: 0.1 });
  // Legs
  g.rect(sx - 3 * s, sy - 4 * s, 2.5 * s, 6 * s).fill(0x3949AB);
  g.rect(sx + 0.5 * s, sy - 4 * s, 2.5 * s, 6 * s).fill(0x3949AB);
  // Body
  g.rect(sx - 5 * s, sy - 18 * s, 10 * s, 14 * s).fill(0x5C6BC0);
  // Body highlight
  g.rect(sx - 5 * s, sy - 18 * s, 3 * s, 14 * s).fill({ color: 0xFFFFFF, alpha: 0.08 });
  // Arms
  g.rect(sx - 7 * s, sy - 16 * s, 2.5 * s, 10 * s).fill(0x5C6BC0);
  g.rect(sx + 4.5 * s, sy - 16 * s, 2.5 * s, 10 * s).fill(0x5C6BC0);
  // Head
  g.circle(sx, sy - 24 * s, 6 * s).fill(skin);
  // Hair
  g.rect(sx - 6 * s, sy - 31 * s, 12 * s, 5 * s).fill(0x3E2723);
  g.rect(sx - 6 * s, sy - 28 * s, 2 * s, 4 * s).fill(0x3E2723); // sideburns
  g.rect(sx + 4 * s, sy - 28 * s, 2 * s, 4 * s).fill(0x3E2723);
  // Eyes
  g.circle(sx - 2.5 * s, sy - 24 * s, 1.2 * s).fill(0x212121);
  g.circle(sx + 2.5 * s, sy - 24 * s, 1.2 * s).fill(0x212121);
  // Eye shine
  g.circle(sx - 2 * s, sy - 24.5 * s, 0.5 * s).fill(0xFFFFFF);
  g.circle(sx + 3 * s, sy - 24.5 * s, 0.5 * s).fill(0xFFFFFF);

  container.addChild(g);
}

// --------------- Particles ---------------

interface Particle { x: number; y: number; speed: number; drift: number; graphics: Graphics; }
let particles: Particle[] = [];

export function renderParticles(container: Container, weather: ForestWeather, w: number, h: number) {
  container.removeChildren();
  particles = [];
  const config = WEATHER_PARTICLES[weather];
  if (!config) return;
  const color = parseInt(config.color.replace("#", ""), 16);

  for (let i = 0; i < config.count; i++) {
    const g = new Graphics();
    if (weather === "fireflies") {
      g.circle(0, 0, 2.5).fill(color);
      g.circle(0, 0, 6).fill({ color, alpha: 0.1 });
      g.alpha = 0.3 + Math.random() * 0.5;
    } else if (weather === "wind") {
      g.ellipse(0, 0, 4, 1.5).fill(color);
      g.alpha = 0.35;
    } else {
      const len = weather === "rain" ? 8 : 5;
      g.rect(0, 0, 1.5, len).fill(color);
      g.alpha = 0.4 + Math.random() * 0.2;
    }
    const p: Particle = {
      x: Math.random() * w,
      y: Math.random() * h,
      speed: config.speed * (0.7 + Math.random() * 0.6),
      drift: (Math.random() - 0.5) * 2,
      graphics: g,
    };
    g.x = p.x;
    g.y = p.y;
    container.addChild(g);
    particles.push(p);
  }
}

export function updateParticles(w: number, h: number, weather: ForestWeather) {
  const t = Date.now() * 0.001;
  for (const p of particles) {
    if (weather === "fireflies") {
      p.x += Math.sin(t * 0.8 + p.y * 0.01) * 0.4;
      p.y += Math.cos(t * 0.6 + p.x * 0.01) * 0.3;
      p.graphics.alpha = 0.15 + Math.sin(t * 2 + p.x * 0.05) * 0.35;
      if (p.x < -20 || p.x > w + 20) p.x = Math.random() * w;
      if (p.y < -20 || p.y > h + 20) p.y = Math.random() * h;
    } else if (weather === "wind") {
      p.x += p.speed;
      p.y += Math.sin(p.x * 0.015 + t) * 0.8;
      if (p.x > w + 20) { p.x = -20; p.y = Math.random() * h; }
    } else {
      p.y += p.speed;
      p.x += p.drift - p.speed * 0.2;
      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w; }
      if (p.x < -20) p.x = w + 10;
    }
    p.graphics.x = p.x;
    p.graphics.y = p.y;
  }
}

// --------------- Companion animal ---------------

export function renderCompanion(
  container: Container,
  companion: string,
  tileW: number, tileH: number, ox: number, oy: number
) {
  container.removeChildren();
  if (companion === "none") return;

  const s = tileW / 64;
  const t = Date.now() * 0.001;

  if (companion === "bird") {
    const { sx, sy } = gts(7, 3, tileW, tileH, ox, oy);
    const bobY = Math.sin(t * 2) * 2 * s;
    const g = new Graphics();
    g.ellipse(sx, sy - 30 * s + bobY, 4 * s, 3 * s).fill(0x8D6E63);
    g.circle(sx + 3 * s, sy - 32 * s + bobY, 2 * s).fill(0x8D6E63);
    g.circle(sx + 4.5 * s, sy - 32 * s + bobY, 0.8 * s).fill(0x212121);
    g.poly([
      { x: sx + 5.5 * s, y: sy - 32 * s + bobY },
      { x: sx + 7.5 * s, y: sy - 31.5 * s + bobY },
      { x: sx + 5.5 * s, y: sy - 31 * s + bobY },
    ]).fill(0xFF8F00);
    container.addChild(g);
  } else if (companion === "butterfly") {
    const { sx, sy } = gts(6, 6, tileW, tileH, ox, oy);
    const flapAngle = Math.sin(t * 6) * 0.4;
    const driftX = Math.sin(t * 0.5) * 10 * s;
    const driftY = Math.cos(t * 0.7) * 5 * s;
    const g = new Graphics();
    g.ellipse(sx + driftX - 4 * s * Math.cos(flapAngle), sy - 20 * s + driftY, 4 * s, 3 * s * Math.abs(Math.cos(flapAngle))).fill(0xFFAB40);
    g.ellipse(sx + driftX + 4 * s * Math.cos(flapAngle), sy - 20 * s + driftY, 4 * s, 3 * s * Math.abs(Math.cos(flapAngle))).fill(0xFFAB40);
    g.circle(sx + driftX, sy - 20 * s + driftY, 1.5 * s).fill(0x3E2723);
    container.addChild(g);
  } else if (companion === "rabbit") {
    const { sx, sy } = gts(3, 7, tileW, tileH, ox, oy);
    const g = new Graphics();
    g.ellipse(sx, sy - 3 * s, 5 * s, 4 * s).fill(0xBCAAA4);
    g.circle(sx, sy - 9 * s, 4 * s).fill(0xBCAAA4);
    g.ellipse(sx - 2 * s, sy - 15 * s, 1.5 * s, 4 * s).fill(0xD7CCC8);
    g.ellipse(sx + 2 * s, sy - 15 * s, 1.5 * s, 4 * s).fill(0xD7CCC8);
    g.circle(sx - 1.5 * s, sy - 9.5 * s, 0.8 * s).fill(0x212121);
    g.circle(sx + 1.5 * s, sy - 9.5 * s, 0.8 * s).fill(0x212121);
    g.circle(sx, sy - 8 * s, 0.6 * s).fill(0xF48FB1);
    container.addChild(g);
  } else if (companion === "cat") {
    const { sx, sy } = gts(4, 2, tileW, tileH, ox, oy);
    const tailWave = Math.sin(t * 1.5) * 3 * s;
    const g = new Graphics();
    g.ellipse(sx, sy - 4 * s, 6 * s, 4 * s).fill(0x795548);
    g.circle(sx + 5 * s, sy - 8 * s, 4 * s).fill(0x795548);
    // Ears
    g.poly([
      { x: sx + 3 * s, y: sy - 12 * s },
      { x: sx + 4.5 * s, y: sy - 16 * s },
      { x: sx + 6 * s, y: sy - 12 * s },
    ]).fill(0x795548);
    g.poly([
      { x: sx + 6 * s, y: sy - 12 * s },
      { x: sx + 7.5 * s, y: sy - 16 * s },
      { x: sx + 9 * s, y: sy - 12 * s },
    ]).fill(0x795548);
    // Eyes
    g.circle(sx + 4 * s, sy - 8 * s, 1 * s).fill(0x4CAF50);
    g.circle(sx + 7 * s, sy - 8 * s, 1 * s).fill(0x4CAF50);
    // Tail
    g.moveTo(sx - 5 * s, sy - 3 * s);
    g.quadraticCurveTo(sx - 10 * s, sy - 10 * s + tailWave, sx - 8 * s, sy - 14 * s + tailWave);
    g.stroke({ width: 2 * s, color: 0x795548 });
    container.addChild(g);
  }
}

// --------------- Time-of-day overlay ---------------

export function renderTimeOverlay(
  container: Container, w: number, h: number, timeOfDay: string
) {
  container.removeChildren();
  if (timeOfDay === "day") return; // no overlay during day

  const overlay = new Graphics();
  if (timeOfDay === "dawn") {
    overlay.rect(0, 0, w, h).fill({ color: 0xFFCC80, alpha: 0.08 });
  } else if (timeOfDay === "evening") {
    overlay.rect(0, 0, w, h).fill({ color: 0xFF8A65, alpha: 0.1 });
  } else if (timeOfDay === "night") {
    overlay.rect(0, 0, w, h).fill({ color: 0x1A237E, alpha: 0.2 });
  }
  container.addChild(overlay);
}

// --------------- Hit detection for plant tap ---------------

let lastLayout = { tileW: 0, tileH: 0, ox: 0, oy: 0 };

export function hitTestPlant(
  screenX: number, screenY: number,
  plants: ForestPlant[]
): string | null {
  const { tileW, tileH, ox, oy } = lastLayout;
  if (tileW === 0) return null;

  let closest: { id: string; dist: number } | null = null;
  const hitRadius = tileW * 0.4;

  for (const plant of plants) {
    const { sx, sy } = gts(plant.grid_x, plant.grid_y, tileW, tileH, ox, oy);
    // Plant visual center is above the tile
    const plantCenterY = sy - tileH;
    const dx = screenX - sx;
    const dy = screenY - plantCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < hitRadius && (!closest || dist < closest.dist)) {
      closest = { id: plant.id, dist };
    }
  }

  return closest?.id ?? null;
}

// --------------- Full scene ---------------

export interface ForestRenderState {
  groundLevel: GroundLevel;
  plants: ForestPlant[];
  milestones: string[];
  weather: ForestWeather;
  avatarGridX: number;
  avatarGridY: number;
  skinTone: number;
  selectedPlantId: string | null;
  companion: string;
  timeOfDay: string;
}

export function renderFullScene(app: Application, state: ForestRenderState) {
  const { width, height } = app.screen;
  const { tileW, tileH, ox, oy } = calculateLayout(width, height);

  // Store layout for hit detection
  lastLayout = { tileW, tileH, ox, oy };

  // 8 layers: sky, ground, deco, plants, avatar, companion, particles, timeOverlay
  if (app.stage.children.length === 0) {
    for (let i = 0; i < 8; i++) app.stage.addChild(new Container());
  }

  const layers = app.stage.children as Container[];

  renderSky(layers[0], width, height, state.weather);
  renderGround(layers[1], state.groundLevel, tileW, tileH, ox, oy);
  renderDecorations(layers[2], state.milestones, tileW, tileH, ox, oy);
  renderPlants(layers[3], state.plants, tileW, tileH, ox, oy, state.selectedPlantId);
  renderAvatar(layers[4], state.avatarGridX, state.avatarGridY, tileW, tileH, ox, oy, state.skinTone);
  renderCompanion(layers[5], state.companion, tileW, tileH, ox, oy);
  renderParticles(layers[6], state.weather, width, height);
  renderTimeOverlay(layers[7], width, height, state.timeOfDay);
}

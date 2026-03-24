// ============================================================
// PixiJS isometric forest renderer
// Procedural pixel art - no external sprite sheets needed
// ============================================================

import { Application, Container, Graphics } from "pixi.js";
import type { ForestTree } from "@/types/database";
import type { GroundLevel, ForestWeather, GrowthStage, TreeSpecies } from "@/types/forest";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_WIDTH,
  TILE_HEIGHT,
} from "@/lib/floresta/constants";
import { GROUND_COLORS, TREE_COLORS, TREE_SIZES, DECORATION_COLORS, WEATHER_PARTICLES } from "./sprites";
import { calculateGrowthStage } from "@/lib/utils/forest-engine";

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
    backgroundAlpha: 0,
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

// --------------- Isometric helpers ---------------

function gridToScreen(
  gridX: number,
  gridY: number,
  offsetX: number,
  offsetY: number
): { sx: number; sy: number } {
  return {
    sx: (gridX - gridY) * (TILE_WIDTH / 2) + offsetX,
    sy: (gridX + gridY) * (TILE_HEIGHT / 2) + offsetY,
  };
}

function drawIsoDiamond(g: Graphics, x: number, y: number, w: number, h: number) {
  g.moveTo(x, y - h / 2);
  g.lineTo(x + w / 2, y);
  g.lineTo(x, y + h / 2);
  g.lineTo(x - w / 2, y);
  g.closePath();
}

// --------------- Sky ---------------

export function renderSky(
  container: Container,
  width: number,
  height: number,
  weather: ForestWeather
) {
  container.removeChildren();

  const skyColors: Record<ForestWeather, number[]> = {
    sunny:    [0x87CEEB, 0xE0F4FF],
    clear:    [0xA8D8EA, 0xE8F4F0],
    overcast: [0x8E99A4, 0xC4CCD4],
    rain:     [0x6B7B8D, 0x9EAAB6],
    storm:    [0x4A5568, 0x718096],
  };

  const [topColor, bottomColor] = skyColors[weather];
  const sky = new Graphics();

  // Simple two-band gradient
  const midY = height / 2;
  sky.rect(0, 0, width, midY).fill(topColor);
  sky.rect(0, midY, width, height - midY).fill(bottomColor);

  container.addChild(sky);
}

// --------------- Ground tilemap ---------------

export function renderGround(
  container: Container,
  groundLevel: GroundLevel,
  offsetX: number,
  offsetY: number
) {
  container.removeChildren();

  const colors = GROUND_COLORS[groundLevel];

  for (let gx = 0; gx < GRID_WIDTH; gx++) {
    for (let gy = 0; gy < GRID_HEIGHT; gy++) {
      const { sx, sy } = gridToScreen(gx, gy, offsetX, offsetY);
      const tile = new Graphics();

      // Diamond fill
      tile.poly([
        { x: sx, y: sy - TILE_HEIGHT / 2 },
        { x: sx + TILE_WIDTH / 2, y: sy },
        { x: sx, y: sy + TILE_HEIGHT / 2 },
        { x: sx - TILE_WIDTH / 2, y: sy },
      ]).fill(colors.fill);

      // Diamond stroke
      tile.poly([
        { x: sx, y: sy - TILE_HEIGHT / 2 },
        { x: sx + TILE_WIDTH / 2, y: sy },
        { x: sx, y: sy + TILE_HEIGHT / 2 },
        { x: sx - TILE_WIDTH / 2, y: sy },
      ]).stroke({ width: 1, color: colors.stroke, alpha: 0.4 });

      // Detail dots for lush ground
      if (groundLevel >= 3 && colors.detail) {
        if ((gx + gy) % 3 === 0) {
          tile.circle(sx - 5, sy - 2, 2).fill(colors.detail);
        }
        if (groundLevel >= 4 && (gx + gy) % 4 === 1) {
          // Flower dots
          tile.circle(sx + 6, sy + 1, 2).fill(0xFFEB3B);
          tile.circle(sx - 3, sy + 3, 1.5).fill(0xF48FB1);
        }
      }

      // Ash dots for burned ground
      if (groundLevel === 0 && (gx + gy) % 2 === 0) {
        tile.circle(sx + 3, sy, 1.5).fill(0x555555);
        tile.circle(sx - 4, sy + 2, 1).fill(0x444444);
      }

      container.addChild(tile);
    }
  }
}

// --------------- Trees ---------------

function drawTree(
  g: Graphics,
  x: number,
  y: number,
  species: TreeSpecies,
  stage: GrowthStage
) {
  const colors = TREE_COLORS[species];
  const size = TREE_SIZES[stage];

  // Trunk
  const trunkW = Math.max(2, size.w / 5);
  const trunkH = size.h * 0.35;
  g.rect(x - trunkW / 2, y - trunkH, trunkW, trunkH).fill(colors.trunk);

  if (stage === 0) {
    // Sapling: just a small sprout
    g.circle(x, y - trunkH - 3, 3).fill(colors.foliage);
    return;
  }

  // Foliage (layered circles for pixel art feel)
  const foliageBottom = y - trunkH;
  const foliageH = size.h * 0.65;

  if (species === "pine") {
    // Pine: triangle shape
    const layers = stage === 1 ? 2 : stage === 2 ? 3 : 4;
    for (let i = 0; i < layers; i++) {
      const layerY = foliageBottom - (foliageH / layers) * i;
      const layerW = (size.w * (layers - i)) / layers;
      g.poly([
        { x: x, y: layerY - foliageH / layers },
        { x: x + layerW / 2, y: layerY },
        { x: x - layerW / 2, y: layerY },
      ]).fill(i % 2 === 0 ? colors.foliage : colors.highlight);
    }
  } else {
    // Deciduous: round canopy
    const r = size.w / 2;
    const centerY = foliageBottom - foliageH / 2;
    g.circle(x, centerY, r).fill(colors.foliage);
    g.circle(x - r * 0.3, centerY - r * 0.3, r * 0.6).fill(colors.highlight);

    // Extra detail for large trees
    if (stage >= 2) {
      g.circle(x + r * 0.4, centerY - r * 0.1, r * 0.5).fill(colors.highlight);
    }
  }

  // Shadow
  g.ellipse(x, y + 2, size.w * 0.4, 3).fill({ color: 0x000000, alpha: 0.15 });
}

export function renderTrees(
  container: Container,
  trees: ForestTree[],
  offsetX: number,
  offsetY: number
) {
  container.removeChildren();

  // Sort by depth (gridX + gridY) for proper overlap
  const sorted = [...trees].sort(
    (a, b) => (a.grid_x + a.grid_y) - (b.grid_x + b.grid_y)
  );

  for (const tree of sorted) {
    const { sx, sy } = gridToScreen(tree.grid_x, tree.grid_y, offsetX, offsetY);
    const stage = calculateGrowthStage(tree.planted_at) as GrowthStage;
    const species = tree.species as TreeSpecies;

    const treeG = new Graphics();
    drawTree(treeG, sx, sy, species, stage);
    container.addChild(treeG);
  }
}

// --------------- Decorations ---------------

export function renderDecorations(
  container: Container,
  milestones: string[],
  offsetX: number,
  offsetY: number
) {
  container.removeChildren();

  // Rocks and stumps at fixed positions
  if (milestones.includes("rocks_stumps")) {
    const positions = [
      { x: 1, y: 8 },
      { x: 8, y: 2 },
      { x: 3, y: 6 },
    ];
    for (const pos of positions) {
      const { sx, sy } = gridToScreen(pos.x, pos.y, offsetX, offsetY);
      const g = new Graphics();
      // Rock
      g.ellipse(sx, sy - 3, 6, 4).fill(DECORATION_COLORS.rock.fill);
      g.ellipse(sx - 1, sy - 4, 4, 3).fill(DECORATION_COLORS.rock.highlight);
      container.addChild(g);
    }
  }

  // Pond
  if (milestones.includes("pond")) {
    const { sx, sy } = gridToScreen(7, 7, offsetX, offsetY);
    const g = new Graphics();
    g.ellipse(sx, sy, TILE_WIDTH * 0.6, TILE_HEIGHT * 0.5).fill(DECORATION_COLORS.pond.fill);
    g.ellipse(sx - 4, sy - 3, TILE_WIDTH * 0.3, TILE_HEIGHT * 0.2).fill(DECORATION_COLORS.pond.highlight);
    container.addChild(g);
  }

  // Cabin
  if (milestones.includes("cabin")) {
    const { sx, sy } = gridToScreen(2, 2, offsetX, offsetY);
    const g = new Graphics();
    // Wall
    g.rect(sx - 14, sy - 24, 28, 20).fill(DECORATION_COLORS.cabin.wall);
    // Roof
    g.poly([
      { x: sx - 18, y: sy - 24 },
      { x: sx, y: sy - 38 },
      { x: sx + 18, y: sy - 24 },
    ]).fill(DECORATION_COLORS.cabin.roof);
    // Door
    g.rect(sx - 4, sy - 12, 8, 12).fill(DECORATION_COLORS.cabin.door);
    // Window
    g.rect(sx + 6, sy - 20, 6, 6).fill(DECORATION_COLORS.cabin.window);
    container.addChild(g);
  }

  // Animals (simple pixel birds/rabbits)
  if (milestones.includes("animals")) {
    // Bird
    const { sx: bx, sy: by } = gridToScreen(5, 1, offsetX, offsetY);
    const bird = new Graphics();
    bird.poly([
      { x: bx - 4, y: by - 30 },
      { x: bx, y: by - 34 },
      { x: bx + 4, y: by - 30 },
    ]).stroke({ width: 1.5, color: 0x37474F });
    container.addChild(bird);

    // Rabbit
    const { sx: rx, sy: ry } = gridToScreen(6, 4, offsetX, offsetY);
    const rabbit = new Graphics();
    rabbit.circle(rx, ry - 4, 3).fill(0xBCAAA4);
    rabbit.circle(rx, ry - 8, 2.5).fill(0xBCAAA4);
    rabbit.ellipse(rx - 1.5, ry - 12, 1, 3).fill(0xD7CCC8);
    rabbit.ellipse(rx + 1.5, ry - 12, 1, 3).fill(0xD7CCC8);
    container.addChild(rabbit);
  }
}

// --------------- Avatar ---------------

export function renderAvatar(
  container: Container,
  avatarX: number,
  avatarY: number,
  offsetX: number,
  offsetY: number,
  skinTone: number
) {
  container.removeChildren();

  const { sx, sy } = gridToScreen(avatarX, avatarY, offsetX, offsetY);

  const skinColors = [0xFDBB97, 0xD4956B, 0xA0674B, 0x6B3F2E, 0x3D2317, 0xF5D6BA];
  const skin = skinColors[skinTone % skinColors.length];

  const g = new Graphics();

  // Shadow
  g.ellipse(sx, sy + 2, 6, 3).fill({ color: 0x000000, alpha: 0.15 });

  // Body
  g.rect(sx - 4, sy - 14, 8, 10).fill(0x5C6BC0);

  // Head
  g.circle(sx, sy - 18, 5).fill(skin);

  // Hair
  g.rect(sx - 5, sy - 24, 10, 4).fill(0x3E2723);

  // Eyes
  g.circle(sx - 2, sy - 18, 1).fill(0x212121);
  g.circle(sx + 2, sy - 18, 1).fill(0x212121);

  container.addChild(g);
}

// --------------- Particles ---------------

interface Particle {
  x: number;
  y: number;
  speed: number;
  graphics: Graphics;
}

let particles: Particle[] = [];

export function renderParticles(
  container: Container,
  weather: ForestWeather,
  width: number,
  height: number
) {
  container.removeChildren();
  particles = [];

  const config = WEATHER_PARTICLES[weather];
  if (!config) return;

  const color = parseInt(config.color.replace("#", ""), 16);

  for (let i = 0; i < config.count; i++) {
    const g = new Graphics();
    g.rect(0, 0, 1.5, weather === "storm" ? 8 : 5).fill(color);
    g.alpha = 0.5 + Math.random() * 0.3;

    const particle: Particle = {
      x: Math.random() * width,
      y: Math.random() * height,
      speed: config.speed * (0.8 + Math.random() * 0.4),
      graphics: g,
    };

    g.x = particle.x;
    g.y = particle.y;

    container.addChild(g);
    particles.push(particle);
  }
}

export function updateParticles(width: number, height: number) {
  for (const p of particles) {
    p.y += p.speed;
    p.x -= p.speed * 0.3;

    if (p.y > height) {
      p.y = -10;
      p.x = Math.random() * width;
    }
    if (p.x < -10) {
      p.x = width + 10;
    }

    p.graphics.x = p.x;
    p.graphics.y = p.y;
  }
}

// --------------- Fireflies ---------------

export function renderFireflies(
  container: Container,
  width: number,
  height: number,
  enabled: boolean
) {
  container.removeChildren();
  if (!enabled) return;

  for (let i = 0; i < 15; i++) {
    const g = new Graphics();
    const x = 100 + Math.random() * (width - 200);
    const y = 80 + Math.random() * (height - 160);
    g.circle(0, 0, 2).fill(0xFFEB3B);
    g.alpha = 0.3 + Math.random() * 0.5;
    g.x = x;
    g.y = y;
    container.addChild(g);
  }
}

// --------------- Full scene render ---------------

export interface ForestRenderState {
  groundLevel: GroundLevel;
  trees: ForestTree[];
  milestones: string[];
  weather: ForestWeather;
  avatarGridX: number;
  avatarGridY: number;
  skinTone: number;
}

export function renderFullScene(
  app: Application,
  state: ForestRenderState
) {
  const { width, height } = app.screen;

  // Calculate offset to center the grid
  const offsetX = width / 2;
  const offsetY = 60;

  // Create layer containers if they don't exist
  if (app.stage.children.length === 0) {
    app.stage.addChild(
      new Container(), // 0: sky
      new Container(), // 1: ground
      new Container(), // 2: decorations
      new Container(), // 3: trees
      new Container(), // 4: avatar
      new Container(), // 5: particles
      new Container(), // 6: fireflies
    );
  }

  const skyLayer = app.stage.children[0] as Container;
  const groundLayer = app.stage.children[1] as Container;
  const decoLayer = app.stage.children[2] as Container;
  const treeLayer = app.stage.children[3] as Container;
  const avatarLayer = app.stage.children[4] as Container;
  const particleLayer = app.stage.children[5] as Container;
  const fireflyLayer = app.stage.children[6] as Container;

  renderSky(skyLayer, width, height, state.weather);
  renderGround(groundLayer, state.groundLevel, offsetX, offsetY);
  renderDecorations(decoLayer, state.milestones, offsetX, offsetY);
  renderTrees(treeLayer, state.trees, offsetX, offsetY);
  renderAvatar(avatarLayer, state.avatarGridX, state.avatarGridY, offsetX, offsetY, state.skinTone);
  renderParticles(particleLayer, state.weather, width, height);
  renderFireflies(fireflyLayer, width, height, state.milestones.includes("fireflies"));
}

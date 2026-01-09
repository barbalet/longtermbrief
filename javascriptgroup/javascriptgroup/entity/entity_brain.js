/**
 * entity_brain.js
 * Chooses a simple action policy from drives + terrain.
 */

import { CLAMP } from "../constants.js";

export function brainCycle(universe, b) {
  const tile = universe.sampleAt(b.x, b.y);
  const hunger = b._drive?.hungerUrgency ?? b.hunger;
  const fatigue = b._drive?.fatigueUrgency ?? b.fatigue;

  // Priority: rest if fatigued, else seek food if hungry, else wander/social.
  if (fatigue > 0.7 && tile.safety > 0.4) {
    // stay (rest handled in bodyCycle)
    b.dx = 0; b.dy = 0;
    return;
  }

  if (hunger > 0.45) {
    // move toward remembered food if current tile isn't good
    if (tile.food < 0.5) {
      const dx = stepToward(universe.worldW, b.x, b.lastFoodX);
      const dy = stepToward(universe.worldH, b.y, b.lastFoodY);
      b.dx = dx; b.dy = dy;
      return;
    }
  }

  // wander based on terrain gradients: prefer food and safety slightly
  const best = pickBestNeighbor(universe, b.x, b.y);
  b.dx = best.dx; b.dy = best.dy;
}

function stepToward(size, from, to) {
  if (from === to) return 0;
  const direct = to - from;
  const wrap = direct > 0 ? direct - size : direct + size;
  const d = Math.abs(direct) <= Math.abs(wrap) ? direct : wrap;
  return d === 0 ? 0 : (d > 0 ? 1 : -1);
}

function pickBestNeighbor(universe, x, y) {
  let bestScore = -1e9;
  let best = {dx:0, dy:0};
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = (x + dx + universe.worldW) % universe.worldW;
      const ny = (y + dy + universe.worldH) % universe.worldH;
      const t = universe.sampleAt(nx, ny);
      const score = t.food * 1.0 + t.safety * 0.25 - t.steep * 0.2;
      if (score > bestScore) {
        bestScore = score;
        best = {dx, dy};
      }
    }
  }
  return best;
}

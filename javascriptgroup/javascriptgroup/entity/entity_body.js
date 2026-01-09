/**
 * entity_body.js
 * Basic metabolism + interaction with land resources.
 */

import { CLAMP } from "../constants.js";

export function bodyCycle(universe, b) {
  // passive metabolism
  b.energy = CLAMP(b.energy - 0.0025, 0, 1);
  b.hunger = CLAMP(b.hunger + 0.0035, 0, 1);
  b.fatigue = CLAMP(b.fatigue + 0.0020, 0, 1);

  // forage if hungry and standing on food-rich tile
  const tile = universe.sampleAt(b.x, b.y);
  if (b.hunger > 0.35 && tile.food > 0.55) {
    const eat = Math.min(0.25, tile.food * 0.25);
    b.hunger = CLAMP(b.hunger - eat, 0, 1);
    b.energy = CLAMP(b.energy + eat * 0.6, 0, 1);
    b.lastFoodX = b.x;
    b.lastFoodY = b.y;
  }

  // rest reduces fatigue (more rest if on safe tile)
  if (b.fatigue > 0.6 && tile.safety > 0.5) {
    b.fatigue = CLAMP(b.fatigue - 0.05, 0, 1);
    b.energy = CLAMP(b.energy + 0.01, 0, 1);
  }
}

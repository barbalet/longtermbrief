/**
 * entity_episodic.js
 * Minimal episodic memory: remember last good food location and drift it over time.
 */

import { CLAMP } from "../constants.js";

export function episodicCycle(universe, b) {
  // slowly forget by adding noise
  if ((universe.cycle % 64) === 0) {
    const jitter = (b.id * 17 + universe.cycle) % 3 - 1; // deterministic tiny jitter
    b.lastFoodX = (b.lastFoodX + jitter + universe.worldW) % universe.worldW;
    b.lastFoodY = (b.lastFoodY - jitter + universe.worldH) % universe.worldH;
  }
}

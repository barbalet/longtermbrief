/**
 * entity_immune.js
 * Minimal immune/parasite placeholder for this subset.
 */

import { CLAMP } from "../constants.js";

export function immuneCycle(universe, b) {
  // When stressed (hungry+fatigued), small energy leak simulates illness.
  const stress = (b.hunger + b.fatigue) * 0.5;
  if (stress > 0.7) b.energy = CLAMP(b.energy - 0.002, 0, 1);
}

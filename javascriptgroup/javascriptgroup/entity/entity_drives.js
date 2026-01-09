/**
 * entity_drives.js
 * Updates internal drives as a function of body state and environment.
 */

import { CLAMP } from "../constants.js";

export function drivesCycle(universe, b) {
  // hunger drive already encoded in b.hunger; derive "urgency" scalars for brain
  const hungerUrgency = b.hunger;
  const fatigueUrgency = b.fatigue;

  // sociability drift: lonely beings become more social; crowded become less
  const neighbors = countNeighbors(universe, b, 2);
  if (neighbors === 0) b.sociability = CLAMP(b.sociability + 0.01, 0, 1);
  if (neighbors >= 4) b.sociability = CLAMP(b.sociability - 0.01, 0, 1);

  // sex drive rises slowly if fed/rested
  if (b.hunger < 0.4 && b.fatigue < 0.5) b.sexDrive = CLAMP(b.sexDrive + 0.004, 0, 1);
  else b.sexDrive = CLAMP(b.sexDrive - 0.002, 0, 1);

  // affect (very simplified)
  b.affectPos = CLAMP(b.affectPos * 0.98 + (1 - hungerUrgency) * 0.01, 0, 1);
  b.affectNeg = CLAMP(b.affectNeg * 0.98 + hungerUrgency * 0.01 + fatigueUrgency * 0.005, 0, 1);

  b._drive = { hungerUrgency, fatigueUrgency };
}

function countNeighbors(universe, b, r) {
  let c = 0;
  for (const o of universe.beings) {
    if (!o.alive || o === b) continue;
    const dx = torusDist(universe.worldW, b.x, o.x);
    const dy = torusDist(universe.worldH, b.y, o.y);
    if (dx <= r && dy <= r) c++;
  }
  return c;
}

function torusDist(size, a, b) {
  let d = Math.abs(a - b);
  return Math.min(d, size - d);
}

/**
 * entity_social.js
 * Simplified social model: mild attraction to same-tribe when sociable, avoidance when stressed.
 */

import { CLAMP } from "../constants.js";

export function socialCycle(universe, b) {
  if (!b.alive) return;
  // apply small social "affect" based on local tribe density
  let same = 0, other = 0;
  for (const o of universe.beings) {
    if (!o.alive || o === b) continue;
    const dx = torusDist(universe.worldW, b.x, o.x);
    const dy = torusDist(universe.worldH, b.y, o.y);
    if (dx <= 1 && dy <= 1) {
      if (o.tribe === b.tribe) same++; else other++;
    }
  }

  // sociability yields positive affect near same tribe, negative near others when hungry/fatigued
  b.affectPos = CLAMP(b.affectPos + same * 0.002 * b.sociability, 0, 1);
  b.affectNeg = CLAMP(b.affectNeg + other * 0.003 * (b.hunger + b.fatigue) * 0.5, 0, 1);
}

function torusDist(size, a, b) {
  let d = Math.abs(a - b);
  return Math.min(d, size - d);
}

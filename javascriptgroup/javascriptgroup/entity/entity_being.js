/**
 * entity_being.js
 * Core per-being update orchestration.
 *
 * In C this file contains a very large amount of logic. This JS port keeps the same
 * *ordering* of responsibilities: body -> drives -> brain -> movement -> social, etc.
 *
 * NOTE: This is a pragmatic port intended to preserve the feel of the original simulation
 * loop. The full ApeSDK entity model is substantially larger than the subset shipped in
 * this zip; fields and behaviors not present here are intentionally omitted.
 */

import { CLAMP } from "../constants.js";
import { bodyCycle } from "./entity_body.js";
import { drivesCycle } from "./entity_drives.js";
import { brainCycle } from "./entity_brain.js";
import { socialCycle } from "./entity_social.js";
import { immuneCycle } from "./entity_immune.js";
import { episodicCycle } from "./entity_episodic.js";

export function beingCycle(universe, being) {
  if (!being.alive) return;

  being.age += 1;

  // 1) Physiology + homeostasis
  bodyCycle(universe, being);

  // 2) Immune / parasites (lightweight in this subset)
  immuneCycle(universe, being);

  // 3) Drives: hunger/fatigue/sex/social urge update
  drivesCycle(universe, being);

  // 4) Episodic memory update
  episodicCycle(universe, being);

  // 5) Brain selects intention / movement vector from drives + perception
  brainCycle(universe, being);

  // 6) Social interactions (very simplified)
  socialCycle(universe, being);

  // 7) Apply movement (grid wrap)
  move(universe, being);

  // 8) Death check
  if (being.energy <= 0 || being.hunger >= 1.0) {
    being.alive = false;
  }
}

function move(universe, b) {
  const w = universe.worldW, h = universe.worldH;
  // apply dx,dy in [-1,1]
  const nx = (b.x + (b.dx|0) + w) % w;
  const ny = (b.y + (b.dy|0) + h) % h;
  b.x = nx; b.y = ny;
  b.dx = 0; b.dy = 0;
}

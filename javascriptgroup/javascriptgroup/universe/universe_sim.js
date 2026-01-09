/**
 * universe_sim.js
 * JS port of the "universe" runtime: holds global simulation state and provides stepping.
 *
 * This is a faithful-*intent* port: it preserves the command-driven, cycle-based model and
 * uses the same conceptual modules (entity body/brain/drives/social/immune/episodic).
 *
 * The original C implementation uses many compile-time constants, packed structs, and
 * fixed-size arrays. In JS we use plain objects and dynamic arrays while keeping the
 * same update order.
 */

import { DEFAULT_WORLD_W, DEFAULT_WORLD_H, DEFAULT_BEINGS, CLAMP } from "../constants.js";
import { makeLand, landSample } from "../sim/sim_land.js";
import { beingCycle } from "../entity/entity_being.js";

export class Universe {
  constructor(opts = {}) {
    this.worldW = opts.worldW ?? DEFAULT_WORLD_W;
    this.worldH = opts.worldH ?? DEFAULT_WORLD_H;
    this.numBeings = opts.numBeings ?? DEFAULT_BEINGS;

    this.cycle = 0;
    this.land = makeLand(this.worldW, this.worldH, opts.seed ?? 1);

    this.beings = [];
    this._rng = mulberry32(opts.seed ?? 1);
    this.reset();
  }

  reset() {
    this.cycle = 0;
    this.beings = [];
    for (let i = 0; i < this.numBeings; i++) {
      const b = newBeing(i, this._rng, this.worldW, this.worldH);
      this.beings.push(b);
    }
  }

  step(steps = 1, shouldStop = null) {
    const n = Math.max(0, steps | 0);
    for (let s = 0; s < n; s++) {
      if (typeof shouldStop === "function" && shouldStop()) break;

      this.cycle++;
      // update each being
      for (let i = 0; i < this.beings.length; i++) {
        if (typeof shouldStop === "function" && shouldStop()) break;
        beingCycle(this, this.beings[i]);
      }
    }
  }

  status() {
    // basic stats
    const alive = this.beings.filter(b => b.alive).length;
    let avgE = 0, avgH = 0, avgF = 0;
    for (const b of this.beings) {
      avgE += b.energy;
      avgH += b.hunger;
      avgF += b.fatigue;
    }
    const n = this.beings.length || 1;
    avgE /= n; avgH /= n; avgF /= n;
    return {
      cycle: this.cycle,
      beings: this.beings.length,
      alive,
      avgEnergy: avgE,
      avgHunger: avgH,
      avgFatigue: avgF
    };
  }

  sampleAt(x, y) {
    return landSample(this.land, x, y);
  }
}

// --- minimal PRNG (deterministic) ---
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newBeing(id, rng, w, h) {
  const x = Math.floor(rng() * w);
  const y = Math.floor(rng() * h);
  return {
    id,
    name: `being_${id}`,
    alive: true,

    // position / movement
    x, y,
    dx: 0, dy: 0,

    // core body stats
    energy: 0.8 + rng() * 0.2,   // 0..1
    hunger: rng() * 0.3,         // 0..1
    fatigue: rng() * 0.2,        // 0..1

    // drives / affect
    sociability: rng() * 0.5,
    sexDrive: rng() * 0.2,
    affectPos: 0.0,
    affectNeg: 0.0,

    // simple memory
    lastFoodX: x,
    lastFoodY: y,

    // social
    tribe: id % 4,
    age: 0
  };
}

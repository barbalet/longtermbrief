'use strict';

// Minimal JS port of the entity layer from commandline.zip.
// This file intentionally keeps the surface area that universe_command expects.
//
// NOTE: The original C version has a very large and detailed simulation model.
// This JS port focuses on (a) keeping the CLI functional, and (b) providing
// consistent, deterministic-ish data for commands.

const FIRST_NAMES_M = [
  'Aru', 'Barek', 'Danu', 'Etem', 'Gor', 'Hani', 'Iru', 'Kesh', 'Lem', 'Moru', 'Neru', 'Orun',
];
const FIRST_NAMES_F = [
  'Asha', 'Bira', 'Dena', 'Eli', 'Fara', 'Hala', 'Isha', 'Kira', 'Lina', 'Mina', 'Nala', 'Oria',
];
const FAMILY_NAMES = [
  'Stone', 'Reed', 'River', 'Hill', 'Ash', 'Silt', 'Flint', 'Cedar', 'Copper', 'Tin', 'Shell', 'Salt',
];

function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, maxExclusive) {
  return Math.floor(rng() * maxExclusive);
}

function clamp(v, lo, hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

class SimulatedBeing {
  constructor(id, rng) {
    this.id = id >>> 0;
    this.gender = randInt(rng, 2); // 0 male, 1 female
    this.firstName = this.gender === 0 ? FIRST_NAMES_M[randInt(rng, FIRST_NAMES_M.length)] : FIRST_NAMES_F[randInt(rng, FIRST_NAMES_F.length)];
    this.familyName = FAMILY_NAMES[randInt(rng, FAMILY_NAMES.length)];
    this.ageDays = randInt(rng, 365 * 30); // up to ~30 years
    this.health = 50 + randInt(rng, 51); // 50..100
    this.energy = 50 + randInt(rng, 51);
    this.social = {
      // placeholders for friends/enemies/attraction sets
      friends: [],
      enemies: [],
      attraction: [],
    };
    this.braincode = randInt(rng, 1 << 30);
    this.speech = [];
    this.episodic = [];
    this.pathogens = [];
    this.alive = true;
  }

  get displayName() {
    return `${this.firstName} ${this.familyName}`;
  }
}

class SimulatedGroup {
  constructor() {
    this.num = 0;
    /** @type {SimulatedBeing[]} */
    this.beings = [];
    this.selectedIndex = 0;
    this.stepCount = 0;
    this.day = 0;
    this.randomSeed = 0;
  }
}

// --- Accessors used by command layer (names match conceptual C functions) ---

function being_get_select_name(group) {
  const b = group && group.beings && group.beings[group.selectedIndex];
  return b ? b.displayName : '(none)';
}

function being_gender_name(being) {
  // In C this returns a name-table index; for lookup, we return a stable hash-like number.
  return being ? (being.gender === 0 ? 1 : 2) : 0;
}

function being_family_name(being) {
  return being ? (Math.abs(hash32(being.familyName)) & 0xffff) : 0;
}

function hash32(str) {
  const s = String(str);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function being_find_by_name(group, name) {
  if (!group || !Array.isArray(group.beings)) return null;
  const wanted = String(name || '').trim().toLowerCase();
  if (!wanted) return null;
  for (const b of group.beings) {
    if (!b || !b.alive) continue;
    if (b.displayName.toLowerCase() === wanted) return b;
  }
  return null;
}

function being_select_by_name(group, name) {
  const b = being_find_by_name(group, name);
  if (!b) return false;
  const idx = group.beings.indexOf(b);
  if (idx >= 0) group.selectedIndex = idx;
  return true;
}

function group_summary(group) {
  const alive = group.beings.filter((b) => b && b.alive).length;
  const dead = group.beings.length - alive;
  return { alive, dead, day: group.day, stepCount: group.stepCount };
}

// --- Core evolution (lightweight; keeps CLI useful) ---

function group_init(group, seed, initialCount) {
  const rng = mulberry32(seed >>> 0);
  group.randomSeed = seed >>> 0;
  group.beings = [];
  group.selectedIndex = 0;
  group.stepCount = 0;
  group.day = 0;

  const count = Math.max(4, initialCount | 0);
  for (let i = 0; i < count; i++) {
    group.beings.push(new SimulatedBeing(i + 1, rng));
  }
  group.num = group.beings.length;
  // Seed a small, consistent social graph
  for (const b of group.beings) {
    const friend = group.beings[randInt(rng, group.beings.length)];
    if (friend && friend !== b) b.social.friends.push(friend.id);
    const enemy = group.beings[randInt(rng, group.beings.length)];
    if (enemy && enemy !== b) b.social.enemies.push(enemy.id);
  }
}

function group_cycle(group, steps, rngSeedBump) {
  // steps: number of "ticks"; every 24 ticks -> 1 day
  const rng = mulberry32((group.randomSeed + (rngSeedBump >>> 0) + group.stepCount) >>> 0);
  const ticks = Math.max(1, steps | 0);

  for (let t = 0; t < ticks; t++) {
    group.stepCount++;

    // Every 24 steps, advance one day.
    if ((group.stepCount % 24) === 0) group.day++;

    for (const b of group.beings) {
      if (!b || !b.alive) continue;

      // Age advances slowly (day-based).
      if ((group.stepCount % 24) === 0) b.ageDays++;

      // Energy/health drift with random noise.
      b.energy = clamp(b.energy + randInt(rng, 7) - 3, 0, 100);
      if (b.energy < 10) b.health = clamp(b.health - 1 - randInt(rng, 2), 0, 100);
      else if (b.energy > 60) b.health = clamp(b.health + (randInt(rng, 3) === 0 ? 1 : 0), 0, 100);

      // Occasional "speech" and episodic events
      if (randInt(rng, 200) === 0) b.speech.push(`day ${group.day}: a short utterance`);
      if (randInt(rng, 300) === 0) b.episodic.push(`day ${group.day}: a remembered encounter`);

      // Death conditions (very gentle)
      if (b.health === 0 || b.ageDays > 365 * 60) {
        b.alive = false;
      }
    }

    // Rare births to keep population non-zero
    if (group.day > 0 && randInt(rng, 500) === 0) {
      const id = group.beings.length + 1;
      const nb = new SimulatedBeing(id, rng);
      nb.ageDays = 0;
      nb.health = 80;
      nb.energy = 80;
      group.beings.push(nb);
    }
  }

  group.num = group.beings.filter((b) => b && b.alive).length;
}

module.exports = {
  SimulatedGroup,
  SimulatedBeing,

  // accessors
  being_get_select_name,
  being_gender_name,
  being_family_name,
  being_find_by_name,
  being_select_by_name,
  group_summary,

  // evolution
  group_init,
  group_cycle,
};

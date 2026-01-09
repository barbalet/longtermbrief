/**
 * universe_loop.js
 * The original C supports multithreaded iteration helpers. JS version provides synchronous loops.
 */

export function loopBeings(universe, fn) {
  for (const b of universe.beings) fn(universe, b);
}

export function beingFromName(universe, name) {
  return universe.beings.find(b => b.name === name) ?? null;
}

export function beingFindClosest(universe, x, y, predicate = null) {
  let best = null;
  let bestD = Infinity;
  for (const b of universe.beings) {
    if (!b.alive) continue;
    if (predicate && !predicate(b)) continue;
    const dx = torusDist(universe.worldW, x, b.x);
    const dy = torusDist(universe.worldH, y, b.y);
    const d = dx*dx + dy*dy;
    if (d < bestD) { bestD = d; best = b; }
  }
  return best;
}

function torusDist(size, a, b) {
  let d = Math.abs(a - b);
  return Math.min(d, size - d);
}

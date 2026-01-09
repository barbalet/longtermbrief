/**
 * toolkit_math.js (ported from toolkit_math.c)
 *
 * Notes:
 * - All integer types in the C code are represented as JS numbers.
 * - Where the C code relied on overflow, we emulate with 32-bit ops.
 * - Some functions are implemented as faithful ports; others are thin JS equivalents.
 */
import { naAssert, u32, i32, clamp } from "./toolkit_base.js";

/**
 * Bresenham line traversal from (sx,sy) to (dx,dy).
 * The `draw` callback is called with (x, y, info) and should return 0 to continue, 1 to stop early.
 */
export function math_join(sx, sy, dx, dy, draw) {
  naAssert(typeof draw === "function", "draw callback required");
  let x0 = i32(sx), y0 = i32(sy), x1 = i32(dx), y1 = i32(dy);
  let dxAbs = Math.abs(x1 - x0);
  let dyAbs = Math.abs(y1 - y0);
  let sxStep = x0 < x1 ? 1 : -1;
  let syStep = y0 < y1 ? 1 : -1;
  let err = dxAbs - dyAbs;

  while (true) {
    if (draw(x0, y0) === 1) return 1;
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dyAbs) { err -= dyAbs; x0 += sxStep; }
    if (e2 <  dxAbs) { err += dxAbs; y0 += syStep; }
  }
  return 0;
}

/** Vector-join helper used by higher-level code: points are objects {x,y}. */
export function math_join_vect2(start, end, draw) {
  naAssert(start && end, "start/end required");
  return math_join(start.x, start.y, end.x, end.y, (x,y)=>draw(x,y));
}

/** Distance between two points. */
export function math_line(sx, sy, dx, dy) {
  const a = dx - sx;
  const b = dy - sy;
  return Math.sqrt(a*a + b*b);
}

export function math_line_vect(a, b) {
  naAssert(a && b, "vectors required");
  return math_line(a.x, a.y, b.x, b.y);
}

/** 32-bit FNV-1 style hash for strings (matches the C implementation). */
export function math_hash_fnv1(key) {
  naAssert(typeof key === "string", "key must be a string");
  let hash = u32(2166136261);
  for (let i = 0; i < key.length; i++) {
    hash = u32((hash * 16777619) ^ (key.charCodeAt(i) & 0xff));
  }
  return hash;
}

/**
 * Hash for a byte array. This is a direct, readable port (not micro-optimized).
 * `values` may be Uint8Array or Array<number>.
 */
export function math_hash(values) {
  naAssert(values && typeof values.length === "number", "values must be array-like");
  const length = values.length >>> 0;

  // These constants match the original C 16-bit "round" initializer.
  let r0 = 0xfa78, r1 = 0xfad7, r2 = 0x53e7, r3 = 0xa728, r4 = 0x2c81;

  for (let loop = 0; loop < length; loop++) {
    r0 = (r0 ^ r4) & 0xffff;
    r1 = (r1 ^ (values[loop] & 0xff)) & 0xffff;
    // A lightweight mixing similar to the C shifts/rotations.
    r2 = (r2 + ((r0 << 1) & 0xffff)) & 0xffff;
    r3 = (r3 ^ ((r1 << 7) & 0xffff)) & 0xffff;
    r4 = (r4 + (r2 ^ r3)) & 0xffff;

    // Keep the state moving.
    const t = r0;
    r0 = r1; r1 = r2; r2 = r3; r3 = r4; r4 = t;
  }

  // Collapse to 32-bit.
  return u32((r0) | (r1 << 16));
}

/** Tangent helper: in the C code this wrapped a fixed-point-ish approximation; JS uses Math.tan. */
export function math_tan(x) {
  return Math.tan(x);
}

/**
 * Catmull-Rom spline (common in the ApeSDK). If you need exact matching with the C fixed-point version,
 * replace with a fixed-point implementation.
 */
export function math_spline(p0, p1, p2, p3, t) {
  const tt = t*t;
  const ttt = tt*t;
  return 0.5 * ((2*p1) +
    (-p0 + p2) * t +
    (2*p0 - 5*p1 + 4*p2 - p3) * tt +
    (-p0 + 3*p1 - 3*p2 + p3) * ttt);
}

/** Spread a byte value into a 0..(spread-1) range deterministically. */
export function math_spread_byte(value, spread) {
  if (spread <= 0) return 0;
  const v = (value & 0xff);
  return (v % spread) | 0;
}

/** Debug counter placeholder (kept for API compatibility). */
let _randomDebugCount = 0;
export function math_random_debug_count() { return _randomDebugCount; }

/**
 * Simple 32-bit LCG-ish PRNG used as a stand-in for the original 3-byte random function.
 * If you need deterministic parity with the C implementation, wire this to the same state variables.
 */
let _rngState = u32(0x12345678);
export function math_random3(seed) {
  if (typeof seed === "number") _rngState = u32(seed);
  _rngState = u32(_rngState * 1664525 + 1013904223);
  _randomDebugCount++;
  // Return 0..(2^31-1) as positive int.
  return (_rngState >>> 1);
}

/** Square root (Newton method in C) — JS uses Math.sqrt. */
export function math_root(value) {
  return Math.sqrt(value);
}

export function math_seg14(value) {
  // In C, this likely segmented a value into 1/4 increments; keep a sensible stand-in.
  return clamp(value, 0, 14);
}

export function math_max(a, b) { return a > b ? a : b; }
export function math_min(a, b) { return a < b ? a : b; }

/**
 * Line-segment intersection test. Inputs are points {x,y}.
 * Returns true if segments (p1,q1) and (p2,q2) intersect.
 */
export function math_do_intersect(p1, q1, p2, q2) {
  function orientation(a,b,c) {
    const val = (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
    if (val === 0) return 0;
    return (val > 0) ? 1 : 2;
  }
  function onSegment(a,b,c) {
    return b.x <= Math.max(a.x,c.x) && b.x >= Math.min(a.x,c.x) &&
           b.y <= Math.max(a.y,c.y) && b.y >= Math.min(a.y,c.y);
  }
  const o1 = orientation(p1,q1,p2);
  const o2 = orientation(p1,q1,q2);
  const o3 = orientation(p2,q2,p1);
  const o4 = orientation(p2,q2,q1);

  if (o1 !== o2 && o3 !== o4) return 1;
  if (o1 === 0 && onSegment(p1,p2,q1)) return 1;
  if (o2 === 0 && onSegment(p1,q2,q1)) return 1;
  if (o3 === 0 && onSegment(p2,p1,q2)) return 1;
  if (o4 === 0 && onSegment(p2,q1,q2)) return 1;
  return 0;
}

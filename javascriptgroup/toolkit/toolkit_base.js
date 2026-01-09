/**
 * Shared tiny utilities for the JS port of Simulated Ape / ApeSDK modules.
 * This repository is a mechanical port from C; numbers are JS `number`s.
 */

export function naAssert(cond, msg = "assertion failed") {
  if (!cond) throw new Error(msg);
}

export function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

export function toInt(v) {
  return v | 0;
}

export function u32(v) {
  return (v >>> 0);
}

export function i32(v) {
  return (v | 0);
}

/** Rotate-left a 32-bit unsigned integer. */
export function rol32(x, r) {
  return u32((x << r) | (x >>> (32 - r)));
}

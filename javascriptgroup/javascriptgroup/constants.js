/**
 * constants.js
 * A minimal set of constants used by the JS port.
 * NOTE: This JS port focuses on functional parity for the CLI + core simulation loop.
 * Many deeper ApeSDK constants/enums from the original headers are not required here.
 */

export const STRING_BLOCK_SIZE = 2048;

// Simulation defaults (tunable)
export const DEFAULT_WORLD_W = 128;
export const DEFAULT_WORLD_H = 128;
export const DEFAULT_BEINGS = 64;

export const CLAMP = (v, lo, hi) => (v < lo ? lo : (v > hi ? hi : v));

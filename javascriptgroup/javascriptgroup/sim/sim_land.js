/**
 * sim_land.js
 * Land generation and sampling.
 * Original C has tiles, climates, patching, etc. Here we generate a deterministic height/food/safety field.
 */

export function makeLand(w, h, seed = 1) {
  const rng = mulberry32(seed);
  const height = new Float32Array(w * h);
  const food = new Float32Array(w * h);
  const safety = new Float32Array(w * h);

  // base noise
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const nx = x / w, ny = y / h;
      const e = fbm(nx, ny, rng, 5);
      height[i] = e;
    }
  }

  // derive food/safety: food prefers mid elevations; safety prefers flatter terrain
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const e = height[i];

      const neigh = heightAt(height, w, h, x+1, y) + heightAt(height, w, h, x-1, y)
                  + heightAt(height, w, h, x, y+1) + heightAt(height, w, h, x, y-1);
      const steep = Math.abs(neigh * 0.25 - e);

      food[i] = clamp01(1.0 - Math.abs(e - 0.55) * 2.0);   // peak at ~0.55
      safety[i] = clamp01(1.0 - steep * 3.0);             // flatter = safer
    }
  }

  return { w, h, height, food, safety };
}

export function landSample(land, x, y) {
  const { w, h, height, food, safety } = land;
  const ix = ((x % w) + w) % w;
  const iy = ((y % h) + h) % h;
  const i = iy * w + ix;

  // steep estimate
  const e = height[i];
  const neigh = heightAt(height, w, h, ix+1, iy) + heightAt(height, w, h, ix-1, iy)
              + heightAt(height, w, h, ix, iy+1) + heightAt(height, w, h, ix, iy-1);
  const steep = Math.abs(neigh * 0.25 - e);

  return { height: e, food: food[i], safety: safety[i], steep };
}

function heightAt(arr, w, h, x, y) {
  const ix = ((x % w) + w) % w;
  const iy = ((y % h) + h) % h;
  return arr[iy * w + ix];
}

function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

// --- fbm noise (deterministic) ---
function fbm(x, y, rng, octaves) {
  let amp = 0.5, freq = 1.0, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise(x * freq, y * freq, rng);
    norm += amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return sum / (norm || 1);
}

function valueNoise(x, y, rng) {
  // grid-based value noise using hashed corners
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const xf = x - x0, yf = y - y0;

  const v00 = hash2(x0, y0);
  const v10 = hash2(x0+1, y0);
  const v01 = hash2(x0, y0+1);
  const v11 = hash2(x0+1, y0+1);

  const u = fade(xf);
  const v = fade(yf);

  return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v);

  function hash2(ix, iy) {
    // deterministic hash -> [0,1)
    let h = ix * 374761393 + iy * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    h = (h ^ (h >> 16)) >>> 0;
    return (h % 1000000) / 1000000;
  }
}

function fade(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

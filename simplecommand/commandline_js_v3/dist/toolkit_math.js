'use strict';

// Port of toolkit_math.c

const { SHOW_ERROR } = require('./toolkit_util');
const { vect2_populate } = require('./toolkit_vect');

// A n_join in C holds:
//  - pixel_draw(x,y,dx,dy,information) -> nonzero to abort
//  - information pointer
// In JS we represent it as { pixel_draw: fn, information: any }

function math_join(sx, sy, dx, dy, draw) {
  if (!draw || typeof draw.pixel_draw !== 'function') return 1;
  let px = sx|0;
  let py = sy|0;
  const local_draw = draw.pixel_draw;
  const local_info = draw.information;

  if (local_draw(px, py, 0, 0, local_info)) return 1;
  if ((dx|0) === 0 && (dy|0) === 0) return 0;

  let dxabs = dx|0;
  let dyabs = dy|0;
  let sdx = dxabs !== 0 ? 1 : 0;
  let sdy = dyabs !== 0 ? 1 : 0;
  if (dxabs < 0) { dxabs = -dxabs; sdx = -1; }
  if (dyabs < 0) { dyabs = -dyabs; sdy = -1; }

  if (dxabs >= dyabs) {
    let y2 = dxabs >> 1;
    for (let i = 0; i < dxabs; i++) {
      y2 += dyabs;
      if (y2 >= dxabs) { y2 -= dxabs; py += sdy; }
      px += sdx;
      if (local_draw(px, py, sdx, sdy, local_info)) return 1;
    }
  } else {
    let x2 = dyabs >> 1;
    for (let i = 0; i < dyabs; i++) {
      x2 += dxabs;
      if (x2 >= dyabs) { x2 -= dyabs; px += sdx; }
      py += sdy;
      if (local_draw(px, py, sdx, sdy, local_info)) return 1;
    }
  }
  return 0;
}

function math_join_vect2(sx, sy, vect, draw) {
  return math_join(sx, sy, (vect?.x|0), (vect?.y|0), draw);
}

function math_line_vect(point1, point2, draw) {
  if (!point1 || !point2) return 1;
  return math_line(point1.x|0, point1.y|0, point2.x|0, point2.y|0, draw);
}

function math_line(x1, y1, x2, y2, draw) {
  const dx = (x2|0) - (x1|0);
  const dy = (y2|0) - (y1|0);
  return math_join(x1|0, y1|0, dx, dy, draw);
}

function math_hash_fnv1(key) {
  // 32-bit FNV-1a
  const str = String(key ?? '');
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i) & 0xff;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function math_hash(values, length) {
  if (!values) return 0;
  const len = Math.max(0, length|0);
  let hash = 0;
  for (let i = 0; i < len; i++) {
    hash = ((hash << 5) - hash + (values[i] & 0xff)) >>> 0;
  }
  return hash >>> 0;
}

function math_tan(p) {
  if (!p) return 0;
  // Returns angle in 0..255 similar to original: uses atan2.
  let ang = Math.atan2(p.y, p.x); // -pi..pi
  if (ang < 0) ang += Math.PI * 2;
  return ((ang / (Math.PI * 2)) * 256) | 0;
}

function math_spline(start_vector, end_vector, elements, number_elements) {
  if (!start_vector || !end_vector || !Array.isArray(elements)) return 0;
  const n = Math.max(0, number_elements|0);
  if (n <= 0) return 0;

  // Simple linear interpolation between start and end, inclusive.
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    elements[i] = {
      x: (start_vector.x + (end_vector.x - start_vector.x) * t) | 0,
      y: (start_vector.y + (end_vector.y - start_vector.y) * t) | 0,
    };
  }
  return n;
}

function math_spread_byte(val) {
  // Replicates bit spreading used in original.
  const v = val & 0xff;
  return ((v << 8) | v) & 0xffff;
}

let debug_random_count = 0;

function math_random_debug_count(string) {
  debug_random_count++;
  // original optionally printed; we keep silent.
}

function math_random_debug(local_seed_obj, file_string, line_number) {
  return math_random(local_seed_obj);
}

function math_random(seed_obj) {
  // xorshift16-ish, preserving 16-bit output. seed_obj: { value: uint16 }
  if (!seed_obj || typeof seed_obj.value !== 'number') {
    return (Math.random() * 65536) & 0xffff;
  }
  let x = seed_obj.value & 0xffff;
  x ^= (x << 7) & 0xffff;
  x ^= (x >> 9) & 0xffff;
  x ^= (x << 8) & 0xffff;
  seed_obj.value = x & 0xffff;
  return seed_obj.value;
}

function math_random3(local_seed_obj) {
  // Advances RNG 3 times.
  math_random(local_seed_obj);
  math_random(local_seed_obj);
  math_random(local_seed_obj);
}

function math_root(input) {
  // Integer sqrt for 32-bit unsigned.
  let x = input >>> 0;
  if (x === 0) return 0;
  let r = Math.floor(Math.sqrt(x));
  return r >>> 0;
}

function math_seg14(character) {
  // 14-segment display mapping from original; for this port we keep a minimal mapping.
  // If you need exact mapping, extend this table.
  const ch = (typeof character === 'number') ? String.fromCharCode(character) : String(character ?? '');
  const map = {
    '0': 0x3f, '1': 0x06, '2': 0x5b, '3': 0x4f,
    '4': 0x66, '5': 0x6d, '6': 0x7d, '7': 0x07,
    '8': 0x7f, '9': 0x6f,
  };
  return map[ch] ?? 0;
}

function _orientation(p, q, r) {
  const val = ((q.y - p.y) * (r.x - q.x)) - ((q.x - p.x) * (r.y - q.y));
  if (val === 0) return 0;
  return (val > 0) ? 1 : 2;
}

function _on_segment(p, q, r) {
  return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
          q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
}

function math_do_intersect(p1, q1, p2, q2) {
  const o1 = _orientation(p1, q1, p2);
  const o2 = _orientation(p1, q1, q2);
  const o3 = _orientation(p2, q2, p1);
  const o4 = _orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return 1;
  if (o1 === 0 && _on_segment(p1, p2, q1)) return 1;
  if (o2 === 0 && _on_segment(p1, q2, q1)) return 1;
  if (o3 === 0 && _on_segment(p2, p1, q2)) return 1;
  if (o4 === 0 && _on_segment(p2, q1, q2)) return 1;
  return 0;
}

module.exports = {
  math_join,
  math_join_vect2,
  math_line_vect,
  math_line,
  math_hash_fnv1,
  math_hash,
  math_tan,
  math_spline,
  math_spread_byte,
  debug_random_count,
  math_random_debug_count,
  math_random_debug,
  math_random,
  math_random3,
  math_root,
  math_seg14,
  math_do_intersect,
};

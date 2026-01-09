/**
 * toolkit_vect.js (ported from toolkit_vect.c)
 *
 * Vector/area helpers.
 * Representation:
 * - vect2: { x: number, y: number }
 * - area2: { min: {x,y}, max: {x,y} }
 */
import { naAssert, clamp } from "./toolkit_base.js";

export function vect2(x=0,y=0){ return {x, y}; }

export function area2(min=vect2(0,0), max=vect2(0,0)){ return {min, max}; }

export function area2_add(a, b) {
  naAssert(a && b, "area2_add requires two area2 objects");
  return area2(
    vect2(Math.min(a.min.x, b.min.x), Math.min(a.min.y, b.min.y)),
    vect2(Math.max(a.max.x, b.max.x), Math.max(a.max.y, b.max.y))
  );
}

export function vect2_add(out, a, b) {
  naAssert(out && a && b, "vect2_add requires out,a,b");
  out.x = a.x + b.x;
  out.y = a.y + b.y;
}

export function vect2_subtract(out, a, b) {
  naAssert(out && a && b, "vect2_subtract requires out,a,b");
  out.x = a.x - b.x;
  out.y = a.y - b.y;
}

export function vect2_center(out, a, b) {
  naAssert(out && a && b, "vect2_center requires out,a,b");
  out.x = (a.x + b.x) / 2;
  out.y = (a.y + b.y) / 2;
}

export function vect2_scalar_multiply(out, a, s) {
  naAssert(out && a, "vect2_scalar_multiply requires out,a");
  out.x = a.x * s;
  out.y = a.y * s;
}

export function vect2_scalar_divide(out, a, s) {
  naAssert(out && a, "vect2_scalar_divide requires out,a");
  out.x = a.x / s;
  out.y = a.y / s;
}

export function vect2_divide(out, a, b) {
  naAssert(out && a && b, "vect2_divide requires out,a,b");
  out.x = b.x === 0 ? 0 : a.x / b.x;
  out.y = b.y === 0 ? 0 : a.y / b.y;
}

export function vect2_multiplier(out, a, b) {
  naAssert(out && a && b, "vect2_multiplier requires out,a,b");
  out.x = a.x * b.x;
  out.y = a.y * b.y;
}

export function vect2_d(a, b) {
  naAssert(a && b, "vect2_d requires a,b");
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx*dx + dy*dy);
}

export function vect2_dot(a, b) {
  naAssert(a && b, "vect2_dot requires a,b");
  return a.x * b.x + a.y * b.y;
}

/** Returns 1 if distance(a,b) < under, else 0 (matches the C "n_byte" style). */
export function vect2_distance_under(a, b, under) {
  return (vect2_d(a,b) < under) ? 1 : 0;
}

export function math_sine(angleRadians) {
  return Math.sin(angleRadians);
}

export function vect2_rotate90(out, a) {
  naAssert(out && a, "vect2_rotate90 requires out,a");
  out.x = -a.y;
  out.y =  a.x;
}

export function vect2_direction(out, from, to) {
  naAssert(out && from && to, "vect2_direction requires out,from,to");
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  out.x = dx / len;
  out.y = dy / len;
}

export function vect2_delta(out, a, b) {
  return vect2_subtract(out, a, b);
}

export function vect2_offset(out, a, dx, dy) {
  naAssert(out && a, "vect2_offset requires out,a");
  out.x = a.x + dx;
  out.y = a.y + dy;
}

export function vect2_copy(out, a) {
  naAssert(out && a, "vect2_copy requires out,a");
  out.x = a.x;
  out.y = a.y;
}

export function vect2_set(out, x, y) {
  naAssert(out, "vect2_set requires out");
  out.x = x; out.y = y;
}

export function vect2_zero(out) { vect2_set(out, 0, 0); }

export function vect2_length(a) { return Math.sqrt(a.x*a.x + a.y*a.y); }

export function vect2_normalize(out, a) {
  const len = vect2_length(a) || 1;
  out.x = a.x / len;
  out.y = a.y / len;
}

export function vect2_limit(out, a, maxLen) {
  const len = vect2_length(a);
  if (len <= maxLen) return vect2_copy(out,a);
  const s = maxLen / (len || 1);
  out.x = a.x * s;
  out.y = a.y * s;
}

export function vect2_compare(a,b,eps=1e-9) {
  return (Math.abs(a.x-b.x) <= eps && Math.abs(a.y-b.y) <= eps) ? 1 : 0;
}

/* ---- Mechanical stubs for remaining C functions (fill in as needed) ---- */
export function vect2_byte2(...args) { throw new Error('TODO: port vect2_byte2 from toolkit_vect.c'); }
export function vect2_scalar_bitshiftdown(...args) { throw new Error('TODO: port vect2_scalar_bitshiftdown from toolkit_vect.c'); }
export function vect2_back_byte2(...args) { throw new Error('TODO: port vect2_back_byte2 from toolkit_vect.c'); }
export function vect2_populate(...args) { throw new Error('TODO: port vect2_populate from toolkit_vect.c'); }
export function vect2_rotation(...args) { throw new Error('TODO: port vect2_rotation from toolkit_vect.c'); }
export function vect2_rotation_bitshift(...args) { throw new Error('TODO: port vect2_rotation_bitshift from toolkit_vect.c'); }
export function vect2_nonzero(...args) { throw new Error('TODO: port vect2_nonzero from toolkit_vect.c'); }
export function vect2_min_max_permutation(...args) { throw new Error('TODO: port vect2_min_max_permutation from toolkit_vect.c'); }
export function vect2_min_max(...args) { throw new Error('TODO: port vect2_min_max from toolkit_vect.c'); }
export function vect3_double(...args) { throw new Error('TODO: port vect3_double from toolkit_vect.c'); }
export function vect3_add(...args) { throw new Error('TODO: port vect3_add from toolkit_vect.c'); }
export function vect3_center(...args) { throw new Error('TODO: port vect3_center from toolkit_vect.c'); }
export function vect3_subtract(...args) { throw new Error('TODO: port vect3_subtract from toolkit_vect.c'); }
export function vect3_divide(...args) { throw new Error('TODO: port vect3_divide from toolkit_vect.c'); }
export function vect3_multiplier(...args) { throw new Error('TODO: port vect3_multiplier from toolkit_vect.c'); }
export function vect3_d(...args) { throw new Error('TODO: port vect3_d from toolkit_vect.c'); }
export function vect3_dot(...args) { throw new Error('TODO: port vect3_dot from toolkit_vect.c'); }
export function vect3_delta(...args) { throw new Error('TODO: port vect3_delta from toolkit_vect.c'); }
export function vect3_offset(...args) { throw new Error('TODO: port vect3_offset from toolkit_vect.c'); }
export function vect3_back_double(...args) { throw new Error('TODO: port vect3_back_double from toolkit_vect.c'); }
export function vect3_copy(...args) { throw new Error('TODO: port vect3_copy from toolkit_vect.c'); }
export function vect3_populate(...args) { throw new Error('TODO: port vect3_populate from toolkit_vect.c'); }
export function vect3_nonzero(...args) { throw new Error('TODO: port vect3_nonzero from toolkit_vect.c'); }
export function vect2_memory_list_number_array(...args) { throw new Error('TODO: port vect2_memory_list_number_array from toolkit_vect.c'); }
export function vect2_unwrap_number(...args) { throw new Error('TODO: port vect2_unwrap_number from toolkit_vect.c'); }
export function vect2_unwrap_number_entry(...args) { throw new Error('TODO: port vect2_unwrap_number_entry from toolkit_vect.c'); }
export function vect2_unwrap_quad(...args) { throw new Error('TODO: port vect2_unwrap_quad from toolkit_vect.c'); }
export function vect2_unwrap_line(...args) { throw new Error('TODO: port vect2_unwrap_line from toolkit_vect.c'); }

'use strict';

// Port of toolkit_vect.c

const { SHOW_ERROR } = require('./toolkit_util');

const NEW_SD_MULTIPLE = 26880;
const new_sd = [
  0, 659, 1318, 1977, 2634, 3290, 3944, 4595, 5244, 5889, 6531, 7169, 7802, 8431, 9055, 9673,
  10286, 10892, 11492, 12085, 12671, 13249, 13819, 14380, 14933, 15477, 16012, 16537, 17052, 17557, 18051, 18534,
  19007, 19467, 19916, 20353, 20778, 21190, 21590, 21976, 22349, 22709, 23055, 23387, 23706, 24009, 24299, 24573,
  24833, 25078, 25308, 25523, 25722, 25906, 26074, 26226, 26363, 26484, 26589, 26677, 26750, 26807, 26847, 26871,
  26880, 26871, 26847, 26807, 26750, 26677, 26589, 26484, 26363, 26226, 26074, 25906, 25722, 25523, 25308, 25078,
  24833, 24573, 24299, 24009, 23706, 23387, 23055, 22709, 22349, 21976, 21590, 21190, 20778, 20353, 19916, 19467,
  19007, 18534, 18051, 17557, 17052, 16537, 16012, 15477, 14933, 14380, 13819, 13249, 12671, 12085, 11492, 10892,
  10286, 9673, 9055, 8431, 7802, 7169, 6531, 5889, 5244, 4595, 3944, 3290, 2634, 1977, 1318, 659,
  0, -659, -1318, -1977, -2634, -3290, -3944, -4595, -5244, -5889, -6531, -7169, -7802, -8431, -9055, -9673,
  -10286, -10892, -11492, -12085, -12671, -13249, -13819, -14380, -14933, -15477, -16012, -16537, -17052, -17557, -18051, -18534,
  -19007, -19467, -19916, -20353, -20778, -21190, -21590, -21976, -22349, -22709, -23055, -23387, -23706, -24009, -24299, -24573,
  -24833, -25078, -25308, -25523, -25722, -25906, -26074, -26226, -26363, -26484, -26589, -26677, -26750, -26807, -26847, -26871,
  -26880, -26871, -26847, -26807, -26750, -26677, -26589, -26484, -26363, -26226, -26074, -25906, -25722, -25523, -25308, -25078,
  -24833, -24573, -24299, -24009, -23706, -23387, -23055, -22709, -22349, -21976, -21590, -21190, -20778, -20353, -19916, -19467,
  -19007, -18534, -18051, -17557, -17052, -16537, -16012, -15477, -14933, -14380, -13819, -13249, -12671, -12085, -11492, -10892,
  -10286, -9673, -9055, -8431, -7802, -7169, -6531, -5889, -5244, -4595, -3944, -3290, -2634, -1977, -1318, -659,
];

function area2_add(area, vect, first) {
  if (!area || !vect) return;
  if (first) {
    area.bottom_right = { x: vect.x, y: vect.y };
    area.top_left = { x: vect.x, y: vect.y };
    return;
  }
  if (vect.x < area.top_left.x) area.top_left.x = vect.x;
  if (vect.y < area.top_left.y) area.top_left.y = vect.y;
  if (vect.x > area.bottom_right.x) area.bottom_right.x = vect.x;
  if (vect.y > area.bottom_right.y) area.bottom_right.y = vect.y;
}

function vect2_byte2(converter, input) {
  if (!converter || !input) return;
  converter.x = input[0] | 0;
  converter.y = input[1] | 0;
}

function vect2_add(equals, initial, second) {
  if (!equals || !initial || !second) return;
  equals.x = (initial.x + second.x) | 0;
  equals.y = (initial.y + second.y) | 0;
}

function vect2_center(center, initial, second) {
  if (!center || !initial || !second) return;
  center.x = ((initial.x + second.x) >> 1) | 0;
  center.y = ((initial.y + second.y) >> 1) | 0;
}

function vect2_scalar_multiply(value, multiplier) {
  if (!value) return;
  value.x = (value.x * (multiplier|0)) | 0;
  value.y = (value.y * (multiplier|0)) | 0;
}

function vect2_scalar_divide(value, divisor) {
  if (!value) return;
  const d = divisor|0;
  if (d === 0) return;
  value.x = ((value.x / d) | 0);
  value.y = ((value.y / d) | 0);
}

function vect2_scalar_bitshiftdown(value, bitshiftdown) {
  if (!value) return;
  const b = bitshiftdown|0;
  value.x = value.x >> b;
  value.y = value.y >> b;
}

function vect2_subtract(equals, initial, second) {
  if (!equals || !initial || !second) return;
  equals.x = (initial.x - second.x) | 0;
  equals.y = (initial.y - second.y) | 0;
}

function vect2_divide(equals, initial, second, divisor) {
  if (!equals || !initial || !second) return;
  const d = divisor|0;
  if (d === 0) return;
  equals.x = (((initial.x - second.x) / d) | 0);
  equals.y = (((initial.y - second.y) / d) | 0);
}

function vect2_multiplier(equals, initial, second, multiplier, divisor) {
  if (!equals || !initial || !second) return;
  const m = multiplier|0;
  const d = divisor|0;
  if (d === 0) return;
  equals.x = (((initial.x * m) + (second.x * (d - m))) / d) | 0;
  equals.y = (((initial.y * m) + (second.y * (d - m))) / d) | 0;
}

function vect2_d(initial, second, multiplier, divisor) {
  if (!initial || !second) return;
  const tmp = { x: 0, y: 0 };
  vect2_multiplier(tmp, initial, second, multiplier, divisor);
  initial.x = tmp.x;
  initial.y = tmp.y;
}

function vect2_dot(initial, second, multiplier, divisor) {
  if (!initial || !second) return 0;
  const m = multiplier|0;
  const d = divisor|0;
  if (d === 0) return 0;
  const vx = (initial.x * m) / d;
  const vy = (initial.y * m) / d;
  const wx = (second.x * m) / d;
  const wy = (second.y * m) / d;
  return ((vx * wx) + (vy * wy)) | 0;
}

function vect2_distance_under(first, second, distance) {
  if (!first || !second) return 0;
  const dx = (first.x - second.x) | 0;
  const dy = (first.y - second.y) | 0;
  const dsq = dx*dx + dy*dy;
  return dsq < (distance|0)*(distance|0) ? 1 : 0;
}

function math_sine(direction, divisor) {
  const d = divisor|0;
  if (d === 0) return 0;
  let dir = direction|0;
  // Match C behavior: wrap to 0..255
  dir &= 255;
  return ((new_sd[dir] * NEW_SD_MULTIPLE) / d) | 0;
}

function vect2_rotate90(rotation) {
  if (!rotation) return;
  const x = rotation.x;
  rotation.x = -rotation.y;
  rotation.y = x;
}

function vect2_direction(initial, direction, divisor) {
  if (!initial) return;
  const d = divisor|0;
  if (d === 0) return;
  initial.x = math_sine((direction + 64) & 255, d);
  initial.y = math_sine(direction & 255, d);
}

function vect2_delta(initial, delta) {
  if (!initial || !delta) return;
  initial.x = (initial.x + delta.x) | 0;
  initial.y = (initial.y + delta.y) | 0;
}

function vect2_offset(initial, dx, dy) {
  if (!initial) return;
  initial.x = (initial.x + (dx|0)) | 0;
  initial.y = (initial.y + (dy|0)) | 0;
}

function vect2_back_byte2(converter, output) {
  if (!converter || !output) return;
  output[0] = converter.x & 0xFFFF;
  output[1] = converter.y & 0xFFFF;
}

function vect2_copy(to, from) {
  if (!to || !from) return;
  to.x = from.x | 0;
  to.y = from.y | 0;
}

function vect2_populate(value, x, y) {
  if (!value) return;
  value.x = x | 0;
  value.y = y | 0;
}

function vect2_rotation(location, rotation) {
  if (!location || !rotation) return;
  const x = location.x;
  const y = location.y;
  location.x = ((x * rotation.x) - (y * rotation.y)) / NEW_SD_MULTIPLE;
  location.y = ((x * rotation.y) + (y * rotation.x)) / NEW_SD_MULTIPLE;
  location.x |= 0;
  location.y |= 0;
}

function vect2_rotation_bitshift(location, rotation) {
  if (!location || !rotation) return;
  const x = location.x;
  const y = location.y;
  // In C uses >> 15 etc; here keep same by scaling with 32768.
  location.x = ((x * rotation.x) - (y * rotation.y)) >> 15;
  location.y = ((x * rotation.y) + (y * rotation.x)) >> 15;
}

function vect2_nonzero(nonzero) {
  if (!nonzero) return 0;
  return (nonzero.x !== 0 || nonzero.y !== 0) ? 1 : 0;
}

function vect2_min_max_permutation(points, minmax) {
  if (!points || !minmax) return;
  // points: array of vect2; minmax: array length 2 where [0]=min,[1]=max
  const min = minmax[0];
  const max = minmax[1];
  for (const p of points) {
    if (p.x < min.x) min.x = p.x;
    if (p.y < min.y) min.y = p.y;
    if (p.x > max.x) max.x = p.x;
    if (p.y > max.y) max.y = p.y;
  }
}

function vect2_min_max(points, number, maxmin) {
  if (!points || !maxmin) return;
  if (number <= 0) return;
  let minx = points[0].x, miny = points[0].y, maxx = points[0].x, maxy = points[0].y;
  for (let i=1;i<number;i++) {
    const p = points[i];
    if (p.x < minx) minx = p.x;
    if (p.y < miny) miny = p.y;
    if (p.x > maxx) maxx = p.x;
    if (p.y > maxy) maxy = p.y;
  }
  maxmin.top_left = { x: minx|0, y: miny|0 };
  maxmin.bottom_right = { x: maxx|0, y: maxy|0 };
}

// vect3 operations (double precision)
function vect3_double(converter, input) {
  if (!converter || !input) return;
  converter.x = Number(input[0]);
  converter.y = Number(input[1]);
  converter.z = Number(input[2]);
}

function vect3_add(equals, initial, second) {
  if (!equals || !initial || !second) return;
  equals.x = initial.x + second.x;
  equals.y = initial.y + second.y;
  equals.z = initial.z + second.z;
}

function vect3_center(center, initial, second) {
  if (!center || !initial || !second) return;
  center.x = (initial.x + second.x) / 2;
  center.y = (initial.y + second.y) / 2;
  center.z = (initial.z + second.z) / 2;
}

function vect3_subtract(equals, initial, second) {
  if (!equals || !initial || !second) return;
  equals.x = initial.x - second.x;
  equals.y = initial.y - second.y;
  equals.z = initial.z - second.z;
}

function vect3_divide(equals, initial, second, divisor) {
  if (!equals || !initial || !second) return;
  const d = Number(divisor);
  if (d === 0) return;
  equals.x = (initial.x - second.x) / d;
  equals.y = (initial.y - second.y) / d;
  equals.z = (initial.z - second.z) / d;
}

function vect3_multiplier(equals, initial, second, multiplier, divisor) {
  if (!equals || !initial || !second) return;
  const m = Number(multiplier);
  const d = Number(divisor);
  if (d === 0) return;
  equals.x = ((initial.x * m) + (second.x * (d - m))) / d;
  equals.y = ((initial.y * m) + (second.y * (d - m))) / d;
  equals.z = ((initial.z * m) + (second.z * (d - m))) / d;
}

function vect3_d(initial, second, multiplier, divisor) {
  if (!initial || !second) return;
  const tmp = { x: 0, y: 0, z: 0 };
  vect3_multiplier(tmp, initial, second, multiplier, divisor);
  initial.x = tmp.x;
  initial.y = tmp.y;
  initial.z = tmp.z;
}

function vect3_dot(initial, second, multiplier, divisor) {
  if (!initial || !second) return 0;
  const m = Number(multiplier);
  const d = Number(divisor);
  if (d === 0) return 0;
  const vx = (initial.x * m) / d;
  const vy = (initial.y * m) / d;
  const vz = (initial.z * m) / d;
  const wx = (second.x * m) / d;
  const wy = (second.y * m) / d;
  const wz = (second.z * m) / d;
  return (vx*wx) + (vy*wy) + (vz*wz);
}

function vect3_delta(initial, delta) {
  if (!initial || !delta) return;
  initial.x += delta.x;
  initial.y += delta.y;
  initial.z += delta.z;
}

function vect3_offset(initial, dx, dy, dz) {
  if (!initial) return;
  initial.x += Number(dx);
  initial.y += Number(dy);
  initial.z += Number(dz);
}

function vect3_back_double(converter, output) {
  if (!converter || !output) return;
  output[0] = converter.x;
  output[1] = converter.y;
  output[2] = converter.z;
}

function vect3_copy(to, from) {
  if (!to || !from) return;
  to.x = from.x;
  to.y = from.y;
  to.z = from.z;
}

function vect3_populate(value, x, y, z) {
  if (!value) return;
  value.x = Number(x);
  value.y = Number(y);
  value.z = Number(z);
}

function vect3_nonzero(nonzero) {
  if (!nonzero) return 0;
  return (nonzero.x !== 0 || nonzero.y !== 0 || nonzero.z !== 0) ? 1 : 0;
}

// Object/JSON unwrap stubs (not present in this minimal source set)
function vect2_unwrap_number(array, entry, number) {
  SHOW_ERROR('vect2_unwrap_number not implemented in JS port');
  return -1;
}
function vect2_unwrap_number_entry(pass_through, buffer, number) {
  SHOW_ERROR('vect2_unwrap_number_entry not implemented in JS port');
  return -1;
}
function vect2_unwrap_quad(pass_through, buffer) {
  SHOW_ERROR('vect2_unwrap_quad not implemented in JS port');
  return -1;
}
function vect2_unwrap_line(pass_through, buffer) {
  SHOW_ERROR('vect2_unwrap_line not implemented in JS port');
  return -1;
}

module.exports = {
  NEW_SD_MULTIPLE,
  new_sd,
  area2_add,
  vect2_byte2,
  vect2_add,
  vect2_center,
  vect2_scalar_multiply,
  vect2_scalar_divide,
  vect2_scalar_bitshiftdown,
  vect2_subtract,
  vect2_divide,
  vect2_multiplier,
  vect2_d,
  vect2_dot,
  vect2_distance_under,
  math_sine,
  vect2_rotate90,
  vect2_direction,
  vect2_delta,
  vect2_offset,
  vect2_back_byte2,
  vect2_copy,
  vect2_populate,
  vect2_rotation,
  vect2_rotation_bitshift,
  vect2_nonzero,
  vect2_min_max_permutation,
  vect2_min_max,
  vect3_double,
  vect3_add,
  vect3_center,
  vect3_subtract,
  vect3_divide,
  vect3_multiplier,
  vect3_d,
  vect3_dot,
  vect3_delta,
  vect3_offset,
  vect3_back_double,
  vect3_copy,
  vect3_populate,
  vect3_nonzero,
  vect2_unwrap_number,
  vect2_unwrap_number_entry,
  vect2_unwrap_quad,
  vect2_unwrap_line,
};

'use strict';

// Port of toolkit_io.c

const { SHOW_ERROR } = require('./toolkit_util');

function io_lower(value, length) {
  if (typeof value !== 'string') return '';
  const n = Math.max(0, Math.min(length | 0, value.length));
  return value.slice(0, n).toLowerCase() + value.slice(n);
}

/**
 * Read a number from a string. This mirrors io_number() in toolkit_io.c.
 *
 * Returns an object:
 * { readChars, actual_value, decimal_divisor }
 * If parsing fails, readChars is -1.
 */
function io_number(number_string) {
  if (typeof number_string !== 'string' || number_string.length === 0) {
    return { readChars: -1, actual_value: 0, decimal_divisor: 0 };
  }

  let temp = 0n;
  let divisor = 0; // 0 means "no decimal seen"; 1+ means in decimal part
  let ten_power_place = 0;
  let string_point = 0;
  let negative = false;

  if (number_string[0] === '-') {
    negative = true;
    string_point++;
  }

  while (true) {
    const value = number_string[string_point++];
    if (value === undefined || value === '\0') {
      let translate = Number(temp);
      if (negative) translate = -translate;
      if (divisor > 0) divisor--;
      return { readChars: ten_power_place, actual_value: translate, decimal_divisor: divisor };
    }

    if (value === '.') {
      if (divisor !== 0) {
        SHOW_ERROR('double decimal point in number');
        return { readChars: -1, actual_value: 0, decimal_divisor: 0 };
      }
      divisor = 1;
    } else {
      if (value < '0' || value > '9') {
        SHOW_ERROR('number contains non-numeric value');
        return { readChars: -1, actual_value: 0, decimal_divisor: 0 };
      }
      const mod_ten = BigInt(value.charCodeAt(0) - '0'.charCodeAt(0));

      // Guard against going beyond safe integer bounds. The original code
      // had 64-bit specific checks. Here we clamp to JS safe integer.
      const next = temp * 10n + mod_ten;
      if (next > BigInt(Number.MAX_SAFE_INTEGER)) {
        SHOW_ERROR('number numerically too large');
        return { readChars: -1, actual_value: 0, decimal_divisor: 0 };
      }
      temp = next;
      ten_power_place++;
      if (divisor !== 0) divisor++;
    }
  }
}

function io_length(value, max) {
  if (typeof value !== 'string') return 0;
  const m = Math.max(0, max | 0);
  return Math.min(value.length, m);
}

/**
 * Find a substring in a bounded buffer.
 * Mirrors the C implementation which returns the index+1 of the last matched
 * character when a full match completes, otherwise -1.
 */
function io_find(check, from, max, value_find, value_find_length) {
  if (typeof check !== 'string' || typeof value_find !== 'string') return -1;
  const start = Math.max(0, from | 0);
  const limit = Math.max(0, max | 0);
  const wantLen = Math.max(0, value_find_length | 0);
  if (wantLen === 0) return -1;

  let check_length = 0;
  for (let loop = start; loop < limit; loop++) {
    if (check[loop] === value_find[check_length]) {
      check_length++;
      if (check_length === wantLen) {
        return loop + 1; // end index + 1
      }
    } else {
      check_length = 0;
    }
  }
  return -1;
}

function io_string_write(dest, insert, posObj) {
  // In C this wrote into a buffer; in JS we build a string.
  // posObj = { pos } mutates.
  if (!posObj || typeof posObj.pos !== 'number') throw new Error('posObj missing');
  const before = dest.slice(0, posObj.pos);
  const after = dest.slice(posObj.pos);
  const out = before + insert + after;
  posObj.pos += insert.length;
  return out;
}

function io_three_string_combination(first, second, third, count) {
  const c = Math.max(0, count | 0);
  const left = `${first || ''}${second || ''}`;
  const padLen = Math.max(1, c - left.length);
  const padding = ' '.repeat(padLen);
  return `${left}${padding}${third || ''}`;
}

function io_number_to_string(number) {
  const n = Number(number >>> 0);
  return String(n);
}

function io_string_number(input_string, number) {
  return `${input_string || ''}${io_number_to_string(number)}`;
}

function io_three_strings(first, second, third, new_line) {
  const line = `${first || ''}${second || ''}${third || ''}`;
  return new_line ? `${line}\n` : line;
}

function io_string_copy(string) {
  return String(string || '');
}

function io_string_copy_buffer(string, buffer) {
  // C copies string into buffer. JS returns new string.
  return String(string || '') + '';
}

function io_assert(message, file_loc, line) {
  SHOW_ERROR(`Soft Assert: ${String(message)} (${String(file_loc)}:${Number(line)})`);
}

module.exports = {
  io_lower,
  io_number,
  io_length,
  io_find,
  io_string_write,
  io_three_string_combination,
  io_number_to_string,
  io_string_number,
  io_three_strings,
  io_string_copy,
  io_string_copy_buffer,
  io_assert,
};

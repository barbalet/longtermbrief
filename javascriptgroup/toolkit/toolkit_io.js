/**
 * toolkit_io.js (ported from toolkit_io.c)
 *
 * These are string helpers used throughout the codebase.
 */
import { naAssert } from "./toolkit_base.js";

export function io_lower(value) {
  naAssert(typeof value === "string", "io_lower expects string");
  return value.toLowerCase();
}

export function io_length(value) {
  naAssert(typeof value === "string", "io_length expects string");
  return value.length;
}

export function io_find(haystack, needle, start=0) {
  naAssert(typeof haystack === "string" && typeof needle === "string", "io_find expects strings");
  const idx = haystack.indexOf(needle, start|0);
  return idx < 0 ? -1 : idx;
}

export function io_string_write(dest, insert, posObj) {
  // C version writes into a char buffer with an index pointer.
  // JS version returns concatenated string and updated position.
  naAssert(typeof dest === "string" && typeof insert === "string", "io_string_write expects strings");
  const pos = posObj?.pos ?? dest.length;
  const out = dest.slice(0, pos) + insert + dest.slice(pos);
  const newPos = pos + insert.length;
  if (posObj) posObj.pos = newPos;
  return out;
}

export function io_three_string_combination(a,b,c) {
  return String(a ?? "") + String(b ?? "") + String(c ?? "");
}

export function io_number_to_string(num) {
  return String(num|0);
}

export function io_string_number(str) {
  const n = parseInt(str, 10);
  return Number.isFinite(n) ? n : 0;
}

export function io_string_copy(str) {
  return String(str ?? "");
}

export function io_string_copy_buffer(str, maxLen) {
  const s = String(str ?? "");
  return s.length <= maxLen ? s : s.slice(0, maxLen);
}

export function io_assert(cond, msg="io_assert failed") {
  if (!cond) throw new Error(msg);
}

/* Stubs for less-used C helpers. */
export function io_number(...args){ throw new Error("TODO: port io_number from toolkit_io.c"); }
export function io_three_strings(...args){ throw new Error("TODO: port io_three_strings from toolkit_io.c"); }

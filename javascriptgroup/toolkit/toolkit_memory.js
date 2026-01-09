/**
 * toolkit_memory.js (ported from toolkit_memory.c)
 *
 * In C these functions manage manual allocation and list structures.
 * In JS we model them with objects/arrays and rely on GC.
 */
import { naAssert } from "./toolkit_base.js";

/** memory_execute_set/run are hooks for debugging allocators in C; kept as no-ops. */
export function memory_execute_set(_fn) { /* no-op in JS */ }
export function memory_execute_run() { /* no-op in JS */ }

export function memory_copy(src) {
  if (src == null) return src;
  if (Array.isArray(src)) return src.slice();
  if (src instanceof Uint8Array) return new Uint8Array(src);
  if (typeof src === "object") return structuredClone ? structuredClone(src) : JSON.parse(JSON.stringify(src));
  return src;
}

export function memory_free(_value) { /* GC handles this */ }

export function memory_erase(value) {
  if (Array.isArray(value)) { value.length = 0; return; }
  if (value && typeof value === "object") {
    for (const k of Object.keys(value)) delete value[k];
  }
}

/** List helpers: represent lists as JS arrays. */
export function memory_list_copy(list, add) {
  const out = Array.isArray(list) ? list.slice() : [];
  out.push(add);
  return out;
}
export function memory_list_free(_list) { /* GC */ }

export function int_list_copy(list, int_add) {
  return memory_list_copy(list, int_add|0);
}
export function int_list_free(_list) { /* GC */ }
export function int_list_find(list, value) {
  if (!Array.isArray(list)) return -1;
  return list.indexOf(value|0);
}
export function int_list_debug(list) {
  return Array.isArray(list) ? list.join(",") : "";
}

/**
 * number_array_list_* emulate the C "number array" primitive:
 * We'll represent it as { arr: number[] }.
 */
export function number_array_list_new() { return { arr: [] }; }
export function number_array_list_free(_na) { /* GC */ }
export function number_array_list_copy(na, add) {
  const out = { arr: (na?.arr ?? []).slice() };
  out.arr.push(Number(add));
  return out;
}
export function number_array_list_find(na, value) {
  return (na?.arr ?? []).indexOf(Number(value));
}
export function number_array_list_find_add(na, value) {
  const v = Number(value);
  const idx = number_array_list_find(na, v);
  if (idx >= 0) return idx;
  na.arr.push(v);
  return na.arr.length - 1;
}
export function number_array_not_number(v) { return !Number.isFinite(Number(v)) ? 1 : 0; }
export function number_array_number(v) { return Number(v); }
export function number_array_get_number(na, idx) { return Number(na?.arr?.[idx] ?? 0); }
export function number_array_get_size(na) { return (na?.arr ?? []).length; }

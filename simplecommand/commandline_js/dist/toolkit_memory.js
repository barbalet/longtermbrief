'use strict';

// Port of toolkit_memory.c

const { SHOW_ERROR } = require('./toolkit_util');

let static_execution = null;

function memory_execute_set(fn) {
  static_execution = fn;
}

function memory_execute_run() {
  if (typeof static_execution === 'function') static_execution();
}

function memory_copy(fromBuf, toBuf, number) {
  if (!fromBuf || !toBuf) return;
  const n = Math.max(0, number | 0);
  for (let i = 0; i < n; i++) toBuf[i] = fromBuf[i];
}

function memory_new(bytes) {
  const n = Math.max(0, bytes | 0);
  return Buffer.alloc(n);
}

function memory_free(ptrObj) {
  // C sets pointer to 0; in JS we null it if we were given a ref wrapper
  if (ptrObj && Object.prototype.hasOwnProperty.call(ptrObj, 'value')) {
    ptrObj.value = null;
  }
}

function memory_new_range(memory_min, memory_allocated_obj) {
  // JS allocations either succeed or throw; we emulate by trying and shrinking.
  let alloc = Math.max(0, memory_allocated_obj.value | 0);
  const min = Math.max(0, memory_min | 0);
  while (alloc > min) {
    try {
      const buf = Buffer.alloc(alloc);
      memory_allocated_obj.value = alloc;
      return buf;
    } catch {
      alloc = (alloc * 3) >> 2;
    }
  }
  return null;
}

function memory_erase(buf, nestop) {
  if (!buf) return;
  const n = Math.max(0, nestop | 0);
  buf.fill(0, 0, Math.min(n, buf.length));
}

class memory_list {
  constructor(unit_size, max) {
    this.count = 0;
    this.max = max >>> 0;
    this.unit_size = unit_size >>> 0;
    this.data = Buffer.alloc(this.unit_size * this.max);
  }
}

function memory_list_new(size, number) {
  try {
    return new memory_list(size >>> 0, number >>> 0);
  } catch {
    return null;
  }
}

function memory_list_copy(list, data, size) {
  if (!list || !data) return;
  const unit = list.unit_size >>> 0;
  if (unit !== (size >>> 0)) {
    SHOW_ERROR('wrong base unit size');
    return;
  }
  if (list.count >= list.max) {
    SHOW_ERROR('Out of Bounds failure');
    return;
  }
  const off = list.count * unit;
  for (let i = 0; i < unit; i++) list.data[off + i] = data[i];
  list.count++;
}

function memory_list_free(valueObj) {
  if (valueObj && valueObj.value) {
    valueObj.value.data = null;
    valueObj.value = null;
  }
}

// int_list is an alias of memory_list in the C header; here we represent ints
// as a JS array for simplicity.
class int_list {
  constructor(max) {
    this.values = [];
    this.max = max >>> 0;
  }
}

function int_list_new(max) {
  return new int_list(max >>> 0);
}

function int_list_copy(list, int_add) {
  if (!list) return;
  if (list.values.length >= list.max) {
    SHOW_ERROR('Out of Bounds failure');
    return;
  }
  list.values.push(int_add | 0);
}

function int_list_free(obj) {
  if (obj && obj.value) obj.value = null;
}

function int_list_find(list, location, errorObj) {
  if (!list || !Array.isArray(list.values)) {
    if (errorObj) errorObj.value = 1;
    return 0;
  }
  const idx = location | 0;
  if (idx < 0 || idx >= list.values.length) {
    if (errorObj) errorObj.value = 1;
    SHOW_ERROR('Out of Bounds failure');
    return 0;
  }
  if (errorObj) errorObj.value = 0;
  return list.values[idx] | 0;
}

function int_list_debug(debug_list) {
  if (!debug_list) return;
  process.stdout.write(`[int_list count=${debug_list.values.length}] ${debug_list.values.join(', ')}\n`);
}

class number_array {
  constructor() {
    this.number = null; // int_list
    this.array = null; // arbitrary
  }
}

class number_array_list {
  constructor() {
    this.items = [];
  }
}

function number_array_list_free(obj) {
  if (obj && obj.value) obj.value = null;
}

function number_array_not_number(na) {
  if (!na) return;
  na.number = null;
  na.array = null;
}

function number_array_number(na, number) {
  if (!na) return;
  na.number = int_list_new(1);
  int_list_copy(na.number, number | 0);
}

function number_array_get_number(na, location, errorObj) {
  if (!na || !na.number) {
    if (errorObj) errorObj.value = 1;
    return 0;
  }
  return int_list_find(na.number, location | 0, errorObj);
}

function number_array_get_size(na) {
  if (!na || !na.number) {
    SHOW_ERROR('number array not present (size)');
    return -1;
  }
  return na.number.values.length;
}

module.exports = {
  memory_execute_set,
  memory_execute_run,
  memory_copy,
  memory_new,
  memory_free,
  memory_new_range,
  memory_erase,
  memory_list,
  memory_list_new,
  memory_list_copy,
  memory_list_free,
  int_list,
  int_list_new,
  int_list_copy,
  int_list_free,
  int_list_find,
  int_list_debug,
  number_array,
  number_array_list,
  number_array_list_free,
  number_array_not_number,
  number_array_number,
  number_array_get_number,
  number_array_get_size,
};

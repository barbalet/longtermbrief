#!/usr/bin/env node
"use strict";

(function(){
  const __modules = Object.create(null);
  __modules["./main.js"] = function(require, module, exports){
'use strict';

// Command console entry point.
// Adds:
//  - --help / -h
//  - --run N : auto-exit after N commands (useful for non-interactive runs)
//  - SIGINT (Ctrl+C) graceful shutdown

const {
  console_help,
  console_quit,
  console_cycle,
  console_out,
  make_readline_input,
  console_quit_base,
} = require('./toolkit_console');

const { draw_error } = require('./toolkit_util');

const control_commands = [
  { function: console_help, command: 'help',  addition: '[(command)]', help_information: 'Displays a list of all the commands' },
  { function: console_quit, command: 'quit',  addition: '', help_information: 'Quits the console' },
  { function: console_quit, command: 'exit',  addition: '', help_information: '' },
  { function: console_quit, command: 'close', addition: '', help_information: '' },
  { function: null, command: null, addition: null, help_information: null },
];

function printHelp() {
  const msg = [
    'commandsource (Node.js) - simple command console',
    '',
    'Usage:',
    '  commandsource [--run N]',
    '',
    'Options:',
    '  -h, --help        Show this help and exit',
    '  --run N           Exit after N commands have been processed',
    '  --prompt TEXT     Set the prompt text (default: "> ")',
    '  --no-prompt       Disable prompt (useful when piping input)',
    '',
    'Examples:',
    '  commandsource',
    '  commandsource --run 3',
    '  printf "help\nquit\n" | commandsource --no-prompt',
    '',
  ].join('\n');
  process.stdout.write(msg);
}

function parseArgs(argv) {
  const out = { help: false, run: null, prompt: '> ', noPrompt: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      out.help = true;
    } else if (a === '--run') {
      const v = argv[++i];
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) throw new Error(`--run expects a positive integer, got: ${v}`);
      out.run = Math.floor(n);
    } else if (a === '--prompt') {
      out.prompt = String(argv[++i] ?? '');
    } else if (a === '--no-prompt') {
      out.noPrompt = true;
    } else {
      throw new Error(`Unknown option: ${a} (try --help)`);
    }
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  if (opts.help) {
    printHelp();
    return;
  }

  const prompt = opts.noPrompt ? '' : opts.prompt;
  const io = make_readline_input(prompt);

  let remaining = opts.run;
  const onSigint = () => {
    // Match C-style "graceful" behavior: request exit and close readline.
    console_quit_base();
    try { io.close(); } catch (_) {}
  };

  process.on('SIGINT', onSigint);

  try {
    if (prompt) {
      console_out('Type help for commands. Ctrl+C or quit to exit.');
    }

    while (true) {
      const rv = await console_cycle(
        null,
        control_commands,
        io.readLine,
        console_out
      );

      if (remaining != null) {
        remaining--;
        if (remaining <= 0) break;
      }

      if (rv !== 0) break;
    }
  } catch (e) {
    draw_error(e?.message || String(e), 'main.js', 0);
    process.exitCode = 1;
  } finally {
    process.off('SIGINT', onSigint);
    io.close();
  }
}

if (require.main === module || global.__COMMANDSOURCE_BUNDLE__) {
  main();
}

  };
  __modules["./toolkit.js"] = function(require, module, exports){
'use strict';

// Convenience barrel file.

module.exports = {
  ...require('./toolkit_util'),
  ...require('./toolkit_io'),
  ...require('./toolkit_memory'),
  ...require('./toolkit_vect'),
  ...require('./toolkit_math'),
  ...require('./toolkit_console'),
};

  };
  __modules["./toolkit_console.js"] = function(require, module, exports){
'use strict';

// Port of toolkit_console.c

const readline = require('readline');
const { io_length, io_find, io_three_string_combination } = require('./toolkit_io');
const { SHOW_ERROR } = require('./toolkit_util');

let local_commands = null;
let console_line_execution = 0;
let console_line_external_exit = 0;

function console_line_execution_set() {
  console_line_execution = 1;
}

function console_line_execution_get() {
  return console_line_execution;
}

function console_entry_execution(argc, argv) {
  if (Array.isArray(argv)) {
    if (argc === 2 && typeof argv[1] === 'string' && argv[1][1] === 'c') {
      console_line_execution_set();
    }
  }
}

function console_help_line(specific, output_function) {
  const line = io_three_string_combination(specific.command, specific.addition, specific.help_information, 28);
  output_function(line);
}

function console_help(ptr, response, output_function) {
  let loop = 0;
  let response_len = 0;
  let found = 0;

  if (response) response_len = io_length(response, 1024);

  if (response_len === 0) {
    output_function('Commands:');
  }

  while (local_commands && local_commands[loop] && local_commands[loop].function) {
    const cmd = local_commands[loop];
    if (cmd.help_information && cmd.help_information[0] !== '\0' && cmd.help_information.length !== 0) {
      if (response_len === 0) {
        console_help_line(cmd, output_function);
      } else {
        const command_len = io_length(cmd.command, 1024);
        const count = io_find(response, 0, response_len, cmd.command, command_len);
        if (count === command_len) {
          console_help_line(cmd, output_function);
          found = 1;
        }
      }
    }
    loop++;
  }

  if (response_len !== 0 && found === 0) {
    SHOW_ERROR('Command not found, type help for more information');
  }
  return 0;
}

function console_quit(ptr, response, output_function) {
  return 1;
}

function console_out(value) {
  process.stdout.write(`${String(value)}\n`);
}

function console_quit_base() {
  console_line_external_exit = 1;
}

async function console_cycle(ptr, commands, input_function, output_function) {
  local_commands = commands;

  if (!commands || !commands.length || !commands[0] || (!commands[0].command && !commands[0].function)) {
    return SHOW_ERROR('No commands provided');
  }

  const buffer = await input_function();
  if (buffer == null) {
    return SHOW_ERROR('Console failure');
  }

  let line = String(buffer);
  let buffer_len = io_length(line, 4096);

  // Strip CR/LF like the C code.
  while (buffer_len > 0 && (line[buffer_len - 1] === '\n' || line[buffer_len - 1] === '\r')) {
    line = line.slice(0, buffer_len - 1);
    buffer_len--;
  }

  if (buffer_len === 0) return 0;

  for (let loop = 0; loop < commands.length; loop++) {
    const cmd = commands[loop];
    if (!cmd || !cmd.command || !cmd.function) break;

    const command_len = io_length(cmd.command, 1024);
    const count = io_find(line, 0, buffer_len, cmd.command, command_len);
    if (count !== -1) {
      // count is end index + 1
      const ch = line[count];
      let response = null;
      if (ch === ' ') response = line.slice(count + 1);
      else if (ch === undefined) response = null;
      else if (ch === '\0') response = null;
      else if (count === buffer_len) response = null;

      const rv = cmd.function(ptr, response, output_function);
      if (console_line_external_exit) return 1;
      return rv;
    }
  }

  SHOW_ERROR('Command not found, type help for more information');
  return 0;
}

function make_readline_input(prompt = '> ') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  let pendingResolve = null;

  rl.on('SIGINT', () => {
    // Graceful Ctrl+C: resolve any pending read, then close.
    if (pendingResolve) {
      const r = pendingResolve;
      pendingResolve = null;
      r('');
    }
    console_quit_base();
    rl.close();
  });

  rl.on('close', () => {
    if (pendingResolve) {
      const r = pendingResolve;
      pendingResolve = null;
      r(null);
    }
  });

  return {
    async readLine() {
      return new Promise((resolve) => {
        pendingResolve = resolve;
        rl.question(prompt, (answer) => {
          pendingResolve = null;
          resolve(answer);
        });
      });
    },
    close() {
      try { rl.close(); } catch (_) {}
    },
  };
}
module.exports = {
  console_line_execution_set,
  console_line_execution_get,
  console_entry_execution,
  console_help,
  console_quit,
  console_out,
  console_quit_base,
  console_cycle,
  make_readline_input,
};

  };
  __modules["./toolkit_io.js"] = function(require, module, exports){
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

  };
  __modules["./toolkit_math.js"] = function(require, module, exports){
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

  };
  __modules["./toolkit_memory.js"] = function(require, module, exports){
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

  };
  __modules["./toolkit_util.js"] = function(require, module, exports){
'use strict';

// Shared helpers for the JS port.

function draw_error(error_text, location, line_number) {
  const loc = location || 'unknown';
  const line = Number.isFinite(line_number) ? line_number : 0;
  process.stderr.write(`ERROR: ${String(error_text)} @ ${loc} ${line}\n`);
  return -1;
}

// C macro SHOW_ERROR(val) -> draw_error(val, __FILE__, __LINE__).
// In JS, we don't have those macros, so we use a stable location.
function SHOW_ERROR(val) {
  return draw_error(val, 'js', 0);
}

module.exports = {
  draw_error,
  SHOW_ERROR,
};

  };
  __modules["./toolkit_vect.js"] = function(require, module, exports){
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

  };
  const __cache = Object.create(null);
  function __require(id){
    if (__cache[id]) return __cache[id].exports;
    const fn = __modules[id];
    if (!fn) throw new Error(`Cannot find module: ${id}`);
    const module = { exports: {} };
    __cache[id] = module;
    const localRequire = (rel) => {
      if (rel.startsWith("./")) {
        const id = rel.endsWith(".js") ? rel : (rel + ".js");
        return __require(id);
      }
      return require(rel);
    };
    fn(localRequire, module, module.exports);
    return module.exports;
  }
  global.__COMMANDSOURCE_BUNDLE__ = true;
  __require("./main.js");
})();

'use strict';

// Simulation driver (console-only) for the JS port.
// This follows the high-level structure of universe_sim.c + longterm.c.

const { console_cycle, console_out, console_help, console_quit } = require('./toolkit_console');
const { SHOW_ERROR } = require('./toolkit_util');
const { SimulatedGroup, group_init, group_cycle } = require('./entity');
const { makeControlCommands, parseRunDays } = require('./universe_command');

const TIMING_STEPS_PER_DAY = 24;

// Internal state
const group = new SimulatedGroup();

let consoleInput = null;
let consoleOutput = console_out;

// Script runner state
let pendingScriptLines = null;
let pendingScriptIndex = 0;

// Allows embedding similar to the C fake_input/fake_output interface.
function sim_set_console_input(fn) {
  if (typeof fn === 'function') consoleInput = fn;
}

function sim_set_console_output(fn) {
  if (typeof fn === 'function') consoleOutput = fn;
}

function sim_group() {
  return group;
}

function sim_init(kind, seed, mapArea, flags) {
  // kind/mapArea/flags are kept for compatibility with C signature.
  const initialCount = 64; // reasonable default for console output
  group_init(group, seed >>> 0, initialCount);
  return 0;
}

function sim_cycle() {
  // One "logging interval" step in the original is larger; here we tick one hour.
  group_cycle(group, 1, 0);
  return 0;
}

function sim_close() {
  // no-op
  return 0;
}

function sim_new_run_condition() {
  // In the original, this checks for group->num == 0 and triggers a new run.
  return group.num === 0 ? 1 : 0;
}

// --- Console commands that depend on sim driver ---

function command_step(ptr, response, output) {
  // Run for one logging interval: intervalDays * TIMING_STEPS_PER_DAY ticks.
  const { getIntervalDays } = require('./universe_runtime_state');
  const ticks = Math.max(1, getIntervalDays() * TIMING_STEPS_PER_DAY);
  group_cycle(ptr, ticks, 1);
  output(`step: advanced ${getIntervalDays()} day(s) (ticks=${ticks}). Day=${ptr.day}`);
  return 0;
}

function command_run(ptr, response, output) {
  const { getIntervalDays } = require('./universe_runtime_state');
  const days = parseRunDays(response);
  if (days == null) return SHOW_ERROR('run expects a time format like 10, 10d, 24h, 2w, 1y, or forever');

  if (days === Infinity) {
    output('run: forever (press Ctrl+C or type stop/quit)');
    // For the JS port, we simulate a capped "forever" to avoid locking up scripts.
    // Interactive users can chain repeated runs.
    const capDays = 365; // one year cap per command
    const ticks = capDays * TIMING_STEPS_PER_DAY;
    group_cycle(ptr, ticks, 2);
    output(`run: (capped) advanced ${capDays} day(s). Day=${ptr.day}`);
    return 0;
  }

  const targetDays = Math.max(0, days);
  const ticks = Math.max(1, Math.round(targetDays * TIMING_STEPS_PER_DAY));
  group_cycle(ptr, ticks, 2);
  output(`run: advanced ${targetDays} day(s) (ticks=${ticks}). Day=${ptr.day}`);
  return 0;
}

// --- Interactive driver ---

async function runConsole(opts) {
  const readline = require('readline');

  const runLimit = Number.isFinite(opts.run) ? opts.run : null;

  // Console input: prefer a pending script, else readline.
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let runCount = 0;

  const rlInput = async () => new Promise((resolve) => rl.question(opts.noPrompt ? '' : (opts.prompt || '> '), (ans) => resolve(ans)));

  async function inputFn() {
    if (pendingScriptLines) {
      while (pendingScriptIndex < pendingScriptLines.length) {
        const line = pendingScriptLines[pendingScriptIndex++];
        if (line.trim().length === 0) continue;
        // echo script command if interactive prompt disabled? keep simple:
        return line + '\n';
      }
      pendingScriptLines = null;
      pendingScriptIndex = 0;
    }
    const ans = await rlInput();
    return ans == null ? null : (String(ans) + '\n');
  }

  // Allow Ctrl+C to exit gracefully.
  process.on('SIGINT', () => {
    rl.close();
    process.stdout.write('\n');
    process.exit(0);
  });

  // Init banner similar to C longterm.c
  consoleOutput(`\n *** Simulated Ape Console, ${new Date().toDateString()} ***`);
  consoleOutput(`      For a list of commands type 'help'\n`);

  // Initialize sim
  sim_init(1, opts.seed >>> 0, 0, 0);

  // Build command table.
  const control_commands = makeControlCommands({ console_help, console_quit });

  // Insert run/step near run commands location. Keep consistent names.
  // We'll inject before the terminator.
  const termIdx = control_commands.findIndex((c) => !c || c.function === null);
  const injectAt = termIdx >= 0 ? termIdx : control_commands.length;
  control_commands.splice(injectAt, 0,
    { function: command_run, command: 'run', addition: '(time format)|forever', help_information: 'Simulate for a given number of days or forever' },
    { function: command_step, command: 'step', addition: '', help_information: 'Run for a single logging interval' },
  );

  // Ensure terminator exists
  if (!control_commands.some((c) => c && c.function === null)) {
    control_commands.push({ function: null, command: null, addition: null, help_information: null });
  }

  // Main loop: one line per console_cycle call.
  while (true) {
    const quit = await console_cycle(group, control_commands, inputFn, consoleOutput);
    runCount++;

    // If a command produced a "script request" object, handle it:
    // The command function returns 0/1, so we can't directly see it here.
    // Instead, we piggyback on a global set by command_script via runtime_state.
    const { consumePendingScriptText } = require('./universe_runtime_state');
    const scriptText = consumePendingScriptText();
    if (scriptText) {
      pendingScriptLines = scriptText.split(/\r?\n/);
      pendingScriptIndex = 0;
    }

    if (quit) break;
    if (runLimit && runCount >= runLimit) break;

    if (sim_new_run_condition()) {
      consoleOutput(`new run at day ${group.day}`);
      sim_init(1, (opts.seed + group.stepCount) >>> 0, 0, 0);
    }
  }

  rl.close();
}

module.exports = {
  sim_group,
  sim_init,
  sim_cycle,
  sim_close,
  sim_set_console_input,
  sim_set_console_output,
  runConsole,

  command_run,
  command_step,
};

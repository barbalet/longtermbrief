'use strict';

// Command handlers for the commandline JS port.
// The original C implementation contains extensive reporting and graphing.
// Here we keep the same *command surface* so scripts and muscle-memory still work.

const { SHOW_ERROR } = require('./toolkit_util');
const { getIntervalDays, setIntervalDays, setPendingScriptText } = require('./universe_runtime_state');
const { io_length } = require('./toolkit_io');
const {
  being_get_select_name,
  being_select_by_name,
  being_find_by_name,
  group_summary,
} = require('./entity');

let simulation_running = 1;
let simulation_executing = 0;

let watchType = 'none'; // 'none' | 'all' | 'one'
let watchName = '';

let loggingEnabled = 0;
let eventMode = 'on'; // on|social|off

function command_executing() {
  return simulation_executing;
}

function command_quit(ptr, response, output) {
  simulation_running = 0;
  simulation_executing = 0;
  output('Quitting.');
  return 1;
}

function command_stop(ptr, response, output) {
  simulation_executing = 0;
  output('Stopped.');
  return 0;
}

function command_being(ptr, response, output) {
  output(being_get_select_name(ptr));
  return 0;
}

function command_simulation(ptr, response, output) {
  const s = group_summary(ptr);
  output(`Day: ${s.day}  Step: ${s.stepCount}  Alive: ${s.alive}  Inactive: ${s.dead}`);
  output(`Interval (days): ${getIntervalDays()}`);
  output(`Logging: ${loggingEnabled ? 'on' : 'off'}  Events: ${eventMode}`);
  return 0;
}

function parseRunDays(arg) {
  if (!arg) return null;
  const a = String(arg).trim().toLowerCase();
  if (!a) return null;
  if (a === 'forever') return Infinity;

  // Accept a few common formats used in scripts:
  //  - 10 (days)
  //  - 10d, 24h, 2w, 1y
  const m = a.match(/^(\d+)\s*([dhwy])?$/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2] || 'd';
  if (!Number.isFinite(n) || n < 0) return null;

  if (unit === 'h') return n / 24;
  if (unit === 'd') return n;
  if (unit === 'w') return n * 7;
  if (unit === 'y') return n * 365;
  return n;
}

function command_interval(ptr, response, output) {
  if (!response) {
    output(`Interval is ${getIntervalDays()} day(s).`);
    return 0;
  }
  const n = Number(String(response).trim());
  if (!Number.isFinite(n) || n <= 0) return SHOW_ERROR('interval expects a positive number of days');
  setIntervalDays(Math.floor(n));
  output(`Interval set to ${getIntervalDays()} day(s).`);
  return 0;
}

function command_logging(ptr, response, output) {
  const a = (response || '').trim().toLowerCase();
  if (!a) {
    output(`Logging is ${loggingEnabled ? 'on' : 'off'}.`);
    return 0;
  }
  if (a === 'on') loggingEnabled = 1;
  else if (a === 'off') loggingEnabled = 0;
  else return SHOW_ERROR('logging expects on|off');
  output(`Logging ${loggingEnabled ? 'enabled' : 'disabled'}.`);
  return 0;
}

function command_event(ptr, response, output) {
  const a = (response || '').trim().toLowerCase();
  if (!a) {
    output(`Event mode is ${eventMode}.`);
    return 0;
  }
  if (a === 'on' || a === 'social' || a === 'off') {
    eventMode = a;
    output(`Event mode set to ${eventMode}.`);
    return 0;
  }
  return SHOW_ERROR('event expects on|social|off');
}

function command_list(ptr, response, output) {
  const names = ptr.beings.filter((b) => b && b.alive).map((b) => b.displayName);
  for (const n of names) output(n);
  output(`${names.length} ape(s).`);
  return 0;
}

function command_top(ptr, response, output) {
  const alive = ptr.beings.filter((b) => b && b.alive);
  alive.sort((a, b) => (b.health - a.health) || (b.energy - a.energy));
  const top = alive.slice(0, 10);
  if (top.length === 0) {
    output('(none)');
    return 0;
  }
  for (const b of top) {
    output(`${b.displayName}  health=${b.health}  energy=${b.energy}  ageDays=${b.ageDays}`);
  }
  return 0;
}

function command_watch(ptr, response, output) {
  const a = (response || '').trim();
  if (!a) {
    if (watchType === 'none') output('watch: off');
    else if (watchType === 'all') output('watch: all');
    else output(`watch: ${watchName}`);
    return 0;
  }

  const lower = a.toLowerCase();
  if (lower === 'off') {
    watchType = 'none';
    watchName = '';
    output('watch: off');
    return 0;
  }
  if (lower === 'all') {
    watchType = 'all';
    watchName = '';
    output('watch: all');
    return 0;
  }

  // select by name
  const ok = being_select_by_name(ptr, a);
  if (!ok) return SHOW_ERROR('Named ape not found');
  watchType = 'one';
  watchName = being_get_select_name(ptr);
  output(`watch: ${watchName}`);
  return 0;
}

function command_next(ptr, response, output) {
  if (!ptr || !Array.isArray(ptr.beings) || ptr.beings.length === 0) return 0;
  let idx = ptr.selectedIndex | 0;
  for (let i = 0; i < ptr.beings.length; i++) {
    idx = (idx + 1) % ptr.beings.length;
    const b = ptr.beings[idx];
    if (b && b.alive) {
      ptr.selectedIndex = idx;
      output(being_get_select_name(ptr));
      return 0;
    }
  }
  output('(none)');
  return 0;
}

function command_prev(ptr, response, output) {
  if (!ptr || !Array.isArray(ptr.beings) || ptr.beings.length === 0) return 0;
  let idx = ptr.selectedIndex | 0;
  for (let i = 0; i < ptr.beings.length; i++) {
    idx = (idx - 1 + ptr.beings.length) % ptr.beings.length;
    const b = ptr.beings[idx];
    if (b && b.alive) {
      ptr.selectedIndex = idx;
      output(being_get_select_name(ptr));
      return 0;
    }
  }
  output('(none)');
  return 0;
}

function command_stats(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`ageDays=${target.ageDays}  health=${target.health}  energy=${target.energy}`);
  output(`braincode=${target.braincode}`);
  return 0;
}

function command_appearance(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`appearance: (JS port placeholder)`);
  return 0;
}

function command_genome(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`genome: (JS port placeholder)`);
  return 0;
}

function command_speech(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  if (target.speech.length === 0) output('(no speech records)');
  else for (const s of target.speech.slice(-20)) output(s);
  return 0;
}

function command_episodic(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  if (target.episodic.length === 0) output('(no episodic records)');
  else for (const e of target.episodic.slice(-20)) output(e);
  return 0;
}

function command_braincode(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`braincode=${target.braincode}`);
  return 0;
}

function command_probes(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`probes: (JS port placeholder)`);
  return 0;
}

function command_social_graph(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  output(`friends: ${target.social.friends.join(', ') || '(none)'}`);
  output(`enemies: ${target.social.enemies.join(', ') || '(none)'}`);
  output(`attraction: ${target.social.attraction.join(', ') || '(none)'}`);
  return 0;
}

function command_pathogen_graph(ptr, response, output) {
  const target = response ? being_find_by_name(ptr, response) : (ptr.beings[ptr.selectedIndex] || null);
  if (!target) return SHOW_ERROR('Ape not found');
  output(`${target.displayName}`);
  if (!target.pathogens.length) output('(no pathogens)');
  else for (const p of target.pathogens) output(String(p));
  return 0;
}

function command_file(ptr, response, output) {
  output('File format info: (JS port placeholder; see original C docs/source)');
  return 0;
}

function command_save(ptr, response, output) {
  const fs = require('fs');
  const path = require('path');
  const file = (response && response.trim()) ? response.trim() : 'realtime.json';
  const data = {
    version: 1,
    day: ptr.day,
    stepCount: ptr.stepCount,
    beings: ptr.beings,
  };
  fs.writeFileSync(path.resolve(file), JSON.stringify(data, null, 2));
  output(`Saved: ${file}`);
  return 0;
}

function command_open(ptr, response, output) {
  const fs = require('fs');
  const path = require('path');
  const file = (response && response.trim()) ? response.trim() : 'realtime.json';
  const p = path.resolve(file);
  const raw = fs.readFileSync(p, 'utf8');
  const obj = JSON.parse(raw);
  if (!obj || !Array.isArray(obj.beings)) return SHOW_ERROR('Invalid save file');
  ptr.beings = obj.beings;
  ptr.day = obj.day | 0;
  ptr.stepCount = obj.stepCount | 0;
  ptr.selectedIndex = 0;
  ptr.num = ptr.beings.filter((b) => b && b.alive).length;
  output(`Loaded: ${file}`);
  return 0;
}

function command_script(ptr, response, output) {
  // Simple script runner: read file line by line and execute in the same console engine.
  const fs = require('fs');
  const path = require('path');
  const file = (response && response.trim()) ? response.trim() : '';
  if (!file) return SHOW_ERROR('script expects a filename');
  const p = path.resolve(file);
  const text = fs.readFileSync(p, 'utf8');
  output(`Running script: ${file}`);
  setPendingScriptText(text);
  return 0;
}

// For compatibility with the C command table: always return a number.
// Some commands (script) return a special object for the JS driver to handle.
function normalizeReturn(v) {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object') return 0;
  return 0;
}

function makeControlCommands(extraConsole) {
  // extraConsole should provide console_help and console_quit base handlers.
  const { console_help, console_quit } = extraConsole;

  const cmds = [
    { function: console_help, command: 'help', addition: '[(command)]', help_information: 'Displays a list of all the commands' },

    { function: command_script, command: 'script', addition: '[file]', help_information: 'Load an ApeScript simulation file' },
    { function: command_save, command: 'save', addition: '[file]', help_information: 'Save a simulation file' },
    { function: command_open, command: 'open', addition: '[file]', help_information: 'Load a simulation file' },
    { function: command_open, command: 'load', addition: '', help_information: '' },

    { function: command_quit, command: 'quit', addition: '', help_information: 'Quits the console' },
    { function: command_quit, command: 'exit', addition: '', help_information: '' },
    { function: command_quit, command: 'close', addition: '', help_information: '' },

    { function: command_stop, command: 'stop', addition: '', help_information: 'Stop the simulation during step or run' },

    { function: command_file, command: 'file', addition: '[(component)]', help_information: 'Information on the file format' },
    { function: null, command: null, addition: null, help_information: null },
  ];

  // Add common introspection commands.
  const more = [
    { function: command_simulation, command: 'simulation', addition: '', help_information: '' },
    { function: command_simulation, command: 'sim', addition: '', help_information: 'Show simulation parameters' },

    { function: command_watch, command: 'watch', addition: '(ape name)|all|off|*', help_information: 'Watch (specific *) for the current ape' },
    { function: command_watch, command: 'monitor', addition: '', help_information: '' },

    { function: command_being, command: 'ape', addition: '', help_information: 'Name of the currently watched ape' },
    { function: command_being, command: 'pwd', addition: '', help_information: '' },

    { function: command_list, command: 'list', addition: '', help_information: 'List all ape names' },
    { function: command_list, command: 'ls', addition: '', help_information: '' },
    { function: command_list, command: 'dir', addition: '', help_information: '' },

    { function: command_top, command: 'top', addition: '', help_information: 'List the top apes' },

    { function: command_next, command: 'next', addition: '', help_information: 'Next ape' },
    { function: command_prev, command: 'prev', addition: '', help_information: 'Previous ape' },

    { function: command_stats, command: 'stats', addition: '(ape name)', help_information: '* Show parameters for a named ape' },
    { function: command_stats, command: 'status', addition: '', help_information: '' },

    { function: command_appearance, command: 'appearance', addition: '(ape name)', help_information: '* Show appearance values for a named ape' },
    { function: command_appearance, command: 'physical', addition: '', help_information: '' },

    { function: command_genome, command: 'genome', addition: '(ape name)', help_information: 'Show genome for a named ape' },
    { function: command_genome, command: 'genetics', addition: '', help_information: '' },

    { function: command_braincode, command: 'braincode', addition: '(ape name)', help_information: '* Show braincode for a named ape' },
    { function: command_speech, command: 'speech', addition: '(ape name)', help_information: '* Show speech for a named ape' },

    { function: command_episodic, command: 'episodic', addition: '(ape name)', help_information: '* Show episodic memory for a named ape' },
    { function: command_probes, command: 'probes', addition: '(ape name)', help_information: '* Show brain probes for a named ape' },

    { function: command_pathogen_graph, command: 'pathogen', addition: '(ape name)', help_information: '* Show pathogens for a named ape' },
    { function: command_social_graph, command: 'graph', addition: '(ape name)', help_information: '* Show social graph for a named ape' },
    { function: command_social_graph, command: 'social', addition: '', help_information: '' },
    { function: command_social_graph, command: 'friends', addition: '', help_information: '' },

    { function: command_interval, command: 'interval', addition: '(days)', help_information: 'Set the simulation logging interval in days' },
    { function: command_event, command: 'event', addition: 'on|social|off', help_information: 'Episodic events (all) on, social on or all off' },
    { function: command_logging, command: 'logging', addition: 'on|off', help_information: 'Turn logging of images and data on or off' },
    { function: command_logging, command: 'log', addition: '', help_information: '' },
  ];

  // splice before terminator
  cmds.splice(cmds.length - 1, 0, ...more);

  // ensure terminator
  if (cmds[cmds.length - 1].function !== null) cmds.push({ function: null, command: null, addition: null, help_information: null });

  return cmds;
}

module.exports = {
  makeControlCommands,
  command_executing,
  command_quit,
  command_stop,
  parseRunDays, // used by sim driver
};

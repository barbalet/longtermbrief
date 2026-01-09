/**
 * universe_command.js
 * Command parsing and dispatch for the JS port.
 *
 * The C version has extensive command tables and file I/O. This port preserves a
 * straightforward CLI, with compatible concepts: reset, run/step, status, help, quit.
 */

import { Universe } from "./universe_sim.js";

export function createCommandHost(opts = {}) {
  const uni = new Universe(opts);
  let _stopRequested = false;
  const shouldStop = () => _stopRequested;
  const requestStop = () => { _stopRequested = true; };
  const clearStop = () => { _stopRequested = false; };

  const commands = {
    help: {
      usage: "help [command]",
      desc: "Show help",
      fn: (args, out) => {
        const name = args[0];
        if (name && commands[name]) {
          out(`${name}: ${commands[name].desc}\nusage: ${commands[name].usage}`);
          return;
        }
        out("Commands:");
        for (const [k,v] of Object.entries(commands)) out(`  ${k.padEnd(10)} ${v.desc}`);
        out("Type 'help <command>' for details.");
      }
    },
    status: {
      usage: "status",
      desc: "Show current simulation summary",
      fn: (_args, out) => {
        const s = uni.status();
        out(`cycle=${s.cycle} beings=${s.beings} alive=${s.alive} avgEnergy=${s.avgEnergy.toFixed(3)} avgHunger=${s.avgHunger.toFixed(3)} avgFatigue=${s.avgFatigue.toFixed(3)}`);
      }
    },
    step: {
      usage: "step [n]",
      desc: "Advance simulation by n cycles (default 1)",
      fn: (args, out) => {
        const n = args[0] ? parseInt(args[0], 10) : 1;
        clearStop();
        uni.step(Number.isFinite(n) ? n : 1, shouldStop);
        if (shouldStop()) out("Interrupted.");
        commands.status.fn([], out);
      }
    },
    run: {
      usage: "run <n>",
      desc: "Alias for step n",
      fn: (args, out) => commands.step.fn(args, out)
    },
    reset: {
      usage: "reset",
      desc: "Reset simulation (new population, cycle=0)",
      fn: (_args, out) => { uni.reset(); out("ok"); }
    },
    inspect: {
      usage: "inspect <id>",
      desc: "Print a single being state",
      fn: (args, out) => {
        const id = parseInt(args[0] ?? "", 10);
        const b = uni.beings.find(bb => bb.id === id);
        if (!b) { out("not found"); return; }
        out(JSON.stringify(b, null, 2));
      }
    },
    quit: {
      usage: "quit",
      desc: "Exit",
      fn: (_args, out, ctx) => { ctx.quit = true; }
    },
    exit: {
      usage: "exit",
      desc: "Exit",
      fn: (_args, out, ctx) => { ctx.quit = true; }
    }
  };

  return { universe: uni, commands, requestStop, clearStop, shouldStop };
}

export function executeLine(host, line, out) {
  const ctx = { quit: false };
  const cleaned = (line ?? "").trim();
  if (!cleaned) return ctx;
  const parts = cleaned.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const entry = host.commands[cmd];
  if (!entry) {
    out(`Unknown command '${cmd}'. Type 'help'.`);
    return ctx;
  }
  entry.fn(args, out, ctx);
  return ctx;
}

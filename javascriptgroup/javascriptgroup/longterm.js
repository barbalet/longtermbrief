/**
 * longterm.js
 * Entry point for the JS port.
 *
 * Examples:
 *   node longterm.js                 # interactive console
 *   node longterm.js --seed 123      # interactive with seed
 *   node longterm.js --run 10000     # non-interactive: run N cycles then exit
 *   node longterm.js --run 10000 --status-every 1000
 */

import { runConsole, runBatch } from "./sim/sim_console.js";
import pkg from "./package.json" assert { type: "json" };

function parseArgs(argv) {
  const out = { seed: 1, run: null, statusEvery: 0, numBeings: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const nxt = () => (i + 1 < argv.length ? argv[++i] : null);

    if (a === "--seed") out.seed = parseInt(nxt(), 10) || 1;
    else if (a === "--run") out.run = Math.max(0, parseInt(nxt(), 10) || 0);
    else if (a === "--status-every") out.statusEvery = Math.max(0, parseInt(nxt(), 10) || 0);
    else if (a === "--beings") out.numBeings = Math.max(1, parseInt(nxt(), 10) || 0);
    else if (a === "--help" || a === "-h") out.help = true;
    else {
      // ignore unknown flags to stay forgiving
    }
  }
  return out;
}

function printHelp() {
  console.log("" );
  console.log("Usage: node longterm.js [--seed N] [--run N] [--status-every N] [--beings N]" );
  console.log("" );
  console.log("  --seed N          RNG seed (default 1)" );
  console.log("  --run N           Run N cycles non-interactively, then exit" );
  console.log("  --status-every N  When used with --run, print status every N cycles" );
  console.log("  --beings N        Number of beings (default from constants)" );
  console.log("" );
  console.log("Interactive commands: help, status, step [n], run <n>, inspect <id>, reset, quit" );
  console.log("");
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printHelp();
  process.exit(0);
}

const opts = {
  seed: args.seed,
  numBeings: args.numBeings ?? undefined,
  versionName: (pkg.name ? pkg.name + " " : "") + "",
  fullDate: new Date().toDateString()
};

// Graceful Ctrl+C in non-interactive mode: we can't interrupt a tight loop unless
// the simulator checks a flag — which it does via host.requestStop/shouldStop.
let sigint = false;
process.on("SIGINT", () => { sigint = true; });

if (typeof args.run === "number" && args.run !== null) {
  const host = runBatch(opts, 0);
  const out = (s = "") => process.stdout.write(String(s) + "\n");

  // print banner aligned with longterm.c style
  out("");
  out(` *** ${opts.versionName}Console, ${opts.fullDate} ***`);
  out("      For a list of commands type 'help'");
  out("");

  const total = args.run | 0;
  const every = args.statusEvery | 0;

  const uni = host.universe;
  const shouldStop = () => sigint;

  // run in chunks so we can emit periodic status and respond to SIGINT
  const chunk = every > 0 ? every : total;
  let remaining = total;

  while (remaining > 0 && !shouldStop()) {
    const n = Math.min(chunk, remaining);
    uni.step(n, shouldStop);
    remaining -= n;

    if (every > 0) {
      // use the same status format as the 'status' command
      host.commands.status.fn([], out);
    }
  }

  if (shouldStop()) out("Interrupted (SIGINT).");

  // always show final status
  host.commands.status.fn([], out);
  process.exit(0);
} else {
  // interactive console
  runConsole(opts);
}

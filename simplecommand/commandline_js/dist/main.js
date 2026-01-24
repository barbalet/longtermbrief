#!/usr/bin/env node
'use strict';

// commandline (Node.js) - console-only Simulated Ape port.
//
// Flags:
//   --help / -h
//   --run N      : auto-exit after N commands
//   --seed N     : deterministic seed
//   --prompt TXT : prompt string
//   --no-prompt  : disable prompt (useful for piping input)

const { runConsole } = require('./sim');

function printHelp() {
  const msg = [
    'commandline (Node.js) - Simulated Ape console port',
    '',
    'Usage:',
    '  commandline [--seed N] [--run N]',
    '',
    'Options:',
    '  -h, --help        Show this help and exit',
    '  --seed N          Set RNG seed (default: current time)',
    '  --run N           Exit after N commands have been processed',
    '  --prompt TEXT     Set the prompt text (default: "> ")',
    '  --no-prompt       Disable prompt (useful when piping input)',
    '',
    'Examples:',
    '  commandline',
    '  commandline --seed 1234',
    '  commandline --run 3',
    '  printf "help\\nstep\\nquit\\n" | commandline --no-prompt',
    '',
  ].join('\n');
  process.stdout.write(msg);
}

function parseArgs(argv) {
  const out = { help: false, run: null, seed: null, prompt: '> ', noPrompt: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') {
      out.help = true;
    } else if (a === '--run') {
      const v = argv[++i];
      const n = Number(v);
      if (!Number.isFinite(n) || n <= 0) throw new Error(`--run expects a positive integer, got: ${v}`);
      out.run = Math.floor(n);
    } else if (a === '--seed') {
      const v = argv[++i];
      const n = Number(v);
      if (!Number.isFinite(n) || n < 0) throw new Error(`--seed expects a non-negative integer, got: ${v}`);
      out.seed = Math.floor(n);
    } else if (a === '--prompt') {
      out.prompt = String(argv[++i] ?? '> ');
    } else if (a === '--no-prompt') {
      out.noPrompt = true;
    } else {
      throw new Error(`Unknown argument: ${a}`);
    }
  }
  return out;
}

(async function main() {
  let args;
  try {
    args = parseArgs(process.argv);
  } catch (e) {
    process.stderr.write(String(e && e.message ? e.message : e) + '\n');
    process.exit(2);
  }

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.seed == null) args.seed = (Date.now() >>> 0);

  await runConsole(args);
})();

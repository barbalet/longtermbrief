#!/usr/bin/env node
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

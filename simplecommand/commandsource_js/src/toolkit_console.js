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

/**
 * sim_console.js
 * Node.js console glue for the JS port.
 */

import readline from "readline";
import { createCommandHost, executeLine } from "../universe/universe_command.js";

function makeOut(stream = process.stdout) {
  return (s = "") => stream.write(String(s) + "\n");
}

export function runBatch(opts = {}, cycles = 0, stream = process.stdout) {
  const host = createCommandHost(opts);
  const out = makeOut(stream);

  // Mirror the interactive "run" command so behavior stays consistent.
  executeLine(host, `run ${Math.max(0, cycles | 0)}`, out);
  return host;
}

export async function runConsole(opts = {}) {
  const host = createCommandHost(opts);
  const out = makeOut(process.stdout);

  const versionName = opts.versionName ?? "JavaScriptGroup ";
  const fullDate = opts.fullDate ?? new Date().toDateString();

  out("");
  out(` *** ${versionName}Console, ${fullDate} ***`);
  out("      For a list of commands type 'help'");
  out("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  rl.setPrompt(">> ");
  rl.prompt();

  const done = await new Promise((resolve) => {
    rl.on("line", (line) => {
      const ctx = executeLine(host, line, out);
      if (ctx.quit) {
        rl.close();
        return;
      }
      rl.prompt();
    });

    rl.on("SIGINT", () => {
      // Graceful shutdown (Ctrl+C): request stop and exit.
      host.requestStop?.();
      out("");
      out("Interrupted (SIGINT). Type 'quit' next time for a clean exit.");
      rl.close();
    });

    rl.on("close", () => resolve(true));
  });

  return done;
}

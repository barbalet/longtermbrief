#!/usr/bin/env node
/**
 * simape CLI wrapper for the ApeSDK JS port.
 *
 * This project is a direct multi-module port from C. Many functions may still be stubs.
 * This CLI focuses on wiring + argument parsing so the codebase can converge on a
 * working command-line entry point as modules are completed.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function readPackageVersion() {
  try {
    const pkgPath = path.join(projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function printHelp() {
  console.log(`
simape (ApeSDK JS port)

Usage:
  simape [--help] [--version] [--run N] [--seed S] [--quiet]

Options:
  --help        Show this help.
  --version     Show version.
  --run N       Run for N simulation "steps"/ticks, then exit (when implemented).
  --seed S      Set RNG seed (when implemented).
  --quiet       Reduce console output.

Notes:
  - This CLI is wired up now, but core simulation entry points may still be stubs.
  - As modules are ported, hook the loop in src/universe/ and src/sim/ here.
`);
}

function parseArgs(argv) {
  const out = { run: null, seed: null, quiet: false, help: false, version: false, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') out.help = true;
    else if (a === '--version' || a === '-v') out.version = true;
    else if (a === '--quiet' || a === '-q') out.quiet = true;
    else if (a === '--run') out.run = Number(argv[++i]);
    else if (a === '--seed') out.seed = Number(argv[++i]);
    else out._.push(a);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) { printHelp(); return; }
  if (args.version) { console.log(readPackageVersion()); return; }

  if (!args.quiet) {
    console.log('simape: ApeSDK JS port CLI');
    console.log('version:', readPackageVersion());
  }

  // Lazy-import so `--help/--version` doesn't need the full module graph.
  // When the port is complete, this is where you call the actual simulator entry point.
  try {
    const universe = await import('../src/universe/universe.js');
    const sim = await import('../src/sim/sim.js');

    if (!args.quiet) {
      console.log('Loaded modules:', {
        universeExports: Object.keys(universe).length,
        simExports: Object.keys(sim).length,
      });
    }

    // Placeholder: attempt to call a conventional entry point if it exists.
    const entry =
      universe.simape_main ||
      universe.main ||
      sim.simape_main ||
      sim.main ||
      null;

    if (typeof entry === 'function') {
      await entry(args);
      return;
    }

    console.error('simape: no runnable entry point yet (expected universe.simape_main or sim.simape_main).');
    console.error('This is normal while the port is still being completed.');
    process.exitCode = 2;
  } catch (err) {
    console.error('simape: failed to start (likely due to unported stubs).');
    console.error(String(err?.stack || err));
    process.exitCode = 1;
  }
}

main();

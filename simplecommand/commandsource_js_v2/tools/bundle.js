#!/usr/bin/env node
'use strict';

// Minimal bundler: packs ./src/*.js into ./dist/commandsource.js with a tiny CommonJS loader.
// No external dependencies.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(DIST, 'commandsource.js');

function listJsFiles(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
}

function main() {
  fs.mkdirSync(DIST, { recursive: true });

  const files = listJsFiles(SRC);
  const parts = [];
  parts.push('#!/usr/bin/env node');
  parts.push('"use strict";');
  parts.push('');
  parts.push('(function(){');
  parts.push('  const __modules = Object.create(null);');

  for (const f of files) {
    const id = './' + f;
    const code = fs.readFileSync(path.join(SRC, f), 'utf8');
    parts.push(`  __modules[${JSON.stringify(id)}] = function(require, module, exports){`);
    parts.push(code);
    parts.push('  };');
  }

  parts.push('  const __cache = Object.create(null);');
  parts.push('  function __require(id){');
  parts.push('    if (__cache[id]) return __cache[id].exports;');
  parts.push('    const fn = __modules[id];');
  parts.push('    if (!fn) throw new Error(`Cannot find module: ${id}`);');
  parts.push('    const module = { exports: {} };');
  parts.push('    __cache[id] = module;');
  parts.push('    const localRequire = (rel) => {');
  parts.push('      if (rel.startsWith("./")) {');
  parts.push('        const id = rel.endsWith(".js") ? rel : (rel + ".js");');
  parts.push('        return __require(id);');
  parts.push('      }');
  parts.push('      return require(rel);');
  parts.push('    };');
  parts.push('    fn(localRequire, module, module.exports);');
  parts.push('    return module.exports;');
  parts.push('  }');
  parts.push('  global.__COMMANDSOURCE_BUNDLE__ = true;');
  parts.push('  __require("./main.js");');
  parts.push('})();');

  const out = parts.join("\n") + "\n";
  fs.writeFileSync(OUT, out, 'utf8');
  fs.chmodSync(OUT, 0o755);
  process.stdout.write(`Wrote ${OUT}\\n`);
}

main();

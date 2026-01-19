# commandsource (JavaScript)

A small interactive command console ported from a C implementation.

## Run

```bash
npm install
npm run build
./bin/commandsource
```

Type `help` to list commands. Use `quit` or **Ctrl+C** to exit.

## Non-interactive / bounded runs

You can auto-exit after N commands:

```bash
./bin/commandsource --run 10
```

This is handy for scripted sessions or tests.

## Single-file executable

The build produces a single-file Node entry at:

```bash
dist/commandsource.js
```

You can run it directly:

```bash
node dist/commandsource.js
```

## Man page

A roff man page is included:

```bash
man ./docs/commandsource.1
```

See `docs/USAGE.md` for more.

## Optional: true native binary

If you want a **native standalone** executable (no `node` required), you can use tools like `pkg` or `nexe`.
This repo does not vendor those tools; install one globally and then point it at `dist/commandsource.js`.

Example with `pkg`:

```bash
npm i -g pkg
pkg dist/commandsource.js --output commandsource
./commandsource --help
```

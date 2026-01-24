# Running commandsource

## Quick start

```bash
npm install
npm run build
./bin/commandsource
```

Type `help` to see available console commands. Use `quit` (or Ctrl+C) to exit.

## CLI

```bash
commandsource [--run N] [--prompt TEXT] [--no-prompt]
```

- `--run N`: process at most **N** console commands, then exit.
- `--prompt TEXT`: set prompt string (default `> `).
- `--no-prompt`: disable prompt text (useful for piped input).

Examples:

```bash
# interactive
./bin/commandsource

# process 5 commands then exit
./bin/commandsource --run 5

# pipe commands (no prompt)
printf "help\nquit\n" | ./bin/commandsource --no-prompt
```

## Single-file executable (no external bundler)

This repo includes a tiny bundler that produces a single self-contained JS entry file:

```bash
npm run bundle
./dist/commandsource.js
```

This still requires Node.js, but it is **one file**.

## Optional: native binary via pkg

If you want a *standalone* binary (no Node install required on the target machine), you can use `pkg`:

```bash
npm install
npm run pkg
```

Outputs are written under `dist/bin/`.


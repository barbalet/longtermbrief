# commandline (JavaScript)

Console-only Node.js port of the `commandline.zip` C implementation.

## Run

```bash
npm install
npm run build
./bin/commandline
```

Type `help` to see available commands. Use `quit` (or Ctrl+C) to exit.

## Non-interactive / bounded runs

```bash
./bin/commandline --run 10 --no-prompt
```

## Save / load

```bash
save realtime.json
load realtime.json
```

> Note: This JS port stores a JSON snapshot for portability.


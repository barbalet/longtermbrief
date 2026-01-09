# JavaScript Port (mechanical)

This folder contains a **mechanical JS port** of the original C sources in this repository.

## What you get
- For **every `.c` file**, there is a corresponding `.js` file in the same relative path.
- `toolkit/*.js` contains real, usable implementations for the most common math/vector/string/memory helpers.
- The larger simulation modules (`entity/`, `sim/`, `universe/`, `longterm.js`) are **stubbed** exports with the original C included at the bottom of each file for reference while you port them incrementally.

## Run
Right now, `longterm.js` is a stub, so running will throw until you port `command_line_run()` and its dependencies.

```bash
npm install
npm start
```

## Porting strategy
1. Start with `universe/universe_command.js`: implement `command_line_run()` and argument parsing.
2. Work inward: `universe_sim` → `universe_loop` → `sim/*` → `entity/*`.
3. Replace the stubs in each module with real logic; delete the embedded C comment once stable.


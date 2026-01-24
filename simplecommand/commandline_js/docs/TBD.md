# TBD — What’s left to fully implement `commandline.zip` in JavaScript

This repo currently provides a **CLI-compatible shell** (commands, loop, basic persistence) and a **minimal simulation stub** that generates deterministic-ish “ape agents” so the console can operate.

Below is the concrete work remaining to reach feature parity with the original **C** implementation.

---

## 1) Complete module parity (C → JS)

Original C modules present in `commandline.zip`:

- `toolkit_*.c` (vect, io, math, memory, console)
- `entity_*.c` (being, brain, body, drives, food, immune, episodic, social)
- `sim_*.c` (tile, land, spacetime)
- `universe_*.c` (sim, loop, command)
- `longterm.c`

**JS status (today):**
- `toolkit_*` — *partially ported* (enough for the CLI, file IO, and bundling)
- `universe_command` — *ported surface commands*, but many outputs are placeholders
- `universe_loop` — *simplified* run/step loop
- `entity` / `sim` — *stub simulation* (agents exist, age/energy/health move a bit)

**Remaining work:**
- Port each of the following faithfully, keeping data layouts and behavior similar:
  - `entity_being.c` → lifecycle, growth, reproduction, death, selection logic
  - `entity_body.c` → metabolism, energy use, injury, healing
  - `entity_brain.c` → perception, decision model, internal state updates
  - `entity_drives.c` → hunger/thirst/social/etc. drives & drive resolution
  - `entity_food.c` → feeding logic, food location/availability, consumption
  - `entity_immune.c` → pathogen model, infection, immunity, recovery
  - `entity_episodic.c` → episodic memory structure, update rules, decay
  - `entity_social.c` → social graph, attraction/enemies, interaction effects
  - `sim_tile.c` / `sim_land.c` → world grid, terrain, resources, passability
  - `sim_spacetime.c` → time step + spatial mechanics that drive movement
  - `universe_sim.c` / `universe_loop.c` → “glue” and step ordering parity
  - `longterm.c` → any reporting / long-run stats / save formats

---

## 2) Command output parity

Even when the underlying model matches, users rely on **exact-ish** console output.
Remaining work:
- Ensure each command matches the **C version’s**:
  - headings, ordering, counts, rounding, and units
  - selection / naming behavior
  - error messages and return codes
- Implement missing “deep report” commands (some are currently placeholders):
  - brain/body/drives breakdown reports
  - social network reports
  - tile/land reports
  - longterm stats dumps

---

## 3) Determinism and RNG alignment

To reproduce runs and debug:
- Introduce a **shared RNG primitive** whose seeding and call pattern matches C.
- Ensure step ordering is identical (important for emergent behavior).

---

## 4) Save/load format compatibility

Right now save/load is “JS-native JSON-ish”.
To reach parity:
- Implement the C save format (or provide a strict documented migration layer):
  - binary vs text format
  - version tags
  - endian / packing assumptions
- Confirm that “save, load, continue” produces the same outcomes.

---

## 5) Performance and scaling

The C version can support longer runs and more agents.
To match:
- Replace array-heavy hot paths with typed arrays where appropriate
- Avoid per-step allocations in tight loops
- Add profiling hooks to identify slow commands/steps

---

## 6) Testing strategy

To ensure the JS port is truly “the same simulation”:
- Build a test harness that runs:
  - N steps in C, captures snapshots
  - N steps in JS, captures snapshots
  - compares key fields (agent count, deaths, mean energy, etc.)
- Add golden-output tests for command text (where practical).

---

## 7) Remaining engineering polish

- Make `npm run run -- --run N` and `npm run run -- --script file` first-class
- Graceful SIGINT handling everywhere (quit/save prompts optional)
- CI job that builds and runs a small deterministic scenario

---

## Immediate next recommended steps

1. Port `entity_being.c` (core state + update tick) and wire it into `sim.step()`.
2. Port `sim_tile.c` + `sim_spacetime.c` so movement and location are real.
3. Port `entity_drives.c` + `entity_body.c` so agents “want things” and consume energy.
4. Expand command outputs once underlying values are correct.


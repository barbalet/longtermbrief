# ApeSDK C→JavaScript Baseline Port (Generated)

This is an **automated baseline** conversion of the attached C sources into a JavaScript module layout.

- Headers (`*.h`) are mapped to JS exports for many `#define` constants and `typedef struct` shapes.
- Each C implementation file (`*.c`) has a corresponding JS module exporting **stub functions** matching detected C entry points.
- The original C source is embedded at the bottom of each JS file to support manual/iterative porting.

## Run
```bash
npm install
npm test
```

## Status
This baseline **does not yet implement** the full simulation logic in JS (stubs throw when called).
If you want me to continue, the next step is to port `toolkit_*` first (math/vect/memory/io), then `sim`, `universe`, and finally `entity`.


## Command-line (simape)

This repo includes a small build script that wires the JS modules into a `simape` command.

### Build a local `./simape` shim

```bash
bash ./build.sh
./simape --help
```

### Install as a global command (optional)

```bash
npm link
simape --help
```

> Note: the CLI wiring is complete, but some core functions may still be stubs while the port is being finished.

#!/usr/bin/env bash
set -euo pipefail

# Build a reusable library version of longtermbrief.
#
# This compiles the exact same C sources as build.sh, but:
#   - defines MAIN_LIBRARY so longterm.c does NOT provide a main()
#   - defines COMMAND_LINE_EXPLICIT to keep console command handling enabled
#   - produces:
#       liblongtermbrief.a   (static)
#       liblongtermbrief.*   (shared; .dylib on macOS, .so on Linux)

if [ $# -ge 1 ] && [ "$1" = "--debug" ]; then
  CFLAGS="-g -O0"
else
  CFLAGS="-O2"
fi

DEFS="-DMAIN_LIBRARY -DCOMMAND_LINE_EXPLICIT"

echo "==> Building longtermbrief library (MAIN_LIBRARY)"

rm -f ./*.o liblongtermbrief.a liblongtermbrief.so liblongtermbrief.dylib 2>/dev/null || true

cc ${CFLAGS} ${DEFS} -fPIC -c ./*.c -w

ar rcs liblongtermbrief.a ./*.o

UNAME_S="$(uname -s || echo unknown)"
if [ "$UNAME_S" = "Darwin" ]; then
  cc -shared -o liblongtermbrief.dylib ./*.o -lz -lm -lpthread
  echo "==> Wrote liblongtermbrief.dylib"
else
  cc -shared -o liblongtermbrief.so ./*.o -lz -lm -lpthread
  echo "==> Wrote liblongtermbrief.so"
fi

rm -f ./*.o
echo "==> Wrote liblongtermbrief.a"
echo "==> Done."

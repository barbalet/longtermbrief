#!/bin/sh
set -eu

# POSIX build script for javascriptgroup
# Produces executable at ../simape

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

CC="${CC:-cc}"

CFLAGS="-O2"
if [ "${1:-}" = "--debug" ]; then
  CFLAGS="-g -O0"
fi

DEFS="-DCOMMAND_LINE_EXPLICIT"

INCLUDES="
-I$ROOT_DIR
-I$ROOT_DIR/toolkit
-I$ROOT_DIR/sim
-I$ROOT_DIR/universe
-I$ROOT_DIR/entity
"

WARNINGS="-w"
LDLIBS="-lz -lm -lpthread"

BUILD_DIR="$ROOT_DIR/build"
OBJ_DIR="$BUILD_DIR/obj"
mkdir -p "$OBJ_DIR"

# Create a deterministic source list (avoid pipeline/subshell variable loss)
SRC_LIST="$BUILD_DIR/sources.txt"
find "$ROOT_DIR" -maxdepth 2 -type f \(      -path "$ROOT_DIR/toolkit/*.c"   -o -path "$ROOT_DIR/sim/*.c"   -o -path "$ROOT_DIR/universe/*.c"   -o -path "$ROOT_DIR/entity/*.c"   -o -path "$ROOT_DIR/longterm.c" \) | sort > "$SRC_LIST"

if [ ! -s "$SRC_LIST" ]; then
  echo "No sources found (expected toolkit/, sim/, universe/, entity/, and longterm.c)."
  exit 1
fi

OBJS=""
while IFS= read -r src; do
  rel="${src#$ROOT_DIR/}"
  obj="$OBJ_DIR/$(printf "%s" "$rel" | tr '/' '_').o"
  OBJS="$OBJS $obj"
  $CC $CFLAGS $DEFS $INCLUDES $WARNINGS -c "$src" -o "$obj"
done < "$SRC_LIST"

OUT="$ROOT_DIR/../simape"
$CC $CFLAGS $OBJS -o "$OUT" $LDLIBS

echo "==> Built: $OUT"

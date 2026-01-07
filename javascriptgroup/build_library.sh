#!/bin/sh
set -eu

# POSIX library build script for javascriptgroup
# Produces:
#   build/lib/liblongtermbrief.a
#   build/lib/liblongtermbrief.(dylib|so)

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

CC="${CC:-cc}"

CFLAGS="-O2"
if [ "${1:-}" = "--debug" ]; then
  CFLAGS="-g -O0"
fi

DEFS="-DMAIN_LIBRARY -DCOMMAND_LINE_EXPLICIT"

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
OBJ_DIR="$BUILD_DIR/obj_lib"
LIB_DIR="$BUILD_DIR/lib"
mkdir -p "$OBJ_DIR" "$LIB_DIR"

SRC_LIST="$BUILD_DIR/sources_lib.txt"
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

# Static library
STATIC_LIB="$LIB_DIR/liblongtermbrief.a"
rm -f "$STATIC_LIB"
# shellcheck disable=SC2086
ar rcs "$STATIC_LIB" $OBJS
echo "==> Wrote $STATIC_LIB"

# Shared library
UNAME_S="$(uname -s)"
if [ "$UNAME_S" = "Darwin" ]; then
  SHARED_LIB="$LIB_DIR/liblongtermbrief.dylib"
else
  SHARED_LIB="$LIB_DIR/liblongtermbrief.so"
fi

# shellcheck disable=SC2086
$CC -shared -o "$SHARED_LIB" $OBJS $LDLIBS
echo "==> Wrote $SHARED_LIB"

echo "==> Done."

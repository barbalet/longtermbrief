#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

rm -rf "$ROOT/dist"
mkdir -p "$ROOT/dist"
cp -R "$ROOT/src/"* "$ROOT/dist/"

# Add a shebang to dist/main.js for convenience.
if ! head -n 1 "$ROOT/dist/main.js" | grep -q "^#!/"; then
  tmpfile="$ROOT/dist/.main.tmp.js"
  {
    echo "#!/usr/bin/env node"
    cat "$ROOT/dist/main.js"
  } > "$tmpfile"
  mv "$tmpfile" "$ROOT/dist/main.js"
  chmod +x "$ROOT/dist/main.js"
fi

# Produce a single-file executable script at dist/commandline.js
node "$ROOT/tools/bundle.js"

# Provide a stable executable entry in ./bin
mkdir -p "$ROOT/bin"
cat > "$ROOT/bin/commandline" <<'SH'
#!/usr/bin/env bash
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec node "$HERE/../dist/commandline.js" "$@"
SH
chmod +x "$ROOT/bin/commandline"

echo "Built to dist/. Run: ./bin/commandline (or: node dist/commandline.js)"

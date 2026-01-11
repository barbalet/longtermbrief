#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$ROOT/bin"

# Ensure the CLI is executable
chmod +x "$ROOT/bin/simape.js"

# Create a local shim so you can run `./simape` without installing globally
cat > "$ROOT/simape" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
exec node "$DIR/bin/simape.js" "$@"
EOF
chmod +x "$ROOT/simape"

echo "Built: $ROOT/simape"
echo ""
echo "Try:"
echo "  ./simape --help"
echo "  ./simape --version"
echo "  ./simape --run 100"
echo ""
echo "Optional (global command via npm):"
echo "  npm link"
echo "  simape --help"

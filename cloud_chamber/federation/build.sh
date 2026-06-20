#!/usr/bin/env bash
# Baut fuel-dev als Remote, dann fitness-dev als Host.
# Outputs landen in dist-federation/ (berührt dist/ nicht).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FITNESS_ROOT="$(realpath "$SCRIPT_DIR/../..")"
FUEL_ROOT="$(realpath "$SCRIPT_DIR/../../../fuel-dev")"

have_gum() { command -v gum >/dev/null 2>&1; }

log() {
  if have_gum; then gum log --level info "$1"
  else echo "[build] $1"; fi
}

log "1/2 fuel-dev → Remote (dist-federation/)"
cd "$FUEL_ROOT" && npx vite build --config "$SCRIPT_DIR/fuel.remote.vite.config.js"

log "2/2 fitness-dev → Host (dist-federation/)"
cd "$FITNESS_ROOT" && npx vite build --config "$SCRIPT_DIR/fitness.host.vite.config.js"

if have_gum; then
  gum table --print --separator=" | " << 'EOF'
Output | Pfad
Remote | fuel-dev/dist-federation/
Host   | fitness-dev/dist-federation/
EOF
else
  echo "Remote: $FUEL_ROOT/dist-federation/"
  echo "Host:   $FITNESS_ROOT/dist-federation/"
fi

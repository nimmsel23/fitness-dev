#!/usr/bin/env bash
# Installiert @originjs/vite-plugin-federation in fitness-dev + fuel-dev (devDep)
# Berührt keine anderen Abhängigkeiten.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FITNESS_ROOT="$(realpath "$SCRIPT_DIR/../..")"
FUEL_ROOT="$(realpath "$SCRIPT_DIR/../../../fuel-dev")"
JOURNAL_ROOT="$(realpath "$SCRIPT_DIR/../journal-dev")"

if command -v gum >/dev/null 2>&1; then
  gum log --level info "fitness-dev: @originjs/vite-plugin-federation installieren"
  cd "$FITNESS_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  gum log --level info "fuel-dev: @originjs/vite-plugin-federation installieren"
  cd "$FUEL_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  gum log --level info "journal-dev: @originjs/vite-plugin-federation installieren"
  cd "$JOURNAL_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  gum log --level info "Fertig. Weiter mit: bash cloud_chamber/federation/build.sh"
else
  echo "[setup] fitness-dev..."
  cd "$FITNESS_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  echo "[setup] fuel-dev..."
  cd "$FUEL_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  echo "[setup] journal-dev..."
  cd "$JOURNAL_ROOT" && npm install --save-dev @originjs/vite-plugin-federation
  echo "[setup] Fertig. Weiter mit: bash cloud_chamber/federation/build.sh"
fi

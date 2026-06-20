#!/usr/bin/env bash
# Baut alle drei Apps mit korrektem Subpath-Base für /opt/vitals/ Deployment.
# Outputs: */dist-vitals/ (berührt */dist/ nicht)
#
# Verwendung:
#   bash cloud_chamber/federation/backend/build.sh [fitness|fuel|relax|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FITNESS_ROOT="$(realpath "$SCRIPT_DIR/../../..")"
FUEL_ROOT="$(realpath "$SCRIPT_DIR/../../../../fuel-dev")"
RELAX_ROOT="$(realpath "$SCRIPT_DIR/../../../../relax-dev")"

have_gum() { command -v gum >/dev/null 2>&1; }

log()  { have_gum && gum log --level info  "$1" || echo "[build] $1"; }
warn() { have_gum && gum log --level warn  "$1" || echo "[warn]  $1"; }
err()  { have_gum && gum log --level error "$1" || echo "[error] $1"; exit 1; }

TARGET="${1:-all}"

build_fitness() {
  log "fitness-dev → dist-vitals/ (base: /fitness/)"
  cd "$FITNESS_ROOT"
  VITE_BASE=/fitness/ npx vite build \
    --config cloud_chamber/federation/backend/vite.fitness.config.mjs \
    --outDir dist-vitals \
    --emptyOutDir
  log "fitness-dev: fertig → $FITNESS_ROOT/dist-vitals/"
}

build_fuel() {
  log "fuel-dev → dist-vitals/ (base: /fuel/)"
  cd "$FUEL_ROOT"
  VITE_BASE=/fuel/ npx vite build \
    --config "$SCRIPT_DIR/vite.fuel.config.mjs" \
    --outDir dist-vitals \
    --emptyOutDir
  log "fuel-dev: fertig → $FUEL_ROOT/dist-vitals/"
}

build_relax() {
  log "relax-dev → dist-vitals/ (base: /relax/)"
  cd "$RELAX_ROOT"
  VITE_BASE=/relax/ npx vite build \
    --config "$SCRIPT_DIR/vite.relax.config.mjs" \
    --outDir dist-vitals \
    --emptyOutDir
  log "relax-dev: fertig → $RELAX_ROOT/dist-vitals/"
}

case "$TARGET" in
  fitness) build_fitness ;;
  fuel)    build_fuel ;;
  relax)   build_relax ;;
  all)
    build_fitness
    build_fuel
    build_relax
    log "Alle drei Apps gebaut. Weiter mit: sudo bash cloud_chamber/federation/backend/deploy.sh"
    ;;
  *) err "Unbekanntes Target: $TARGET. Erwartet: fitness|fuel|relax|all" ;;
esac

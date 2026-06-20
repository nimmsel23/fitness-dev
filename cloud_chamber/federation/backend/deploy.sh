#!/usr/bin/env bash
# Deploy nach /opt/vitals/
# Kopiert: dist-vitals/ aller drei Apps + vitals-server.mjs + package.json
#
# Verwendung:
#   sudo bash cloud_chamber/federation/backend/deploy.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FITNESS_ROOT="$(realpath "$SCRIPT_DIR/../../..")"
FUEL_ROOT="$(realpath "$SCRIPT_DIR/../../../../fuel-dev")"
RELAX_ROOT="$(realpath "$SCRIPT_DIR/../../../../relax-dev")"
TARGET="/opt/vitals"

have_gum() { command -v gum >/dev/null 2>&1; }
log()  { have_gum && gum log --level info  "$1" || echo "[deploy] $1"; }
err()  { have_gum && gum log --level error "$1" || echo "[error]  $1"; exit 1; }

# Checks
[ "$(id -u)" = "0" ] || err "sudo erforderlich (schreibt nach /opt/)"

for app in fitness fuel relax; do
  case "$app" in
    fitness) dist="$FITNESS_ROOT/dist-vitals" ;;
    fuel)    dist="$FUEL_ROOT/dist-vitals" ;;
    relax)   dist="$RELAX_ROOT/dist-vitals" ;;
  esac
  [ -d "$dist" ] || err "$app/dist-vitals/ fehlt. Erst: bash cloud_chamber/federation/backend/build.sh $app"
done

have_gum && gum confirm "Deploy nach $TARGET?" || { echo "Abgebrochen."; exit 0; }

# Zielstruktur anlegen
mkdir -p "$TARGET"/{fitness,fuel,relax}

log "Kopiere fitness → $TARGET/fitness/"
rsync -a --delete "$FITNESS_ROOT/dist-vitals/" "$TARGET/fitness/"

log "Kopiere fuel → $TARGET/fuel/"
rsync -a --delete "$FUEL_ROOT/dist-vitals/" "$TARGET/fuel/"

log "Kopiere relax → $TARGET/relax/"
rsync -a --delete "$RELAX_ROOT/dist-vitals/" "$TARGET/relax/"

log "Kopiere Server + package.json"
cp "$SCRIPT_DIR/vitals-server.mjs" "$TARGET/server.mjs"
cp "$SCRIPT_DIR/package.json"      "$TARGET/package.json"

log "npm install in $TARGET/"
cd "$TARGET" && npm install --production

log "Deploy fertig → $TARGET"
log "Service starten: systemctl --user restart vitals.service"
log "Oder einmalig:   node /opt/vitals/server.mjs"

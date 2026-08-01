#!/usr/bin/env bash
# deploy.sh — Versioned deployment for Fitness (staging/prod FastAPI server)
set -euo pipefail

# Default to staging target
TARGET="${1:-staging}"

if [[ "$TARGET" == "prod" ]]; then
  DEST="/opt/fitness"
  BACKUP_DIR="/opt/fitness_backups"
  SERVICE="fitness.service"
  USE_SUDO=true
  PORT=6100
elif [[ "$TARGET" == "staging" ]]; then
  DEST="$HOME/fitness"
  BACKUP_DIR="$HOME/fitness_backups"
  SERVICE="fitness-preview.service"
  USE_SUDO=false
  PORT=8100
else
  printf '\033[1;31m%s\033[0m\n' "Invalid target '$TARGET'. Use: staging | prod" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"
DEV_SOURCE="${HOME}/fitness-dev"
STAGING_SOURCE="${HOME}/fitness"

msg() { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

if [[ "$TARGET" == "staging" ]]; then
  SOURCE="$SCRIPT_DIR"
  if [[ "$SCRIPT_DIR" != "$DEV_SOURCE" && -f "$DEV_SOURCE/package.json" ]]; then
    SOURCE="$DEV_SOURCE"
  fi
elif [[ "$TARGET" == "prod" ]]; then
  SOURCE="$SCRIPT_DIR"
  if [[ "$SCRIPT_DIR" != "$STAGING_SOURCE" && -f "$STAGING_SOURCE/package.json" ]]; then
    SOURCE="$STAGING_SOURCE"
  fi
fi

[[ -f "$SOURCE/package.json" ]] || die "Deployment source '$SOURCE' is not a fitness checkout"

run_cmd() {
  if $USE_SUDO; then
    sudo "$@"
  else
    "$@"
  fi
}

msg "🚀 Starting Fitness Deployment to $TARGET ($DEST)"
msg "📍 Using source checkout $SOURCE"

# 1. Build in SOURCE first — cross-repo alias bundling.
# Ausnahme: Prod-Deploy aus dem Staging-Checkout (SOURCE == STAGING_SOURCE) —
# der Stand in $SOURCE/dist wurde bereits beim vorherigen staging-Deploy
# gebaut. Kein erneuter Build nötig, nur übernehmen und weiterreichen an prod.
if [[ "$TARGET" == "prod" && "$SOURCE" == "$STAGING_SOURCE" && -d "$SOURCE/dist" ]]; then
  msg "⏭️  Build übersprungen — nutze bereits vorhandenes $SOURCE/dist (aus dem staging-Deploy)"
else
  msg "🔨 Building UI in $SOURCE"
  (
    cd "$SOURCE"
    npm run build > /dev/null
  )
fi

# 2. Versioned Backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/fitness_$timestamp"

if [[ -d "$DEST" ]]; then
  msg "📦 Creating versioned backup: $backup_path"
  run_cmd mkdir -p "$BACKUP_DIR"
  run_cmd cp -a "$DEST" "$backup_path"
fi

# 3. Sync to target directory
if [[ ! -d "$DEST" ]]; then
  msg "📂 Creating target directory $DEST"
  run_cmd mkdir -p "$DEST"
  if $USE_SUDO; then
    run_cmd chown "$(id -u):$(id -g)" "$DEST"
  fi
fi

msg "📦 Syncing files from $SOURCE → $DEST"
if $USE_SUDO; then
  sudo rsync -av --delete \
    --exclude ".git" \
    --exclude ".env" \
    --exclude ".env.*" \
    --exclude "node_modules" \
    --exclude "data" \
    --exclude ".archiv" \
    --exclude "*.bak" \
    --exclude ".claude" \
    --exclude "*.log" \
    --exclude ".firebase" \
    --exclude "dist-firebase" \
    --exclude "dist-versions" \
    --exclude ".worktrees" \
    --exclude "catalog-ui" \
    --exclude "gas-coach-summary" \
    --exclude "__pycache__" \
    --exclude ".pytest_cache" \
    --exclude ".venv" \
    --exclude "fitness/catalog/state" \
    "$SOURCE/" "$DEST/"
else
  rsync -av --delete \
    --exclude ".git" \
    --exclude ".env" \
    --exclude ".env.*" \
    --exclude "node_modules" \
    --exclude "data" \
    --exclude ".archiv" \
    --exclude "*.bak" \
    --exclude ".claude" \
    --exclude "*.log" \
    --exclude ".firebase" \
    --exclude "dist-firebase" \
    --exclude "dist-versions" \
    --exclude ".worktrees" \
    --exclude "catalog-ui" \
    --exclude "gas-coach-summary" \
    --exclude "__pycache__" \
    --exclude ".pytest_cache" \
    --exclude ".venv" \
    --exclude "fitness/catalog/state" \
    "$SOURCE/" "$DEST/"
fi

# 4. Finalize Python Environment — Create .venv and install dependencies via uv
msg "📦 Setting up Python virtual environment in $DEST"
(
  cd "$DEST"
  if command -v uv &> /dev/null; then
    uv venv --clear --quiet
    uv pip install . --quiet
  else
    python3 -m venv .venv
    ./.venv/bin/python3 -m pip install --upgrade pip --quiet
    ./.venv/bin/python3 -m pip install . --quiet
  fi
)

# 5. Restart Service
if $USE_SUDO; then
  if systemctl list-unit-files "$SERVICE" >/dev/null 2>&1; then
    msg "🔄 Restarting system-scope $SERVICE (sudo)"
    sudo systemctl daemon-reload
    sudo systemctl restart "$SERVICE"
  else
    warn "⚠️ System-scope $SERVICE not found. Skipping restart."
  fi
else
  if systemctl --user list-unit-files "$SERVICE" >/dev/null 2>&1; then
    msg "🔄 Restarting user-scope $SERVICE"
    systemctl --user daemon-reload
    systemctl --user restart "$SERVICE"
  else
    warn "⚠️ User-scope $SERVICE not found. Skipping restart."
  fi
fi

msg "✅ Deployment to $DEST complete on port $PORT."

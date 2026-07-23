#!/usr/bin/env bash
# deploy.sh — Versioned deployment for Fitness (Desktop Prod)
set -euo pipefail

DEST="/opt/fitness"
BACKUP_DIR="/opt/fitness_backups"
SERVICE="fitness.service"
SOURCE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"

msg() { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

msg "🚀 Starting Fitness Deployment"

# 1. Build in SOURCE first — die Cross-Repo-Aliase (@habits, @journal,
#    @learn, @fuel) lösen nur relativ zu $SOURCE auf (Sibling-Repos liegen
#    neben $SOURCE, nicht neben $DEST). Nach dem Build ist dist/ komplett
#    standalone gebündelt, /opt/fitness braucht die Sibling-Repos danach
#    nicht mehr. Ein Build in $DEST würde an den fehlenden Siblings scheitern
#    (derselbe Bug wie zuvor in fuel-devs deploy.sh).
msg "🔨 Building UI in $SOURCE"
(
  cd "$SOURCE"
  npm run build > /dev/null
)

# 2. Versioned Backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/fitness_$timestamp"

if [[ -d "$DEST" ]]; then
  msg "📦 Creating versioned backup: $backup_path"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -a "$DEST" "$backup_path"
fi

# 3. Sync to /opt/fitness (inkl. fertiges dist/)
if [[ ! -d "$DEST" ]]; then
  msg "📂 Creating target directory $DEST"
  sudo mkdir -p "$DEST"
  sudo chown "$(id -u):$(id -g)" "$DEST"
fi

msg "📦 Syncing files from $SOURCE → $DEST"
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
  "$SOURCE/" "$DEST/"

# 4. Finalize Prod Environment — nur Server-Deps installieren, NICHT bauen
#    (dist/ kommt bereits fertig aus Schritt 1, ein Build in $DEST würde an
#    den Cross-Repo-Aliasen scheitern, da die Sibling-Repos hier nicht liegen)
msg "📦 Installing server dependencies"
sudo chown -R "$(id -u):$(id -g)" "$DEST"
(
  cd "$DEST"
  npm ci --silent --omit=dev
)

# 5. Restart Service
if systemctl list-unit-files "$SERVICE" >/dev/null 2>&1; then
  msg "🔄 Restarting $SERVICE"
  sudo systemctl restart "$SERVICE"
else
  warn "⚠️ $SERVICE not found. Skipping restart."
fi

msg "✅ Deployment to $DEST complete."

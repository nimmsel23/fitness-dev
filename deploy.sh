#!/usr/bin/env bash
# deploy.sh — Versioned deployment for Fitness (Desktop Prod)
set -euo pipefail

DEST="/opt/fitness"
BACKUP_DIR="/opt/fitness_backups"
SOURCE="$(cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")" && pwd)"

msg() { printf '\033[1;32m%s\033[0m\n' "$*"; }
warn() { printf '\033[1;33m%s\033[0m\n' "$*" >&2; }
die() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; exit 1; }

msg "🚀 Starting Fitness Deployment"

# 1. Versioned Backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_path="$BACKUP_DIR/fitness_$timestamp"

if [[ -d "$DEST" ]]; then
  msg "📦 Creating versioned backup: $backup_path"
  sudo mkdir -p "$BACKUP_DIR"
  sudo cp -a "$DEST" "$backup_path"
fi

# 2. Sync to /opt/fitness
if [[ ! -d "$DEST" ]]; then
  msg "📂 Creating target directory $DEST"
  sudo mkdir -p "$DEST"
  sudo chown "$(id -u):$(id -g)" "$DEST"
fi

msg "📦 Syncing files..."
sudo rsync -av --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "data" \
  --exclude ".archiv" \
  --exclude ".bak" \
  "$SOURCE/" "$DEST/"

# 3. Finalize Prod Environment
msg "📦 Installing dependencies and building UI"
sudo chown -R "$(id -u):$(id -g)" "$DEST"
(
  cd "$DEST"
  npm install --silent
  npm run build > /dev/null
)

# 4. Restart Service
if systemctl list-unit-files | grep -q "^fitness.service"; then
  msg "🔄 Restarting fitness.service"
  sudo systemctl restart fitness.service
else
  warn "⚠️ fitness.service not found. Skipping restart."
fi

msg "✅ Deployment to $DEST complete."

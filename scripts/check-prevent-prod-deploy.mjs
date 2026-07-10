import { resolve } from 'path';

const currentDir = resolve(process.cwd());

// Skip check in CI/CD (GitHub Actions) or if triggered by Git Hook
if (
  process.env.CI !== 'true' &&
  process.env.GIT_HOOK_DEPLOY !== 'true' &&
  currentDir.includes('/fitness')
) {
  console.error('\x1b[1;31m❌ PRODUCTION DEPLOY BLOCKIERT!\x1b[0m');
  console.error('\x1b[33mDer direkte Produktions-Deploy aus dem Entwicklungs-Repository (fitness-dev) ist aus Sicherheitsgründen deaktiviert.\x1b[0m');
  console.error('\x1b[36m👉 Nutze für Tests:    npm run build:preview\x1b[0m');
  console.error('\x1b[36m👉 Für Prod-Deploy:    Führe den Deploy aus ~/fitness (nicht fitness-dev) aus.\x1b[0m\n');
  process.exit(1);
}

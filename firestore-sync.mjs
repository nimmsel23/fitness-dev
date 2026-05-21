/**
 * firestore-sync.mjs — Node-Bridge zum Python firestore/ Modul
 *
 * Spawnt `python -m firestore.sync pull|push` als child process.
 * Fire-and-forget, blockiert server.mjs nicht.
 *
 * Usage in server.mjs:
 *   import { syncPull, syncPush } from "./firestore-sync.mjs";
 *   syncPull();   // z.B. beim Start oder auf GET /sync/pull
 *   syncPush();   // z.B. nach lokalem Save
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));

function run(cmd) {
  const proc = spawn("python3", ["-m", "firestore.sync_cli", cmd], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout.on("data", (d) => process.stdout.write(`[firestore-sync] ${d}`));
  proc.stderr.on("data", (d) => process.stderr.write(`[firestore-sync] ${d}`));
  proc.on("error", (e) => console.warn(`[firestore-sync] spawn fehler: ${e.message}`));
  return proc;
}

export function syncPull() { return run("pull"); }
export function syncPush() { return run("push"); }

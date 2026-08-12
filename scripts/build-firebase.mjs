import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localOutDir = path.join(root, "dist-firebase");
const siblingReleaseDir = path.resolve(root, "..", "fitness");
const mirrorOutDir = path.join(siblingReleaseDir, "dist-firebase");

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function mirrorBuildOutput() {
  if (!existsSync(siblingReleaseDir)) return;
  if (path.resolve(siblingReleaseDir) === path.resolve(root)) return;

  rmSync(mirrorOutDir, { recursive: true, force: true });
  mkdirSync(path.dirname(mirrorOutDir), { recursive: true });
  cpSync(localOutDir, mirrorOutDir, { recursive: true });
  console.log(`mirror -> ${mirrorOutDir}`);
}

run("vite", ["build", "--mode", "firebase", "--outDir", "dist-firebase"]);
run("node", ["scripts/stamp-sw.mjs", "dist-firebase"]);
run("node", ["scripts/snapshot.mjs", "dist-firebase"]);
mirrorBuildOutput();

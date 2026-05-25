import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const INBOX_DIR = path.join(os.homedir(), ".aos", "fitness", "inbox");
fs.mkdirSync(INBOX_DIR, { recursive: true });

export function exerciseInboxHandler(app) {
  app.post("/inbox/exercise", async (c) => {
    const exerciseData = await c.req.json().catch(() => ({}));
    if (!exerciseData.name) return c.json({ ok: false, error: "missing_name" }, 400);

    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${exerciseData.name.replace(/\s+/g, "_")}.json`;
    const filePath = path.join(INBOX_DIR, filename);

    fs.writeFileSync(filePath, JSON.stringify({ ...exerciseData, received_at: new Date().toISOString() }, null, 2));

    return c.json({ ok: true, file: filename });
  });
}

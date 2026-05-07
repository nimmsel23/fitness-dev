import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = path.join(__dirname, "data");
const PUBLIC_DIR = path.join(__dirname, "public");
const DIST_DIR   = path.join(__dirname, "dist");
const STATIC_DIR = process.env.FITNESS_STATIC_DIR ? path.resolve(process.env.FITNESS_STATIC_DIR) : (fs.existsSync(DIST_DIR) ? DIST_DIR : PUBLIC_DIR);
const PORT = Number(process.env.PORT || 9002);
const HOST = process.env.HOST || "127.0.0.1";
const WGER_TOKEN = process.env.WGER_API_TOKEN || process.env.WGER_TOKEN || "92d9ea44fc0ac065e336e9ec443a196c40c68afe";
const WGER_BASE  = process.env.WGER_BASE || "http://127.0.0.1:8000/api/v2";

for (const d of ["sessions","journal"]) fs.mkdirSync(path.join(DATA_DIR, d), { recursive: true });

// ── Helpers ──────────────────────────────────────────────────────────────────
const MIME = { ".html":"text/html;charset=utf-8", ".js":"application/javascript;charset=utf-8",
  ".css":"text/css;charset=utf-8", ".json":"application/json;charset=utf-8",
  ".svg":"image/svg+xml", ".png":"image/png", ".ico":"image/x-icon",
  ".woff2":"font/woff2", ".woff":"font/woff", ".webmanifest":"application/manifest+json" };

function mime(p) { return MIME[path.extname(p)] || "application/octet-stream"; }

function json(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) });
  res.end(body);
}

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}
function writeJson(p, data) { fs.writeFileSync(p, JSON.stringify(data, null, 2)); }

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function lastDates(days) {
  const out = [];
  const base = new Date(localToday() + "T12:00:00");
  for (let i = 0; i < days; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  return out;
}

function escapeCsvValue(v) {
  return String(v ?? "").replaceAll('"', '""');
}

async function fetchWger(path, qs = "") {
  return new Promise((resolve) => {
    const url = `${WGER_BASE}${path}?format=json${qs ? "&" + qs : ""}`;
    const req = http.get(url, { headers: { Authorization: `Token ${WGER_TOKEN}` } }, (r) => {
      let raw = "";
      r.on("data", c => raw += c);
      r.on("end", () => { try { resolve(JSON.parse(raw)); } catch { resolve({}); } });
    });
    req.on("error", () => resolve({}));
    req.setTimeout(4000, () => { req.destroy(); resolve({}); });
  });
}

// ── Week dates (Mo–So) ────────────────────────────────────────────────────────
function weekDates(anchor) {
  const d = new Date(anchor + "T12:00:00");
  const off = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - off);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(d); x.setDate(d.getDate() + i);
    return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`;
  });
}

// ── Muscle coverage from sessions ─────────────────────────────────────────────
function computeCoverage(days) {
  const dates = weekDates(localToday()).slice(0, days);
  const allDates = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(localToday() + "T12:00:00");
    d.setDate(d.getDate() - i);
    allDates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  const hits = {};
  for (const date of allDates) {
    const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
    for (const ex of (sess?.exercises || [])) {
      for (const m of (ex.primaryMuscles || [])) hits[m] = (hits[m] || 0) + 1;
      for (const m of (ex.secondaryMuscles || [])) hits[m] = (hits[m] || 0) + 0.5;
    }
  }
  return hits;
}

// ═════════════════════════════════════════════════════════════════════════════
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const p   = url.pathname.replace(/\/$/, "") || "/";

  let body = "";
  if (req.method !== "GET") {
    await new Promise(r => { req.on("data", c => body += c); req.on("end", r); });
  }
  const B = () => { try { return JSON.parse(body); } catch { return {}; } };

  // ── Health ──
  if (p === "/health") return json(res, 200, { ok: true, port: PORT, uptime: Math.floor(process.uptime()) });

  // ── Exercise search (wger) ──
  if (p === "/exercises/search") {
    const q     = url.searchParams.get("q") || "";
    const limit = Math.min(Number(url.searchParams.get("limit") || 12), 50);
    if (q.length < 2) return json(res, 200, { ok: true, results: [] });
    const data = await fetchWger("/exercise/", `limit=${limit}&name__search=${encodeURIComponent(q)}&language=2`);
    const results = (data.results || []).map(e => ({
      id:               e.uuid || String(e.id),
      name:             e.name || "",
      category:         e.category?.name || "",
      primaryMuscles:   (e.muscles || []).map(m => m.name_en || m.name),
      secondaryMuscles: (e.muscles_secondary || []).map(m => m.name_en || m.name),
    }));
    return json(res, 200, { ok: true, results });
  }

  // ── Exercises by muscle group ──
  if (p === "/exercises/by-group") {
    const group = url.searchParams.get("group") || "";
    const data  = await fetchWger("/exercise/", `limit=20&muscles__name_en__icontains=${encodeURIComponent(group)}&language=2`);
    const results = (data.results || []).map(e => ({
      id:        e.uuid || String(e.id),
      name_en:   e.name || "",
      relevance: "primary",
    }));
    return json(res, 200, { ok: true, exercises: results });
  }

  // ── Plan hint (reads plan.json if it exists) ──
  if (p === "/plan/today") {
    const date = url.searchParams.get("date") || localToday();
    const plan = readJson(path.join(DATA_DIR, "plan.json"));
    if (!plan) return json(res, 200, { ok: true, suggestion: null });
    const dow  = ["So","Mo","Di","Mi","Do","Fr","Sa"][new Date(date + "T12:00:00").getDay()];
    const match = (plan.einheiten || []).find(e => (e.days || []).includes(dow));
    if (!match) return json(res, 200, { ok: true, suggestion: null });
    const exercises = (match.abschnitte || []).flatMap(a => (a.übungen || a.uebungen || []).map(u => u.name));
    return json(res, 200, { ok: true, suggestion: { day: dow, block: match.name, exercises } });
  }

  // ── Blocks (from plan or defaults) ──
  if (p === "/blocks") {
    const plan   = readJson(path.join(DATA_DIR, "plan.json"));
    const blocks = (plan?.einheiten || []).map(e => ({ id: e.name.toLowerCase().replace(/\s+/g,"_"), label: e.name, muscle_groups: e.muscle_groups || [] }));
    if (blocks.length) return json(res, 200, { ok: true, blocks });
    return json(res, 200, { ok: true, blocks: [
      { id:"push",  label:"Push",  muscle_groups:["chest","shoulders","arms"] },
      { id:"pull",  label:"Pull",  muscle_groups:["back","arms"] },
      { id:"legs",  label:"Legs",  muscle_groups:["quads","hamstrings","glutes","calves"] },
      { id:"upper", label:"Upper", muscle_groups:["chest","back","shoulders","arms"] },
      { id:"lower", label:"Lower", muscle_groups:["quads","hamstrings","glutes","calves"] },
    ]});
  }

  // ── Session ──
  if (p === "/session") {
    const date = url.searchParams.get("date") || localToday();
    const file = path.join(DATA_DIR, "sessions", `${date}.json`);
    if (req.method === "GET") {
      const data = readJson(file);
      return data ? json(res, 200, { ok: true, data }) : json(res, 404, { ok: false });
    }
    if (req.method === "POST") {
      const data = B();
      writeJson(file, { ...data, date, saved_at: new Date().toISOString() });
      return json(res, 200, { ok: true });
    }
  }

  // ── Session history ──
  if (p === "/session/history") {
    const limit = Number(url.searchParams.get("limit") || 10);
    const dir   = path.join(DATA_DIR, "sessions");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse().slice(0, limit);
    const sessions = files.map(f => { const d = readJson(path.join(dir, f)); return { date: f.replace(".json",""), ...d }; });
    return json(res, 200, { ok: true, sessions });
  }

  // ── Session latest ──
  if (p === "/session/latest") {
    const dir   = path.join(DATA_DIR, "sessions");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort().reverse();
    if (!files.length) return json(res, 404, { ok: false });
    const data = readJson(path.join(dir, files[0]));
    return json(res, 200, { ok: true, session: { date: files[0].replace(".json",""), data } });
  }

  // ── Journal ──
  if (p === "/journal") {
    const date = url.searchParams.get("date") || localToday();
    const file = path.join(DATA_DIR, "journal", `${date}.md`);
    if (req.method === "GET") {
      if (!fs.existsSync(file)) return json(res, 404, { ok: false });
      const content = fs.readFileSync(file, "utf8");
      const mtime   = fs.statSync(file).mtime.toISOString().slice(0, 10);
      return json(res, 200, { ok: true, content, mtime });
    }
    if (req.method === "POST") {
      const { content } = B();
      fs.writeFileSync(file, content || "");
      return json(res, 200, { ok: true });
    }
  }

  // ── Journal list ──
  if (p === "/journal/list") {
    const dir   = path.join(DATA_DIR, "journal");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md")).sort().reverse().slice(0, 50);
    const entries = files.map(f => {
      const date  = f.replace(".md","");
      const mtime = fs.statSync(path.join(dir, f)).mtime.toISOString();
      return { date, mtime };
    });
    return json(res, 200, { ok: true, entries });
  }

  // ── Coverage ──
  if (p === "/coverage/detailed") {
    const days = Number(url.searchParams.get("days") || 7);
    const hits = computeCoverage(days);
    const GROUPS = {
      chest: ["Pectoralis major","Pectoralis minor"],
      back:  ["Latissimus dorsi","Trapezius","Rhomboids"],
      shoulders: ["Deltoid","Rotator cuff"],
      arms:  ["Biceps brachii","Triceps brachii"],
      core:  ["Rectus abdominis","Obliques","Transverse abdominis"],
      glutes: ["Gluteus maximus","Gluteus medius"],
      quads: ["Quadriceps femoris","Vastus lateralis"],
      hamstrings: ["Biceps femoris","Semitendinosus"],
      calves: ["Gastrocnemius","Soleus"],
    };
    const groups = Object.entries(GROUPS).map(([id, muscleNames]) => ({
      id,
      muscles: muscleNames.map(name => ({
        name_en:       name,
        primaryHits:   Math.round((hits[name] || 0)),
        secondaryHits: 0,
        totalScore:    hits[name] || 0,
      })),
    }));
    const muscles = groups.flatMap(g => g.muscles);
    return json(res, 200, { ok: true, groups, muscles });
  }

  if (p === "/coverage/gaps") {
    const days = Number(url.searchParams.get("days") || 7);
    const hits = computeCoverage(days);
    const all  = ["chest","back","shoulders","arms","core","glutes","quads","hamstrings","calves"];
    const gaps = all
      .filter(g => (hits[g] || 0) < 1)
      .map(g => ({ name: g, hits: hits[g] || 0, exercises: [] }));
    return json(res, 200, { ok: true, gaps });
  }

  // ── Export (CSV) ──
  if (p === "/export/csv") {
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") || 14)));
    const dates = lastDates(days).reverse();
    const rows = [["date","block","exercise","sets","reps","weight","note","effort","hit"]];
    for (const date of dates) {
      const sess = readJson(path.join(DATA_DIR, "sessions", `${date}.json`));
      const block = sess?.block || "";
      const effort = sess?.effort ?? "";
      const hit = sess?.hit ? "1" : "0";
      for (const ex of (sess?.exercises || [])) {
        rows.push([
          date,
          escapeCsvValue(block),
          escapeCsvValue(ex.name || ""),
          String(ex.sets ?? ""),
          String(ex.reps ?? ""),
          String(ex.weight ?? ""),
          escapeCsvValue(ex.note || ""),
          String(effort),
          hit,
        ]);
      }
    }
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n") + "\n";
    const filename = `fitness-${days}d-${localToday()}.csv`;
    return json(res, 200, { ok: true, filename, csv });
  }

  // ── Theme ──
  const themeFile = path.join(DATA_DIR, "theme.json");
  if (p === "/theme") {
    if (req.method === "GET") return json(res, 200, readJson(themeFile, { theme: "mocha" }));
    if (req.method === "POST") {
      writeJson(themeFile, B());
      return json(res, 200, { ok: true });
    }
  }

  // ── Static ──
  let file = p === "/" ? "/index.html" : p;
  const abs = path.join(STATIC_DIR, file);
  if (!abs.startsWith(STATIC_DIR)) { res.writeHead(403); res.end(); return; }
  if (!fs.existsSync(abs)) {
    // SPA fallback
    const idx = path.join(STATIC_DIR, "index.html");
    if (fs.existsSync(idx)) { res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" }); fs.createReadStream(idx).pipe(res); return; }
    res.writeHead(404); res.end("Not Found"); return;
  }
  res.writeHead(200, { "Content-Type": mime(abs) });
  fs.createReadStream(abs).pipe(res);
});

server.listen(PORT, HOST, () => console.log(`💪 fitness-dev on http://${HOST}:${PORT}`));

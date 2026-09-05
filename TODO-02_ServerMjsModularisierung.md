# server.mjs — Modularisierung (Node-Standard statt Ein-Datei-Monolith)

**Kontext (2026-09-05):** Beim Nachbau der `/fitness/coach/macrocycles`-
Proxy-Routen (siehe Git-History, `feat(server): /fitness/coach/macrocycles
Proxy-Routen ergänzt`) ist `server.mjs` auf **2148 Zeilen** angewachsen.
Jede Routen-Gruppe (Session, Journal, Exercises, Coaching-Notes, Routines,
Workouts, jetzt Macrocycles, ...) liegt komplett inline in dieser einen
Datei — kein einziger Bereich ist aktuell ausgelagert. Die neue
Macrocycles-Route wurde bewusst **konsistent mit diesem bestehenden Muster**
inline ergänzt (nicht als Alleingang in ein eigenes Modul ausgelagert),
aber die Grunddatei selbst ist an dem Punkt, wo eine Modularisierung
node-üblich wäre.

## Ziel

`server.mjs` auf einen schlanken Bootstrap reduzieren (App-Setup,
Middleware, OpenAPI-Grundgerüst, Static-Serving/SPA-Fallback), die
eigentlichen Routen-Gruppen in eigene Module unter z.B. `server/routes/`
auslagern — Standardmuster für Hono (`app.route('/prefix',
subApp)`) bzw. Express-Router-Äquivalent.

## Kandidaten für eigene Module (aus dem aktuellen Ist-Zustand)

- `server/routes/session.mjs` — `/session`, `/sessions`, `/session/history`,
  `/session/latest`, `/session/activity` (größter Block)
- `server/routes/journal.mjs`
- `server/routes/exercises.mjs` — `/exercises/search`, kb-bezogene Routen
- `server/routes/coaching-notes.mjs`
- `server/routes/routines.mjs`
- `server/routes/workouts.mjs`
- `server/routes/macrocycles.mjs` — die heute ergänzten 9 Proxy-Routen
- `server/routes/fitness-misc.mjs` (Plan/Weekly/Export/Body/Theme/Firestore-
  Status, falls kein eigener Zuschnitt lohnt)
- Gemeinsame Helper (`proxyToPython()`, `defineJsonRoute()`,
  `looseObjectSchema`, `readJson`/`writeJson`, `localToday()`,
  `PYTHON_BASE`) → `server/lib/`, von allen Route-Modulen importiert.

## Vorgehen (Vorschlag, nicht verbindlich)

1. **Nur strukturell verschieben, keine Logik ändern** — pro Modul 1:1
   Copy-Paste der bestehenden `app.openapi(...)`-Blöcke, dann im
   Hauptfile durch `app.route(...)` bzw. äquivalenten Import ersetzen.
2. Reihenfolge: kleinere, klar abgegrenzte Gruppen zuerst (Macrocycles,
   Coaching-Notes, Routines, Workouts), der große Session-Block zuletzt.
3. Nach jedem Modul: `npm run build` + manueller Smoke-Test der
   betroffenen Endpunkte (z.B. `curl localhost:9100/...`), bevor das
   nächste Modul angegangen wird.
4. `GET /openapi.json`/`GET /docs` nach jedem Schritt gegenprüfen — die
   Autodoc-Introspektion (`app.routes`) darf durch die Umstrukturierung
   keine Routen verlieren.

## Bewusst nicht jetzt gemacht

Diese Datei dokumentiert nur den Bedarf — kein Auftrag, das sofort
umzusetzen. Erst auf explizite Freigabe hin angehen, nicht bei
Gelegenheit "nebenbei" für eine einzelne Routen-Gruppe (siehe
Macrocycles-Fix heute: bewusst NICHT als Vorwand für eine Ausnahme
genutzt, um nicht wieder eigenmächtig Architektur zu verändern).

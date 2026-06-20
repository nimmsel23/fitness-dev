# cloud_chamber/ — VitalOS Staging Ground

Arbeitsbereich für die Vereinigung von fitness-dev + fuel-dev + zukünftigen VOS Micro-Apps.
Kein bestehender Code außerhalb dieses Ordners wird hier verändert.

---

## Was hier lebt

```
cloud_chamber/
  federation/          — Vite Module Federation + unified Backend Planung
  journal-dev/         — Journal + Habits Micro-App (Prototyp)
  firestore_watcher.py — Firestore-Listener (bestehend)
  analytics_watcher.py — Analytics-Listener (bestehend)
  list_users.py        — Nutzer-Listing (bestehend)
  set_admin.py         — Admin-Rechte setzen (bestehend)
  rules/               — Firestore Security Rules
  docs/                — Cloud Chamber Dokumentation
```

---

## federation/

Staging-Bereich für die VOS-Vereinigung. Vollständig dokumentiert, nichts am
bestehenden Code verändert.

**Einstieg:** `federation/README.md`  
**Architektur:** `federation/ARCHITECTURE.md` — Inventur beider Backends + VOS-Design  
**Entscheidungen:** `federation/DECISIONS.md` — 12 ADRs, alle entschieden  

### Ziel: Vite Module Federation (Stufe 2)
fuel-dev als Remote, fitness-dev als Host. `FuelApp.jsx` als echter Tab-Embed.
```bash
bash federation/setup.sh   # @originjs/vite-plugin-federation installieren
bash federation/build.sh   # Remote dann Host bauen
```

### Zwischenschritt: /opt/vitals/ Hub (Stufe 1)
Drei SPAs unter einem Port. Noch kein Tab-Embed.
```bash
bash federation/backend/build.sh all
sudo bash federation/backend/deploy.sh
```

---

## journal-dev/

Journal + Habits als eigenständige VOS Micro-App. Prototyp.

**Port:** 9170 (Backend), 9171 (Vite Dev-Server)  
**Daten:** `~/.aos/journal/YYYY-MM-DD.md`  
**Habits:** Nativ in `~/.aos/journal/habits/` (kein HabitSync, kein Docker — ADR #013)

```bash
cd cloud_chamber/journal-dev
npm install
npm run server   # Backend :9170
npm run ui       # Frontend :9171
# oder beides:
npm run dev
```

**Komponenten:** Direkt aus fitness-dev/src/views/Journal/ + Habits/ kopiert.
`src/db.js` implementiert dieselbe API wie fitness-dev's @db — Komponenten
funktionieren ohne Änderungen.

**Ziel:** Wird zu `~/journal-dev/` sobald reif für eigenständiges Repo.

---

## VOS Architektur (Kurzreferenz)

### Systemgrenze (nicht verhandelbar)
AlphaOS (Core4, Bridge, Door, Game) ≠ VitalOS (Fitness, Fuel, Relax, Journal).
Gleiche Philosophie — null gemeinsame Abhängigkeiten.

### VOS Apps

| App | Dev-Port | Prod-Port | Status |
|-----|----------|-----------|--------|
| fitness-dev | 9100 | 6100 | ✅ aktiv |
| fuel-dev | 9000 | 7000 | ✅ aktiv |
| relax-dev | 9123 | TBD | ✅ aktiv |
| journal-dev | 9170+9171 | 6170 | ⏳ Prototyp hier |
| unified-server | 9150 | 6150 | ⏳ geplant |
| VitalHub | — | 6200 | ⏳ vorbereitet |

### Deployment-Stufenplan
```
Stufe 1: /opt/vitals/   — drei SPAs, ein Port (federation/backend/)
Stufe 2: Module Fed.    — echter Tab-Embed (federation/)
Stufe 3: Firebase       — Cloud-Deploy
```

### Framework-Standard
**Hono** für alle VOS-Backends. **React + Vite** für alle VOS-Frontends.
`@db` Adapter-Pattern (VITE_DATA_LAYER=local|firebase|auto).

---

## Arbeitsregeln

- Nichts außerhalb von `cloud_chamber/` verändern
- Jede Architektur-Entscheidung → `federation/DECISIONS.md` (ADR)
- Neue Apps zuerst hier als Prototyp, dann eigenes Repo wenn reif
- `dist-vitals/` und `dist-federation/` sind Build-Outputs, nicht committen

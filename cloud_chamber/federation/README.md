# VitalOS Federation — Staging Ground

> Hier entsteht das vereinte fitness-dev + fuel-dev System.
> Kein bestehender Code wird berührt bis eine Entscheidung in DECISIONS.md dokumentiert ist.

---

## Was hier passiert

`cloud_chamber/federation/` ist der Arbeitsraum für die Vereinigung von
**fitness-dev** (Kraft-Tracking, Anatomie, Katalog) und **fuel-dev** (Ernährung,
Supplements, Gemini-Schätzung) zu einem einzigen VitalOS-Backend + Frontend.

**Parallel laufend:** Beide bestehenden Apps (`fitness-dev`, `fuel-dev`) bleiben
vollständig funktionsfähig. Hier wird nichts abgekürzt, nichts weggelassen.

---

## Einstieg (in dieser Reihenfolge lesen)

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Vollständige Inventur beider Backends +
   Design des unified-server. Das Herzstück.

2. **[DECISIONS.md](./DECISIONS.md)** — Architektur-Entscheidungen (ADR).
   Was wurde entschieden, was ist noch offen, warum.

3. **[inventory/](./inventory/)** — Detaillierte Inventur jedes einzelnen Assets:
   - [fuel-backend.md](./inventory/fuel-backend.md) — alle Services, Routen, Patterns
   - [fitness-backend.md](./inventory/fitness-backend.md) — alle Routen, SQLite Schema, KB-Struktur

4. **[backend/](./backend/)** — Zukünftiger unified-server (wird hier gebaut)

---

## Module Federation (sofort nutzbar)

Vite Module Federation Setup: fuel-dev als Remote, fitness-dev als Host.
Ermöglicht fuel-dev's UI als Tab in fitness-dev — ohne Änderungen an bestehenden Dateien.

```bash
# Setup (einmalig)
bash cloud_chamber/federation/setup.sh

# Bauen
bash cloud_chamber/federation/build.sh
# → fuel-dev/dist-federation/ + fitness-dev/dist-federation/
```

| Datei | Zweck |
|-------|-------|
| `fuel.remote.vite.config.js` | fuel-dev als Module Federation Remote |
| `fitness.host.vite.config.js` | fitness-dev als Module Federation Host |
| `FuelApp.jsx` | Exposed Component (kein createRoot, wrapped mit QueryClientProvider) |
| `FuelTab.jsx` | Tab-Komponente für fitness-dev (lazy import von `fuel/FuelApp`) |
| `setup.sh` | `@originjs/vite-plugin-federation` in beiden Repos installieren |
| `build.sh` | Remote zuerst, dann Host bauen |

### FuelTab in fitness-dev aktivieren

In `src/constants/NavigationItems.js` eintragen (nur im federation-Build):
```js
{ id: 'fuel', label: 'Fuel', view: lazy(() => import('../../cloud_chamber/federation/FuelTab')) }
```

### Prod Remote-URL

In `fitness.host.vite.config.js` → `remotes.fuel` anpassen:
```js
// /opt/ Deploy (lokal, bevorzugt für Übergangsphase)
fuel: 'http://localhost:7000/dist-federation/assets/remoteEntry.js'

// Firebase Deploy
fuel: 'https://fuel-aos.web.app/dist-federation/assets/remoteEntry.js'
```

---

## Deployment-Stufenplan

**Das Ziel ist Module Federation** — fuel als echter eingebetteter Tab in fitness-dev,
nicht drei separate SPAs hinter einem Entry-Point.

### Stufe 1 — /opt/vitals/ (Zwischenschritt, sofort möglich)
Drei separate SPAs unter einem Port. Kein Tab-Embed, fuel läuft eigenständig unter `/fuel/`.
Nützlich als gemeinsamer Einstieg während MF noch nicht aktiviert ist.
```bash
bash backend/build.sh all       # baut alle drei mit korrektem base-URL
sudo bash backend/deploy.sh     # rsync nach /opt/vitals/
```

### Stufe 2 — Module Federation (das eigentliche Ziel)
fuel-dev als Vite Remote, fitness-dev als Host. `FuelApp.jsx` wird als echter
React-Tab in fitness-dev eingebettet. Alle Dateien dafür sind bereits vorbereitet.
```bash
bash setup.sh   # @originjs/vite-plugin-federation installieren
bash build.sh   # Remote (fuel) dann Host (fitness) bauen
```

### Stufe 3 — Firebase Hosting
```js
// fitness.host.vite.config.js → remotes.fuel:
'https://fuel-aos.web.app/dist-federation/assets/remoteEntry.js'
```

---

## Grundsätze

- Nichts verloren gehen lassen: Jedes Feature aus fuel-dev + fitness-dev wird übernommen
- Dokumentation vor Code: Jede Entscheidung in DECISIONS.md bevor sie implementiert wird
- Parallel lauffähig: Beide bestehenden Apps bleiben unberührt
- /opt/vitals/ ist Stufe 1, nicht das Ziel — Module Federation ist das Ziel

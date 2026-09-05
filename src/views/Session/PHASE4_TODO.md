# Session-Tab Rebuild — Phase 4: Integration & Modals (zuletzt)

Quelle: Haiku-Doppel-Audit 2026-09-05. Setzt [[PHASE3_TODO]] (insbesondere
`useSession.js`-Split) voraus, da hier Modal-State zentralisiert wird, der
aktuell über mehrere Stellen verstreut ist.

## Stücke

- [ ] **Modals zentralisieren.** Aktuell scattered: `showSidebar`,
      `showTabSettings`, `gateSheetOpen` sind einzelne States in
      `SessionEditor.jsx`/`useSession.js`, jedes Modal rendert seinen
      eigenen `createPortal()`-Call an verschiedenen Stellen:
      - `SidebarSheet.jsx` (Portal-Wrapper um `SessionSidebar`)
      - `SourceSettingsModal.jsx` (Übungsquellen/Muskel-Detailgrad/
        Sprachfilter)
      - Session-Gate-Sheet (inline Portal in `SessionEditor.jsx`)
      - Ziel: ein `SessionModalsLayer.jsx`, das alle Portal-Calls bündelt,
        ein zentrales `activeModal`-State (statt 3+ Booleans).

- [ ] **Details/Notizen-Duplikat auflösen.** `SessionSidebar` wird aktuell
      doppelt gerendert: einmal inline (Details-Toggle in
      `SessionEditor.jsx`) und einmal als Modal (`SidebarSheet.jsx`) — beide
      zeigen denselben Content. Entscheiden: Mobile immer Modal, Desktop
      immer inline (oder umgekehrt), nicht beides parallel vorhalten.

- [ ] **Session-Gate-Sub-Tab-Router entduplizieren.** Das Gate-Sheet hat
      aktuell einen eigenen internen Sub-Tab-Router (Session/Plan/Verlauf/
      6Pack/Skills), der nicht mit der übergeordneten Tab-Navigation
      (`index.jsx`) synchronisiert ist. Prüfen, ob der bestehende
      Haupt-Router wiederverwendet werden kann statt eines zweiten,
      parallelen.

- [ ] **Dual-DB-Layer-Grundsatzfrage** (aus DB-Layer-Audit, bewusst ganz
      am Ende, da groß + folgenreich):
      - `local/sessions.js` (Node-Proxy) vs. `firestore/sessions.js`
        (521 Z., direkte Firestore-SDK-Calls) laufen dauerhaft parallel,
        mit Funktions-Duplikaten (`normalizeGhostSet()`, `sessionHits()`,
        `normalizedSessionHits()` fast identisch) und mindestens einer
        komplett divergenten Implementierung (`getPlanSuggestion()`:
        lokal simpler DOW-Fallback, Firestore ein volles
        Template-Regel-System).
      - Vorstufe (risikoärmer, kann auch vor dem großen Merge-Entscheid
        passieren): gemeinsame Utilities nach `lib/db/shared/` ziehen
        (`normalizedSessionHits()`, `normalizeGhostSet()`), Firestore und
        local rufen dieselbe Funktion.
      - Grundsatzentscheidung (eine der beiden DB-Schichten dauerhaft
        führend machen, oder bewusst beibehalten als Online/Offline-Split)
        braucht explizite Nutzer-Freigabe, nicht in dieser Phase im
        Alleingang entscheiden.
      - Verwandt: vier konkurrierende SOTs ohne dokumentierte Priorität
        (JSON-Datei, SQLite, Firestore, localStorage-Runtime-Draft) — die
        Offline-Merge-Logik (`sessionRuntimeStore.js`) läuft aktuell nur
        im Frontend, die Backend-APIs kennen localStorage-Drafts nicht.
        Mindestens dokumentieren, welche Quelle bei Konflikt gewinnt.

## Definition of Done

1. Modal-States über ein einziges `activeModal`-Feld statt N Booleans.
2. Kein Duplicate-Rendering von `SessionSidebar` mehr.
3. Dual-DB-Entscheidung (falls in dieser Phase getroffen) explizit in
   `../CLAUDE.md` bzw. `AUDIT.md` dokumentiert, inkl. Begründung.

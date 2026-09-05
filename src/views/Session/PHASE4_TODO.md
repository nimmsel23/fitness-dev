# Session-Tab Rebuild — Phase 4: Integration & Modals (zuletzt)

Quelle: Haiku-Doppel-Audit 2026-09-05. Setzt [[PHASE3_TODO]] (insbesondere
`useSession.js`-Split) voraus, da hier Modal-State zentralisiert wird, der
aktuell über mehrere Stellen verstreut ist.

**Grundsatz (Nutzer-Korrektur 2026-09-05, siehe globale Memory
`feedback_never_unify_divergent_implementations`): NICHTS angleichen oder
vereinheitlichen.** Diese Phase enthält mehrere Punkte, die ursprünglich
als "Duplikat bereinigen" formuliert waren (Details/Sidebar,
Dual-DB-Layer) — genau das Muster, das bereits einmal zurückgerollt werden
musste (Phase-2-`ActivityPicker.jsx`-Revert). Bevor irgendetwas davon
umgesetzt wird: explizit mit dem Nutzer klären, ob die zwei Stellen
wirklich redundant sind oder ob eine der beiden Seiten eine eigene,
absichtliche Daseinsberechtigung hat. Im Zweifel: nicht anfassen, oder
eher die schwächere Seite an die reichhaltigere angleichen/erweitern statt
umgekehrt zu kürzen.

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

- [ ] **Details/Notizen: doppeltes `SessionSidebar`-Rendering prüfen,
      NICHT vorschnell auf einen Pfad reduzieren.** `SessionSidebar` wird
      aktuell sowohl inline (Details-Toggle in `SessionEditor.jsx`) als
      auch als Modal (`SidebarSheet.jsx`) gerendert. Bevor einer der beiden
      Wege entfernt wird: mit Nutzer klären, ob das absichtlich
      responsive ist (z.B. Desktop inline bequemer, Mobile Modal
      platzsparender) oder tatsächlich unbeabsichtigte Doppelarbeit aus
      einem Refactor. Erst nach Bestätigung ggf. reduzieren — Default ist
      "beide Wege bleiben bestehen".

- [ ] **Session-Gate-Sub-Tab-Router entduplizieren.** Das Gate-Sheet hat
      aktuell einen eigenen internen Sub-Tab-Router (Session/Plan/Verlauf/
      6Pack/Skills), der nicht mit der übergeordneten Tab-Navigation
      (`index.jsx`) synchronisiert ist. Prüfen, ob der bestehende
      Haupt-Router wiederverwendet werden kann statt eines zweiten,
      parallelen.

- [ ] **Dual-DB-Layer — NICHT zusammenlegen, nur genau hinschauen.**
      `local/sessions.js` (Node-Proxy) vs. `firestore/sessions.js`
      (521 Z., direkte Firestore-SDK-Calls) laufen dauerhaft parallel.
      Der ursprüngliche Audit-Befund ("Funktions-Duplikate:
      `normalizeGhostSet()`, `sessionHits()`, `normalizedSessionHits()`
      fast identisch") ist per Grundsatz-Korrektur **nicht mehr die
      Handlungsaufforderung** — der Audit selbst notierte bereits, dass
      Firestore bei `sessionHits()` ein zusätzliches `ROLE_W`-Gewicht
      und bei `normalizedSessionHits()` einen anderen KB-Fallback hat als
      local. Das ist exakt das Muster aus dem `ActivityPicker`-Revert:
      "fast identisch" hieß hier vermutlich schon immer "leicht anders,
      aus einem Grund". `getPlanSuggestion()` ist ohnehin komplett
      divergent (lokal simpler DOW-Fallback, Firestore volles
      Template-Regel-System) und bleibt unangetastet.
      - Falls überhaupt etwas hier passiert: pro Funktion einzeln mit dem
        Nutzer durchgehen, WARUM Firestore/local unterschiedlich sind,
        bevor irgendein "Shared-Utility"-Extract passiert. Kein
        automatisches Zusammenführen, auch nicht als "risikoärmere
        Vorstufe".
      - Grundsatzentscheidung (eine der beiden DB-Schichten dauerhaft
        führend machen, oder bewusst beibehalten als Online/Offline-Split)
        braucht explizite Nutzer-Freigabe, nicht in dieser Phase im
        Alleingang entscheiden. Standard-Erwartung nach der
        Nutzer-Korrektur: eher "beide bleiben bestehen" als
        "konsolidieren".
      - Verwandt: vier konkurrierende SOTs ohne dokumentierte Priorität
        (JSON-Datei, SQLite, Firestore, localStorage-Runtime-Draft) — die
        Offline-Merge-Logik (`sessionRuntimeStore.js`) läuft aktuell nur
        im Frontend, die Backend-APIs kennen localStorage-Drafts nicht.
        Mindestens dokumentieren, welche Quelle bei Konflikt gewinnt —
        das ist eine reine Doku-Aufgabe, kein Code-Merge.

## Definition of Done

1. Modal-States über ein einziges `activeModal`-Feld statt N Booleans.
2. Kein Duplicate-Rendering von `SessionSidebar` mehr.
3. Dual-DB-Entscheidung (falls in dieser Phase getroffen) explizit in
   `../CLAUDE.md` bzw. `AUDIT.md` dokumentiert, inkl. Begründung.

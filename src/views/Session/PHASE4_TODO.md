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

- [x] **Modals zentralisiert (2026-09-05).** `showSidebar`/
      `showTabSettings` (vorher in `useSession.js`) + lokales
      `gateSheetOpen` (vorher in `SessionEditor.jsx`) → ein einziges
      `activeModal`-State (`null | 'sidebar' | 'settings' | 'gate'`) in
      `useSession.js`. Neuer `SessionModalsLayer.jsx` bündelt alle drei
      Portal-Calls (`SidebarSheet`, `SourceSettingsModal`,
      `SessionGateSheet`) — jede einzelne Modal-Komponente selbst
      unverändert, nur zentral geroutet statt an drei Stellen verstreut.
      `npm run build` grün.

- [x] **Details/Notizen: doppeltes `SessionSidebar`-Rendering geklärt
      (2026-09-05, User-Rückfrage).** Nutzer bestätigt: absichtlich, beide
      Wege (inline Details-Toggle in `SessionEditor.jsx` + Modal via
      `SidebarSheet.jsx`) bleiben unverändert bestehen. Kein Code-Fix.

- [x] **Session-Gate-Sub-Tab-Router untersucht (2026-09-05, nur geprüft/
      dokumentiert, User-Entscheidung: erstmal nur das, kein Code-Fix).**
      Ergebnis: Es gibt **keinen zweiten, unsynchronisierten State-Router**
      — `SessionGateCard.jsx`s Nav-Buttons rufen genau denselben
      `onSubNav`-Callback auf und lesen denselben `currentSubTab`-Wert wie
      `views/Session/index.jsx` (beide letztlich gespeist aus dem einen
      `subTab`-State in `App.jsx`, der auch die Sidebar/Bottom-Nav treibt).
      Kein Sync-Problem, keine zwei Wahrheiten über "welcher Sub-Tab ist
      aktiv".

      Was tatsächlich dupliziert ist: **zwei unabhängig gepflegte Listen
      derselben 5 Sub-Tab-IDs** (`today`/`plan`/`history`/`timer`/`skills`),
      mit bereits sichtbarem Drift:
      - `src/constants/NavigationItems.js` (Sidebar/Bottom-Nav, die
        "kanonische" Config): Reihenfolge `today, timer, skills, plan,
        history`; Labels `"Timer"`, `"History"`; kein `comingSoon`-Flag.
      - `SessionGateCard.jsx::SESSION_NAV_ITEMS` (Gate-Sheet-eigene Nav):
        Reihenfolge `today, plan, history, timer, skills`; Labels
        `"6 Pack"`, `"Verlauf"`; zusätzliches `comingSoon`-Flag auf
        `plan`/`timer`/`skills` (in `NavigationItems.js` nicht vorhanden).

      Nicht angefasst — genau die Sorte Divergenz, die laut Grundsatz oben
      erst geklärt werden muss: könnte absichtlich sein (Gate-Sheet ist ein
      kompakteres Mobile-Sheet, andere Label-Länge/Reihenfolge/"kommt
      bald"-Markierung könnten dort bewusst anders sinnvoll sein als in der
      Desktop-Sidebar) oder tatsächlich unbeabsichtigter Drift seit
      Einführung von `comingSoon`. Nächster Schritt wäre eine explizite
      Rückfrage, ob `SESSION_NAV_ITEMS` aus `NavigationItems.js`s
      `sub`-Array abgeleitet werden soll (plus optionalem Label-/
      Reihenfolge-Override fürs Sheet) oder ob beide Listen bewusst
      eigenständig bleiben.

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

1. [x] Modal-States über ein einziges `activeModal`-Feld statt N Booleans
       (erledigt 2026-09-05, siehe Stück 1 oben).
2. Kein Duplicate-Rendering von `SessionSidebar` mehr.
3. Dual-DB-Entscheidung (falls in dieser Phase getroffen) explizit in
   `../CLAUDE.md` bzw. `AUDIT.md` dokumentiert, inkl. Begründung.

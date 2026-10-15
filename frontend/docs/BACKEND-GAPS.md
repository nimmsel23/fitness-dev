# Lückenliste: was das Frontend vom Backend braucht

Nummern (#n) sind im Code als `// BACKEND-LÜCKE (#n)` markiert (`grep -rn "BACKEND-LÜCKE" src catalog-ui/src`).
Reihenfolge = Nutzen für den Coach-Alltag, nicht Aufwand. Alle Antworten bitte weiterhin JSON, Fehler als `{"detail": …}`.

## Sofort relevant (blockieren Kernfunktionen im lokalen Modus)

| # | Route (Wunsch) | Zweck | Wunschformat |
|---|---|---|---|
| 1 | `DELETE /api/users/{uid}/sessions/{doc_id}` | Session löschen (Tag verschieben, Aufräumen) | `200 {ok: true}`; 404 wenn nicht vorhanden; gleicher Schreib-Lock wie PUT; Vorversion wie beim Ersetzen nach `.fitsync/prev/` sichern |
| 2 | `DELETE /api/users/{uid}/sessions/{doc_id}/activity/{index}` | einzelnen Finisher aus `activityAddons` entfernen | `200 {ok: true, activityAddons: […]}` |
| 3 | `GET /api/users/{uid}/sessions?limit=&since=&full=true` | History mit **vollen** Sessions in einem Request (heute N+1: 60 Sessions = 61 Requests; Muskel-/Report-Ansichten laden 120) | wie heute, aber Elemente = komplette Session + `doc_id` |
| 5 | `GET /api/catalog/exercises/all` (oder Paging `?offset=&limit=`) | kompletter Katalog; `limit` der Suche ist auf 50 gedeckelt. Wird für `getAllExercises` und alle clientseitigen Auswertungen (`analysis.js`: Report, Coverage, Recovery) gebraucht | `{exercises: [ … ]}` im Format von `/api/catalog/exercises/{id}` |
| 6 | Detail-/Suchfelder des Katalogs | `GET /api/catalog/exercises/{id}` liefert weniger Felder als die alte Katalogzeile: es fehlen u.a. `images`, `gif_url`, `yuhonas_id`, `wger_id`, `tags`, `aliases`. Außerdem entfällt der `sources`-Filter (wger/yuhonas/coach). Der Katalog-Subagent plant yuhonas direkt zu nutzen — bitte Bilder-Route + diese Felder dort mitliefern | Felder wie `ExerciseRecord`; Bilder z.B. `GET /api/catalog/images/{path}` |
| 4 | `GET /api/plan/today?date=` | Tagesvorschlag (ExerciseSearchOverlay) | `{suggestion: {…}}` oder `{suggestion: null}` |

## Wichtig (ganze Ansichten fallen aus)

| # | Route (Wunsch) | Zweck |
|---|---|---|
| 8 | `GET /api/users/{uid}/body?days=` / `POST …/body` | Körperwerte (Gewicht, Schlaf, HR) |
| 9 | `GET/POST /api/users/{uid}/journal?date=`, `GET …/journal/list?limit=` | Journal |
| 10 | `/api/users/{uid}/routines` (CRUD, `…/{id}/exercises`, `…/exercises/order`) | Routinen-Builder |
| 11 | `/api/users/{uid}/workouts` (CRUD, `…/exercises`, `…/sets`) | Workout-Session/Plan-Ansicht |
| 12 | Zugewiesene Pläne: `…/plans/assigned`, `…/plans/{id}/completions`, `…/coach/plans/{uid}/{id}/progress` | Coach → Klient Pläne |
| 13 | `…/coach/macrocycles/{uid}` | Makrozyklen |
| 14 | `GET /api/coach/feed?uid=&limit=`, `POST /api/coach/feedback`, `GET/POST /api/coach/habit-cycle/{uid}` | Coach-Feed, Feedback, Habit-Zyklus (bekannte Altlast: war schon im alten Python-Backend nur in Node) |
| 18 | `GET /api/users/{uid}/analytics/dashboard?days=` | Dashboard-Analytics |

## Katalog-Kuratierung / Export (Catalog-UI, Coach-Werkzeuge)

| # | Route (Wunsch) | Zweck |
|---|---|---|
| 15 | `/api/catalog/inbox` (Liste, `…/queue`, `…/merge-candidates`, `POST …/{id}/approve`, `…/reenrich`, `…/link-source`, `…/merge-duplicates`, `DELETE …/{id}`) | Inbox-Review (Neuzugänge) |
| 16 | `GET /api/catalog/config`, `GET/POST /api/catalog/exercises/{id}/teaching`, `POST /api/catalog/exercises/{id}` | Anatomie-Lektion/Übung speichern, KB-Konfiguration |
| 17 | `POST /api/export` (`kind: plan\|weekly\|sheet\|lesson`), `GET /api/export/csv?days=` | Obsidian-/CSV-Export |
| 19 | `GET /api/users/{uid}/analytics/coverage/detailed?days=` und `…/gaps?days=&threshold=` | Catalog-UI „Coverage" (`analytics/coverage` hat anderes Format: Zeitraum statt `days`, keine Muskelliste/Lücken) |

## Querschnitt

| # | Thema | Wunsch |
|---|---|---|
| 7 | Firestore-Push/Status | `GET /api/sync/status` (`{ok, project}`) und `POST /api/sync/push` (letzte N Sessions → Firestore). `POST /api/sync/pull` ist die Gegenrichtung; der Settings-Knopf „Sync" meint den Push. |
| 20 | Auslieferung des Frontends | Backend soll `frontend/dist` unter `/` und `frontend/catalog-ui/dist` unter `/catalog-ui` ausliefern (same-origin, wie das alte `fitness.api.main`), inkl. SPA-Fallback. Heute nur Vite-Dev/`pnpm build`. |
| 21 | `/api/clients` | Zusätzlich gewünscht: `last_saved_at` pro Klient (für „neu seit …"-Anzeige). |
| 22 | Offline-Queue + rev | `PUT` wird bei Offline von `offline-queue.js` gepuffert und später mit der **alten** Basis-`rev` abgespielt → bei zwischenzeitlicher Änderung 409. Die Queue behandelt 4xx beim Flush vermutlich als „verwerfen" (nicht geprüft). Wunsch: 409-Body soll die aktuelle Session enthalten, damit der Client mergen kann. |

## Nicht Sache des Python-Backends
`/tours/strava`, `/sixpack` (Fotos) laufen weiter über den Node-Server (`FITNESS_NODE_PORT`, Standard 9100).

# 6Pack-Integration

`6pack/` ist das echte Git-Submodule auf Branch `fitness`. Fitness importiert
Komponente, Theme und Datenadapter direkt daraus. Eine Laufzeitkopie entfällt.
Der interne Submodule-Name `6pack-dev` bleibt für bestehende Git-Metadaten erhalten;
der Checkout-Pfad in `.gitmodules` ist `6pack`.

## Branches

- `~/6pack-dev`: Entwicklung auf `dev`.
- `~/fitness-dev/6pack`: Integration auf `fitness`.
- `~/vitalos/6pack-app`: separate VitalOS-Integration auf `vitalos`.

## Aktualisieren

Im Fitness-Repo: `npm run sync:6pack`.
Der Befehl holt den committeten Stand des benachbarten `../6pack-dev` und
übernimmt ihn per Fast-forward auf `fitness`. Anschließend baut er Fitness.
Abweichende Historien und lokale Änderungen blockieren den Sync. Bei Fehlern
bleiben bereits ausgeführte Schritte zur Prüfung erhalten.
Anschließend den Diff prüfen und den Pointer mit `git add 6pack` committen.
Kein automatischer Commit, Push oder Deploy im Sync-Befehl.
Vor einem späteren Parent-Push zuerst `git -C 6pack push -u origin fitness`.

Neue Checkouts initialisieren das Submodule mit
`git submodule update --init 6pack` auf dem gepinnten Commit. Der Sync-Befehl
legt dort bei Bedarf den lokalen Branch `fitness` an.

## Fitness-KB

`scripts/build-sixpack-data.mjs` bleibt im Fitness-Repo und erzeugt aus
`fitness/catalog/kb/exercises/6pack/` und `calisthenics/` die Datei
`6pack/sixpackData.generated.js`. Das Submodule ignoriert diese generierte Datei.
Fitness verwendet damit weiterhin seine eigene KB; Standalone- und VitalOS-Builds
verwenden den Katalog des 6Pack-Repos. Die KB wird nicht kopiert oder verändert.

## Finaler Selfie-Sync (2026-10-17)

Die vereinigten Branches verwenden einen Ablauf: `photoAuth.js` übernimmt den
Firebase-Login, `SelfiesGallery.jsx` und `PrivatePhoto.jsx` die bestehende Galerie,
`selfieCloud.js` den direkten Firestore-Transport. Foto-Dokumente liegen unter
`sixpackSelfies/{uid}/photos/{id}`; nur der Eigentümer darf lesen/schreiben,
kein impliziter Coach-Zugriff. Rules/Index-SSOT bleibt VitalOS. Die UID `local`
ist keine Authentifizierung; der lokale Build bietet den echten Foto-Login an.

Vorbereitete JPEGs (1600 px, maximal 700000 Data-URL-Zeichen) werden vor dem
Request pro UID in die vorhandene Browser-Queue geschrieben. Bestätigung durch
Firestore entfernt den Eintrag. Auth-/Netzfehler erhalten die Queue. Account-
Wechsel entfernt die Galerie. Keine zusätzliche Firebase-App im Host-Build.

Die zusammengeführte tokengeprüfte FastAPI unter `/api/sixpack/photos` und
`/api/sixpack-photos/{uid}/{filename}` ist die Quelle für den expliziten Import
alter, zugeordneter Laptop-Fotos. Deterministische Import-IDs vermeiden Duplikate;
Datum und Originale bleiben erhalten. Die alten FastAPI-Pfade bleiben für alte
Clients erreichbar. Kein UID-Header-Bypass, keine öffentlichen Node-Fotorouten.
Node nutzt ausschließlich den allgemeinen `/api/*`-Proxy; dieser reicht jetzt
Authorization, Content-Type, Binärdaten und private Cache-Header vollständig weiter.
Der aktive Mini-App-Service-Worker umgeht Auth-/no-store-Requests vor jedem Cache.

Die Source-Branches `agent/photo-auth` (lokal und Remote) sind in 6pack dev
enthalten; Fitness vereinigt `agent/selfie-cloud` mit `agent/sixpack-photo-auth`.
Der ältere `agent/sixpack-photo-local-sync` war bereits Vorfahr von Fitness dev.

## Geräte-Abnahme am 2026-10-17

Vom Nutzer bestätigt: Ein am Handy in 6Pack hochgeladenes Foto erscheint mit
demselben Konto am Laptop unter Selfies nach der Synchronisierung. Damit ist
der reale geräteübergreifende Upload-/Lese-Ablauf bestätigt, ergänzend zu den
isolierten Auth-/Rules-/Galerie-Tests. Der Laptop muss dafür keinen Foto-Server
bereitstellen. Vorhandener Server-Altbestand bleibt ein separater expliziter Import.

Für VitalOS war zusätzlich zum Fitness-Release die Shell-Anbindung nötig:
Commit `42e1168` aktualisiert `6pack-app` auf `21c804d` und reicht die bestehende
Shell-UID weiter. Beide Production-Workflows waren erfolgreich. Frühere Hinweise
auf einen ungeprüften Zwei-Geräte-Sync beschreiben den damaligen Zwischenstand;
Offline-/HEIC-/Altbestand-Tests auf realen Geräten bleiben davon getrennt.

## Übungsdetails vor dem Start (2026-10-17)

Tagesliste, Shuffle und Favoriten öffnen gemeinsame Details aus dem direkten
6pack-Submodule: Muskelgrafik, deutsche Ausführung/Fehler und Demo-Player. Die
Rückkehr erhält den Workout-/Shuffle-Zustand. Start ist weiterhin explizit.
`build-sixpack-data.mjs` verwendet `6pack/catalogContent.mjs`: Muskelregionen
aus der lokalen Fitness-KB, öffentliche Videozuordnung aus dem 6pack-Katalog.
Keine zusätzlichen Video- oder Muskel-ID-Mappings im Host pflegen.
20/21 Übungen haben eine öffentliche Demo; Any Ball BTB Pass ist noch offen.
Quellen und Medienvertrag: `6pack/docs/VIDEO_URLS.md`.

Geprüft: Fitness ESLint, normaler und Firebase-Vite-Build sowie der tatsächliche
6pack-Detail-/Navigations-Regressionstest mit den Fitness-generierten Daten.
Neue Handy-Ansicht und externe Video-Wiedergabe noch nicht vom Nutzer abgenommen.

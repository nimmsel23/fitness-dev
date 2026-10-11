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

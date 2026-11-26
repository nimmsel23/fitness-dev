# Gemeinsame 6Pack-/Skills-Integration in Fitness

Stand: 2026-11-26. Fitness nutzt Nachbar-Checkouts, keine verschachtelten
Gitlinks und keine zweite UI-Kopie. Die gemeinsamen Quellen liegen in
6pack-dev (beziehungsweise 6pack-app im VitalOS-Workspace).

## Auflösung

vite-miniapp-submodules.mjs löst src/views/SixPack nach dem 6Pack-Root und
src/views/Skills nach dessen skills/ auf. @vos-skills zeigt ebenfalls auf
6pack/skills. Ein vorhandenes skills-dev/skills-app wird für diese Fitness-
Ansicht nicht verwendet. Der Resolver unterstützt beide bestehenden
Checkout-Namen; die Codebasis kann später als einzelnes Submodul gepinnt werden.

Fitness erzeugt weiterhin seine eigenen 6Pack-Übungsdaten aus der KB mit
build:sixpack-data. Standalone-6Pack und Core Skills behalten ihre eigenen Builds.

## Host-Vertrag

src/App.jsx übergibt die angemeldete UID, Navigation, Rückkehr und
logWorkoutAsSession als onWorkoutComplete. Skills- und 6Pack-Abschlüsse werden
über den vorhandenen Fitness-Speicheradapter mit stabilem runId als eigene
Sessions geschrieben. Wiederholungen treffen dieselbe Dokument-ID; Fehler
werden an den Runner weitergegeben. Ohne Host-Callback verwendet CoreSkills
seinen Standalone-Speicherweg. Auth und Firebase werden vom bestehenden Host
wiederverwendet; keine neuen Datenpfade oder Rules sind erforderlich.

## CI und Veröffentlichung

Standalone-Fitness und Mini-App-Deploys klonen nur Plan und 6Pack (mit Skills),
keinen eigenen Skills-Nachbarn mehr. Check und Preview holen 6Pack/Plan auf
den passenden Branch. Der Check verwendet dev-Pushes gegenüber Nachbarn auf
master; deshalb den benötigten 6Pack-Host-Vertrag zuerst nach master übernehmen.
Die Meta-Repo-Checkouts enthalten weiterhin skills-app für noch nicht umgestellte
VitalOS-Hosts; deren Entfernung ist kein Teil dieser Fitness-Änderung.

Prüfung: scripts/miniapp-source.test.mjs, src/lib/logExternalWorkout.test.mjs,
CoreSkills-Callback-Test im 6Pack-Repo, Fitness-Unit-Tests, build und build:firebase.
Geräteabnahme mit Anmeldung, echter Session und Video-Upload bleibt erforderlich.
Eigene Videos bei Skills-Stufen sind noch nicht angeschlossen (6Pack VIDEOUPLOAD.md
und skills/MIGRATION.md). Kein Shell-Pointer wird durch einen Fitness-dev-Push
von selbst zum Bestandteil dieser Änderung.

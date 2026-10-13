# 6Pack (Fitness-Kopie)

Der `timer`-Subtab von Fitness lädt `SixPackPromiseCard.jsx` aus diesem Ordner.
Die Entwicklungsquelle für Oberfläche, Runner und Theme liegt in `~/6pack-dev`.
Änderungen werden von dort mit `npm run publish:fitness -- /pfad/zu/fitness-dev/6pack`
hierher kopiert. Der Session-Tab bleibt nur der Einstiegspunkt.

Die Übungs- und Workout-YAMLs unter `fitness/catalog/kb/exercises/6pack/` sind
weiterhin die Datenquelle. `npm run build:sixpack-data` erzeugt daraus
`sixpackData.generated.js`; die generierte Datei wird nicht committed. Ein
optionales `video_url` im Übungs-YAML wird in die Runner-Daten übernommen.

Im Runner können Video-URLs pro Übung auch direkt eingetragen werden. Diese
Einstellung liegt im lokalen Browser-Speicher und überschreibt die KB-URL nur
auf diesem Gerät. Der Player erwartet eine direkt abspielbare HTTPS- oder
App-relative Videodatei, startet stumm und läuft in Schleife. Ohne URL zeigt
er einen leeren Medienbereich.

Die Sprachausgabe nutzt die Speech-Synthesis-Funktion des Browsers. Pausenstart,
Übungsstart und die letzten drei Pausensekunden erhalten Web-Audio-Signale.
Audio wird erst nach dem Start-Tap aktiviert; Verfügbarkeit und Wiedergabe bei
gesperrtem Bildschirm hängen vom Browser und Betriebssystem ab.


## Fortschrittsfotos (lokaler Server)

`Session` übergibt die UID des aktiven DB-Adapters. Upload, Liste und Bilder
nutzen relative URLs am App-Server; `VITE_API_BASE` kann einen anderen Server
angeben. Vite leitet `/sixpack*` an Node (`FITNESS_NODE_PORT`, Standard 9100)
weiter. Firebase allein hat diesen lokalen Endpunkt nicht; ohne explizit
konfigurierten erreichbaren Server bleiben neue Fotos in der Offline-Queue.

`routes/sixpack-photos.mjs` speichert neue Fotos unter
`~/.aos/fitness/users/<uid>/sixpack-photos/`, außerhalb der Build-Assets.
`FITNESS_SIXPACK_PHOTOS_DIR` überschreibt den übergeordneten Nutzerordner.
Die Routen gehören zum lokalen, vertrauenswürdigen Server: Die UID dient zur
Zuordnung, nicht als Authentifizierung für einen öffentlichen Foto-Dienst.

Fehlgeschlagene Uploads landen unter
`fitness-sixpack-selfies-pending-v2:<uid>` im Browser. Synchronisierung erfolgt
beim Öffnen, beim Online-Ereignis oder per „Jetzt synchronisieren“.
Dateiformat und Aufnahmedatum bleiben erhalten; eine stabile Upload-ID verhindert
Duplikate bei Wiederholungen. JPG/PNG/WebP/HEIC/HEIF bis 20 MB sind erlaubt;
HEIC-Anzeige hängt vom Browser ab. Bei vollem oder gesperrtem Browserspeicher
erscheint eine Fehlermeldung statt einer falschen Speicherbestätigung.

Alte unzugeordnete Browser-Einträge (`fitness-sixpack-selfies-v1`,
`fitness-sixpack-selfies-pending-v1`) und Dateien unter `public/sixpack-photos/`
werden nicht automatisch verschoben, gelöscht oder einem Nutzer zugeordnet.
Sie sind in der neuen Galerie nicht eingebunden; eine Migration braucht eine
explizite Nutzerzuordnung. Google-Drive-Sync bleibt ein separater TODO-Punkt.

API-Regressionstest (isolierte temporäre Dateien):
`node scripts/test-sixpack-photos.mjs`.


`SixPackPromiseCard.jsx` ist der stabile Barrel-Einstieg: Default-Export aus
`SixPackApp.jsx`, benannter Export `SelfiesScreen`. Die Foto-Oberfläche liegt in
`SelfiesScreen.jsx`, der geteilte Zurück-Header in `BackHeader.jsx`.
Foto-Requests benötigen eine explizite UID (kein Server-Owner-Fallback).
Ohne angemeldete UID bleibt die Foto-Oberfläche gesperrt; der lokale DB-Adapter
liefert ausdrücklich `local`. Fotoauswahl neben Kamera ist in `TODO.md` erfasst.

# 6Pack (Fitness-Kopie)

Der `timer`-Subtab von Fitness lädt `SixPackPromiseCard.jsx` aus diesem Ordner.
Die Entwicklungsquelle für Oberfläche, Runner und Theme liegt in `~/6pack-dev`.
Die Entwicklung bleibt dort auf `dev`; das Submodule `../6pack-dev` verwendet
den Integrationsbranch `fitness` (in `.gitmodules` hinterlegt).

Im Fitness-Repo übernimmt `npm run sync:6pack` den committeten Stand aus dem
benachbarten `../6pack-dev` lokal per Fast-forward auf `fitness`, veröffentlicht
die drei Laufzeitdateien hierher und führt den Fitness-Build aus. Abweichende
Historien und lokale Änderungen an den betroffenen Dateien blockieren den Sync.
Ungetrackte Dateien im Quellrepo werden nicht übernommen.
Bei einem Fehler bleiben ausgeführte Schritte zur Prüfung erhalten.
Anschließend Diff prüfen und Pointer plus Laufzeitdateien gemeinsam committen.
Der Befehl committed, pusht und deployt nicht. Vor einem späteren Push des
Fitness-Pointers muss der Integrationsbranch separat mit
`git -C 6pack-dev push -u origin fitness` veröffentlicht werden.
Ein normales `git submodule update --init 6pack-dev` lädt den gepinnten Commit;
die Branch-Angabe allein aktualisiert keinen Pointer.
Der Session-Tab bleibt nur der Einstiegspunkt.

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

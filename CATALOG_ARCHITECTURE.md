# Fitness PWA: Catalog & Firestore Architecture

Dieses Dokument beschreibt den Datenfluss zwischen der lokalen Knowledge Base (KB) und Firestore, um sicherzustellen, dass Übungsdaten und Metadaten (Muskel-Tags) konsistent gehalten werden.

## 1. Single Source of Truth (SSOT)
Die lokale Quelle der Wahrheit liegt im Repository unter `catalog/kb/`.
- **Struktur:** YAML-Dateien unter `catalog/kb/exercises/` und `catalog/kb/anatomy_teaching/`.
- **Zweck:** Einfache Editierbarkeit durch den `fitness_agent` und menschliche Entwickler.

## 2. Sync-Pipeline (`kb_sync.py`)
Um die Daten in Firestore verfügbar zu machen (für die PWA-App), nutzen wir das Python-Skript `catalog/fitness_agent/kb_sync.py`.

### Ablauf:
1.  **Lesen:** Das Skript parst alle YAML-Dateien aus `catalog/kb/`.
2.  **Transformieren:** Die Daten werden in Firestore-kompatible Strukturen (z.B. flache Maps statt verschachtelter YAMLs) umgewandelt.
3.  **Schreiben:** Die Daten werden nach Firestore gepusht:
    - `fitness/kb/exercises/{exercise_id}`
    - `fitness/kb/anatomy/{exercise_id}`

## 3. PWA-Frontend (Lesezugriff)
Die PWA greift über die `db.js` auf Firestore zu:
- `getAllExercises()`: Lädt die flache Liste aus `fitness/kb/exercises`.
- `getExercise(id)`: Lädt Details einer spezifischen Übung nach.

## 4. Inbox-Mechanismus (Schreibzugriff / Enrichement)
Um neue oder fehlende Übungsdaten dynamisch hinzuzufügen, wurde ein Inbox-Workflow implementiert:

1.  **Ping:** Wenn die PWA eine Übung ohne Muskel-Metadaten findet, sendet sie ein JSON-Objekt an `POST /inbox/exercise`.
2.  **Inbox:** Der Server speichert dies unter `~/.aos/fitness/inbox/` als `.json`.
3.  **Verarbeitung:** Ein lokaler Prozess (z.B. `fitness_agent` via TUI oder automatischer Watcher) konsumiert diese Dateien, validiert sie, speichert sie als YAML in `catalog/kb/` und triggert den `kb_sync`.
4.  **Live:** Nach dem `kb_sync` sind die Daten in Firestore für die PWA verfügbar.

---
*Dieser Kreislauf stellt sicher, dass die App performant aus Firestore liest, während die Redaktion der Daten sicher und versioniert im Git-Repository erfolgt.*

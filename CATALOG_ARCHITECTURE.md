# Fitness PWA: Catalog & Firestore Architecture

Dieses Dokument beschreibt die Architektur der Exercise-Datenbank, den Indexing-Mechanismus und die Integration von Bulk-Daten.

## 1. Multi-Tier Datenstruktur
Um sowohl Masse als auch Klasse zu bieten, nutzt das System drei Ebenen:

- **Tier 1: Expert-Tier (The "Coach Brain")**: 
  - **Index**: Registry-Files (z.B. `chest.yml`) mit IDs und Muskel-Mappings.
  - **Details**: Expert-Detail-Files (z.B. `exercises/bench_press.yml`) mit Coaching-Notes und Biomechanik.
  - **Status**: Verifiziert und autoritativ.
- **Tier 2: Bulk Staging Layer (The "Wiki")**:
  - Großvolumige Importe aus `wger` (`unreviewed_wger.yml`) und `yuhonas` (`unreviewed_yuhonas.yml`).
  - **Status**: Gekennzeichnet mit dem Tag `unreviewed`. Dient als Fallback, damit Nutzer sofort loggen können.
- **Tier 3: Inbox (The "Lab")**:
  - Temporäre Drafts (`inbox_*.yml`) für Neuanfragen oder zur Veredelung von Tier 2 Daten.

## 2. Der Autonome Expert-Daemon (`fitness-agent watch`)
Der `fitness-agent` agiert als autonomer Hintergrundprozess, der den Übergang zwischen den Tiers verwaltet.

### Aufgaben:
1.  **Inbox-Watcher**: Erkennt Neuanfragen (PWA -> Firestore -> Local).
2.  **AI-Enrichment**: Nutzt Gemini, um biomechanisch korrekte Expert-Drafts zu erstellen.
3.  **Tier-Elevation**: Ermöglicht es, Übungen aus dem Bulk-Layer (Tier 2) in den Expert-Tier (Tier 1) zu heben.

## 3. Smart Approval Workflow
Der `approve`-Befehl ist das Qualitäts-Gate:
1.  **Registry-Eintrag**: Schreibt Core-Metadaten in den Kategorie-Index.
2.  **Expert-Storage**: Speichert die volle Intelligenz als Detail-File.
3.  **Tag-Update**: Entfernt den `unreviewed`-Tag und markiert die Übung als verifiziert.

## 4. Sync & Merge Pipeline (`kb_sync.py`)
Das System führt beim Sync alle Tiers intelligent zusammen:
- **Aggregation**: Lädt alle Übungen aus allen Tiers.
- **Smart Merge**: Bei ID-Kollisionen gewinnen die Daten aus dem Expert-Tier (Tier 1). Das heißt: Sobald du eine Übung veredelst, überschreibt dein Wissen automatisch den generischen Bulk-Import in der PWA.

## 5. Muskel-Normalisierung
Alle Tiers referenzieren die zentrale `muscles.yml`. Dank der wger-ID Normalisierung ist die Muscle-Coverage über alle 1850+ Übungen hinweg konsistent berechenbar.

---
*Diese Architektur garantiert, dass das System niemals "abdriftet": Die Masse der Bulk-Daten dient als Fundament, aber dein "Expert Brain" behält immer die Kontrolle über die Qualität.*

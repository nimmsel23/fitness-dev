# Changelog / New Features

- **Training Session**: Professionelles UI-Overhaul mit Volumen-Trends, Recovery-Indikatoren und informationsreichen Übungskarten.
- **Exercise Search**: Full-screen Search Overlay mit schnellen Vorschlägen für kürzlich genutzte und geplante Übungen.
- **Settings**: Advanced Mode Switcher implementiert, um komplexe Settings in Akkordeons zu verstecken und die Standardansicht sauber zu halten.
- **Dashboard Widgets**: Widgets (Session, Habits, Heatmap, Muscles) sind nun interaktiv (Klick = Tab-Wechsel, Doppelklick/Long-Press = Vergrößertes Modal).
- **Dashboard Layout**: Edit-Modus (Pencil Icon) hinzugefügt, um Dashboard-Widgets via Pfeiltasten (Drag & Drop Alternative) anzuordnen.
- **Navigation**: Horizontales Swipen für den Tab-Wechsel implementiert.
- **Logik**: `coverageThreshold`-Einstellung eingefügt und rollierendes Fenster für die Muscle Coverage Analyse in `analysis.js` gefixt.
- **Catalog Sync**: Hash-basierter "Smart Sync" implementiert (MD5-Change-Detection) und Muskel-IDs auf konsistente numerische Präfixe (z.B. `101_pectoralis_major`) umgestellt.
- **@db Contract**: Komplette Umstellung aller Views (Dashboard, Habits, Settings, etc.) auf den sauberen `@db` Contract, um direkte API-Bypasses zu entfernen und Cross-Platform (Local/Firebase) zu garantieren.
- **Cloud Chamber Architecture**: Staging-Area (`cloud_chamber/`) aufgebaut für die Serverless-Transformation des Coach Brains. Enthält Firestore-Watchers, dokumentierte Schemas und Workflows.
- **Anatomy-KB Migration**: 53 Lektionen und 40 Muskel-Definitionen aus dem Anatomy-KB Projekt erfolgreich nach Firestore synchronisiert.
- **Hidden Chamber UI**: Neues Admin-Dashboard ("Coach") in der PWA implementiert, das eine zentrale Freigabe von KI-angereicherten Übungen aus allen User-Inboxes ermöglicht.
- **Gemini Skills**: `fitness-agent` und `anatomy-agent` als offiziell installierte Gemini CLI Skills bereitgestellt, inkl. prozeduraler Anleitung für Biomechanik und Katalog-Workflows.
fix: restore git auto-deploy for root-level PWA structure
chore: rename deploy script to deploy-firebase
feat: implement Safe Production Pipeline with separated release vessel
docs: rename FIRESTORE.md to FIREBASE.md and update for Safe Production Pipeline
- **Muscle Slug Support & L10n**: Frontend refactored to support numeric muscle IDs and user-selectable muscle name languages (DE/LAT/EN).
chore: Reorganized documentation files into docs/ to clean up the repository root.
refactor: Integrated AI Enricher into fitness-agent Python package and updated fitnessctl to use package entry points.

# Changelog / New Features

- **Training Session**: Professionelles UI-Overhaul mit Volumen-Trends, Recovery-Indikatoren und informationsreichen Übungskarten.
- **Exercise Search**: Full-screen Search Overlay mit schnellen Vorschlägen für kürzlich genutzte und geplante Übungen.
- **Settings**: Advanced Mode Switcher implementiert, um komplexe Settings in Akkordeons zu verstecken und die Standardansicht sauber zu halten.
- **Dashboard Widgets**: Widgets (Session, Habits, Heatmap, Muscles) sind nun interaktiv (Klick = Tab-Wechsel, Doppelklick/Long-Press = Vergrößertes Modal).
- **Dashboard Layout**: Edit-Modus (Pencil Icon) hinzugefügt, um Dashboard-Widgets via Pfeiltasten (Drag & Drop Alternative) anzuordnen.
- **Navigation**: Horizontales Swipen für den Tab-Wechsel implementiert.
- **Logik**: `coverageThreshold`-Einstellung eingefügt und rollierendes Fenster für die Muscle Coverage Analyse in `analysis.js` gefixt.
fix: restore git auto-deploy for root-level PWA structure
chore: rename deploy script to deploy-firebase
feat: implement Safe Production Pipeline with separated release vessel
docs: rename FIRESTORE.md to FIREBASE.md and update for Safe Production Pipeline

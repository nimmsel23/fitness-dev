# IPW — fitness-dev (perfekte Klienten-App)

Ideal Parallel World der App. Horizon: so klar, dass jedes Feature daran gemessen wird.
Stand: 2026-11-09.

## Die eine Szene

Daniel (oder ein Klient 40+) öffnet Fitness auf dem Handy. Kein Setup-Rätsel, kein
„welches Backend?“. Heute trainieren: Plan liegt bereit, Übungen haben Namen die
er versteht, Bilder und Coaching-Hinweise die stimmen. Er loggt Sätze. Fertig.
Der Coach sieht es, ohne dass der Klient je „Coach-UI“ berührt.

## Dominion der App

- **Eine Wahrheit pro Session** — Mehrgerät ohne Geister-Workouts; Konflikte
  klar lösbar, nie still überschrieben.
- **Plan ist Auftrag, nicht Baustelle** — freigegebene Snapshots ausführen und
  feedbacken; nicht schmieden.
- **Offline-würdig** — Logbuch und heutige Einheit auch ohne Laptop-API.
- **Sprache des Körpers** — deutsche Display-Namen, Muskeln, Learn/Anatomy wo
  es dem Training dient — keine Catalog-Werkstatt.
- **VitalOS-Gesicht** — clean, präventiv, premium; FaDaRo/Dev bleibt unsichtbar.

## Was die perfekte App bewusst nicht ist

- Kein Catalog-Manager, kein Enricher, kein Local-Schmiede-Server.
- Kein zweites Python-Backend im Repo.
- Kein Coach-Navigationslabyrinth.

## Spürbarer Alltag

Morgens: ein Tap → Session starten oder fortsetzen.  
Abends: Logbuch zeigt Rhythmus und Last, nicht Roh-Firestore-Schmerz.  
Sonntags: Wochenbild verständlich — genug für Motivation, nicht für Datenbankpflege.

## Messlatte (IPW erreicht wenn…)

1. Ein neuer Klient trainiert in &lt;5 Minuten ohne Entwickler-Hilfe.
2. Kein Support-Ticket „Plan fehlt / doppeltes Workout / falsche Übung“.
3. Coach ändert Plan → Klient sieht nur die freigegebene Wahrheit.
4. Freigegebene KB (Build-JS) trägt Detail-Features; Yuhonas bleibt nur Atlas-Fallback.
5. Repo enthält UI + Firebase-Verträge — Catalog/Inbox lebt bei Coach.

## Vom FRAME hierher

Heute: PWA stark, Fork-Python und alte KB-Kopie noch im Schatten.  
IPW: nur Klient. Alles andere ist fremdes Dominion — und bleibt es.

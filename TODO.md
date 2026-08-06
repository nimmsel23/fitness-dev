# [x] irgendetwas hat meine Workout daten vom 31. Juli zunichte gemacht (erledigt 2026-08-06)
Root Cause gefunden: `hasTrainingSignal()` in `src/lib/db/firestore/sessions.js`
erkannte Bodyweight-/AMRAP-Sätze ohne numerische reps/weight nicht als
Training. Beim nachträglichen Hinzufügen des Activity-Finishers stufte
`mergeActivityAddon()` die Session dadurch fälschlich als `sessionMode:
"cardio"` ein — SessionEditor zeigt dann nur ActivitySection statt
ExerciseList, das Workout verschwand optisch komplett. Fix: jeder
setsArray-Eintrag zählt jetzt als Trainingssignal, Downgrade auf cardio nur
noch bei wirklich leerem exercises-Array. Commit 9d6b108, gepusht.

# [x] der neue Readiness & Stärke-Matrix SubTab (erledigt 2026-08-06)
Aufgetrennt in zwei SubTabs unter Review: `ReviewReadiness.jsx` (Overall
Readiness, ACWR, Tages-Empfehlung, Regenerations-Matrix) und
`ReviewStrengthMatrix.jsx` (1RM-Rechner + Prozent-Spektrum). Die
Regenerations-Matrix nutzte vorher ein eigenes grobes 6-Gruppen-Modell
parallel zum echten Superkompensations-Scoring im Muskeln-Tab — Score-Logik
jetzt nach `src/lib/superkompensation.js` extrahiert und von beiden Tabs
geteilt, Readiness zeigt exakt dieselben Zahlen wie der Muskeln-Tab.
Commits 3aa68c9 + 6ca195a, gepusht.

# Bericht (Review Main Tab)
das Frontend lässt anhand des layouts bzw des fitting noch optimierung bzw grundlegende neuanlegung zu.










siehe später auch ./TODO-01_*

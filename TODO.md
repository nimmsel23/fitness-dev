
# [NEW] Coach Office 
Beispielfeature: Trainingsplanbesprechung zwischen Klient und Coach. Social Media Style. Comment-feed per Exercise



# [ ] Session Gate / ("Skills") Thenics-Runner Ausbau (Calisthenics)
- Today-Session zuerst als `Gym Session Gate`: großer Start-/Stop-Button, Trainingstag sofort loggen, manuelles Nachtragen bleibt darunter offen.
- Während aktiver Session Thenics-artigen Guided Runner bauen:
  - Quelle: im `Plan`-Tab gepflegtes Workout oder Coach-Zuweisung, aber nicht erzwungen.
  - Fokus: `jetzt`-Übung groß, `als Nächstes` klein, klare Reihenfolge statt Formularwand.
  - nicht verhandelbar: Reps-Schieberegler während Rest, Rest-Timer, Finished-Screen.
- Session-Notification über App-Service-Worker:
  - während aktiver Session laufende Status-Benachrichtigung mit Stoppuhr,
  - beim Stop statischer Abschlussstatus,
  - Plattformgrenze sauber beachten: echtes sekundengenaues Weiterlaufen bei komplett geschlossener PWA ist browser-/OS-abhängig.

## [ ] ("Timer") 6Pack-Runner Ausbau (Tabata-like HIIT Core-Workouts) heavily inspired by ATHLEAN-X 6Pack App
wird so ähnlich erfolgen wie der Skills-Runner

# [Push Messages] 
tägliche Push benachrichtigungen bei fehlenden Logs - direkt im Benachrichtigungscenter interaktiv? 
weiteführende Idee: falls in Settings PPL-Split eingestellt dann könnte täglich eine zB Pull=done? Message aufs handy kommen bis das jeweils nächste Workout done ist.
Impuls hierzu: Klient:Matthias fehlende Ambition zum kontinuierlichen Loggen von Workouts.


/**
 * Prompt für den wöchentlichen Trainings-Intensitäts-Check.
 * Analysiert RPE, Volumen und Frequenz pro Klient.
 */
function getTrainingLoadPrompt(weekStart, weekEnd, sessions) {
  return `
    Du bist ein Leistungsdiagnostiker. Analysiere die Trainingsbelastung der Klienten für KW ${weekStart} bis ${weekEnd}.
    
    WICHTIGE REGEL:
    VERWENDE KEIN MARKDOWN! Nutze ausschließlich HTML-Tags (<b>Text</b>) für Fettgedrucktes und normale Bindestriche (-) für Listen.
    
    Bewerte für jeden Klienten:
    - Trainingsfrequenz (wie viele Sessions diese Woche?)
    - Intensität (RPE-Durchschnitt wenn vorhanden)
    - Volumen-Trend: mehr oder weniger als letzte Woche?
    - Erholungsrisiko: wer riskiert Übertraining, wer zu wenig Reiz?
    
    Format (kompakt, max 2 Zeilen pro Klient, mit Emoji):
    <b>📊 Load-Check ${weekStart}–${weekEnd}</b>
    
    - [Name]: [Frequenz], RPE Ø [X], Trend: [↑↓→], [kurze Einschätzung]
    
    DATEN:
    ${JSON.stringify(sessions, null, 2)}
  `;
}

/**
 * Prompt für den Fortschritts-Meilenstein-Check.
 * Erkennt automatisch wenn Klienten signifikante Fortschritte oder neue PRs erreicht haben.
 */
function getMilestonePrompt(sessions) {
  return `
    Analysiere diese Trainingsdaten und identifiziere bemerkenswerte Fortschritte oder Personal Records (PRs).
    
    WICHTIGE REGEL:
    VERWENDE KEIN MARKDOWN! Nutze ausschließlich HTML-Tags (<b>Text</b>) für Fettgedrucktes und normale Bindestriche (-) für Listen.
    
    Suche nach:
    - Neue Gewichts-PRs bei einer Übung
    - Deutliche Volumen-Steigerung (>10% im Vergleich zur Vorwoche)
    - Erreichte Streak-Meilensteine (z.B. 30. Session, 50. Session)
    - Erstmals komplettierte schwierige Übungen oder Fortschritte in Progression
    
    Format (nur ausgeben wenn es tatsächlich Meilensteine gibt):
    <b>🏆 Meilensteine</b>
    
    - [Name]: [Beschreibung des Erfolgs] 🎯
    
    Wenn keine Meilensteine erkennbar: einfach nichts ausgeben.
    
    DATEN:
    ${JSON.stringify(sessions, null, 2)}
  `;
}

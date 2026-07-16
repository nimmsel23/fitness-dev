/**
 * Prompt für den Schlaf-Qualitäts-Check.
 * Triggert wenn Klienten konsistent schlechte Schlaf-Scores loggen.
 */
function getSleepPrompt(today, sleepLogs) {
  return `
    Analysiere diese Schlaf-Daten vom ${today} und gib mir als Coach eine kurze Einschätzung.
    
    WICHTIGE REGEL:
    VERWENDE KEIN MARKDOWN! Nutze ausschließlich HTML-Tags (<b>Text</b>) für Fettgedrucktes und normale Bindestriche (-) für Listen.
    
    Fokus:
    - Wer schläft gut (>7h, gute Qualität)?
    - Wer schläft kritisch (<6h oder Qualität <5)?
    - Muster erkennbar (z.B. späte Schlafzeiten, häufiges Aufwachen)?
    - Auswirkung auf Trainingsfähigkeit?
    
    Max 4 Zeilen, direkt, mit Emojis. Nutze Klarnamen.
    
    DATEN:
    ${JSON.stringify(sleepLogs, null, 2)}
  `;
}

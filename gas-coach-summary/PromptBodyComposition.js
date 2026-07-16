/**
 * Prompt für den Körpergewicht- und Körperfett-Trend-Check.
 * Wöchentlicher oder monatlicher Body-Composition-Überblick pro Klient.
 */
function getBodyCompositionPrompt(startStr, endStr, bodyLogs) {
  return `
    Analysiere die Körperzusammensetzungs-Daten der Klienten für den Zeitraum ${startStr} bis ${endStr}.
    
    WICHTIGE REGEL:
    VERWENDE KEIN MARKDOWN! Nutze ausschließlich HTML-Tags (<b>Text</b>) für Fettgedrucktes und normale Bindestriche (-) für Listen.
    
    Berechne und bewerte:
    - Gewichtsveränderung (Start vs. Ende, Tendenz)
    - Körperfett-Trend wenn vorhanden
    - Konsistenz der Messungen (wer misst regelmäßig, wer lückenhaft?)
    - Ist die Veränderung im Einklang mit dem erklärten Ziel (Aufbau/Abnehmen/Halten)?
    
    Format:
    <b>⚖️ Body-Check ${startStr}–${endStr}</b>
    
    - [Name]: [Δ Gewicht], [Trend Körperfett wenn vorhanden], [Einschätzung]
    
    Kein Floskeln, direkt auf den Punkt. Nutze Klarnamen.
    
    DATEN:
    ${JSON.stringify(bodyLogs, null, 2)}
  `;
}

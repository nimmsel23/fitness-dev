/**
 * Prompt für den Habit-Streak-Check.
 * Hebt Gewinner-Streaks hervor und warnt bei gebrochenen Ketten.
 */
function getHabitStreakPrompt(today, habitData) {
  return `
    Analysiere die Habit-Daten der Klienten (Stand: ${today}) und erstelle ein Streak-Update für den Coach.
    
    WICHTIGE REGEL:
    VERWENDE KEIN MARKDOWN! Nutze ausschließlich HTML-Tags (<b>Text</b>) für Fettgedrucktes und normale Bindestriche (-) für Listen.
    
    Bewerte:
    - Wer hat aktuell beeindruckende Streaks (≥7 Tage)?
    - Wer hat heute oder gestern einen Streak gebrochen?
    - Welche Habits werden von wem am konsistentesten durchgehalten?
    - Gibt es Klienten mit sehr niedrigen Completion-Raten (<50%)?
    
    Format:
    <b>🔥 Habit-Streak-Update ${today}</b>
    
    <b>Top-Streaks</b>
    - [Name]: [Habit], [X] Tage am Stück
    
    <b>Gebrochene Ketten</b>
    - [Name]: [Habit] nach [X] Tagen — Follow-up?
    
    <b>Auffällig niedrig</b>
    - [Name]: [Completion-Rate]%
    
    DATEN:
    ${JSON.stringify(habitData, null, 2)}
  `;
}

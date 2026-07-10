/**
 * VITAL-OS COACH SUMMARY - GOOGLE APPS SCRIPT
 * 
 * Dieses Skript ruft täglich/wöchentlich/monatlich/quartalsweise die Logs aller
 * Klienten aus Firestore ab, übersetzt UIDs in Namen via profile-Collection,
 * fasst sie über die Gemini API zusammen und sendet dir das Briefing per Telegram.
 * 
 * AUTH: OAuth via ScriptApp.getOAuthToken() — kein Service-Account Key nötig,
 *       das Skript muss am GCP-Projekt fitness-aos (842575255284) hängen.
 * 
 * VORAUSSETZUNGEN (Script Properties):
 * 1. GEMINI_API_KEY: Dein Google Gemini API Key
 * 2. TELEGRAM_BOT_TOKEN: Dein Telegram Bot Token (für @aos_fitness_bot)
 * 3. TELEGRAM_CHAT_ID: Deine Chat-ID (kommasepariert)
 */

const PROJECT_ID = 'fitness-aos';

// === TRIGGER-FUNKTIONEN (Für die Automatisierung) ===

function runDailyBriefing()     { generateBriefing('daily'); }
function runWeeklyBriefing()    { generateBriefing('weekly'); }
function runMonthlyBriefing()   { generateBriefing('monthly'); }
function runQuarterlyBriefing() { generateBriefing('quarterly'); }

/**
 * Registriert alle zeitgesteuerten Trigger in Google Apps Script automatisch.
 * Diese Funktion muss einmalig manuell im Editor ausgeführt werden.
 */
function setupAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));

  // 1. Tägliches Briefing um 6:00 Uhr morgens (für "gestern")
  ScriptApp.newTrigger('runDailyBriefing')
    .timeBased()
    .everyDays(1)
    .atHour(6)
    .create();

  // 2. Wöchentliches Briefing jeden Montag um 7:00 Uhr morgens
  ScriptApp.newTrigger('runWeeklyBriefing')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7)
    .create();

  // 3. Monatliches Briefing am 1. jedes Monats um 8:00 Uhr morgens
  ScriptApp.newTrigger('runMonthlyBriefing')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();

  // 4. Quartals-Briefing am 1. des Monats um 9:00 Uhr morgens (wird über Trigger gefiltert)
  ScriptApp.newTrigger('runQuarterlyBriefingTrigger')
    .timeBased()
    .onMonthDay(1)
    .atHour(9)
    .create();
}

/**
 * Filtert das monatliche Triggern, damit das Quartals-Briefing nur alle 3 Monate läuft.
 */
function runQuarterlyBriefingTrigger() {
  const month = new Date().getMonth(); // 0-indexed (Jan=0, Apr=3, Jul=6, Oct=9)
  if (month === 0 || month === 3 || month === 6 || month === 9) {
    runQuarterlyBriefing();
  }
}

// === KERN-FUNKTION ===

function generateBriefing(timeframe) {
  const props = PropertiesService.getScriptProperties();
  const dates = getDateRange(timeframe);
  
  // 1. Hole Daten aus Firestore für den Zeitraum
  const token = ScriptApp.getOAuthToken(); 
  const journals = fetchCollectionGroupRange(token, 'journal', dates.startStr, dates.endStr);
  const sessions = fetchCollectionGroupRange(token, 'sessions', dates.startStr, dates.endStr);
  
  // User-Namen mappen
  const userMap = fetchUserMap(token);
  journals.forEach(j => j._userName = userMap[j._userId] || j._userId);
  sessions.forEach(s => s._userName = userMap[s._userId] || s._userId);

  const expectedClients = Object.entries(userMap).map(([id, name]) => ({ id, name }));
  
  if (journals.length === 0 && sessions.length === 0) {
    sendTelegramMessage(props, `ℹ️ <b>Keine Logs</b> im Zeitraum ${dates.startStr} bis ${dates.endStr} (${timeframe}) gefunden.`);
    return;
  }

  // 2. Erstelle einen KI-Prompt
  const rawData = `
    Zeitraum: ${dates.startStr} bis ${dates.endStr} (${timeframe})
    Erwartete Klienten (Datenbank-Profile):
    ${JSON.stringify(expectedClients, null, 2)}
    
    Journal-Einträge:
    ${JSON.stringify(journals, null, 2)}
    
    Training/Sessions:
    ${JSON.stringify(sessions, null, 2)}
  `;

  // Dynamischer Prompt, der sich an den Zeitraum anpasst
  const prompt = `
    Du bist das analytische Backend für ein professionelles Client-Management-System. 
    Analysiere die Klienten-Logs für den Zeitraum: ${timeframe.toUpperCase()} (${dates.startStr} bis ${dates.endStr}).
    
    WICHTIGE REGELN:
    1. Wir tracken High-Level-Protokolle, keinen "Sets, Reps und Weights"-Kleinkram. 
    2. Da dies ein ${timeframe}-Review ist, suche nach langfristigen Trends, nicht nur nach tagesaktuellen Schwankungen.
    3. Wer war durchgehend konsistent? Wer hatte mehrere Ausfälle (z.B. gehäuft schlechter Schlaf, fehlende Sessions)?
    4. Nutze die Liste der "Erwarteten Klienten", um unter "Fehlende Logs" präzise alle Klienten aufzulisten, für die in den Rohdaten KEIN Journal- und KEIN Session-Eintrag vorliegt. Nutze immer deren Klarnamen.
    5. VERWENDE KEIN MARKDOWN! Keine Sternchen (*), keine Rauten (#). Nutze für Fettgedrucktes ausschließlich HTML-Tags (<b>Text</b>) und für Listen normale Bindestriche (-).
    
    Erstelle eine kompakte Telegram-Zusammenfassung exakt in diesem HTML-Format:
    
    <b>🎯 ${timeframe.toUpperCase()} Review (${dates.startStr} bis ${dates.endStr})</b>
    [2-3 Sätze zum Gesamttrend der eingegangenen Logs im gesamten Zeitraum]
    
    <b>🟢 Konsistent (On Track)</b>
    - [Name des Klienten]: [Kurzer Grund, warum es gut lief]
    
    <b>🟡 Feedback & Check-in Bedarf</b>
    - [Name des Klienten]: [Erkannte Muster/Probleme über den Zeitraum & Grund für Eingreifen]
    
    <b>🔴 Fehlende Logs (Follow-up)</b>
    - [Name des Klienten]
    
    Rohdaten:
    ${rawData}
  `;

  // 3. KI-Zusammenfassung generieren
  const briefing = callGeminiAPI(props.getProperty('GEMINI_API_KEY'), prompt);

  // 4. Per Telegram versenden
  if (briefing) {
    const message = `🧠 <b>Coach ${timeframe.toUpperCase()} Briefing</b>\n\n${briefing}`;
    sendTelegramMessage(props, message);
  }
}

// === HILFSFUNKTIONEN ===

// Berechnet Start- und Enddatum basierend auf dem Zeitraum
function getDateRange(timeframe) {
  const end = new Date();
  end.setDate(end.getDate() - 1); // Das Ende ist immer "gestern"
  const start = new Date(end);

  switch(timeframe) {
    case 'daily':     start.setDate(start.getDate() - 0); break; // Gleicher Tag wie Ende
    case 'weekly':    start.setDate(start.getDate() - 6); break; // 7 Tage rückwirkend
    case 'monthly':   start.setMonth(start.getMonth() - 1); break; // 1 Monat rückwirkend
    case 'quarterly': start.setMonth(start.getMonth() - 3); break; // 3 Monate rückwirkend
  }

  return {
    startStr: start.toISOString().split('T')[0],
    endStr: end.toISOString().split('T')[0]
  };
}

// Holt Daten aus Firestore mit einer Datumsspanne (>= start AND <= end)
function fetchCollectionGroupRange(token, collectionId, startDate, endDate) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const payload = {
    structuredQuery: {
      from: [{ collectionId: collectionId, allDescendants: true }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            {
              fieldFilter: {
                field: { fieldPath: "date" },
                op: "GREATER_THAN_OR_EQUAL",
                value: { stringValue: startDate }
              }
            },
            {
              fieldFilter: {
                field: { fieldPath: "date" },
                op: "LESS_THAN_OR_EQUAL",
                value: { stringValue: endDate }
              }
            }
          ]
        }
      }
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${token}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  if (response.getResponseCode() !== 200) {
    console.error(`Fehler bei ${collectionId}: ${response.getContentText()}`);
    return [];
  }

  const result = JSON.parse(response.getContentText());
  return result
    .filter(r => r.document)
    .map(r => {
      const doc = r.document;
      const path = doc.name.split('/');
      const userId = path[path.indexOf('documents') + 2];
      
      let parsedFields = { _userId: userId };
      for (const [key, val] of Object.entries(doc.fields)) {
        parsedFields[key] = val.stringValue || val.integerValue || val.booleanValue || JSON.stringify(val);
      }
      return parsedFields;
    });
}

function fetchUserMap(token) {
  // Nutzt eine Collection Group Query, um alle "profile"-Collections zu finden
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const payload = {
    structuredQuery: {
      from: [{ collectionId: "profile", allDescendants: true }]
    }
  };

  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${token}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  const map = {};
  if (response.getResponseCode() !== 200) return map;
  
  const result = JSON.parse(response.getContentText());
  
  result.forEach(r => {
    if (!r.document) return;
    const doc = r.document;
    
    // Pfad-Beispiel: projects/.../databases/(default)/documents/fitness/{uid}/profile/metadata
    const pathParts = doc.name.split('/');
    const userId = pathParts[pathParts.indexOf('fitness') + 1]; 
    
    const name = (doc.fields.displayName && doc.fields.displayName.stringValue) 
              || (doc.fields.name && doc.fields.name.stringValue);
              
    if (name) map[userId] = name;
  });
  
  return map;
}

function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "Du bist ein präziser, analytischer Coach." }] },
    generationConfig: { temperature: 0.2 } // Niedrige Temperatur = präzisere, analytischere Antworten
  };
  
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  if (res.getResponseCode() === 200) {
    const data = JSON.parse(res.getContentText());
    return data.candidates[0].content.parts[0].text;
  }
  return "Fehler bei der KI-Generierung: " + res.getContentText();
}

function sendTelegramMessage(props, text) {
  const token = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatIdsStr = props.getProperty('TELEGRAM_CHAT_ID') || "";
  
  const chatIds = chatIdsStr.split(',')
    .map(id => id.trim())
    .filter(id => id !== "");
  
  chatIds.forEach(chatId => {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' }),
      muteHttpExceptions: true
    });
    
    if (res.getResponseCode() !== 200) {
      console.error(`Telegram Fehler für ID ${chatId}: ${res.getContentText()}`);
    }
  });
}

/**
 * VITAL-OS COACH SUMMARY - GOOGLE APPS SCRIPT
 * 
 * Dieses Skript ruft täglich die Journal-Einträge und Sessions aller Klienten aus Firestore ab, 
 * fasst sie über die Gemini API zusammen und sendet dir das Briefing per Telegram.
 * 
 * AUTH: Das Skript hängt am GCP-Projekt fitness-aos (842575255284) und
 * authentifiziert sich via ScriptApp.getOAuthToken() als Projekt-Owner
 * gegen Firestore — kein Service-Account-Key in den Properties nötig.
 *
 * VORAUSSETZUNGEN (Script Properties):
 * 1. GEMINI_API_KEY: Dein Google Gemini API Key
 * 2. TELEGRAM_BOT_TOKEN: Dein Telegram Bot Token
 * 3. TELEGRAM_CHAT_ID: Chat-IDs, kommasepariert
 */

const PROJECT_ID = 'fitness-aos';

function runDailyBriefing() {
  const props = PropertiesService.getScriptProperties();
  const dateStr = getYesterdayString();
  
  // 1. Hole Daten aus Firestore (OAuth-Token des Skript-Owners, Scope: datastore)
  const token = ScriptApp.getOAuthToken();
  const journals = fetchCollectionGroup(token, 'journal', dateStr);
  const sessions = fetchCollectionGroup(token, 'sessions', dateStr);
  
  if (journals.length === 0 && sessions.length === 0) {
    sendTelegramMessage(props, `ℹ️ Keine neuen Logs von Klienten am ${dateStr} gefunden.`);
    return;
  }

  // 2. Erstelle einen KI-Prompt
  const rawData = `
    Journal-Einträge:
    ${JSON.stringify(journals, null, 2)}
    
    Training/Sessions:
    ${JSON.stringify(sessions, null, 2)}
  `;

  const prompt = `
    Du bist ein professioneller Fitness- und Life-Coach. Analysiere die folgenden Klienten-Logs (Journals und Sessions) vom ${dateStr}.
    Erstelle eine super kompakte, direkte und gut lesbare Telegram-Zusammenfassung für den Head-Coach.
    Fasse zusammen, was gut lief, wer Probleme hatte und wo der Coach ggf. eingreifen sollte.
    Nutze Emojis, aber bleibe präzise.
    
    Rohdaten:
    ${rawData}
  `;

  // 3. KI-Zusammenfassung generieren
  const briefing = callGeminiAPI(props.getProperty('GEMINI_API_KEY'), prompt);

  // 4. Per Telegram versenden
  if (briefing) {
    const message = `🧠 *Coach Tagesbriefing (${dateStr})*\n\n${briefing}`;
    sendTelegramMessage(props, message);
  }
}

// --- Hilfsfunktionen ---

function getYesterdayString() {
  const d = new Date();
  d.setDate(d.getDate() - 1); // Gestern
  return d.toISOString().split('T')[0];
}

function fetchCollectionGroup(token, collectionId, date) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  
  const payload = {
    structuredQuery: {
      from: [{ collectionId: collectionId, allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: "date" },
          op: "EQUAL",
          value: { stringValue: date }
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
  // Extrahiere die Document-Fields
  return result
    .filter(r => r.document)
    .map(r => {
      const doc = r.document;
      const path = doc.name.split('/');
      const userId = path[path.indexOf('documents') + 2]; // Extrahiere UserID aus Pfad
      
      let parsedFields = { _userId: userId };
      for (const [key, val] of Object.entries(doc.fields)) {
        parsedFields[key] = val.stringValue || val.integerValue || val.booleanValue || JSON.stringify(val);
      }
      return parsedFields;
    });
}

function callGeminiAPI(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "Du bist ein präziser, analytischer Coach." }] }
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
  // Hole alle Chat-IDs, getrennt durch Komma, falls mehrere konfiguriert sind
  const chatIds = props.getProperty('TELEGRAM_CHAT_ID').split(',').map(id => id.trim());
  
  chatIds.forEach(chatId => {
    if (!chatId) return;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' })
    });
  });
}

/**
 * Einmalig ausführen nach der Umstellung auf OAuth:
 * löscht die obsoleten Service-Account-Secrets aus den Script Properties.
 */
function cleanupOldSecrets() {
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty('FIREBASE_PRIVATE_KEY');
  props.deleteProperty('FIREBASE_CLIENT_EMAIL');
  console.log('FIREBASE_PRIVATE_KEY und FIREBASE_CLIENT_EMAIL entfernt.');
}

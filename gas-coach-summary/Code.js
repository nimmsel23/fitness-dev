/**
 * VITAL-OS COACH BOT — GOOGLE APPS SCRIPT
 *
 * Prompt-Module & Trigger:
 *   runDailyBriefing()         — täglich 08:00, gestern Überblick (Journal + Sessions + Habits)
 *   runWeeklyReport()          — Montag 09:00, 7-Tage Klienten-Performance-Review
 *   runNutritionCheck()        — täglich 10:00, Fuel-Log-Abdeckung der Klienten
 *   runMoodTrendAlert()        — täglich 08:05, Mood-Trend-Warnung wenn Klient mehrere Tage < 5
 *   runMissingLogAlert()       — täglich 20:00, wer hat heute noch NICHTS geloggt
 *   sendTestMessage()          — manuell, schickt Test-Ping
 *
 * AUTH: OAuth via ScriptApp.getOAuthToken() — kein Service-Account Key nötig,
 *       das Skript muss am GCP-Projekt fitness-aos (842575255284) hängen.
 *
 * Script Properties:
 *   GEMINI_API_KEY       — Gemini API Key
 *   TELEGRAM_BOT_TOKEN   — @aos_fitness_bot Token
 *   TELEGRAM_CHAT_ID     — Coach Chat-IDs, kommasepariert
 */

const PROJECT_ID = 'fitness-aos';

// ═══════════════════════════════════════════════════════
//  TRIGGER-FUNKTIONEN (werden per Trigger aufgerufen)
// ═══════════════════════════════════════════════════════

/**
 * Täglich 08:00 — gestern: Journal + Training + Habit-Completion
 */
function runDailyBriefing() {
  const date = getDateString(-1);
  const token = ScriptApp.getOAuthToken();
  const props = PropertiesService.getScriptProperties();

  const journals  = fetchCollectionGroup(token, 'journal',  date);
  const sessions  = fetchCollectionGroup(token, 'sessions', date);
  const habits    = fetchCollectionGroup(token, 'habitJournals', date);

  if (journals.length === 0 && sessions.length === 0 && habits.length === 0) {
    sendTelegram(props, `ℹ️ *Coach-Briefing ${date}*\n\nKeine Logs gefunden.`);
    return;
  }

  const prompt = `Du bist ein professioneller Fitness- & Life-Coach. Analysiere die Klienten-Logs vom ${date}.
Erstelle ein kompaktes, direktes Telegram-Briefing für den Head-Coach.
Struktur:
1. 🏆 Was lief heute gut (pro Klient, max 1 Satz)
2. ⚠️ Wer hatte Probleme / niedrige Mood-Werte
3. 💡 1–2 konkrete Coach-Empfehlungen für morgen
Nutze Emojis, sei präzise, kein Fließtext.

DATEN:
Journals: ${JSON.stringify(journals)}
Sessions: ${JSON.stringify(sessions)}
Habit-Journals: ${JSON.stringify(habits)}`;

  const summary = callGemini(props.getProperty('GEMINI_API_KEY'), prompt);
  sendTelegram(props, `🧠 *Coach-Briefing ${date}*\n\n${summary}`);
}

/**
 * Montags 09:00 — 7-Tage Performance-Review pro Klient
 */
function runWeeklyReport() {
  const props = PropertiesService.getScriptProperties();
  const token = ScriptApp.getOAuthToken();
  const today = getDateString(0);
  const weekAgo = getDateString(-7);

  // Holen der letzten 7 Tage via Range-Query
  const sessions = fetchCollectionGroupRange(token, 'sessions', weekAgo, today);
  const journals  = fetchCollectionGroupRange(token, 'journal',  weekAgo, today);

  if (sessions.length === 0 && journals.length === 0) {
    sendTelegram(props, `📊 *Wochenbericht (${weekAgo} – ${today})*\n\nKeine Daten für diese Woche.`);
    return;
  }

  // Gruppiere nach User
  const byUser = {};
  [...sessions, ...journals].forEach(e => {
    const u = e._userId;
    if (!byUser[u]) byUser[u] = [];
    byUser[u].push(e);
  });

  const prompt = `Du bist ein Fitness-Coach. Erstelle einen prägnanten Wochenbericht (${weekAgo} bis ${today}) für alle Klienten.
Pro Klient: Trainingsfrequenz, Mood-Trend (falls vorhanden), Fortschritt und 1 konkrete Empfehlung.
Format: Eine Section pro Klient mit Emoji, Markdown-fähig für Telegram.

DATEN:
${JSON.stringify(byUser, null, 2)}`;

  const report = callGemini(props.getProperty('GEMINI_API_KEY'), prompt);
  sendTelegram(props, `📊 *Wochenbericht ${weekAgo} – ${today}*\n\n${report}`);
}

/**
 * Täglich 10:00 — Fuel/Nutrition-Abdeckung: wer hat heute geloggt, wer nicht?
 */
function runNutritionCheck() {
  const props = PropertiesService.getScriptProperties();
  const token = ScriptApp.getOAuthToken();
  const today = getDateString(0);

  const mealLogs = fetchCollectionGroupByCollection(token, 'nutrition', today);

  if (mealLogs.length === 0) {
    sendTelegram(props, `🥗 *Fuel-Check ${today}*\n\nNoch keine Ernährungsdaten heute.`);
    return;
  }

  const prompt = `Analysiere diese Ernährungs-Logs vom ${today} und erstelle eine kurze Zusammenfassung:
- Wer hat gut getankt (Kalorien, Makros)?
- Wer fehlt noch / hat sehr wenig geloggt?
- Auffälligkeiten?
Sei direkt, max 5 Zeilen, mit Emojis.

DATEN: ${JSON.stringify(mealLogs)}`;

  const check = callGemini(props.getProperty('GEMINI_API_KEY'), prompt);
  sendTelegram(props, `🥗 *Fuel-Check ${today}*\n\n${check}`);
}

/**
 * Täglich 08:05 — Mood-Trend-Alarm: wer hatte 3+ Tage Mood < 5?
 */
function runMoodTrendAlert() {
  const props = PropertiesService.getScriptProperties();
  const token = ScriptApp.getOAuthToken();
  const today = getDateString(0);
  const threeDaysAgo = getDateString(-3);

  const sessions = fetchCollectionGroupRange(token, 'sessions', threeDaysAgo, today);

  // Filtere Klienten mit durchgehend niedrigem Mood
  const userMoods = {};
  sessions.forEach(s => {
    const u = s._userId;
    const mood = parseInt(s.mood, 10);
    if (!isNaN(mood)) {
      if (!userMoods[u]) userMoods[u] = [];
      userMoods[u].push({ date: s.date, mood });
    }
  });

  const alerts = Object.entries(userMoods)
    .filter(([_, moods]) => moods.length >= 2 && moods.every(m => m.mood < 6))
    .map(([uid, moods]) => ({ uid, moods }));

  if (alerts.length === 0) return; // Alles gut, kein Ping nötig

  const prompt = `Folgende Klienten zeigen einen anhaltend niedrigen Mood-Score (letzte 3 Tage, alle Werte < 6):
${JSON.stringify(alerts, null, 2)}

Formuliere eine kurze, empathische Coach-Warnung für mich (den Coach) auf Deutsch:
- Wer ist betroffen?
- Empfehlung (proaktiv ansprechen? Check-in einplanen?)
Max 3–4 Sätze, direkt, kein Floskeln.`;

  const alert = callGemini(props.getProperty('GEMINI_API_KEY'), prompt);
  sendTelegram(props, `🔴 *Mood-Alarm*\n\n${alert}`);
}

/**
 * Täglich 20:00 — Erinnerung: wer hat HEUTE noch gar nichts geloggt?
 */
function runMissingLogAlert() {
  const props = PropertiesService.getScriptProperties();
  const token = ScriptApp.getOAuthToken();
  const today = getDateString(0);

  // Wer hat heute irgendwas
  const journalsToday  = fetchCollectionGroup(token, 'journal',   today);
  const sessionsToday  = fetchCollectionGroup(token, 'sessions',  today);

  const activeUsers = new Set([
    ...journalsToday.map(e => e._userId),
    ...sessionsToday.map(e => e._userId),
  ]);

  // Alle bekannten User aus den letzten 7 Tagen holen
  const weekAgo = getDateString(-7);
  const recentSessions = fetchCollectionGroupRange(token, 'sessions', weekAgo, today);
  const allKnownUsers  = new Set(recentSessions.map(s => s._userId));

  const silent = [...allKnownUsers].filter(u => !activeUsers.has(u));

  if (silent.length === 0) {
    sendTelegram(props, `✅ *Log-Check ${today}*\n\nAlle aktiven Klienten haben heute geloggt.`);
    return;
  }

  const msg = `📭 *Log-Check ${today}*\n\nNoch keine Aktivität heute:\n${silent.map(u => `• \`${u.slice(0,8)}…\``).join('\n')}\n\n_Evtl. Erinnerung schicken?_`;
  sendTelegram(props, msg);
}

/**
 * Manuell — Test-Ping
 */
function sendTestMessage() {
  const props = PropertiesService.getScriptProperties();
  sendTelegram(props, '✅ *VitalOS Coach Bot* ist aktiv und verbunden!');
}

// ═══════════════════════════════════════════════════════
//  SETUP — Trigger automatisch anlegen
// ═══════════════════════════════════════════════════════

/**
 * Einmalig ausführen um alle Trigger zu registrieren.
 * Bestehende Trigger werden erst gelöscht (idempotent).
 */
function setupAllTriggers() {
  // Alte Trigger löschen
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  const triggers = [
    { fn: 'runDailyBriefing',   hour: 8  },
    { fn: 'runMoodTrendAlert',  hour: 8,  minute: 5 },
    { fn: 'runNutritionCheck',  hour: 10 },
    { fn: 'runMissingLogAlert', hour: 20 },
  ];

  triggers.forEach(({ fn, hour }) => {
    ScriptApp.newTrigger(fn)
      .timeBased()
      .everyDays(1)
      .atHour(hour)
      .create();
  });

  // Wochenbericht: Montag 09:00
  ScriptApp.newTrigger('runWeeklyReport')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();

  console.log('✅ Alle Trigger eingerichtet.');
  PropertiesService.getScriptProperties().deleteProperty('FIREBASE_PRIVATE_KEY');
  PropertiesService.getScriptProperties().deleteProperty('FIREBASE_CLIENT_EMAIL');
}

// ═══════════════════════════════════════════════════════
//  FIRESTORE HELPERS
// ═══════════════════════════════════════════════════════

function fetchCollectionGroup(token, collectionId, date) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const payload = {
    structuredQuery: {
      from: [{ collectionId, allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'date' },
          op: 'EQUAL',
          value: { stringValue: date }
        }
      },
      limit: 200
    }
  };
  return runFirestoreQuery(token, url, payload);
}

function fetchCollectionGroupRange(token, collectionId, startDate, endDate) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const payload = {
    structuredQuery: {
      from: [{ collectionId, allDescendants: true }],
      where: {
        compositeFilter: {
          op: 'AND',
          filters: [
            { fieldFilter: { field: { fieldPath: 'date' }, op: 'GREATER_THAN_OR_EQUAL',    value: { stringValue: startDate } } },
            { fieldFilter: { field: { fieldPath: 'date' }, op: 'LESS_THAN_OR_EQUAL', value: { stringValue: endDate } } }
          ]
        }
      },
      orderBy: [{ field: { fieldPath: 'date' }, direction: 'ASCENDING' }],
      limit: 500
    }
  };
  return runFirestoreQuery(token, url, payload);
}

function fetchCollectionGroupByCollection(token, rootCollection, date) {
  // nutrition/{uid}/logs — andere Struktur, kein collectionGroup
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const payload = {
    structuredQuery: {
      from: [{ collectionId: 'logs', allDescendants: true }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'date' },
          op: 'EQUAL',
          value: { stringValue: date }
        }
      },
      limit: 200
    }
  };
  const allLogs = runFirestoreQuery(token, url, payload);
  return allLogs.filter(log => log._source === rootCollection);
}

function runFirestoreQuery(token, url, payload) {
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${token}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  if (res.getResponseCode() !== 200) {
    console.error(`Firestore Fehler: ${res.getContentText()}`);
    return [];
  }

  return JSON.parse(res.getContentText())
    .filter(r => r.document)
    .map(r => {
      const docPath = r.document.name.split('/');
      const typeIndex = docPath.indexOf('documents') + 1;
      const type = docPath[typeIndex];
      const userId = docPath[typeIndex + 1];
      const parsed = { _userId: userId, _source: type };
      Object.entries(r.document.fields || {}).forEach(([k, v]) => {
        parsed[k] = v.stringValue ?? v.integerValue ?? v.doubleValue ?? v.booleanValue ?? v.timestampValue ?? JSON.stringify(v);
      });
      return parsed;
    });
}

// ═══════════════════════════════════════════════════════
//  GEMINI + TELEGRAM
// ═══════════════════════════════════════════════════════

function callGemini(apiKey, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
  };
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  if (res.getResponseCode() === 200) {
    return JSON.parse(res.getContentText()).candidates[0].content.parts[0].text;
  }
  console.error('Gemini Fehler:', res.getContentText());
  return null;
}

function sendTelegram(props, text) {
  const botToken = props.getProperty('TELEGRAM_BOT_TOKEN');
  const chatIds  = (props.getProperty('TELEGRAM_CHAT_ID') || '').split(',').map(s => s.trim()).filter(Boolean);
  chatIds.forEach(chatId => {
    UrlFetchApp.fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
      muteHttpExceptions: true
    });
  });
}

// ═══════════════════════════════════════════════════════
//  DATE HELPERS
// ═══════════════════════════════════════════════════════

function getDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  // Lokale Zeit in YYYY-MM-DD (Wien/Berlin)
  return Utilities.formatDate(d, 'Europe/Berlin', 'yyyy-MM-dd');
}

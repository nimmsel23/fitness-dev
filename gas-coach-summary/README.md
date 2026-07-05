# VitalOS Coach Summary (GAS)

Dieses Google Apps Script holt sich über die Firestore REST API die Fitness- und Journal-Logs aller Klienten des gestrigen Tages, wertet diese via **Gemini 2.5 Flash** aus und sendet dir ein knackiges Coach-Briefing über den `@aos_fitness_bot` per Telegram.

Es arbeitet komplett Serverless in der Cloud und benötigt **keine externen Bibliotheken**.

## 🔐 Auth-Modell (seit 2026-07-04)

Das Skript hängt am GCP-Projekt **fitness-aos** (Projektnummer `842575255284`) — demselben Projekt wie Firebase. Firestore-Zugriff läuft über `ScriptApp.getOAuthToken()` (Scope `datastore` in der `appsscript.json`): Das Skript authentifiziert sich als Skript-Owner, der Owner des Firebase-Projekts ist. **Es liegt kein Service-Account-Key mehr in den Script Properties.**

Nach Scope-Änderungen (`appsscript.json`) fragt Google beim nächsten manuellen Run einmalig neu nach Berechtigungen — das ist normal, einfach bestätigen.

## 🚀 Deployment (via Clasp)

Das Projekt ist mit `clasp` verbunden. Wenn du Änderungen an der `Code.js` machst:
```bash
npx @google/clasp push
```

## ⚙️ Einrichtung (Script Properties)

Damit das Skript läuft, müssen in den **Project Settings** unter **Script Properties** (im Google Apps Script Dashboard) folgende Umgebungsvariablen gesetzt werden:

- `GEMINI_API_KEY`: Dein API-Key (zu finden in der `gemini.env`).
- `TELEGRAM_BOT_TOKEN`: Dein Telegram Bot Token (für `@aos_fitness_bot`).
- `TELEGRAM_CHAT_ID`: Die Ziel-Chat-IDs (z.B. `7077779346,8442781308` – kommasepariert).

## 🕒 Automatisierung (Trigger)

Gehe im Apps Script Interface auf **Triggers (die Uhr)** und erstelle einen neuen Trigger:
- **Funktion:** `runDailyBriefing`
- **Typ:** Time-driven
- **Intervall:** Day timer (z.B. zwischen 08:00 AM und 09:00 AM)

Ab diesem Zeitpunkt erhältst du jeden Morgen automatisch deinen Report!
(Zeitzone des Skripts ist `Europe/Vienna` — die Trigger-Zeiten gelten also in Lokalzeit.)

## 🧹 Aufräumen nach der OAuth-Umstellung

Falls noch `FIREBASE_PRIVATE_KEY` / `FIREBASE_CLIENT_EMAIL` in den Script Properties liegen: einmalig die Funktion `cleanupOldSecrets` im Editor ausführen, dann sind sie weg.

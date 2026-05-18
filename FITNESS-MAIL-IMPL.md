# Fitness Mail — Implementierung

Fitbit → Gmail → fitness-mail → `~/.aos/fitness/body/`

## Flow

```
Fitbit (Waage / Versa 4)
       ↓
Gmail: nimmdaniel+fitness@gmail.com → Label "fitness"
  (Direktmail von Fitbit ODER IFTTT-Applet)
       ↓
fitness-mail poll  (täglich via Systemd-Timer)
  IMAP: nimmdaniel@gmail.com, Label "fitness"
       ↓
Handler-Dispatch (Subject + Body gematcht):
  weight   → Gewicht, BMI, Körperfett, Lean Mass
  activity → Schritte, aktive Minuten, kcal, Distanz
  sleep    → Schlafdauer, Sleep Score, Schlafphasen
  hr       → Ruhepuls (bpm)
       ↓
~/.aos/fitness/body/YYYY-MM-DD.json
       ↓
GET /fitness/body (server.mjs :9100)
```

## Fitbit Email-Typen

| Typ | Trigger | Sender | Subject-Beispiel |
|-----|---------|--------|------------------|
| Gewicht | Waage benutzt | notify@fitbit.com | "Weight: 85.3 kg" |
| Daily Activity | IFTTT Applet | ifttt@ifttt.com | "fitbit daily: 8423 steps 42 active_min 2134 kcal" |
| Sleep | Fitbit App | notify@fitbit.com | "Your sleep score: 78" |
| Heart Rate | Fitbit App | notify@fitbit.com | "Resting heart rate: 58 bpm" |

## Gmail Setup

Filter: An `nimmdaniel+fitness@gmail.com` → Label "fitness", Inbox überspringen.
Alternativ: `from:notify@fitbit.com` → Label "fitness".

## IFTTT Setup (Activity)

- Trigger: Fitbit → "Daily activity summary"
- Action: Email an `nimmdaniel+fitness@gmail.com`
- Subject: `fitbit daily: {{Steps}} steps {{ActiveMinutes}} active_min {{CaloriesBurned}} kcal`

## Installation

```bash
# 1. Gmail App-Passwort: https://myaccount.google.com/apppasswords
nano ~/.config/fitness-mail/fitness-mail.env
#   FITNESS_MAIL_USER=nimmdaniel@gmail.com
#   FITNESS_MAIL_PASS=xxxx-xxxx-xxxx-xxxx

# 2. Systemd aktivieren
systemctl --user daemon-reload
systemctl --user enable --now fitness-mail.timer

# 3. Testen
fitness-mail poll
fitness-mail show
```

## Dateien

| Datei | Zweck |
|-------|-------|
| `~/fitness-dev/bin/fitness-mail` | Python CLI (typer + loguru + imaplib) |
| `~/.config/fitness-mail/fitness-mail.env` | Credentials (chmod 600) |
| `~/.config/systemd/user/fitness-mail.service` | oneshot systemd unit |
| `~/.config/systemd/user/fitness-mail.timer` | täglicher Timer (`OnCalendar=daily`) |
| `~/.aos/fitness/body/YYYY-MM-DD.json` | Body-Metriken pro Tag |

## aerc Integration

```
:pipe fitness-mail parse
```
Verarbeitet die markierte Email direkt ohne IMAP-Poll.

## API Endpoint

```
GET  /fitness/body?days=30   → { ok, entries: [{date, weight_kg, steps, ...}] }
POST /fitness/body            → { ok, day }  (manueller Eintrag)
```

## Handler-Erweiterung

1. Funktion `handle_xyz(subject, body_text, day) -> bool` in `fitness-mail` ergänzen
2. In `HANDLERS`-Liste mit Regex-Pattern eintragen
3. Schreibt via `_write_body(day, data)` nach `~/.aos/fitness/body/`

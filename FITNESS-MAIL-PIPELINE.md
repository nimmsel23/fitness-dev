# Fitness Mail Pipeline

Tägliche Fitbit-Activity-Daten via IFTTT → E-Mail → Parser → Taskwarrior.

## Flow

```
Fitbit (Versa 4) — tägliche Activity-Sync
       ↓
IFTTT: Fitbit → "Daily activity summary"
  → Mail an nimmdaniel+fitness@gmail.com
  Subject: "Fitbit Daily: {{Steps}} steps, {{ActiveMinutes}} active min"
  Body:    Steps={{Steps}}, ActiveMinutes={{ActiveMinutes}},
           CaloriesBurned={{CaloriesBurned}}, Distance={{Distance}}
       ↓
fitness-mail Poller (analog ~/bin/hotlist-mail)
  IMAP: nimmdaniel@gmail.com, Label "fitness"
  alle 2min via Systemd-Timer
       ↓
Parsing + Condition-Check:
  steps >= 10000       → TW task "steps"   → done
  active_minutes >= 60 → TW task "workout" → done
  weight logged        → TW task "weigh-in" → done
       ↓
tasklib → core4warrior DB (~/.aos/core4/tw-data/)
  project=body, tags=[fitness, habit, w<KW>], status=completed
```

## IFTTT Setup

- Trigger: `Fitbit` → "Daily activity summary"
- Action: `Email` → Send email
  - To: `nimmdaniel+fitness@gmail.com`
  - Subject: `fitbit daily: {{Steps}} steps {{ActiveMinutes}} active_min {{CaloriesBurned}} kcal`
  - Body: (optional, Redundanz)

Subject als Single Source of Truth — einfacher zu parsen als HTML-Body.

## Gmail Filter

- To: `nimmdaniel+fitness@gmail.com`
- Aktion: Label "fitness" anwenden, Inbox überspringen

## Geplante Konditions-Regeln

| Bedingung | TW Task | Projekt |
|-----------|---------|---------|
| steps >= 10000 | daily-steps | body |
| active_minutes >= 60 | daily-workout | body |
| weight in subject | daily-weigh-in | body |
| calories >= X | (optional) | body |

Schwellwerte konfigurierbar via `~/.config/fitness-mail/fitness-mail.env`.

## Komponenten (zu bauen)

| Datei | Zweck |
|-------|-------|
| `~/bin/fitness-mail` | Python CLI (typer), IMAP + Parser + TW-Write |
| `~/.config/fitness-mail/fitness-mail.env` | Credentials + Schwellwerte |
| `fitness-mail.service` | oneshot systemd unit |
| `fitness-mail.timer` | 2-Minuten-Timer |

## Abhängigkeiten

- `imaplib` — stdlib IMAP (wie hotlist-mail)
- `tasklib` — Taskwarrior-Anbindung (core4warrior DB)
- `re` — Subject-Parsing
- `typer` / `loguru` — Projektstandard

## Referenz

- Basis-Pattern: `~/bin/hotlist-mail` (IMAP-Poller)
- TW-Integration: `~/aos-dev/python.lib/core4_stack.py` (dual-write Vorbild)
- Eingabe-Adresse: `nimmdaniel+fitness@gmail.com`

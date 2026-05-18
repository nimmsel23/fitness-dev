# Fitness Centre

Workout-Tracking PWA für Krafttraining — Pflichtaufgaben-Werkzeug der Diplom Präventiver Vitaltrainer Ausbildung (Fitnesstrainer-Modul, Health Personal Fitness Trainer, Prävention).

**Vollständige technische Dokumentation:** [CLAUDE.md](./CLAUDE.md)

---

## System

**fitness-agent** (Skill) — Katalog-Manager: liest Ausbildungsmodule, schreibt YAML-Katalog unter `~/fitness-dev/catalog/`, schreibt Tickets für fitness-dev-coding-agent.

**fitness-dev** (dieses Repo) — Backend + Frontend, gebaut von fitness-dev-coding-agent.

---

## Stack

| Schicht | Technologie | Port |
|---------|-------------|------|
| Backend | Node.js (`server.mjs`) | 9100 |
| Frontend | React + Vite | 5902 (dev) |
| Exercise DB | wger (lokal) | 8000 |
| Ergänzung | yuhonas free-exercise-db | — |

---

## Commands

```bash
npm run dev          # Backend (9100) + Vite DevServer (5902) mit HMR
npm run ui:dev       # Nur Vite DevServer
npm run build        # Production-Build → dist/
npm run build:catalog  # Katalog → ~/.aos/fitness/workouts/catalog.json
```

---

## Daten

```
~/.aos/fitness/
├── sessions/        YYYY-MM-DD.json — Session-Logs
├── journal/         YYYY-MM-DD.md — Text-Notizen
├── body/            YYYY-MM-DD.json — Körpermessungen
├── plan.json        Aktiver Trainingsplan
└── theme.json       UI-Präferenz
```

---

## Dokumentation

| Dokument | Inhalt |
|----------|--------|
| [CLAUDE.md](./CLAUDE.md) | API-Referenz, Katalog-Struktur, Session-Format, Design-Patterns |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technische Architektur, Datenquellen |
| [VISION.md](./VISION.md) | Richtung, Volume Landmarks, Anatomie Teaching Layer |
| [ROADMAP.md](./ROADMAP.md) | Feature-Roadmap |
| [AGENTS.md](./AGENTS.md) | Agent-Workflow |
| [UNKLARHEITEN.md](./UNKLARHEITEN.md) | Offene Design-Fragen |
| [FITNESS-MAIL-PIPELINE.md](./FITNESS-MAIL-PIPELINE.md) | Gmail-Pipeline-Spec |

---

## Status

- ✅ Backend + API
- ✅ Frontend Views (Dashboard, Session, Journal, Muscles, Learn, WeeklyReview)
- ✅ wger Integration (lokal)
- ✅ yuhonas Integration (Bilder, Varianten)
- ✅ Katalog-Struktur (Exercises, Anatomy Teaching, Rules, Maps)
- ✅ Gmail-Pipeline (`bin/fitness-mail`)
- ⏳ `fitness` CLI (Python/Typer)
- ⏳ Anatomie-Lehre für alle Übungen
- ⏳ PWA Offline-Unterstützung

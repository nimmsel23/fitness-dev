#!/usr/bin/env bash
# PreCompact hook — fitness-dev, repo-lokal (registriert in
# .claude/settings.json, NICHT in ~/.claude/settings.json). Zweck: ein
# Handoff-Mechanismus, damit ein ANDERER Agent (neue Session, nach einem
# Compact) nahtlos weiterarbeiten kann, ohne den wegkomprimierten Kontext
# zu brauchen. Modell: TODO.md sagt was zu tun ist -> Arbeit passiert ->
# RESULTS.md erklärt was tatsächlich gemacht wurde -> NEXT.md hält fest,
# was davon offen geblieben ist (baut auf RESULTS.md auf, kommt danach).
#
# Bewusst NICHT: ~/RESULTS.md, ~/NEXT.md, ~/TODO.md (globale, projekt-
# übergreifende Dateien — fasst dieser Hook nicht an).
#
# Autorisierung: User hat diesen Ansatz (headless claude -p mit
# --dangerously-skip-permissions, eng auf Read/Edit + drei feste Dateien
# beschränkt) 2026-08-31 explizit gewählt, nachdem der Auto-Mode-
# Classifier den ersten Versuch ohne diese Rückfrage blockiert hatte.
set -euo pipefail

REPO="/home/alpha/fitness-dev"
LOCK="$REPO/.claude/hooks/.fill-docs.lock"

input="$(cat)"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null || true)"

[ -n "$transcript" ] && [ -f "$transcript" ] || exit 0
command -v claude >/dev/null 2>&1 || exit 0

# Mehrere Claude-Sessions laufen an diesem Repo praktisch immer parallel
# (siehe docs/CLAUDE.md) — ohne Lock würden zwei gleichzeitige Compacts
# denselben RESULTS.md/TODO.md/NEXT.md-Kopf gegeneinander überschreiben.
# Non-blocking: lieber ein Compact ohne Doc-Update als eine hängende
# Session.
exec 9>"$LOCK"
flock -n 9 || exit 0

cd "$REPO"

# Nichts zu dokumentieren, wenn weder das Arbeitsverzeichnis dirty ist noch
# kürzlich (letzte 2h) etwas committet wurde — vermeidet leere/erfundene
# Einträge bei reinen Rechercheseinen ohne Code-/Doku-Änderung.
dirty="$(git status --porcelain 2>/dev/null || true)"
recent_commit="$(git log -1 --since="2 hours ago" --format=%H 2>/dev/null || true)"
[ -n "$dirty" ] || [ -n "$recent_commit" ] || exit 0

claude -p "Lies das vollständige Transcript dieser Claude-Code-Session: $transcript
(JSONL-Format, ein Eintrag pro Zeile).

Kontext/Zweck: RESULTS.md, TODO.md und NEXT.md in $REPO sind der Handoff
zwischen Sessions — ein anderer Agent soll nach einem Compact allein
daraus weiterarbeiten können, ohne dieses Transcript gesehen zu haben.
Denkmodell: TODO.md sagt was insgesamt zu tun ist -> hier ist Arbeit
passiert -> RESULTS.md erklärt was davon tatsächlich gemacht wurde ->
NEXT.md hält danach fest, was offen geblieben ist. Bearbeite die drei
Dateien in GENAU dieser Reihenfolge:

1. RESULTS.md: Füge GANZ OBEN (vor der ersten bestehenden '# '-Überschrift)
   einen neuen Eintrag ein, im exakt selben Format wie die bestehenden
   Einträge (# Titel (Datum), kurzer Prolog-Absatz, danach eine
   Bullet-Liste mit **Datei/Komponente**-Fettung für die konkreten
   Änderungen, danach eine '---'-Trennzeile). Fasse zusammen was
   TATSÄCHLICH an Code/Doku/System geändert wurde — nicht was diskutiert,
   sondern was umgesetzt wurde. Heutiges Datum. Gibt es schon einen
   Eintrag zum selben Thema mit selbem Datum (z.B. weil eine parallele
   Session das schon geschrieben hat) — nicht doppeln, überspringen.

2. TODO.md: NUR ergänzen, wenn im Transcript ein echter neuer Makro-Punkt
   auftaucht (grundlegend neues Vorhaben/Feature-Idee, keine Detail-
   Aufgabe, keine bloße Bugfix-Randnotiz) — im bestehenden Stil
   ('# [ ] Titel' + kurze Beschreibung). Im Zweifel NICHTS ändern, das ist
   kuratierter User-Content, kein Auto-Log.

3. NEXT.md: erst NACHDEM RESULTS.md geschrieben ist, daraus ableiten was
   aus dieser Session offen/unfertig geblieben ist (explizit genannte
   offene Punkte, vertagte Entscheidungen, bekannte Lücken) und als
   Bullet(s) im bestehenden Stil der Datei ergänzen. Erledigte, bereits in
   RESULTS.md abgeschlossene Punkte NICHT hier duplizieren.

Regeln: Nur diese drei Dateien in $REPO anfassen (RESULTS.md, TODO.md,
NEXT.md), sonst nichts. Kein git add/commit. Keine Rückfragen — triff die
Entscheidung selbst, im Zweifel weniger/vorsichtiger schreiben statt mehr.
Gib am Ende nur eine einzige Zeile 'done' aus, keine weitere Erklärung." \
  --allowedTools "Read,Edit" \
  --dangerously-skip-permissions \
  >/dev/null 2>&1 || true

exit 0

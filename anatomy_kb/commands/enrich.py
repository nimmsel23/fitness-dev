"""enrich command — Ursprung & Ansatz via Gemini generieren (muscle_anatomy only)."""
import sys
from pathlib import Path

import yaml
import typer
from rich.panel import Panel
from rich.rule import Rule

from anatomy_kb.commands._helpers import (
    EXERCISES_DIR, console, load_exercise, _gum_log,
)
from anatomy_kb import gemini as _gemini
from anatomy_kb import display as _display

_load_gemini_env = _gemini.load_env
_extract_yaml_block = _gemini.extract_yaml_block
_ENRICH_PROMPT = _gemini.ENRICH_PROMPT


def command(
    exercise_id: str = typer.Argument(..., help="Exercise-ID (z.B. bench_press, pull_up)"),
    dry_run: bool = typer.Option(False, "--dry-run", "-n", help="Nur anzeigen, nicht schreiben"),
    force: bool = typer.Option(False, "--force", "-f", help="Auch wenn muscle_anatomy schon existiert"),
):
    """
    [bold]Ursprung & Ansatz via Gemini generieren[/bold]

    Ruft Gemini auf und generiert für jeden beteiligten Muskel:

    \b
    - Ursprung (Origo) — genaue Knochenstruktur
    - Ansatz (Insertio) — genaue Knochenstruktur
    - Innervation (Nerv + Segmente)
    - Funktion in dieser Übung

    Du musst die Ausgabe bestätigen bevor sie gespeichert wird —
    das Lesen ist der Lernschritt.

    \b
    Beispiele:
      anatomy-agent enrich bench_press
      anatomy-agent enrich pull_up --dry-run
      anatomy-agent enrich squat --force
    """
    api_key, model = _load_gemini_env()
    if not api_key:
        _gum_log("error", "GEMINI_API_KEY nicht gefunden in ~/.env/gemini.env")
        raise typer.Exit(1)

    ex = load_exercise(exercise_id)
    raw = ex.raw

    if raw.get("muscle_anatomy") and not force:
        _gum_log("warn", f"muscle_anatomy existiert bereits für {exercise_id} — nutze --force zum Überschreiben")
        raise typer.Exit(0)

    def _flatten_muscles(val) -> list[str]:
        if isinstance(val, list):
            return [str(v) for v in val]
        if isinstance(val, dict):
            result = []
            for v in val.values():
                result.extend(_flatten_muscles(v))
            return result
        return [str(val)] if val else []

    roles = raw.get("muscle_roles", {})
    primary = _flatten_muscles(roles.get("primary", []))
    secondary = _flatten_muscles(roles.get("secondary", []))
    stabilizers = _flatten_muscles(roles.get("stabilizers", []))

    prompt = _ENRICH_PROMPT.format(
        name=ex.name,
        category=ex.category,
        movement_pattern=ex.movement_pattern,
        primary=", ".join(primary) or "—",
        secondary=", ".join(secondary) or "—",
        stabilizers=", ".join(stabilizers) or "—",
    )

    console.print()
    console.print(Panel.fit(
        f"[bold white]{ex.name}[/bold white]\n[dim]Gemini [{model}] generiert Ursprung & Ansatz...[/dim]",
        title="[cyan]anatomy enrich[/cyan]",
        border_style="cyan",
    ))
    console.print()

    with console.status("[dim]Gemini antwortet...[/dim]"):
        try:
            response_text = _gemini.call_with_fallback(
                prompt, api_key, model,
                on_fallback=lambda m: _gum_log("warn", f"Fallback auf {m}"),
            )
        except Exception as e:
            _gum_log("error", f"Gemini-Fehler: {type(e).__name__}: {str(e)[:120]}")
            raise typer.Exit(1)

    if response_text is None:
        _gum_log("error", "Alle Gemini-Modelle nicht verfügbar — später nochmal versuchen")
        raise typer.Exit(1)

    yaml_str = _extract_yaml_block(response_text)

    try:
        parsed = yaml.safe_load(yaml_str)
    except yaml.YAMLError as e:
        _gum_log("error", f"YAML-Parse-Fehler: {e}")
        console.print(Panel(yaml_str, title="Rohantwort", border_style="red"))
        raise typer.Exit(1)

    muscle_anatomy = parsed.get("muscle_anatomy", {}) if isinstance(parsed, dict) else {}
    if not muscle_anatomy:
        _gum_log("error", "Kein muscle_anatomy-Block in der Antwort")
        console.print(Panel(yaml_str, title="Rohantwort", border_style="red"))
        raise typer.Exit(1)

    _display.show_muscle_anatomy(muscle_anatomy)

    if dry_run:
        console.print("[dim]  dry-run: nichts gespeichert.[/dim]")
        return

    console.print(Rule(style="dim"))
    confirmed = typer.confirm(
        f"  muscle_anatomy für [{exercise_id}] speichern?",
        default=False,
    )
    if not confirmed:
        console.print("[dim]  Abgebrochen — nichts gespeichert.[/dim]")
        raise typer.Exit(0)

    yml_file = EXERCISES_DIR / f"{exercise_id}.yml"
    if not yml_file.exists():
        _gum_log("error", f"YAML-Datei nicht gefunden: {yml_file}")
        raise typer.Exit(1)

    _display.save_to_yaml(yml_file, muscle_anatomy, {}, [])
    _gum_log("info", f"muscle_anatomy gespeichert → {yml_file.name}")

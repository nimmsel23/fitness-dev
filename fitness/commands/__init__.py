"""fitness.commands — Typer- und Textual-Entry-Points."""
import re as _re

_CANONICAL = {"chest", "back", "shoulders", "arms", "core", "glutes", "quads", "hamstrings", "calves"}

_LABELS_DE = {
    "chest": "Brust", "back": "Rücken", "shoulders": "Schultern", "arms": "Arme",
    "core": "Bauch", "glutes": "Gesäß", "quads": "Beinstrecker",
    "hamstrings": "Beinbeuger", "calves": "Waden",
}


def muscle_to_group(name: str) -> str | None:
    """Numerische Slug oder Gruppenname → kanonische Gruppe."""
    if not name:
        return None
    key = name.lower().strip().replace(" ", "_")
    if key in _CANONICAL:
        return key
    m = _re.match(r'^(\d+)', key)
    if m:
        n = int(m.group(1))
        if 100 <= n < 200: return "chest"
        if 200 <= n < 300: return "back"
        if 300 <= n < 400: return "shoulders"
        if 400 <= n < 500: return "arms"
        if 500 <= n < 600: return "core"
        if 600 <= n < 700: return "glutes" if n <= 602 else ("quads" if n == 603 else "hamstrings")
        if 700 <= n < 800: return "calves"
    return None


def muscle_group_label(group: str, lang: str = "de") -> str:
    if lang == "de":
        return _LABELS_DE.get(group, group.capitalize())
    return group.capitalize()

from __future__ import annotations

import json
import os
import subprocess
import urllib.request
from pathlib import Path

from loguru import logger

from fitness.catalog.coverage import load_muscle_taxonomy

import re

PROMPT_EXERCISE_NEW = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new, unknown exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
Use German for coaching_notes.

CRITICAL: "german" and "english" are BOTH MANDATORY, independent fields - not
one primary name with the other as an afterthought/alias. Fill both with the
real, commonly-used name in that language (not a literal translation if a
different term is actually used by lifters in that language). "display_name"
mirrors "german" by convention (UI default), but "english" MUST still be
filled with the correct, distinct English term - this is what prevents
search from wrongly matching an unrelated exercise when a user searches in
English (e.g. "Jefferson Curl" must never resolve to "Barbell Curl" just
because no proper English field existed to disambiguate against).

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

CRITICAL: When the exercise's angle/mechanics clearly emphasize one specific
head/part of a muscle (e.g. incline press -> clavicular/upper pec head,
decline press -> sternal/lower pec head), you MUST use that specific child
muscle ID (e.g. "102_pectoralis_major_clavicular") instead of the generic
parent ID (e.g. "101_pectoralis_major"). The taxonomy automatically rolls
child scores up to their parent for coarse views, so being specific here
never loses information - it only adds precision. Only use the parent ID
when no single part is emphasized more than the others.

{{
  "exercise_id": "{safe_name}",
  "id": "{safe_name}",
  "name": "{exercise_name}",
  "display_name": "German Name",
  "german": "German Name",
  "english": "English Name",
  "category": "chest|back|shoulders|arms|core|legs|cardio",
  "type": "compound|isolation",
  "movement_pattern": "e.g. horizontal_press, vertical_pull",
  "equipment": ["dumbbell", "barbell", "machine", "bodyweight", "cable"],
  "primary_muscles": ["muscle_id"],
  "secondary_muscles": ["muscle_id"],
  "stabilizers": ["muscle_id"],
  "coaching_notes": ["Hinweis 1", "Hinweis 2"],
  "common_errors": ["Fehler 1"],
  "tags": ["tag1"],
  "aliases": []
}}
"""

PROMPT_EXERCISE_ENRICH = """
You are an expert fitness coach and biomechanics expert.
I have a basic exercise entry from a bulk import that needs professional "Expert Tier" enrichment.

CRITICAL: "german" and "english" are BOTH MANDATORY, independent fields - not
one primary name with the other as an afterthought/alias. Fill both with the
real, commonly-used name in that language (not a literal translation if a
different term is actually used by lifters in that language). "display_name"
mirrors "german" by convention (UI default), but "english" MUST still be
filled with the correct, distinct English term - this is what prevents
search from wrongly matching an unrelated exercise when a user searches in
English.

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

CRITICAL: When the exercise's angle/mechanics clearly emphasize one specific
head/part of a muscle (e.g. incline press -> clavicular/upper pec head,
decline press -> sternal/lower pec head), you MUST use that specific child
muscle ID (e.g. "102_pectoralis_major_clavicular") instead of the generic
parent ID (e.g. "101_pectoralis_major"). The taxonomy automatically rolls
child scores up to their parent for coarse views, so being specific here
never loses information - it only adds precision. Only use the parent ID
when no single part is emphasized more than the others.

Existing Data (Wiki Layer):
{existing_json}
{feedback_section}
Your task:
1. Keep the exercise_id and wger_id.
2. Verify and refine the category and muscles.
3. Generate HIGH-QUALITY coaching_notes and common_errors in GERMAN.
4. Ensure the biomechanical movement_pattern is correct.
{feedback_instruction}

IMPORTANT: "coaching_notes" and "common_errors" MUST be a flat JSON array of
strings (e.g. ["Hinweis 1", "Hinweis 2"]). NEVER nest them under a language
key like {{"de": [...]}} — the German text goes directly into the array items.

Return a JSON object with the full enriched structure. Do not include markdown formatting like ```json.
"""

PROMPT_FEEDBACK_SECTION = """
Coach Feedback zum vorherigen Entwurf (WICHTIG, unbedingt beachten):
"{feedback}"
"""

PROMPT_FEEDBACK_INSTRUCTION = (
    "5. Berücksichtige das Coach-Feedback oben zwingend — insbesondere kritisierte "
    "Formulierungen/Wortwahl NICHT wiederverwenden, sondern durch praezise, "
    "fachlich korrekte Alternativen ersetzen."
)

PROMPT_ALIASES = """
You are a fitness terminology expert.
Suggest 3-8 common aliases (German and English) for this exercise.
Exercise: {name}
Category: {category}, Type: {type}
Return ONLY a JSON array of lowercase strings. No markdown, no explanation.
Example: ["seitheben", "lateral raise", "side raise"]
"""


def _unquote(v: str) -> str:
    # .env-Werte (Datei ODER bereits exportierte Shell-Umgebung) landen hier
    # teils mit umschließenden Anführungszeichen ("...") — die gehören nicht
    # zum Wert selbst, sonst schickt man sie als Teil des API-Keys mit
    # (→ Gemini: "API key not valid").
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
        v = v[1:-1]
    return v


def load_gemini_key() -> str | None:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return _unquote(key)
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY":
                    return _unquote(v)
    return None


def _call(prompt: str, api_key: str, timeout: int = 30) -> str | None:
    # gemini-2.0-flash hat auf dem konfigurierten API-Key Kontingent 0
    # (RESOURCE_EXHAUSTED, nicht freigeschaltet) — gemini-2.5-flash ist das
    # laut AlphaOS-Konvention (~/.env/gemini.env: GEMINI_MODEL) eigentlich
    # vorgesehene Modell und funktioniert mit demselben Key.
    model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None


_LIST_FIELDS_MAY_NEST_BY_LANG = ("coaching_notes", "common_errors", "cues", "feel_cues", "variations")


def normalize_enriched_fields(data: dict) -> dict:
    """Modelle (Gemini wie Haiku) liefern coaching_notes/common_errors manchmal
    als {"de": [...]} statt als flache Liste, trotz expliziter Anweisung im
    Prompt — flacht das defensiv ab, statt kaputte "de"-Einzeltexte in die
    KB zu schreiben (sichtbar z.B. als "• de" in der TUI-Anzeige).
    """
    for field in _LIST_FIELDS_MAY_NEST_BY_LANG:
        val = data.get(field)
        if isinstance(val, dict):
            flat = val.get("de") or val.get("en") or next(iter(val.values()), None)
            data[field] = flat if isinstance(flat, list) else ([] if flat is None else [str(flat)])
    return data


def _call_haiku_cli(prompt: str, timeout: int = 90) -> str | None:
    """Wie _call(), aber via `claude -p --model haiku` statt Gemini-HTTP-API.
    Nutzt denselben Prompt-Text 1:1 - Fallback fuer Gemini-Ausfaelle (429/
    Kontingent), nicht der primaere Pfad."""
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "haiku", "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        return result.stdout.strip() or None
    except Exception as e:
        logger.warning(f"Haiku-CLI-Fallback fehlgeschlagen: {e}")
        return None


def call_gemini(
    exercise_name: str,
    safe_name: str,
    api_key: str,
    existing_data: dict | None = None,
    feedback: str | None = None,
) -> dict | None:
    taxonomy = load_muscle_taxonomy()
    muscle_list = ", ".join(k for k in sorted(taxonomy.keys()) if not re.match(r'^\d00_', k))

    if existing_data:
        prompt = PROMPT_EXERCISE_ENRICH.format(
            existing_json=json.dumps(existing_data, indent=2),
            muscle_list=muscle_list,
            feedback_section=PROMPT_FEEDBACK_SECTION.format(feedback=feedback) if feedback else "",
            feedback_instruction=PROMPT_FEEDBACK_INSTRUCTION if feedback else "",
        )
    else:
        prompt = PROMPT_EXERCISE_NEW.format(
            exercise_name=exercise_name,
            safe_name=safe_name,
            muscle_list=muscle_list,
        )

    text = _call(prompt, api_key)
    if not text:
        # Gemini-Fehler (inkl. HTTP 429 Rate-Limit) - best-effort Fallback auf
        # Claude Haiku via CLI, gleicher Prompt. Verhindert dass ein Batch-Lauf
        # komplett stoppt, nur weil das Gemini-Kontingent kurzzeitig erschoepft ist.
        logger.warning("Gemini-Call fehlgeschlagen, versuche Haiku-Fallback...")
        text = _call_haiku_cli(prompt)
        if not text:
            return None
    try:
        parsed = json.loads(text.replace("```json", "").replace("```", "").strip())
        return normalize_enriched_fields(parsed)
    except Exception as e:
        logger.error(f"Gemini response parse failed: {e}")
        return None


def suggest_aliases(ex: dict, api_key: str) -> list[str] | None:
    prompt = PROMPT_ALIASES.format(
        name=ex.get("german") or ex.get("name") or ex.get("exercise_id", ""),
        category=ex.get("category", ""),
        type=ex.get("type", ""),
    )
    text = _call(prompt, api_key, timeout=15)
    if not text:
        return None
    try:
        return json.loads(text.strip())
    except Exception:
        return None


def _cli_prompt(prompt: str, cmd: list[str]) -> list[str] | None:
    try:
        result = subprocess.run(
            cmd,
            input=prompt,
            capture_output=True,
            text=True,
            timeout=30,
        )
        text = result.stdout.strip()
        start, end = text.find("["), text.rfind("]")
        if start != -1 and end != -1:
            return json.loads(text[start:end + 1])
    except Exception as e:
        logger.warning(f"{cmd[0]} fallback failed: {e}")
    return None


PROMPT_HAIKU_REVIEW = """
Du bist ein zweiter, unabhaengiger Reviewer fuer einen KI-generierten Fitness-Uebungs-Eintrag.
Ein anderes Modell (Gemini) hat gerade folgenden Entwurf erzeugt:

{enriched_json}
{feedback_section}
Pruefe streng:
1. Wurde jegliches Coach-Feedback oben WIRKLICH vollstaendig umgesetzt (keine kritisierten Woerter/Formulierungen mehr enthalten)?
2. Sind coaching_notes/common_errors frei von Redundanz und fachlich praezise?
3. Sind primary_muscles/secondary_muscles/stabilizers plausibel fuer diese Uebung?

Gib das KOMPLETTE, ggf. korrigierte JSON-Objekt zurueck (gleiche Struktur wie oben).
"coaching_notes" und "common_errors" MUESSEN dabei flache JSON-Arrays aus Strings
bleiben/werden — NIEMALS unter einem Sprachschluessel wie {{"de": [...]}} verschachteln.
Falls alles bereits korrekt ist, gib es unveraendert zurueck.
Antworte NUR mit dem JSON-Objekt, keine Erklaerung, kein Markdown.
"""


def review_with_haiku(enriched_data: dict, feedback: str | None = None, timeout: int = 90) -> dict | None:
    """Best-effort zweite Meinung durch ein anderes Modell (Claude Haiku via
    `claude -p`), bevor ein Gemini-Draft gespeichert wird. Rein additiv: bei
    jedem Fehler (CLI fehlt, Timeout, kein valides JSON) wird None
    zurueckgegeben — der Aufrufer faellt dann auf den reinen Gemini-Output
    zurueck, nichts bricht.
    """
    prompt = PROMPT_HAIKU_REVIEW.format(
        enriched_json=json.dumps(enriched_data, indent=2, ensure_ascii=False),
        feedback_section=(
            f'\nCoach-Feedback zum urspruenglichen Entwurf: "{feedback}"\n' if feedback else ""
        ),
    )
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", "haiku", "--output-format", "text"],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        text = result.stdout.strip()
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end == -1:
            logger.warning("Haiku-Review: keine JSON-Antwort erhalten, behalte Gemini-Output")
            return None
        return normalize_enriched_fields(json.loads(text[start:end + 1]))
    except Exception as e:
        logger.warning(f"Haiku-Review fehlgeschlagen ({e}), behalte Gemini-Output")
        return None


def suggest_aliases_cli(ex: dict) -> list[str] | None:
    prompt = (
        PROMPT_ALIASES.format(
            name=ex.get("german") or ex.get("name") or ex.get("exercise_id", ""),
            category=ex.get("category", ""),
            type=ex.get("type", ""),
        )
        + "\nReturn ONLY the JSON array, nothing else."
    )
    for cmd in [
        ["codex", "exec", prompt],
        ["claude", "-p", prompt, "--output-format", "text"],
    ]:
        result = _cli_prompt(prompt, cmd)
        if result:
            return result
    return None

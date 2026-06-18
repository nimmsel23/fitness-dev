from __future__ import annotations

import json
import os
import subprocess
import urllib.request
from pathlib import Path

from loguru import logger

from .coverage import load_muscle_taxonomy

import re

PROMPT_EXERCISE_NEW = """
You are an expert fitness coach and biomechanics expert.
A user has logged a new, unknown exercise: "{exercise_name}"

Return a JSON object with the following structure exactly. Do not include markdown formatting like ```json.
Use German for display_name and coaching_notes.

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

{{
  "exercise_id": "{safe_name}",
  "id": "{safe_name}",
  "name": "{exercise_name}",
  "display_name": "German Name",
  "german": "German Name",
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

CRITICAL: You MUST only use the following muscle IDs for primary_muscles, secondary_muscles, and stabilizers:
{muscle_list}

Existing Data (Wiki Layer):
{existing_json}

Your task:
1. Keep the exercise_id and wger_id.
2. Verify and refine the category and muscles.
3. Generate HIGH-QUALITY coaching_notes and common_errors in GERMAN.
4. Ensure the biomechanical movement_pattern is correct.

Return a JSON object with the full enriched structure. Do not include markdown formatting like ```json.
"""

PROMPT_ALIASES = """
You are a fitness terminology expert.
Suggest 3-8 common aliases (German and English) for this exercise.
Exercise: {name}
Category: {category}, Type: {type}
Return ONLY a JSON array of lowercase strings. No markdown, no explanation.
Example: ["seitheben", "lateral raise", "side raise"]
"""


def load_gemini_key() -> str | None:
    key = os.environ.get("GEMINI_API_KEY")
    if key:
        return key
    env_path = Path.home() / ".env" / "fitness.env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                if k.strip() == "GEMINI_API_KEY":
                    return v.strip()
    return None


def _call(prompt: str, api_key: str, timeout: int = 30) -> str | None:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
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


def call_gemini(exercise_name: str, safe_name: str, api_key: str, existing_data: dict | None = None) -> dict | None:
    taxonomy = load_muscle_taxonomy()
    muscle_list = ", ".join(k for k in sorted(taxonomy.keys()) if not re.match(r'^\d00_', k))

    if existing_data:
        prompt = PROMPT_EXERCISE_ENRICH.format(
            existing_json=json.dumps(existing_data, indent=2),
            muscle_list=muscle_list,
        )
    else:
        prompt = PROMPT_EXERCISE_NEW.format(
            exercise_name=exercise_name,
            safe_name=safe_name,
            muscle_list=muscle_list,
        )

    text = _call(prompt, api_key)
    if not text:
        return None
    try:
        return json.loads(text.replace("```json", "").replace("```", "").strip())
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

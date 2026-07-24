from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any
import urllib.request
import yaml
from tqdm import tqdm

from loguru import logger
from fitness.catalog.core.rich_utils import console
from fitness.catalog.core.loader import DATA_DIR, load_catalog_yaml
from fitness.catalog.core.resolver import build_exercise_index, resolve_query, normalize_text
from fitness.catalog.coverage import normalize_muscle_id, load_muscle_taxonomy

WGER_API_BASE = "http://127.0.0.1:8000/api/v2"
WGER_TOKEN = "92d9ea44fc0ac065e336e9ec443a196c40c68afe"

WGER_CATEGORY_MAP = {
    10: "core", # Abs
    8: "arms",
    12: "back",
    14: "legs", # Calves
    15: "cardio",
    11: "chest",
    9: "legs",
    13: "shoulders",
}

# wger's own muscle taxonomy has a single deltoid entry (id 2, "Anterior deltoid")
# and no separate posterior/lateral deltoid ID. Every shoulder exercise - front
# raise or rear delt fly alike - gets tagged with id 2, so a plain wger_id lookup
# always resolves to 301_anterior_deltoid. Reclassify using name keywords instead.
DELTOID_REASSIGNMENT = [
    (re.compile(r"rear|reverse|posterior|face.?pull|external rotation|au(ss|ß)enrotation|"
                r"hintere schulter|rotator ?cuff|vorgebeugt", re.I), "303_posterior_deltoid"),
    (re.compile(r"lateral raise|side raise|seitheben|upright row", re.I), "302_lateral_deltoid"),
]


def reclassify_deltoid_muscles(muscle_ids: list[str], *name_variants: str) -> list[str]:
    if "301_anterior_deltoid" not in muscle_ids:
        return muscle_ids
    names = " ".join(n for n in name_variants if n)
    for pattern, replacement in DELTOID_REASSIGNMENT:
        if pattern.search(names):
            return [replacement if m == "301_anterior_deltoid" else m for m in muscle_ids]
    return muscle_ids

def fetch_json(url: str, headers: dict[str, str] | None = None) -> Any:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read().decode("utf-8"))

def import_external_exercises():
    logger.info("Starting bulk import from external sources...")

    existing_exercises = build_exercise_index()
    existing_ids = {ex.exercise_id for ex in existing_exercises}
    
    # Load taxonomy for wger_id mapping
    taxonomy = load_muscle_taxonomy()
    wger_id_to_norm = {}
    for norm_id, data in taxonomy.items():
        if isinstance(data, dict) and "wger_id" in data:
            wger_id_to_norm[int(data["wger_id"])] = norm_id

    def get_norm_muscles(wger_muscles: list[dict[str, Any]]) -> list[str]:
        res = []
        for m in wger_muscles:
            w_id = m.get("id")
            if w_id in wger_id_to_norm:
                res.append(wger_id_to_norm[w_id])
        return sorted(list(set(res)))

    # 1. Import from wger
    # Deaktiviert (User-Vorgabe 2026-07-24): wger bleibt vorerst lokal, kein
    # Bulk-Fetch mehr. unreviewed_wger.yml bleibt dadurch unverändert stehen -
    # alles was geloggt wird, geht stattdessen über yuhonas -> Inbox -> Expert.
    unreviewed_wger: list[dict] = []
    logger.info("wger-Import deaktiviert (User-Vorgabe) - kein Fetch gegen die lokale wger-API.")

    # 2. Import from yuhonas
    # yuhonas nutzt eine eigene, flache Muskel-Vokabel (17 Wörter: "chest",
    # "lats", "lower back", ...) - keine kanonischen taxonomy-IDs. muscle_index.yml
    # hat dafür bereits einen string_aliases-Block (genau diese 17 Wörter ->
    # kanonische Gruppen-ID, z.B. "biceps" -> "401_biceps_brachii"). Vorher wurde
    # hier nur normalize_muscle_id() (reines Slugify) genutzt und roh gespeichert
    # ("chest" statt "100_chest") - derselbe Fehlertyp wie body_rows.yml.
    raw_taxonomy_doc = load_catalog_yaml("muscles/muscle_index.yml") or {}
    string_aliases = raw_taxonomy_doc.get("string_aliases", {}) if isinstance(raw_taxonomy_doc, dict) else {}
    yuhonas_muscle_map = {normalize_muscle_id(k): v for k, v in string_aliases.items()}

    def resolve_yuhonas_muscle(name: str) -> str:
        slug = normalize_muscle_id(name)
        canonical = yuhonas_muscle_map.get(slug)
        if not canonical:
            logger.warning(f"yuhonas: unbekannter Muskel-Alias '{name}' (slug={slug}), roh übernommen.")
            return slug
        return canonical

    unreviewed_yuhonas = []
    yuhonas_path = Path.home() / "fitness/free-exercise-db/dist/exercises.json"
    if yuhonas_path.exists():
        logger.info("Importing from yuhonas free-exercise-db...")
        try:
            with yuhonas_path.open("r", encoding="utf-8") as f:
                data = json.load(f)

            for item in tqdm(data, desc="yuhonas import", unit="ex"):
                display_name = item.get("name")
                if not display_name:
                    continue

                res = resolve_query(display_name)
                if res.matched and res.confidence == "high":
                    continue

                safe_id = f"yuhonas_{item.get('id').lower().replace(' ', '_')}"

                primary = sorted(set(resolve_yuhonas_muscle(m) for m in item.get("primaryMuscles", [])))
                secondary = sorted(set(resolve_yuhonas_muscle(m) for m in item.get("secondaryMuscles", [])))

                wger_primary = []
                for m in primary:
                    m_data = taxonomy.get(m)
                    if m_data and "wger_id" in m_data:
                        wger_primary.append(int(m_data["wger_id"]))

                wger_secondary = []
                for m in secondary:
                    m_data = taxonomy.get(m)
                    if m_data and "wger_id" in m_data:
                        wger_secondary.append(int(m_data["wger_id"]))

                ex = {
                    "exercise_id": safe_id,
                    "display_name": display_name,
                    "category": item.get("category", "other"),
                    "primary_muscles": primary,
                    "secondary_muscles": secondary,
                    "equipment": [item.get("equipment")] if item.get("equipment") else [],
                    "coaching_notes": item.get("instructions", []),
                    "tags": ["unreviewed", "yuhonas"],
                    "yuhonas_id": item.get("id"),
                    "wger_muscle_ids": {
                        "primary": sorted(list(set(wger_primary))),
                        "secondary": sorted(list(set(wger_secondary)))
                    }
                }
                unreviewed_yuhonas.append(ex)
            logger.info(f"Prepared {len(unreviewed_yuhonas)} unreviewed exercises from yuhonas.")
        except Exception as e:
            logger.error(f"yuhonas import failed: {e}")
    else:
        logger.info("yuhonas DB not found at ~/fitness/free-exercise-db/dist/exercises.json")

    # Save to catalog
    exercises_dir = DATA_DIR / "exercises"
    exercises_dir.mkdir(parents=True, exist_ok=True)
    
    if unreviewed_wger:
        target = exercises_dir / "unreviewed_wger.yml"
        wrapper = {
            "name": "unreviewed_wger",
            "description": "Bulk imported exercises from local wger API",
            "exercises": unreviewed_wger
        }
        with target.open("w", encoding="utf-8") as f:
            yaml.safe_dump(wrapper, f, allow_unicode=True, sort_keys=False)
        logger.info(f"Saved {len(unreviewed_wger)} exercises to {target}")

    if unreviewed_yuhonas:
        target = exercises_dir / "unreviewed_yuhonas.yml"
        wrapper = {
            "name": "unreviewed_yuhonas",
            "description": "Bulk imported exercises from yuhonas free-exercise-db",
            "exercises": unreviewed_yuhonas
        }
        with target.open("w", encoding="utf-8") as f:
            yaml.safe_dump(wrapper, f, allow_unicode=True, sort_keys=False)
        logger.info(f"Saved {len(unreviewed_yuhonas)} exercises to {target}")

if __name__ == "__main__":
    import_external_exercises()

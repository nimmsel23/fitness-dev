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
from catalog.core.rich_utils import console
from catalog.core.loader import DATA_DIR, load_catalog_yaml
from catalog.core.resolver import build_exercise_index, resolve_query, normalize_text
from catalog.coverage import normalize_muscle_id, load_muscle_taxonomy

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
    unreviewed_wger = []
    try:
        logger.info("Fetching exercises from local wger API in batches...")
        offset = 0
        limit = 100
        while True:
            url = f"{WGER_API_BASE}/exerciseinfo/?limit={limit}&offset={offset}"
            headers = {"Authorization": f"Token {WGER_TOKEN}", "Accept": "application/json"}
            data = fetch_json(url, headers)
            
            results = data.get("results", [])
            if not results:
                break
                
            for item in results:
                translations = item.get("translations", [])
                de = next((t for t in translations if t.get("language") == 1), None)
                en = next((t for t in translations if t.get("language") == 2), None)
                
                display_name = (de or en or {}).get("name", "")
                if not display_name:
                    continue
                    
                safe_id = f"wger_{item.get('id')}"
                
                res = resolve_query(display_name)
                if res.matched and res.confidence == "high":
                    continue
                
                primary = get_norm_muscles(item.get("muscles", []))
                secondary = get_norm_muscles(item.get("muscles_secondary", []))
                
                category_id = item.get("category", {}).get("id")
                category = WGER_CATEGORY_MAP.get(category_id, "other")
                
                description = (de or en or {}).get("description", "")
                clean_desc = re.sub('<[^<]+?>', '', description).strip()
                
                ex = {
                    "exercise_id": safe_id,
                    "display_name": display_name,
                    "german": de.get("name") if de else display_name,
                    "category": category,
                    "primary_muscles": primary,
                    "secondary_muscles": secondary,
                    "equipment": [e.get("name").lower() for e in item.get("equipment", [])],
                    "coaching_notes": [clean_desc] if clean_desc else [],
                    "tags": ["unreviewed", "wger"],
                    "wger_id": item.get("id"),
                    "wger_muscle_ids": {
                        "primary": [m.get("id") for m in item.get("muscles", [])],
                        "secondary": [m.get("id") for m in item.get("muscles_secondary", [])]
                    }
                }
                unreviewed_wger.append(ex)
            
            logger.info(f"Processed {offset + len(results)}/{data.get('count', '?')} wger exercises...")
            offset += limit
            if offset >= data.get("count", 0):
                break
                
        logger.info(f"Prepared {len(unreviewed_wger)} unreviewed exercises from wger.")
    except Exception as e:
        logger.error(f"wger import failed: {e}")

    # 2. Import from yuhonas
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
                
                primary = [normalize_muscle_id(m) for m in item.get("primaryMuscles", [])]
                secondary = [normalize_muscle_id(m) for m in item.get("secondaryMuscles", [])]
                
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

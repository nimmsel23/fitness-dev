from __future__ import annotations

import tempfile
import unittest
from pathlib import Path
from unittest import mock

import yaml

from fitness.catalog.agent.inbox_actions import approve_inbox_entry


class InboxActionsTest(unittest.TestCase):
    def test_approve_preserves_wger_source_ref_from_filename(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inbox = root / "inbox"
            exercises = root / "exercises"
            inbox.mkdir()
            exercises.mkdir()
            draft = inbox / "inbox_wger_1570.yml"
            draft.write_text("name: inbox_wger_1570\nexercises: []\n", encoding="utf-8")
            ex = {
                "exercise_id": "lateral_raise_machine",
                "display_name": "Seitheben an der Maschine",
                "primary_muscles": ["302_lateral_deltoid"],
            }

            with mock.patch("fitness.catalog.agent.inbox_actions.exercises_dir", return_value=exercises):
                approved_id = approve_inbox_entry(draft, ex)

            self.assertEqual(approved_id, "lateral_raise_machine")
            self.assertFalse(draft.exists())
            doc = yaml.safe_load((exercises / "lateral_raise_machine.yml").read_text(encoding="utf-8"))
            approved = doc["exercises"][0]
            self.assertEqual(approved["source"], "expert")
            self.assertEqual(approved["wger_id"], 1570)
            self.assertEqual(approved["external_ids"]["wger"], [1570])
            self.assertIn("wger_1570", approved["search_aliases"])

    def test_approve_preserves_yuhonas_source_ref(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            inbox = root / "inbox"
            exercises = root / "exercises"
            inbox.mkdir()
            exercises.mkdir()
            draft = inbox / "inbox_yuhonas_pullups.yml"
            draft.write_text("name: inbox_yuhonas_pullups\nexercises: []\n", encoding="utf-8")
            ex = {
                "exercise_id": "020",
                "display_name": "Klimmzug im Obergriff",
                "yuhonas_id": "Pullups",
                "primary_muscles": ["201_latissimus_dorsi"],
            }

            with mock.patch("fitness.catalog.agent.inbox_actions.exercises_dir", return_value=exercises):
                approve_inbox_entry(draft, ex)

            doc = yaml.safe_load((exercises / "020.yml").read_text(encoding="utf-8"))
            approved = doc["exercises"][0]
            self.assertEqual(approved["external_ids"]["yuhonas"], ["Pullups"])
            self.assertIn("yuhonas_pullups", approved["search_aliases"])
            self.assertIn("Pullups", approved["search_aliases"])


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import unittest
from types import SimpleNamespace
from unittest import mock

from fitness.catalog.core.inbox_pipeline import build_inbox_draft_seed


class InboxPipelineTest(unittest.TestCase):
    def test_reenrich_restart_ignores_stale_ai_payload_fields(self) -> None:
        external_seed = {
            "exercise_id": "sit_ups",
            "id": "sit_ups",
            "display_name": "Sit-Ups",
            "german": "Sit-Ups",
            "english": "Sit-Ups",
            "category": "carry",
            "primary_muscles": ["501_rectus_abdominis"],
            "instructions": ["Original source instruction"],
            "images": ["situp.jpg"],
            "original_description": "Originalquelle",
            "wger_id": 591,
            "external_ids": {"wger": [591]},
        }
        stale_payload = {
            "exercise_id": "sit_ups",
            "id": "sit_ups",
            "display_name": "Sit-Ups",
            "category": "twist",
            "primary_muscles": ["999_fake"],
            "coaching_notes": ["Alter KI-Text"],
            "original_description": "Alter KI-Text",
            "wger_id": 123,
            "external_ids": {"wger": [123]},
        }

        with mock.patch("fitness.catalog.core.inbox_pipeline.build_external_seed", return_value=external_seed), \
             mock.patch("fitness.catalog.core.inbox_pipeline.build_exercise_index", return_value=[]), \
             mock.patch("fitness.catalog.core.inbox_pipeline.resolve_query") as resolve_query, \
             mock.patch("fitness.catalog.core.inbox_pipeline.find_by_id", return_value=None):
            resolve_query.return_value = SimpleNamespace(matched=False, canonical_id=None)
            seed = build_inbox_draft_seed("Sit-Ups", "sit_ups", stale_payload, restart=True)

        self.assertEqual(seed["wger_id"], 591)
        self.assertEqual(seed["external_ids"]["wger"], [591])
        self.assertEqual(seed["original_description"], "Originalquelle")
        self.assertEqual(seed["instructions"], ["Original source instruction"])
        self.assertEqual(seed["images"], ["situp.jpg"])
        self.assertEqual(seed["category"], "carry")
        self.assertEqual(seed["primary_muscles"], ["501_rectus_abdominis"])
        self.assertNotIn("coaching_notes", seed)

    def test_queue_overlay_can_keep_explicit_payload_fields(self) -> None:
        external_seed = {
            "exercise_id": "plank",
            "display_name": "Plank",
            "category": "carry",
            "primary_muscles": ["501_rectus_abdominis"],
        }
        payload = {
            "exercise_id": "plank",
            "display_name": "Unterarmstütz",
            "category": "twist",
            "coaching_notes": ["Coach note"],
        }

        with mock.patch("fitness.catalog.core.inbox_pipeline.build_external_seed", return_value=external_seed), \
             mock.patch("fitness.catalog.core.inbox_pipeline.build_exercise_index", return_value=[]), \
             mock.patch("fitness.catalog.core.inbox_pipeline.resolve_query") as resolve_query, \
             mock.patch("fitness.catalog.core.inbox_pipeline.find_by_id", return_value=None):
            resolve_query.return_value = SimpleNamespace(matched=False, canonical_id=None)
            seed = build_inbox_draft_seed("Unterarmstütz", "plank", payload, restart=False)

        self.assertEqual(seed["display_name"], "Unterarmstütz")
        self.assertEqual(seed["category"], "twist")
        self.assertEqual(seed["coaching_notes"], ["Coach note"])


if __name__ == "__main__":
    unittest.main()

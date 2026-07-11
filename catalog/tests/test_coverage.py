from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import yaml

from catalog.bootstrap import bootstrap
from catalog.coverage import calculate_coverage


class CoverageTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.home = Path(self.tempdir.name)
        self.patcher = mock.patch.dict(os.environ, {"HOME": str(self.home)}, clear=False)
        self.patcher.start()
        bootstrap()

    def tearDown(self) -> None:
        self.patcher.stop()
        self.tempdir.cleanup()

    def test_primary_muscle_score(self) -> None:
        result = calculate_coverage("incline_dumbbell_press", 3, 8)
        self.assertEqual(result["muscle_scores"]["chest"], 3.0)

    def test_secondary_muscle_score(self) -> None:
        result = calculate_coverage("incline_dumbbell_press", 3, 8)
        self.assertEqual(result["muscle_scores"]["shoulders"], 1.5)

    def test_stabilizer_muscle_score(self) -> None:
        result = calculate_coverage("incline_dumbbell_press", 3, 8)
        self.assertAlmostEqual(result["muscle_scores"]["core"], 0.6)

    def test_body_region_mapping(self) -> None:
        result = calculate_coverage("incline_dumbbell_press", 3, 8)
        self.assertAlmostEqual(result["body_region_scores"]["torso"], 3.6)
        self.assertEqual(result["body_region_scores"]["upper_body"], 1.5)

    def test_unmapped_muscle_handling(self) -> None:
        exercise_file = self.home / ".fitness-agent" / "exercises" / "mystery.yml"
        exercise_file.write_text(
            yaml.safe_dump(
                {
                    "name": "mystery",
                    "exercises": [
                        {
                            "exercise_id": "mystery_push",
                            "display_name": "Mystery Push",
                            "primary_muscles": ["mystery_muscle"],
                        }
                    ],
                },
                sort_keys=False,
                allow_unicode=True,
            ),
            encoding="utf-8",
        )
        result = calculate_coverage("mystery_push", 2, 8)
        self.assertEqual(result["muscle_scores"]["mystery_muscle"], 2.0)
        self.assertEqual(result["unmapped_muscles"], ["mystery_muscle"])

    def test_multiple_body_regions_from_bridge(self) -> None:
        bridge_file = self.home / ".fitness-agent" / "muscles" / "body_highlighter_bridge.yml"
        bridge_file.write_text(
            yaml.safe_dump(
                {
                    "bridge": {
                        "enabled": True,
                        "source": "local_yaml",
                        "muscle_to_region": {
                            "mystery_muscle": ["chest_front", "upper_arm_back"],
                        },
                    }
                },
                sort_keys=False,
                allow_unicode=True,
            ),
            encoding="utf-8",
        )
        exercise_file = self.home / ".fitness-agent" / "exercises" / "bridge_test.yml"
        exercise_file.write_text(
            yaml.safe_dump(
                {
                    "name": "bridge_test",
                    "exercises": [
                        {
                            "exercise_id": "bridge_push",
                            "display_name": "Bridge Push",
                            "primary_muscles": ["mystery_muscle"],
                        }
                    ],
                },
                sort_keys=False,
                allow_unicode=True,
            ),
            encoding="utf-8",
        )
        result = calculate_coverage("bridge_push", 2, 8)
        self.assertEqual(result["muscle_scores"]["mystery_muscle"], 2.0)
        self.assertEqual(result["body_region_scores"]["chest_front"], 2.0)
        self.assertEqual(result["body_region_scores"]["upper_arm_back"], 2.0)
        self.assertEqual(result["unmapped_muscles"], [])


if __name__ == "__main__":
    unittest.main()

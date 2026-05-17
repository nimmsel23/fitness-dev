from __future__ import annotations

import os
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from fitness_agent.bootstrap import bootstrap
from fitness_agent.resolver import resolve_query


class ResolverTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tempdir = tempfile.TemporaryDirectory()
        self.home = Path(self.tempdir.name)
        self.home.mkdir(parents=True, exist_ok=True)
        self.patcher = mock.patch.dict(os.environ, {"HOME": str(self.home)}, clear=False)
        self.patcher.start()
        bootstrap()

    def tearDown(self) -> None:
        self.patcher.stop()
        self.tempdir.cleanup()

    def test_exact_id_match(self) -> None:
        result = resolve_query("incline_dumbbell_press")
        self.assertTrue(result.matched)
        self.assertEqual(result.canonical_id, "incline_dumbbell_press")
        self.assertEqual(result.source, "canonical_id")
        self.assertEqual(result.confidence, "high")

    def test_alias_match(self) -> None:
        result = resolve_query("kh schrägbank")
        self.assertTrue(result.matched)
        self.assertEqual(result.canonical_id, "incline_dumbbell_press")
        self.assertEqual(result.source, "alias")
        self.assertEqual(result.confidence, "high")

    def test_german_name_match(self) -> None:
        result = resolve_query("Klimmzug im Obergriff")
        self.assertTrue(result.matched)
        self.assertEqual(result.canonical_id, "pull_up")
        self.assertEqual(result.source, "name")
        self.assertEqual(result.confidence, "high")

    def test_unknown_returns_suggestions(self) -> None:
        result = resolve_query("irgendwas unbekanntes")
        self.assertFalse(result.matched)
        self.assertEqual(result.canonical_id, None)
        self.assertGreater(len(result.suggestions), 0)


if __name__ == "__main__":
    unittest.main()

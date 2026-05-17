from __future__ import annotations

import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

from fitness_agent.cli import main
from fitness_agent.preview import preview_file, render_markdown


class PreviewTest(unittest.TestCase):
    def test_preview_helper_uses_glow_when_available(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            path = Path(tempdir) / "sample.md"
            path.write_text("# Sample\n", encoding="utf-8")

            with mock.patch("fitness_agent.preview.shutil.which", return_value="/usr/bin/glow"):
                with mock.patch("fitness_agent.preview.subprocess.run") as run_mock:
                    result = preview_file(path, require_tty=False)

            self.assertTrue(result.used_glow)
            run_mock.assert_called_once_with(["/usr/bin/glow", str(path)], check=False)

    def test_render_markdown_uses_glow_by_default_when_tty_is_available(self) -> None:
        markdown = "# Sample\n\nBody\n"

        with mock.patch("fitness_agent.preview.shutil.which", return_value="/usr/bin/glow"):
            with mock.patch("fitness_agent.preview.sys.stdin.isatty", return_value=True):
                with mock.patch("fitness_agent.preview.sys.stdout.isatty", return_value=True):
                    with mock.patch("fitness_agent.preview.subprocess.run") as run_mock:
                        result = render_markdown(markdown)

        self.assertTrue(result.used_glow)
        run_mock.assert_called_once()

    def test_preview_command_falls_back_to_stdout_when_glow_is_missing(self) -> None:
        with tempfile.TemporaryDirectory() as tempdir:
            path = Path(tempdir) / "sample.md"
            path.write_text("# Sample\n\nBody\n", encoding="utf-8")

            buffer = io.StringIO()
            with mock.patch("fitness_agent.preview.shutil.which", return_value=None):
                with redirect_stdout(buffer):
                    code = main(["preview", "--file", str(path)])

        self.assertEqual(code, 0)
        output = buffer.getvalue()
        self.assertIn("# Sample", output)
        self.assertIn("Body", output)


if __name__ == "__main__":
    unittest.main()

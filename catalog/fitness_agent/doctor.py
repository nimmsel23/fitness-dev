from __future__ import annotations

import os
import tempfile
from dataclasses import dataclass
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

from .paths import RUNTIME_SUBDIRS, SEED_FILE_MAP, runtime_root
from .yaml_utils import load_yaml


@dataclass
class DoctorLine:
    level: str
    message: str


@dataclass
class DoctorReport:
    lines: list[DoctorLine]

    @property
    def has_failures(self) -> bool:
        return any(line.level == "FAIL" for line in self.lines)

    @property
    def has_warnings(self) -> bool:
        return any(line.level == "WARN" for line in self.lines)


def run_doctor() -> DoctorReport:
    lines: list[DoctorLine] = []
    runtime = runtime_root()

    if runtime.exists():
        lines.append(ok(f"{runtime} exists"))
    else:
        lines.append(fail(f"{runtime} is missing"))
        return DoctorReport(lines)

    config_path = runtime / "config.yml"
    config = None
    if config_path.exists():
        try:
            config = load_yaml(config_path)
            lines.append(ok("config.yml parses"))
        except Exception as exc:
            lines.append(fail(f"config.yml parse failed: {exc}"))
    else:
        lines.append(fail("config.yml is missing"))

    for relative_path in SEED_FILE_MAP:
        if relative_path == "config.yml":
            continue
        file_path = runtime / relative_path
        if file_path.exists():
            try:
                load_yaml(file_path)
                lines.append(ok(f"{relative_path} exists and parses"))
            except Exception as exc:
                lines.append(fail(f"{relative_path} parse failed: {exc}"))
        else:
            lines.append(fail(f"{relative_path} is missing"))

    for relative_dir in RUNTIME_SUBDIRS:
        directory = runtime / relative_dir
        if directory.exists():
            lines.append(ok(f"{relative_dir} exists"))
        else:
            lines.append(fail(f"{relative_dir} is missing"))

    for relative_dir in ["agent-state", "exports"]:
        directory = runtime / relative_dir
        if directory.exists() and is_writable(directory):
            lines.append(ok(f"{relative_dir} is writable"))
        elif directory.exists():
            lines.append(fail(f"{relative_dir} is not writable"))

    if isinstance(config, dict):
        wger_section = config.get("wger", {})
        if isinstance(wger_section, dict) and wger_section.get("enabled"):
            base_url = str(wger_section.get("base_url", "")).strip()
            if base_url:
                reachable = check_wger_api(base_url)
                if reachable:
                    lines.append(ok("wger API reachable"))
                else:
                    lines.append(warn("wger API not reachable"))
            else:
                lines.append(warn("wger enabled but base_url is missing"))
        else:
            lines.append(warn("wger is disabled"))
    else:
        lines.append(warn("wger check skipped because config is invalid"))

    return DoctorReport(lines)


def is_writable(directory: Path) -> bool:
    try:
        with tempfile.NamedTemporaryFile("w", dir=directory, prefix=".doctor-write-probe-", delete=True) as handle:
            handle.write("ok")
            handle.flush()
        return True
    except OSError:
        return False


def check_wger_api(base_url: str) -> bool:
    try:
        with urlopen(base_url, timeout=3) as response:
            return 200 <= getattr(response, "status", response.getcode()) < 500
    except HTTPError as exc:
        return exc.code < 500
    except (URLError, OSError, ValueError):
        return False


def ok(message: str) -> DoctorLine:
    return DoctorLine("OK", message)


def warn(message: str) -> DoctorLine:
    return DoctorLine("WARN", message)


def fail(message: str) -> DoctorLine:
    return DoctorLine("FAIL", message)

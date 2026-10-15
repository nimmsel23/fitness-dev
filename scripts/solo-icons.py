#!/usr/bin/env python3
"""Erzeugt die App-Icons der Solo-Builds (vos-training, vos-atlas) nach solo-icons/<mode>/.

Quelle ist das SVG je Modus; PNGs werden mit rsvg-convert gerendert und eingecheckt, damit
der Build selbst kein rsvg braucht. Neu erzeugen: python3 scripts/solo-icons.py
Dateien je Modus: icon.svg (rund, "any"), icon-192/512.png, icon-maskable-512.png und
icon-180.png (vollflächig, ohne transparente Ecken — iOS rundet selbst).
"""
import subprocess
from pathlib import Path

BG = "#090b10"
ROOT = Path(__file__).resolve().parent.parent / "solo-icons"


def training(accent):
    # Langhantel + Tagesleiste (5 Tage, heute gefüllt) — spiegelt die kompakte Tagesleiste im Header
    plates = "".join(
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{accent}"/>'
        for x, y, w, h in [(118, 150, 34, 120), (160, 170, 26, 80), (326, 170, 26, 80), (360, 150, 34, 120)]
    )
    bar = f'<rect x="186" y="198" width="140" height="24" rx="6" fill="{accent}"/>'
    dots = "".join(
        f'<circle cx="{x}" cy="352" r="10" fill="{accent}" opacity="0.45"/>' for x in (156, 206, 306, 356)
    ) + f'<circle cx="256" cy="352" r="21" fill="{accent}"/>'
    return plates + bar + dots


def atlas(accent):
    # 3×3-Kachelraster (Atlas = Übersicht), Mitte voll, Ecken halb, Kanten schwach
    out = []
    size, gap, start = 84, 16, 114
    for row in range(3):
        for col in range(3):
            x, y = start + col * (size + gap), start + row * (size + gap)
            if row == 1 and col == 1:
                opacity = 1.0
            elif row != 1 and col != 1:
                opacity = 0.5
            else:
                opacity = 0.22
            out.append(f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="18" fill="{accent}" opacity="{opacity}"/>')
    return "".join(out)


APPS = {"training": (training, "#e8a020"), "atlas": (atlas, "#35c2c8")}


def svg(body, rounded):
    rx = 120 if rounded else 0
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">'
            f'<rect width="512" height="512" rx="{rx}" fill="{BG}"/>{body}</svg>\n')


def render(src, dst, size):
    subprocess.run(["rsvg-convert", "-w", str(size), "-h", str(size), "-o", str(dst), str(src)], check=True)


for name, (draw, accent) in APPS.items():
    d = ROOT / name
    d.mkdir(parents=True, exist_ok=True)
    body = draw(accent)
    (d / "icon.svg").write_text(svg(body, True))
    square = d / "_square.svg"
    square.write_text(svg(body, False))
    render(d / "icon.svg", d / "icon-192.png", 192)
    render(d / "icon.svg", d / "icon-512.png", 512)
    render(square, d / "icon-maskable-512.png", 512)
    render(square, d / "icon-180.png", 180)
    square.unlink()
    print("ok", name)

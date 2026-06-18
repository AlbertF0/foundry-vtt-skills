#!/usr/bin/env python3
"""Composite a character portrait into a transparent round token frame."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageFilter


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--portrait", required=True, help="Input character portrait image")
    parser.add_argument("--frame", required=True, help="Transparent PNG token frame")
    parser.add_argument("--out", required=True, help="Output PNG path")
    parser.add_argument("--scale", type=float, default=1.0, help="Portrait zoom multiplier")
    parser.add_argument("--x", type=float, default=0.0, help="Horizontal offset as fraction of canvas width")
    parser.add_argument("--y", type=float, default=0.0, help="Vertical offset as fraction of canvas height")
    parser.add_argument("--radius", type=float, default=0.78, help="Inner portrait circle radius as fraction of half-size")
    parser.add_argument("--shadow", type=float, default=0.32, help="Inner shadow strength from 0 to 1")
    return parser.parse_args()


def cover_resize(im: Image.Image, size: int, scale: float) -> Image.Image:
    w, h = im.size
    target = int(round(size * scale))
    ratio = max(target / w, target / h)
    resized = im.resize((int(round(w * ratio)), int(round(h * ratio))), Image.Resampling.LANCZOS)
    return resized


def circle_mask(size: int, radius_fraction: float) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    radius = int((size / 2) * radius_fraction)
    cx = cy = size // 2
    bbox = (cx - radius, cy - radius, cx + radius, cy + radius)
    draw = Image.new("L", (size, size), 0)
    from PIL import ImageDraw

    d = ImageDraw.Draw(draw)
    d.ellipse(bbox, fill=255)
    return draw.filter(ImageFilter.GaussianBlur(max(1, size // 500)))


def inner_shadow(size: int, radius_fraction: float, strength: float) -> Image.Image:
    if strength <= 0:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    base = circle_mask(size, radius_fraction)
    blurred = base.filter(ImageFilter.GaussianBlur(max(8, size // 34)))
    ring = Image.new("L", (size, size), 0)
    ring = Image.composite(Image.eval(blurred, lambda p: 255 - p), ring, base)
    alpha = Image.eval(ring, lambda p: int(p * max(0.0, min(1.0, strength))))
    return Image.new("RGBA", (size, size), (0, 0, 0, 255)).putalpha(alpha) or Image.new("RGBA", (size, size), (0, 0, 0, 0))


def make_shadow(size: int, radius_fraction: float, strength: float) -> Image.Image:
    mask = circle_mask(size, radius_fraction)
    edge = mask.filter(ImageFilter.GaussianBlur(max(10, size // 28)))
    alpha = Image.eval(edge, lambda p: int((255 - p) * strength) if p > 0 else 0)
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow.putalpha(alpha)
    return shadow


def main() -> None:
    args = parse_args()
    frame = Image.open(args.frame).convert("RGBA")
    size = min(frame.size)
    if frame.size != (size, size):
        frame = frame.resize((size, size), Image.Resampling.LANCZOS)

    portrait = Image.open(args.portrait).convert("RGBA")
    portrait = cover_resize(portrait, size, args.scale)

    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    x = (size - portrait.width) // 2 + int(args.x * size)
    y = (size - portrait.height) // 2 + int(args.y * size)
    canvas.alpha_composite(portrait, (x, y))

    mask = circle_mask(size, args.radius)
    clipped = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    clipped.paste(canvas, (0, 0), mask)

    shadow = make_shadow(size, args.radius, args.shadow)
    clipped.alpha_composite(shadow)
    clipped.alpha_composite(frame)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    clipped.save(out)
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()

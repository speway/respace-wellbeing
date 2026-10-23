"""Draw original geometric app icons. Requires Pillow; no downloaded imagery."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1] / "public"
for size in (192, 512):
    scale = 4
    im = Image.new("RGB", (size * scale, size * scale), "#48735c")
    draw = ImageDraw.Draw(im)
    def pts(values):
        return [(round(x / 512 * size * scale), round(y / 512 * size * scale)) for x, y in values]
    draw.line(pts([(256, 358), (256, 234)]), fill="#fffdf2", width=round(22 / 512 * size * scale))
    draw.ellipse([round(v / 512 * size * scale) for v in (141, 172, 254, 283)], fill="#c9db9f")
    draw.ellipse([round(v / 512 * size * scale) for v in (259, 125, 364, 239)], fill="#fffdf2")
    draw.line(pts([(171, 366), (341, 366)]), fill="#c9db9f", width=round(22 / 512 * size * scale))
    im.resize((size, size), Image.Resampling.LANCZOS).save(root / f"icon-{size}.png")

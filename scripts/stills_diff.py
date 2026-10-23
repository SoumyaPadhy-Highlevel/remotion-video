"""python3 scripts/stills_diff.py <before> <after>: per-frame pixel difference of two folders of stills (scripts/stills.mjs)."""
import os, sys
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]
worst = 0
for f in sorted(os.listdir(a)):
    x, y = Image.open(os.path.join(a, f)).convert("RGB"), Image.open(os.path.join(b, f)).convert("RGB")
    d = ImageChops.difference(x, y)
    n = sum(1 for p in d.getdata() if max(p) > 2)
    worst = max(worst, n)
    print(f, "identical" if n == 0 else f"{n} pixels differ, bbox {d.getbbox()}")
print("WORST", worst)

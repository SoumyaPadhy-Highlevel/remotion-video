"""Shared helpers for the DaVinci Resolve exports (resolve_fcpxml.py, resolve_dissect.py)."""
import os, subprocess, tempfile, urllib.parse
from PIL import Image

FFMPEG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "node_modules", ".bin", "remotion")


def activity(path):
    """Per-frame visible amount (sum of alpha on a 64×36 thumbnail) of an alpha video."""
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([FFMPEG, "ffmpeg", "-y", "-loglevel", "error", "-i", path, "-vf", "scale=64:36",
                        "-pix_fmt", "rgba", "-f", "image2", "-c:v", "png", os.path.join(d, "a%05d.png")], check=True)
        n = len(os.listdir(d))
        return [sum(Image.open(os.path.join(d, "a%05d.png" % (i + 1))).getchannel("A").getdata()) for i in range(n)]


def runs(act, lo, hi, thr=300):
    """Active stretches [f0, f1) inside [lo, hi)."""
    out, f0 = [], None
    for f in range(max(0, lo), min(hi, len(act))):
        on = act[f] > thr
        if on and f0 is None: f0 = f
        if not on and f0 is not None: out.append([f0, f]); f0 = None
    if f0 is not None: out.append([f0, min(hi, len(act))])
    return out


def place(items, act, kind, fps, end):
    """Snap each scripted item ({a, b} seconds) to the frames its pass actually shows it; leftovers become their own clips."""
    clips, last = [], 0
    for i, it in enumerate(items):
        a, b = round(it["a"] * fps), round(it["b"] * fps)
        nxt = round(items[i + 1]["a"] * fps) if i + 1 < len(items) else end
        r = runs(act, max(last, a - 20), min(max(b + 40, a + 1), nxt + 6, end))
        if not r: print(f"  ! {kind}: nothing visible for {it['name']} ({a / fps:.2f}–{b / fps:.2f} s)"); continue
        f0, f1 = max(last, r[0][0] - 1), min(end, r[-1][1] + 1)
        clips.append(dict(it, f0=f0, f1=f1)); last = f1
    covered = [False] * end
    for c in clips:
        for f in range(c["f0"], c["f1"]): covered[f] = True
    for f0, f1 in runs(act, 0, end):
        free = [f for f in range(f0, f1) if not covered[f]]
        if len(free) > 3:
            print(f"  + {kind}: unscripted overlay {free[0] / fps:.2f}–{(free[-1] + 1) / fps:.2f} s")
            clips.append({"name": f"{kind} · overlay", "kind": kind, "text": "", "f0": free[0], "f1": free[-1] + 1})
    return sorted(clips, key=lambda c: c["f0"])


def file_url(path):
    return "file://" + urllib.parse.quote(os.path.abspath(path))


def cut(src, dst, f0, f1, fps):
    """Frame-accurate copy of [f0, f1) of an intra-frame (ProRes) file into its own file."""
    subprocess.run([FFMPEG, "ffmpeg", "-y", "-loglevel", "error", "-ss", f"{f0 / fps:.4f}", "-i", src, "-frames:v", str(f1 - f0), "-c", "copy", dst], check=True)

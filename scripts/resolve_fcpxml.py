"""Step 2 of the DaVinci Resolve export (npm run resolve:export).

Reads out/resolve/.script.json (step 1) and the rendered passes in out/resolve/media, finds the exact frames each title,
panel and flash is on screen (from the pass's alpha), and writes out/resolve/WorkflowMaps.fcpxml and titles.csv.

Tracks: V1 base (cut per section) · V2 panel + client message · V3 titles, one clip per title · V4 mascot (cut per
section) · V5 flashes · V6 editable text (Resolve text clips, same words and times, disabled) · A1 music (cut per section).
Needs Pillow. Usage: python3 scripts/resolve_fcpxml.py [out/resolve]
"""
import csv, json, os, subprocess, sys, tempfile, urllib.parse
from xml.sax.saxutils import escape
from PIL import Image

OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "out/resolve")
MEDIA = os.path.join(OUT, "media")
S = json.load(open(os.path.join(OUT, ".script.json")))
FPS, END = S["fps"], S["end"]
FFMPEG = os.path.join(os.path.dirname(__file__), "..", "node_modules", ".bin", "remotion")

FILES = {"base": "01-base.mp4", "panel": "03-panel-message.mov", "titles": "02-titles.mov", "mascot": "04-mascot.mov", "flash": "05-flash.mov", "music": "06-music-edit.wav"}


def activity(name):
    """Per-frame visible amount (sum of alpha on a 64×36 thumbnail) of an alpha pass."""
    with tempfile.TemporaryDirectory() as d:
        subprocess.run([FFMPEG, "ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(MEDIA, FILES[name]), "-vf", "scale=64:36",
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


def place(items, act, kind):
    """Snap each scripted item to the frames its pass actually shows it; leftovers become their own clips."""
    clips, last = [], 0
    for i, it in enumerate(items):
        a, b = round(it["a"] * FPS), round(it["b"] * FPS)
        nxt = round(items[i + 1]["a"] * FPS) if i + 1 < len(items) else END
        r = runs(act, max(last, a - 20), min(max(b + 40, a + 1), nxt + 6, END))
        if not r: print(f"  ! {kind}: nothing visible for {it['name']} ({a / FPS:.2f}–{b / FPS:.2f} s)"); continue
        f0, f1 = max(last, r[0][0] - 1), min(END, r[-1][1] + 1)
        clips.append(dict(it, f0=f0, f1=f1)); last = f1
    covered = [False] * END
    for c in clips:
        for f in range(c["f0"], c["f1"]): covered[f] = True
    for f0, f1 in runs(act, 0, END):
        free = [f for f in range(f0, f1) if not covered[f]]
        if len(free) > 3:
            print(f"  + {kind}: unscripted overlay {free[0] / FPS:.2f}–{(free[-1] + 1) / FPS:.2f} s")
            clips.append({"name": f"{kind} · overlay", "kind": kind, "text": "", "f0": free[0], "f1": free[-1] + 1})
    return sorted(clips, key=lambda c: c["f0"])


print("reading alpha: titles, panel, flash…")
T = place(S["titles"], activity("titles"), "Title")
P = place(S["panels"], activity("panel"), "Panel")
FL = [{"name": "White flash", "f0": a, "f1": b} for a, b in runs(activity("flash"), 0, END)]

# ── FCPXML ──
tc = lambda f: f"{f}/{FPS}s"
url = lambda f: "file://" + urllib.parse.quote(os.path.join(MEDIA, f))
ASSETS = [("base", "01 Base · background + platform (stills under titles)", True), ("titles", "02 Titles (alpha)", True), ("panel", "03 Panel + message (alpha)", True),
          ("mascot", "04 Mascot (alpha)", True), ("flash", "05 Flashes (alpha)", True), ("music", "06 Music (edited)", False)]
ID = {k: f"a{i + 1}" for i, (k, _, _) in enumerate(ASSETS)}
res = ['    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>',
       '    <effect id="e1" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>']
for k, name, video in ASSETS:
    kind = 'hasVideo="1" format="r1" videoSources="1"' if video else 'hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"'
    res.append(f'    <asset id="{ID[k]}" name="{escape(name)}" start="0s" duration="{tc(END)}" {kind}>\n      <media-rep kind="original-media" src="{url(FILES[k])}"/>\n    </asset>')


def clip(k, c, lane=None):
    ln = f' lane="{lane}"' if lane is not None else ""
    role = ' audioRole="music"' if k == "music" else ""
    return f'<asset-clip ref="{ID[k]}" name="{escape(c["name"])}"{ln} offset="{tc(c["f0"])}" start="{tc(c["f0"])}" duration="{tc(c["f1"] - c["f0"])}"{role}/>'


def text(c, n):
    size = c.get("size", 84)
    words = (c["kicker"] + " — " if c.get("kicker") else "") + c["text"]
    return (f'<title ref="e1" name="{escape("Text · " + c["text"][:60])}" lane="6" offset="{tc(c["f0"])}" start="{tc(c["f0"])}" duration="{tc(c["f1"] - c["f0"])}" enabled="0">'
            f'<text><text-style ref="ts{n}">{escape(words)}</text-style></text>'
            f'<text-style-def id="ts{n}"><text-style font="Poppins" fontSize="{size}" fontFace="Bold" fontColor="0.043 0.106 0.227 1" alignment="center"/></text-style-def></title>')


secs = S["sections"]
home = lambda f: next(i for i, s in enumerate(secs) if s["f0"] <= f < s["f1"]) if f < END else len(secs) - 1
kids = [[] for _ in secs]
for s in secs:
    i = secs.index(s)
    kids[i] += [clip("mascot", s, 4), clip("music", s, -1)]
for c in P: kids[home(c["f0"])].append(clip("panel", c, 2))
for c in T: kids[home(c["f0"])].append(clip("titles", c, 3))
for c in FL: kids[home(c["f0"])].append(clip("flash", c, 5))
for n, c in enumerate([c for c in T if c["text"]]): kids[home(c["f0"])].append(text(c, n + 1))
marks = [[] for _ in secs]
for f, v in S["markers"] + [[c["f0"], f'{c["kind"]}: {c["text"]}'] for c in T if c["text"]]:
    marks[home(f)].append(f'<marker start="{tc(f)}" duration="{tc(1)}" value="{escape(v[:120])}"/>')
spine = []
for i, s in enumerate(secs):
    inner = "".join("\n          " + x for x in marks[i] + kids[i])
    spine.append(f'        <asset-clip ref="{ID["base"]}" name="{escape(s["name"])}" offset="{tc(s["f0"])}" start="{tc(s["f0"])}" duration="{tc(s["f1"] - s["f0"])}">{inner}\n        </asset-clip>')
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
{chr(10).join(res)}
  </resources>
  <library>
    <event name="Workflow Maps">
      <project name="Workflow Maps (editor layers)">
        <sequence format="r1" duration="{tc(END)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
{chr(10).join(spine)}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
'''
open(os.path.join(OUT, "WorkflowMaps.fcpxml"), "w").write(xml)
with open(os.path.join(OUT, "titles.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["in", "out", "kind", "kicker", "text"])
    for c in T: w.writerow([f'{c["f0"] / FPS:.2f}', f'{c["f1"] / FPS:.2f}', c["kind"], c.get("kicker", ""), c["text"]])
print(f"timeline: {len(secs)} base sections, {len(T)} titles, {len(P)} panel clips, {len(FL)} flashes → {OUT}/WorkflowMaps.fcpxml")

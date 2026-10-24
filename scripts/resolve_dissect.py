"""Full breakdown for DaVinci Resolve, step 2 (npm run resolve:dissect).

Reads out/resolve-dissect/.pieces.json (motion + piece ranges, step 1), .script.json (sections and titles, from
resolve-export.ts) and the rendered pieces in media/, splits the title and flash passes into one file per item, and writes
WorkflowMaps-dissected.fcpxml plus motion.csv. Every element is its own clip:

  V1  background (one still)
  V2  window frame (still, per section, with the window's motion as keyframes)
  V3  app footage as edited (per section; freezes behind titles are their own clips; same motion keyframes)
  V4  browser tabs (intro)   V5  panel shots   V6  map-build panel   V7–V11  flying items (one clip each, up to 5 at once)
  V12 titles (one file each)   V13 client message    V14 flashes (one file each)   V15 mascot (per section)
  V16 editable text (disabled)   A1 music
"""
import csv, json, os, shutil, sys
from xml.sax.saxutils import escape
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from resolve_common import activity, cut, file_url, place, runs

OUT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "out/resolve-dissect")
OLD = os.path.join(os.path.dirname(OUT), "resolve", "media")       # passes shared with the layer export (mascot, flash, music)
M = os.path.join(OUT, "media")
P = json.load(open(os.path.join(OUT, ".pieces.json")))
S = json.load(open(os.path.join(OUT, ".script.json")))
FPS, END = P["fps"], P["end"]
MO = P["motion"]
tc = lambda f: f"{int(f)}/{FPS}s"
UNIT = 1080 / 100                                                  # FCPXML position: % of frame height, y up


def link(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if not os.path.exists(dst):
        try: os.link(src, dst)
        except OSError: shutil.copy2(src, dst)


# ── pieces that are simple files ──
link(os.path.join(OUT, "..", "resolve-test", "media", "background.png"), os.path.join(M, "01-background", "background.png"))
link(os.path.join(OUT, "..", "resolve-test", "media", "window-frame.png"), os.path.join(M, "02-window", "window-frame.png"))
link(os.path.join(OLD, "04-mascot.mov"), os.path.join(M, "11-mascot", "mascot.mov"))
link(os.path.join(OLD, "06-music-edit.wav"), os.path.join(M, "12-music", "music-edit.wav"))
link(os.path.join(OUT, "..", "..", "public", "footage", "app-motion-v18.mp4"), os.path.join(OUT, "source", "app-film-raw.mp4"))
link(os.path.join(OUT, "..", "..", "public", "music-intro2.mp3"), os.path.join(OUT, "source", "music-original.mp3"))

# ── titles: one file each, at the frames the pass actually shows them ──
slug = lambda s: "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")[:56].strip("-")
full = os.path.join(M, "06-titles", "_titles-full.mov")
T = []
if os.path.exists(full):
    print("titles: reading alpha…")
    T = place(S["titles"], activity(full), "Title", FPS, END)
    for n, c in enumerate(T):
        c["file"] = os.path.join(M, "06-titles", f"{n + 1:02d}-{slug(c['text'] or c['name'])}.mov")
        cut(full, c["file"], c["f0"], c["f1"], FPS)
    os.remove(full)
    json.dump(T, open(os.path.join(OUT, ".titles.json"), "w"))
else:
    T = json.load(open(os.path.join(OUT, ".titles.json")))

# ── flashes: one file each ──
FL = []
fl_src = os.path.join(OLD, "05-flash.mov")
for n, (a, b) in enumerate(runs(activity(fl_src), 0, END)):
    f = os.path.join(M, "10-flashes", f"flash-{n + 1:02d}.mov")
    os.makedirs(os.path.dirname(f), exist_ok=True)
    cut(fl_src, f, a, b, FPS)
    FL.append({"name": f"White flash {n + 1}", "f0": a, "f1": b, "file": f})

# ── assets ──
assets, ids = [], {}


def asset(path, name, kind="video", w=1920, h=1080, frames=None):
    if path in ids: return ids[path]
    i = f"a{len(assets) + 1}"
    ids[path] = i
    fmt = {"video": f'hasVideo="1" format="{fmt_for(w, h)}" videoSources="1"', "still": 'hasVideo="1" format="r2"',
           "audio": 'hasAudio="1" audioSources="1" audioChannels="2" audioRate="48000"'}[kind]
    dur = "0s" if kind == "still" else tc(frames or END)
    assets.append(f'    <asset id="{i}" name="{escape(name)}" start="0s" duration="{dur}" {fmt}>\n      <media-rep kind="original-media" src="{file_url(path)}"/>\n    </asset>')
    return i


formats = {(1920, 1080): "r1"}


def fmt_for(w, h):
    if (w, h) not in formats: formats[(w, h)] = f"r{len(formats) + 2}"
    return formats[(w, h)]


# ── motion → keyframes ──
def px(f, still):
    """FCPXML position/scale/opacity of the window at output frame f. Footage (1620×880) is centred on the frame by default;
    the window-frame still (1920×1080, window drawn at rest 18 px below centre) scales about the frame centre."""
    cx, cy, s, o, _ = MO[min(f, END - 1)]
    dy = cy - 540 - (18 * s if still else 0)
    return ((cx - 960) / UNIT, -dy / UNIT, s, o)


def keys(f0, f1, still, tol=(0.1, 0.1, 0.003, 0.02)):
    """Keyframe frames: greedy linear simplification over x, y, scale, opacity."""
    v = [px(f, still) for f in range(f0, f1)]
    ks, i = [0], 0
    while i < len(v) - 1:
        j = i + 2
        while j < len(v):
            ok = all(abs(v[i][c] + (v[j][c] - v[i][c]) * (m - i) / (j - i) - v[m][c]) <= tol[c] for m in range(i + 1, j) for c in range(4))
            if not ok: break
            j += 1
        ks.append(j - 1); i = j - 1
    return [(f0 + k, v[k]) for k in ks]


def transform(f0, f1, still):
    """Clip children in FCPXML order: conform (footage only), transform, blend (opacity)."""
    ks = keys(f0, f1, still)
    x, y, sc, o = ks[0][1]
    conform = '' if still else '<adjust-conform type="none"/>'
    if len(ks) == 1 or all(k[1] == ks[0][1] for k in ks):
        return conform + f'<adjust-transform position="{x:.4f} {y:.4f}" scale="{sc:.5f} {sc:.5f}"/><adjust-blend amount="{o:.4f}"/>'
    kf = lambda fn: "".join(f'<keyframe time="{tc(f)}" value="{fn(v)}"/>' for f, v in ks)
    return conform + f'<adjust-transform position="{x:.4f} {y:.4f}" scale="{sc:.5f} {sc:.5f}">' + \
        f'<param name="position"><keyframeAnimation>{kf(lambda v: f"{v[0]:.4f} {v[1]:.4f}")}</keyframeAnimation></param>' + \
        f'<param name="scale"><keyframeAnimation>{kf(lambda v: f"{v[2]:.5f} {v[2]:.5f}")}</keyframeAnimation></param></adjust-transform>' + \
        f'<adjust-blend amount="{o:.4f}"><param name="amount"><keyframeAnimation>{kf(lambda v: f"{v[3]:.4f}")}</keyframeAnimation></param></adjust-blend>'


# ── clips ──
secs = S["sections"]
home = lambda f: next((i for i, s in enumerate(secs) if s["f0"] <= f < s["f1"]), len(secs) - 1)
kids = [[] for _ in secs]
put = lambda f, x: kids[home(f)].append(x)
BG = asset(os.path.join(M, "01-background", "background.png"), "Background", "still")
FR = asset(os.path.join(M, "02-window", "window-frame.png"), "Window frame", "still")
FT = asset(os.path.join(M, "03-footage", "footage-as-edited.mp4"), "App footage (as edited)", "video", 1620, 880)
MA = asset(os.path.join(M, "11-mascot", "mascot.mov"), "Mascot")
MU = asset(os.path.join(M, "12-music", "music-edit.wav"), "Music (edited)", "audio")


def clip(ref, name, lane, f0, f1, start=None, inner="", tag="asset-clip"):
    st = f0 if start is None else start
    return f'<{tag} ref="{ref}" name="{escape(name)}" lane="{lane}" offset="{tc(f0)}" start="{tc(st)}" duration="{tc(f1 - f0)}">{inner}</{tag}>'


motion_rows = []
for s in secs:
    f0, f1 = s["f0"], s["f1"]
    vis = [f for f in range(f0, f1) if MO[f][3] > 0.001]
    if vis:
        a, b = vis[0], vis[-1] + 1
        hold = s["name"].split(" · ")[0] in ("Card", "Line", "Panels", "Clip")
        label = ("Freeze · " if s["name"].startswith("Card") else "Footage · ") + s["name"]
        put(f0, clip(FR, "Window · " + s["name"], 1, a, b, a, transform(a, b, True), "video"))
        put(f0, clip(FT, label, 2, a, b, a, transform(a, b, False)))
    put(f0, clip(MA, "Mascot · " + s["name"], 14, f0, f1))
    put(f0, f'<asset-clip ref="{MU}" name="{escape("Music · " + s["name"])}" lane="-1" offset="{tc(f0)}" start="{tc(f0)}" duration="{tc(f1 - f0)}" audioRole="music"/>')

# panel shots, map-build panel, flights, message: each its own file, starting at its own frame 0
import glob
for p, path in zip(P["panels"], sorted(glob.glob(os.path.join(M, "04-panel-shots", "*.mov")))):
    a, b = round(p["a"] * FPS), round(p["b"] * FPS)
    put(a, clip(asset(path, "Panel shot · " + p["name"], frames=b - a), "Panel shot · " + p["name"], 4, a, b, 0))
bp = P["build"]; a, b = round(bp["a"] * FPS), round(bp["b"] * FPS)
put(a, clip(asset(os.path.join(M, "05-map-build", "map-build-panel.mov"), "Map build · panel", frames=b - a), "Map build · steps panel", 5, a, b, 0))
# browser tabs above the window (intro hand-off); their motion is baked (they sit outside the window)
put(390, clip(asset(os.path.join(M, "02-window", "browser-tabs.mov"), "Browser tabs", frames=911), "Browser tabs", 3, 390, 1301, 0))
FLANES = (6, 7, 8, 9, 10)
lane_end = {l: 0 for l in FLANES}
for fl, path in zip(P["flights"], sorted(glob.glob(os.path.join(M, "05-map-build", "flights", "*.mov")))):
    a, b = round(fl["a"] * FPS), round(fl["b"] * FPS)
    ln = next(l for l in FLANES if lane_end[l] <= a); lane_end[ln] = b
    put(a, clip(asset(path, "Flight · " + fl["name"], frames=b - a), "Flight · " + fl["name"], ln, a, b, 0))
for n, c in enumerate(T):
    put(c["f0"], clip(asset(c["file"], c["name"], frames=c["f1"] - c["f0"]), c["name"], 11, c["f0"], c["f1"], 0))
ms = P["message"]; a, b = round(ms["a"] * FPS), round(ms["b"] * FPS)
put(a, clip(asset(os.path.join(M, "07-message", "client-message.mov"), "Client message", frames=b - a), "Client message", 12, a, b, 0))
for c in FL:
    put(c["f0"], clip(asset(c["file"], c["name"], frames=c["f1"] - c["f0"]), c["name"], 13, c["f0"], c["f1"], 0))
# editable text (disabled)
for n, c in enumerate([c for c in T if c.get("text")]):
    words = (c["kicker"] + " — " if c.get("kicker") else "") + c["text"]
    put(c["f0"], f'<title ref="e1" name="{escape("Text · " + c["text"][:60])}" lane="15" offset="{tc(c["f0"])}" start="{tc(c["f0"])}" duration="{tc(c["f1"] - c["f0"])}" enabled="0">'
        f'<text><text-style ref="ts{n + 1}">{escape(words)}</text-style></text><text-style-def id="ts{n + 1}"><text-style font="Poppins" fontSize="{c.get("size", 84)}" fontFace="Bold" fontColor="0.043 0.106 0.227 1" alignment="center"/></text-style-def></title>')

# markers: sections, music hits, every motion event (where the window starts or stops moving)
marks = [[] for _ in secs]
for f, v in S["markers"]: marks[home(f)].append((f, v))
for c in T:
    if c.get("text"): marks[home(c["f0"])].append((c["f0"], f'{c["kind"]}: {c["text"]}'))

# ── motion.csv: every change of the window's motion, readable ──
prev = None
with open(os.path.join(OUT, "motion.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["time_s", "frame", "centre_x_px", "centre_y_px", "scale", "opacity", "blur_px", "section"])
    for f in range(END):
        row = MO[f]
        if prev is None or any(abs(a - b) > 1e-3 for a, b in zip(row, prev)) or f == END - 1:
            w.writerow([f"{f / FPS:.3f}", f, *row, secs[home(f)]["name"]])
        prev = row

spine = []
for i, s in enumerate(secs):
    inner = "".join("\n          " + x for x in kids[i]) + "".join("\n          " + f'<marker start="{tc(f)}" duration="{tc(1)}" value="{escape(v[:120])}"/>' for f, v in sorted(marks[i]))   # anchored clips, then markers
    spine.append(f'        <video ref="{BG}" name="{escape("Background · " + s["name"])}" offset="{tc(s["f0"])}" start="{tc(s["f0"])}" duration="{tc(s["f1"] - s["f0"])}">{inner}\n        </video>')
fmts = ['    <format id="r1" name="FFVideoFormat1080p30" frameDuration="1/30s" width="1920" height="1080"/>', '    <format id="r2" name="FFVideoFormatRateUndefined" width="1920" height="1080"/>'] + \
    [f'    <format id="{r}" frameDuration="1/30s" width="{w}" height="{h}"/>' for (w, h), r in formats.items() if r != "r1"]
xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
{chr(10).join(fmts)}
    <effect id="e1" name="Basic Title" uid=".../Titles.localized/Bumper:Opener.localized/Basic Title.localized/Basic Title.moti"/>
{chr(10).join(assets)}
  </resources>
  <library>
    <event name="Workflow Maps">
      <project name="Workflow Maps (every piece separate)">
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
open(os.path.join(OUT, "WorkflowMaps-dissected.fcpxml"), "w").write(xml)
n_kf = xml.count("<keyframe ")
print(f"timeline: {len(secs)} sections, {len(T)} titles, {len(P['flights'])} flights, {len(P['panels'])} panel shots, {len(FL)} flashes, {n_kf} keyframes → {OUT}/WorkflowMaps-dissected.fcpxml")

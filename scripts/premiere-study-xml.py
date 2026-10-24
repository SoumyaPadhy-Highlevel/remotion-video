"""Build a current-cut Premiere timeline and a short review reel.

The current render supplies unchanged sections and continuous original audio.
Three clean picture plates replace its selected cards; transparent title stills
have native Premiere Motion and Opacity keyframes. No source edit is overwritten.
"""
import copy
import json
from pathlib import Path
import sys
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "out/premiere-computer-use/current-study")
PLAN = json.loads((OUT / "plan.json").read_text())
STEADY = "--steady-motion" in sys.argv
SMOOTH_FIX = "--smooth-make-it-yours" in sys.argv or STEADY
ORIGINAL_SCENES = PLAN["scenes"][:]
PICTURE_SCENES = ORIGINAL_SCENES
if SMOOTH_FIX:
    fix = PLAN["makeItYours"]
    PLAN["scenes"] = [fix, *ORIGINAL_SCENES]
    PICTURE_SCENES = [fix, *ORIGINAL_SCENES[1:]]
if STEADY:
    PICTURE_SCENES = []
FPS, END = PLAN["fps"], PLAN["end"]
REFERENCE = OUT.parent / "Current reference - 384dc03.mp4"
if STEADY:
    REFERENCE = OUT / "media/steady-picture.mp4"
SOUNDTRACK = OUT / "media/soundtrack-current.wav"
TEMPLATE = ET.parse(ROOT / "out/premiere/WorkflowMaps.xml").find("sequence")
FILES = {}
CLIP_ID = 0


def node(parent, tag, text=None, **attributes):
    item = ET.SubElement(parent, tag, attributes)
    if text is not None:
        item.text = str(text)
    return item


def rate(parent):
    r = node(parent, "rate")
    node(r, "timebase", FPS)
    node(r, "ntsc", "FALSE")


def sample(parent):
    c = node(parent, "samplecharacteristics")
    rate(c)
    for key, value in {"width": 1920, "height": 1080, "anamorphic": "FALSE", "pixelaspectratio": "square", "fielddominance": "none"}.items():
        node(c, key, value)


def file(parent, path, duration, still=False, audio=False):
    path = path.resolve()
    if not path.is_file():
        raise FileNotFoundError(path)
    if path in FILES:
        node(parent, "file", id=FILES[path])
        return
    identifier = f"study-file-{len(FILES) + 1}"
    FILES[path] = identifier
    f = node(parent, "file", id=identifier)
    node(f, "name", path.name)
    node(f, "pathurl", "file://localhost" + urllib.parse.quote(str(path)))
    rate(f)
    node(f, "duration", 86400 if still else duration)
    media = node(f, "media")
    if path.suffix.lower() != ".wav":
        sample(node(media, "video"))
    if audio:
        a = node(media, "audio")
        c = node(a, "samplecharacteristics")
        node(c, "depth", 16)
        node(c, "samplerate", 48000)
        node(a, "channelcount", 2)


def effect(clip, name, effect_id):
    e = node(node(clip, "filter"), "effect")
    for key, value in {"name": name, "effectid": effect_id, "effectcategory": "motion", "effecttype": "motion", "mediatype": "video"}.items():
        node(e, key, value)
    return e


def value(parent, v):
    result = node(parent, "value")
    if isinstance(v, tuple):
        node(result, "horiz", f"{v[0]:.8f}")
        node(result, "vert", f"{v[1]:.8f}")
    else:
        result.text = f"{v:.6f}"


def parameter(e, identifier, name, val=None, keys=None):
    p = node(e, "parameter", authoringApp="PremierePro")
    node(p, "parameterid", identifier)
    node(p, "name", name)
    if identifier in ("scale", "opacity"):
        node(p, "valuemin", 0)
        node(p, "valuemax", 1000 if identifier == "scale" else 100)
    if keys is not None:
        for frame, v in keys:
            k = node(p, "keyframe")
            node(k, "when", frame)
            value(k, v)
    else:
        value(p, val)


def title_motion(clip, duration, calm=False):
    # Easing is sampled into editable native keyframes; interpolation between
    # these closely spaced keys follows the cubic entrance and faster exit.
    entrance, exit_length = (10, 6) if calm else (12, 8)
    exit_start = duration - exit_length - 1
    frames = sorted(set([*range(0, entrance + 1, 2), exit_start, *range(exit_start + 2, duration - 1, 2), duration - 1]))
    positions, scales, opacity = [], [], []
    for frame in frames:
        if frame <= entrance:
            u = frame / entrance
            k = 1 - (1 - u) ** 3
            dy, scale, alpha = (14 if calm or STEADY else 34) * (1 - k), 100 if calm or STEADY else 98.5 + 1.5 * k, 100 * k
        elif frame >= exit_start:
            u = (frame - exit_start) / exit_length
            dy, scale, alpha = (-8 if calm or STEADY else -18) * u ** 3, 100 if calm or STEADY else 100 + 0.5 * u ** 3, 100 * (1 - u ** 2)
        else:
            dy, scale, alpha = 0, 100, 100
        # xmeml's center values are offsets as fractions of the full frame.
        positions.append((frame, (0, dy / 1080)))
        scales.append((frame, scale))
        opacity.append((frame, alpha))
    motion = effect(clip, "Basic Motion", "basic")
    parameter(motion, "scale", "Scale", keys=scales)
    parameter(motion, "rotation", "Rotation", val=0)
    parameter(motion, "center", "Center", keys=positions)
    parameter(motion, "centerOffset", "Anchor Point", val=(0, 0))
    parameter(effect(clip, "Opacity", "opacity"), "opacity", "opacity", keys=opacity)


def clip(track, name, path, duration, start, end, source_in=0, still=False, audio=False, native=False):
    global CLIP_ID
    CLIP_ID += 1
    c = node(track, "clipitem", id=f"study-clip-{CLIP_ID}")
    node(c, "name", name)
    node(c, "enabled", "TRUE")
    node(c, "duration", 86400 if still else duration)
    rate(c)
    for tag, v in [("start", start), ("end", end), ("in", source_in), ("out", source_in + end - start)]:
        node(c, tag, v)
    if still:
        node(c, "stillframe", "TRUE")
        node(c, "alphatype", "straight")
    file(c, path, duration, still, audio or (path.resolve() == REFERENCE.resolve() and not STEADY))
    if audio:
        source = node(c, "sourcetrack")
        node(source, "mediatype", "audio")
        node(source, "trackindex", 1)
    if native:
        title_motion(c, end - start, calm=native == "calm")
    node(node(c, "labels"), "label2", "Yellow" if native else "Caribbean" if audio else "Iris")
    return c


def finish_track(track):
    node(track, "enabled", "TRUE")
    node(track, "locked", "FALSE")


def sequence(parent, name, identifier, ranges):
    length = sum(b - a for a, b in ranges)
    seq = node(parent, "sequence", id=identifier)
    node(seq, "name", name)
    node(seq, "duration", length)
    rate(seq)
    node(seq, "in", 0)
    node(seq, "out", length)
    timecode = node(seq, "timecode")
    rate(timecode)
    node(timecode, "string", "00:00:00:00")
    node(timecode, "frame", 0)
    node(timecode, "displayformat", "NDF")
    media = node(seq, "media")
    video = node(media, "video")
    video.append(copy.deepcopy(TEMPLATE.find("media/video/format")))
    picture, titles = node(video, "track"), node(video, "track")
    audio = node(media, "audio")
    node(audio, "numOutputChannels", 2)
    audio.append(copy.deepcopy(TEMPLATE.find("media/audio/format")))
    soundtrack = node(audio, "track", premiereTrackType="Stereo")
    offset = 0
    for lo, hi in ranges:
        points = sorted({lo, hi, *(f for s in PICTURE_SCENES for f in [s["patchStart"], s["patchEnd"]] if lo < f < hi)})
        for a, b in zip(points, points[1:]):
            scene = next((s for s in PICTURE_SCENES if s["patchStart"] <= a and b <= s["patchEnd"]), None)
            path = OUT / "media" / f"{scene['id']}-clean.mp4" if scene else REFERENCE
            source_in = a - scene["patchStart"] if scene else a
            duration = scene["patchEnd"] - scene["patchStart"] if scene else END
            label = f"Clean picture - {scene['id']}" if scene else "Steady picture - current full cut" if STEADY else "Current cut - original picture"
            clip(picture, label, path, duration, offset + a - lo, offset + b - lo, source_in)
        clip(soundtrack, "Original soundtrack - timing preserved", SOUNDTRACK, END, offset, offset + hi - lo, lo, audio=True)
        for s in PLAN["scenes"]:
            if not lo <= s["start"] < s["titleEnd"] <= hi:
                continue
            start, end = offset + s["start"] - lo, offset + s["titleEnd"] - lo
            clip(titles, f"Native title - {s['id']} - {s['entranceFrames']}f enter / {s['exitFrames']}f exit", OUT / "media" / f"{s['id']}-title.png", 86400, start, end, still=True, native=s.get("motion", True))
            mark = node(seq, "marker")
            node(mark, "name", f"REVIEW - {s['kicker']} - native title transition")
            node(mark, "comment", "Steady 100% scale, 10-frame gentle rise and fade, full 6-frame exit; no beat pulse or letter stagger." if s.get("motion") == "calm" else "12-frame decelerating rise and fade; readable hold; 8-frame accelerating lift and fade. Motion and Opacity remain editable in Effect Controls.")
            node(mark, "in", start)
            node(mark, "out", -1)
        offset += hi - lo
    for t in [picture, titles, soundtrack]:
        finish_track(t)
    node(soundtrack, "outputchannelindex", 1)
    return seq


if __name__ == "__main__":
    root = ET.Element("xmeml", version="4")
    project = node(root, "project")
    node(project, "name", "Current cut - three native transition studies")
    children = node(project, "children")
    version = "v4 - steady motion" if STEADY else "v3 - smooth Make it yours" if SMOOTH_FIX else "v2"
    sequence(children, f"Workflow Maps - CURRENT - {version}" if SMOOTH_FIX else "Workflow Maps - CURRENT - 3 transitions v2", "study-current", [(0, END)])
    reel_ranges = [(s["patchStart"] - 30, s["patchEnd"] + 30) for s in ORIGINAL_SCENES]
    sequence(children, f"REVIEW - Three Premiere transitions {version}", "study-review", reel_ranges)
    path = OUT.parent / ("Steady-motion.xml" if STEADY else "Smooth-make-it-yours.xml" if SMOOTH_FIX else "Current-transition-study.xml")
    ET.indent(root)
    ET.ElementTree(root).write(path, encoding="utf-8", xml_declaration=True)
    print(f"Created {path}: {END} frames, {len(FILES)} media assets, {CLIP_ID} clips")

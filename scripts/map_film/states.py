"""Per-frame look of every world node in the film: 'c' coloured, 'g' ghost (greyed out), '-' not there, from the pixels
around its projected position (camera track from camera.py). Writes {node_id: "c c g - ..." per frame} plus the frame
times, for change-point extraction (events.py)."""
import cv2, json, sys, numpy as np
from frames import frame
from proj import project
from world import load, FILM_HUE
from organise import plane_offset, plane_rect, node_xz

Y = {"workflow": 0.3, "asset": 0.15}

def classify(hsv, u, v, r, ftype, S):
    h, w = hsv.shape[:2]
    x0, x1, y0, y1 = int(u - r), int(u + r), int(v - r), int(v + r)
    if x0 < 62 or y0 < 80 or x1 >= w - 12 or y1 >= 866: return "?"
    patch = hsv[y0:y1, x0:x1].reshape(-1, 3).astype(int)
    hue, sat, val = patch[:, 0] * 2, patch[:, 1], patch[:, 2]
    target = FILM_HUE.get(ftype, 222)
    dh = np.minimum(abs(hue - target), 360 - abs(hue - target))
    col = ((sat > 90) & (dh < 16) & (val > 80)).mean()
    # greyed out: neutral grey, or (dimmed over a coloured slab) a low-saturation shade of the node's own hue
    grey = (((sat < 30) & (val > 160) & (val < 236)) | ((sat < 100) & (dh < 30) & (val > 120) & (val < 215))).mean()
    if col > 0.25:
        # a selected node glows: its colour bleeds into a ring well outside its body
        R = 1.3 * S
        X0, X1, Y0, Y1 = int(u - R), int(u + R), int(v - R), int(v + R)
        if X0 >= 62 and Y0 >= 80 and X1 < w - 12 and Y1 < 866:
            ring = hsv[Y0:Y1, X0:X1].astype(int)
            yy, xx = np.mgrid[Y0:Y1, X0:X1]
            d = np.hypot(xx - u, (yy - v) * 1.4)
            a, b, th = (0.42, 0.58, 12) if ftype != "workflow" else (0.55, 0.68, 6)
            near, far = (d > a * S) & (d < b * S), (d > 1.05 * S) & (d < 1.25 * S)
            # the glow raises the saturation around the node above the slab or ground further out
            if np.median(ring[..., 1][near]) - np.median(ring[..., 1][far]) > th: return "s"
        return "c"
    if grey > 0.3: return "g"
    return "-"

PALETTE_HUE = {"yellow": 48, "blue": 217, "green": 142, "orange": 25, "cyan": 189, "teal": 172, "purple": 271, "fuchsia": 292, "rose": 350}
CODE = {"yellow": "y", "blue": "b", "green": "g", "orange": "o", "cyan": "c", "teal": "t", "purple": "p", "fuchsia": "f", "rose": "r", "gray": "a"}

def plane_state(hsv, cam, p, t):
    """A slab's colour from its top face ('-' when it isn't there): sampled across the face, the pale tint of its colour
    (white ground and grey grid lines carry no tint)."""
    x0, z0, x1, z1 = plane_rect(p["id"], p["rect"], t)
    hues, n_in = [], 0
    for X in np.linspace(x0 + 0.5, x1 - 0.5, 7):
        for Z in np.linspace(z0 + 0.5, z1 - 0.5, 7):
            u, v = project(cam, X, 0.0, Z)
            iu, iv = int(round(u)), int(round(v))
            if not (64 <= iu < 1600 and 130 <= iv < 810): continue
            n_in += 1
            hh, ss, vv = hsv[iv, iu].astype(int)
            if 5 <= ss <= 70 and vv > 205: hues.append(hh * 2)
    if n_in < 6: return "?"
    if len(hues) < 0.4 * n_in: return "-"
    h = np.median(hues)
    name = min(PALETTE_HUE, key=lambda c: min(abs(PALETTE_HUE[c] - h), 360 - abs(PALETTE_HUE[c] - h)))
    return CODE[name]

if __name__ == "__main__":
    cams = [r for f in sys.argv[1].split(",") for r in json.load(open(f))]
    world, nodes = load(sys.argv[3] if len(sys.argv) > 3 else "main")
    out = {"t": [], "nodes": {n["id"]: [] for n in nodes}, "planes": {p["id"]: [] for p in world["planes"]}}
    for (t, cx, cy, s, k, rms) in cams:
        out["t"].append(t)
        if cx is None:
            for n in nodes: out["nodes"][n["id"]].append("?")
            for p in world["planes"]: out["planes"][p["id"]].append("?")
            continue
        hsv = cv2.cvtColor(frame(t), cv2.COLOR_BGR2HSV)
        for n in nodes:
            dx, dz = plane_offset(n["plane"], t); nx, nz = node_xz(n["id"], n["x"], n["z"], t)
            u, v = project((cx, cy, s), nx + dx, Y[n["kind"]], nz + dz)
            out["nodes"][n["id"]].append(classify(hsv, u, v, 0.17 * s if n["kind"] == "workflow" else 0.12 * s, n["type"], s))
        for p in world["planes"]:
            out["planes"][p["id"]].append(plane_state(hsv, (cx, cy, s), p, t))
    out["nodes"] = {k: "".join(v) for k, v in out["nodes"].items()}
    out["planes"] = {k: "".join(v) for k, v in out["planes"].items()}
    json.dump(out, open(sys.argv[2], "w"))

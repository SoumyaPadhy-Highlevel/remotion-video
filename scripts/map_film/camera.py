"""Per-frame camera (cx, cy, s) of the film's map: detected node blobs matched to the world, least squares, predicted from
the previous frame through the frame-to-frame motion (motion.json). Writes [[film_t, cx, cy, s, matches, rms], ...]."""
import cv2, json, sys, numpy as np
from frames import frame, ftime
from proj import A, project
from world import load, FILM_HUE

Y = {"workflow": 0.3, "asset": 0.15}  # film blob centre heights (calibrated at film 90 s)

def blobs(im):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(int)
    m = (hsv[..., 1] > 110) & (hsv[..., 2] > 90)
    m[:80] = 0; m[:, :62] = 0; m[868:] = 0
    n, lab, st, _ = cv2.connectedComponentsWithStats(m.astype(np.uint8), 8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 40 or w > 140 or h > 140 or a / (w * h) < 0.35: continue
        hue = float(np.median(hsv[..., 0][lab == i]) * 2)
        out.append((x + w / 2, y + h / 2, a, hue))
    # greyed-out nodes: light grey solids (any type), separated from the pale slab faces by their darker shading
    g = ((hsv[..., 1] < 28) & (hsv[..., 2] > 150) & (hsv[..., 2] < 228)).astype(np.uint8)
    g[:80] = 0; g[:, :62] = 0; g[868:] = 0
    g = cv2.morphologyEx(g, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(g, 8)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if a < 60 or w > 140 or h > 140 or a / (w * h) < 0.45 or abs(w - h) > 0.6 * max(w, h): continue
        out.append((x + w / 2, y + h / 2, a, -1.0))
    return out

def hue_ok(h, kind_type):
    if h < 0: return True  # a greyed-out node can be any type
    target = FILM_HUE.get(kind_type)
    if target is None: return True
    d = abs(h - target); return min(d, 360 - d) < 14

def solve(cam, nodes, det, radius):
    for _ in range(4):
        rows, rhs, used = [], [], []
        for n in nodes:
            u, v = project(cam, n["x"], Y[n["kind"]], n["z"])
            best = None
            for (bu, bv, a, h) in det:
                if not hue_ok(h, n["type"]): continue
                d = np.hypot(bu - u, bv - v)
                if d < radius and (best is None or d < best[0]): best = (d, bu, bv)
            if best:
                a = A @ np.array([n["x"], Y[n["kind"]], n["z"]])
                rows += [[1, 0, a[0]], [0, 1, a[1]]]; rhs += [best[1], best[2]]; used.append(best[0])
        if len(used) < 3: return cam, len(used), None
        sol, *_ = np.linalg.lstsq(np.array(rows, float), np.array(rhs, float), rcond=None)
        cam = sol; radius = max(6.0, radius * 0.6)
    res = np.array(rows) @ cam - np.array(rhs)
    return cam, len(used), float(np.sqrt((res ** 2).mean()))

def translate_only(cam, nodes, det, radius):
    for _ in range(3):
        d = []
        for n in nodes:
            u, v = project(cam, n["x"], Y[n["kind"]], n["z"])
            best = None
            for (bu, bv, a, h) in det:
                if not hue_ok(h, n["type"]): continue
                e = np.hypot(bu - u, bv - v)
                if e < radius and (best is None or e < best[0]): best = (e, bu - u, bv - v)
            if best: d.append(best[1:])
        if not d: return None
        off = np.median(np.array(d), axis=0); cam = cam + np.array([off[0], off[1], 0]); radius = max(6.0, radius * 0.6)
    res = np.array(d) - off
    return cam, len(d), float(np.sqrt((res ** 2).sum(1).mean()))

def initialise(nodes, det):
    """Camera hypothesis from scratch: for each scale, pair a detected workflow blob with a world workflow, count matches."""
    wb = [d for d in det if hue_ok(d[3], "workflow")]
    wn = [n for n in nodes if n["kind"] == "workflow"]
    best = (0, None)
    for s in np.geomspace(18, 160, 60):
        for (bu, bv, a, h) in wb:
            for n in wn:
                p = A @ np.array([n["x"], Y["workflow"], n["z"]])
                cam = np.array([bu - s * p[0], bv - s * p[1], s])
                k = 0
                for m in wn:
                    u, v = project(cam, m["x"], Y["workflow"], m["z"])
                    if any(np.hypot(u - d[0], v - d[1]) < 0.25 * s for d in wb): k += 1
                if k > best[0]: best = (k, cam)
    return best

if __name__ == "__main__":
    motion = {r[0]: r for r in json.load(open(sys.argv[1]))}
    t0, t1, cam0 = float(sys.argv[2]), float(sys.argv[3]), [float(v) for v in sys.argv[4].split(",")]
    _, nodes = load(sys.argv[6] if len(sys.argv) > 6 else "main")
    cam = np.array(cam0); out = []
    i0, i1 = round((t0 - 45) * 30) + 1, round((t1 - 45) * 30) + 1
    cut = True
    for i in range(i0, i1 + 1):
        im = frame(ftime(i))
        det = blobs(im)
        new, k, rms = solve(cam.copy(), nodes, det, 0.9 * cam[2])
        if rms is not None and rms < 4 and k >= 4:
            cam = new
        else:
            # few nodes coloured (a filter or a selection greys the rest): keep the predicted scale, fix the translation
            tr = translate_only(cam.copy(), nodes, det, 0.4 * cam[2])
            if tr is not None and tr[1] >= 3 and tr[2] < 3:
                cam, k, rms = tr
            elif k == 0 and cut:
                k0, guess = initialise(nodes, det)
                if guess is not None and k0 >= 6:
                    new, k, rms = solve(guess, nodes, det, 0.5 * guess[2])
                    if rms is not None and rms < 4: cam = new
        out.append([round(ftime(i), 4), *[round(float(v), 3) for v in cam], k, rms])
        if i % 150 == 0: print(round(ftime(i), 2), flush=True)
        # predict the next frame through the tracked motion (a similarity about the canvas origin)
        m = motion.get(i)
        cut = not (m and m[5] >= 40)
        if not cut:
            s, tx, ty = m[1], m[3], m[4]
            cam = np.array([s * cam[0] + tx, s * cam[1] + ty, s * cam[2]])
    json.dump(out, open(sys.argv[5], "w"))
    bad = [r for r in out if r[5] is None or r[4] < 4]
    print("frames", len(out), "unsolved", len(bad))

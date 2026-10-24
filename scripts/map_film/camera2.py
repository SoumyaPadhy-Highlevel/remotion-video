"""Per-frame camera (cx, cy, s) of the film's map, drift-free: absolute anchors from a global match of detected node blobs
to the world (every few frames), and the frame-to-frame motion (motion.json, ORB + RANSAC) carrying the camera between
anchors, blended from the anchors on both sides. Hard cuts (few motion inliers) break the chain.

  python3 camera2.py motion.json t0 t1 out.json [world]   → [[film_t, cx, cy, s, anchor_matches, anchor_rms], ...]"""
import cv2, json, sys, numpy as np
from frames import frame, ftime
from proj import A
from world import load
from camera import blobs, hue_ok, Y

def world_points(nodes):
    P = np.array([A @ np.array([n["x"], Y[n["kind"]], n["z"]]) for n in nodes])  # (N, 2) screen offset per unit scale
    return P

def match_count(cams, P, B, tol):
    """For each candidate camera (K, 3), how many world points land within tol*s of a blob. Vectorised."""
    pts = cams[:, None, :2] + cams[:, None, 2:3] * P[None]          # (K, N, 2)
    d = np.linalg.norm(pts[:, :, None, :] - B[None, None], axis=-1)  # (K, N, M)
    return (d.min(axis=2) < tol * cams[:, None, 2]).sum(axis=1)

def lsq(cam, nodes, P, det, radius):
    B = np.array([[d[0], d[1]] for d in det])
    for _ in range(4):
        pts = cam[:2] + cam[2] * P
        rows, rhs, errs = [], [], []
        for n, p, q in zip(nodes, P, pts):
            ok = [j for j, d in enumerate(det) if hue_ok(d[3], n["type"])]
            if not ok: continue
            dd = np.linalg.norm(B[ok] - q, axis=1); j = int(np.argmin(dd))
            if dd[j] < radius:
                rows += [[1, 0, p[0]], [0, 1, p[1]]]; rhs += list(B[ok][j]); errs.append(dd[j])
        if len(errs) < 4: return cam, len(errs), None
        cam = np.linalg.lstsq(np.array(rows), np.array(rhs), rcond=None)[0]; radius = max(5.0, radius * 0.6)
    res = np.array(rows) @ cam - np.array(rhs)
    return cam, len(errs), float(np.sqrt((res ** 2).mean()))

def anchor_any(nodes, P, det):
    """As `anchor`, for frames where most nodes are greyed out: any blob can be any node, so demand more agreement."""
    allb = np.array([[d[0], d[1]] for d in det])
    big = [d for d in det if d[2] >= np.percentile([e[2] for e in det], 40)]
    if len(allb) < 8: return None
    hyp = np.array([[d[0], d[1]] for d in big])
    best = (0, None)
    for s in np.geomspace(18, 170, 45):
        cams = np.array([[b[0] - s * P[i][0], b[1] - s * P[i][1], s] for b in hyp for i in range(len(nodes))])
        k = np.zeros(len(cams), int)
        for c0 in range(0, len(cams), 4000): k[c0:c0 + 4000] = match_count(cams[c0:c0 + 4000], P, allb, 0.14)
        j = int(np.argmax(k))
        if k[j] > best[0]: best = (int(k[j]), cams[j])
    if best[0] < 10: return None
    cam, k, rms = lsq(best[1].copy(), nodes, P, det, 0.2 * best[1][2])
    if rms is None or rms > 1.6 or k < 10: return None
    return cam, k, rms

def anchor(nodes, P, det):
    """Global search: hypothesise each (coloured workflow blob, world workflow) pair at each scale, keep the best."""
    wf = [i for i, n in enumerate(nodes) if n["kind"] == "workflow"]
    wb = np.array([[d[0], d[1]] for d in det if d[3] >= 0 and hue_ok(d[3], "workflow")])
    allb = np.array([[d[0], d[1]] for d in det])
    if len(wb) < 2 or len(allb) < 4: return None
    best = (0, None)
    for s in np.geomspace(18, 170, 70):
        cams = np.array([[b[0] - s * P[i][0], b[1] - s * P[i][1], s] for b in wb for i in wf])
        k = match_count(cams, P[wf], wb, 0.22)
        j = int(np.argmax(k))
        if k[j] > best[0]: best = (int(k[j]), cams[j])
    if best[0] < 4: return None
    cam, k, rms = lsq(best[1].copy(), nodes, P, det, 0.3 * best[1][2])
    if rms is None or rms > 1.6 or k < 6: return None
    return cam, k, rms

if __name__ == "__main__":
    motion = {r[0]: r for r in json.load(open(sys.argv[1]))}
    t0, t1 = float(sys.argv[2]), float(sys.argv[3])
    _, nodes = load(sys.argv[5] if len(sys.argv) > 5 else "main")
    P = world_points(nodes)
    idx = list(range(round((t0 - 45) * 30) + 1, round((t1 - 45) * 30) + 2))
    anchors = {}
    for n_i, i in enumerate(idx):
        # anchor every 4th frame, and every frame right after a cut
        m_prev = motion.get(i - 1)
        if n_i % 4 and m_prev and m_prev[5] >= 40: continue
        det = blobs(frame(ftime(i)))
        a = anchor(nodes, P, det) or anchor_any(nodes, P, det)
        if a: anchors[i] = a
        if n_i % 120 == 0: print(round(ftime(i), 2), len(anchors), flush=True)
    # carry each anchor forward and backward through the motion until a cut, then blend the two nearest
    def step(cam, i, forward):
        m = motion.get(i if forward else i - 1)
        if not m or m[5] < 40: return None
        s, tx, ty = m[1], m[3], m[4]
        return np.array([s * cam[0] + tx, s * cam[1] + ty, s * cam[2]]) if forward else np.array([(cam[0] - tx) / s, (cam[1] - ty) / s, cam[2] / s])
    fwd, bwd = {}, {}
    cam, src = None, None
    for i in idx:
        if i in anchors: cam, src = anchors[i][0], i
        if cam is not None: fwd[i] = (cam, src)
        nxt = step(cam, i, True) if cam is not None else None
        if nxt is None: cam = None
        else: cam = nxt
    cam, src = None, None
    for i in reversed(idx):
        if i in anchors: cam, src = anchors[i][0], i
        if cam is not None: bwd[i] = (cam, src)
        prv = step(cam, i, False) if cam is not None else None
        cam = prv
    out = []
    for i in idx:
        f, b = fwd.get(i), bwd.get(i)
        if f and b:
            w = 0.5 if f[1] == b[1] else (i - f[1]) / max(1, b[1] - f[1])
            c = (1 - w) * f[0] + w * b[0]
        elif f or b: c = (f or b)[0]
        else: c = None
        a = anchors.get(i)
        out.append([round(ftime(i), 4), *([round(float(v), 3) for v in c] if c is not None else [None, None, None]), a[1] if a else 0, a[2] if a else None])
    json.dump(out, open(sys.argv[4], "w"))
    print("frames", len(out), "anchors", len(anchors), "uncovered", sum(1 for r in out if r[1] is None))

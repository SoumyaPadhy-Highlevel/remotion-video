"""Second pass over a camera track (camera2.py) for frames where a filter leaves only a few nodes coloured: every pair of
coloured workflow blobs is tried against every pair of world workflows (the pair fixes position and scale), each candidate
is scored by how well the folders' slab edges land on the film's coloured edges, and the best is kept. Corrections are
smoothed over 9 frames.

  python3 refine.py cam2.json out.json world ui.json"""
import cv2, json, sys, numpy as np
from frames import frame
from proj import A
from world import load
from camera import blobs, hue_ok, Y
from organise import node_xz, plane_offset, plane_rect
from states import PALETTE_HUE

cams = json.load(open(sys.argv[1]))
world, nodes = load(sys.argv[3])
UI = {round(r[0], 3): r for r in json.load(open(sys.argv[4]))}
wf = [n for n in nodes if n["kind"] == "workflow"]

def edge_score(hsv, cam, t):
    hits = tot = 0
    for p in world["planes"]:
        x0, z0, x1, z1 = plane_rect(p["id"], p["rect"], t)
        target = PALETTE_HUE.get(p["color"] or "blue", 217)
        for k in np.linspace(0.1, 0.9, 9):
            for X, Z in ((x1, z0 + (z1 - z0) * k), (x0 + (x1 - x0) * k, z1)):
                q = cam[:2] + cam[2] * (A @ np.array([X, -0.05, Z]))
                u, v = int(q[0]), int(q[1])
                if not (64 <= u < 1600 and 82 <= v < 864): continue
                tot += 1
                px = hsv[max(0, v - 3):v + 4, max(0, u - 3):u + 4].reshape(-1, 3).astype(int)
                dh = np.minimum(abs(px[:, 0] * 2 - target), 360 - abs(px[:, 0] * 2 - target))
                if ((px[:, 1] > 70) & (dh < 20)).any(): hits += 1
    return hits, tot

def pair_solve(t, cam0):
    im = frame(t); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
    ui = UI.get(round(t, 3), [t, 0, 0, []])
    l, rgt = ui[1] or 0, ui[2] or 1620
    det = [d for d in blobs(im) if d[3] >= 0 and hue_ok(d[3], "workflow") and l + 8 < d[0] < rgt - 8 and 130 < d[1] < 800
           and not any(x <= d[0] <= x + w and y <= d[1] <= y + h for x, y, w, h in ui[3])]
    if len(det) < 2 or len(det) > 8: return None
    W = [(n, A @ np.array([*(lambda xz: (xz[0] + plane_offset(n["plane"], t)[0], 0.3, xz[1] + plane_offset(n["plane"], t)[1]))(node_xz(n["id"], n["x"], n["z"], t))])) for n in wf]
    best = None
    for a in range(len(det)):
        for b in range(len(det)):
            if a == b: continue
            db = np.array(det[b][:2]) - np.array(det[a][:2])
            for i, (ni, pi) in enumerate(W):
                for j, (nj, pj) in enumerate(W):
                    if i == j: continue
                    dw = pj - pi; L = np.linalg.norm(dw)
                    if L < 1e-6: continue
                    s = np.linalg.norm(db) / L
                    if not (18 < s < 170) or abs(s / cam0[2] - 1) > 0.6: continue
                    if np.linalg.norm(db - s * dw) > 0.06 * s * L + 3: continue
                    cam = np.array([det[a][0] - s * pi[0], det[a][1] - s * pi[1], s])
                    h, tot = edge_score(hsv, cam, t)
                    if tot >= 8 and (best is None or h / tot > best[0]): best = (h / tot, cam)
    if best is None: return None
    # how well the carried camera already puts a workflow on each coloured blob
    pts = np.array([cam0[:2] + cam0[2] * p for _, p in W])
    err0 = np.mean([np.min(np.linalg.norm(pts - np.array(d[:2]), axis=1)) for d in det])
    return best[0], best[1], err0

out, corr = [], []
for r in cams:
    t, cx, cy, s, k, rms = r
    c = None
    if cx is not None:
        b = pair_solve(t, np.array([cx, cy, s]))
        # a pair fit puts two coloured blobs exactly on two workflows; take it where the carried camera misses them
        if b and b[0] > 0.25 and b[2] > 5: c = b[1] - np.array([cx, cy, s])
    corr.append(c)
for i, r in enumerate(cams):
    win = [c for c in corr[max(0, i - 4):i + 5] if c is not None]
    if r[1] is None or not win or corr[i] is None and len(win) < 3: out.append(r); continue
    c = np.median(np.array(win), axis=0); out.append([r[0], r[1] + c[0], r[2] + c[1], r[3] + c[2], r[4], r[5]])
json.dump(out, open(sys.argv[2], "w"))
print("corrected", sum(1 for c in corr if c is not None), "of", len(cams))

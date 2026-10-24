"""Where the film's own UI covers the map canvas, per frame: side panels (a long vertical border: left panels end at it,
right drawers start at it) and sticky notes (pale paper rectangles). The redrawn map leaves these to the film.
Writes [[film_t, left_panel_right_x | 0, right_drawer_left_x | 0, [[x, y, w, h], ...notes]], ...]."""
import cv2, json, sys, numpy as np
from frames import frame

def panels(g):
    dx = np.abs(np.diff(g[150:840].astype(int), axis=1)); frac = (dx > 4).mean(axis=0)
    xs = [x for x in range(64, 1600) if frac[x] > 0.85]
    left = max([x for x in xs if x < 800], default=0)
    right = min([x for x in xs if x >= 800], default=0)
    return left + 1 if left else 0, right if right else 0

def paper(m, dense, wmin, hmin):
    """Filled rectangles in a paper mask: [[x, y, w, h], ...] (padded 3 px)."""
    m[:80] = 0; m[868:] = 0; m[:, :62] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        # paper is a filled rectangle: dense in its box, unlike a slab face seen at an angle
        if w > wmin and h > hmin and a / (w * h) > dense: out.append([int(x) - 3, int(y) - 3, int(w) + 6, int(h) + 6])
    return out

def notes(im):
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(int)
    # sticky-note paper: pale, lightly saturated (yellow, cyan, rose, blue papers), large flat areas
    tinted = ((hsv[..., 1] > 22) & (hsv[..., 1] < 95) & (hsv[..., 2] > 225)).astype(np.uint8)
    # the gray workflow-note paper (#f3f4f6): unsaturated and a shade darker than the white canvas (V ≈ 245 vs 255). Its text
    # lines take a larger share of the card, so it is held to a lower density but must be card-sized
    gray = ((hsv[..., 1] <= 22) & (hsv[..., 2] >= 238) & (hsv[..., 2] <= 250)).astype(np.uint8)
    return paper(tinted, 0.75, 60, 40) + paper(gray, 0.6, 150, 80)

if __name__ == "__main__":
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); out = []
    for i in range(round((t0 - 45) * 30) + 1, round((t1 - 45) * 30) + 2):
        t = 45 + (i - 1) / 30
        im = frame(t); g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
        l, r = panels(g)
        out.append([round(t, 4), l, r, notes(im)])
    json.dump(out, open(sys.argv[3], "w"))

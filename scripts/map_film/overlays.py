"""What the film draws over its map that the redraw must keep: the cursor (tip, per frame), dark tooltips and contact
chips (rects).
Writes [[film_t, [x, y] | None, [[x, y, w, h], ...tooltips]], ...].

  python3 overlays.py t0 t1 out.json"""
import cv2, json, sys, numpy as np
from scipy import ndimage
from frames import frame

def arrow(g):
    """Tip of the cursor: a dark arrow 13–24 px tall in a white outline (the film's macOS pointer)."""
    reg = g[80:868, 60:1610].astype(np.int16)
    lab, _ = ndimage.label(reg < 45)
    best = None
    for i, sl in enumerate(ndimage.find_objects(lab)):
        h, w = sl[0].stop - sl[0].start, sl[1].stop - sl[1].start
        area = int((lab[sl] == i + 1).sum())
        if 13 <= h <= 26 and 7 <= w <= 18 and area >= 50 and area / (h * w) > 0.3:
            y0, x0 = sl[0].start, sl[1].start
            if (reg[max(0, y0 - 2):y0 + h + 2, max(0, x0 - 2):x0 + w + 2] > 235).mean() > 0.25 and (best is None or area > best[2]):
                best = (x0 + 60, y0 + 80, area)
    return None if best is None else [best[0], best[1]]

def tooltips(g):
    m = (g < 60).astype(np.uint8); m[:80] = 0; m[868:] = 0; m[:, :60] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    return [[int(x) - 4, int(y) - 4, int(w) + 8, int(h) + 8] for i, (x, y, w, h, a) in enumerate(st[1:], 1) if w > 60 and 16 < h < 60 and a / (w * h) > 0.5]

def chips(im):
    """Contact chips on the map (a white pill with a blue avatar and the contact's name): avatar centres → chip rects."""
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV).astype(int)
    m = ((abs(hsv[..., 0] - 110) < 6) & (hsv[..., 1] > 190) & (hsv[..., 2] > 200)).astype(np.uint8); m[:80] = 0; m[868:] = 0
    n, lab, st, cen = cv2.connectedComponentsWithStats(m, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if not (16 <= w <= 28 and 16 <= h <= 28 and abs(w - h) <= 3 and a / (w * h) > 0.55): continue
        cx, cy = int(cen[i][0]), int(cen[i][1])
        if cy + 16 >= 880 or cx - 15 < 0: continue
        white = lambda u, v: hsv[v, u, 2] > 240 and hsv[v, u, 1] < 20
        if white(cx, cy + 15) and white(cx - 15, cy): out.append([cx - 22, cy - 20, 148, 40])
    return out

if __name__ == "__main__":
    t0, t1 = float(sys.argv[1]), float(sys.argv[2]); out = []
    for i in range(round((t0 - 45) * 30) + 1, round((t1 - 45) * 30) + 2):
        t = 45 + (i - 1) / 30; g = cv2.cvtColor(frame(t), cv2.COLOR_BGR2GRAY)
        out.append([round(t, 4), arrow(g), tooltips(g) + chips(frame(t))])
    json.dump(out, open(sys.argv[3], "w"))

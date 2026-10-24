"""Frame-to-frame motion of the film (similarity: scale + translation) over the map canvas, by ORB features and RANSAC.
Writes [[i, scale, rotation_deg, tx, ty, inliers, matches], ...] for each frame i → i+1."""
import cv2, json, sys, numpy as np
from frames import frame, ftime

orb = cv2.ORB_create(3000)
mask = np.zeros((880, 1620), np.uint8); mask[130:800, 70:1600] = 255
bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
n = int(sys.argv[1]); out = []
# side panels per frame (ui.py), masked out so static UI can't pin the motion to zero
panels = {}
for f in sys.argv[3:]:
    for r in json.load(open(f)): panels[round(r[0], 3)] = (r[1], r[2])
def mask_at(i):
    m = mask.copy(); l, r = panels.get(round(ftime(i), 3), (0, 0))
    if l: m[:, :l + 6] = 0
    if r: m[:, r - 6:] = 0
    return m
prev = frame(ftime(1), True); kp_prev, d_prev = orb.detectAndCompute(prev, mask_at(1))
for i in range(1, n):
    cur = frame(ftime(i + 1), True)
    m2 = mask_at(i + 1)
    if panels.get(round(ftime(i + 1), 3)) != panels.get(round(ftime(i), 3)):
        kp_prev, d_prev = orb.detectAndCompute(prev, m2)  # both frames under the same mask
    kp, d = orb.detectAndCompute(cur, m2)
    row = [i, 1.0, 0.0, 0.0, 0.0, 0, 0]
    if d_prev is not None and d is not None:
        m = bf.match(d_prev, d)
        if len(m) >= 8:
            pa = np.float32([kp_prev[x.queryIdx].pt for x in m]); pb = np.float32([kp[x.trainIdx].pt for x in m])
            M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=2)
            if M is not None:
                row = [i, float(np.hypot(M[0, 0], M[1, 0])), float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))), float(M[0, 2]), float(M[1, 2]), int(inl.sum()), len(m)]
    out.append(row)
    prev, kp_prev, d_prev = cur, kp, d
    if i % 500 == 0: print(i, flush=True)
json.dump(out, open(sys.argv[2], "w"))

"""Contact sheet of film frames with the world's nodes projected through the solved camera (red rings), for checking."""
import cv2, json, sys, numpy as np
from frames import frame
from proj import project
from world import load

cams = [r for f in sys.argv[1].split(",") for r in json.load(open(f))]
times = [float(t) for t in sys.argv[2].split(",")]
_, nodes = load(sys.argv[4] if len(sys.argv) > 4 else "main")
tiles = []
for t in times:
    r = min(cams, key=lambda r: abs(r[0] - t))
    im = frame(r[0]).copy()
    for n in nodes:
        u, v = project(r[1:4], n["x"], 0.3 if n["kind"] == "workflow" else 0.15, n["z"])
        cv2.circle(im, (int(u), int(v)), int(0.22 * r[3]), (0, 0, 255), 2)
    cv2.putText(im, f"{r[0]:.2f} k={r[4]}", (70, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 255), 3)
    tiles.append(cv2.resize(im, (540, 293)))
while len(tiles) % 4: tiles.append(np.zeros_like(tiles[0]))
rows = [np.hstack(tiles[i:i + 4]) for i in range(0, len(tiles), 4)]
cv2.imwrite(sys.argv[3], np.vstack(rows))

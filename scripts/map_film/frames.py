"""Access to the film's frames extracted from 45 s on (one jpg per frame), by film time."""
import cv2, os
DIR = os.environ.get("MAP_FRAMES", "")
T0 = 45.0

def path(t):
    return os.path.join(DIR, "%05d.jpg" % (round((t - T0) * 30) + 1))

def frame(t, gray=False):
    im = cv2.imread(path(t), cv2.IMREAD_GRAYSCALE if gray else cv2.IMREAD_COLOR)
    if im is None:
        raise FileNotFoundError(path(t))
    return im

def ftime(i):
    return T0 + (i - 1) / 30

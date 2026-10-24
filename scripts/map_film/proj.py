"""The product's camera (workflow-grid grid-view-stance.ts): orthographic, looking along -(7, 9, 8), +Y up.
A frame's camera is (cx, cy, s): canvas px of the world origin and px per world unit."""
import numpy as np

D = np.array([7.0, 9.0, 8.0]); D /= np.linalg.norm(D)
RIGHT = np.cross([0.0, 1.0, 0.0], D); RIGHT /= np.linalg.norm(RIGHT)
UP = np.cross(D, RIGHT); UP /= np.linalg.norm(UP)
A = np.stack([RIGHT, -UP])  # screen offset per world unit (u right, v down)

def project(cam, X, Y, Z):
    cx, cy, s = cam
    p = A @ np.array([X, Y, Z], float)
    return cx + s * p[0], cy + s * p[1]

def unproject(cam, u, v, Y):
    """World (X, Z) of the screen point (u, v) at height Y."""
    cx, cy, s = cam
    M = A[:, [0, 2]]
    rhs = np.array([(u - cx) / s, (v - cy) / s]) - A[:, 1] * Y
    X, Z = np.linalg.solve(M, rhs)
    return X, Z

"""The film's Organise moves by film time, mirroring src/video/map3d/organise.ts (for sampling the film where things are)."""

NESTS = [((100, 190), [(105.0, 0, 0), (105.07, 0, 0.07), (105.2, 0.47, 0.2), (105.33, 1.22, 0.55), (105.47, 1.85, 0.82), (105.6, 2.13, 0.96), (105.73, 2.21, 0.98), (105.87, 2.08, 1.01), (105.9, 2.08, 1.01), (106.0, 0, 1.4)], (105.9, 106.0)),
         ((208, 240), [(212.95, 0, 0), (213.0, 0.21, 0.09), (213.07, 0.45, 0.19), (213.13, 0.75, 0.33), (213.2, 1.17, 0.53), (213.8, 1.15, 1.18), (213.87, -0.12, 1.09), (213.93, -0.31, 1.03), (214.5, -0.31, 1.03), (214.6, 0, 1.4)], (214.5, 214.6))]
MOVE = [(102.2, -3.24, 4.38), (102.3, -3.02, 4.2), (102.4, -2.2, 3.87), (102.5, -0.5, 3.24), (102.633, 3.59, 1.35), (102.733, 8.08, 0.26),
        (102.833, 10.69, -1.09), (102.933, 12.49, -1.76), (103.0, 13.13, -2.01), (103.1, 13.56, -2.17), (103.2, 13.62, -2.2), (103.47, 13.7, -2.11)]

def ease(k):  # easeInOut (cubic-bezier .65, 0, .35, 1), close enough for sampling the film
    k = min(1, max(0, k)); return 4 * k ** 3 if k < 0.5 else 1 - (-2 * k + 2) ** 3 / 2

def keys(ks, t):
    if t <= ks[0][0]: return ks[0][1:]
    if t >= ks[-1][0]: return ks[-1][1:]
    for a, b in zip(ks, ks[1:]):
        if a[0] <= t <= b[0]:
            k = (t - a[0]) / (b[0] - a[0]); return tuple(a[i] + (b[i] - a[i]) * k for i in (1, 2))

def scene(t):
    return next((n for n in NESTS if n[0][0] <= t <= n[0][1]), None)

def plane_offset(plane, t):
    s = scene(t)
    if plane != "tagroute" or not s: return 0.0, 0.0
    return keys(s[1], t)

def plane_rect(plane, rect, t):
    """A folder's rect at film time t (08 dragged down, 07 grown around it)."""
    x0, z0, x1, z1 = rect
    s = scene(t)
    if plane == "tagroute":
        dx, dz = plane_offset(plane, t); return [x0 + dx, z0 + dz, x1 + dx, z1 + dz]
    if plane == "segment" and s:
        k = ease((t - s[2][0]) / (s[2][1] - s[2][0]))
        return [x0 + (-7.8 - x0) * k, z0 + (8.4 - z0) * k, x1 + (7 - x1) * k, z1 + (15.2 - z1) * k]
    return rect

def node_xz(node_id, x, z, t):
    """A node's world position at film time t (Course Access Removed is dragged into 04 in the first Organise)."""
    if node_id != "course-access-removed" or not (100 <= t <= 190) or t <= MOVE[0][0]: return x, z
    if t >= MOVE[-1][0]: return MOVE[-1][1], MOVE[-1][2]
    for a, b in zip(MOVE, MOVE[1:]):
        if a[0] <= t <= b[0]:
            k = (t - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k

// The map as the video draws it: the film's worlds (filmMap.ts, positions read off the film) re-laid out so no label
// touches another label or node. Each folder is a grid of cells big enough for a full-width label at the smallest zoom
// that shows labels (0.5); a folder's nodes keep the order they have on the film (assigned to the cell nearest their
// film position), and the folders keep the film's arrangement, moved apart to fit their new size.
// Everything traced from the film (cameras, cursor, Organise's drags) is in film coordinates: `toSpaced` carries a film
// point onto the spaced map, `spacedCamera` a film camera (same zoom, framing the same nodes).
import { FILM_WORLDS } from "./filmMap";
import { MapCamera, MapNode, MapPlane, MapScene, projectToCanvas } from "./MapScene";

/** A cell: world units between neighbouring nodes along x and z (labels keep 10 px apart at zoom 0.5, spacing.test.ts). */
export const CELL = { x: 2.9, z: 3.3 };
/** Folder edge to the nearest cell: the back sides (x0, z0) and the front sides (x1, z1), which leave room for the
 * folder's own label below its front corner. */
export const FOLDER_PAD = { back: 1.0, front: 1.8 };

type Slot = { x0: number; z0: number; cols: number; rows: number };
/** Where each folder sits on the spaced map (its back corner) and its grid. */
export const SPACED_FOLDERS: Record<string, Slot> = {
  lead: { x0: 0, z0: 0, cols: 5, rows: 4 },
  consult: { x0: 16, z0: 2, cols: 3, rows: 2 },
  sales: { x0: 3.3, z0: -8, cols: 2, rows: 2 },
  onboard: { x0: 11.2, z0: -8, cols: 4, rows: 2 },
  retention: { x0: -10.8, z0: 3.7, cols: 3, rows: 2 },
  segment: { x0: 0, z0: 14.3, cols: 4, rows: 2 },
  tagroute: { x0: -10.3, z0: 11.8, cols: 3, rows: 2 },
  // the Organise-and-document scene's own folder, right of 02 as on the film
  "lead-mgmt": { x0: 27.5, z0: 1.4, cols: 4, rows: 3 },
};

/** Cells kept for things other than the film's nodes, at the spot they'd take on the film's map: nodes other scenes add
 * (the reveal's Custom fields, the Assistant's Growth Foundations workflows and offer, assistant/actWorld.ts), and spots
 * the film itself fills (`film`): the cell in 04 that Organise drops Course Access Removed into (organise.ts), and the
 * ground under the film's "Sales intake" sticky note in 01, which the film keeps on screen there, so it covers no node. */
export const MAP_EXTRAS: Record<string, { plane: string; x: number; z: number; film?: true }> = {
  "teaser-custom-fields": { plane: "lead", x: 0.9, z: 7.15 },
  "revoke-course-access": { plane: "retention", x: -4.45, z: 2.95 },
  "new-member-registration": { plane: "lead", x: 3.3, z: 7.25 },
  "course-offer-activated": { plane: "onboard", x: 13.9, z: -3.9 },
  "course-offer-revoked": { plane: "tagroute", x: -4.4, z: 10.4 },
  "a-growth-offer": { plane: "onboard", x: 10.6, z: -3.3 },
  "course-access-removed@onboard": { plane: "onboard", x: 13.7, z: -2.11, film: true },
  "sticky-note@lead": { plane: "lead", x: 2.07, z: 5.62, film: true },
};

const round = (v: number) => Math.round(v * 100) / 100;
/** A folder's rect from its slot. */
export const slotRect = (s: Slot) => ({
  x0: s.x0, z0: s.z0,
  x1: round(s.x0 + FOLDER_PAD.back + (s.cols - 1) * CELL.x + FOLDER_PAD.front),
  z1: round(s.z0 + FOLDER_PAD.back + (s.rows - 1) * CELL.z + FOLDER_PAD.front),
});

/** Assigns points to cells (both normalised to 0–1) nearest first, then swaps pairs while that shortens the total. */
const assign = (pts: number[][], cells: number[][]) => {
  const d2 = (i: number, j: number) => (pts[i][0] - cells[j][0]) ** 2 + (pts[i][1] - cells[j][1]) ** 2;
  const pairs = pts.flatMap((_, i) => cells.map((__, j) => [d2(i, j), i, j]));
  pairs.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const of: number[] = new Array(pts.length).fill(-1), used = new Set<number>();
  for (const [, i, j] of pairs) if (of[i] < 0 && !used.has(j)) { of[i] = j; used.add(j); }
  for (let better = true, pass = 0; better && pass < 50; pass++) {
    better = false;
    for (let i = 0; i < pts.length; i++) for (let j = 0; j < cells.length; j++) {
      const k = of.indexOf(j);
      if (k === i) continue;
      if (d2(i, j) + (k >= 0 ? d2(k, of[i]) : 0) < d2(i, of[i]) + (k >= 0 ? d2(k, j) : 0) - 1e-9) {
        if (k >= 0) of[k] = of[i];
        of[i] = j;
        better = true;
      }
    }
  }
  return of;
};

type At = { id: string; plane: string; x: number; z: number };
/** Every node that ever sits in a folder, at its film position: both film worlds and the extras. */
const members: At[] = (() => {
  const seen = new Set<string>(), out: At[] = [];
  for (const n of [...FILM_WORLDS.main.nodes, ...FILM_WORLDS.orgdoc.nodes]) {
    if (!n.plane || seen.has(n.id)) continue;
    seen.add(n.id);
    out.push({ id: n.id, plane: n.plane, x: n.x, z: n.z });
  }
  for (const [id, e] of Object.entries(MAP_EXTRAS)) out.push({ id, plane: e.plane, x: e.x, z: e.z });
  return out;
})();

/** The spaced position of every node (film worlds and extras) and the spaced rect of every folder. */
export const SPACED = (() => {
  const nodes: Record<string, { x: number; z: number }> = {};
  const planes: Record<string, { x0: number; z0: number; x1: number; z1: number }> = {};
  for (const [id, slot] of Object.entries(SPACED_FOLDERS)) {
    const m = members.filter((n) => n.plane === id);
    if (m.length > slot.cols * slot.rows) throw new Error(`Folder ${id} has ${m.length} nodes but ${slot.cols} × ${slot.rows} cells`);
    const xs = m.map((n) => n.x), zs = m.map((n) => n.z);
    const bx = [Math.min(...xs), Math.max(...xs)], bz = [Math.min(...zs), Math.max(...zs)];
    const norm = (v: number, [a, b]: number[]) => (b - a > 1e-6 ? (v - a) / (b - a) : 0.5);
    const cells: number[][] = [];
    for (let j = 0; j < slot.rows; j++) for (let i = 0; i < slot.cols; i++) cells.push([slot.cols > 1 ? i / (slot.cols - 1) : 0.5, slot.rows > 1 ? j / (slot.rows - 1) : 0.5]);
    const of = assign(m.map((n) => [norm(n.x, bx), norm(n.z, bz)]), cells);
    m.forEach((n, k) => {
      const c = of[k], i = c % slot.cols, j = Math.floor(c / slot.cols);
      nodes[n.id] = { x: round(slot.x0 + FOLDER_PAD.back + i * CELL.x), z: round(slot.z0 + FOLDER_PAD.back + j * CELL.z) };
    });
    planes[id] = slotRect(slot);
  }
  return { nodes, planes };
})();

/** A film world on the spaced map: its folders and nodes moved, everything else as it was. */
export const spaceWorld = (w: MapScene): MapScene => ({
  ...w,
  planes: w.planes.map((p): MapPlane => (SPACED.planes[p.id] ? { ...p, ...SPACED.planes[p.id] } : p)),
  nodes: w.nodes.map((n): MapNode => (SPACED.nodes[n.id] ? { ...n, ...SPACED.nodes[n.id] } : n)),
});

/** The film's worlds as the video draws them. */
export const MAP_WORLDS: Record<string, MapScene> = Object.fromEntries(Object.entries(FILM_WORLDS).map(([k, w]) => [k, spaceWorld(w)]));

// ── film coordinates → spaced ──
/** Film points with known spaced positions: every film node, every folder corner and the film's own spots in MAP_EXTRAS. */
const anchors: { f: [number, number]; d: [number, number] }[] = (() => {
  const out: { f: [number, number]; d: [number, number] }[] = [], seen = new Set<string>();
  for (const [id, e] of Object.entries(MAP_EXTRAS)) if (e.film) out.push({ f: [e.x, e.z], d: [SPACED.nodes[id].x - e.x, SPACED.nodes[id].z - e.z] });
  for (const w of Object.values(FILM_WORLDS)) {
    for (const n of w.nodes) {
      const to = SPACED.nodes[n.id];
      if (!to || seen.has(n.id)) continue;
      seen.add(n.id);
      out.push({ f: [n.x, n.z], d: [to.x - n.x, to.z - n.z] });
    }
    for (const p of w.planes) {
      const to = SPACED.planes[p.id];
      if (!to || seen.has(`plane:${p.id}`)) continue;
      seen.add(`plane:${p.id}`);
      for (const [a, b] of [["x0", "z0"], ["x1", "z0"], ["x0", "z1"], ["x1", "z1"]] as const) out.push({ f: [p[a], p[b]], d: [to[a] - p[a], to[b] - p[b]] });
    }
  }
  return out;
})();

/** A film-map point (world units) on the spaced map: exact at every film node and folder corner, a smooth blend of their
 * moves (inverse distance cubed) in between. */
export const toSpaced = (x: number, z: number): [number, number] => {
  let wx = 0, wz = 0, sum = 0;
  for (const a of anchors) {
    const d = Math.hypot(x - a.f[0], z - a.f[1]);
    if (d < 1e-6) return [x + a.d[0], z + a.d[1]];
    const w = 1 / (d * d * d);
    wx += w * a.d[0];
    wz += w * a.d[1];
    sum += w;
  }
  return [x + wx / sum, z + wz / sum];
};

const ORIGIN = projectToCanvas({ cx: 0, cy: 0, s: 1 }, 0, 0, 0);
const EX = projectToCanvas({ cx: 0, cy: 0, s: 1 }, 1, 0, 0), EZ = projectToCanvas({ cx: 0, cy: 0, s: 1 }, 0, 0, 1);
/** The ground point (y = 0) under canvas point (u, v). */
export const groundAt = (cam: MapCamera, u: number, v: number): [number, number] => {
  const a = (EX[0] - ORIGIN[0]) * cam.s, b = (EZ[0] - ORIGIN[0]) * cam.s, c = (EX[1] - ORIGIN[1]) * cam.s, d = (EZ[1] - ORIGIN[1]) * cam.s;
  const du = u - cam.cx, dv = v - cam.cy, det = a * d - b * c;
  return [(du * d - b * dv) / det, (a * dv - c * du) / det];
};

/** Each film world's nodes as [film position, spaced position] pairs. */
const PAIRS: Record<string, { f: [number, number]; to: [number, number] }[]> = Object.fromEntries(Object.entries(FILM_WORLDS).map(([k, w]) =>
  [k, w.nodes.filter((n) => SPACED.nodes[n.id]).map((n) => ({ f: [n.x, n.z] as [number, number], to: [SPACED.nodes[n.id].x, SPACED.nodes[n.id].z] as [number, number] }))]));
/** 0 at a canvas edge, 1 from 120 px inside it (smoothstep), so nodes enter and leave the framing gradually. */
const inside = (d: number) => {
  const k = Math.min(1, Math.max(0, d / 120));
  return k * k * (3 - 2 * k);
};
type Box = { left: number; top: number; width: number; height: number };
/** The smallest camera scale (px per world unit) at which the spaced map's labels are proven clear (spacing.test.ts),
 * and the film's: the product shows node labels from zoom 0.5, s = 39.6 on the film's 792 px canvas. */
export const LABEL_SAFE_S = 38, FILM_LABEL_S = 39.6;
/** A film camera on the spaced map: the nodes the film shows in `box` (canvas px) framed as the film frames them (the
 * scale and offset that best keep their screen positions, nodes near the box's edges counting less), so a wide shot still
 * holds the whole map and a close-up the same group of nodes. It never zooms in past the film, and while the film shows
 * labels never out past LABEL_SAFE_S (`labels` says whether it shows them). With no node in view it keeps the map point
 * at the box's middle. */
export const spacedCamera = (cam: MapCamera, box: Box, world = "main"): MapCamera & { labels: boolean } => {
  const mid: [number, number] = [box.left + box.width / 2, box.top + box.height / 2];
  const unit = (x: number, z: number) => projectToCanvas({ cx: 0, cy: 0, s: 1 }, x, 0, z);
  // [weight, spaced position at unit scale, film screen position]
  const pts: [number, number, number, number, number][] = [[0.05, ...unit(...toSpaced(...groundAt(cam, mid[0], mid[1]))), ...mid]];
  for (const p of PAIRS[world] ?? []) {
    const [fu, fv] = projectToCanvas(cam, p.f[0], 0, p.f[1]);
    const w = inside(fu - box.left) * inside(box.left + box.width - fu) * inside(fv - box.top) * inside(box.top + box.height - fv);
    if (w > 0) pts.push([w, ...unit(...p.to), fu, fv]);
  }
  const sum = pts.reduce((t, p) => t + p[0], 0), mean = (k: number) => pts.reduce((t, p) => t + p[0] * p[k], 0) / sum;
  const [au, av, bu, bv] = [mean(1), mean(2), mean(3), mean(4)];
  // least squares for the scale, pulled toward the film's when few nodes spread out (1 unit² of spread)
  let num = cam.s, den = 1;
  for (const [w, a0, a1, b0, b1] of pts) {
    num += w * ((a0 - au) * (b0 - bu) + (a1 - av) * (b1 - bv));
    den += w * ((a0 - au) ** 2 + (a1 - av) ** 2);
  }
  // the label floor: LABEL_SAFE_S while the film shows labels, eased in below that (a share of the film's scale growing
  // from 0.7 at s = 28), so a film zoom through the label threshold stays one smooth zoom
  const k = Math.min(1, Math.max(0, (cam.s - 28) / (FILM_LABEL_S - 28)));
  const floor = Math.min(LABEL_SAFE_S, cam.s * (0.7 + (LABEL_SAFE_S / FILM_LABEL_S - 0.7) * k));
  const s = Math.min(cam.s, Math.max(num / den, floor));
  return { cx: bu - s * au, cy: bv - s * av, s, labels: cam.s >= FILM_LABEL_S };
};

/** Canvas point (u, v) over the film's map under `film`, as the same map point on the spaced map under `spaced`. */
export const spacedPoint = (film: MapCamera, spaced: MapCamera, u: number, v: number): [number, number] => {
  const [x, z] = toSpaced(...groundAt(film, u, v));
  const p = projectToCanvas(spaced, x, 0, z);
  return [p[0], p[1]];
};

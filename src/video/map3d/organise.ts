// What the film's Organise moves change on the map, by film time (tracked on the film). Twice over:
// 1. Organise (102–109 s, the map stays organised after): Course Access Removed is picked up and dragged from 05 · Retention
//    & Feedback into 04 · Client Onboarding & Learning (04 lights up as the drop target); 08 · Tag-Based Routing is lifted
//    and dragged 1.4 down into 07 · Contact Segmentation, which grows around it; 04 is coloured yellow.
// 2. Organise and document (208–236 s, from the unorganised map): 04 is coloured yellow, then 08 is dragged into 07.
// Mirrored for the film analysis in scripts/map_film/organise.py; keep the two in step. These are film coordinates; the
// video draws them on the spaced map (spacing.ts) through `spacedOrganiseNodes` and `spacedOrganiseRig`.
import { transform } from "motion";
import { easeInOut } from "../anim";
import type { MapPlane, NodeLook } from "./MapScene";
import { SPACED, toSpaced } from "./spacing";

type Keys = [number, number, number][];
/** A folder nest: 08's offset keyframes [t, dx, dz] (tracked on the film: it is carried over 07, dropped, and the layout
 * snaps it into place as 07 grows), its pick-up (lift) window, 07's drop-target window and its growth. */
type Nest = { offset: Keys; lift: number[]; drop: number[]; grow: number[]; recolour: number };
const NESTS: { range: [number, number]; nest: Nest }[] = [
  { range: [100, 190], nest: { offset: [[105.0, 0, 0], [105.07, 0, 0.07], [105.2, 0.47, 0.2], [105.33, 1.22, 0.55], [105.47, 1.85, 0.82], [105.6, 2.13, 0.96], [105.73, 2.21, 0.98], [105.87, 2.08, 1.01], [105.9, 2.08, 1.01], [106.0, 0, 1.4]], lift: [104.95, 105.05, 105.87, 105.97], drop: [105.45, 105.6, 105.85, 105.95], grow: [105.9, 106.0], recolour: 108.9 } },
  { range: [208, 240], nest: { offset: [[212.95, 0, 0], [213.0, 0.21, 0.09], [213.07, 0.45, 0.19], [213.13, 0.75, 0.33], [213.2, 1.17, 0.53], [213.8, 1.15, 1.18], [213.87, -0.12, 1.09], [213.93, -0.31, 1.03], [214.5, -0.31, 1.03], [214.6, 0, 1.4]], lift: [212.95, 213.05, 213.85, 213.95], drop: [213.4, 213.5, 213.85, 213.95], grow: [214.5, 214.6], recolour: 210.77 } },
];
type Rect = { x0: number; z0: number; x1: number; z1: number };
/** 07 before and after it grows around 08, and how far 08 drops (its final dz). */
type Nesting = { before: Rect; grown: Rect; drop: number };
const SEGMENT: Nesting = { before: { x0: 0, z0: 9.5, x1: 7, z1: 15 }, grown: { x0: -7.8, z0: 8.4, x1: 7, z1: 15.2 }, drop: 1.4 };
/** The same nesting on the spaced map, by the film's rule: 08 drops until its top edge is 0.6 above 07's, and 07 grows to
 * 0.8 left of 08, 0.5 above it and 0.2 past its own far edge. */
const SPACED_SEGMENT: Nesting = (() => {
  const seg = SPACED.planes.segment, tag = SPACED.planes.tagroute, drop = seg.z0 - 0.6 - tag.z0;
  return { before: seg, grown: { x0: tag.x0 - 0.8, z0: Math.min(seg.z0, tag.z0 + drop) - 0.5, x1: seg.x1, z1: Math.max(seg.z1, tag.z1 + drop) + 0.2 }, drop };
})();

/** The workflow drag, tracked on the film: world (x, z) by film time; picked up (hover lift) over `lift`. */
const MOVE = { id: "course-access-removed", range: [100, 190], lift: [102.17, 102.27, 103.27, 103.47],
  path: [[102.2, -3.24, 4.38], [102.3, -3.02, 4.2], [102.4, -2.2, 3.87], [102.5, -0.5, 3.24], [102.633, 3.59, 1.35], [102.733, 8.08, 0.26],
    [102.833, 10.69, -1.09], [102.933, 12.49, -1.76], [103.0, 13.13, -2.01], [103.1, 13.56, -2.17], [103.2, 13.62, -2.2], [103.47, 13.7, -2.11]] };

/** Node look overrides for the workflow Organise moves, at film time `ft`. */
export const organiseNodes = (ft: number): Record<string, NodeLook> => {
  if (ft < MOVE.range[0] || ft > MOVE.range[1]) return {};
  const ts = MOVE.path.map((p) => p[0]);
  return { [MOVE.id]: { x: transform(ft, ts, MOVE.path.map((p) => p[1])), z: transform(ft, ts, MOVE.path.map((p) => p[2])),
    hover: transform(ft, MOVE.lift, [0, 1, 1, 0]) } };
};

/** `organiseNodes` on the spaced map: the drag's path carried over by `toSpaced`, bent onto the cell spacing.ts keeps for
 * it in 04 by the time it lands. */
export const spacedOrganiseNodes = (ft: number): Record<string, NodeLook> => {
  const film = organiseNodes(ft)[MOVE.id];
  if (!film) return {};
  const end = MOVE.path[MOVE.path.length - 1], [ex, ez] = toSpaced(end[1], end[2]), cell = SPACED.nodes["course-access-removed@onboard"];
  const [x, z] = toSpaced(film.x!, film.z!), k = transform(ft, [MOVE.path[0][0], end[0]], [0, 1], { ease: easeInOut });
  return { [MOVE.id]: { ...film, x: x + (cell.x - ex) * k, z: z + (cell.z - ez) * k } };
};

/** Plane look overrides for the folders Organise moves, at film time `ft` (`nesting`: the spaced map's, for the video). */
export const organiseRig = (ft: number, nesting = SEGMENT): Record<string, Partial<MapPlane>> => {
  const scene = NESTS.find((n) => ft >= n.range[0] && ft <= n.range[1]);
  if (!scene) return {};
  const n = scene.nest, ts = n.offset.map((k) => k[0]);
  const grow = transform(ft, n.grow, [0, 1], { ease: easeInOut });
  const k = (a: number, b: number) => a + (b - a) * grow;
  const B = nesting.before, G = nesting.grown, dz = nesting.drop / SEGMENT.drop;
  const move = scene.range[0] === 100 ? { dropTarget: transform(ft, [102.75, 102.85, 103.2, 103.35], [0, 1, 1, 0]) } : {};
  return {
    onboard: { ...move, ...(ft >= n.recolour ? { color: "yellow" } : {}) },
    tagroute: { dx: transform(ft, ts, n.offset.map((o) => o[1])), dz: transform(ft, ts, n.offset.map((o) => o[2] * dz)),
      lift: transform(ft, n.lift, [0, 1, 1, 0]), depth: ft >= n.grow[0] ? 1 : 0 },
    segment: { dropTarget: transform(ft, n.drop, [0, 1, 1, 0]), x0: k(B.x0, G.x0), z0: k(B.z0, G.z0), x1: k(B.x1, G.x1), z1: k(B.z1, G.z1) },
  };
};

export const spacedOrganiseRig = (ft: number) => organiseRig(ft, SPACED_SEGMENT);

/** The folder being carried at film time `ft`, if any: its nodes stay as they were before it was picked up. */
export const carriedPlane = (ft: number): { plane: string; since: number } | null => {
  const scene = NESTS.find((n) => ft >= n.range[0] && ft <= n.range[1]);
  if (!scene || ft < scene.nest.lift[0] || ft > scene.nest.lift[3] + 0.1) return null;
  return { plane: "tagroute", since: scene.nest.lift[0] };
};

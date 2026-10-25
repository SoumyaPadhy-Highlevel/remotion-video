// The map in "Plan it" (assets/PlanAssets.tsx), drawn with the product's renderer like the film's map shots (MapShots.tsx):
// a plan gives its cameras (in the film's camera terms, so they read like the film's scenes, on the spaced map: `fromFilm`
// carries a film camera over), which node is selected when and
// what that lights, and where the drawer and the preview cover it. The film's filter pills and toolbars stay visible.
import React from "react";
import { EdgeLook, MapArc, MapPlane, MapScene, MapView, NodeLook } from "./MapScene";
import { MAP_WORLDS, toSpaced } from "./spacing";

/** The film's map canvas in the 1620×880 window (WM.CANVAS) and the right drawer's left edge (app.css .wd). */
const CANVAS = { left: 60, top: 76, width: 1548, height: 792, radius: 8 };

type FilmCam = { wx: number; wz: number; sx: number; sy: number; z: number };
/** The film's camera as the renderer's: same isometric axes (direction (7, 9, 8)), s = 79.2 px per unit at zoom 1. */
const toCam = (c: FilmCam) => {
  const s = 79.2 * c.z;
  return { cx: c.sx - s * (0.753 * c.wx - 0.659 * c.wz) - CANVAS.left, cy: c.sy - s * (0.426 * c.wx + 0.486 * c.wz) - CANVAS.top, s };
};
const cb = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0, hi = 1, s = x;
  for (let i = 0; i < 22; i++) {
    s = (lo + hi) / 2;
    const bx = 3 * x1 * s * (1 - s) * (1 - s) + 3 * x2 * s * s * (1 - s) + s * s * s;
    if (bx < x) lo = s; else hi = s;
  }
  return 3 * y1 * s * (1 - s) * (1 - s) + 3 * y2 * s * s * (1 - s) + s * s * s;
};
/** The product's LAYOUT_SPRING as the film eases it (WM.layoutEase). */
const layoutEase = cb(0.22, 0.68, 0, 1);
const camMix = (A: FilmCam, B: FilmCam, p: number): FilmCam => ({ wx: A.wx + (B.wx - A.wx) * p, wz: A.wz + (B.wz - A.wz) * p, sx: A.sx + (B.sx - A.sx) * p,
  sy: A.sy + (B.sy - A.sy) * p, z: Math.exp(Math.log(A.z) + (Math.log(B.z) - Math.log(A.z)) * p) });
const camPath = (keys: { t: number; from?: number; cam: FilmCam }[], t: number) => {
  if (t <= keys[0].t) return keys[0].cam;
  for (let i = 1; i < keys.length; i++) {
    const A = keys[i - 1], B = keys[i];
    if (t <= B.t) {
      const from = B.from ?? A.t;
      return t <= from ? A.cam : camMix(A.cam, B.cam, layoutEase((t - from) / (B.t - from)));
    }
  }
  return keys[keys.length - 1].cam;
};
const cursorPos = (keys: { t: number; at: [number, number]; bow?: number }[], t: number): [number, number] => {
  if (t <= keys[0].t) return keys[0].at;
  for (let i = 1; i < keys.length; i++) {
    const A = keys[i - 1], B = keys[i];
    if (t <= B.t) {
      const p = (t - A.t) / (B.t - A.t), e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const dx = B.at[0] - A.at[0], dy = B.at[1] - A.at[1], bw = (B.bow ?? 0) * Math.sin(Math.PI * e);
      return [A.at[0] + dx * e - dy * bw, A.at[1] + dy * e + dx * bw];
    }
  }
  return keys[keys.length - 1].at;
};
const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const eo = (x: number) => 1 - Math.pow(1 - x, 3);

/** Film UI that sits on the map canvas (MapShots.tsx FIXED_UI): the filter pills and the two bottom toolbars. */
const FIXED_UI = [[76, 92, 768, 31], [76, 815, 223, 38], [1238, 815, 358, 38]];
const holesMask = (rects: number[][], w: number, h: number) => {
  const holes = rects.map(([x, y, rw, rh]) => `M${x - CANVAS.left} ${y - CANVAS.top}h${rw}v${rh}h${-rw}z`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path fill-rule="evenodd" d="M0 0H${w}V${h}H0z${holes}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** A world point (map units) in window px under a film camera. */
export const filmProject = (c: FilmCam, x: number, y: number, z: number): [number, number] => {
  const s = 79.2 * c.z, dx = x - c.wx, dz = z - c.wz;
  return [c.sx + s * (0.753 * dx - 0.659 * dz), c.sy + s * (0.426 * dx + 0.486 * dz - 0.763 * y)];
};
export const camAt = (plan: AssetsPlan, t: number) => camPath(plan.cams, t);
/** A film camera on the spaced map (spacing.ts): the map point it centres carried over, the same zoom. */
export const fromFilm = (c: FilmCam): FilmCam => {
  const [wx, wz] = toSpaced(c.wx, c.wz);
  return { ...c, wx, wz };
};
/** The camera that frames world points (`frameNodes`) in the canvas left of `right` (window px), `pad` px in from its
 * edges, no closer than zoom `maxZ`. */
export const frameCam = (pts: { x: number; z: number }[], right: number, pad: number, maxZ: number): FilmCam => {
  const us = pts.map((p) => 0.753 * p.x - 0.659 * p.z), vs = pts.map((p) => 0.426 * p.x + 0.486 * p.z);
  const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
  const z = Math.min(maxZ, (right - CANVAS.left - 2 * pad) / (79.2 * Math.max(u1 - u0, 1e-6)), (CANVAS.height - 2 * pad) / (79.2 * Math.max(v1 - v0, 1e-6)));
  // the middle of the points' screen extent: solve 0.753x − 0.659z = um, 0.426x + 0.486z = vm
  const um = (u0 + u1) / 2, vm = (v0 + v1) / 2, det = 0.753 * 0.486 + 0.659 * 0.426;
  return { wx: (um * 0.486 + 0.659 * vm) / det, wz: (0.753 * vm - 0.426 * um) / det, sx: (CANVAS.left + right) / 2, sy: CANVAS.top + CANVAS.height / 2, z };
};
export { cursorPos };

export const AssetsMap: React.FC<{ t: number; plan: AssetsPlan }> = ({ t, plan }) => {
  const cam = toCam(camPath(plan.cams, t));
  const world = plan.world ?? MAP_WORLDS.main;
  const sel = plan.select.map(([a, b]) => eo(seg(t, a, a + 0.3)) * (b == null ? 1 : 1 - eo(seg(t, b, b + 0.3))));
  const looks: Record<string, NodeLook> = {}, edgeLooks: Record<string, EdgeLook> = {}, planeLooks: Record<string, Partial<MapPlane>> = {};
  const anySel = Math.max(0, ...sel.map((k, i) => (plan.groups[i].dims ? k : 0)));
  for (const n of world.nodes) {
    const lit = Math.min(1, sel.reduce((s, k, i) => s + (plan.groups[i].lit.includes(n.id) ? k : 0), 0));
    const selected = Math.min(1, sel.reduce((s, k, i) => s + (plan.groups[i].selected === n.id ? k : 0), 0));
    looks[n.id] = { dim: Math.max(0, anySel - lit), selected };
  }
  for (const e of world.edges) {
    const lit = Math.min(1, sel.reduce((s, k, i) => s + (plan.groups[i].lit.includes(e.from) && plan.groups[i].lit.includes(e.to) ? k : 0), 0));
    edgeLooks[`${e.from}>${e.to}`] = { lit, dim: Math.max(0, anySel - lit) };
  }
  // the drawer covers the map on the right while it is open; the preview covers all of it
  for (const p of world.planes) planeLooks[p.id] = {};
  const ui = plan.drawer(t) > 0.01 ? FIXED_UI.slice(0, 2) : FIXED_UI;
  return (
    <div style={{ position: "absolute", left: CANVAS.left, top: CANVAS.top, width: CANVAS.width, height: CANVAS.height, overflow: "hidden", borderRadius: CANVAS.radius,
      maskImage: holesMask(ui, CANVAS.width, CANVAS.height), WebkitMaskImage: holesMask(ui, CANVAS.width, CANVAS.height), maskSize: "100% 100%" }}>
      <MapView scene={world} width={CANVAS.width} height={CANVAS.height} camera={cam} t={t} looks={looks} edgeLooks={edgeLooks} planeLooks={planeLooks} arcs={plan.arcs?.(t)} />
    </div>
  );
};

/** One scene's plan: cameras, which node is selected when (`select[i]` = [on, off]) and what it lights, and the drawer's
 *  opacity (the right toolbar is under it). */
export type AssetsPlan = {
  cams: { t: number; from?: number; cam: FilmCam }[];
  select: [number, number | null][];
  groups: { selected: string; lit: string[]; dims: boolean }[];
  drawer: (t: number) => number;
  /** the world to draw (default: the main map, spaced) — keep it one object, the renderer rebuilds when it changes */
  world?: MapScene;
  /** cross-folder usage arcs ("Show usage on map") */
  arcs?: (t: number) => MapArc[];
};
export type { FilmCam };

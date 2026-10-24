// The film's 3D map, redrawn with the product's own renderer (MapScene.tsx) wherever the film shows it, keyed to film time
// like the builder redraws (builder/scenes.tsx). The camera, every node's and folder's look, and where the film's own UI
// sits over the map come from the film itself (scripts/map_film → filmMap.ts); the film keeps its panels, toolbars and
// sticky notes, and the map under them is the product's.
import React from "react";
import { transform } from "motion";
import { easeInOut, springAt } from "../anim";
import { BUILD } from "../script";
import { EdgeLook, MapPlane, MapView, NodeLook } from "./MapScene";
import { FILM_MAP_SHOTS, FILM_WORLDS, FilmMapShot } from "./filmMap";
import { carriedPlane, organiseNodes, organiseRig } from "./organise";
import { Cursor } from "../builder/shotKit";

/** The map canvas in the 1620×880 window (measured on the film): its white board with 12 px corners. */
const CANVAS = { left: 60, top: 76, width: 1548, height: 792, radius: 12 };
/** Film UI that always sits on the canvas: the filter pills and the two bottom toolbars. */
const FIXED_UI = [[76, 92, 768, 31], [76, 815, 223, 38], [1238, 815, 358, 38]];

const decoded = new Map<string, string>();
/** "c12g4" → "ccccccccccccgggg", cached. */
const unrle = (s: string) => {
  let d = decoded.get(s);
  if (d == null) {
    d = "";
    for (const m of s.matchAll(/(.)(\d+)/g)) d += m[1].repeat(Number(m[2]));
    decoded.set(s, d);
  }
  return d;
};

/** The state at frame i, the state before the current run, and how long the current run has lasted (s). */
const runAt = (states: string, i: number) => {
  const k = Math.max(0, Math.min(states.length - 1, i)), cur = states[k];
  let j = k;
  while (j > 0 && states[j - 1] === cur) j--;
  return { cur, prev: j > 0 ? states[j - 1] : cur, age: (k - j) / 30 };
};

/** A value easing from its previous state's level to the current one's (the product's springs, no bounce). */
const ease = (from: number, to: number, age: number, duration: number) => from + (to - from) * Math.min(1, springAt(age, 0, duration, 0));

/** The map build ("How the map works", script.ts BUILD; film scene "map", bT = 0 at BUILD.at): the film keeps the drop's
 *  map up until bT 0.6, then its nodes clear while the folders dim to 0.45 (never a blank window, scene-map.js clrB/islIn) and
 *  come back up as each one lands. The film analysis was taken before that change (nodes and folders gone from bT 0), so the
 *  clear is redrawn here: `k` 0 → 1 over bT 0.6–1.25. */
const buildClear = (ft: number) => {
  const bT = ft + 3.9 - BUILD.at;
  return bT >= 0 && bT < 9.6 ? { bT, k: transform(bT, [0.6, 1.25], [0, 1], { ease: easeInOut }) } : null;
};

const shotAt = (ft: number) => FILM_MAP_SHOTS.find((s) => ft >= s.from - 1e-6 && ft < s.from + s.frames / 30);

const looksAt = (shot: FilmMapShot, i: number) => {
  const looks: Record<string, NodeLook> = {};
  const state: Record<string, string> = {};
  for (const [id, rl] of Object.entries(shot.nodes)) {
    const { cur, prev, age } = runAt(unrle(rl), i);
    state[id] = cur;
    const level = (c: string) => ({ dim: c === "g" ? 1 : 0, sel: c === "s" ? 1 : 0, op: c === "-" ? 0 : 1 });
    const a = level(prev), b = level(cur);
    looks[id] = { dim: ease(a.dim, b.dim, age, 0.45), selected: ease(a.sel, b.sel, age, 0.4), opacity: ease(a.op, b.op, age, 0.25) };
  }
  return { looks, state };
};

const edgeLooksAt = (shot: FilmMapShot, state: Record<string, string>) => {
  // a lit set (a selection, or a contact's route, which greys out everything else): its links animate
  const anySelected = Object.values(state).some((c) => c === "s") || (Object.values(state).includes("g") && Object.values(state).includes("c"));
  const looks: Record<string, EdgeLook> = {};
  for (const e of FILM_WORLDS[shot.world].edges) {
    const a = state[e.from], b = state[e.to];
    const lit = anySelected && (a === "s" || b === "s" || (a === "c" && b === "c")) && a !== "g" && b !== "g" && a !== "-" && b !== "-";
    looks[`${e.from}>${e.to}`] = { lit: lit ? 1 : 0, dim: (anySelected && !lit) || a === "g" || b === "g" ? 1 : 0 };
  }
  return looks;
};

const planeLooksAt = (shot: FilmMapShot, i: number, state: Record<string, string>) => {
  const looks: Record<string, Partial<MapPlane>> = {};
  const scene = FILM_WORLDS[shot.world];
  for (const [id, rl] of Object.entries(shot.planes)) {
    // a default-coloured folder has a white face, which the film can't tell from the ground: it is there while its nodes are
    if (!scene.planes.find((p) => p.id === id)?.color) {
      const shown = scene.nodes.some((n) => n.plane === id && state[n.id] && state[n.id] !== "-");
      looks[id] = { opacity: shown ? 1 : 0 };
      continue;
    }
    const { cur, prev, age } = runAt(unrle(rl), i);
    looks[id] = { opacity: ease(prev === "-" ? 0 : 1, cur === "-" ? 0 : 1, age, 0.3) };
  }
  return looks;
};

/** A mask with an even-odd hole for each rect (board px): masks read alpha, so holes hand those pixels to the film. */
const holesMask = (rects: number[][]) => {
  if (!rects.length) return undefined;
  const holes = rects.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.width}" height="${CANVAS.height}"><path fill-rule="evenodd" d="M0 0H${CANVAS.width}V${CANVAS.height}H0z${holes}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** The redrawn map at film time `ft`, in window px (inside the 1620×880 app window, over the film), or nothing. */
export const MapShots: React.FC<{ ft: number; cursor?: boolean }> = ({ ft, cursor = true }) => {
  const shot = shotAt(ft);
  if (!shot) return null;
  const i = Math.min(shot.frames - 1, Math.round((ft - shot.from) * 30));
  const [cx, cy, s] = shot.cams.slice(i * 3, i * 3 + 3);
  if (!s) return null;
  const { looks, state } = looksAt(shot, i);
  // the build's clear (buildClear): until bT 1.25 the nodes keep their look from just before it, fading out with `k`
  const build = buildClear(ft);
  if (build && build.bT < 1.25) {
    const pre = looksAt(shot, Math.max(0, i - Math.round(build.bT * 30) - 1));
    for (const [id, l] of Object.entries(pre.looks)) { looks[id] = { ...l, opacity: (l.opacity ?? 1) * (1 - build.k) }; state[id] = pre.state[id]; }
  }
  for (const [id, l] of Object.entries(organiseNodes(ft))) looks[id] = { ...looks[id], ...l };
  // a carried folder moves faster than the film can be read: its nodes keep the look they had when it was picked up
  const carried = carriedPlane(ft);
  if (carried) {
    const before = looksAt(shot, Math.max(0, Math.round((carried.since - shot.from) * 30) - 1));
    for (const n of FILM_WORLDS[shot.world].nodes) if (n.plane === carried.plane) { looks[n.id] = before.looks[n.id]; state[n.id] = before.state[n.id]; }
  }
  const scene = FILM_WORLDS[shot.world];
  const planeLooks = planeLooksAt(shot, i, state);
  for (const [id, rig] of Object.entries(organiseRig(ft))) planeLooks[id] = { ...planeLooks[id], ...rig };
  if (carried) planeLooks[carried.plane] = { ...planeLooks[carried.plane], opacity: 1 };
  // the build's folders: dimmed, not gone, until each lands (the film's islIn)
  if (build) for (const id of Object.keys(planeLooks)) planeLooks[id] = { ...planeLooks[id], opacity: Math.max(planeLooks[id].opacity ?? 1, 1 - 0.55 * build.k) };
  const left = unrle(shot.left).charCodeAt(i) - 65, right = unrle(shot.right).charCodeAt(i) - 65;
  const ui = [
    ...FIXED_UI,
    ...(left > 0 ? [[0, 0, left * 10 + 2, 880]] : []),
    ...(right > 0 ? [[right * 25 - 4, 0, 1620, 880]] : []),
    ...shot.notes.filter((n) => n[0] === i).map((n) => n.slice(1)),
  ].map(([x, y, w, h]) => [x - CANVAS.left, y - CANVAS.top, w, h]);
  const fade = Math.min(transform(ft, [shot.from, shot.from + 0.001], [0, 1]), 1);
  const [mx, my] = shot.cursor.slice(i * 2, i * 2 + 2);
  return (<>
    <div style={{ position: "absolute", left: CANVAS.left, top: CANVAS.top, width: CANVAS.width, height: CANVAS.height, borderRadius: CANVAS.radius,
      overflow: "hidden", opacity: fade, maskImage: holesMask(ui), maskSize: "100% 100%" }}>
      <MapView scene={scene} width={CANVAS.width} height={CANVAS.height} camera={{ cx: cx - CANVAS.left, cy: cy - CANVAS.top, s }} t={ft}
        looks={looks} edgeLooks={edgeLooksAt(shot, state)} planeLooks={planeLooks} />
    </div>
    {/* the film's cursor, back on top of the redrawn map (outside the film's own panels, which keep theirs) */}
    {cursor && mx >= 0 && (left <= 0 || mx > left * 10 + 2) && (right <= 0 || mx < right * 25 - 4) ? <Cursor x={mx} y={my} /> : null}
  </>);
};

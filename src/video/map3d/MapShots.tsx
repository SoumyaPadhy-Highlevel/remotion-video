// The film's 3D map, redrawn with the product's own renderer (MapScene.tsx) wherever the film shows it, keyed to film time
// like the builder redraws (builder/scenes.tsx). The camera, every node's and folder's look, and where the film's own UI
// sits over the map come from the film itself (scripts/map_film → filmMap.ts); the film keeps its panels, toolbars and
// sticky notes, and the map under them is the product's.
import React from "react";
import { transform } from "motion";
import { easeInOut, easeOut, springAt } from "../anim";
import { BUILD } from "../script";
import { EdgeLook, MapPlane, MapView, NodeLook, projectToCanvas } from "./MapScene";
import { FILM_MAP_SHOTS, FILM_WORLDS, FilmMapShot } from "./filmMap";
import { carriedPlane, organiseNodes, organiseRig } from "./organise";
import { Cursor } from "../builder/shotKit";
import { sampleFilmTrack } from "./sampleFilmTrack";

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

/** Organise's documentation notes (film scene "orgdoc", from frame 6245). The film draws each note with a leader line to its
 *  workflow, but the redraw covers the line, and a note faded during the journey is too pale for ui.py to find. So each note
 *  gets a hole where its card is (anchor + `off`, `size`, window px, measured on the film against this shot's camera) from
 *  `at`, and its leader line is drawn again on top, timed as the film's (scene-orgdoc.js docAt / litAt, orgdoc seconds). */
const ORGDOC_T0 = 6245 / 30;
const DOC_NOTES: { anchor: string; off: [number, number]; size: [number, number]; color: string; at: number; lit?: number }[] = [
  { anchor: "plane:lead-mgmt", off: [172, -141], size: [309, 130], color: "#facc15", at: 14.1 },
  { anchor: "priority-assignment", off: [-411, -51], size: [281, 175], color: "#9ca3af", at: 17.4, lit: 22.3 },
  { anchor: "medium-priority", off: [236, -130], size: [263, 154], color: "#facc15", at: 18.2, lit: 23.8 },
  { anchor: "consultation-handoff", off: [107, -20], size: [262, 131], color: "#60a5fa", at: 19.0, lit: 25.3 },
];
const docNotes = (shot: FilmMapShot, ft: number, cam: { cx: number; cy: number; s: number }) => {
  if (shot.world !== "orgdoc") return [];
  const t = ft - ORGDOC_T0, scene = FILM_WORLDS[shot.world];
  const dim = transform(t, [21.0, 21.4], [0, 1], { ease: easeOut });
  return DOC_NOTES.filter((d) => t >= d.at - 0.25).map((d) => {
    let b: [number, number];
    if (d.anchor.startsWith("plane:")) { const pl = scene.planes.find((p) => p.id === d.anchor.slice(6))!; b = projectToCanvas(cam, pl.x0, 0, pl.z0) as [number, number]; }
    else { const n = scene.nodes.find((m) => m.id === d.anchor)!; b = projectToCanvas(cam, n.x, 0.3, n.z) as [number, number]; }
    const rect = [b[0] + d.off[0], b[1] + d.off[1], d.size[0], d.size[1]];
    // the card without its 3 px padding; the line runs from the workflow to the card's nearest point
    const [x, y, w, h] = [rect[0] + 3, rect[1] + 3, rect[2] - 6, rect[3] - 6];
    const c = [Math.min(Math.max(b[0], x), x + w), Math.min(Math.max(b[1], y), y + h)];
    const draw = d.lit == null ? transform(t, [d.at, d.at + 0.3], [0, 1], { ease: easeOut }) : transform(t, [d.at - 0.25, d.at + 0.1], [0, 1], { ease: easeOut });
    const lit = d.lit == null ? 1 : 1 - dim * (1 - transform(t, [d.lit, d.lit + 0.25], [0, 1], { ease: easeOut })) * 0.72;
    return { rect: t >= d.at ? rect : null, line: { x1: b[0], y1: b[1], x2: b[0] + (c[0] - b[0]) * draw, y2: b[1] + (c[1] - b[1]) * draw, color: d.color, opacity: draw > 0.01 ? 0.9 * lit : 0 } };
  });
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
const holesMask = (rects: number[][], board = CANVAS) => {
  if (!rects.length) return undefined;
  const holes = rects.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${board.width}" height="${board.height}"><path fill-rule="evenodd" d="M0 0H${board.width}V${board.height}H0z${holes}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** The redrawn map at film time `ft`, in window px (inside the 1620×880 app window, over the film), or nothing. `board` and
 * `fixedUi` replace the canvas rect and the film UI left to show on it (window px), for a layout the film analysis does not
 * know (the Assistant's, assistant/: the canvas beside the redrawn panel). */
export const MapShots: React.FC<{ ft: number; cursor?: boolean; board?: typeof CANVAS; fixedUi?: number[][] }> = ({ ft, cursor = true, board = CANVAS, fixedUi = FIXED_UI }) => {
  const shot = shotAt(ft);
  if (!shot) return null;
  const i = Math.min(shot.frames - 1, Math.round((ft - shot.from) * 30));
  const sample = Math.max(0, Math.min(shot.frames - 1, (ft - shot.from) * 30));
  const [cx, cy, s] = sampleFilmTrack(shot.cams, sample, 3);
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
  const doc = docNotes(shot, ft, { cx, cy, s }), docRects = doc.flatMap((d) => (d.rect ? [d.rect] : []));
  const ui = [
    ...fixedUi,
    ...(left > 0 ? [[0, 0, left * 10 + 2, 880]] : []),
    ...(right > 0 ? [[right * 25 - 4, 0, 1620, 880]] : []),
    // one hole per note: the holes mask is even-odd, so a detected rect overlapping a docNotes card would cancel its hole out
    ...shot.notes.filter((n) => n[0] === i).map((n) => n.slice(1)).filter(([x, y, w, h]) => !docRects.some(([X, Y, W, H]) => x < X + W && X < x + w && y < Y + H && Y < y + h)),
    ...docRects,
  ].map(([x, y, w, h]) => [x - board.left, y - board.top, w, h]);
  const fade = Math.min(transform(ft, [shot.from, shot.from + 0.001], [0, 1]), 1);
  // Never interpolate a visible cursor into the film's hidden-cursor sentinel.
  const ca = Math.floor(sample), cb = Math.min(shot.frames - 1, ca + 1);
  const [mx, my] = shot.cursor[ca * 2] >= 0 && shot.cursor[cb * 2] >= 0
    ? sampleFilmTrack(shot.cursor, sample, 2) : shot.cursor.slice(i * 2, i * 2 + 2);
  return (<>
    <div style={{ position: "absolute", left: board.left, top: board.top, width: board.width, height: board.height, borderRadius: board.radius,
      overflow: "hidden", opacity: fade, maskImage: holesMask(ui, board), maskSize: "100% 100%" }}>
      <MapView scene={scene} width={board.width} height={board.height} camera={{ cx: cx - board.left, cy: cy - board.top, s }} t={ft}
        looks={looks} edgeLooks={edgeLooksAt(shot, state)} planeLooks={planeLooks} />
    </div>
    {/* Organise's leader lines (docNotes), over the redrawn map and clipped to its canvas */}
    {doc.length ? <svg width={1620} height={880} style={{ position: "absolute", left: 0, top: 0, opacity: fade, clipPath: `inset(${CANVAS.top}px ${1620 - CANVAS.left - CANVAS.width}px ${880 - CANVAS.top - CANVAS.height}px ${CANVAS.left}px round ${CANVAS.radius}px)` }}>
      {doc.map((d, k) => <line key={k} x1={d.line.x1} y1={d.line.y1} x2={d.line.x2} y2={d.line.y2} stroke={d.line.color} strokeWidth={1.6} strokeLinecap="round" opacity={d.line.opacity} />)}
    </svg> : null}
    {/* the film's cursor, back on top of the redrawn map (outside the film's own panels, which keep theirs) */}
    {cursor && mx >= 0 && (left <= 0 || mx > left * 10 + 2) && (right <= 0 || mx < right * 25 - 4) ? <Cursor x={mx} y={my} /> : null}
  </>);
};

// The spaced map keeps every label clear of every other label and node, wherever it is drawn. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { FILM_WORLDS } from "./filmMap";
import { collisions, labelBoxes } from "./labelBoxes";
import { MapCamera, MapScene, projectToCanvas } from "./MapScene";
import { FILM_LABEL_S, LABEL_SAFE_S, MAP_EXTRAS, MAP_WORLDS, SPACED, spacedCamera, toSpaced } from "./spacing";
import { spacedOrganiseNodes, spacedOrganiseRig } from "./organise";
import { revealWorld } from "../reveal/world";
import { ACT_WORLD, MOVED } from "../assistant/actWorld";

const GAP = 10;
const at = (s: number): MapCamera => ({ cx: 800, cy: 400, s });
const clear = (name: string, w: MapScene, s: number, zoomH = 792) => {
  const hits = collisions(labelBoxes(w, at(s), zoomH), GAP).map(([a, b]) => `${a.kind} ${a.id} × ${b.kind} ${b.id}`);
  assert.deepEqual(hits, [], `${name} at s = ${s}`);
};
const CANVAS = { left: 60, top: 76, width: 1548, height: 792 };

test("no label touches another label or node, from the label-safe zoom in", () => {
  for (const [name, w] of Object.entries(MAP_WORLDS)) for (const s of [LABEL_SAFE_S, FILM_LABEL_S, 45, 60, 80, 120]) clear(name, w, s);
  // the Assistant's map, before and after its five workflows move into the new folder
  const moved = { ...ACT_WORLD, nodes: ACT_WORLD.nodes.map((n) => (MOVED[n.id] ? { ...n, ...MOVED[n.id] } : n)) };
  for (const s of [LABEL_SAFE_S, 60]) { clear("act", ACT_WORLD, s); clear("act, moved", moved, s); }
});

test("the reveal shows its labels clear at the zoom it frames the whole map", () => {
  // MapRevealTease's canvas (1663 × 851) and its camera, pushing in from 0.95 × the fit that holds every folder: the
  // first workflows land at 0.975 of it, the asset types at the full fit
  const w = revealWorld(MAP_WORLDS.main), W = 1548 * 1740 / 1620, H = 792 * 1740 / 1620;
  const uv = w.planes.flatMap((p) => [[p.x0, p.z0], [p.x1, p.z0], [p.x0, p.z1], [p.x1, p.z1]].map(([x, z]) => projectToCanvas(at(1), x, 0.2, z)));
  const span = (k: 0 | 1) => Math.max(...uv.map((p) => p[k])) - Math.min(...uv.map((p) => p[k]));
  const fit = Math.min((W * 0.96) / span(0), (H * 0.78) / span(1));
  for (const k of [0.975, 1]) clear("reveal", w, fit * k, H);
});

test("every node sits in its folder, and folders keep 1.5 apart", () => {
  for (const [name, w] of Object.entries(MAP_WORLDS)) {
    for (const n of w.nodes) {
      const p = w.planes.find((q) => q.id === n.plane)!;
      assert.ok(n.x >= p.x0 + 0.99 && n.x <= p.x1 - 0.99 && n.z >= p.z0 + 0.99 && n.z <= p.z1 - 0.99, `${name}: ${n.id} inside ${p.id}`);
    }
    for (const a of w.planes) for (const b of w.planes) {
      if (a === b) continue;
      const apart = a.x1 + 1.5 <= b.x0 + 1e-9 || b.x1 + 1.5 <= a.x0 + 1e-9 || a.z1 + 1.5 <= b.z0 + 1e-9 || b.z1 + 1.5 <= a.z0 + 1e-9;
      assert.ok(apart, `${name}: ${a.id} and ${b.id}`);
    }
  }
  for (const id of Object.keys(MAP_EXTRAS)) assert.ok(SPACED.nodes[id], id);
});

test("film points land on their spaced places", () => {
  for (const n of FILM_WORLDS.main.nodes) assert.deepEqual(toSpaced(n.x, n.z).map((v) => +v.toFixed(6)), [SPACED.nodes[n.id].x, SPACED.nodes[n.id].z]);
  const p = FILM_WORLDS.main.planes.find((q) => q.id === "lead")!;
  assert.deepEqual(toSpaced(p.x1, p.z1).map((v) => +v.toFixed(6)), [SPACED.planes.lead.x1, SPACED.planes.lead.z1]);
});

test("a film camera frames the same nodes on the spaced map", () => {
  // the film's whole-map shot (film 90 s): every folder stays in the canvas, labels on at a label-safe zoom
  const wide = spacedCamera({ cx: 830.7, cy: 344, s: 40.5 }, CANVAS);
  assert.ok(wide.labels && wide.s >= LABEL_SAFE_S && wide.s <= 40.5);
  // a close-up never zooms in past the film, and a small camera move moves the spaced camera a little
  const near = { cx: 600, cy: 200, s: 80 }, a = spacedCamera(near, CANVAS), b = spacedCamera({ ...near, cx: near.cx + 1 }, CANVAS);
  assert.ok(a.s <= 80 && a.s >= LABEL_SAFE_S);
  assert.ok(Math.hypot(b.cx - a.cx, b.cy - a.cy) < 3 && Math.abs(b.s - a.s) < 0.5);
  // the label floor eases in: a film zoom through the label threshold is one zoom, never more than twice as fast
  const film = [28, 30, 33, 36, 39, 39.59, 39.6, 41], scales = film.map((s) => spacedCamera({ cx: 830, cy: 344, s }, CANVAS).s);
  scales.slice(1).forEach((s, i) => assert.ok(s >= scales[i] && s - scales[i] <= 2 * (film[i + 1] - film[i]) + 1e-9, `${scales}`));
});

test("Organise lands Course Access Removed on its own cell and nests 08 inside the grown 07", () => {
  assert.deepEqual([spacedOrganiseNodes(104)["course-access-removed"].x, spacedOrganiseNodes(104)["course-access-removed"].z].map((v) => +v!.toFixed(6)),
    [SPACED.nodes["course-access-removed@onboard"].x, SPACED.nodes["course-access-removed@onboard"].z]);
  const start = spacedOrganiseNodes(100)["course-access-removed"];
  assert.ok(Math.hypot(start.x! - SPACED.nodes["course-access-removed"].x, start.z! - SPACED.nodes["course-access-removed"].z) < 0.05);
  for (const t of [110, 216]) {
    const rig = spacedOrganiseRig(t), tag = SPACED.planes.tagroute, seg = rig.segment;
    assert.ok(tag.x0 + rig.tagroute.dx! > seg.x0! && tag.x1 + rig.tagroute.dx! < seg.x1! && tag.z0 + rig.tagroute.dz! > seg.z0! && tag.z1 + rig.tagroute.dz! < seg.z1!);
  }
  // the organised map is as clear as the map
  const rig = spacedOrganiseRig(110), w = MAP_WORLDS.main;
  const organised: MapScene = {
    ...w,
    planes: w.planes.map((p) => (p.id === "segment" ? { ...p, ...rig.segment }
      : p.id === "tagroute" ? { ...p, x0: p.x0 + rig.tagroute.dx!, x1: p.x1 + rig.tagroute.dx!, z0: p.z0 + rig.tagroute.dz!, z1: p.z1 + rig.tagroute.dz! } : p)),
    nodes: w.nodes.map((n) => n.id === "course-access-removed" ? { ...n, plane: "onboard", ...SPACED.nodes["course-access-removed@onboard"] }
      : n.plane === "tagroute" ? { ...n, x: n.x + rig.tagroute.dx!, z: n.z + rig.tagroute.dz! } : n),
  };
  for (const s of [LABEL_SAFE_S, 60]) clear("organised", organised, s);
});

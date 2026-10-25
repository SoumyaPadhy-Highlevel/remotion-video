// Where the map's labels and node bodies land on screen (canvas px), as MapView draws them: node pills hang 6 px below
// the node's front edge, folder pills sit centred past the folder's far corner. Used to check that a layout keeps every
// label clear of every other label and node (spacing.ts, its test).
import { MAP_LABEL } from "../builder/mapTokens";
import { depthForShape, footprintRadius, NodeShape } from "./geometry";
import { MapCamera, MapScene, projectToCanvas } from "./MapScene";

export type Box = { id: string; kind: "label" | "node" | "folder"; x0: number; y0: number; x1: number; y1: number };

/** Inter 600 at 12 px averages under 7 px a character; the product caps the text at 148 px and ellipsizes. */
const textWidth = (text: string) => Math.min(text.length * 7, MAP_LABEL.text.maxWidth);
const PILL_H = MAP_LABEL.pill.minHeight, PILL_PAD = 2 * MAP_LABEL.pill.padX + 2, FOLDER_ICON = MAP_LABEL.folderIcon.size + 8;

/** The label scales MapView uses at camera scale `s` (zoom = s / (zoomH / 10)). */
export const labelScales = (s: number, zoomH = 792) => {
  const zoom = s / (zoomH / 10);
  return { zoom, node: Math.max(0.65, Math.min(Math.sqrt(zoom), 1)), plane: Math.max(0.75, Math.min(Math.sqrt(zoom), 1)) };
};

const shapeOf = (kind: "workflow" | "asset"): NodeShape => (kind === "workflow" ? "plinth" : "hexagon");

/** Every node body, node label and folder label of `scene` under `cam`. */
export const labelBoxes = (scene: MapScene, cam: MapCamera, zoomH = 792): Box[] => {
  const { node: ns, plane: ps } = labelScales(cam.s, zoomH);
  const boxes: Box[] = [];
  for (const n of scene.nodes) {
    const shape = shapeOf(n.kind), r = footprintRadius(shape), d = depthForShape(shape);
    // the body: its footprint circle at the base and at the top
    const pts = [0, d].flatMap((y) => [0, 1, 2, 3, 4, 5, 6, 7].map((k) => projectToCanvas(cam, n.x + r * Math.cos(k * Math.PI / 4), y, n.z + r * Math.sin(k * Math.PI / 4))));
    boxes.push({ id: n.id, kind: "node", x0: Math.min(...pts.map((p) => p[0])), y0: Math.min(...pts.map((p) => p[1])),
      x1: Math.max(...pts.map((p) => p[0])), y1: Math.max(...pts.map((p) => p[1])) });
    if (!n.label) continue;
    const [x, y] = projectToCanvas(cam, n.x, -r, n.z), w = (textWidth(n.label) + PILL_PAD) * ns;
    boxes.push({ id: n.id, kind: "label", x0: x - w / 2, y0: y + 6, x1: x + w / 2, y1: y + 6 + PILL_H * ns });
  }
  for (const p of scene.planes) {
    if (!p.label) continue;
    const [x, y] = projectToCanvas(cam, p.x1, 0, p.z1 + 0.4), w = (textWidth(p.label) + FOLDER_ICON + PILL_PAD) * ps, h = PILL_H * ps;
    boxes.push({ id: p.id, kind: "folder", x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 });
  }
  return boxes;
};

/** Pairs of boxes closer than `gap` px. A node's own label touches its own body by design, so that pair never counts. */
export const collisions = (boxes: Box[], gap = 0) => {
  const hits: [Box, Box][] = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.id === b.id) continue;
    if (a.x0 < b.x1 + gap && b.x0 < a.x1 + gap && a.y0 < b.y1 + gap && b.y0 < a.y1 + gap) hits.push([a, b]);
  }
  return hits;
};

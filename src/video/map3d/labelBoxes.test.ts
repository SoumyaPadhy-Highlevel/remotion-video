// Where labels land on screen, as MapView draws them. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { collisions, labelBoxes, labelScales } from "./labelBoxes";
import { MapNode, MapScene } from "./MapScene";

const node = (id: string, x: number, z: number, label: string | null = "Tag New Enquiries"): MapNode =>
  ({ id, kind: "workflow", x, z, label, color: "#2455d6", icon: "mdi:sitemap", plane: "p" });
const scene = (nodes: MapNode[]): MapScene => ({ planes: [{ id: "p", x0: -5, z0: -5, x1: 5, z1: 5, label: "01 · Lead Capture" }], nodes, edges: [] });
const cam = { cx: 800, cy: 400, s: 39.6 };

test("a node's label hangs centred below it, at the product's label scale", () => {
  const boxes = labelBoxes(scene([node("a", 0, 0)]), cam);
  const body = boxes.find((b) => b.kind === "node")!, label = boxes.find((b) => b.kind === "label")!;
  assert.ok(label.y0 > body.y0 && Math.abs((label.x0 + label.x1) / 2 - (body.x0 + body.x1) / 2) < 1);
  assert.ok(Math.abs(label.y1 - label.y0 - 32 * labelScales(cam.s).node) < 1e-9);
  assert.equal(labelScales(39.6).zoom, 0.5);
  assert.ok(boxes.some((b) => b.kind === "folder" && b.id === "p"));
});

test("unlabelled nodes have a body and no label", () => {
  assert.deepEqual(labelBoxes(scene([node("a", 0, 0, null)]), cam).map((b) => b.kind), ["node", "folder"]);
});

test("collisions finds labels that touch, never a node and its own label", () => {
  assert.equal(collisions(labelBoxes(scene([node("a", 0, 0)]), cam)).length, 0);
  const near = collisions(labelBoxes(scene([node("a", 0, 0), node("b", 0.4, 0.4)]), cam));
  assert.ok(near.some(([a, b]) => a.kind === "label" && b.kind === "label"));
  assert.equal(collisions(labelBoxes(scene([node("a", -3, -3), node("b", 3, 3)]), cam), 10).length, 0);
});

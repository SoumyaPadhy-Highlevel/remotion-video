// The redraw's camera must match the one the film analysis solves with (scripts/map_film/proj.py). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { projectToCanvas } from "./MapScene";

test("a world point projects the way the film analysis projects it", () => {
  // proj.py gives (912.75, 472.40) for this point and camera
  const cam = { cx: 850.5, cy: 320.6, s: 40.5 };
  const [u, v] = projectToCanvas(cam, 5.21, 0.3, 3.62);
  assert.ok(Math.abs(u - 912.75) < 0.05 && Math.abs(v - 472.4) < 0.05, `${u}, ${v}`);
});

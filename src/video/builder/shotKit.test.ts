// Checks how a redrawn shot follows the film: its fades on the film's cuts, and the tracked cursor lookup. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { shown, tracked } from "./shotKit";

test("a shot fades in, holds, and fades out over its span", () => {
  const span: [number, number, number, number] = [10, 10.2, 12, 12.2];
  assert.equal(shown(9.9, [span]), 0);
  assert.equal(shown(10.1, [span]), 0.5);
  assert.equal(shown(11, [span]), 1);
  assert.equal(shown(12.3, [span]), 0);
});

test("a shot on screen in several spans shows in each of them", () => {
  const spans: [number, number, number, number][] = [[1, 1.1, 2, 2.1], [5, 5.1, 6, 6.1]];
  assert.equal(shown(1.5, spans), 1);
  assert.equal(shown(3, spans), 0);
  assert.equal(shown(5.5, spans), 1);
});

test("the tracked cursor is read by film frame, and is null outside its path", () => {
  const path = { from: 300, frames: [[10, 20], null, [30, 40]] as ([number, number] | null)[] };
  assert.deepEqual(tracked(path, 10), [10, 20]);
  assert.equal(tracked(path, 10 + 1 / 30), null);
  assert.deepEqual(tracked(path, 10 + 2 / 30), [30, 40]);
  assert.equal(tracked(path, 9.9), null);
  assert.equal(tracked(path, 11), null);
});

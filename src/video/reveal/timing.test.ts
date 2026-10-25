import {strict as assert} from "node:assert";
import {test} from "node:test";
import {FILM_WORLDS} from "../map3d/filmMap";
import {categoryOf} from "./assets";
import {MAP_REVEAL as R} from "./script";
import {DEFAULT_TIMING as T, reviewDuration, settleFrame, titleHold} from "./reviewProps";
import {activeCategory, categoryProgress, categoryWindow, folderAt, titleClock, workflowAt} from "./timing";
test("every asset type has an equal scheduled entrance", () => {
  for (const categoryFrames of [23, 30, 45]) {
    const timing = {...T, categoryFrames};
    R.categories.forEach((c, i) => {
      const {start, end} = categoryWindow(c.key, timing);
      assert.equal(start, timing.assetsFrame + i * categoryFrames);
      assert.equal(end - start, categoryFrames);
      assert.equal(categoryProgress(start + categoryFrames / 2, c.key, timing), .5);
      assert.equal(activeCategory(start, timing), c.key);
    });
    assert.equal(settleFrame(timing), timing.assetsFrame + categoryFrames * R.categories.length + 9);
  }
});
test("moving map phase boundaries preserves the full available animation windows", () => {
  const timing = {...T, foldersFrame: 200, workflowsFrame: 400, assetsFrame: 600};
  assert.equal(folderAt(6, 7, timing) + 100, 400);
  assert.equal(workflowAt(19, 20, timing) + 80, 600);
});
test("the natural title entrance and exit never get compressed by the old end frame", () => {
  assert.equal(R.start + T.titleFrame / 30, 48);
  assert.equal(reviewDuration(T), 808);
  assert(reviewDuration(T) >= T.titleFrame + T.titleHoldFrames + 18);
  const moved = {...T, titleFrame: 750, titleHoldFrames: 120};
  assert.equal(reviewDuration(moved), 890);
  assert(titleHold({...T, titleHoldFrames: 30}, 3) > 150);
  assert(reviewDuration(T, 3) > reviewDuration(T));
});

test("every existing account asset is represented in the chips; no late fallback", () => {
  const nodes = FILM_WORLDS.main.nodes.filter((n) => n.kind === "asset");
  for (const node of nodes) assert(R.categories.some((c) => c.key === categoryOf(node)));
  assert.equal(R.categories.length, 11);
  assert.equal(settleFrame(T), 570);
  for (const c of R.categories) assert(categoryWindow(c.key, T).end <= 561);
});
test("title buildup plays continuously across 570–684 and then runs at native speed", () => {
  const entrance = 1.35;
  assert.equal(titleClock(570, T, entrance, 30), 0);
  assert.equal(titleClock(684, T, entrance, 30), entrance);
  const d1 = titleClock(620, T, entrance, 30) - titleClock(619, T, entrance, 30);
  const d2 = titleClock(680, T, entrance, 30) - titleClock(679, T, entrance, 30);
  assert(Math.abs(d1 - d2) < 1e-12);
  assert(Math.abs(titleClock(685, T, entrance, 30) - entrance - 1 / 30) < 1e-12);
});

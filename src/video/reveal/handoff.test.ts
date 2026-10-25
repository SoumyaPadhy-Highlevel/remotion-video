import {strict as assert} from "node:assert";
import {test} from "node:test";
import {DEFAULT_TIMING as T, titleHold} from "./reviewProps";
import {fitRect, HANDOFF, recededRect, TITLE_EXIT_FRAMES, titleExitFrame} from "./handoff";

const near = (a: number, b: number) => assert(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("the reveal's window lands exactly on the main video's receded window", () => {
  const from = {left: 90, top: 130, width: 1740, height: 945}, window = {left: 150, top: 118, width: 1620, height: 880};
  const to = recededRect(window, .1);
  near(to.width, 1458); near(to.left + to.width / 2, 960); near(to.top, 560 + (118 - 560) * .9);
  const f = fitRect(from, to);
  near(from.width * f.scale, to.width);
  near(from.left + from.width / 2 + f.dx, to.left + to.width / 2);
  near(from.top + from.height / 2 + f.dy, to.top + to.height / 2);
});

test("the title's exit crosses the cut with no empty frames, never before its approved hold", () => {
  const cut = 823;
  const exit = titleExitFrame(T, .45, cut);
  // still leaving when the next card comes in, and gone before the reveal has faded out over it
  assert(exit < cut && exit + TITLE_EXIT_FRAMES > cut);
  assert(exit + TITLE_EXIT_FRAMES <= cut + HANDOFF.fade);
  assert(exit >= T.titleFrame + titleHold(T, .45));
  // a cut right after the drop still keeps the full hold
  assert.equal(titleExitFrame(T, .45, T.titleFrame + 20), T.titleFrame + titleHold(T, .45));
  // without a hand-off the title keeps its approved timing
  assert.equal(titleExitFrame(T, .45), T.titleFrame + titleHold(T, .45));
});

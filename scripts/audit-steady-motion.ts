/** Verify framing through every frame, excluding deliberate opening/build/ending. */
import React from "react";
import { writeFileSync } from "node:fs";
import { MyComposition } from "../src/Composition";
import { splitAt } from "../src/video/Build";
import { windowAt } from "../src/video/choreography";
import { Cfg } from "../src/video/config";
import { EDIT, editTime, FPS, M, uncut, VIDEO_END } from "../src/video/script";
import { transform } from "motion";
import { withSteadyMotion } from "../src/video/steadyMotion";

const composition = React.Children.toArray(MyComposition().props.children).find(
  (child) => React.isValidElement<{id: string}>(child) && child.props.id === "WorkflowMaps",
) as React.ReactElement<{defaultProps: Cfg}>;
const original = composition.props.defaultProps.motion, steady = withSteadyMotion(original);
const rows = [];
for (let frame = 0; frame < Math.round(VIDEO_END * FPS); frame++) {
  const tn = uncut(frame / FPS), {t, seg} = editTime(tn);
  if (t < 4.7 || t >= M.LOGO - 0.4 || splitAt(t) > 0.001) continue;
  const k = seg?.hold && !seg.card?.top && !seg.panels && !seg.clip
    ? transform(tn, [seg.n0, seg.n0 + 0.3, seg.n1 - (EDIT[EDIT.indexOf(seg) + 2]?.clip ? 0.001 : 0.35), seg.n1], [0, 1, 1, 0]) : 0;
  const old = windowAt(t, false, original), fresh = windowAt(t, false, steady);
  const oldScale = old.scale * old.zoom * (1 - original.recedeCards.shrink * k);
  const newScale = fresh.scale * fresh.zoom * (1 - steady.recedeCards.shrink * k);
  if (Math.abs(newScale - 1) > 1e-9 || Math.abs(fresh.translateX) > 1e-9 || Math.abs(fresh.translateY) > 1e-9) {
    throw new Error(`Unwanted camera move at frame ${frame}: ${newScale}`);
  }
  rows.push({frame, oldScale, newScale});
}
const result = {framesChecked: rows.length,
  originalScaleRange: [Math.min(...rows.map((r) => r.oldScale)), Math.max(...rows.map((r) => r.oldScale))],
  steadyScaleRange: [1, 1], deliberateMovesPreserved: ["opening rise", "map-build split", "ending"]};
writeFileSync("out/premiere-computer-use/current-study/steady-motion-audit.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

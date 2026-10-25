import {strict as assert} from "node:assert";
import {test} from "node:test";
import {M} from "../script";
import {DEFAULT_TIMING as T} from "./reviewProps";
import {mainEdit, MAIN_CONNECTED_SOURCE, MAIN_INTRO_FROM, MAIN_REPEAT_START, MAIN_RESUME_SOURCE, MAIN_SOURCE_FRAMES} from "./mainEdit";
test("approved intro frames and the music drop stay fixed in the main composition", () => {
  const p = mainEdit(T);
  assert.equal(MAIN_INTRO_FROM + T.titleFrame, 1440);
  assert.equal((MAIN_INTRO_FROM + T.titleFrame) / 30, 48);
  assert.equal(p.approvedEnd, 1564);
  assert(p.demoFrom >= p.approvedEnd);
  assert.equal(p.end, 6296);
  assert(p.end / 30 < 210);
});
test("main music joins remove whole bars and picture follows within half a frame", () => {
  for (const titleHoldFrames of [104, 134, 194]) {
    const p = mainEdit({...T, titleHoldFrames});
    assert.equal(MAIN_RESUME_SOURCE - p.musicDemoFrom, p.removedIntroBars * M.BAR * 30);
    const musicSourceBeforeLinked = MAIN_RESUME_SOURCE + p.musicConnectedFrom - p.musicDemoFrom;
    assert(Math.abs(MAIN_CONNECTED_SOURCE - musicSourceBeforeLinked - 4 * M.BAR * 30) < 1e-8);
    assert(Math.abs(p.demoFrom - p.musicDemoFrom) <= .5);
    assert(Math.abs(p.connectedFrom - p.musicConnectedFrom) <= .5);
    assert(p.demoFrom >= p.approvedEnd);
  }
});
test("new Plan it footage and the entire later product edit retain their source frames", () => {
  const p = mainEdit(T);
  assert.equal(p.firstDemoFrames, MAIN_REPEAT_START - MAIN_RESUME_SOURCE);
  assert.equal(p.firstDemoFrames, 645);
  assert.equal(p.sourceEnd, MAIN_SOURCE_FRAMES - 145);
  const spans = [[0, MAIN_INTRO_FROM], [MAIN_INTRO_FROM,p.demoFrom], [p.demoFrom,p.holdFrom], [p.holdFrom,p.connectedFrom], [p.connectedFrom,p.end]];
  for (let i=1;i<spans.length;i++) assert.equal(spans[i-1][1],spans[i][0]);
  assert.equal(p.end-p.connectedFrom,p.sourceEnd-MAIN_CONNECTED_SOURCE);
});

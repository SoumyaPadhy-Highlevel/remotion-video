import {strict as assert} from "node:assert";
import {test} from "node:test";
import {sampleFilmTrack} from "./sampleFilmTrack";

test("camera keyframes remain exact while slowed playback gets intermediate positions", () => {
  const track = [100, 200, 30, 110, 220, 32, 120, 240, 34];
  assert.deepEqual(sampleFilmTrack(track, 1, 3), [110, 220, 32]);
  assert.deepEqual(sampleFilmTrack(track, .85, 3), [108.5, 217, 31.7]);
  assert.deepEqual(sampleFilmTrack(track, 1.7, 3), [117, 234, 33.4]);
});

test("shot boundaries clamp instead of reading another shot or invalid coordinates", () => {
  assert.deepEqual(sampleFilmTrack([10, 20, 12, 24], -.1, 2), [10, 20]);
  assert.deepEqual(sampleFilmTrack([10, 20, 12, 24], 2.4, 2), [12, 24]);
});

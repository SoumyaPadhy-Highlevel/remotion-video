import {strict as assert} from "node:assert";
import {test} from "node:test";
import {MUSIC} from "../script";
import {DEFAULT_MUSIC} from "../musicProps";
import {DEFAULT_TIMING as T} from "./reviewProps";
import {cutStretches, mainEdit, MAIN_RESUME_SOURCE} from "./mainEdit";
import {joinBars, mainMusicPieces, musicPieces} from "./musicEdit";

const FILE_LENGTH = 174.4;   // public/music-workflow-maps.mp3

test("the cut's soundtrack covers every output second, one file piece after another", () => {
  const p = mainEdit(T), pieces = musicPieces(cutStretches(p), DEFAULT_MUSIC);
  assert.equal(pieces[0].out0, 0);
  assert(Math.abs(pieces[pieces.length - 1].out1 - p.end / 30) < 1e-9);
  pieces.slice(1).forEach((q, i) => assert(Math.abs(q.out0 - pieces[i].out1) < 1e-9));
  for (const q of pieces) assert(q.file0 >= 0 && q.file0 + q.out1 - q.out0 <= FILE_LENGTH, JSON.stringify(q));
});

test("the drop lands on the video's drop and the Plan it section plays its own music, not silence", () => {
  const p = mainEdit(T), pieces = musicPieces(cutStretches(p), DEFAULT_MUSIC);
  const fileAt = (o: number) => { const q = pieces.find((x) => o >= x.out0 && o < x.out1)!; return q.file0 + o - q.out0; };
  assert(Math.abs(fileAt(48) - MUSIC.drop) < .02);
  // the Plan it section (52.6 s on) plays the file where the main video had it
  assert(Math.abs(fileAt(p.musicDemoFrom / 30) - MAIN_RESUME_SOURCE / 30) < 1e-9);
  assert(Math.abs(fileAt(60) - (MAIN_RESUME_SOURCE / 30 + 60 - p.musicDemoFrom / 30)) < 1e-9);
});

test("every join skips or repeats whole bars, so the beat carries on", () => {
  const p = mainEdit(T), bars = joinBars(musicPieces(cutStretches(p), DEFAULT_MUSIC));
  assert(bars.length >= 3);
  for (const b of bars) assert(Math.abs(b - Math.round(b)) < 1e-3, `${b} bars`);
});

test("without the loop the track plays on after its cut", () => {
  const pieces = mainMusicPieces({...DEFAULT_MUSIC, loopToDrop: false});
  assert.equal(pieces.length, 2);
  assert.equal(pieces[1].out1, Infinity);
});

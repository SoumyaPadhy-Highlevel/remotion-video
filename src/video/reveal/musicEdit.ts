import {LOOP_CUT, M, MUSIC, MUSIC_CUT} from "../script";
import type {MusicSettings} from "../musicProps";

/** A stretch of the soundtrack file: output seconds [out0, out1) play the file from file0 on. */
export type MusicPiece = {out0: number; out1: number; file0: number};

/** The main video's soundtrack as WorkflowMapsVideo plays it, in its own output seconds: the file up to MUSIC_CUT, the cut
 * skipped, on to where it loops back to the drop, then from the drop to LOOP_CUT, that skipped, on to the end. */
export const mainMusicPieces = (music: MusicSettings): MusicPiece[] => {
  const at = music.offset, [c0, c1] = MUSIC_CUT, [l0, l1] = LOOP_CUT;
  const loopOut = MUSIC.loopAfter - (c1 - c0), out1 = loopOut + (l0 - MUSIC.drop);
  const first = {out0: Math.max(0, at), out1: c0 + at, file0: Math.max(0, -at)};
  if (!music.loopToDrop) return [first, {out0: c0 + at, out1: Infinity, file0: c1}];
  return [first, {out0: c0 + at, out1: loopOut + at, file0: c1}, {out0: loopOut + at, out1: out1 + at, file0: MUSIC.drop}, {out0: out1 + at, out1: Infinity, file0: l1}];
};

/** The cut's soundtrack: each stretch of the main video it keeps (`src0` its start in main-video seconds) mapped through
 * mainMusicPieces, so the whole edit is a list of file pieces, joined back to back. */
export const musicPieces = (stretches: {out0: number; out1: number; src0: number}[], music: MusicSettings): MusicPiece[] => {
  const main = mainMusicPieces(music), out: MusicPiece[] = [];
  for (const s of stretches) {
    const shift = s.src0 - s.out0;
    for (const p of main) {
      const a = Math.max(s.out0, p.out0 - shift), b = Math.min(s.out1, p.out1 - shift);
      if (b > a + 1e-9) out.push({out0: a, out1: b, file0: p.file0 + (a + shift - p.out0)});
    }
  }
  // two pieces that carry on in the file are one piece
  return out.reduce<MusicPiece[]>((acc, p) => {
    const q = acc[acc.length - 1];
    if (q && Math.abs(q.out1 - p.out0) < 1e-9 && Math.abs(q.file0 + (q.out1 - q.out0) - p.file0) < 1e-6) q.out1 = p.out1;
    else acc.push({...p});
    return acc;
  }, []);
};

/** How far the file jumps at each join, in bars (the cut only removes or repeats whole bars). */
export const joinBars = (pieces: MusicPiece[]) => pieces.slice(1).map((p, i) => (p.file0 - (pieces[i].file0 + pieces[i].out1 - pieces[i].out0)) / M.BAR);

import {EDIT, FPS, INTRO_CUT, M, VIDEO_END} from "../script";
import {reviewDuration, RevealTiming} from "./reviewProps";

export const MAIN_INTRO_FROM = 756;
export const MAIN_CONTEXT_FRAME = 600; // last readable pair of actual workflow tabs
const outputFrame = (uncutSeconds: number) => Math.round((uncutSeconds < INTRO_CUT[0] ? uncutSeconds : uncutSeconds - (INTRO_CUT[1] - INTRO_CUT[0])) * FPS);
// Find the latest main project's boundaries by content, not stale rendered clips.
const firstDemo = EDIT.find((s) => s.hold && s.card?.html.includes("Select a workflow."))!;
const repeatedSetup = EDIT.find((s) => s.hold && s.card?.html.includes("Remember having to jump"))!;
const connectedCanvas = EDIT.find((s) => s.hold && s.card?.html.includes("All your linked workflows."))!;
export const MAIN_RESUME_SOURCE = outputFrame(firstDemo.n0);
/** The timeline moment held behind that card (what its window and mascot show). */
export const MAIN_FIRST_CARD_T = firstDemo.src;
export const MAIN_REPEAT_START = outputFrame(repeatedSetup.n0);
/** The Plan it shot's last frame with its top line still fully up (the line fades over the 0.3 s before the next card); the
 * shot has settled by then, so it holds on this frame into the dissolve to the linked workflows. */
export const MAIN_PLAN_STILL = MAIN_REPEAT_START - Math.ceil(.3 * FPS) - 1;
/** Frames of the dissolve from that still into the linked workflows, centred on the music's bar line (connectedFrom). */
export const LINKED_DISSOLVE = 12;
export const MAIN_CONNECTED_SOURCE = outputFrame(connectedCanvas.n0);
/** The cut's music as one file in public/: MergedMusicEdit bounced. After changing any timing, rebuild it under a new name
 * (`npx remotion render src/index.ts WorkflowMapsMusicEdit public/<name>.wav --codec=wav`) and point this at it. */
export const MUSIC_MIX = "music-edit-v1.wav";
export const MAIN_SOURCE_FRAMES = Math.round(VIDEO_END * FPS);
export const mainEdit = (timing: RevealTiming, letterDuration = .45) => {
  const approvedEnd = MAIN_INTRO_FROM + reviewDuration(timing, letterDuration);
  // Eight whole music bars are removed with the duplicate post-title map build.
  // Retain a short clean-map hold rather than speeding up the approved reveal.
  const removedIntroBars = Math.floor((MAIN_RESUME_SOURCE - approvedEnd) / (M.BAR * FPS));
  const musicDemoFrom = MAIN_RESUME_SOURCE - removedIntroBars * M.BAR * FPS;
  const demoFrom = Math.round(musicDemoFrom);
  const firstDemoFrames = MAIN_REPEAT_START - MAIN_RESUME_SOURCE;
  const holdFrom = demoFrom + firstDemoFrames;
  // Preserve the approved removal of the repeated linked-workflow setup. Four
  // bars = 232.5 frames: audio remains sample-accurate, picture uses nearest frame.
  const musicConnectedFrom = MAIN_CONNECTED_SOURCE - (MAIN_RESUME_SOURCE - musicDemoFrom) - 4 * M.BAR * FPS;
  const connectedFrom = Math.round(musicConnectedFrom);
  const closingCut = 145; // previously approved shorter brand hold, still ~5 seconds
  const sourceEnd = MAIN_SOURCE_FRAMES - closingCut;
  const end = connectedFrom + sourceEnd - MAIN_CONNECTED_SOURCE;
  return {approvedEnd, removedIntroBars, musicDemoFrom, demoFrom, firstDemoFrames, holdFrom, musicConnectedFrom, connectedFrom, sourceEnd, end};
};
/** The stretches of the main video the cut keeps, in seconds: output [out0, out1) shows main-video time src0 on. The music
 * follows the same stretches (musicEdit.ts), on the music's exact bar positions. */
export const cutStretches = (p: ReturnType<typeof mainEdit>) => [
  {out0: 0, out1: p.musicDemoFrom / FPS, src0: 0},
  {out0: p.musicDemoFrom / FPS, out1: p.musicConnectedFrom / FPS, src0: MAIN_RESUME_SOURCE / FPS},
  {out0: p.musicConnectedFrom / FPS, out1: p.end / FPS, src0: MAIN_CONNECTED_SOURCE / FPS},
];

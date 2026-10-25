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
export const MAIN_REPEAT_START = outputFrame(repeatedSetup.n0);
export const MAIN_CONNECTED_SOURCE = outputFrame(connectedCanvas.n0);
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

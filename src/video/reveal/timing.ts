import {MAP_REVEAL as R} from "./script";
import {DEFAULT_TIMING, RevealTiming, settleFrame} from "./reviewProps";
export const progress = (f: number, a: number, b: number) => Math.max(0, Math.min(1, (f - a) / (b - a)));
export const smoothProgress = (f: number, a: number, b: number) => {const k = progress(f, a, b); return k * k * (3 - 2 * k);};
export const folderAt = (i: number, count: number, timing = DEFAULT_TIMING) => timing.foldersFrame + i / Math.max(1, count - 1) * (timing.workflowsFrame - timing.foldersFrame) * .5;
export const workflowAt = (i: number, count: number, timing = DEFAULT_TIMING) => timing.workflowsFrame + i / Math.max(1, count - 1) * (timing.assetsFrame - timing.workflowsFrame) * .6;
export const categoryWindow = (key: string, timing: RevealTiming = DEFAULT_TIMING) => {
  const index = R.categories.findIndex((c) => c.key === key);
  const start = timing.assetsFrame + Math.max(0, index) * timing.categoryFrames;
  return {start, end: start + timing.categoryFrames};
};
export const categoryProgress = (f: number, key: string, timing = DEFAULT_TIMING) => {
  const {start, end} = categoryWindow(key, timing);
  return smoothProgress(f, start, end);
};
export const activeCategory = (f: number, timing = DEFAULT_TIMING) => {
  const index = Math.floor((f - timing.assetsFrame) / timing.categoryFrames);
  return index >= 0 && index < R.categories.length ? R.categories[index].key : null;
};
export const mapReady = (f: number, timing = DEFAULT_TIMING) => smoothProgress(f, settleFrame(timing) - 30, settleFrame(timing));

/** Linear source-clock playback through the full base-title entrance, stretched
 * over the buildup. On the drop the complete title gets its original pulse. */
export const titleClock = (frame: number, timing: RevealTiming, entranceSeconds: number, fps: number) => {
  const buildStart = settleFrame(timing), drop = timing.titleFrame;
  if (frame < drop) return entranceSeconds * (frame - buildStart) / Math.max(1, drop - buildStart);
  return entranceSeconds + (frame - drop) / fps;
};

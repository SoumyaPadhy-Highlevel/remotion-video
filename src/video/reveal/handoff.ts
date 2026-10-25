import {RevealTiming, titleHold} from "./reviewProps";

/** The reveal hands over to the main video on its first statement card. Over the reveal's last `lead` frames the app window
 * recedes onto the main video's receded window and the mascot moves to its corner pose, so the cut joins matching pictures.
 * The title starts lifting away `titleLead` frames before the cut and finishes over the incoming card while the reveal fades
 * out over the main video for `fade` frames: one line hands straight to the next, no empty frames between (30 fps). */
export const HANDOFF = {lead: 18, titleLead: 8, fade: 12};
/** The title's exit: its letters lift away within about 0.5 s (KineticTitle). */
export const TITLE_EXIT_FRAMES = 15;

export type Rect = {left: number; top: number; width: number; height: number};

/** Where a window sits once receded behind a statement card: scaled by 1 − shrink about (960, 560) (WorkflowMapsVideo). */
export const recededRect = (r: Rect, shrink: number, origin: [number, number] = [960, 560]): Rect => {
  const s = 1 - shrink;
  return {left: origin[0] + (r.left - origin[0]) * s, top: origin[1] + (r.top - origin[1]) * s, width: r.width * s, height: r.height * s};
};

/** The scale (about `from`'s centre) and offset that move rect `from` onto rect `to`, matched on width and centre. */
export const fitRect = (from: Rect, to: Rect) => ({
  scale: to.width / from.width,
  dx: to.left + to.width / 2 - (from.left + from.width / 2),
  dy: to.top + to.height / 2 - (from.top + from.height / 2),
});

/** Local frame where the reveal's title starts to lift away: `titleLead` frames before the hand-off, so its exit crosses the
 * next card's entrance, but never before the approved hold. */
export const titleExitFrame = (timing: RevealTiming, letterDuration: number, handoffFrame?: number) =>
  Math.max(timing.titleFrame + titleHold(timing, letterDuration), handoffFrame == null ? -Infinity : handoffFrame - HANDOFF.titleLead);

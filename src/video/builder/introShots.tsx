// The intro's builder shots, redrawn over the film (film seconds): the hand-off pair (Continue Client Journey and Tag workflow,
// 9.5–23.2 s), the four workflows one form starts (23.7–39.2 s) and the "open every workflow" flashes (39.2–42.7 s).
import React from "react";
import { transform } from "motion";
import { easeOut } from "../anim";
import { BUILDER_WORKFLOWS } from "../script";
import { WorkflowCanvas } from "./Canvas";
import { FILM_TRACK } from "./filmTrack";
import { BOARD, Cursor, shown, tracked, VIEW } from "./shotKit";

/** Left edge of the film's "Add to workflow" panel, in board px; it fades in over the board from film 10.47 to 10.77 s. */
const PANEL_X = 1173 - BOARD.left;

/** Continue Client Journey (on and off with the tab flips): its Add to Workflow step is clicked at 10.43 s and the Add to
 * workflow panel opens over the right of the board. */
export const ContinueJourney: React.FC<{ ft: number }> = ({ ft }) => {
  const o = shown(ft, [[9.53, 9.75, 13.3, 13.4], [18.07, 18.25, 18.83, 19.0], [19.57, 19.77, 20.33, 20.5]]);
  if (o <= 0) return null;
  const panel = transform(ft, [10.47, 10.77], [0, 1]);
  // the cursor travels to the step (film card centre 837, 392 → here 837, 516) and on to the panel, where the film takes over
  const c = tracked(FILM_TRACK.cursorA, ft), dy = transform(ft, [10.5, 10.77], [124, 0]);
  return (
    <div style={{ position: "absolute", ...BOARD, opacity: o }}>
      {/* the panel covers the board's right side: the redraw fades out there as the panel fades in */}
      <div style={{ position: "absolute", inset: 0, maskImage: `linear-gradient(to right, #000 ${PANEL_X}px, rgba(0,0,0,${(1 - panel).toFixed(3)}) ${PANEL_X}px)` }}>
        <WorkflowCanvas wf={BUILDER_WORKFLOWS.continueJourney} width={BOARD.width} height={BOARD.height} view={VIEW.full} states={{ "add-to-workflow": { selected: ft >= 10.43 } }} />
      </div>
      <div style={{ position: "absolute", left: PANEL_X - 22, top: 0, width: 22, height: BOARD.height, opacity: panel, background: "linear-gradient(to left, rgba(16,24,40,.09), rgba(16,24,40,0))" }} />
      {c && c[0] - BOARD.left < PANEL_X ? <Cursor x={c[0] - BOARD.left} y={c[1] + dy - BOARD.top} /> : null}
    </div>
  );
};

/** Tag workflow (on and off with the tab flips): the whole tree at 90 %, the cursor resting on the Contact Tag trigger. */
export const TagWorkflow: React.FC<{ ft: number }> = ({ ft }) => {
  const o = shown(ft, [[14.8, 14.97, 18.07, 18.25], [18.83, 19.0, 19.57, 19.77], [20.33, 20.5, 23.1, 23.17]]);
  if (o <= 0) return null;
  const v = VIEW.fit;
  // the film's Contact Tag card (379, 162, 288 × 116) → this one (first of three trigger slots), so the cursor rests on the
  // same spot of the card
  const card = { x: v.x + (120 - 375) * v.zoom, y: v.y - 300 * v.zoom, w: 240 * v.zoom, h: 152 * v.zoom };
  const c = tracked(FILM_TRACK.cursorB, ft);
  return (
    <div style={{ position: "absolute", ...BOARD, opacity: o }}>
      <WorkflowCanvas wf={BUILDER_WORKFLOWS.tagWorkflow} width={BOARD.width} height={BOARD.height} view={v} />
      {c ? <Cursor x={card.x + ((c[0] - 379) / 288) * card.w} y={card.y + ((c[1] - 162) / 116) * card.h} /> : null}
    </div>
  );
};

/** The four workflows the Coaching Enquiry form starts: four cards, each with a folder › workflow header (the film's) over
 * a small canvas (redrawn here). Each card slides up 24 px and fades in over 0.27 s; its trigger then lights up green as
 * the form's entry point, and turns to an error once the form is deleted (measured on the film). */
const FOUR_UP = [
  { x: 80, y: 70, enter: 23.74, path: 24.07, error: 27.9 },
  { x: 840, y: 70, enter: 24.21, path: 24.53, error: 28.27 },
  { x: 80, y: 480, enter: 24.58, path: 24.97, error: 28.63 },
  { x: 840, y: 480, enter: 25.02, path: 25.43, error: 29.0 },
];
export const FourUp: React.FC<{ ft: number }> = ({ ft }) => {
  if (ft < 23.7 || ft > 39.25) return null;
  const out = transform(ft, [39.15, 39.23], [1, 0]);
  // the card's canvas, below its 44 px header and inside its border, at 70 % so the trigger and first step both fit
  const W = 696, H = 284, view = { x: W / 2 - 120 * 0.7, y: 12 + 300 * 0.7, zoom: 0.7 };
  return <>
    {FOUR_UP.map((p, i) => {
      const k = transform(ft, [p.enter, p.enter + 0.27], [0, 1], { ease: easeOut });
      if (k <= 0) return null;
      const alert = transform(ft, [p.error, p.error + 0.25], [0, 1], { ease: easeOut });
      return (
        <div key={i} style={{ position: "absolute", left: p.x + 2, top: p.y + 44 + 24 * (1 - k), width: W, height: H, opacity: k * out, overflow: "hidden", borderRadius: "0 0 12px 12px" }}>
          <WorkflowCanvas wf={BUILDER_WORKFLOWS.formToTag} width={W} height={H} view={view} chrome={false} border={false}
            states={{ "form-submitted": { path: ft >= p.path && ft < p.error, alert } }} />
        </div>
      );
    })}
  </>;
};

/** "The only way to know? Open every workflow.": five builders, one after another, each cross-fading in 2–3 frames, with
 * the film's cursor (tracked by its shape) moving through them. */
const FLASHES: { wf: keyof typeof BUILDER_WORKFLOWS; span: [number, number, number, number]; fit?: boolean }[] = [
  { wf: "formToTag", span: [39.17, 39.25, 39.53, 39.6] },            // Tag New Enquiries
  { wf: "consultationGoal", span: [39.53, 39.6, 40.0, 40.08] },     // Consultation Booking Goal
  { wf: "formToTag", span: [40.0, 40.08, 41.1, 41.17] },            // contact tag - form 7
  { wf: "opportunityRouting", span: [41.1, 41.17, 41.7, 41.77], fit: true },   // Opportunity Status Routing
  // Program Application Submitted, until the montage of half-size windows (the film's own, 42.65–45.1 s) starts over it
  { wf: "programApplication", span: [41.7, 41.77, 42.62, 42.8], fit: true },
];

export const Flashes: React.FC<{ ft: number }> = ({ ft }) => {
  if (ft < 39.1 || ft > 42.8) return null;
  const c = tracked(FILM_TRACK.cursorFlash, ft);
  return <>
    {FLASHES.map((f, i) => {
      const o = shown(ft, [f.span]);
      return o > 0 ? (
        <div key={i} style={{ position: "absolute", ...BOARD, opacity: o }}>
          <WorkflowCanvas wf={BUILDER_WORKFLOWS[f.wf]} width={BOARD.width} height={BOARD.height} view={f.fit ? VIEW.fit : VIEW.full} />
        </div>
      ) : null;
    })}
    {c ? <div style={{ position: "absolute", ...BOARD }}><Cursor x={c[0] - BOARD.left} y={c[1] - BOARD.top} /></div> : null}
  </>;
};

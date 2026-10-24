// The linked-workflows story, redrawn over the film (film seconds): Lead Management | Priority Assignment in the builder
// (185.9–189.14 s, the edit's clip A), where the cursor picks an Add to Workflow step; then the same workflow in Workflow
// Maps' workflow view (189.17–193.4 s), where its Linked badges pop and the first one opens. From 193.4 s the film zooms out
// to every linked workflow at once (the film's own, close to the product's: see CLAUDE.md).
import React from "react";
import { mix, transform } from "motion";
import { easeInOut } from "../anim";
import { BUILDER_WORKFLOWS } from "../script";
import { WorkflowCanvas } from "./Canvas";
import { FILM_TRACK } from "./filmTrack";
import { BOARD, Cursor, shown, tracked } from "./shotKit";
import { MapsCanvas } from "./MapsCanvas";

/** The film cuts in at 185.9 s and out at 189.16 s; its camera pushes in 15 % about window (340, 680), where the cursor
 * rests on the first lane's step, from 186.27 to 186.97 s (measured on the film). The view puts that step's card where
 * the film's was (centre 357, 668), so the cursor and the edit's callout stay on it. */
export const PriorityAssignment: React.FC<{ ft: number }> = ({ ft }) => {
  const o = shown(ft, [[185.885, 185.89, 189.15, 189.16]]);
  if (o <= 0) return null;
  const zoom = 0.85, view = { x: 357 - BOARD.left - zoom * (120 - 390), y: 10 + 300 * zoom, zoom };
  const s = mix(1, 1.15, transform(ft, [186.27, 186.97], [0, 1], { ease: easeInOut }));
  const c = tracked(FILM_TRACK.cursorPriority, ft);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: "340px 680px", transform: `scale(${s.toFixed(4)})` }}>
        <div style={{ position: "absolute", ...BOARD }}>
          <WorkflowCanvas wf={BUILDER_WORKFLOWS.priorityAssignment} width={BOARD.width} height={BOARD.height} view={view} states={{ "start-high": { selected: ft >= 186.57 } }} />
        </div>
      </div>
      {c ? <Cursor x={c[0]} y={c[1]} /> : null}
    </div>
  );
};

/** The workflow view's canvas (full width, no run list) and where the film's "Linked workflows" popover opens over it. */
const VIEW_BOARD = { left: 45, top: 88, width: 1530, height: 747 };
const POPOVER = { left: 244 - VIEW_BOARD.left, top: 710 - VIEW_BOARD.top, width: 356, height: 126 };

/** Priority Assignment in Workflow Maps' workflow view: the film shows it at 110 % (lanes 286 px apart) with its triggers
 * 54 px under the canvas top; the Linked badges pop on its three hand-offs 0.27 s apart, and the first one's popover (the
 * film's) is open from 191.27 to 192.85 s. */
export const PriorityInMaps: React.FC<{ ft: number }> = ({ ft }) => {
  const o = shown(ft, [[189.155, 189.17, 193.3, 193.45]]);
  if (o <= 0) return null;
  const zoom = 1.1, view = { x: 766 - 120 * zoom, y: 54, zoom };
  const pop = (at: number) => (ft < at ? 0 : transform(ft, [at, at + 0.2], [0, 1], { ease: easeInOut }));
  const states = { "start-high": { linked: pop(189.85) }, "start-medium": { linked: pop(190.12) }, "start-low": { linked: pop(190.38) } };
  const popover = Math.min(transform(ft, [191.2, 191.35], [0, 1]), transform(ft, [192.8, 192.9], [1, 0]));
  const hole = `M${POPOVER.left} ${POPOVER.top}h${POPOVER.width}v${POPOVER.height}h${-POPOVER.width}z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEW_BOARD.width}" height="${VIEW_BOARD.height}"><path fill-rule="evenodd" fill-opacity="1" d="M0 0H${VIEW_BOARD.width}V${VIEW_BOARD.height}H0z${hole}"/><path d="${hole}" fill-opacity="${(1 - popover).toFixed(3)}"/></svg>`;
  const c = tracked(FILM_TRACK.cursorLinked, ft);
  return (
    <div style={{ position: "absolute", ...VIEW_BOARD, opacity: o }}>
      {/* the film's popover shows through a hole while it is open */}
      <div style={{ position: "absolute", inset: 0, maskImage: popover > 0 ? `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")` : undefined, maskSize: "100% 100%" }}>
        <MapsCanvas wf={BUILDER_WORKFLOWS.priorityAssignment} width={VIEW_BOARD.width} height={VIEW_BOARD.height} view={view} states={states} />
      </div>
      {c && popover < 0.5 ? <Cursor x={c[0] - VIEW_BOARD.left} y={c[1] - VIEW_BOARD.top} /> : null}
    </div>
  );
};

// Workflow Maps' run view, redrawn over the film (film seconds): Jordan's runs through Program Application Submitted
// (128.7–136.5 s) and Tag New Enquiries (136.6–143.3 s), and the failed Program Payment Received run (150.4–153.6 s). The
// film's modal (header, run list, detail panel) stays; its canvas is redrawn with Maps' own canvas (MapsCanvas.tsx).
import React from "react";
import { transform } from "motion";
import { BUILDER_WORKFLOWS } from "../script";
import { FILM_TRACK } from "./filmTrack";
import { MapsCanvas, RunNodeState } from "./MapsCanvas";
import { Cursor, shown, tracked } from "./shotKit";

/** The modal's canvas in the window (measured on the film); the run detail panel's left edge, in board px. */
const RUN_BOARD = { left: 397, top: 88, width: 1177, height: 747 };
const PANEL_X = 1137 - RUN_BOARD.left;

type RunShot = {
  wf: keyof typeof BUILDER_WORKFLOWS; span: [number, number, number, number]; zoom: number; top: number;
  /** when each step lights up on the film, in path order; `failed` ends the run in an error */
  path: [string, number][]; failed?: boolean;
  /** the detail panel slides in over [a, b] with that step selected */
  panel?: { at: [number, number]; step: string };
  /** the film's first card top and row pitch, to move its cursor onto these cards */
  film: { top: number; pitch: number };
};
const SHOTS: RunShot[] = [
  { wf: "runApplication", span: [128.67, 128.8, 136.3, 136.47], zoom: 0.76, top: 20, film: { top: 130, pitch: 110 },
    path: [["add-contact-tag", 129.5], ["create-opportunity", 129.9], ["if-else", 130.1], ["yes", 130.25], ["send-email", 130.5]],
    panel: { at: [132.03, 132.23], step: "send-email" } },
  { wf: "runTagEnquiries", span: [136.6, 136.8, 143.28, 143.31], zoom: 1, top: 170, film: { top: 149, pitch: 130 },
    path: [["add-contact-tag", 137.3], ["send-sms", 137.57]] },
  { wf: "runPayment", span: [150.37, 150.43, 153.43, 153.6], zoom: 1, top: 85, film: { top: 152, pitch: 130 }, failed: true,
    path: [["add-contact-tag", 150.97], ["send-email", 151.2]], panel: { at: [152.03, 152.23], step: "send-email" } },
];

const Shot: React.FC<{ s: RunShot; ft: number }> = ({ s, ft }) => {
  const o = shown(ft, [s.span]);
  if (o <= 0) return null;
  const view = { x: 480 - 120 * s.zoom, y: s.top, zoom: s.zoom };
  const states: Record<string, RunNodeState> = {};
  s.path.forEach(([id, at], i) => {
    if (ft < at) return;
    const last = i === s.path.length - 1, failed = !!s.failed && last;
    const chips: RunNodeState["chips"] = [...(i === 0 ? ["entered" as const] : []), ...(failed ? ["error" as const] : last ? ["exited" as const] : [])];
    states[id] = { ran: failed ? 0 : transform(ft, [at, at + 0.3], [0, 1]), failed, chips, chipsIn: transform(ft, [at, at + 0.15], [0, 1]),
      selected: !!s.panel && s.panel.step === id && ft >= s.panel.at[0] };
  });
  const panel = s.panel ? transform(ft, s.panel.at, [0, 1]) : 0;
  // the film's cursor, moved from its cards (column at x 877, 280 wide) onto these
  const c = tracked(FILM_TRACK.cursorRuns, ft), k = (s.zoom * 168) / s.film.pitch;
  return (
    <div style={{ position: "absolute", ...RUN_BOARD, opacity: o }}>
      <div style={{ position: "absolute", inset: 0, maskImage: `linear-gradient(to right, #000 ${PANEL_X}px, rgba(0,0,0,${(1 - panel).toFixed(3)}) ${PANEL_X}px)` }}>
        <MapsCanvas wf={BUILDER_WORKFLOWS[s.wf]} width={RUN_BOARD.width} height={RUN_BOARD.height} view={view} states={states} t={ft} nav />
      </div>
      <div style={{ position: "absolute", left: PANEL_X - 22, top: 0, width: 22, height: RUN_BOARD.height, opacity: panel, background: "linear-gradient(to left, rgba(16,24,40,.09), rgba(16,24,40,0))" }} />
      {/* the film's round "next run" arrow straddles the canvas's right border; the redraw has the real one inside */}
      <div style={{ position: "absolute", left: RUN_BOARD.width, top: 464 - RUN_BOARD.top - 24, width: 24, height: 48, background: "#fff" }} />
      {c && (panel < 0.5 || c[0] - RUN_BOARD.left < PANEL_X)
        ? <Cursor x={480 + (c[0] - 877) * ((240 * s.zoom) / 280)} y={s.top + (c[1] - s.film.top) * k} /> : null}
    </div>
  );
};

/** The run view's shots at film time `ft`, in window px. */
export const RunShots: React.FC<{ ft: number }> = ({ ft }) => <>{SHOTS.map((s) => <Shot key={s.wf} s={s} ft={ft} />)}</>;

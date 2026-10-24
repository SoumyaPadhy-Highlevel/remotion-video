// Shared pieces for drawing the builder over the film's shots (scenes.tsx): where the film's canvas is, how a shot fades
// with the film's cuts, and the film's cursor.
import React from "react";
import { transform } from "motion";
import { CanvasView } from "./Canvas";

/** The film's builder canvas in the 1620×880 window, 1 px border included (measured on the film). */
export const BOARD = { left: 60, top: 101, width: 1552, height: 771 };

/** Views on BOARD, matching where the film's own canvas puts its workflow: the first step's centre at window x 837.
 * `full` shows a short workflow at 100 % with its triggers 80 px below the board's top; `fit` shows a tall one at 90 %. */
export const VIEW = {
  full: { x: 777 - 120, y: 380, zoom: 1 } as CanvasView,
  fit: { x: 777 - 120 * 0.9, y: 22 + 300 * 0.9, zoom: 0.9 } as CanvasView,
};

/** Opacity of a shot that is on screen over each [in-start, in-end, out-start, out-end] (film s): the film cross-fades
 * between shots in 3–5 frames. */
export const shown = (ft: number, spans: [number, number, number, number][]) =>
  Math.max(0, ...spans.map((s) => (ft >= s[0] && ft <= s[3] ? transform(ft, s, [0, 1, 1, 0]) : 0)));

/** The film's cursor (a macOS arrow), tip at (x, y). */
export const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={18} height={26} viewBox="0 0 18 26" style={{ position: "absolute", left: x - 1.5, top: y - 1.5, filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,.35))" }}>
    <path d="M1.5 1.5v19.2l4.6-4.4 2.9 6.9 3.2-1.4-2.9-6.7h6.4z" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

/** Where the film cursor is at film time `ft` on a tracked path (filmTrack.ts), or null. */
export const tracked = (path: { from: number; frames: ([number, number] | null)[] }, ft: number) => {
  const i = Math.round(ft * 30) - path.from;
  return i >= 0 && i < path.frames.length ? path.frames[i] : null;
};

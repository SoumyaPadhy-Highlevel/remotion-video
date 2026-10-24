// The white callout card: a small first line, then bigger bold lines that rise in after it, with a pointer on one edge.
// Used in the intro (script.ts INTRO_CALLOUTS, drawn inside the app window) and in the linked-workflows clip (ClipWindow).
import React from "react";
import { useCfg } from "./config";

export type CalloutSide = "top" | "bottom" | "left" | "right" | "none";
const INK = "var(--ink, #0B1B3A)";
const EDGE = "rgba(16,44,102,.08)";
/** Card offset and pointer place for each side: the pointer's tip lands on (x, y). */
const PLACE: Record<CalloutSide, (ax: number) => { dx: number; dy: number; tr: string; arrow?: React.CSSProperties; origin: string }> = {
  top: (ax) => ({ dx: -ax - 9, dy: 9, tr: "", arrow: { left: ax, top: -9, boxShadow: `-1px -1px 0 ${EDGE}` }, origin: `${ax + 9}px 0` }),
  bottom: (ax) => ({ dx: -ax - 9, dy: -9, tr: "translateY(-100%) ", arrow: { left: ax, bottom: -9, boxShadow: `1px 1px 0 ${EDGE}` }, origin: `${ax + 9}px 100%` }),
  left: () => ({ dx: 9, dy: 0, tr: "translateY(-50%) ", arrow: { left: -9, top: "calc(50% - 9px)", boxShadow: `-1px 1px 0 ${EDGE}` }, origin: "0 50%" }),
  right: () => ({ dx: -9, dy: 0, tr: "translate(-100%, -50%) ", arrow: { right: -9, top: "calc(50% - 9px)", boxShadow: `1px -1px 0 ${EDGE}` }, origin: "100% 50%" }),
  none: () => ({ dx: 0, dy: 0, tr: "", origin: "0 0" }),
};

/** `html`: lines split by <br/>. `k`: the card's entrance (0–1, may overshoot), `lineK(i, n)`: each later line's (line i of n). */
export const Callout: React.FC<{ x: number; y: number; side?: CalloutSide; ax?: number; html: string; k: number; opacity?: number; lineK: (i: number, n: number) => number }> = ({
  x, y, side = "top", ax = 104, html, k, opacity = 1, lineK,
}) => {
  const { style } = useCfg();
  const p = PLACE[side](ax), lines = html.split(/<br\s*\/?>/);
  return (
    <div className="poppins" style={{
      position: "absolute", left: x + p.dx, top: y + p.dy, padding: "16px 24px 18px", borderRadius: 16, background: "#fff",
      boxShadow: `0 18px 40px rgba(16,44,102,.22), 0 0 0 1px ${EDGE}`, opacity: opacity * k,
      transform: `${p.tr}translateY(${((1 - k) * 14).toFixed(1)}px) scale(${(0.94 + 0.06 * k).toFixed(3)})`, transformOrigin: p.origin,
    }}>
      {p.arrow ? <div style={{ position: "absolute", width: 18, height: 18, background: "#fff", transform: "rotate(45deg)", ...p.arrow }} /> : null}
      {lines.map((l, i) => { const lk = i === 0 ? 1 : lineK(i, lines.length); return (
        <div key={i} style={{ position: "relative", fontSize: i === 0 ? style.sizes.topLine * 0.6 : style.sizes.topLine * 0.82, fontWeight: i === 0 ? 600 : 800, letterSpacing: "-0.01em", color: INK, whiteSpace: "nowrap",
          lineHeight: 1.25, marginTop: i ? 4 : 0, opacity: lk, transform: `translateY(${((1 - lk) * 10).toFixed(1)}px)` }} dangerouslySetInnerHTML={{ __html: l }} />); })}
    </div>
  );
};

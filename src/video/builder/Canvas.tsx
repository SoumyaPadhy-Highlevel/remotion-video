// The builder canvas (WorkflowTreeV2.vue): gray-50 board with the 20 px line grid, the workflow laid out by layout.ts, the
// bottom-left zoom controls, the minimap and the top controls. `view` is where the workflow's origin (the first step's
// top-left) sits on the canvas, and its zoom; everything else follows the product.
import React from "react";
import { layoutWorkflow, WorkflowLayout, WorkflowSpec } from "./layout";
import { ActionCard, AddTriggerCard, AlertDot, BIcon, BranchCard, EndPill, NodeState, PlusButton, TriggerCard } from "./Nodes";
import { CANVAS, FONT, HR } from "./tokens";

export type CanvasView = { x: number; y: number; zoom: number };

const BUTTON: React.CSSProperties = {
  boxSizing: "border-box", background: "#fff", border: `1px solid ${HR.gray[300]}`, boxShadow: "0 1px 2px #1018280d",
  display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 500, color: HR.gray[700],
};

/** Bottom-left controls (controls/BottomLeftControls.vue): hand, then + / 100% / − as one group, then fit-to-screen. */
const Controls: React.FC<{ zoom: number }> = ({ zoom }) => (
  <div style={{ position: "absolute", left: 15, bottom: 15, display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ ...BUTTON, width: 48, height: 48, borderRadius: 8 }}><BIcon name="ghl:Hand" size={20} color={HR.gray[700]} /></div>
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ ...BUTTON, width: 48, height: 48, borderRadius: "8px 8px 0 0" }}><BIcon name="ghl:Plus" size={20} color={HR.gray[700]} /></div>
      <div style={{ ...BUTTON, width: 48, height: 56, borderTop: "none", borderBottom: "none", fontSize: 14 }}>{Math.round(zoom * 100)}%</div>
      <div style={{ ...BUTTON, width: 48, height: 48, borderRadius: "0 0 8px 8px" }}><BIcon name="ghl:Minus" size={20} color={HR.gray[700]} /></div>
    </div>
    <div style={{ ...BUTTON, width: 48, height: 48, borderRadius: 8 }}><BIcon name="ghl:Expand06" size={20} color={HR.gray[700]} /></div>
  </div>
);

/** MiniMap (WorkflowTreeV2.vue:173-181): 200×150 at 75 %, nodes as #e2e2e2 blocks, the viewport outlined in gray-400. */
const MiniMap: React.FC<{ layout: WorkflowLayout; view: CanvasView; width: number; height: number }> = ({ layout, view, width, height }) => {
  const vp = { x0: -view.x / view.zoom, y0: -view.y / view.zoom, x1: (width - view.x) / view.zoom, y1: (height - view.y) / view.zoom };
  const b = layout.bounds, x0 = Math.min(b.x0, vp.x0), y0 = Math.min(b.y0, vp.y0), x1 = Math.max(b.x1, vp.x1), y1 = Math.max(b.y1, vp.y1);
  const s = Math.max((x1 - x0) / 200, (y1 - y0) / 150), ox = x0 - (200 * s - (x1 - x0)) / 2, oy = y0 - (150 * s - (y1 - y0)) / 2;
  return (
    <div style={{ position: "absolute", right: 15, bottom: 15, width: 150, height: 112.5, borderRadius: 8, background: "#fff", border: `1px solid ${HR.gray[200]}`,
      boxShadow: "0 0 6px 4px rgba(0,0,0,.05)", overflow: "hidden" }}>
      <svg width={150} height={112.5} viewBox={`${ox} ${oy} ${200 * s} ${150 * s}`} style={{ display: "block" }}>
        {layout.nodes.map((n) => <rect key={n.id} x={n.x} y={n.y} width={n.w} height={n.h} rx={5 * s} fill="#e2e2e2" />)}
        <rect x={vp.x0} y={vp.y0} width={vp.x1 - vp.x0} height={vp.y1 - vp.y0} fill="none" stroke={HR.gray[400]} strokeWidth={1.3 * s * (200 / 150)} />
      </svg>
    </div>
  );
};

/** The canvas at `width × height`. `states`: per-node state; `hide`: node ids not drawn yet (for builds); `chrome`: draw the
 * zoom controls, minimap and top buttons (off for small, preview-sized canvases). */
export const WorkflowCanvas: React.FC<{
  wf: WorkflowSpec; width: number; height: number; view: CanvasView; states?: Record<string, NodeState>; chrome?: boolean; minimap?: boolean;
  border?: boolean; children?: React.ReactNode;
}> = ({ wf, width, height, view, states = {}, chrome = true, minimap = true, border = true, children }) => {
  const layout = layoutWorkflow(wf), g = CANVAS.gridGap * view.zoom;
  const grid = `linear-gradient(to right, ${CANVAS.grid} 1px, transparent 1px), linear-gradient(to bottom, ${CANVAS.grid} 1px, transparent 1px)`;
  const st = (id: string) => states[id] ?? {};
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", boxSizing: "border-box", borderRadius: CANVAS.radius, background: CANVAS.bg,
      border: border ? `1px solid ${CANVAS.border}` : undefined, fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: grid, backgroundSize: `${g}px ${g}px`,
        backgroundPosition: `${(view.x - g / 2).toFixed(2)}px ${(view.y - g / 2).toFixed(2)}px` }} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
          {layout.edges.filter((e) => e.d).map((e) => <path key={e.id} d={e.d} fill="none" stroke={st(e.to).path ? "#34D399" : CANVAS.edge} strokeWidth={st(e.to).path ? 2 : 1} />)}
        </svg>
        {layout.edges.map((e) => (e.plus ? <PlusButton key={`${e.id}-plus`} x={e.plus.x} y={e.plus.y} /> : null))}
        {layout.nodes.map((n) => {
          const s = st(n.id), o = s.dim ?? 1;
          const el = n.kind === "trigger" ? <TriggerCard n={n} s={s} /> : n.kind === "addTrigger" ? <AddTriggerCard n={n} /> : n.kind === "action" ? <ActionCard n={n} s={s} />
            : n.kind === "branch" ? <BranchCard n={n} s={s} /> : <EndPill n={n} />;
          return <div key={n.id} style={{ opacity: o }}>{el}{s.alert ? <AlertDot n={n} k={s.alert} /> : null}</div>;
        })}
        {children}
      </div>
      {chrome ? <>
        <div style={{ ...BUTTON, position: "absolute", left: 15, top: 15, width: 36, height: 36, borderRadius: 6 }}><BIcon name="ghl:Keyboard01" size={20} color={HR.gray[700]} /></div>
        <div style={{ ...BUTTON, position: "absolute", right: 15, top: 15, height: 40, padding: "0 16px", borderRadius: 6, fontSize: 14, gap: 8 }}>
          <BIcon name="ghl:Plus" size={20} color={HR.gray[700]} />Add
        </div>
        <Controls zoom={view.zoom} />
        {minimap ? <MiniMap layout={layout} view={view} width={width} height={height} /> : null}
      </> : null}
    </div>
  );
};

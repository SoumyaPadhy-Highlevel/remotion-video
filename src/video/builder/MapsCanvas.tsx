// Workflow Maps' workflow view canvas (WorkflowCanvasModal → AdvancedWorkflowCanvas, vertical, read-only), drawn the way the
// product draws it: white board with a #f7f7f7 line grid, 240 × 72 cards with a 40 px icon chip, purple If/Else lanes,
// grey handles, #b1b1b7 edges with dark arrowheads, and a contact's run on top (green path ring, marching dashes,
// Entered / Exited / Error / Action skipped chips). Values from advanced-workflow-canvas (NodeLayout.vue,
// VerticalNodeContent.vue, ExecutionStatusChip.vue, node-style-utils.ts, constants/index.ts).
import React from "react";
import { BIcon } from "./Nodes";
import { CanvasView } from "./Canvas";
import { WorkflowSpec } from "./layout";
import { layoutMaps, MAPS, MapsNode } from "./mapsLayout";
import { FONT, HR, toneColors } from "./tokens";

/** Values that differ from the builder's (advanced-workflow-canvas). Ring colours come from the app's Tailwind 4 palette. */
const MS = {
  border: HR.gray[300], radius: 12, shadow: "2px 2px 4px #d9d9d9",
  grid: "#f7f7f7", edge: "#b1b1b7", arrow: "#6b7280", handle: "#6b7280",
  ran: { border: HR.green[500], ring: "#dcfce7" }, failed: { border: "#EF4444", ring: "#FEE2E2" },
  selected: { primary: HR.primary[700], green: HR.green[700], purple: HR.purple[700] } as Record<string, string>,
};
type ChipKind = "entered" | "exited" | "error" | "skipped" | "current";
const CHIPS: Record<ChipKind, { label: string; icon: string; bg: string; border: string; glyph: string; text: string }> = {
  entered: { label: "Entered", icon: "ghl:LogIn02", bg: HR.blue[50], border: "#b2ddff", glyph: HR.blue[600], text: HR.blue[700] },
  exited: { label: "Exited", icon: "ghl:LogOut02", bg: HR.blue[50], border: "#b2ddff", glyph: HR.blue[600], text: HR.blue[700] },
  current: { label: "Current action", icon: "ghl:Signal01", bg: HR.green[50], border: "#aaf0c4", glyph: HR.green[600], text: HR.green[700] },
  error: { label: "Error", icon: "ghl:AlertTriangle", bg: "#FEF2F2", border: "#FECACA", glyph: "#EF4444", text: "#DC2626" },
  skipped: { label: "Action skipped", icon: "ghl:FastForward", bg: HR.gray[50], border: HR.gray[200], glyph: HR.gray[500], text: HR.gray[600] },
};

/** A node's state: in a run, `ran` (0–1, the path ring growing in over 0.3 s), `failed`, `skipped`, `selected` and its chips;
 * on an Add to Workflow step, `linked` (0–1 as it pops in) shows the "Linked" badge with its count. */
export type RunNodeState = { ran?: number; failed?: boolean; skipped?: boolean; selected?: boolean; chips?: ChipKind[]; chipsIn?: number; linked?: number; linkedCount?: number };

/** "Linked" (workflow-canvas-pane/LinkedAssetFloater.vue): a 2xs primary HLButton 8 px above the card's top-left, with the
 * count in a FilterCount pill and a chevron. */
const LinkedBadge: React.FC<{ n: MapsNode; k: number; count: number }> = ({ n, k, count }) => (
  <div style={{ position: "absolute", left: n.x, top: n.y - 8 - 28, height: 28, boxSizing: "border-box", padding: "0 8px", borderRadius: 4, display: "flex", alignItems: "center",
    background: HR.primary[600], border: `1px solid ${HR.primary[600]}`, boxShadow: "0 1px 2px #1018280D", color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: FONT,
    opacity: Math.min(1, k), transform: `scale(${(0.6 + 0.4 * k).toFixed(3)})`, transformOrigin: "0 100%" }}>
    Linked
    <span style={{ marginLeft: 6, height: 18, padding: "0 6px", borderRadius: 2, background: HR.gray[100], color: "#000", fontSize: 10, fontWeight: 500, display: "flex", alignItems: "center" }}>{count}</span>
    <BIcon name="ghl:ChevronDown" size={14} color="#fff" style={{ marginLeft: 4 }} />
  </div>
);

const Chip: React.FC<{ kind: ChipKind }> = ({ kind }) => {
  const c = CHIPS[kind];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, border: `1px solid ${c.border}`, background: c.bg,
      boxShadow: "0 1px 2px rgba(0,0,0,.05)", fontSize: 12, lineHeight: "16px", fontWeight: 500, color: c.text, whiteSpace: "nowrap" }}>
      <BIcon name={c.icon} size={12} color={c.glyph} />{c.label}
    </div>
  );
};

const Card: React.FC<{ n: MapsNode; s: RunNodeState }> = ({ n, s }) => {
  const c = toneColors(n.tone);
  const ran = s.ran ?? 0, ring = s.failed ? `0 0 0 8px ${MS.failed.ring}` : ran > 0 ? `0 0 0 ${(8 * Math.min(1, ran)).toFixed(1)}px ${MS.ran.ring}` : MS.shadow;
  const border = s.selected ? MS.selected[n.tone] ?? HR.primary[700] : s.failed ? MS.failed.border : ran > 0 ? MS.ran.border : MS.border;
  const branch = n.kind === "branch";
  return (
    <div style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h, boxSizing: "border-box", borderRadius: MS.radius, background: "#fff",
      border: `1px solid ${border}`, boxShadow: s.skipped ? "none" : ring, opacity: s.skipped ? 0.6 : 1,
      display: "flex", flexDirection: branch ? "column" : "row", alignItems: "center", justifyContent: branch ? "center" : "flex-start",
      padding: branch ? 8 : "16px 12px", fontFamily: FONT }}>
      {branch ? <>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 14, lineHeight: "20px", fontWeight: 600, color: HR.purple[700] }}>
          <BIcon name="vaadin:road-split" size={14} color={HR.purple[700]} />{n.label}
        </div>
        <div style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[600], whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 224 }}>{n.text}</div>
      </> : <>
        <span style={{ width: 40, height: 40, marginRight: 8, borderRadius: 6, background: c.box, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <BIcon name={n.icon} size={24} color={c.glyph} />
        </span>
        <span style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[600] }}>{n.label}</span>
      </>}
    </div>
  );
};

/** A 12 px handle (#6b7280, 1 px white ring) centred on (x, y). */
const Handle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 6, top: y - 6, width: 12, height: 12, boxSizing: "border-box", borderRadius: 6, background: MS.handle, border: "1px solid #fff" }} />
);

const BUTTON: React.CSSProperties = { boxSizing: "border-box", background: "#fff", border: `1px solid ${HR.gray[300]}`, display: "flex", alignItems: "center", justifyContent: "center" };

/** The canvas at `width × height` with the workflow at `view`; `states` paints a run on it, `t` drives the marching dashes,
 * `nav` adds the run navigation arrows (ExecutionNavigationControls.vue). */
export const MapsCanvas: React.FC<{ wf: WorkflowSpec; width: number; height: number; view: CanvasView; states?: Record<string, RunNodeState>; t?: number; nav?: boolean; controls?: boolean }> = ({
  wf, width, height, view, states = {}, t = 0, nav, controls = true,
}) => {
  const { nodes, edges } = layoutMaps(wf), g = 20 * view.zoom;
  const st = (id: string) => states[id] ?? {};
  const onPath = (id: string) => (st(id).ran ?? 0) > 0 || !!st(id).failed;
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${HR.gray[200]}`, background: "#fff", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      <div style={{ position: "absolute", inset: 0, backgroundSize: `${g}px ${g}px`, backgroundPosition: `${(view.x - g / 2).toFixed(2)}px ${(view.y - g / 2).toFixed(2)}px`,
        backgroundImage: `linear-gradient(to right, ${MS.grid} 1px, transparent 1px), linear-gradient(to bottom, ${MS.grid} 1px, transparent 1px)` }} />
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}>
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
          {edges.map((e) => {
            // an edge on the run marches (vue-flow .animated: dash 5, offset 10 → 0 every 0.5 s); its colour stays
            const run = onPath(e.from) && onPath(e.to);
            return <g key={e.id}>
              <path d={e.d} fill="none" stroke={MS.edge} strokeWidth={2} strokeDasharray={run ? "5" : undefined} strokeDashoffset={run ? 10 - ((t * 2) % 1) * 10 : undefined} />
              <path d={`M${e.end.x - 4.8} ${e.end.y - 6}L${e.end.x} ${e.end.y}L${e.end.x + 4.8} ${e.end.y - 6}Z`} fill={MS.arrow} stroke={MS.arrow} strokeWidth={1} strokeLinejoin="round" />
            </g>;
          })}
        </svg>
        {nodes.map((n) => <Card key={n.id} n={n} s={st(n.id)} />)}
        {nodes.map((n) => <React.Fragment key={`${n.id}-h`}>
          <Handle x={n.x + n.w / 2} y={n.y + n.h + MAPS.handle / 2} />
          {n.kind === "action" ? <Handle x={n.x + n.w / 2} y={n.y - MAPS.handle * 0.2} /> : null}
        </React.Fragment>)}
        {nodes.map((n) => (st(n.id).linked ? <LinkedBadge key={`${n.id}-l`} n={n} k={st(n.id).linked!} count={st(n.id).linkedCount ?? 1} /> : null))}
        {nodes.map((n) => {
          const chips = st(n.id).chips ?? [];
          // chips sit above the card, in a 130 px column starting 24 px left of it; two stack 4 px apart
          return chips.length ? (
            <div key={`${n.id}-c`} style={{ position: "absolute", left: n.x - 24, top: n.y - (chips.length > 1 ? 60 : 36), width: 130, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              opacity: st(n.id).chipsIn ?? 1 }}>
              {chips.map((k) => <Chip key={k} kind={k} />)}
            </div>
          ) : null;
        })}
      </div>
      {/* bottom-left controls (read-only): fit, zoom out, zoom in, download */}
      {controls ? <div style={{ position: "absolute", left: 15, bottom: 15, display: "flex", gap: 8 }}>
        {["ghl:Expand05", "ghl:ZoomOut", "ghl:ZoomIn", "ghl:Download01"].map((i) => <div key={i} style={{ ...BUTTON, width: 40, height: 40, borderRadius: 6 }}><BIcon name={i} size={20} color={HR.gray[700]} /></div>)}
      </div> : null}
      {nav ? ["ghl:ArrowLeft", "ghl:ArrowRight"].map((i, k) => (
        <div key={i} style={{ ...BUTTON, position: "absolute", [k ? "right" : "left"]: 12, top: height / 2 - 22, width: 44, height: 44, borderRadius: 8 }}><BIcon name={i} size={20} color={HR.gray[600]} /></div>
      )) : null}
    </div>
  );
};

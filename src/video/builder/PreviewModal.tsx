// Workflow Maps' workflow preview, as "View step" opens it (automation-workflows-frontend master,
// grid-right-sidebar/workflow-canvas-modal/WorkflowCanvasModal.vue): the modal, its header (name, status, Open in builder,
// Open in new tab, close), the canvas (MapsCanvas: a classic workflow previews vertically) and, for the highlighted step,
// the read-only detail pane (AsideSectionLite: header, "View-only mode" alert, the step's fields). Values resolved from the
// Highrise / ghl-ui tokens; window px (the modal fills the 1620×880 app window as it fills the product's viewport).
import React from "react";
import { CanvasView } from "./Canvas";
import { WorkflowSpec } from "./layout";
import { MapsCanvas, RunNodeState } from "./MapsCanvas";
import { BIcon } from "./Nodes";
import { FONT, HR } from "./tokens";

/** UIModal: width innerWidth − 48 (1572), 24 px padding, 12 px radius; header 32 + 8; body calc(100vh − 120) = 760; centred. */
export const MODAL = { left: 24, top: 16, width: 1572, height: 848, pad: 24, bodyTop: 64, bodyH: 760, pane: 450, gap: 12 };
export const MODAL_CANVAS = { left: MODAL.left + MODAL.pad, top: MODAL.top + MODAL.bodyTop, width: MODAL.width - 2 * MODAL.pad - MODAL.gap - MODAL.pane, height: MODAL.bodyH };

const SEC: React.CSSProperties = { height: 32, boxSizing: "border-box", padding: "6px 10px", borderRadius: 4, border: `1px solid ${HR.gray[300]}`, background: "#fff", boxShadow: "0 1px 2px #1018280D",
  display: "flex", alignItems: "center", gap: 8, fontSize: 13, lineHeight: "18px", fontWeight: 600, color: HR.gray[600], whiteSpace: "nowrap" };
const LABEL: React.CSSProperties = { display: "block", textTransform: "uppercase", letterSpacing: "0.3px", color: HR.gray[700], fontSize: 12, lineHeight: "16px", fontWeight: 700, marginBottom: 8 };

/** A tag chip in a ghl-ui multiple select (naive Tag medium, closable): 28 px, 0 7px, 2 px radius, #eee, #e0e0e6, 14 px #344054. */
const Chip: React.FC<{ text: string; glow?: number }> = ({ text, glow = 0 }) => (
  <span style={{ height: 28, boxSizing: "border-box", padding: "0 7px", borderRadius: 2, background: "#eeeeee", border: "1px solid #e0e0e6", color: HR.gray[700], fontSize: 14, lineHeight: 1,
    display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
    // the video's highlight (not the product's): a primary ring that swells and fades, to show where the tag is
    boxShadow: glow > 0.01 ? `0 0 0 ${(2 * glow).toFixed(2)}px ${HR.primary[500]}, 0 0 0 ${(2 + 5 * glow).toFixed(2)}px rgba(41,112,255,${(0.25 * glow).toFixed(3)})` : undefined }}>
    {text}<span style={{ width: 18, textAlign: "center", color: "#666", fontSize: 14 }}>×</span></span>
);

export type PaneStep = { kind: "trigger" | "action"; title: string; icon: string; tone: "green" | "primary"; fields: ({ label: string; input: string } | { label: string; chips: string[] })[] };

/** AsideSectionLite: header (46 px tile, 12 px radius, {c}-50 / 24 px {c}-700 glyph; title 14/20 600; subtitle 12/16 gray-500;
 *  28 px close), the orange "View-only mode" alert, then the fields (labels 12/16 700 uppercase gray-700). */
const DetailPane: React.FC<{ step: PaneStep; glowChip?: string; glow?: number }> = ({ step, glowChip, glow = 0 }) => {
  const c = step.tone === "green" ? { box: HR.green[50], glyph: HR.green[700] } : { box: HR.primary[50], glyph: HR.primary[700] };
  return (
    <div style={{ width: MODAL.pane, height: MODAL.bodyH, boxSizing: "border-box", border: `1px solid ${HR.gray[200]}`, borderRadius: 8, background: "#fff", overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "12px 16px", borderBottom: `1px solid ${HR.gray[200]}` }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: c.box, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><BIcon name={step.icon} size={24} color={c.glyph} /></span>
        <div style={{ flex: 1, minWidth: 0, marginLeft: 4, paddingTop: 4 }}>
          <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: HR.gray[900] }}>{step.title}</div>
          <div style={{ fontSize: 12, lineHeight: "16px", color: HR.gray[500] }}>{step.kind === "trigger" ? "Trigger" : "Action"}</div>
        </div>
        <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="ghl:X" size={20} color={HR.gray[700]} /></span>
      </div>
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ boxSizing: "border-box", borderRadius: 12, border: "1px solid #fec84b", background: "#fffcf5", padding: 8, display: "flex" }}>
          <BIcon name="ghl:AlertTriangle" size={20} color="#dc6803" style={{ margin: "0 8px" }} />
          <div>
            <div style={{ fontSize: 14, lineHeight: "20px", fontWeight: 600, color: "#b54708" }}>View-only mode</div>
            <div style={{ marginTop: 2, fontSize: 13, lineHeight: "18px", color: "#b54708" }}>You can explore this configuration but cannot make changes</div>
          </div>
        </div>
      </div>
      <div style={{ margin: "16px 0", padding: "0 16px" }}>
        {step.fields.map((f, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <span style={LABEL}>{f.label}</span>
            {"input" in f
              ? <div style={{ height: 38, boxSizing: "border-box", borderRadius: 4, border: `1px solid ${HR.gray[300]}`, padding: "8px 12px", fontSize: 14, lineHeight: "20px", color: HR.gray[900], boxShadow: "0 1px 2px 0 rgba(0,0,0,.05)" }}>{f.input}</div>
              : <div style={{ display: "flex", marginTop: 8 }}>
                <div style={{ flex: 1, height: 40, boxSizing: "border-box", borderRadius: "8px 0 0 8px", border: `1px solid ${HR.gray[300]}`, boxShadow: "0 1px 2px #1018280D", display: "flex", alignItems: "center", gap: 6, padding: "0 8px" }}>
                  {f.chips.map((c2) => <Chip key={c2} text={c2} glow={c2 === glowChip ? glow : 0} />)}
                </div>
                <div style={{ width: 40, height: 40, boxSizing: "border-box", borderRadius: "0 8px 8px 0", border: `1px solid ${HR.gray[300]}`, borderLeft: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BIcon name="ghl:DotsVertical" size={16} color={HR.gray[700]} />
                </div>
              </div>}
          </div>
        ))}
      </div>
    </div>
  );
};

/** The preview at `k` (0–1, the modal's fade/scale), its canvas at `view` with `states`, and the detail pane sliding in with `pane`. */
export const PreviewModal: React.FC<{ k: number; name: string; wf: WorkflowSpec; view: CanvasView; states: Record<string, RunNodeState>; pane: number; step: PaneStep; t: number;
  glowChip?: string; glow?: number }> = ({ k, name, wf, view, states, pane, step, t, glowChip, glow }) => {
  if (k <= 0.001) return null;
  const cw = MODAL_CANVAS.width + (MODAL.gap + MODAL.pane) * (1 - Math.min(1, pane * 4));   // the pane takes its room as it opens
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>
      {/* backdrop: --hr-backdrop-color rgba(16,24,40,.7) */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,.7)", opacity: k }} />
      <div style={{ position: "absolute", left: MODAL.left, top: MODAL.top, width: MODAL.width, height: MODAL.height, boxSizing: "border-box", padding: MODAL.pad, borderRadius: 12, background: "#fff",
        boxShadow: "0 20px 24px -4px #10182814, 0 8px 8px -4px #10182808", opacity: k, transform: `scale(${(0.96 + 0.04 * k).toFixed(4)})`, transformOrigin: "50% 50%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, height: 32, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1.6, fontWeight: 500, color: HR.gray[900] }}>{name}</span>
            <span style={{ height: 28, padding: "0 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", fontSize: 13, lineHeight: "18px", fontWeight: 500, background: "#ecfdf3", color: "#027a48" }}>Published</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={SEC}><BIcon name="akar-icons:arrow-up-right" size={16} color={HR.gray[600]} />Open in builder</span>
            <span style={SEC}><BIcon name="ghl:LinkExternal01" size={16} color={HR.gray[600]} />Open in new tab</span>
            <span style={{ ...SEC, width: 32, padding: 0, justifyContent: "center" }}><BIcon name="ghl:X" size={16} color={HR.gray[600]} /></span>
          </div>
        </div>
        <div style={{ display: "flex", gap: MODAL.gap }}>
          <MapsCanvas wf={wf} width={cw} height={MODAL.bodyH} view={view} states={states} t={t} />
          <div style={{ opacity: pane, transform: `translateX(${(100 * (1 - pane)).toFixed(1)}%)` }}><DetailPane step={step} glowChip={glowChip} glow={glow} /></div>
        </div>
      </div>
    </div>
  );
};

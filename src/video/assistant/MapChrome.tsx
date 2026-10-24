// What the map itself shows while the Assistant works, drawn as staging shows it: the layout editor's notices
// (use-grid-layout-editor.ts showMessage: "Created a folder", "Moved … / Your changes aren't saved yet", "Map changes
// saved"), at the canvas's bottom-right, and the header's Save button once there is an unsaved change ("Save 1 change").
// Window px.
import React from "react";
import { BIcon } from "../builder/Nodes";
import { ASSISTANT } from "../script";
import { FONT, HR, MAP_CANVAS, SHADOW } from "./tokens";

const txt = (size: number, color: string, weight = 400, lh = 1.5): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, color, fontWeight: weight, lineHeight: lh });

/** A notice: `tile` dark (a folder was created, saved at once) or light (an unsaved layout change, with Undo). */
export const MapToast: React.FC<{ icon: string; dark?: boolean; title: string; body: string; undo?: boolean; k?: number; width?: number }> =
  ({ icon, dark, title, body, undo, k = 1, width = 418 }) => (
    <div style={{ position: "absolute", right: 1620 - (MAP_CANVAS.left + MAP_CANVAS.width) + 18, bottom: 880 - 804, width, boxSizing: "border-box",
      display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 12px 12px 14px", borderRadius: 8, background: HR.white,
      border: `1px solid ${HR.gray200}`, boxShadow: "0 12px 16px -4px rgba(16,24,40,.08), 0 4px 6px -2px rgba(16,24,40,.03)",
      opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 12}px)` }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
        background: dark ? HR.gray600 : HR.gray50, border: dark ? undefined : `1px solid ${HR.gray100}` }}>
        <BIcon name={icon} size={16} color={dark ? HR.white : HR.gray500} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={txt(14, HR.gray900, 600, 1.45)}>{title}</div>
        <div style={{ marginTop: 2, ...txt(12, HR.gray600, 400, 1.5) }}>{body}</div>
      </div>
      {undo ? <div style={{ height: 28, padding: "0 10px", display: "flex", alignItems: "center", borderRadius: 4, border: `1px solid ${HR.gray300}`,
        background: HR.white, boxShadow: SHADOW.xs, ...txt(12, HR.gray700, 600, 1) }}>{ASSISTANT.plan.undo}</div> : null}
    </div>
  );

/** The header's right cluster with an unsaved change: history, undo (enabled) / redo, and "Save 1 change". */
export const HeaderSave: React.FC = () => {
  const box: React.CSSProperties = { height: 36, boxSizing: "border-box", border: `1px solid ${HR.gray200}`, borderRadius: 6, background: HR.white,
    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.xs };
  return (
    <div style={{ position: "absolute", left: 1300, top: 8, width: 312, height: 48, background: HR.white, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, paddingRight: 6, boxSizing: "border-box" }}>
      <div style={{ ...box, width: 36 }}><BIcon name="ghl:ClockRewind" size={18} color={HR.gray700} /></div>
      <div style={{ ...box, width: 72, gap: 0 }}>
        <div style={{ width: 36, display: "flex", justifyContent: "center" }}><BIcon name="ghl:ReverseLeft" size={16} color={HR.gray700} /></div>
        <div style={{ width: 36, display: "flex", justifyContent: "center", opacity: 0.35 }}><BIcon name="ghl:ReverseLeft" size={16} color={HR.gray400} style={{ transform: "scaleX(-1)" }} /></div>
      </div>
      <div style={{ ...box, border: `1px solid ${HR.primary600}`, background: HR.primary600, padding: "0 14px", gap: 8 }}>
        <BIcon name="ghl:Save01" size={18} color={HR.white} />
        <span style={txt(14, HR.white, 600, 1)}>{ASSISTANT.saveChanges}</span>
      </div>
    </div>
  );
};

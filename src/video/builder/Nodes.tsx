// The builder's canvas pieces, drawn the way the product draws them (automation-workflows-frontend
// src/components/workflow-canvas/**): trigger card, "Add new trigger", action card, If/Else branch card, END pill and the
// "+" on an edge. Sizes and colours come from tokens.ts; positions from layout.ts. All in canvas px at zoom 1.
import React from "react";
import { BUILDER_ICONS } from "./icons";
import { ActionSpec, IfElseSpec, PlacedNode, TriggerSpec } from "./layout";
import { ACTION, ADD_TRIGGER, BRANCH, CANVAS, CARD, END, FONT, HR, PLUS, TRIGGER, toneColors } from "./tokens";

/** A builder icon (scripts/builder-icons.mjs) at `size` px in `color`. */
export const BIcon: React.FC<{ name: string; size: number; color: string; style?: React.CSSProperties }> = ({ name, size, color, style }) => {
  const icon = BUILDER_ICONS[name];
  if (!icon) throw new Error(`Builder icon "${name}" is missing: add it to scripts/builder-icons.mjs and re-run it`);
  return <svg width={size} height={size} viewBox={`0 0 ${icon.w} ${icon.h}`} style={{ color, display: "block", flex: "none", ...style }} dangerouslySetInnerHTML={{ __html: icon.body }} />;
};

const text = (size: number, color: string, weight = 400, lineHeight = 16): React.CSSProperties => ({ fontFamily: FONT, fontSize: size, lineHeight: `${lineHeight}px`, fontWeight: weight, color });
const ellipsis: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
/** Node states the video uses: `selected` (blue border), `error` (red border + ring), `path` (green execution path), `alert`
 * (the builder's error indicator at the card's bottom-right corner, 0–1 as it appears), `dim` (opacity). */
export type NodeState = { selected?: boolean; error?: boolean; path?: boolean; alert?: number; dim?: number };

/** The builder's error indicator (highlight-error/ErrorHighlightIndicator.vue, assets/icons/alert-circle-filled.svg): 20 px,
 * 8 px outside the card's bottom-right corner. */
export const AlertDot: React.FC<{ n: PlacedNode; k: number }> = ({ n, k }) => (
  <svg width={20} height={20} viewBox="0 0 24 24" style={{ position: "absolute", left: n.x + n.w - 12, top: n.y + n.h - 12, opacity: Math.min(1, k), transform: `scale(${(0.6 + 0.4 * k).toFixed(3)})` }}>
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FF692E" />
    <path d="M12 8C12 9.5621 12 10.4379 12 12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

const chrome = (s: NodeState, radius = CARD.radius): React.CSSProperties => ({
  boxSizing: "border-box", borderRadius: radius, background: CARD.bg,
  border: s.error ? `2px solid ${HR.red[500]}` : s.path ? `2px solid ${HR.green[400]}` : `1px solid ${s.selected ? CARD.selected : CARD.border}`,
  boxShadow: s.error ? `0 0 0 4px ${HR.red[100]}, ${CARD.shadow}` : CARD.shadow,
});

/** Trigger card (trigger-node/TriggerNode.vue): header (icon, type, name), up to two filter lines, footer with Stats. */
export const TriggerCard: React.FC<{ n: PlacedNode & { kind: "trigger" }; s?: NodeState }> = ({ n, s = {} }) => {
  const t: TriggerSpec = n.trigger, c = toneColors(t.tone, true), name = t.name ?? t.title;
  return (
    <div style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h, ...chrome(s), display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ height: TRIGGER.headerH, padding: "8px 12px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: TRIGGER.iconW, height: TRIGGER.iconH, borderRadius: 6, background: c.box, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
          <BIcon name={t.icon} size={20} color={c.glyph} />
        </span>
        <div style={{ width: 168, overflow: "hidden" }}>
          {name.toLowerCase() !== t.title.toLowerCase() ? <div style={{ ...text(12, c.glyph, 500, 18), ...ellipsis }}>{t.title}</div> : null}
          <div style={{ ...text(12, TRIGGER.sub, 400, 18), ...ellipsis }}>{name}</div>
        </div>
      </div>
      <div style={{ height: TRIGGER.bodyH, padding: "8px 12px", boxSizing: "border-box", borderTop: `1px solid ${CARD.divider}`, display: "flex", flexDirection: "column", gap: 6 }}>
        {t.filters.length ? t.filters.slice(0, 2).map((f, i) => (
          <div key={f} style={{ display: "flex", gap: 4 }}>
            <span style={{ ...text(12, TRIGGER.body), ...ellipsis, flex: 1 }}>{f}</span>
            {i === 1 && t.filters.length > 2 ? <span style={text(12, TRIGGER.body, 500)}>+ {t.filters.length - 2} more</span> : null}
          </div>
        )) : <div style={text(12, TRIGGER.body)}>No filters applied</div>}
      </div>
      <div style={{ height: TRIGGER.footerH, padding: "0 12px", boxSizing: "border-box", borderTop: `1px solid ${CARD.divider}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <BIcon name="ghl:Copy03" size={16} color={HR.gray[700]} /><BIcon name="ghl:Trash03" size={16} color={HR.gray[700]} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...text(14, TRIGGER.stats, 500, 20) }}>
          <BIcon name="ghl:BarChart07" size={16} color={TRIGGER.stats} />Stats
        </div>
      </div>
    </div>
  );
};

/** "Add new trigger" (AddTriggerNode.vue): dashed blue card with a white "+" tile. */
export const AddTriggerCard: React.FC<{ n: PlacedNode }> = ({ n }) => (
  <div style={{
    position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h, boxSizing: "border-box", padding: "16px 12px", display: "flex", alignItems: "center",
    background: ADD_TRIGGER.bg, border: `1px dashed ${ADD_TRIGGER.border}`, borderRadius: ADD_TRIGGER.radius, ...text(12, ADD_TRIGGER.text, 600),
  }}>
    <span style={{ marginRight: 8, padding: 8, borderRadius: 6, background: "#fff" }}><BIcon name="mdi:plus" size={20} color={ADD_TRIGGER.text} /></span>
    Add new trigger
  </div>
);

/** Action card (workflow-canvas/V2/ActionNode.vue). An If/Else step is the same card with the `{ }` icon in primary. */
export const ActionCard: React.FC<{ n: PlacedNode & { kind: "action" }; s?: NodeState }> = ({ n, s = {} }) => {
  const a: ActionSpec | IfElseSpec = n.action;
  const c = a.kind === "ifElse" ? toneColors("primary") : toneColors(a.tone), icon = a.kind === "ifElse" ? "mdi:code-braces" : a.icon;
  return (
    <div style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h, ...chrome(s), display: "flex", alignItems: "center", padding: `0 ${ACTION.padX}px` }}>
      <span style={{ width: ACTION.icon, height: ACTION.icon, marginRight: 8, borderRadius: ACTION.iconRadius, background: c.box, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <BIcon name={icon} size={ACTION.iconGlyph} color={c.glyph} />
      </span>
      <span style={{ ...text(12, ACTION.label), flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{a.label}</span>
      <span style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><BIcon name="ghl:DotsHorizontal" size={16} color={ACTION.menu} /></span>
    </div>
  );
};

/** If/Else branch card (branch-custom-nodes/IfElseBranchNode.vue): purple title with the road-split icon, one line of
 * condition, a 4 px purple bottom edge, inside the node wrapper's 1 px gray-200 border. */
export const BranchCard: React.FC<{ n: PlacedNode & { kind: "branch" }; s?: NodeState }> = ({ n, s = {} }) => (
  <div style={{ position: "absolute", left: n.x, top: n.y, width: n.w, height: n.h, boxSizing: "border-box", borderRadius: CARD.radius, background: "#fff",
    border: s.path ? `2px solid ${HR.green[400]}` : `1px solid ${s.selected ? HR.purple[600] : BRANCH.wrapBorder}`, overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: CARD.radius, borderBottom: `4px solid ${BRANCH.accent}`, padding: 8, boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ height: 20, display: "flex", alignItems: "center", gap: 4, ...text(12, BRANCH.title, 600) }}>
        <BIcon name="vaadin:road-split" size={18} color={BRANCH.title} />{n.title}
      </div>
      <div style={{ marginTop: 4, ...text(12, BRANCH.text), ...ellipsis, maxWidth: 224 }}>{n.text}</div>
    </div>
  </div>
);

/** END pill (EndNode.vue). */
export const EndPill: React.FC<{ n: PlacedNode }> = ({ n }) => (
  <div style={{ position: "absolute", left: n.x, top: n.y, width: END.w, height: END.h, boxSizing: "border-box", borderRadius: 999, background: END.bg, border: `1px solid ${END.bg}`,
    display: "flex", alignItems: "center", justifyContent: "center", ...text(12, END.text) }}>END</div>
);

/** The "+" on an edge (PlusButton.vue), centred on (x, y), with the 10 px tick under it (EdgeWithPlus.vue). */
export const PlusButton: React.FC<{ x: number; y: number; hover?: number }> = ({ x, y, hover = 0 }) => (
  <>
    <div style={{ position: "absolute", left: x - 0.5, top: y + PLUS.size / 2, width: 1, height: 10, background: CANVAS.edge }} />
    <div style={{ position: "absolute", left: x - PLUS.size / 2, top: y - PLUS.size / 2, width: PLUS.size, height: PLUS.size, boxSizing: "border-box", borderRadius: 999,
      background: hover ? HR.primary[200] : PLUS.bg, border: `1px dashed ${PLUS.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <BIcon name="ghl:Plus" size={16} color={hover ? HR.blue[600] : PLUS.icon} />
    </div>
  </>
);

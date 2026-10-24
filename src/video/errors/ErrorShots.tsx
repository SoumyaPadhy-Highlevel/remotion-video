// "Fix errors fast" (film 143.3–153.6 s, timeline 147.2–157.5 s), redrawn as Workflow Maps draws it on master. The film's
// own panels for this scene were styled by hand; here every piece comes from automation-workflows-frontend:
//   map + error marker   ThreeCanvas / GridBox / GridErrorIndicatorRenderer (the map itself is map3d's MapView)
//   attention card       GridErrorSummary, GridErrorSummaryHeader, GridErrorSummaryGroup, WorkflowStatusTabs
//   right panel          NodeDetailDrawer → WorkflowDetailPanel, WorkflowEnrollmentStats, WorkflowErrorNotice,
//                        WorkflowFailedExecutionList (selecting a summary row opens it straight on the failed executions)
//   run modal            WorkflowCanvasModal, ExecutionLogPanel, the advanced canvas (MapsCanvas), ExecutionLogDetailPanel
// Values: Tailwind 2 defaults for red, HighRise tokens for the rest (spec in the session notes; `HR` in builder/tokens.ts).
// The film still supplies the page chrome (header, left rail); its filter pills and bottom toolbars are lifted from one
// film frame and laid over the redrawn map. Times are film seconds (timeline − 3.9).
import React from "react";
import { Freeze, OffthreadVideo, staticFile } from "remotion";
import { cubicBezier, mix, transform } from "motion";
import { springAt } from "../anim";
import { APP_FILE, BUILDER_WORKFLOWS, FPS } from "../script";
import { BIcon } from "../builder/Nodes";
import { MapsCanvas, RunNodeState } from "../builder/MapsCanvas";
import { layoutMaps } from "../builder/mapsLayout";
import { HR } from "../builder/tokens";
import { Cursor } from "../builder/shotKit";
import { EdgeLook, MapCamera, MapView, NodeLook, projectToCanvas } from "../map3d/MapScene";
import { FILM_WORLDS } from "../map3d/filmMap";
import { depthForShape, hoverHeightScale } from "../map3d/geometry";

/** The moments of the scene (film s). Holds: the "Spot what needs attention" card holds film 144.75, "Jump straight to the
 * failed step" holds 151.25, so the card is still collapsed at the first and the run is painted at the second. */
export const ERRORS = {
  from: 143.3, to: 153.6,
  cardClick: 145.85, rowClick: 146.85, execClick: 149.7, logs: 150.1, stepClick: 151.9,
};
const T = ERRORS;

// ── tokens (resolved from the frontend's Tailwind 2 config + HighRise) ──
const RED = { 50: "#fef2f2", 100: "#fee2e2", 200: "#fecaca", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c" };
const SUCCESS = { 50: "#ecfdf3", 600: "#039855", 700: "#027a48" };
const ERROR = { 50: "#fef3f2", 700: "#b42318" };
const PRIMARY = { 100: "#d1e0ff", 500: "#2970ff", 600: "#155eef", 700: "#004eeb" };
const COBALT = "#2455d6";
const FONT = `"Inter var", Inter, system-ui, sans-serif`;
const SHADOW_XS = "0px 1px 2px 0px #1018280D";
const SHADOW_SM = "0 1px 2px 0 rgba(0,0,0,0.05)";
const SHADOW_LG = "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)";
/** motion-v's default tween curve (easeInOut) and the canvas pan (AnimationScheduler LAYOUT_SPRING). */
const mvEaseInOut = cubicBezier(0.42, 0, 0.58, 1);
const mvEaseOut = cubicBezier(0, 0, 0.58, 1);
const panEase = cubicBezier(0.22, 0.68, 0, 1);
const cssEase = cubicBezier(0.25, 0.1, 0.25, 1);

/** The page: 64 px header, 12 px workspace padding, 36 px rail; the canvas and the 450 px detail panel (window px). */
const PAGE = { canvasLeft: 60, top: 76, bottom: 868, right: 1608, panelW: 450, gap: 12 };
const CANVAS_FULL = PAGE.right - PAGE.canvasLeft;
const CANVAS_NARROW = PAGE.right - PAGE.panelW - PAGE.gap - PAGE.canvasLeft;
const CANVAS_H = PAGE.bottom - PAGE.top;

// ── story data (the workflow and runs the video follows; names are examples) ──
const WF = { id: "program-payment", name: "Program Payment Received", folder: "01 · Lead Capture", folderTint: "#3b82f6" };
const FAILED = [
  { step: "Send Email", contact: "Jordan Smith", at: "Oct 19th, 7:37:42 pm" },
  { step: "Send Email", contact: "Casey Morgan", at: "Oct 19th, 6:12:09 pm" },
  { step: "Send Email", contact: "Taylor Reynolds", at: "Oct 19th, 5:48:31 pm" },
];
const RUN_LOG = [
  { step: "Send Email", at: "Oct 19th, 7:37:42 pm", status: "Failed" as const },
  { step: "Add Contact Tag", at: "Oct 19th, 7:37:41 pm", status: "Finished" as const },
  { step: "Add to workflow", at: "Oct 19th, 7:37:40 pm", status: "Added To Workflow" as const },
];
const MESSAGE = "The email template could not be found.";

// ── small primitives ──
const txt = (size: number, lh: number, weight: number, color: string): React.CSSProperties => ({ fontSize: size, lineHeight: `${lh}px`, fontWeight: weight, color });
const ellipsis: React.CSSProperties = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 };

/** GridAssetIcon: a rounded-md tile with a white glyph at half its size. */
const AssetIcon: React.FC<{ size: number; type: "error" | "workflow" }> = ({ size, type }) => (
  <span style={{ width: size, height: size, borderRadius: 6, flex: "none", display: "flex", alignItems: "center", justifyContent: "center",
    background: type === "error" ? RED[500] : COBALT }}>
    <BIcon name={type === "error" ? "mdi:alert-circle" : "mdi:sitemap"} size={size / 2} color="#fff" />
  </span>
);

/** HLTag (unbordered): sm 22 px / 0 6px / 12px 17px 500; lg 28 px / 0 8px / 13px 18px 500. */
const Tag: React.FC<{ label: string; tone: "success" | "error" | "blue"; size?: "sm" | "lg" }> = ({ label, tone, size = "sm" }) => {
  const c = tone === "success" ? [SUCCESS[50], SUCCESS[700]] : tone === "error" ? [ERROR[50], ERROR[700]] : [HR.blue[50], HR.blue[700]];
  const lg = size === "lg";
  return <span style={{ height: lg ? 28 : 22, padding: lg ? "0 8px" : "0 6px", borderRadius: 4, background: c[0], display: "inline-flex", alignItems: "center",
    flex: "none", whiteSpace: "nowrap", ...txt(lg ? 13 : 12, lg ? 18 : 17, 500, c[1]) }}>{label}</span>;
};

/** HLButton. `secondary` gray: white, 1 px gray-300; `text`: no box; `primary` blue. Sizes md 40 / sm 36 / xs 32. */
const Button: React.FC<{ kind: "primary" | "secondary" | "text"; size: "md" | "sm" | "xs"; color?: "gray" | "blue"; icon?: string; iconSize?: number; label?: string; style?: React.CSSProperties }> = ({
  kind, size, color = "gray", icon, iconSize, label, style,
}) => {
  const h = { md: 40, sm: 36, xs: 32 }[size], text = kind === "text";
  const fg = kind === "primary" ? "#fff" : text ? (color === "blue" ? PRIMARY[700] : HR.gray[700]) : HR.gray[600];
  const iconOnly = !label;
  const pad = text ? 0 : iconOnly ? { md: 10, sm: 8, xs: 8 }[size] : undefined;
  return (
    <span style={{ height: text ? undefined : h, width: iconOnly && !text ? h : undefined, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center",
      gap: 8, flex: "none", borderRadius: text || size === "xs" ? 4 : 8, padding: pad ?? (size === "md" ? "10px 16px" : size === "sm" ? "8px 14px" : "6px 10px"),
      background: kind === "primary" ? PRIMARY[600] : text ? "transparent" : "#fff", border: text ? "none" : `1px solid ${kind === "primary" ? PRIMARY[600] : HR.gray[300]}`,
      boxShadow: text ? "none" : SHADOW_XS, whiteSpace: "nowrap", ...txt(size === "xs" ? 13 : 14, size === "xs" ? 18 : 20, 600, fg), ...style }}>
      {icon ? <BIcon name={icon} size={iconSize ?? (size === "xs" ? 16 : 20)} color={text ? (color === "blue" ? PRIMARY[700] : HR.gray[600]) : fg} /> : null}
      {label}
    </span>
  );
};

/** GridSectionTitle: 12px/16px 600, wide tracking, uppercase, gray-500, 4 px vertical padding. */
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.025em", ...txt(12, 16, 600, HR.gray[500]) }}>{children}</div>
);

// ── the map ──
const SCENE = FILM_WORLDS.main;
const NODE = SCENE.nodes.find((n) => n.id === WF.id)!;
/** The overview the film holds (canvas px), and where the pan to the workflow ends: PAN_TO_NODE_ZOOM 1 (s = canvas h / 10),
 * the workflow in the middle of the canvas left of the panel. */
const CAM0: MapCamera = { cx: 813.3 - PAGE.canvasLeft, cy: 333.1 - PAGE.top, s: 39.557 };
const S1 = CANVAS_H / 10;
const at = (cam: MapCamera, y = 0) => projectToCanvas(cam, NODE.x, y, NODE.z);
const camAt = (ft: number): MapCamera => {
  const k = transform(ft, [T.rowClick, T.rowClick + 0.7], [0, 1], { ease: panEase });
  const [x0, y0] = at(CAM0), s = mix(CAM0.s, S1, k);
  const [ox, oy] = at({ cx: 0, cy: 0, s });
  return { cx: mix(x0, CANVAS_NARROW / 2, k) - ox, cy: mix(y0, CANVAS_H / 2, k) - oy, s };
};

/** The red diamond over a workflow with recent errors (GridErrorIndicatorRenderer): a 48 px white square turned 45°,
 * 12 px corners, 4 px red-100 border, shadow-lg, holding a 36 px red-500 square with an upright 20 px alert glyph. It
 * stands 14 px above the node's top face and scales with the zoom between 0.35 and 1. */
const ErrorMarker: React.FC<{ x: number; y: number; scale: number }> = ({ x, y, scale }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
    <div style={{ position: "absolute", left: 0, bottom: 14, width: 48, height: 48, transformOrigin: "bottom center", transform: `translateX(-50%) scale(${scale})` }}>
      <div style={{ width: 48, height: 48, boxSizing: "border-box", transform: "rotate(45deg)", borderRadius: 12, border: `4px solid ${RED[100]}`, background: "#fff",
        boxShadow: SHADOW_LG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ width: 36, height: 36, borderRadius: 8, background: RED[500], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BIcon name="mdi:alert-circle" size={20} color="#fff" style={{ transform: "rotate(-45deg)" }} />
        </span>
      </div>
    </div>
  </div>
);

/** A crop of one film frame (window px), placed at (x, y): the film's filter pills and bottom toolbars. */
const FilmCrop: React.FC<{ src: [number, number, number, number]; x: number; y: number }> = ({ src: [sx, sy, w, h], x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden" }}>
    <Freeze frame={0}>
      <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(T.from * FPS)}
        style={{ position: "absolute", left: -sx, top: -sy, width: 1620, height: 880 }} />
    </Freeze>
  </div>
);
const PILLS: [number, number, number, number] = [76, 92, 768, 31];
const TOOLS_L: [number, number, number, number] = [76, 815, 223, 38];
const TOOLS_R: [number, number, number, number] = [1238, 815, 358, 38];

const MapLayer: React.FC<{ ft: number }> = ({ ft }) => {
  const picked = ft >= T.rowClick;
  const w = picked ? CANVAS_NARROW : CANVAS_FULL;
  const cam = camAt(ft);
  const sel = springAt(ft, T.rowClick, 0.6, 0.2), dim = Math.min(1, springAt(ft, T.rowClick, 0.45, 0));
  const looks: Record<string, NodeLook> = {};
  for (const n of SCENE.nodes) looks[n.id] = n.id === WF.id ? { selected: sel } : { dim };
  const edgeLooks: Record<string, EdgeLook> = {};
  for (const e of SCENE.edges) {
    const lit = e.from === WF.id || e.to === WF.id;
    edgeLooks[`${e.from}>${e.to}`] = { lit: lit ? dim : 0, dim: lit ? 0 : dim };
  }
  // the marker sits on the node's top face (it grows with the selection's height spring)
  const h = 1 + (hoverHeightScale("plinth") - 1) * sel;
  const [mx, my] = at(cam, depthForShape("plinth") * h + 0.02);
  const zoom = cam.s / (CANVAS_H / 10);
  return (
    <div style={{ position: "absolute", left: PAGE.canvasLeft, top: PAGE.top, width: w, height: CANVAS_H, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <MapView scene={SCENE} width={w} height={CANVAS_H} camera={cam} t={ft} looks={looks} edgeLooks={edgeLooks} />
      <ErrorMarker x={mx} y={my} scale={Math.max(0.35, Math.min(1, zoom))} />
    </div>
  );
};

// ── the attention card (GridErrorSummary): 16 px in from the canvas's left, 60 px down ──
const SummaryCard: React.FC<{ ft: number }> = ({ ft }) => {
  const k = transform(ft, [T.cardClick, T.cardClick + 0.25], [0, 1], { ease: mvEaseInOut });
  const kp = transform(ft, [T.cardClick, T.cardClick + 0.35], [0, 1], { ease: mvEaseInOut });
  const morph = Math.min(1.15, springAt(ft, T.cardClick, 0.3, 0.27));
  const hover = transform(ft, [T.rowClick - 0.35, T.rowClick - 0.25], [0, 1]);
  const pad = [mix(8, 16, kp), mix(8, 16, kp), mix(8, 12, kp), mix(8, 16, kp)];
  const CONTENT_H = 4 + 33 + 8 + 56 + 8;
  return (
    <div style={{ position: "absolute", left: PAGE.canvasLeft + 16, top: PAGE.top + 60, width: mix(256, 384, k), boxSizing: "border-box", overflow: "hidden",
      borderRadius: 12, border: `1px solid ${HR.gray[300]}`, background: "#fff", fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: pad.map((p) => `${p.toFixed(2)}px`).join(" ") }}>
        <AssetIcon size={36} type="error" />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", ...txt(14, 20, 600, HR.gray[900]) }}>1 workflow</span>
          <span style={{ display: "block", ...txt(14, 20, 400, HR.gray[500]) }}>Need your attention</span>
        </span>
        <span style={{ width: 32, height: 32, marginRight: -8, flex: "none", position: "relative" }}>
          {/* MorphIcon: chevron-down ⇄ x (a crossfade with a quarter turn stands in for the path morph) */}
          <BIcon name="lucide:chevron-down" size={20} color={HR.gray[500]} style={{ position: "absolute", left: 6, top: 6, opacity: 1 - Math.min(1, morph), transform: `rotate(${90 * morph}deg)` }} />
          <BIcon name="lucide:x" size={20} color={HR.gray[500]} style={{ position: "absolute", left: 6, top: 6, opacity: Math.min(1, morph), transform: `rotate(${-90 * (1 - morph)}deg)` }} />
        </span>
      </div>
      <div style={{ height: CONTENT_H * k, opacity: k, overflow: "hidden" }}>
        {/* WorkflowStatusTabs (HLTabs line, md) */}
        <div style={{ padding: "4px 16px 0" }}>
          <div style={{ display: "flex", gap: 6, borderBottom: `1px solid ${HR.gray[200]}` }}>
            {[["Published · 1", true], ["Draft · 0", false]].map(([l, on]) => (
              <span key={String(l)} style={{ position: "relative", height: 32, boxSizing: "border-box", padding: "6px 8px", borderRadius: 4, whiteSpace: "nowrap",
                ...txt(14, 20, on ? 600 : 500, on ? PRIMARY[700] : HR.gray[600]) }}>
                {l}
                {on ? <span style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 1, background: PRIMARY[700] }} /> : null}
              </span>
            ))}
          </div>
        </div>
        <div style={{ padding: 8 }}>
          {/* GridWorkflowListItem */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px", marginBottom: 4, borderLeft: "2px solid transparent",
            background: hover > 0 ? `rgba(249,250,251,${hover})` : "#fff" }}>
            <span style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><AssetIcon size={36} type="workflow" /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", ...ellipsis, ...txt(14, 20, 500, HR.gray[900]) }}>{WF.name}</span>
              <span style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, ...txt(12, 16, 400, HR.gray[500]) }}>
                <BIcon name="ghl:Folder" size={14} color={WF.folderTint} />{WF.folder}
              </span>
            </span>
            <span style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
              <BIcon name="lucide:chevron-right" size={16} color={HR.gray[500]} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── the right panel (NodeDetailDrawer → WorkflowDetailPanel), opened on the failed executions ──
const Panel: React.FC<{ ft: number; hoverRow: number }> = ({ ft, hoverRow }) => {
  const t0 = T.rowClick;
  const enter = transform(ft, [t0, t0 + 0.2], [0, 1]);
  const notice = transform(ft, [t0, t0 + 0.25], [0, 1], { ease: mvEaseInOut });
  const loaded = ft >= t0 + 0.45;
  const NOTICE_H = 4 + 56 + 4 + 1;
  return (
    <div style={{ position: "absolute", left: PAGE.right - PAGE.panelW, top: PAGE.top, width: PAGE.panelW, height: CANVAS_H, borderRadius: 8, background: "#fff",
      boxShadow: SHADOW_LG, overflow: "hidden", fontFamily: FONT, display: "flex", flexDirection: "column",
      opacity: enter, transform: `translateX(${20 * (1 - enter)}px)` }}>
      {/* header */}
      <div style={{ padding: 16, borderBottom: `1px solid ${HR.gray[100]}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <AssetIcon size={44} type="workflow" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, ...txt(14, 20, 400, HR.gray[600]) }}>
                <BIcon name="ghl:Folder" size={16} color={HR.gray[600]} /><span style={ellipsis}>{WF.folder}</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <BIcon name="ghl:Stars02" size={20} color={HR.purple[700]} />
                <BIcon name="ghl:XClose" size={20} color={HR.gray[700]} />
              </span>
            </div>
            <div style={{ ...ellipsis, ...txt(16, 24, 600, HR.gray[900]) }}>{WF.name}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", columnGap: 12 }}>
          <Tag label="Published" tone="success" size="lg" />
          <span style={txt(12, 16, 400, HR.gray[500])}>Updated 20 Oct 2026, 02:28</span>
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Button kind="primary" size="md" label="Preview workflow" style={{ flex: 1 }} />
          <Button kind="secondary" size="md" icon="ghl:DotsHorizontal" />
        </div>
      </div>
      {/* enrollments */}
      <div style={{ padding: 16, borderBottom: `1px solid ${HR.gray[100]}` }}>
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={txt(14, 20, 600, HR.gray[900])}>Enrollments</span>
          <span style={txt(12, 16, 400, HR.gray[500])}>Select a count to view history</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {([["Total Enrolled", "heroicons-solid:users", PRIMARY[600], "41"], ["Currently Enrolled", "heroicons-solid:user", SUCCESS[600], "0"]] as const).map(([l, i, c, n]) => (
            <div key={l} style={{ boxSizing: "border-box", padding: 12, borderRadius: 8, border: `1px solid ${HR.gray[300]}`, background: "#fff", boxShadow: SHADOW_XS,
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", columnGap: 8, alignItems: "center", textAlign: "left" }}>
                <span style={{ gridColumn: "span 2", marginBottom: 4, ...txt(12, 16, 400, HR.gray[600]) }}>{l}</span>
                <span style={{ width: 32, height: 32, borderRadius: 16, background: HR.gray[50], display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name={i} size={20} color={c} /></span>
                <span style={txt(20, 28, 600, HR.gray[600])}>{n}</span>
              </div>
              <BIcon name="ghl:ChevronRight" size={16} color={HR.gray[400]} style={{ marginLeft: 8 }} />
            </div>
          ))}
        </div>
      </div>
      {/* WorkflowErrorNotice, expanded */}
      <div style={{ height: NOTICE_H * notice, opacity: notice, overflow: "hidden", flex: "none" }}>
        <div style={{ padding: "4px 8px 0", borderBottom: `1px solid ${HR.gray[200]}`, background: RED[50] }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px", marginBottom: 4 }}>
            <span style={{ width: 36, height: 36, display: "flex", flex: "none" }}><AssetIcon size={36} type="error" /></span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", ...txt(14, 20, 500, HR.gray[900]) }}>Execution errors</span>
              <span style={{ display: "block", marginTop: 4, ...txt(12, 16, 400, HR.gray[500]) }}>Execution error at Oct 19, 2026 7:37 PM</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
              <span style={txt(12, 16, 500, RED[700])}>Hide errors</span>
              <span style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BIcon name="lucide:chevron-down" size={16} color={HR.gray[500]} style={{ transform: "rotate(180deg)" }} />
              </span>
            </span>
          </div>
        </div>
      </div>
      {/* Back to assets + WorkflowFailedExecutionList */}
      <div style={{ padding: "16px 16px 0" }}>
        <Button kind="text" size="sm" icon="ghl:ArrowLeft" iconSize={16} label="Back to assets" />
      </div>
      <div style={{ paddingTop: 8, paddingBottom: 24 }}>
        {loaded ? (
          <div style={{ padding: "0 8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8 }}>
              <SectionTitle>Failed executions ({FAILED.length})</SectionTitle>
              <Button kind="text" size="xs" color="blue" label="Mark as read" />
            </div>
            {FAILED.map((r, i) => {
              const a = t0 + 0.45 + i * 0.05;
              const o = transform(ft, [a, a + 0.2], [0, 1], { ease: mvEaseOut }), x = transform(ft, [a, a + 0.2], [-12, 0], { ease: mvEaseInOut });
              const hov = i === 0 ? hoverRow : 0;
              return (
                <div key={i} style={{ opacity: o, transform: `translateX(${x}px)` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px", marginBottom: 4, borderLeft: "2px solid transparent",
                    background: hov > 0 ? `rgba(249,250,251,${hov})` : "#fff" }}>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", ...txt(14, 20, 500, HR.gray[900]) }}>{r.step}</span>
                      <span style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 2, ...txt(12, 16, 400, HR.gray[500]) }}>
                        <span>{r.contact}</span><span>{r.at}</span>
                      </span>
                    </span>
                    <Tag label="Failed" tone="error" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}><Spinner t={ft} size={20} /></div>
        )}
      </div>
    </div>
  );
};

/** UISpin small: a primary-700 arc turning once every 0.8 s. */
const Spinner: React.FC<{ t: number; size: number }> = ({ t, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ transform: `rotate(${(t / 0.8) * 360}deg)` }}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={PRIMARY[100]} strokeWidth="3" />
    <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke={PRIMARY[700]} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ── the run modal (WorkflowCanvasModal): 24 px side margins, centred, 24 px padding ──
const MODAL = { x: 24, y: 16, w: 1620 - 48, h: 880 - 32, pad: 24 };
const BODY = { x: MODAL.x + MODAL.pad, y: MODAL.y + MODAL.pad + 40, w: MODAL.w - 2 * MODAL.pad, h: MODAL.h - 2 * MODAL.pad - 40 };
const LOG_W = 400, DRAWER_W = 450;
const RUN = BUILDER_WORKFLOWS.runPayment;
const RUN_BOUNDS = layoutMaps(RUN).bounds;

const LogPanel: React.FC<{ ft: number; selected: number; hover: number }> = ({ ft, selected, hover }) => {
  const loaded = ft >= T.logs;
  return (
    <div style={{ width: LOG_W, height: BODY.h, boxSizing: "border-box", border: `1px solid ${HR.gray[200]}`, borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", flex: "none" }}>
      <div style={{ padding: "12px 12px 0" }}>
        <Button kind="text" size="sm" icon="ghl:ArrowLeft" label="Back" />
        <div style={{ marginTop: 12, borderRadius: 8, border: `1px solid ${HR.gray[200]}`, background: "#fff", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: 18, background: PRIMARY[100], display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
            ...txt(12, 16, 600, PRIMARY[700]) }}>JS</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", ...txt(14, 20, 500, HR.gray[900]) }}>Jordan Smith</span>
            <span style={{ display: "block", marginTop: 4, ...txt(12, 16, 400, HR.gray[500]) }}>jordan.smith@example.com</span>
          </span>
          <BIcon name="ghl:Share03" size={16} color={HR.gray[700]} />
        </div>
      </div>
      {loaded ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12 }}>
          {RUN_LOG.map((r, i) => {
            const sel = i === 0 ? selected : 0;
            return (
              <div key={i} style={{ boxSizing: "border-box", borderRadius: 8, border: `1px solid ${sel > 0.5 ? PRIMARY[500] : HR.gray[200]}`, background: "#fff",
                boxShadow: sel > 0.5 ? SHADOW_SM : undefined, padding: "8px 8px", marginBottom: 4, position: "relative" }}>
                {i === 0 && hover > 0 && sel < 0.5 ? <div style={{ position: "absolute", inset: 0, borderRadius: 7, background: HR.gray[50], opacity: hover }} /> : null}
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ ...ellipsis, ...txt(14, 20, 500, sel > 0.5 ? PRIMARY[700] : HR.gray[900]) }}>{r.step}</span>
                  <BIcon name="ghl:ChevronRight" size={16} color={HR.gray[500]} />
                </div>
                <div style={{ position: "relative", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, ...txt(12, 16, 400, HR.gray[500]) }}>
                  <span>{r.at}</span>
                  <Tag label={r.status} tone={r.status === "Failed" ? "error" : r.status === "Finished" ? "success" : "blue"} />
                </div>
              </div>
            );
          })}
        </div>
      ) : <div style={{ display: "flex", justifyContent: "center", padding: 24 }}><Spinner t={ft} size={20} /></div>}
    </div>
  );
};

/** ExecutionLogDetailPanel for the failed Send Email (Event details tab). */
const LogDetail: React.FC = () => {
  const label = (s: string, mt = 20): React.CSSProperties => ({ display: "block", marginTop: mt, letterSpacing: "0.025em", ...txt(14, 22, 500, HR.gray[500]) });
  const rule = <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb" }} />;
  const value = txt(14, 20, 400, HR.gray[700]);
  return (
    <div style={{ width: DRAWER_W, height: BODY.h, boxSizing: "border-box", border: `1px solid ${HR.gray[200]}`, borderRadius: 8, overflow: "hidden", background: "#fff", fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "12px 16px", borderBottom: `1px solid ${HR.gray[200]}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
          <span style={{ width: 46, height: 46, borderRadius: 12, background: HR.green[50], display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <BIcon name="heroicons-solid:mail-open" size={24} color={HR.green[700]} />
          </span>
          <span>
            <span style={{ display: "block", ...txt(14, 20, 600, HR.gray[900]) }}>Send Email</span>
            <span style={{ display: "block", ...txt(12, 16, 400, HR.gray[500]) }}>Action</span>
          </span>
        </div>
        <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}><BIcon name="ghl:X" size={20} color={HR.gray[700]} /></span>
      </div>
      {/* UITabs segment */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ display: "flex", padding: 3, borderRadius: 3, background: "rgb(247,247,250)" }}>
          {["Event details", "Configuration"].map((l, i) => (
            <span key={l} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 3, background: i === 0 ? "#fff" : "transparent",
              boxShadow: i === 0 ? "0 1px 3px 0 rgba(0,0,0,.08)" : undefined, ...txt(14, 22, 600, i === 0 ? "rgb(52,64,84)" : "rgb(16,24,40)") }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "12px 24px 0" }}>
        <div style={{ marginTop: 16 }}>
          <span style={label("Contact", 0)}>Contact</span>
          <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
            <span style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8, background: HR.gray[100], display: "flex", alignItems: "center", justifyContent: "center",
              ...txt(14, 20, 500, HR.gray[600]) }}>JS</span>
            <span>
              <span style={{ display: "block", marginTop: 4, ...txt(14, 20, 400, "#226083") }}>Jordan Smith</span>
              <span style={{ display: "block", marginTop: 4, ...txt(12, 16, 400, HR.gray[700]) }}>jordan.smith@example.com</span>
            </span>
          </div>
          {rule}
          <span style={{ ...label("Action"), marginBottom: 8 }}>Action</span>
          <span style={value}>Send Email</span>
          {rule}
          <span style={{ ...label("Event Status"), marginBottom: 8 }}>Event Status</span>
          <span style={{ height: 28, padding: "0 7px", borderRadius: 14, boxSizing: "border-box", display: "inline-flex", alignItems: "center",
            border: "1px solid rgba(217,45,32,.23)", background: "rgba(217,45,32,.08)", ...txt(12, 18, 500, "#D92D20") }}>Failed</span>
          {rule}
          <span style={label("Action Executed From")}>Action Executed From</span>
          <span style={{ display: "block", marginTop: 4, ...value }}>Send Email</span>
          <span style={label("Message")}>Message</span>
          <span style={{ display: "block", marginTop: 12, ...value }}>{MESSAGE}</span>
          <div style={{ margin: "8px 0", borderTop: "1px solid #e5e7eb" }} />
          <span style={{ ...label("Meta Data", 0), marginBottom: 8 }}>Meta Data</span>
          <pre style={{ margin: 0, fontFamily: `Monaco, Menlo, Consolas, "Bitstream Vera Sans Mono", monospace`, fontSize: 14, lineHeight: "20px", color: HR.gray[700] }}>
            {"{\n  "}"version"{": "}<span style={{ color: "#1d8ce0" }}>4</span>{",\n  "}"attributes"{": {\n    "}"event"{": "}<span style={{ color: "#13ce66" }}>"EMAIL"</span>
            {",\n    "}"template"{": "}<span style={{ color: "#13ce66" }}>"Welcome to the program"</span>{",\n    "}"to"{": "}<span style={{ color: "#13ce66" }}>"jordan.smith@example.com"</span>{"\n  }\n}"}
          </pre>
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC<{ ft: number; hoverStep: number }> = ({ ft, hoverStep }) => {
  const drawer = transform(ft, [T.stepClick + 0.05, T.stepClick + 0.25], [0, 1], { ease: cssEase });
  const open = ft >= T.stepClick + 0.05;
  const canvasW = BODY.w - LOG_W - 12 - (open ? DRAWER_W + 12 : 0);
  // the run (format-nodes highlightExecutionPath): entered at Add Contact Tag (green path), failed at Send Email
  const k = (d: number) => transform(ft, [T.logs + d, T.logs + d + 0.3], [0, 1]);
  const states: Record<string, RunNodeState> = ft >= T.logs ? {
    "add-contact-tag": { ran: k(0), chips: ["entered"], chipsIn: k(0) },
    // selecting its log row keeps the failed card red (the canvas doesn't select it)
    "send-email": { failed: true, chips: ["error"], chipsIn: k(0) },
  } : {};
  // fit to the canvas (0.9) and keep it centred as the drawer takes its width
  const fitW = BODY.w - LOG_W - 12, centre = mix(fitW / 2, (fitW - DRAWER_W - 12) / 2, drawer);
  const view = { x: centre - (RUN_BOUNDS.x0 + RUN_BOUNDS.x1) / 2, y: BODY.h / 2 - (RUN_BOUNDS.y0 + RUN_BOUNDS.y1) / 2 + 30, zoom: 1 };
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.4)" }} />
      <div style={{ position: "absolute", left: MODAL.x, top: MODAL.y, width: MODAL.w, height: MODAL.h, boxSizing: "border-box", padding: MODAL.pad, borderRadius: 12,
        background: "#fff", boxShadow: "0 20px 24px -4px #10182814, 0 8px 8px -4px #10182808", fontFamily: FONT }}>
        <div style={{ height: 32, marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
            <span style={{ marginRight: 8, ...txt(18, 28.8, 500, "rgb(16,24,40)") }}>{WF.name}</span>
            <Tag label="Published" tone="success" size="lg" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button kind="secondary" size="xs" icon="akar-icons:arrow-up-right" label="Open in builder" />
            <Button kind="secondary" size="xs" icon="ghl:LinkExternal01" label="Open in new tab" />
            <Button kind="secondary" size="xs" icon="ghl:X" iconSize={16} />
          </div>
        </div>
        <div style={{ position: "relative", display: "flex", gap: 12, height: BODY.h, overflow: "hidden" }}>
          <LogPanel ft={ft} selected={open ? 1 : 0} hover={hoverStep} />
          <div style={{ position: "relative", width: canvasW, height: BODY.h, flex: "none" }}>
            {ft >= T.logs ? <MapsCanvas wf={RUN} width={canvasW} height={BODY.h} view={view} states={states} t={ft} /> : (
              <div style={{ width: canvasW, height: BODY.h, boxSizing: "border-box", border: `1px solid ${HR.gray[200]}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Spinner t={ft} size={28} />
              </div>
            )}
          </div>
          {open ? <div style={{ flex: "none", opacity: drawer, transform: `translateX(${(1 - drawer) * 100}%)` }}><LogDetail /></div> : null}
        </div>
      </div>
    </>
  );
};

// ── the cursor: keyframes (film s → window px), eased between ──
const CURSOR: [number, number, number][] = [
  [143.3, 980, 520], [144.95, 980, 520], [145.75, 200, 160], [146.15, 200, 160], [146.75, 215, 276], [147.25, 215, 276],
  [148.55, 1290, 598], [150.2, 1290, 598], [151.35, 1290, 598], [151.8, 215, 250], [152.3, 215, 250], [152.95, 1290, 600], [153.6, 1290, 600],
];
const CLICKS = [T.cardClick, T.rowClick, T.execClick, T.stepClick];
const cursorAt = (ft: number) => {
  const ts = CURSOR.map((c) => c[0]), ease = CURSOR.slice(1).map(() => mvEaseInOut);
  return [transform(ft, ts, CURSOR.map((c) => c[1]), { ease }), transform(ft, ts, CURSOR.map((c) => c[2]), { ease })] as const;
};

/** The scene at film time `ft`, in window px (inside the app window, over the film), or nothing outside it. */
export const ErrorShots: React.FC<{ ft: number }> = ({ ft }) => {
  if (ft < T.from || ft >= T.to) return null;
  const picked = ft >= T.rowClick, modal = ft >= T.execClick + 0.05;
  const [cx, cy] = cursorAt(ft);
  const press = CLICKS.some((c) => ft >= c - 0.05 && ft < c + 0.08);
  const hoverRow = transform(ft, [148.45, 148.6], [0, 1]);
  const hoverStep = transform(ft, [151.7, 151.8], [0, 1]);
  const canvasRight = PAGE.canvasLeft + (picked ? CANVAS_NARROW : CANVAS_FULL);
  return (
    <>
      {/* the workspace behind the canvas and the panel (the film's #eff2f4) */}
      <div style={{ position: "absolute", left: PAGE.canvasLeft - 2, top: 64, right: 0, bottom: 0, background: "#eff2f4" }} />
      <MapLayer ft={ft} />
      <FilmCrop src={PILLS} x={PILLS[0]} y={PILLS[1]} />
      <FilmCrop src={TOOLS_L} x={TOOLS_L[0]} y={TOOLS_L[1]} />
      <FilmCrop src={TOOLS_R} x={canvasRight - 12 - TOOLS_R[2]} y={TOOLS_R[1]} />
      <SummaryCard ft={ft} />
      {picked ? <Panel ft={ft} hoverRow={hoverRow} /> : null}
      {modal ? <Modal ft={ft} hoverStep={hoverStep} /> : null}
      <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: `${cx}px ${cy}px`, transform: press ? "scale(0.88)" : undefined }}>
        <Cursor x={cx} y={cy} />
      </div>
    </>
  );
};

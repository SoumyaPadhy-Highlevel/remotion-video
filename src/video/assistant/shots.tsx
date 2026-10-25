// The Assistant section, redrawn over the film on the film's clock (like builder/scenes.tsx): from the click that opens
// the panel (film 158.23 s) to the "And it doesn't just answer" card (film 169.1 s), and the act clip (film scene "act",
// ACT_FROM for ACT_LEN film seconds, played at ACT_RATE). The film keeps the header and the rail; the panel, the map
// (product renderer), the map's notices, the header's Save cluster and the cursor are drawn here, as the product draws
// them. Everything is a pure function of `ft`.
import React from "react";
import { sampleFilmTrack } from "../map3d/sampleFilmTrack";
import { Freeze, OffthreadVideo, staticFile } from "remotion";
import { mix, transform } from "motion";
import { easeInOut, easeOut, springAt } from "../anim";
import { BIcon } from "../builder/Nodes";
import { Cursor } from "../builder/shotKit";
import { FILM_MAP_SHOTS, FILM_WORLDS } from "../map3d/filmMap";
import { EdgeLook, MapCamera, MapPlane, MapScene, MapView, NodeLook, projectToCanvas } from "../map3d/MapScene";
import { APP_FILE, ASSISTANT, FPS } from "../script";
import { ACT_FROM, ACT_LEN, ACT_RATE, ASK_T, assistantShown, P, Pt, SAVE, TURNS } from "./timing";
import { ACT_WORLD, corners, fitCamera, FOLDER, GROWTH, GROWTH_FOLDER, MOVED, OFFER } from "./actWorld";
import { MapToast } from "./MapChrome";
import { AssistantPanel, ChatItem, Chip, PanelState } from "./Panel";
import { FONT, HR, MAP_CANVAS, SHADOW } from "./tokens";



const W = MAP_CANVAS.width, H = MAP_CANVAS.height;
const sp = (t: number, at: number, d = 0.35, b = 0) => springAt(t, at, d, b);
const ramp = (t: number, a: number, b: number) => transform(t, [a, b], [0, 1], { ease: easeInOut });
const typed = (s: string, t: number, a: number, b: number) => s.slice(0, Math.round(transform(t, [a, b], [0, s.length])));

/** The cursor along keyed stops: [time, point] pairs, eased between stops; `press` times dip it. */
const cursorAt = (t: number, keys: [number, Pt][]) => {
  let p: Pt = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, p0] = keys[i - 1], [t1, p1] = keys[i];
    if (t <= t0) break;
    const k = ramp(t, t0, t1);
    p = [mix(p0[0], p1[0], k), mix(p0[1], p1[1], k)];
  }
  return p;
};

/** Cameras blend in world space: the view centre moves straight, the scale geometrically (the product's fly-to). */
const blendCam = (a: MapCamera, b: MapCamera, k: number): MapCamera => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const ua = (W / 2 - a.cx) / a.s, va = (H / 2 - a.cy) / a.s, ub = (W / 2 - b.cx) / b.s, vb = (H / 2 - b.cy) / b.s;
  const s = a.s * Math.pow(b.s / a.s, k), u = mix(ua, ub, k), v = mix(va, vb, k);
  return { cx: W / 2 - s * u, cy: H / 2 - s * v, s };
};

/** The film's map camera at film time `ft` (window px → canvas px beside the open panel). */
const filmCam = (ft: number): MapCamera => {
  const shot = FILM_MAP_SHOTS.find((s) => ft >= s.from && ft < s.from + s.frames / 30)!;
  const at = Math.max(0, Math.min(shot.frames - 1, (ft - shot.from) * 30));
  const [cx, cy, s] = sampleFilmTrack(shot.cams, at, 3);
  return { cx: cx - MAP_CANVAS.left, cy: cy - MAP_CANVAS.top, s };
};

// ── the film's sticky note on 01 · Lead Capture, carried as an image pinned to its spot on the map ──
const NOTE_FT = 159.6;
/** Its card and pin in the film at NOTE_FT (window px). */
const NOTE_RECT = [838, 416, 116, 92];
const NOTE_PIN: Pt = [851, 499];
/** World point under a canvas point, on the ground. */
const unproject = (cam: MapCamera, u: number, v: number) => {
  const [ox, oy] = projectToCanvas(cam, 0, 0, 0), [xx, xy] = projectToCanvas(cam, 1, 0, 0), [zx, zy] = projectToCanvas(cam, 0, 0, 1);
  const a = xx - ox, b = zx - ox, c = xy - oy, d = zy - oy, det = a * d - b * c, du = u - ox, dv = v - oy;
  return { x: (d * du - b * dv) / det, z: (a * dv - c * du) / det };
};
const NOTE_CAM = filmCam(NOTE_FT);
const NOTE_AT = unproject(NOTE_CAM, NOTE_PIN[0] - MAP_CANVAS.left, NOTE_PIN[1] - MAP_CANVAS.top);
const StickyNote: React.FC<{ cam: MapCamera; opacity: number }> = ({ cam, opacity }) => {
  if (opacity <= 0.01) return null;
  const [u, v] = projectToCanvas(cam, NOTE_AT.x, 0, NOTE_AT.z), k = cam.s / NOTE_CAM.s;
  const [x, y, w, h] = NOTE_RECT, ox = NOTE_PIN[0] - x, oy = NOTE_PIN[1] - y;
  return (
    <div style={{ position: "absolute", left: u - ox * k, top: v - oy * k, width: w, height: h, overflow: "hidden", transform: `scale(${k})`, transformOrigin: "0 0", opacity }}>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(NOTE_FT * FPS)}
          style={{ position: "absolute", left: -x, top: -y, width: 1620, height: 880, maxWidth: "none" }} />
      </Freeze>
    </div>
  );
};

// ── one frame of the section ──
type Frame = {
  panel: Omit<PanelState, "t">; panelK: number;
  map: { scene: MapScene; cam: MapCamera; looks: Record<string, NodeLook>; edgeLooks: Record<string, EdgeLook>; planeLooks: Record<string, Partial<MapPlane>>; note: number };
  cursor: Pt; press: number;
  toasts: { kind: "created" | "moved" | "saved"; k: number }[];
  header?: { dirty: boolean; press: number };
};

const ask = ASSISTANT.ask;
/** The workflow with errors (the errors section's "1 workflow · Need your attention"). */
const ERR = ["program-payment"];
/** Focus on it the way the product's focus frames one node: a little of its folder around it. */
const ASK_FOCUS = fitCamera(FILM_WORLDS.main.nodes.filter((n) => ERR.includes(n.id)).flatMap((n) => [{ x: n.x - 4, z: n.z - 4 }, { x: n.x + 4, z: n.z + 4 }]), W, H, 0.1);

/** "Ask your map anything" (film time): the panel opens, the Map overview tile sends, the answer streams, Show on map. */
const askFrame = (ft: number): Frame => {
  const T = ASK_T;
  const sent = ft >= T.sent, replied = ft >= T.reply;
  const status = ft >= T.applied ? "applied" : ft >= T.run ? "running" : "pending";
  const items: ChatItem[] = !sent ? [] : [
    { kind: "user", text: ask.prompt, k: sp(ft, T.sent) },
    ...(!replied ? [{ kind: "progress" as const, step: ft >= T.step1 ? 1 : 0, k: sp(ft, T.sent + 0.25) }]
      : [{ kind: "assistant" as const, thought: ask.thought, blocks: ask.answer, k: transform(ft, [T.reply, T.reply + 0.38], [0, 1], { ease: easeOut }),
        chars: Math.round(transform(ft, [T.reply + 0.1, T.streamEnd], [0, 600])),
        plan: ft >= T.card ? { spec: ask.offer, status: status as "pending", k: sp(ft, T.card) } : undefined, feedback: ft >= T.card + 0.1 }]),
  ];
  const cursor = cursorAt(ft, [[T.open, P.rail], [159.35, P.rail], [T.hover, P.tile], [T.reply + 0.6, P.tile], [T.reply + 1.4, [300, 560]], [T.toBtn, [300, 560]], [T.atBtn, P.showOnMap]]);
  const focus = ramp(ft, T.fly[0], T.fly[1]), dim = sp(ft, T.applied, 0.45);
  const looks: Record<string, NodeLook> = {};
  for (const n of FILM_WORLDS.main.nodes) looks[n.id] = ERR.includes(n.id) ? { selected: dim } : { dim };
  const edgeLooks: Record<string, EdgeLook> = {};
  for (const e of FILM_WORLDS.main.edges) edgeLooks[`${e.from}>${e.to}`] = { dim };
  return {
    panel: { empty: sent ? undefined : {}, items, loading: sent && !replied, history: ft >= T.applied,
      hover: ft >= T.hover && !sent ? "tile:summarize" : ft >= T.atBtn - 0.1 && status === "pending" ? "apply" : undefined,
      press: ft >= T.click && ft < T.sent ? "tile:summarize" : ft >= T.press && ft < T.run ? "apply" : undefined },
    panelK: transform(ft, [T.open, T.open + 0.2], [0, 1]),
    map: { scene: FILM_WORLDS.main, cam: blendCam(filmCam(Math.min(Math.max(ft, 158.4), NOTE_FT)), ASK_FOCUS, focus), looks, edgeLooks, planeLooks: {}, note: 1 - dim * 0.7 },
    cursor, press: (ft >= T.click && ft < T.sent) || (ft >= T.press && ft < T.run) ? 1 : 0, toasts: [],
  };
};

// ── "It does the work" (the act's own clock `a`, output seconds) ──
const CHIPS: (Chip[] | undefined)[] = [undefined, [{ kind: "workflows", count: 5 }], [{ kind: "folder", name: "growth foundations" }]];
const ACT_OVERVIEW = fitCamera(ACT_WORLD.planes.filter((p) => p.id !== GROWTH_FOLDER).flatMap(corners), W, H, 0.06);
const ACT_GROWTH = fitCamera(ACT_WORLD.nodes.filter((n) => GROWTH.includes(n.id) || n.id === OFFER), W, H, 0.16);
const ACT_FOLDER = fitCamera(corners(FOLDER), W, H, 0.2);

const actFrame = (a: number): Frame => {
  const items: ChatItem[] = [];
  let draft = "", caret = false, loading = false, hover: string | undefined, press: string | undefined;
  TURNS.forEach((T, i) => {
    const spec = ASSISTANT.act[i];
    if (a >= T.click && a < T.send) { caret = true; draft = typed(spec.prompt, a, T.type[0], T.type[1]); }
    if (a >= T.send - 0.3 && a < T.send) hover = "send";
    if (a >= T.send - 0.12 && a < T.send) press = "send";
    if (a < T.send) return;
    items.push({ kind: "user", text: spec.prompt, chips: CHIPS[i], k: sp(a, T.send) });
    if (a < T.reply) { loading = true; items.push({ kind: "progress", step: a >= T.step1 ? 1 : 0, k: sp(a, T.send + 0.25) }); return; }
    const status = a >= T.applied ? "applied" : a >= T.press + 0.12 ? "running" : "pending";
    if (status === "pending" && a >= T.toApply + 0.7) hover = "apply";
    if (a >= T.press && a < T.press + 0.12) press = "apply";
    items.push({ kind: "assistant", thought: spec.thought, blocks: [spec.reply], k: transform(a, [T.reply, T.reply + 0.38], [0, 1], { ease: easeOut }),
      chars: Math.round(transform(a, [T.reply + 0.1, T.reply + 0.35], [0, spec.reply.length])),
      plan: a >= T.card ? { spec: spec.plan, status, k: sp(a, T.card) } : undefined, feedback: a >= T.card + 0.1 && a < T.after });
    if (a >= T.after) items.push({ kind: "assistant", blocks: [spec.after], k: transform(a, [T.after, T.after + 0.38], [0, 1], { ease: easeOut }),
      chars: Math.round(transform(a, [T.after + 0.05, T.after + 0.5], [0, spec.after.length])), feedback: true });
  });
  // only the latest reply carries Clear chat and the reactions
  const lastReply = items.map((it) => it.kind).lastIndexOf("assistant");
  items.forEach((it, i) => { if (it.kind === "assistant" && i !== lastReply) it.feedback = false; });
  const [t1, t2, t3] = TURNS;
  const selection: Chip[] | undefined = a >= t3.applied ? [{ kind: "workflows", count: 5 }, { kind: "folder", name: "1 folder" }]
    : a >= t2.applied ? [{ kind: "folder", name: "growth foundations" }] : a >= t1.applied ? [{ kind: "workflows", count: 5 }] : undefined;
  // the cursor: into the empty box, send, Apply; again for each ask; then the header's Save
  const keys: [number, Pt][] = [[0, [980, 520]], [0.2, [980, 520]], [0.95, P.zsInput]];
  TURNS.forEach((T, i) => {
    const box = i === 0 ? P.zsInput : P.composer, send = i === 0 ? P.zsSend : P.send;
    if (i > 0) keys.push([T.click - 0.75, [300, 640]], [T.click - 0.05, box]);
    keys.push([T.type[1] + 0.05, box], [T.send - 0.25, send], [T.reply, send], [T.toApply, [300, T.apply[1] + 70]], [T.toApply + 0.7, T.apply], [T.applied + 0.3, T.apply]);
  });
  keys.push([SAVE.to, [600, 300]], [SAVE.at, P.save]);
  const cursor = cursorAt(a, keys);
  const clicking = [...TURNS.flatMap((T) => [T.click, T.send - 0.12, T.press]), SAVE.press].some((c) => a >= c && a < c + 0.12);

  // the map: highlight (turn 1), the new folder (turn 2), the move (turn 3)
  const hl = sp(a, t1.applied, 0.45) * (1 - sp(a, t2.applied, 0.45));
  const folderIn = sp(a, t2.applied + 0.15, 0.3), folderLift = sp(a, t2.applied + 0.15, 0.4) * (1 - sp(a, t3.press, 0.3));
  const cam = blendCam(blendCam(ACT_OVERVIEW, ACT_GROWTH, ramp(a, t1.applied, t1.applied + 1.1)), ACT_FOLDER, ramp(a, t2.applied, t2.applied + 1.2));
  const lit = new Set([...GROWTH, OFFER]);
  const looks: Record<string, NodeLook> = {}, edgeLooks: Record<string, EdgeLook> = {};
  for (const n of ACT_WORLD.nodes) {
    const l: NodeLook = lit.has(n.id) ? { selected: n.id === OFFER ? 0 : hl } : { dim: hl };
    const to = MOVED[n.id];
    if (to) {
      const i = n.id === OFFER ? 0 : GROWTH.indexOf(n.id) + 1, k = ramp(a, t3.press + 0.2 + 0.1 * i, t3.press + 1.3 + 0.1 * i);
      if (k > 0) { l.x = mix(n.x, to.x, k); l.z = mix(n.z, to.z, k); l.lift = Math.sin(k * Math.PI) * 0.6; }
    }
    looks[n.id] = l;
  }
  for (const e of ACT_WORLD.edges) edgeLooks[`${e.from}>${e.to}`] = lit.has(e.from) && lit.has(e.to) ? { lit: hl } : { dim: hl };
  const planeLooks: Record<string, Partial<MapPlane>> = { [GROWTH_FOLDER]: { opacity: folderIn, lift: folderLift } };
  const toast = (kind: "created" | "moved" | "saved", from: number, to: number) => (a >= from && a < to + 0.3 ? [{ kind, k: Math.min(sp(a, from, 0.35), 1 - ramp(a, to, to + 0.3)) }] : []);
  return {
    panel: { empty: a < t1.send ? { draft, caret } : undefined, items, selection, draft: a >= t1.send ? draft : undefined, caret: a >= t1.send && caret,
      loading, history: a >= t1.applied, hover, press },
    panelK: 1,
    map: { scene: ACT_WORLD, cam, looks, edgeLooks, planeLooks, note: 1 - 0.7 * hl },
    cursor, press: clicking ? 1 : 0,
    toasts: [...toast("created", t2.applied + 0.2, t3.send), ...toast("moved", t3.applied + 0.3, SAVE.saved), ...toast("saved", SAVE.saved + 0.1, ACT_LEN / ACT_RATE + 1)],
    header: { dirty: a >= t3.applied + 0.1 && a < SAVE.saved, press: a >= SAVE.press && a < SAVE.saved ? 1 : 0 },
  };
};

/** The header's right cluster (history, undo/redo, Save), drawn over the film's for the act: clean, or one unsaved change. */
const HeaderCluster: React.FC<{ dirty: boolean; press: number }> = ({ dirty, press }) => {
  const box: React.CSSProperties = { height: 36, boxSizing: "border-box", border: `1px solid ${HR.gray200}`, borderRadius: 6, background: HR.white,
    display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW.xs, flex: "none" };
  return (
    <div style={{ position: "absolute", left: 1300, top: 8, width: 312, height: 48, background: HR.white, display: "flex", alignItems: "center",
      justifyContent: "flex-end", gap: 12, paddingRight: 6, boxSizing: "border-box", fontFamily: FONT }}>
      <div style={{ ...box, width: 36 }}><BIcon name="ghl:ClockRewind" size={18} color={HR.gray700} /></div>
      <div style={{ ...box, width: 72 }}>
        <div style={{ width: 36, display: "flex", justifyContent: "center", opacity: dirty ? 1 : 0.4 }}><BIcon name="ghl:ReverseLeft" size={16} color={dirty ? HR.gray700 : HR.gray400} /></div>
        <div style={{ width: 36, display: "flex", justifyContent: "center", opacity: 0.4 }}><BIcon name="ghl:ReverseLeft" size={16} color={HR.gray400} style={{ transform: "scaleX(-1)" }} /></div>
      </div>
      <div style={{ ...box, border: "none", background: dirty ? (press ? HR.primary700 : HR.primary600) : "#afc4fb", padding: "0 14px", gap: 8, transform: press ? "scale(0.98)" : undefined }}>
        <BIcon name="ghl:Save01" size={18} color={HR.white} />
        <span style={{ fontSize: 14, fontWeight: 600, color: HR.white, lineHeight: 1 }}>{dirty ? ASSISTANT.saveChanges : "Save"}</span>
      </div>
    </div>
  );
};

/** Film UI that sits on the canvas beside the open panel (filter pills, the bottom-right toolbar), window px: shown as crops
 * of one clean film frame, so the film's own notices and cursor never show through. */
const CANVAS_UI = [[446, 90, 772, 35], [1236, 812, 364, 44]];
const UI_FT = 159.6;
const FilmCrop: React.FC<{ rect: number[]; ft: number }> = ({ rect: [x, y, w, h], ft }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden" }}>
    <Freeze frame={0}>
      <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(ft * FPS)}
        style={{ position: "absolute", left: -x, top: -y, width: 1620, height: 880, maxWidth: "none" }} />
    </Freeze>
  </div>
);

/** The section at film time `ft`, in window px (inside the 1620×880 app window, over the film), or nothing. */
export const AssistantShots: React.FC<{ ft: number }> = ({ ft }) => {
  if (!assistantShown(ft)) return null;
  const inAct = ft >= ACT_FROM, f = inAct ? actFrame((ft - ACT_FROM) / ACT_RATE) : askFrame(ft);
  const t = inAct ? (ft - ACT_FROM) / ACT_RATE : ft;
  const { map } = f;
  return (
    <>
      {/* the app's ground between the rail and the canvas, under the panel (the film's own panel never shows through) */}
      <div style={{ position: "absolute", left: 52, top: 64, width: MAP_CANVAS.left - 52, height: 880 - 64, background: "#f0f3f4" }} />
      <div style={{ position: "absolute", left: MAP_CANVAS.left, top: MAP_CANVAS.top, width: W, height: H, borderRadius: MAP_CANVAS.radius,
        overflow: "hidden", background: "#fff" }}>
        <MapView scene={map.scene} width={W} height={H} camera={map.cam} t={t} looks={map.looks} edgeLooks={map.edgeLooks} planeLooks={map.planeLooks} />
        <StickyNote cam={map.cam} opacity={map.note} />
      </div>
      {CANVAS_UI.map((r, i) => <FilmCrop key={i} rect={r} ft={UI_FT} />)}
      {f.toasts.map((x) => x.kind === "created" ? <MapToast key={x.kind} icon="ghl:Folder" dark title={ASSISTANT.toast.folderCreated} body={ASSISTANT.toast.folderCreatedNext} k={x.k} />
        : x.kind === "moved" ? <MapToast key={x.kind} icon="ghl:Dataflow01" title={ASSISTANT.toast.moved} body={ASSISTANT.toast.unsaved} undo k={x.k} />
        : <MapToast key={x.kind} icon="ghl:CheckCircle" title={ASSISTANT.toast.saved} body={ASSISTANT.toast.savedNext} k={x.k} width={340} />)}
      {f.header ? <HeaderCluster dirty={f.header.dirty} press={f.header.press} /> : null}
      {/* GridLeftSidebar's slide-left: 0.2 s, opacity and 20 px */}
      <AssistantPanel s={{ ...f.panel, t }} style={{ opacity: f.panelK, transform: `translateX(${(1 - f.panelK) * -20}px)` }} />
      <div style={{ transform: f.press ? "scale(0.9)" : undefined, transformOrigin: `${f.cursor[0]}px ${f.cursor[1]}px`, position: "absolute", inset: 0 }}>
        <Cursor x={f.cursor[0]} y={f.cursor[1]} />
      </div>
    </>
  );
};

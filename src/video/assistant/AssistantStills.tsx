// Stills of the Assistant section, redrawn (composition "AssistantStills", prop `still`): the film's frame for the app's
// chrome, the map redrawn with the product's renderer, and the panel drawn as GridMapsChatPanel draws it. For reviewing
// the look before the section is animated (assistant/shots.ts will drive the same pieces over time).
import React from "react";
import { AbsoluteFill, Freeze, OffthreadVideo, staticFile } from "remotion";
import { GLOBAL_CSS, loadFonts } from "../fonts";
import { APP_FILE, ASSISTANT, FPS } from "../script";
import { MapShots } from "../map3d/MapShots";
import { EdgeLook, MapPlane, MapView, NodeLook } from "../map3d/MapScene";
import { ACT_WORLD, corners, fitCamera, FOLDER, GROWTH, GROWTH_FOLDER, MOVED, OFFER } from "./actWorld";
import { HeaderSave, MapToast } from "./MapChrome";
import { AssistantPanel, Chip, ChatItem, PanelState } from "./Panel";
import { MAP_CANVAS } from "./tokens";

loadFonts();

/** Film UI that sits on the canvas beside the open panel (filter pills, the bottom-right toolbar), window px. */
const CANVAS_UI_WIN = [[448, 92, 768, 31], [1238, 815, 358, 38]];
const CANVAS_UI = CANVAS_UI_WIN.map(([x, y, w, h]) => [x - MAP_CANVAS.left, y - MAP_CANVAS.top, w, h]);
const holesMask = (rects: number[][]) => {
  const holes = rects.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}z`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_CANVAS.width}" height="${MAP_CANVAS.height}"><path fill-rule="evenodd" d="M0 0H${MAP_CANVAS.width}V${MAP_CANVAS.height}H0z${holes}"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

type ActMap = { camera: "overview" | "growth" | "folder"; folder?: boolean; folderLift?: boolean; highlight?: boolean; moved?: boolean };
type Still = { film: number; map: { film: number } | ActMap; panel: Omit<PanelState, "t">; toast?: "created" | "moved"; save?: boolean };

const ws: Chip = { kind: "workflows", count: 5 }, gf: Chip = { kind: "folder", name: "growth foundations" };
const ask = ASSISTANT.ask;
/** One finished turn of the act scene, its plan in `status`, its follow-up line when `after`. */
const turn = (i: number, status: "pending" | "running" | "applied", after: boolean, last: boolean, chips?: Chip[]): ChatItem[] => {
  const a = ASSISTANT.act[i];
  return [
    { kind: "user", text: a.prompt, chips },
    { kind: "assistant", thought: a.thought, blocks: [a.reply], plan: { spec: a.plan, status }, feedback: last && !after && status !== "running" },
    ...(after ? [{ kind: "assistant" as const, blocks: [a.after], feedback: last }] : []),
  ];
};

const ACT_FILM = 236.3;
const STILLS: Record<string, Still> = {
  // ── Ask your map anything ──
  A1: { film: 159.6, map: { film: 159.6 }, panel: { empty: {}, items: [], hover: "tile:summarize" } },
  A2: { film: 161, map: { film: 161 }, panel: { items: [{ kind: "user", text: ask.prompt }, { kind: "progress", step: 1 }], loading: true } },
  A3: { film: 161.5, map: { film: 161.5 }, panel: { items: [{ kind: "user", text: ask.prompt },
    { kind: "assistant", thought: ask.thought, blocks: ask.answer, plan: { spec: ask.offer, status: "pending" }, feedback: true }], hover: "apply" } },
  A4: { film: 168.5, map: { film: 168.5 }, panel: { items: [{ kind: "user", text: ask.prompt },
    { kind: "assistant", thought: ask.thought, blocks: ask.answer, plan: { spec: ask.offer, status: "applied" }, feedback: true }], history: true } },
  // ── It does the work ──
  B1: { film: ACT_FILM, map: { camera: "overview" }, panel: { items: turn(0, "pending", false, true), hover: "apply" } },
  B2: { film: ACT_FILM, map: { camera: "growth", highlight: true }, panel: { items: turn(0, "applied", true, true), selection: [ws], history: true,
    draft: "Create a new folder called growth foundations", caret: true } },
  B3: { film: ACT_FILM, map: { camera: "growth", highlight: true }, panel: { items: [...turn(0, "applied", true, false), ...turn(1, "pending", false, true, [ws])],
    selection: [ws], history: true, hover: "apply" } },
  B4: { film: ACT_FILM, map: { camera: "folder", folder: true, folderLift: true }, toast: "created",
    panel: { items: [...turn(0, "applied", true, false), ...turn(1, "applied", true, true, [ws])], selection: [gf], history: true } },
  B5: { film: ACT_FILM, map: { camera: "folder", folder: true, folderLift: true },
    panel: { items: [...turn(0, "applied", true, false), ...turn(1, "applied", true, false, [ws]), ...turn(2, "pending", false, true, [gf])], selection: [gf], history: true, hover: "apply" } },
  B6: { film: ACT_FILM, map: { camera: "folder", folder: true, moved: true }, toast: "moved", save: true,
    panel: { items: [...turn(0, "applied", true, false), ...turn(1, "applied", true, false, [ws]), ...turn(2, "applied", true, true, [gf])], selection: [ws, { kind: "folder", name: "1 folder" }], history: true } },
};

const actLooks = (m: ActMap) => {
  const looks: Record<string, NodeLook> = {}, edgeLooks: Record<string, EdgeLook> = {}, planeLooks: Record<string, Partial<MapPlane>> = {};
  const lit = new Set([...GROWTH, OFFER]);
  for (const n of ACT_WORLD.nodes) {
    if (m.highlight) looks[n.id] = lit.has(n.id) ? { selected: n.id === OFFER ? 0 : 1 } : { dim: 1 };
    if (m.moved && MOVED[n.id]) looks[n.id] = { ...looks[n.id], ...MOVED[n.id] };
  }
  for (const e of ACT_WORLD.edges) {
    const on = lit.has(e.from) && lit.has(e.to);
    if (m.highlight) edgeLooks[`${e.from}>${e.to}`] = on ? { lit: 1 } : { dim: 1 };
  }
  planeLooks[GROWTH_FOLDER] = { opacity: m.folder ? 1 : 0, lift: m.folderLift ? 1 : 0 };
  return { looks, edgeLooks, planeLooks };
};

const actCamera = (m: ActMap) => {
  const { width: w, height: h } = MAP_CANVAS;
  if (m.camera === "overview") return fitCamera(ACT_WORLD.planes.filter((p) => p.id !== GROWTH_FOLDER).flatMap(corners), w, h, 0.06);
  if (m.camera === "growth") return fitCamera(ACT_WORLD.nodes.filter((n) => GROWTH.includes(n.id) || n.id === OFFER), w, h, 0.16);
  return fitCamera(corners(FOLDER), w, h, 0.2);
};

export const AssistantStills: React.FC<{ still: string }> = ({ still }) => {
  const s = STILLS[still];
  const t = s.film;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{GLOBAL_CSS}</style>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile(`footage/${APP_FILE}`)} muted trimBefore={Math.round(s.film * FPS)} style={{ width: 1620, height: 880 }} />
      </Freeze>
      {"film" in s.map ? <MapShots ft={s.map.film} cursor={false} board={MAP_CANVAS} fixedUi={CANVAS_UI_WIN} /> : (() => {
        const m = s.map as ActMap, l = actLooks(m);
        return (
          <div style={{ position: "absolute", left: MAP_CANVAS.left, top: MAP_CANVAS.top, width: MAP_CANVAS.width, height: MAP_CANVAS.height,
            borderRadius: MAP_CANVAS.radius, overflow: "hidden", maskImage: holesMask(CANVAS_UI), maskSize: "100% 100%" }}>
            <MapView scene={ACT_WORLD} width={MAP_CANVAS.width} height={MAP_CANVAS.height} camera={actCamera(m)} t={t} {...l} />
          </div>
        );
      })()}
      {s.toast === "created" ? <MapToast icon="ghl:Folder" dark title={ASSISTANT.toast.folderCreated} body={ASSISTANT.toast.folderCreatedNext} /> : null}
      {s.toast === "moved" ? <MapToast icon="ghl:Dataflow01" title={ASSISTANT.toast.moved} body={ASSISTANT.toast.unsaved} undo /> : null}
      {s.save ? <HeaderSave /> : null}
      <AssistantPanel s={{ ...s.panel, t }} />
    </AbsoluteFill>
  );
};

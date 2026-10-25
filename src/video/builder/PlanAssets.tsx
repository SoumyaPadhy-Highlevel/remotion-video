// "Plan it", told the way the product does it (staging Workflow Maps; automation-workflows-frontend master): select Tag New
// Enquiries, search its assets for the follow-up tag, hover its step and View step, which opens the workflow preview on that
// exact step (centred at 100 %, selected, its read-only settings beside it, where a push-in finds the follow-up tag). Then
// click the Coaching Enquiry form on the map: every workflow using it, one expanded to the trigger that uses it, the Draft
// tab, and "Show usage on map", which arcs the form to its copy in another folder and frames them both. Everything in the app
// window is drawn here over the film's map page (its header, rail, pills and toolbars stay): the map with the product's
// renderer, the drawer and the preview from the product's components. `t` is seconds into the shot.
import React from "react";
import { AssetsMap, AssetsPlan, cursorPos, filmProject, frameCam, fromFilm } from "../map3d/AssetsShot";
import { MAP_WORLDS } from "../map3d/spacing";
import { AssetDrawer, AssetEntry, DrawerCard, UsingWorkflow, WorkflowDrawer } from "./GridDrawer";
import { layoutMaps } from "./mapsLayout";
import { MODAL, MODAL_CANVAS, PaneStep, PreviewModal } from "./PreviewModal";
import { Cursor } from "./shotKit";
import { BUILDER_WORKFLOWS, PLAN_SHOT } from "../script";

const seg = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Tag New Enquiries on staging (01 · Lead Capture): the Coaching Enquiry form starts it, one Add Contact Tag adds follow-up
 *  and interest-membership. */
const TNE_ASSETS: AssetEntry[] = [
  { type: "forms", name: "Coaching Enquiry", steps: [{ kind: "trigger", name: "Form Submitted" }] },
  { type: "tags", name: "follow-up", steps: [{ kind: "action", name: "Add Contact Tag" }] },
  { type: "tags", name: "interest-membership", steps: [{ kind: "action", name: "Add Contact Tag" }] },
];
/** The Coaching Enquiry form starts four workflows in four folders (the intro's "one form, four workflows"). */
const FORM_USERS: UsingWorkflow[] = [
  { name: "Tag New Enquiries", folder: "01 · Lead Capture", steps: [{ kind: "trigger", name: "Form Submitted" }] },
  { name: "contact tag - form 7", folder: "08 · Tag-Based Routing", steps: [{ kind: "trigger", name: "Form Submitted" }] },
  { name: "new lead", folder: "13 · Lead Alerts & Monitoring", steps: [{ kind: "trigger", name: "Form Submitted" }] },
  { name: "from sub wf", folder: "14 · Email & Contact Engagement", draft: true, steps: [{ kind: "trigger", name: "Form Submitted" }] },
];
const QUERY = "follow-up";
/** The highlighted step's settings (ContactTag.vue: Action name, Tags). */
const TAG_STEP: PaneStep = { kind: "action", title: "Add contact tag", icon: "heroicons-solid:tag", tone: "primary",
  fields: [{ label: "Action name", input: "Add Contact Tag" }, { label: "Tags", chips: ["follow-up", "interest-membership"] }] };

/** Moments (s into the shot; it is PLAN_SHOT.len long and the asset part starts at PLAN_SHOT.split, under its top line). */
const S2 = PLAN_SHOT.split;
export const PLAN = {
  selTNE: 1.15, search: 2.65, typeFrom: 2.85, typeTo: 3.55, stepHover: 4.45, btnHover: 4.75, view: 4.95, modalIn: [5.0, 5.25], pan: [5.1, 5.3],
  ring: [5.3, 5.6], pane: [5.05, 5.25],
  // a small push-in onto the follow-up tag in the step's settings, and a glow on it
  focusIn: [6.0, 6.6], glow: [6.35, 7.65], focusOut: [7.6, 8.1], close: 8.6, modalOut: [8.6, 8.8],
  selForm: S2 + 0.6, open2: [S2 + 2.6, S2 + 2.8], step2: S2 + 3.3, draft: S2 + 4.6, usage: S2 + 5.9, end: PLAN_SHOT.len,
};

/** The map's world for this shot (spaced, map3d/spacing.ts): the form's copy in 08 carries the form's name. */
const WORLD = { ...MAP_WORLDS.main, nodes: MAP_WORLDS.main.nodes.map((n) => (n.id === "a-form-7" ? { ...n, label: "Coaching Enquiry" } : n)) };
const node = (id: string) => WORLD.nodes.find((n) => n.id === id)!;
const C0 = fromFilm({ wx: 6.6, wz: 5.4, sx: 560, sy: 470, z: 1.05 });   // Lead Capture, Tag New Enquiries left of the drawer
const C1 = fromFilm({ wx: 6.2, wz: 5.2, sx: 560, sy: 470, z: 1.1 });    // the form centred in the map left of the drawer
// both copies of the form and their workflows (frameNodes), in the canvas left of the drawer (at 1158)
const C2 = frameCam(["a-coaching-enquiry", "a-form-7", "contact-tag-form-7", "tag-new-enquiries"].map(node), 1158, 110, 0.7);
const MAP: AssetsPlan = {
  cams: [{ t: 0, cam: C0 }, { t: PLAN.selForm + 0.75, from: PLAN.selForm + 0.05, cam: C1 }, { t: PLAN.usage + 0.75, from: PLAN.usage + 0.05, cam: C2 }],
  select: [[PLAN.selTNE, PLAN.selForm], [PLAN.selForm, null], [PLAN.usage, null]],
  groups: [
    { selected: "tag-new-enquiries", lit: ["tag-new-enquiries", "a-coaching-enquiry", "a-follow-up", "a-interest-membership"], dims: true },
    { selected: "a-coaching-enquiry", lit: ["a-coaching-enquiry", "tag-new-enquiries"], dims: true },
    { selected: "a-coaching-enquiry", lit: ["a-coaching-enquiry", "a-form-7", "contact-tag-form-7", "tag-new-enquiries"], dims: true },
  ],
  drawer: (t) => (t >= PLAN.selTNE ? 1 : 0),
  world: WORLD,
  // the usage arcs (ShallowEdgeRenderer): teal-500, the form's type shade, from the form to its copy
  arcs: (t) => (t >= PLAN.usage + 0.02 ? [{ from: "a-coaching-enquiry", to: "a-form-7", color: "#14b8a6" }] : []),
};

// where things are (window px): map nodes under the camera, drawer rows from GridDrawer's layout (drawer at 1158, 76)
const tne = filmProject(C0, node("tag-new-enquiries").x, 0.3, node("tag-new-enquiries").z), form = filmProject(C1, node("a-coaching-enquiry").x, 0.3, node("a-coaching-enquiry").z);
const D = (x: number, y: number): [number, number] => [1158 + x, 76 + y];
const AT = { search: D(150, 406), step: D(150, 639), viewBtn: D(392, 639), close: [MODAL.left + MODAL.width - MODAL.pad - 16, MODAL.top + MODAL.pad + 16] as [number, number],
  row2: D(250, 521), step2: D(150, 601), draftTab: D(180, 404), usage: D(225, 96) };
/** Where the follow-up chip sits in the preview's detail pane (window px): the push-in's centre. */
const CHIP = { x: 1196, y: 391 };
const P0 = PLAN;
const CURSOR: { t: number; at: [number, number]; bow?: number }[] = [
  { t: 0, at: [900, 700] }, { t: 0.5, at: [900, 700] }, { t: P0.selTNE - 0.05, at: [tne[0] + 3, tne[1] + 4], bow: 0.12 }, { t: 2.2, at: [tne[0] + 3, tne[1] + 4] },
  { t: P0.search - 0.05, at: AT.search, bow: 0.08 }, { t: 4.1, at: [AT.search[0] + 2, AT.search[1] + 1] },
  { t: P0.stepHover, at: AT.step, bow: 0.06 }, { t: P0.btnHover, at: AT.viewBtn, bow: 0.02 }, { t: P0.view + 0.05, at: AT.viewBtn },
  { t: 5.8, at: [1330, 700], bow: 0.05 }, { t: 8.15, at: [1330, 700] }, { t: P0.close - 0.1, at: AT.close, bow: 0.08 }, { t: P0.close + 0.05, at: AT.close },
  { t: P0.selForm - 0.05, at: [form[0] + 3, form[1] + 4], bow: 0.1 }, { t: P0.selForm + 0.4, at: [form[0] + 3, form[1] + 4] },
  { t: P0.open2[0] - 0.05, at: AT.row2, bow: 0.08 }, { t: P0.open2[0] + 0.3, at: AT.row2 }, { t: P0.step2, at: AT.step2, bow: 0.05 }, { t: P0.step2 + 0.7, at: [AT.step2[0] + 4, AT.step2[1]] },
  { t: P0.draft - 0.05, at: AT.draftTab, bow: 0.08 }, { t: P0.draft + 0.4, at: AT.draftTab }, { t: P0.usage - 0.05, at: AT.usage, bow: 0.08 }, { t: P0.usage + 0.5, at: AT.usage },
  { t: P0.usage + 1.3, at: [1000, 640], bow: 0.06 }, { t: PLAN.end, at: [1004, 642] },
];
const CLICKS = [P0.selTNE, P0.search, P0.view, P0.close, P0.selForm, P0.open2[0], P0.draft, P0.usage];

/** The macOS cursor with its click (the film's: a slight press and a ring). */
const ClickCursor: React.FC<{ t: number }> = ({ t }) => {
  const [x, y] = cursorPos(CURSOR, t);
  const c = CLICKS.find((k) => t >= k && t < k + 0.42), rg = c == null ? -1 : (t - c) / 0.42;
  return <>
    {rg >= 0 ? <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, border: "2px solid #2f54eb", boxSizing: "border-box",
      opacity: (1 - rg) * 0.55, transform: `scale(${(0.3 + rg * 0.9).toFixed(3)})` }} /> : null}
    <Cursor x={x} y={y} />
  </>;
};

export const PlanAssets: React.FC<{ t: number }> = ({ t }) => {
  const P = PLAN;
  const typed = QUERY.slice(0, Math.max(0, Math.min(QUERY.length, Math.floor(((t - P.typeFrom) / (P.typeTo - P.typeFrom)) * QUERY.length + 0.0001))));
  const wfDrawer = t >= P.selTNE && t < P.selForm, assetDrawer = t >= P.selForm;
  // the preview: the canvas fits the workflow, then pans to the step at 100 % (panIntoView, 200 ms) and selects it
  const wf = BUILDER_WORKFLOWS.tagNewEnquiries, L = layoutMaps(wf), act = L.nodes.find((n) => n.id === "add-contact-tag")!;
  const fz = Math.min(1, (MODAL_CANVAS.height - 80) / (L.bounds.y1 - L.bounds.y0));
  const fit = { zoom: fz, x: MODAL_CANVAS.width / 2 - (L.bounds.x0 + L.bounds.x1) / 2 * fz, y: MODAL_CANVAS.height / 2 - (L.bounds.y0 + L.bounds.y1) / 2 * fz };
  const ctr = { zoom: 1, x: MODAL_CANVAS.width / 2 - (act.x + act.w / 2), y: MODAL_CANVAS.height / 2 - (act.y + act.h / 2) };
  const pk = eio(seg(t, P.pan[0], P.pan[1]));
  const view = { zoom: fit.zoom + (ctr.zoom - fit.zoom) * pk, x: fit.x + (ctr.x - fit.x) * pk, y: fit.y + (ctr.y - fit.y) * pk };
  const modalK = eo(seg(t, P.modalIn[0], P.modalIn[1])) * (1 - eo(seg(t, P.modalOut[0], P.modalOut[1])));
  const focus = eio(seg(t, P.focusIn[0], P.focusIn[1])) * (1 - eio(seg(t, P.focusOut[0], P.focusOut[1])));
  const glow = t >= P.glow[0] && t < P.glow[1] ? Math.sin(Math.PI * seg(t, P.glow[0], P.glow[1])) : 0;
  return (
    <>
      <AssetsMap t={t} plan={MAP} />
      <DrawerCard k={wfDrawer ? seg(t, P.selTNE, P.selTNE + 0.2) : 0}>
        <WorkflowDrawer name="Tag New Enquiries" folder="01 · Lead Capture" updated="23 Oct 2026, 09:01" enrolled={[0, 0]} assets={TNE_ASSETS}
          query={typed} focus={t >= P.search} caret={t >= P.search && Math.floor(t * 2) % 2 === 0 && typed.length < QUERY.length}
          stepHover={eo(seg(t, P.stepHover, P.stepHover + 0.15))} btnHover={t >= P.btnHover && t < P.close} />
      </DrawerCard>
      <DrawerCard k={assetDrawer ? seg(t, P.selForm, P.selForm + 0.2) : 0}>
        <AssetDrawer type="forms" name="Coaching Enquiry" workflows={FORM_USERS} triggers={4} actions={0} usage usageOn={t >= P.usage} usageHover={t > P.usage - 0.15 && t < P.usage}
          tab={t >= P.draft ? "draft" : "published"}
          open="contact tag - form 7" openK={eio(seg(t, P.open2[0], P.open2[1]))} rowHover={t > P.open2[0] - 0.1 && t < P.step2 - 0.1 ? "contact tag - form 7" : undefined}
          stepHover={t >= P.step2 && t < P.draft - 0.3 ? eo(seg(t, P.step2, P.step2 + 0.15)) : 0} tabHover={t > P.draft - 0.1 && t < P.draft ? "draft" : undefined} />
      </DrawerCard>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${CHIP.x}px ${CHIP.y}px`, transform: `scale(${(1 + 0.3 * focus).toFixed(4)})` }}>
        <PreviewModal k={modalK} name="Tag New Enquiries" wf={wf} view={view} pane={eo(seg(t, P.pane[0], P.pane[1]))} step={TAG_STEP} t={t}
          states={{ [act.id]: { selected: t >= P.ring[0], ring: eo(seg(t, P.ring[0], P.ring[1])) } }} glowChip="follow-up" glow={glow} />
      </div>
      <ClickCursor t={t} />
    </>
  );
};
export const PLAN_LEN = PLAN_SHOT.len;

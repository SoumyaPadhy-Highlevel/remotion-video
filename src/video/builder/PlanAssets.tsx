// "Plan it", told the way the product does it (staging Workflow Maps; automation-workflows-frontend master): select Tag New
// Enquiries, search its assets for the follow-up tag, hover its step and View step, which opens the workflow preview on that
// exact step (centred at 100 %, selected, its read-only settings beside it). Then click the Coaching Enquiry form on the map:
// every workflow using it, one expanded to the trigger that uses it, and the Draft tab. Everything in the app window is
// drawn here over the film's map page (its header, rail, pills and toolbars stay): the map with the product's renderer, the
// drawer and the preview from the product's components. `t` is seconds into the shot.
import React from "react";
import { AssetsMap, AssetsPlan, camAt, cursorPos, filmProject } from "../map3d/AssetsShot";
import { AssetDrawer, AssetEntry, DrawerCard, UsingWorkflow, WorkflowDrawer } from "./GridDrawer";
import { layoutMaps } from "./mapsLayout";
import { MODAL, MODAL_CANVAS, PaneStep, PreviewModal } from "./PreviewModal";
import { Cursor } from "./shotKit";
import { BUILDER_WORKFLOWS } from "../script";

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

/** Moments (s into the shot). */
export const PLAN = {
  selTNE: 0.62, search: 1.3, typeFrom: 1.45, typeTo: 2.05, stepHover: 2.55, btnHover: 2.85, view: 3.0, modalIn: [3.05, 3.3], pan: [3.15, 3.35],
  ring: [3.35, 3.65], pane: [3.1, 3.3], close: 5.35, modalOut: [5.35, 5.55], selForm: 6.2, open2: [7.3, 7.5], draft: 8.5, end: 9.6,
};

const C0 = { wx: 6.6, wz: 5.4, sx: 560, sy: 470, z: 1.05 };   // Lead Capture, Tag New Enquiries left of the drawer
const C1 = { wx: 6.2, wz: 5.2, sx: 560, sy: 470, z: 1.1 };    // the form centred in the map left of the drawer
const MAP: AssetsPlan = {
  cams: [{ t: 0, cam: C0 }, { t: PLAN.selForm + 0.75, from: PLAN.selForm + 0.05, cam: C1 }],
  select: [[PLAN.selTNE, PLAN.selForm], [PLAN.selForm, null]],
  groups: [
    { selected: "tag-new-enquiries", lit: ["tag-new-enquiries", "a-coaching-enquiry", "a-follow-up", "a-interest-membership"], dims: true },
    { selected: "a-coaching-enquiry", lit: ["a-coaching-enquiry", "tag-new-enquiries"], dims: true },
  ],
  drawer: (t) => (t >= PLAN.selTNE ? 1 : 0),
};

// where things are (window px): map nodes under the camera, drawer rows from GridDrawer's layout (drawer at 1158, 76)
const tne = filmProject(C0, 8.54, 0.3, 6.35), form = filmProject(C1, 6.16, 0.3, 5.17);
const D = (x: number, y: number): [number, number] => [1158 + x, 76 + y];
const AT = { search: D(150, 406), step: D(150, 579 + 60), viewBtn: D(392, 579 + 60), close: [MODAL.left + MODAL.width - MODAL.pad - 16, MODAL.top + MODAL.pad + 16] as [number, number],
  row2: D(250, 521), draftTab: D(180, 404) };
const CURSOR: { t: number; at: [number, number]; bow?: number }[] = [
  { t: 0, at: [900, 700] }, { t: 0.55, at: [tne[0] + 3, tne[1] + 4], bow: 0.12 }, { t: 0.95, at: [tne[0] + 3, tne[1] + 4] },
  { t: 1.25, at: AT.search, bow: 0.08 }, { t: 2.3, at: [AT.search[0] + 2, AT.search[1] + 1] },
  { t: 2.55, at: AT.step, bow: 0.06 }, { t: 2.85, at: AT.viewBtn, bow: 0.02 }, { t: 3.05, at: AT.viewBtn },
  { t: 5.25, at: AT.close, bow: 0.08 }, { t: 5.4, at: AT.close },
  { t: 6.15, at: [form[0] + 3, form[1] + 4], bow: 0.1 }, { t: 6.35, at: [form[0] + 3, form[1] + 4] },
  { t: 7.25, at: AT.row2, bow: 0.08 }, { t: 7.5, at: AT.row2 }, { t: 8.45, at: AT.draftTab, bow: 0.08 }, { t: PLAN.end, at: [AT.draftTab[0] + 2, AT.draftTab[1] + 2] },
];
const CLICKS = [0.6, PLAN.search, PLAN.view, PLAN.close, PLAN.selForm, PLAN.open2[0], PLAN.draft];

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
  const wf = BUILDER_WORKFLOWS.formToTag, L = layoutMaps(wf), act = L.nodes.find((n) => n.kind === "action")!;
  const fit = { zoom: 0.9, x: MODAL_CANVAS.width / 2 - (L.bounds.x0 + L.bounds.x1) / 2 * 0.9, y: MODAL_CANVAS.height / 2 - (L.bounds.y0 + L.bounds.y1) / 2 * 0.9 };
  const cwFinal = MODAL_CANVAS.width, ctr = { zoom: 1, x: cwFinal / 2 - (act.x + act.w / 2), y: MODAL_CANVAS.height / 2 - (act.y + act.h / 2) };
  const pk = eio(seg(t, P.pan[0], P.pan[1]));
  const view = { zoom: fit.zoom + (ctr.zoom - fit.zoom) * pk, x: fit.x + (ctr.x - fit.x) * pk, y: fit.y + (ctr.y - fit.y) * pk };
  const modalK = eo(seg(t, P.modalIn[0], P.modalIn[1])) * (1 - eo(seg(t, P.modalOut[0], P.modalOut[1])));
  const ringK = eo(seg(t, P.ring[0], P.ring[1]));
  return (
    <>
      <AssetsMap t={t} plan={MAP} />
      <DrawerCard k={wfDrawer ? seg(t, P.selTNE, P.selTNE + 0.2) : 0}>
        <WorkflowDrawer name="Tag New Enquiries" folder="01 · Lead Capture" updated="23 Oct 2026, 09:01" enrolled={[0, 0]} assets={TNE_ASSETS}
          query={typed} focus={t >= P.search} caret={t >= P.search && Math.floor(t * 2) % 2 === 0 && typed.length < QUERY.length}
          stepHover={eo(seg(t, P.stepHover, P.stepHover + 0.15))} btnHover={t >= P.btnHover && t < P.close} />
      </DrawerCard>
      <DrawerCard k={assetDrawer ? seg(t, P.selForm, P.selForm + 0.2) : 0}>
        <AssetDrawer type="forms" name="Coaching Enquiry" workflows={FORM_USERS} triggers={4} actions={0} usage tab={t >= P.draft ? "draft" : "published"}
          open="contact tag - form 7" openK={eio(seg(t, P.open2[0], P.open2[1]))} rowHover={t > 7.2 && t < P.draft - 0.3 ? "contact tag - form 7" : undefined}
          tabHover={t > 8.4 && t < P.draft ? "draft" : undefined} />
      </DrawerCard>
      <PreviewModal k={modalK} name="Tag New Enquiries" wf={wf} view={view} pane={eo(seg(t, P.pane[0], P.pane[1]))} step={TAG_STEP} t={t}
        states={{ [act.id]: { selected: t >= P.ring[0], ring: ringK } }} />
      <ClickCursor t={t} />
    </>
  );
};
export const PLAN_LEN = PLAN.end;
export { camAt };

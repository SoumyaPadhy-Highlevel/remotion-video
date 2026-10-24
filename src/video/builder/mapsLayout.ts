// Where Workflow Maps' workflow view puts a classic (top-down) workflow's nodes and edges: the modal's read-only canvas
// (automation-workflows-frontend advanced-workflow-canvas, vertical orientation). ELK lays it out top to bottom with 96 px
// between layers and 20 px between siblings; cards are 240 × 72, If/Else branch lanes 240 × 80. There is no END node and no
// "+": a leaf just stops. Edges are smooth-steps with 16 px corners from the source's handle (hanging under the card) to
// the target's handle (on its top edge). Pure: a workflow in, positions out.
import { lanes, stepPath, TriggerSpec, WorkflowSpec, StepSpec } from "./layout";
import type { Tone } from "./tokens";

export const MAPS = { w: 240, h: 72, branchH: 80, layerGap: 96, lane: 260, handle: 12 };

export type MapsNode = { id: string; kind: "trigger" | "action" | "branch"; x: number; y: number; w: number; h: number; label: string; icon: string; tone: Tone; text?: string };
/** `d`: SVG path from the source handle's bottom to the target handle's top (where the arrowhead's tip sits). */
export type MapsEdge = { id: string; from: string; to: string; d: string; end: { x: number; y: number } };
export type MapsLayout = { nodes: MapsNode[]; edges: MapsEdge[]; bounds: { x0: number; y0: number; x1: number; y1: number } };

/** The source handle hangs under its card (top: 100%), the target handle sits 70 % above the top edge. */
const out = (n: MapsNode) => ({ x: n.x + n.w / 2, y: n.y + n.h + MAPS.handle });
const into = (n: MapsNode) => ({ x: n.x + n.w / 2, y: n.y - MAPS.handle * 0.7 });

export const layoutMaps = (wf: WorkflowSpec): MapsLayout => {
  const nodes: MapsNode[] = [], edges: MapsEdge[] = [];
  const link = (a: MapsNode, b: MapsNode) => {
    const s = out(a), t = into(b);
    edges.push({ id: `${a.id}-${b.id}`, from: a.id, to: b.id, d: stepPath(s.x, s.y, t.x, t.y), end: t });
  };
  // a run of steps under `parent`, the first one's top at `top`, centred on `cx`
  const run = (steps: StepSpec[], cx: number, top: number, parent?: MapsNode) => {
    let prev = parent, y = top;
    for (const s of steps) {
      // an If/Else step is an ordinary card with the code-braces icon (advanced-workflow-canvas utils/node-utils.ts)
      const n: MapsNode = s.kind === "ifElse"
        ? { id: s.id, kind: "action", x: cx - MAPS.w / 2, y, w: MAPS.w, h: MAPS.h, label: s.label, icon: "mdi:code-braces", tone: "purple" }
        : { id: s.id, kind: "action", x: cx - MAPS.w / 2, y, w: MAPS.w, h: MAPS.h, label: s.label, icon: s.icon, tone: s.tone };
      nodes.push(n);
      if (prev) link(prev, n);
      prev = n;
      y += MAPS.h + MAPS.layerGap;
      if (s.kind === "ifElse") {
        let lane = -s.branches.reduce((m, b) => m + lanes(b.steps), 0) / 2;
        for (const b of s.branches) {
          const k = lanes(b.steps), bx = cx + (lane + k / 2) * MAPS.lane;
          lane += k;
          const bn: MapsNode = { id: b.id, kind: "branch", x: bx - MAPS.w / 2, y, w: MAPS.w, h: MAPS.branchH, label: b.title, icon: "vaadin:road-split", tone: "purple", text: b.text };
          nodes.push(bn);
          link(n, bn);
          run(b.steps, bx, y + MAPS.branchH + MAPS.layerGap, bn);
        }
        return;
      }
    }
  };
  const t: TriggerSpec | undefined = wf.triggers[0];
  const trigger: MapsNode | undefined = t && { id: t.id, kind: "trigger", x: 0, y: 0, w: MAPS.w, h: MAPS.h, label: t.name ?? t.title, icon: t.icon, tone: t.tone };
  if (trigger) nodes.push(trigger);
  run(wf.steps, MAPS.w / 2, trigger ? MAPS.h + MAPS.layerGap : 0, trigger);
  const bounds = nodes.reduce((b, n) => ({ x0: Math.min(b.x0, n.x), y0: Math.min(b.y0, n.y), x1: Math.max(b.x1, n.x + n.w), y1: Math.max(b.y1, n.y + n.h) }),
    { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
  return { nodes, edges, bounds };
};

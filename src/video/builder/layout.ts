// Where the builder puts every node and edge, ported from utils/canvas_helper.ts in automation-workflows-frontend: the first
// step's top-left is the origin, steps are 160 apart, If/Else lanes 260 apart, the trigger row 300 above the first step and
// centred over it, and edges are Vue Flow smooth-step paths with 16 px corners. Pure: a workflow in, positions out.
import { ACTION, ADD_TRIGGER, BRANCH, CANVAS, END, PLUS, TRIGGER, Tone } from "./tokens";

export type TriggerSpec = { id: string; title: string; name?: string; icon: string; tone: Tone; filters: string[] };
export type ActionSpec = { kind: "action"; id: string; label: string; icon: string; tone: Tone };
export type IfElseSpec = { kind: "ifElse"; id: string; label: string; branches: { id: string; title: string; text: string; steps: StepSpec[] }[] };
export type StepSpec = ActionSpec | IfElseSpec;
export type WorkflowSpec = { triggers: TriggerSpec[]; addTrigger?: boolean; steps: StepSpec[] };

export type PlacedNode =
  | { kind: "trigger"; id: string; x: number; y: number; w: number; h: number; trigger: TriggerSpec }
  | { kind: "addTrigger"; id: string; x: number; y: number; w: number; h: number }
  | { kind: "action"; id: string; x: number; y: number; w: number; h: number; action: ActionSpec | IfElseSpec }
  | { kind: "branch"; id: string; x: number; y: number; w: number; h: number; title: string; text: string }
  | { kind: "end"; id: string; x: number; y: number; w: number; h: number };
/** `d`: SVG path; `plus`: centre of the edge's "+" button, if it has one. `to`: the node it leads into. */
export type PlacedEdge = { id: string; to: string; d: string; plus?: { x: number; y: number } };
export type WorkflowLayout = { nodes: PlacedNode[]; edges: PlacedEdge[]; bounds: { x0: number; y0: number; x1: number; y1: number } };

const W = CANVAS.nodeW;

/** Vue Flow's smooth-step path from a node's bottom centre to the next node's top centre (offset 0): down to the middle,
 * across, down, with rounded corners of up to `CANVAS.edgeRadius`. `midY` overrides the middle (a shared junction). */
export const stepPath = (sx: number, sy: number, tx: number, ty: number, midY = (sy + ty) / 2) => {
  const dx = tx - sx;
  if (Math.abs(dx) < 0.5) return `M${sx} ${sy}L${tx} ${ty}`;
  const r = Math.min(CANVAS.edgeRadius, Math.abs(dx) / 2, midY - sy, ty - midY), s = Math.sign(dx);
  return `M${sx} ${sy}L${sx} ${midY - r}Q${sx} ${midY} ${sx + s * r} ${midY}L${tx - s * r} ${midY}Q${tx} ${midY} ${tx} ${midY + r}L${tx} ${ty}`;
};

/** A straight edge with a "+" on it: the button sits 5 px above the edge's midpoint (EdgeWithPlus.vue). */
const plusEdge = (id: string, to: string, x: number, y0: number, y1: number): PlacedEdge => ({ id, to, d: `M${x} ${y0}L${x} ${y1}`, plus: { x, y: (y0 + y1) / 2 - 5 } });

/** How many 260 px lanes a run of steps needs (an If/Else needs the sum of its branches). */
export const lanes = (steps: StepSpec[]): number =>
  steps.reduce((m, s) => Math.max(m, s.kind === "ifElse" ? s.branches.reduce((n, b) => n + lanes(b.steps), 0) : 1), 1);

export const layoutWorkflow = (wf: WorkflowSpec): WorkflowLayout => {
  const nodes: PlacedNode[] = [], edges: PlacedEdge[] = [];

  // a run of steps hanging under (cx, top): each step 160 below the last, an END after the last plain step
  const run = (steps: StepSpec[], cx: number, top: number, key: string) => {
    let y = top;
    for (const [i, s] of steps.entries()) {
      nodes.push({ kind: "action", id: s.id, x: cx - W / 2, y, w: W, h: ACTION.h, action: s });
      if (s.kind === "ifElse") {
        const total = s.branches.reduce((n, b) => n + lanes(b.steps), 0);
        let lane = -total / 2;
        for (const b of s.branches) {
          const n = lanes(b.steps), bx = cx + (lane + n / 2) * CANVAS.laneGap;
          lane += n;
          const by = y + CANVAS.rowGap;
          nodes.push({ kind: "branch", id: b.id, x: bx - W / 2, y: by, w: W, h: BRANCH.h, title: b.title, text: b.text });
          // condition → branch: no "+" (canvas_helper.ts customType for condition-node)
          edges.push({ id: `${s.id}-${b.id}`, to: b.id, d: stepPath(cx, y + ACTION.h, bx, by) });
          run(b.steps, bx, by + CANVAS.rowGap, b.id);
          const first = b.steps[0];
          edges.push(plusEdge(`${b.id}-next`, first ? first.id : `${b.id}-end`, bx, by + BRANCH.h, by + CANVAS.rowGap));
        }
        return;
      }
      const next = steps[i + 1];
      edges.push(plusEdge(`${s.id}-next`, next ? next.id : `${key}-end`, cx, y + ACTION.h, y + CANVAS.rowGap));
      y += CANVAS.rowGap;
    }
    // END pill: centred in its 240 px node (mx-24)
    nodes.push({ kind: "end", id: `${key}-end`, x: cx - END.w / 2, y, w: END.w, h: END.h });
  };

  if (wf.steps.length) run(wf.steps, W / 2, 0, "root");
  else nodes.push({ kind: "end", id: "root-end", x: W / 2 - END.w / 2, y: 0, w: END.w, h: END.h });

  // the trigger row, centred over the first step; the "Add new trigger" card sits 44 lower (AddTriggerNode.vue)
  const count = wf.triggers.length + (wf.addTrigger ? 1 : 0);
  const rowW = count * W + Math.max(0, count - 1) * CANVAS.triggerGap;
  const junction = (CANVAS.triggerY + TRIGGER.h) / 2;
  const firstId = wf.steps[0]?.id ?? "root-end";
  let x = W / 2 - rowW / 2;
  for (const t of wf.triggers) {
    nodes.push({ kind: "trigger", id: t.id, x, y: CANVAS.triggerY, w: W, h: TRIGGER.h, trigger: t });
    edges.push({ id: `${t.id}-edge`, to: firstId, d: stepPath(x + W / 2, CANVAS.triggerY + TRIGGER.h, W / 2, 0, junction) });
    x += W + CANVAS.triggerGap;
  }
  if (wf.addTrigger) {
    const y = CANVAS.triggerY + (wf.triggers.length ? CANVAS.addTriggerDrop : 0);
    nodes.push({ kind: "addTrigger", id: "add-trigger", x, y, w: W, h: ADD_TRIGGER.h });
    edges.push({ id: "add-trigger-edge", to: firstId, d: stepPath(x + W / 2, y + ADD_TRIGGER.h, W / 2, 0, junction) });
  }
  // the root "+" sits 40 px above the first step (NodeRootActions.vue: -top-14, p-1)
  if (count) edges.push({ id: "root-plus", to: firstId, d: "", plus: { x: W / 2, y: -56 + 4 + PLUS.size / 2 } });

  const bounds = nodes.reduce((b, n) => ({ x0: Math.min(b.x0, n.x), y0: Math.min(b.y0, n.y), x1: Math.max(b.x1, n.x + n.w), y1: Math.max(b.y1, n.y + n.h) }),
    { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity });
  return { nodes, edges, bounds };
};

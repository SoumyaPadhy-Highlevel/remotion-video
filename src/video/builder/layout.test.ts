// Checks the builder layout against the real canvas's rules (utils/canvas_helper.ts) and live measurements. Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutWorkflow, stepPath, WorkflowSpec } from "./layout";

const trigger = (id: string) => ({ id, title: "Contact Tag", icon: "heroicons-outline:tag", tone: "primary" as const, filters: [] });
const action = (id: string) => ({ kind: "action" as const, id, label: id, icon: "heroicons-solid:tag", tone: "primary" as const });
const find = (wf: WorkflowSpec, id: string) => {
  const n = layoutWorkflow(wf).nodes.find((m) => m.id === id);
  assert.ok(n, `node ${id}`);
  return n;
};

test("steps stack 160 px apart and end in a centred END pill", () => {
  const wf = { triggers: [], steps: [action("a"), action("b")] };
  assert.deepEqual([find(wf, "a").y, find(wf, "b").y, find(wf, "root-end").y], [0, 160, 320]);
  const end = find(wf, "root-end");
  assert.equal(end.x + end.w / 2, 120);
});

test("trigger row sits 300 above the first step, centred over it, with Add new trigger 44 lower", () => {
  const wf = { triggers: [trigger("t1")], addTrigger: true, steps: [action("a")] };
  const t1 = find(wf, "t1"), add = find(wf, "add-trigger");
  assert.equal(t1.y, -300);
  assert.equal(add.y, -256);
  assert.equal(add.x - (t1.x + t1.w), 15);
  assert.equal((t1.x + add.x + add.w) / 2, 120);
});

test("If/Else branches spread 260 px apart and each gets its own END", () => {
  const wf: WorkflowSpec = { triggers: [], steps: [{ kind: "ifElse", id: "c", label: "Condition", branches: [
    { id: "b1", title: "Branch", text: "", steps: [] }, { id: "b2", title: "None", text: "", steps: [] },
  ] }] };
  const b1 = find(wf, "b1"), b2 = find(wf, "b2");
  assert.equal(b2.x - b1.x, 260);
  assert.equal((b1.x + b2.x + 240) / 2, 120);
  assert.equal(b1.y, 160);
  assert.equal(find(wf, "b1-end").y, 320);
});

test("only step-to-step edges carry a + button, 5 px above their midpoint", () => {
  const { edges } = layoutWorkflow({ triggers: [trigger("t1")], steps: [action("a")] });
  assert.equal(edges.find((e) => e.id === "t1-edge")?.plus, undefined);
  assert.deepEqual(edges.find((e) => e.id === "a-next")?.plus, { x: 120, y: 110 });
  assert.deepEqual(edges.find((e) => e.id === "root-plus")?.plus, { x: 120, y: -40 });
});

test("smooth-step paths turn with 16 px corners, or less when the gap is small", () => {
  assert.equal(stepPath(0, 0, 0, 90), "M0 0L0 90");
  assert.match(stepPath(0, 0, 100, 90), /Q0 45 16 45/);
  assert.match(stepPath(0, 0, 10, 90), /Q0 45 5 45/);
});

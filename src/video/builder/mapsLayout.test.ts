// Checks Workflow Maps' top-down layout against the advanced canvas's rules (ELK, 96 px layers, 260 px lanes). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { layoutMaps } from "./mapsLayout";
import { WorkflowSpec } from "./layout";

const wf: WorkflowSpec = {
  triggers: [{ id: "t", title: "Order Submitted", icon: "heroicons-outline:clipboard-list", tone: "primary", filters: [] }],
  steps: [
    { kind: "action", id: "a", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
    { kind: "ifElse", id: "c", label: "Qualified?", branches: [
      { id: "yes", title: "Qualified", text: "", steps: [{ kind: "action", id: "mail", label: "Send Email", icon: "heroicons-solid:mail-open", tone: "green" }] },
      { id: "none", title: "None", text: "", steps: [] },
    ] },
  ],
};
const at = (id: string) => {
  const n = layoutMaps(wf).nodes.find((m) => m.id === id);
  assert.ok(n, id);
  return n;
};

test("cards stack 72 + 96 px apart from the trigger down, with no END node", () => {
  assert.deepEqual(["t", "a", "c"].map((id) => at(id).y), [0, 168, 336]);
  assert.equal(layoutMaps(wf).nodes.some((n) => n.id.endsWith("end")), false);
});

test("If/Else lanes are 240 × 80 cards 260 apart, their steps a layer below", () => {
  assert.equal(at("none").x - at("yes").x, 260);
  assert.equal(at("yes").h, 80);
  assert.equal(at("mail").y, 504 + 80 + 96);
  assert.equal(at("c").icon, "mdi:code-braces");
});

test("edges run from the handle under a card to the handle on the next card's top", () => {
  const e = layoutMaps(wf).edges.find((x) => x.from === "t" && x.to === "a");
  assert.ok(e);
  assert.deepEqual(e.end, { x: 120, y: 168 - 8.4 });
  assert.match(e.d, /^M120 84L120 159.6$/);
});

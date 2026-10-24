// Checks the Organise choreography against what the film shows (tracked positions). Run: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { carriedPlane, organiseNodes, organiseRig } from "./organise";

test("Course Access Removed is carried from 05 into 04 and stays there", () => {
  assert.deepEqual(organiseNodes(102.0)["course-access-removed"].x, -3.24);
  assert.deepEqual([organiseNodes(104)["course-access-removed"].x, organiseNodes(104)["course-access-removed"].z], [13.7, -2.11]);
  assert.deepEqual(organiseNodes(212), {});
});

test("08 ends nested 1.4 into 07, which has grown around it, in both Organise scenes", () => {
  for (const t of [110, 216]) {
    const rig = organiseRig(t);
    assert.equal(rig.tagroute.dz, 1.4);
    assert.equal(rig.tagroute.dx, 0);
    assert.equal(rig.segment.x0, -7.8);
    assert.equal(rig.onboard.color, "yellow");
  }
  assert.equal(organiseRig(104).tagroute.dz, 0);
  assert.equal(organiseRig(104).onboard.color, undefined);
});

test("08 counts as carried only while it is picked up", () => {
  assert.equal(carriedPlane(104.9), null);
  assert.equal(carriedPlane(105.4)?.plane, "tagroute");
  assert.equal(carriedPlane(213.5)?.plane, "tagroute");
  assert.equal(carriedPlane(220), null);
});

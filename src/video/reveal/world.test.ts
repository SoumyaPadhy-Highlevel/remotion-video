import {strict as assert} from "node:assert";
import {test} from "node:test";
import {MAP_ASSET_TYPES, MAP_WORKFLOW} from "../builder/mapTokens";
import {BUILDER_ICONS} from "../builder/icons";
import {FILM_WORLDS} from "../map3d/filmMap";
import {revealWorld} from "./world";

test("platform styling preserves captured folder bounds, workflow status and actual links", () => {
  const base = FILM_WORLDS.main, world = revealWorld(base);
  assert.equal(world.edges, base.edges);
  assert.equal(world.planes.length, base.planes.length);
  world.planes.forEach((p, i) => {
    assert.deepEqual([p.x0,p.z0,p.x1,p.z1,p.label], [base.planes[i].x0,base.planes[i].z0,base.planes[i].x1,base.planes[i].z1,base.planes[i].label]);
    assert.equal(p.color, null);
  });
  for (const n of base.nodes.filter((n) => n.kind === "workflow")) {
    const shown = world.nodes.find((w) => w.id === n.id)!;
    assert.deepEqual([shown.x,shown.z,shown.status], [n.x,n.z,n.status]);
    assert.equal(shown.color,MAP_WORKFLOW.color);
    assert.equal(shown.icon,"mdi:workflow");
  }
  assert.equal(world.nodes.filter((n) => n.kind === "workflow" && n.status === "draft").length,4);
});
test("field swatch and workflow glyph use the frontend's real palette and alias", () => {
  const field = revealWorld(FILM_WORLDS.main).nodes.find((n) => n.id === "teaser-custom-fields")!;
  assert.equal(field.color,MAP_ASSET_TYPES.contactCustomFields.color);
  assert.equal(field.color,"#20c5c7");
  assert.deepEqual(BUILDER_ICONS["mdi:workflow"],BUILDER_ICONS["mdi:sitemap"]);
  assert(!FILM_WORLDS.main.edges.some((e) => e.from===field.id || e.to===field.id));
});

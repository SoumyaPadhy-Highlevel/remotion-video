import {MAP_WORKFLOW} from "../builder/mapTokens";
import type {MapNode, MapScene} from "../map3d/MapScene";
import {categoryOf} from "./assets";
import {MAP_REVEAL as R} from "./script";

/** Use the platform's neutral folder treatment and actual asset-type colors.
 * Keep the captured positions, publication statuses and verified edges intact.
 * The extra field node illustrates a supported type and has no invented edge.
 */
export const revealWorld = (base: MapScene): MapScene => ({
  planes: base.planes.map((p) => ({...p, color: null})),
  nodes: [...base.nodes, {id: "teaser-custom-fields", kind: "asset", x: .9, z: 7.15, plane: "lead", color: "", icon: "mdi:code-braces", label: "Custom fields"} as MapNode].map((n) => {
    if (n.kind === "workflow") return {...n, color: MAP_WORKFLOW.color, icon: MAP_WORKFLOW.icon.name};
    const style = R.categories.find((c) => c.key === categoryOf(n))!;
    return {...n, color: style.color, icon: style.icon};
  }),
  edges: base.edges,
});

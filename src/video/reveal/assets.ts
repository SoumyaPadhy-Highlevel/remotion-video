import type {MapNode} from "../map3d/MapScene";
import {MAP_REVEAL as R} from "./script";
/** All account asset types must have a visible chip and a scheduled entrance.
 * Never assign unmapped assets an unsignalled last-frame fallback. */
export const categoryOf = (n: Pick<MapNode, "icon">) => {
  const category = R.categories.find((c) => c.icon === n.icon);
  if (!category) throw new Error(`Missing reveal category for ${n.icon}`);
  return category.key;
};

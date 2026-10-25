// The map the Assistant acts on (ASSISTANT cards, "It does the work"): the film's main map (filmMap.ts "main") plus what
// the asks need. The Growth Foundations course: five workflows that use the "Growth Foundations Access" membership offer,
// spread over four folders (two in 04 · Client Onboarding & Learning, as the reply says), and the folder they move into.
// World units on the spaced map (map3d/spacing.ts, which keeps a cell for each of the five in its folder); the new
// folder's bounds follow the product's rule (node centres + 1.0).
import { MapCamera, MapNode, MapPlane, MapScene, projectToCanvas } from "../map3d/MapScene";
import { MAP_WORLDS, SPACED } from "../map3d/spacing";

const WF = (id: string, label: string, plane: string): MapNode =>
  ({ id, kind: "workflow", ...SPACED.nodes[id], label, plane, color: "#2455d6", icon: "mdi:sitemap", status: "published" });

/** The offer they share (membershipOffers: sapphire-500 body, get-grid-asset-style.ts). */
export const OFFER = "a-growth-offer";
/** The five workflows, in the order they sit around the offer once moved. */
export const GROWTH = ["grant-course-access", "course-offer-activated", "course-offer-revoked", "revoke-course-access", "new-member-registration"];
export const GROWTH_FOLDER = "growth";

const added: MapNode[] = [
  WF("revoke-course-access", "Revoke Course Access", "retention"),
  WF("new-member-registration", "New Member Registration", "lead"),
  WF("course-offer-activated", "Course Offer Activated", "onboard"),
  WF("course-offer-revoked", "Course Offer Revoked", "tagroute"),
  { id: OFFER, kind: "asset", ...SPACED.nodes[OFFER], label: "Growth Foundations Access", plane: "onboard", color: "#087bea", icon: "mdi:ticket-percent" },
];

/** Where they land in the new folder, right of 02 · Consultation Booking as on the film: the offer in the middle, the
 * workflows on a ring around it (the product's layout puts a shared asset among the workflows that use it), wide enough
 * for their labels. */
const CONSULT = SPACED.planes.consult;
const CENTRE = { x: CONSULT.x1 + 6, z: CONSULT.z0 + 2.6 }, RING = 3.4;
export const MOVED: Record<string, { x: number; z: number }> = Object.fromEntries([
  [OFFER, CENTRE],
  ...GROWTH.map((id, i) => {
    const a = ((-90 + i * 72) * Math.PI) / 180;
    return [id, { x: +(CENTRE.x + RING * Math.cos(a)).toFixed(2), z: +(CENTRE.z + RING * Math.sin(a)).toFixed(2) }];
  }),
]);
const xs = Object.values(MOVED).map((p) => p.x), zs = Object.values(MOVED).map((p) => p.z);
export const FOLDER: MapPlane = { id: GROWTH_FOLDER, label: "growth foundations", color: null,
  x0: Math.min(...xs) - 1, z0: Math.min(...zs) - 1, x1: Math.max(...xs) + 1, z1: Math.max(...zs) + 1 };

const main = MAP_WORLDS.main;
export const ACT_WORLD: MapScene = {
  planes: [...main.planes, FOLDER],
  nodes: [...main.nodes, ...added],
  edges: [...main.edges, ...GROWTH.map((to) => ({ from: OFFER, to }))],
};

/** The camera that fits world points into a `w × h` canvas with `pad` (0–1) left around them, as the product's fit does. */
export const fitCamera = (pts: { x: number; z: number }[], w: number, h: number, pad = 0.1, y = 0.2): MapCamera => {
  const uv = pts.map((p) => projectToCanvas({ cx: 0, cy: 0, s: 1 }, p.x, y, p.z));
  const u0 = Math.min(...uv.map((p) => p[0])), u1 = Math.max(...uv.map((p) => p[0]));
  const v0 = Math.min(...uv.map((p) => p[1])), v1 = Math.max(...uv.map((p) => p[1]));
  const s = Math.min((w * (1 - 2 * pad)) / Math.max(u1 - u0, 1e-6), (h * (1 - 2 * pad)) / Math.max(v1 - v0, 1e-6));
  return { cx: w / 2 - s * (u0 + u1) / 2, cy: h / 2 - s * (v0 + v1) / 2, s };
};
/** A folder's four corners. */
export const corners = (p: { x0: number; z0: number; x1: number; z1: number }) =>
  [{ x: p.x0, z: p.z0 }, { x: p.x1, z: p.z0 }, { x: p.x0, z: p.z1 }, { x: p.x1, z: p.z1 }];

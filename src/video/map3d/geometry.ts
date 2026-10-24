// Workflow Maps' 3D shapes, ported line for line from automation-workflows-frontend
// (src/components/workflow-grid/libs/objects/GridBox.ts and cached-objects/GridPlaneGeometryCache.ts), so the video's map
// is built from the product's own geometry. Keep the constants in sync with those files.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const BOX_SIZE = 0.5;
const BOX_DEPTH = 0.2;
const CORNER_RADIUS = 0.08;
const KEYCAP_TAPER = 0.06;
export const ICON_SIZE = 0.3;
export const ICON_Y_GAP = 0.004;
const HEXAGON_SIDES = 6;
const POLYGON_RADIUS = BOX_SIZE * 0.6;
const NONAGON_SIDES = 9;
const NONAGON_CORNER_RADIUS = 0.04;
const NONAGON_ROTATION = -Math.PI / 2;
export const WORKFLOW_SCALE = 1.2;
const PLINTH_BASE_RADIUS = BOX_SIZE * 0.66 * WORKFLOW_SCALE;
const PLINTH_BASE_DEPTH = 0.05 * WORKFLOW_SCALE;
const PLINTH_BODY_RADIUS = BOX_SIZE * 0.56 * WORKFLOW_SCALE;
const PLINTH_BODY_DEPTH = 0.32 * WORKFLOW_SCALE;
const PLINTH_DEPTH = PLINTH_BASE_DEPTH + PLINTH_BODY_DEPTH;
const PLINTH_CORNER_RADIUS = NONAGON_CORNER_RADIUS * WORKFLOW_SCALE;
const PLINTH_STEP_OVERLAP = 0.004;
const DEFAULT_FOOTPRINT_RADIUS = 0.25;
const NODE_CURVE_SEGMENTS = 4;

export type NodeShape = "plinth" | "hexagon";
export const depthForShape = (shape: NodeShape) => (shape === "plinth" ? PLINTH_DEPTH : BOX_DEPTH);
export const footprintRadius = (shape: NodeShape) => (shape === "plinth" ? PLINTH_BASE_RADIUS : DEFAULT_FOOTPRINT_RADIUS);
export const iconSizeForShape = (shape: NodeShape) => (shape === "plinth" ? ICON_SIZE * WORKFLOW_SCALE : ICON_SIZE);
/** The hover lift: the same 0.12 world units for every shape (GridBox hoverHeightScaleForDepth). */
export const hoverHeightScale = (shape: NodeShape) => 1 + (BOX_DEPTH * (1.6 - 1)) / depthForShape(shape);

function applyKeycapTaper(geo: THREE.BufferGeometry, depth: number, taper: number): void {
  const pos = geo.getAttribute("position") as THREE.BufferAttribute;
  const scale = 1 - taper;
  for (let i = 0; i < pos.count; i++) {
    if (pos.getZ(i) >= depth - 0.001) {
      pos.setX(i, pos.getX(i) * scale);
      pos.setY(i, pos.getY(i) * scale);
    }
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

function roundedPolygonShape(sides: number, radius: number, cornerRadius: number, rotation: number): THREE.Shape {
  const shape = new THREE.Shape();
  const v: [number, number][] = [];
  for (let i = 0; i < sides; i++) {
    const a = (Math.PI * 2 * i) / sides + rotation;
    v.push([radius * Math.cos(a), radius * Math.sin(a)]);
  }
  for (let i = 0; i < sides; i++) {
    const [cx, cy] = v[i], [nx, ny] = v[(i + 1) % sides], [px, py] = v[(i + sides - 1) % sides];
    const toPrev = Math.hypot(px - cx, py - cy), toNext = Math.hypot(nx - cx, ny - cy);
    const inset = Math.min(cornerRadius, toPrev * 0.45, toNext * 0.45);
    const sx = cx + ((px - cx) / toPrev) * inset, sy = cy + ((py - cy) / toPrev) * inset;
    const ex = cx + ((nx - cx) / toNext) * inset, ey = cy + ((ny - cy) / toNext) * inset;
    if (i === 0) shape.moveTo(sx, sy);
    else shape.lineTo(sx, sy);
    shape.quadraticCurveTo(cx, cy, ex, ey);
  }
  shape.closePath();
  return shape;
}

function plinthSection(radius: number, bottomY: number, topY: number, taper: number): THREE.BufferGeometry {
  const height = topY - bottomY;
  const geo = new THREE.ExtrudeGeometry(roundedPolygonShape(NONAGON_SIDES, radius, PLINTH_CORNER_RADIUS, NONAGON_ROTATION), {
    depth: height, bevelEnabled: false, curveSegments: NODE_CURVE_SEGMENTS,
  });
  applyKeycapTaper(geo, height, taper);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, bottomY, 0);
  return geo;
}

/** Workflow plinth: group 0 is the base (publication colour), group 1 the body. Centred vertically on the origin. */
export function createPlinthGeometry(): THREE.BufferGeometry {
  const base = plinthSection(PLINTH_BASE_RADIUS, 0, PLINTH_BASE_DEPTH, 0);
  const body = plinthSection(PLINTH_BODY_RADIUS, PLINTH_BASE_DEPTH - PLINTH_STEP_OVERLAP, PLINTH_DEPTH, KEYCAP_TAPER);
  const merged = mergeGeometries([base, body], true);
  if (!merged) throw new Error("Failed to merge the workflow plinth geometry");
  merged.translate(0, -PLINTH_DEPTH / 2, 0);
  return merged;
}

/** Asset hexagon keycap, centred vertically on the origin. */
export function createHexagonGeometry(): THREE.BufferGeometry {
  const geo = new THREE.ExtrudeGeometry(roundedPolygonShape(HEXAGON_SIDES, POLYGON_RADIUS, CORNER_RADIUS, -Math.PI / 6), {
    depth: BOX_DEPTH, bevelEnabled: false, curveSegments: NODE_CURVE_SEGMENTS,
  });
  applyKeycapTaper(geo, BOX_DEPTH, KEYCAP_TAPER);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -BOX_DEPTH / 2, 0);
  return geo;
}

// ── folder planes (GridPlaneGeometryCache.ts) ──
export const PLANE_THICKNESS = 0.1;
const PLANE_CORNER_RADIUS = 0.3;
const PLANE_BORDER_WIDTH = 0.01;
const PLANE_CURVE_SEGMENTS = 3;

function drawRoundedRect(path: THREE.Path, hw: number, hd: number, r: number): void {
  path.moveTo(-hw + r, -hd);
  path.lineTo(hw - r, -hd);
  path.quadraticCurveTo(hw, -hd, hw, -hd + r);
  path.lineTo(hw, hd - r);
  path.quadraticCurveTo(hw, hd, hw - r, hd);
  path.lineTo(-hw + r, hd);
  path.quadraticCurveTo(-hw, hd, -hw, hd - r);
  path.lineTo(-hw, -hd + r);
  path.quadraticCurveTo(-hw, -hd, -hw + r, -hd);
}

/** The slab, spanning y 0 → 0.1 before it is placed (top face at y = 0 once moved down by its thickness). */
export function createPlaneSlab(width: number, depth: number): THREE.BufferGeometry {
  const hw = width / 2, hd = depth / 2, r = Math.min(PLANE_CORNER_RADIUS, hw, hd);
  const shape = new THREE.Shape();
  drawRoundedRect(shape, hw, hd, r);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: PLANE_THICKNESS, bevelEnabled: false, curveSegments: PLANE_CURVE_SEGMENTS });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** The 0.01-wide border ring on the slab's top face. */
export function createPlaneBorder(width: number, depth: number): THREE.BufferGeometry {
  const hw = width / 2, hd = depth / 2, r = Math.min(PLANE_CORNER_RADIUS, hw, hd);
  const outer = new THREE.Shape();
  drawRoundedRect(outer, hw, hd, r);
  const hole = new THREE.Path();
  drawRoundedRect(hole, hw - PLANE_BORDER_WIDTH, hd - PLANE_BORDER_WIDTH, Math.max(0, r - PLANE_BORDER_WIDTH));
  outer.holes.push(hole);
  const geo = new THREE.ShapeGeometry(outer, PLANE_CURVE_SEGMENTS);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

// Workflow Maps' 3D map, rendered the way the product renders it (automation-workflows-frontend
// src/components/workflow-grid/libs: SceneManager, GridBox, GridPlane, EdgeRenderer, SceneGrid, GridLabelRenderer):
// orthographic camera along (7, 9, 8), image-based lighting from env-map-3.hdr, self-lit nodes, unlit slabs and ribbons,
// screen-facing label pills. A pure function of its props, so Remotion can render any frame on its own.
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { continueRender, delayRender, staticFile } from "remotion";
import { BUILDER_ICONS } from "../builder/icons";
import { MAP_EDGE, MAP_LABEL, MAP_PLANE, MAP_WORKFLOW } from "../builder/mapTokens";
import {
  createHexagonGeometry, createPlaneBorder, createPlaneSlab, createPlinthGeometry, depthForShape, footprintRadius,
  hoverHeightScale, ICON_Y_GAP, iconSizeForShape, NodeShape, PLANE_THICKNESS,
} from "./geometry";

// ── scene description ──
export type MapPlane = { id: string; x0: number; z0: number; x1: number; z1: number; color?: string | null; depth?: number; label?: string;
  /** 0–1 selected lift (0.15 world units at 1) */ lift?: number; opacity?: number; dropTarget?: number;
  /** a drag: the folder and everything in it moved by (dx, dz) */ dx?: number; dz?: number };
export type MapNode = { id: string; kind: "workflow" | "asset"; x: number; z: number; color: string; icon: string; label?: string | null;
  status?: "published" | "draft"; plane?: string };
export type MapEdge = { from: string; to: string; kind?: "causal" | "reference" };
export type MapScene = { planes: MapPlane[]; nodes: MapNode[]; edges: MapEdge[] };
/** Per-node look at this frame: `dim` 0–1 greys it out (GridBox dim transition), `selected` 0–1, `hover` 0–1 (lift and
 * glow), `opacity` multiplies everything, `hidden` drops it, `label` 0–1 label opacity, `x`/`z`/`lift` override position. */
export type NodeLook = { dim?: number; selected?: number; hover?: number; flatten?: number; opacity?: number; hidden?: boolean; label?: number;
  x?: number; z?: number; lift?: number };
export type EdgeLook = { lit?: number; dim?: number; hidden?: boolean; selected?: number };
/** World origin at canvas px (cx, cy), `s` canvas px per world unit (the product's zoom is s / (canvas height / 10)). */
export type MapCamera = { cx: number; cy: number; s: number };

const DIRECTION = new THREE.Vector3(7, 9, 8).normalize();
const DISTANCE = Math.sqrt(7 * 7 + 9 * 9 + 8 * 8);
const EDGE_Y = 0.066;

// ── shared assets: the environment map and icon textures load once per page ──
let hdrPromise: Promise<THREE.DataTexture> | null = null;
const loadHdr = () => (hdrPromise ??= new RGBELoader().loadAsync(staticFile("env-map-3.hdr")) as Promise<THREE.DataTexture>);
const iconPromises = new Map<string, Promise<THREE.Texture>>();
/** Rasterises an icon white into a 128 px cell, as the product's IconAtlas does. */
const loadIcon = (name: string) => {
  let p = iconPromises.get(name);
  if (!p) {
    p = new Promise<THREE.Texture>((resolve, reject) => {
      const icon = BUILDER_ICONS[name];
      if (!icon) return reject(new Error(`Map icon "${name}" is missing: add it to scripts/builder-icons.mjs`));
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 ${icon.w} ${icon.h}" color="white" fill="white">${icon.body.replace(/currentColor/g, "white")}</svg>`;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        c.getContext("2d")!.drawImage(img, 0, 0, 128, 128);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      };
      img.onerror = () => reject(new Error(`Map icon "${name}" failed to rasterise`));
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    });
    iconPromises.set(name, p);
  }
  return p;
};

let plinthGeo: THREE.BufferGeometry | null = null, hexGeo: THREE.BufferGeometry | null = null;
const shapeGeometry = (shape: NodeShape) => (shape === "plinth" ? (plinthGeo ??= createPlinthGeometry()) : (hexGeo ??= createHexagonGeometry()));

let glowTexture: THREE.DataTexture | null = null;
/** The radial (1 − d)² sprite the selected glow uses (GridBox acquireRadialGlowTexture). */
const radialGlow = () => {
  if (glowTexture) return glowTexture;
  const N = 64, data = new Uint8Array(N * N * 4);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const d = Math.hypot((x / (N - 1)) * 2 - 1, (y / (N - 1)) * 2 - 1), o = (y * N + x) * 4;
    data[o] = data[o + 1] = data[o + 2] = 255;
    data[o + 3] = Math.round(Math.pow(Math.max(0, 1 - d), 2) * 255);
  }
  glowTexture = new THREE.DataTexture(data, N, N, THREE.RGBAFormat);
  glowTexture.needsUpdate = true;
  return glowTexture;
};

type NodeObjects = { group: THREE.Group; mesh: THREE.Mesh; mats: THREE.MeshStandardMaterial[]; rest: THREE.Color[]; icon: THREE.Mesh | null;
  iconMat: THREE.MeshBasicMaterial | null; halo: THREE.Mesh; haloMat: THREE.MeshBasicMaterial; glow: THREE.Sprite; glowMat: THREE.SpriteMaterial; shape: NodeShape };
type PlaneObjects = { slab: THREE.Mesh; border: THREE.Mesh; face: THREE.MeshBasicMaterial; side: THREE.MeshBasicMaterial; borderMat: THREE.MeshBasicMaterial; restFace: THREE.Color; restBorder: THREE.Color; y: number; w: number; d: number };
type EdgeObjects = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; pulse: THREE.Mesh; pulseMat: THREE.MeshBasicMaterial };

const GRAY_400 = new THREE.Color(MAP_WORKFLOW.ghost.color);
const tmpColor = new THREE.Color();

/** Builds the three.js objects for a scene once; per-frame looks only touch transforms and materials. */
function buildScene(desc: MapScene, icons: Map<string, THREE.Texture>) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#ffffff");
  // the ground grid (SceneGrid.ts): 1-unit cells, gray-200, 0.15 below the slabs
  const grid = new THREE.GridHelper(500, 500);
  grid.material = new THREE.LineBasicMaterial({ color: "#e5e7eb" });
  grid.position.y = -0.15;
  scene.add(grid);

  const planes = new Map<string, PlaneObjects>();
  for (const p of desc.planes) {
    const w = p.x1 - p.x0, d = p.z1 - p.z0;
    const shades = p.color ? MAP_PLANE.palette[p.color] : null;
    const depthTint = new THREE.Color(MAP_PLANE.default.face).lerp(new THREE.Color("#e5e7eb"), Math.min((p.depth ?? 0) * 0.18, 0.72));
    const restFace = shades ? new THREE.Color(shades[0]) : depthTint;
    const edge = shades ? shades[1] : MAP_PLANE.default.side;
    const face = new THREE.MeshBasicMaterial({ color: restFace.clone(), transparent: true });
    const side = new THREE.MeshBasicMaterial({ color: edge, transparent: true });
    const borderMat = new THREE.MeshBasicMaterial({ color: shades ? shades[1] : MAP_PLANE.default.border, transparent: true });
    const y = (p.depth ?? 0) * 0.006;
    const slab = new THREE.Mesh(createPlaneSlab(w, d), [face, side]);
    slab.position.set((p.x0 + p.x1) / 2, -PLANE_THICKNESS + y, (p.z0 + p.z1) / 2);
    const border = new THREE.Mesh(createPlaneBorder(w, d), borderMat);
    border.position.set((p.x0 + p.x1) / 2, 0.001 + y, (p.z0 + p.z1) / 2);
    // folders draw first: everything on them (edges, nodes) is transparent and would otherwise sort by its mesh origin
    slab.renderOrder = -2;
    border.renderOrder = -1;
    scene.add(slab, border);
    planes.set(p.id, { slab, border, face, side, borderMat, restFace, restBorder: borderMat.color.clone(), y, w, d });
  }

  const nodes = new Map<string, NodeObjects>();
  for (const n of desc.nodes) {
    const shape: NodeShape = n.kind === "workflow" ? "plinth" : "hexagon";
    const geo = shapeGeometry(shape);
    const rest = shape === "plinth"
      ? [new THREE.Color(n.status === "draft" ? MAP_WORKFLOW.baseRing.draft : MAP_WORKFLOW.baseRing.published), new THREE.Color(n.color)]
      : [new THREE.Color(n.color)];
    const mats = rest.map((c) => new THREE.MeshStandardMaterial({ color: c.clone(), emissive: c.clone(), emissiveIntensity: MAP_WORKFLOW.material.emissive.rest,
      metalness: 0, roughness: MAP_WORKFLOW.material.roughness, transparent: true }));
    const mesh = new THREE.Mesh(geo, shape === "plinth" ? mats : mats[0]);
    const group = new THREE.Group();
    const visual = new THREE.Group();
    group.add(visual);
    visual.add(mesh);
    let icon: THREE.Mesh | null = null, iconMat: THREE.MeshBasicMaterial | null = null;
    const tex = icons.get(n.icon);
    if (tex) {
      iconMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const size = iconSizeForShape(shape);
      icon = new THREE.Mesh(new THREE.PlaneGeometry(size, size), iconMat);
      icon.rotation.x = -Math.PI / 2;
      icon.rotation.z = Math.PI / 2;
      icon.position.y = depthForShape(shape) / 2 + ICON_Y_GAP;
      visual.add(icon);
    }
    const haloMat = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, color: n.color, depthWrite: false, opacity: 0.16, side: THREE.BackSide, toneMapped: false, transparent: true });
    const halo = new THREE.Mesh(geo, haloMat);
    halo.scale.set(1.52, 1.45, 1.52);
    halo.position.y = depthForShape(shape) * 0.25;
    const glowMat = new THREE.SpriteMaterial({ blending: THREE.AdditiveBlending, color: n.color, depthWrite: false, map: radialGlow(), opacity: 0.4, toneMapped: false, transparent: true });
    const glow = new THREE.Sprite(glowMat);
    glow.renderOrder = 2;
    glow.scale.setScalar(1.65);
    visual.add(halo, glow);
    scene.add(group);
    nodes.set(n.id, { group, mesh, mats, rest, icon, iconMat, halo, haloMat, glow, glowMat, shape });
  }

  const edges = new Map<string, EdgeObjects>();
  for (const e of desc.edges) {
    const mat = new THREE.MeshBasicMaterial({ color: e.kind === "reference" ? MAP_EDGE.reference.color : MAP_EDGE.causal.color, side: THREE.DoubleSide, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    const pulseMat = new THREE.MeshBasicMaterial({ color: MAP_EDGE.pulse.color, side: THREE.DoubleSide, transparent: true, depthWrite: false });
    const pulse = new THREE.Mesh(new THREE.BufferGeometry(), pulseMat);
    mesh.renderOrder = 1;
    pulse.renderOrder = 1;
    scene.add(mesh, pulse);
    edges.set(`${e.from}>${e.to}`, { mesh, mat, pulse, pulseMat });
  }
  return { scene, planes, nodes, edges };
}

/** Ribbon geometry for an edge: line quad, source dot and target arrowhead, flat at y (EdgeRenderer.ts). */
function edgeGeometry(ax: number, az: number, bx: number, bz: number, ra: number, rb: number, hw: number, y: number, kind: "causal" | "reference") {
  const dx = bx - ax, dz = bz - az, len = Math.hypot(dx, dz) || 1, ux = dx / len, uz = dz / len, px = -uz, pz = ux;
  const sx = ax + ux * (ra + 0.1), sz = az + uz * (ra + 0.1), tx = bx - ux * (rb + 0.1), tz = bz - uz * (rb + 0.1);
  const pos: number[] = [];
  const quad = (x0: number, z0: number, x1: number, z1: number, w: number) => {
    const a = [x0 + px * w, z0 + pz * w], b = [x0 - px * w, z0 - pz * w], c = [x1 + px * w, z1 + pz * w], d = [x1 - px * w, z1 - pz * w];
    pos.push(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1], b[0], y, b[1], d[0], y, d[1], c[0], y, c[1]);
  };
  const lineEnd = Math.max(0, Math.hypot(tx - sx, tz - sz) - 0.2 + 0.018);
  if (kind === "reference") {
    for (let d = 0; d < lineEnd; d += 0.26) quad(sx + ux * d, sz + uz * d, sx + ux * Math.min(d + 0.16, lineEnd), sz + uz * Math.min(d + 0.16, lineEnd), hw);
  } else {
    quad(sx, sz, sx + ux * lineEnd, sz + uz * lineEnd, hw);
    // source dot (radius 0.045, 16 segments)
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2;
      pos.push(sx, y + 0.001, sz, sx + Math.cos(a0) * 0.045, y + 0.001, sz + Math.sin(a0) * 0.045, sx + Math.cos(a1) * 0.045, y + 0.001, sz + Math.sin(a1) * 0.045);
    }
  }
  // target arrowhead: 0.2 long, 0.09 half-width
  const bxA = tx - ux * 0.2, bzA = tz - uz * 0.2;
  pos.push(tx, y + 0.001, tz, bxA + px * 0.09, y + 0.001, bzA + pz * 0.09, bxA - px * 0.09, y + 0.001, bzA - pz * 0.09);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return { geometry: g, start: [sx, sz], end: [tx, tz], dir: [ux, uz], perp: [px, pz] };
}

export const projectToCanvas = (cam: MapCamera, x: number, y: number, z: number) => {
  // the camera basis for direction (7, 9, 8) with +Y up
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), DIRECTION).normalize();
  const up = new THREE.Vector3().crossVectors(DIRECTION, right).normalize();
  const p = new THREE.Vector3(x, y, z);
  return [cam.cx + cam.s * p.dot(right), cam.cy - cam.s * p.dot(up)] as const;
};

const Pill: React.FC<{ x: number; y: number; text: string; scale: number; opacity: number; node: boolean; icon?: string; selected?: boolean }> = ({ x, y, text, scale, opacity, node, icon, selected }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, ${node ? 0 : -50}%)`, opacity, pointerEvents: "none" }}>
    <div style={{ transform: `${node ? "translateY(6px) " : ""}scale(${scale})`, transformOrigin: node ? "top center" : "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, boxSizing: "border-box", padding: "4px 8px", borderRadius: 999, background: MAP_LABEL.pill.bg,
        border: `1px solid ${selected ? MAP_LABEL.selected.border : MAP_LABEL.pill.border}`, boxShadow: selected ? `0 0 0 2px ${MAP_LABEL.selected.ring}, ${MAP_LABEL.pill.shadow}` : MAP_LABEL.pill.shadow,
        fontFamily: "Inter, system-ui, sans-serif", whiteSpace: "nowrap" }}>
        {icon ? <svg width={16} height={16} viewBox={`0 0 ${BUILDER_ICONS[icon].w} ${BUILDER_ICONS[icon].h}`} style={{ color: MAP_LABEL.folderIcon.color, flex: "none" }} dangerouslySetInnerHTML={{ __html: BUILDER_ICONS[icon].body }} /> : null}
        <span style={{ display: "block", maxWidth: MAP_LABEL.text.maxWidth, overflow: "hidden", textOverflow: "ellipsis", fontSize: 12, lineHeight: "16px", fontWeight: 600,
          color: selected ? MAP_LABEL.selected.text : MAP_LABEL.text.color }}>{text}</span>
      </div>
    </div>
  </div>
);

/** The map at `width × height` canvas px. `looks` / `edgeLooks` / `planeLooks` give this frame's states; `t` drives pulses.
 * `zoomH` is the product's canvas height in px that `camera.s` is measured against (zoom = s / (zoomH / 10)), for label
 * scale and the zoom-gated label visibility. */
export const MapView: React.FC<{
  scene: MapScene; width: number; height: number; camera: MapCamera; t?: number; zoomH?: number;
  looks?: Record<string, NodeLook>; edgeLooks?: Record<string, EdgeLook>; planeLooks?: Record<string, Partial<MapPlane>>; labels?: boolean; pixelRatio?: number;
}> = ({ scene: desc, width, height, camera: cam, t = 0, zoomH = 792, looks = {}, edgeLooks = {}, planeLooks = {}, labels = true, pixelRatio = 2 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState<{ icons: Map<string, THREE.Texture>; hdr: THREE.DataTexture } | null>(null);
  const [handle] = useState(() => delayRender("Loading the map's environment and icons"));
  const continued = useRef(false);
  const release = () => { if (!continued.current) { continued.current = true; continueRender(handle); } };

  useLayoutEffect(() => {
    const names = [...new Set(desc.nodes.map((n) => n.icon))];
    Promise.all([loadHdr(), ...names.map(loadIcon)])
      .then(([hdr, ...texs]) => setReady({ hdr: hdr as THREE.DataTexture, icons: new Map(names.map((n, i) => [n, texs[i] as THREE.Texture])) }))
      .catch((err) => { console.error(err); release(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `release` only guards the one-shot handle
  }, [desc, handle]);

  const renderer = useMemo(() => {
    if (!ready) return null;
    const canvas = document.createElement("canvas");
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    r.setPixelRatio(pixelRatio);
    r.toneMapping = THREE.NoToneMapping;
    const pmrem = new THREE.PMREMGenerator(r);
    const env = pmrem.fromEquirectangular(ready.hdr).texture;
    pmrem.dispose();
    return { r, env };
  }, [ready, pixelRatio]);

  const built = useMemo(() => {
    if (!ready || !renderer) return null;
    const b = buildScene(desc, ready.icons);
    b.scene.environment = renderer.env;
    b.scene.environmentRotation.y = Math.PI / 2;
    return b;
  }, [desc, ready, renderer]);

  // world → canvas for this frame
  const zoom = cam.s / (zoomH / 10);
  const project = (x: number, y: number, z: number) => projectToCanvas(cam, x, y, z);

  useLayoutEffect(() => {
    if (!built || !renderer) return;
    const { r } = renderer;
    r.setSize(width, height, false);
    const camera = new THREE.OrthographicCamera(-cam.cx / cam.s, (width - cam.cx) / cam.s, cam.cy / cam.s, -(height - cam.cy) / cam.s, -500, 1000);
    camera.position.copy(DIRECTION).multiplyScalar(DISTANCE);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();

    for (const p of desc.planes) {
      const o = built.planes.get(p.id)!, pl = { ...p, ...planeLooks[p.id] };
      const lift = (pl.lift ?? 0) * MAP_PLANE.selectedLift, op = pl.opacity ?? 1, drop = pl.dropTarget ?? 0;
      if (pl.color !== p.color) {
        // a recoloured folder (the colour picker): hue-50 face, hue-500 sides and border
        const shades = pl.color ? MAP_PLANE.palette[pl.color] : null;
        o.restFace.set(shades ? shades[0] : MAP_PLANE.default.face);
        o.side.color.set(shades ? shades[1] : MAP_PLANE.default.side);
        o.restBorder.set(shades ? shades[1] : MAP_PLANE.default.border);
      }
      const y = (pl.depth ?? 0) * 0.006, w = pl.x1 - pl.x0, d = pl.z1 - pl.z0;
      const cx = (pl.x0 + pl.x1) / 2 + (pl.dx ?? 0), cz = (pl.z0 + pl.z1) / 2 + (pl.dz ?? 0);
      // a resized folder stretches its slab (the product rebuilds it; the corners differ only while it grows)
      o.slab.scale.set(w / o.w, 1, d / o.d);
      o.border.scale.set(w / o.w, 1, d / o.d);
      o.slab.position.set(cx, -PLANE_THICKNESS + y + lift, cz);
      o.border.position.set(cx, 0.001 + y + lift, cz);
      o.face.color.copy(o.restFace).lerp(tmpColor.set("#dbeafe"), drop);
      o.borderMat.color.copy(o.restBorder).lerp(tmpColor.set("#3b82f6"), drop);
      o.face.opacity = o.side.opacity = o.borderMat.opacity = op;
      o.slab.visible = o.border.visible = op > 0.001;
    }
    const planeOf = (id?: string) => (id ? { ...desc.planes.find((p) => p.id === id), ...planeLooks[id] } : null);
    const planeLift = (id?: string) => ((planeOf(id)?.lift ?? 0) * MAP_PLANE.selectedLift) + (planeOf(id)?.depth ?? 0) * 0.006;

    const nodePos = new Map<string, { x: number; z: number; r: number; visible: boolean }>();
    for (const n of desc.nodes) {
      const o = built.nodes.get(n.id)!, l = looks[n.id] ?? {};
      const dim = l.dim ?? 0, sel = l.selected ?? 0, hov = l.hover ?? 0, flat = l.flatten ?? 0, op = (l.opacity ?? 1) * (1 - 0.7 * dim);
      const visible = !l.hidden && op > 0.001;
      o.group.visible = visible;
      const h = 1 + (hoverHeightScale(o.shape) - 1) * Math.max(hov, sel) + (0.45 - 1) * flat;
      const s = 1 + 0.3 * hov + 0.05 * sel * (1 - hov) + (0.7 - 1) * flat;
      const pl = planeOf(n.plane);
      const x = (l.x ?? n.x) + (pl?.dx ?? 0), z = (l.z ?? n.z) + (pl?.dz ?? 0), depth = depthForShape(o.shape);
      o.group.position.set(x, (depth * h) / 2 + planeLift(n.plane) + (l.lift ?? 0), z);
      o.group.scale.set(s, h, s);
      const emissive = MAP_WORKFLOW.material.emissive;
      const ei = (emissive.rest + (emissive.selected - emissive.rest) * sel + emissive.hoverAdd * hov) * (1 - dim) + emissive.dimmed * dim;
      o.mats.forEach((m, i) => {
        m.color.copy(o.rest[i]).lerp(GRAY_400, dim);
        m.emissive.copy(m.color);
        m.emissiveIntensity = ei;
        m.opacity = op;
      });
      if (o.iconMat) o.iconMat.opacity = op;
      o.halo.visible = o.glow.visible = sel > 0.001 && visible;
      o.haloMat.opacity = 0.16 * sel * op;
      o.glowMat.opacity = 0.4 * sel * op;
      nodePos.set(n.id, { x, z, r: footprintRadius(o.shape) * s, visible });
    }

    for (const e of desc.edges) {
      const o = built.edges.get(`${e.from}>${e.to}`)!, l = edgeLooks[`${e.from}>${e.to}`] ?? {};
      const a = nodePos.get(e.from), b = nodePos.get(e.to);
      const visible = !!a && !!b && a.visible && b.visible && !l.hidden;
      o.mesh.visible = visible;
      o.pulse.visible = false;
      if (!visible) continue;
      const kind = e.kind ?? "causal", lit = l.lit ?? 0, selected = l.selected ?? 0;
      const hw = kind === "reference" ? 0.012 : 0.018 + (0.03 - 0.018) * Math.max(lit * 0, selected);
      const geo = edgeGeometry(a!.x, a!.z, b!.x, b!.z, a!.r, b!.r, hw, EDGE_Y, kind);
      o.mesh.geometry.dispose();
      o.mesh.geometry = geo.geometry;
      const base = kind === "reference" ? MAP_EDGE.reference.color : MAP_EDGE.causal.color;
      o.mat.color.set(base).lerp(tmpColor.set(MAP_EDGE.pulse.line), lit).lerp(tmpColor.set(MAP_EDGE.selected.color), selected);
      o.mat.opacity = (kind === "reference" ? 0.75 : 1) * (1 - (1 - 0.18) * (l.dim ?? 0));
      if (lit > 0.01) {
        // one blue-500 triangle travelling 0.35 of the edge per second
        const len = Math.hypot(geo.end[0] - geo.start[0], geo.end[1] - geo.start[1]);
        const k = (t * 0.35) % 1, cx = geo.start[0] + (geo.end[0] - geo.start[0]) * k, cz = geo.start[1] + (geo.end[1] - geo.start[1]) * k;
        const [ux, uz] = geo.dir, [px, pz] = geo.perp, L = Math.min(0.2, len), W = 0.1, y = EDGE_Y + 0.005;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([cx + ux * L / 2, y, cz + uz * L / 2, cx - ux * L / 2 + px * W, y, cz - uz * L / 2 + pz * W, cx - ux * L / 2 - px * W, y, cz - uz * L / 2 - pz * W], 3));
        o.pulse.geometry.dispose();
        o.pulse.geometry = g;
        o.pulseMat.opacity = lit;
        o.pulse.visible = true;
      }
    }

    r.render(built.scene, camera);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(r.domElement, 0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    release();
  });

  const nodeScale = Math.max(0.65, Math.min(Math.sqrt(zoom), 1)), planeScale = Math.max(0.75, Math.min(Math.sqrt(zoom), 1));
  return (
    <div style={{ position: "relative", width, height, overflow: "hidden", background: "#ffffff" }}>
      <canvas ref={canvasRef} width={width * pixelRatio} height={height * pixelRatio} style={{ position: "absolute", inset: 0, width, height }} />
      {labels && zoom >= 0.18 ? desc.planes.map((p) => {
        const pl = { ...p, ...planeLooks[p.id] };
        if (!pl.label || (pl.opacity ?? 1) <= 0.01) return null;
        const [x, y] = project(pl.x1 + (pl.dx ?? 0), (pl.lift ?? 0) * MAP_PLANE.selectedLift, pl.z1 + 0.4 + (pl.dz ?? 0));
        return <Pill key={p.id} x={x} y={y} text={pl.label} scale={planeScale} opacity={pl.opacity ?? 1} node={false} icon="mdi:folder" />;
      }) : null}
      {labels ? desc.nodes.map((n) => {
        const l = looks[n.id] ?? {};
        const op = (l.label ?? (zoom >= 0.5 ? 1 : 0)) * (1 - (l.dim ?? 0)) * (l.opacity ?? 1);
        if (!n.label || l.hidden || op <= 0.01) return null;
        const pl = n.plane ? { ...desc.planes.find((p) => p.id === n.plane), ...planeLooks[n.plane] } : null;
        const [x, y] = project((l.x ?? n.x) + (pl?.dx ?? 0), -footprintRadius(n.kind === "workflow" ? "plinth" : "hexagon"), (l.z ?? n.z) + (pl?.dz ?? 0));
        return <Pill key={n.id} x={x} y={y} text={n.label} scale={nodeScale} opacity={op} node selected={(l.selected ?? 0) > 0.5} />;
      }) : null}
    </div>
  );
};

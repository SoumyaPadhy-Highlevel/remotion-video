// Workflow Maps' 3D map, as the product draws it (automation-workflows-frontend src/components/workflow-grid: SceneManager.ts,
// GridBox.ts, GridPlane.ts, EdgeRenderer.ts, get-grid-asset-style.ts). World units; colours sRGB hex. The film's map is
// pre-rendered, so these are the values it must be re-rendered with (docs/map-tokens/README.md); anything this repo draws
// of the map (Build.tsx, StructureMap.tsx) reads them from here.

export const MAP_SCENE = {
  background: "#ffffff",
  /** orthographic, 10 world units tall at zoom 1; camera direction (7, 9, 8) from the target ≈ 40.3° elevation, 41.2° yaw */
  camera: { frustum: 10, direction: [7, 9, 8] as const, zoom: [0.05, 4] as const },
  /** 1-unit cells, 1 px gray-200 lines, at y = −0.15, no fade */
  grid: { color: "#e5e7eb", cell: 1, y: -0.15 },
  /** no lights: image-based lighting from public/env-map-3.hdr (rotated π/2), no tone mapping, no shadows, no post */
  envMap: "/env-map-3.hdr",
};

/** Workflow node: a stepped nonagon plinth (base + tapered body), one vertex toward the viewer. */
export const MAP_WORKFLOW = {
  base: { radius: 0.396, height: 0.06 }, body: { radius: 0.336, height: 0.384, taper: 0.06 }, cornerRadius: 0.048,
  color: "#2455d6", baseRing: { published: "#22c55e", draft: "#9ca3af" },
  /** MeshStandard, metalness 0, roughness 0.45, emissive = own colour × intensity */
  material: { roughness: 0.45, metalness: 0, emissive: { rest: 0.35, selected: 1.1, dimmed: 0.12, hoverAdd: 0.14 } },
  icon: { name: "mdi:sitemap", color: "#ffffff", size: 0.36 },
  /** selected: lifted 0.12, XZ ×1.05, additive halo shell (×1.52 XZ, ×1.45 Y, opacity 0.16) and glow sprite (×1.65, 0.4) */
  selected: { lift: 0.12, xz: 1.05, halo: { xz: 1.52, y: 1.45, opacity: 0.16 }, glow: { scale: 1.65, opacity: 0.4 } },
  /** dimmed ("ghost"): colour → gray-400, opacity 0.3, emissive 0.12, over a 0.45 s spring; label hidden */
  ghost: { color: "#9ca3af", opacity: 0.3 },
};

/** Asset node: a rounded hexagon prism, ~76 % of a workflow's radius; body hue-500, white icon, link badge hue-800. */
export const MAP_ASSET = { radius: 0.3, height: 0.2, cornerRadius: 0.08, taper: 0.06, iconSize: 0.3 };
export const MAP_ASSET_TYPES: Record<string, { color: string; badge: string; icon: string }> = {
  tags: { color: "#a855f7", badge: "#6b21a8", icon: "heroicons-solid:tag" },
  forms: { color: "#14b8a6", badge: "#115e59", icon: "mdi:form-select" },
  calendars: { color: "#0ea5e9", badge: "#075985", icon: "heroicons-solid:calendar" },
  surveys: { color: "#eab308", badge: "#854d0e", icon: "mdi:clipboard-list" },
  pipelines: { color: "#f59e0b", badge: "#92400e", icon: "mdi:view-column" },
  funnels: { color: "#f97316", badge: "#9a3412", icon: "mdi:filter" },
  funnelPages: { color: "#f45d48", badge: "#9b2b20", icon: "mdi:file-document-multiple" },
  funnelProducts: { color: "#e9a40b", badge: "#84460f", icon: "mdi:package-variant-closed" },
  globalProducts: { color: "#10b981", badge: "#065f46", icon: "mdi:package-variant" },
  users: { color: "#84cc16", badge: "#3f6212", icon: "heroicons-solid:users" },
  videos: { color: "#ef4444", badge: "#991b1b", icon: "mdi:play-circle" },
  templates: { color: "#8b5cf6", badge: "#5b21b6", icon: "mdi:file-document-edit" },
  customValues: { color: "#3ddc97", badge: "#177650", icon: "mdi:code-braces" },
};

/** Folder plane: extruded rounded rectangle, 0.1 thick, 0.3 corners, unlit. Default: white face, blue-500 sides, gray-300
 * 0.01 border; a user-picked colour gives a hue-50 face with hue-500 sides and border. Nested planes tint the face toward
 * gray-200 by 0.18 per level (default colour only). */
export const MAP_PLANE = {
  thickness: 0.1, cornerRadius: 0.3, border: 0.01, padding: 1, gap: 1.5,
  default: { face: "#ffffff", side: "#3b82f6", border: "#d1d5db" },
  palette: {
    yellow: ["#fefce8", "#eab308"], blue: ["#eff6ff", "#3b82f6"], green: ["#f0fdf4", "#22c55e"], orange: ["#fff7ed", "#f97316"],
    cyan: ["#ecfeff", "#06b6d4"], gray: ["#f9fafb", "#6b7280"], teal: ["#f0fdfa", "#14b8a6"], purple: ["#faf5ff", "#a855f7"],
    fuchsia: ["#fdf4ff", "#d946ef"], rose: ["#fff1f2", "#f43f5e"],
  } as Record<string, [string, string]>,
  selectedLift: 0.15,
};

/** Edges: flat ribbons on the ground (y 0.066), straight, unlit. */
export const MAP_EDGE = {
  causal: { color: "#d1d5db", width: 0.036 },
  reference: { color: "#e5e7eb", width: 0.024, opacity: 0.75, dash: [0.16, 0.1] as const },
  hover: { color: "#bfdbfe", width: 0.06 }, selected: { color: "#3b82f6", width: 0.06 }, dimmedOpacity: 0.18,
  arrow: { length: 0.2, halfWidth: 0.09 }, sourceDot: 0.045,
  /** a lit route turns blue-200 with one blue-500 triangle pulse travelling 0.35 of the edge per second */
  pulse: { line: "#bfdbfe", color: "#3b82f6", speed: 0.35, length: 0.2, halfWidth: 0.1 },
};

/** Name and folder labels: DOM pills that face the screen. */
export const MAP_LABEL = {
  pill: { radius: 999, border: "#e5e7eb", bg: "#ffffff", padX: 8, padY: 4, minHeight: 32, shadow: "0 1px 2px rgba(0,0,0,.05)" },
  text: { size: 12, weight: 600, line: 16, color: "#1f2937", maxWidth: 148 },
  folderIcon: { name: "mdi:folder", size: 16, color: "#6b7280" },
  selected: { border: "#84ADFF", text: "#004EEB", ring: "#D1E0FF" },
};

/** Error marker on a workflow (red) or a missing asset (yellow): a 48 px white diamond with a coloured inner tile. */
export const MAP_MARKER = {
  error: { ring: "#fee2e2", tile: "#ef4444" }, missing: { ring: "#fef9c3", tile: "#eab308" }, size: 48, tile: 36, icon: "mdi:alert-circle",
};

/** Sticky notes: screen-facing paper, hue-100 background, hue-200 border, hue-400 leader line; default yellow. */
export const MAP_NOTE = { bg: "#fef9c3", border: "#fef08a", line: "#facc15", radius: 6, borderWidth: 2, padding: 16, text: 16, header: "#4b5563" };

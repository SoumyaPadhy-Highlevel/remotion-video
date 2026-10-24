// Copies the workflow builder's own icons out of the frontend repo into src/video/builder/icons.ts, so the video draws the
// exact glyphs the builder draws. Iconify names (`prefix:name`) come from @iconify/json; `ghl:Name` from
// @gohighlevel/ghl-icons/24/outline (the builder's Untitled-UI set). To add an icon, add its name to NAMES and re-run:
//   node scripts/builder-icons.mjs ../automation-workflows-frontend
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const NAMES = [
  // triggers (utils/trigger.ts)
  "heroicons-outline:tag", "heroicons-outline:switch-horizontal", "heroicons-outline:clipboard-list", "heroicons-outline:refresh",
  "heroicons-outline:user-add", "heroicons-outline:calendar", "heroicons-outline:users",
  // actions (utils/workflows.ts)
  "heroicons-solid:tag", "entypo:add-to-list", "ic:round-sticky-note-2", "mdi:code-braces", "vaadin:road-split", "mdi:call-split",
  "heroicons-solid:mail-open", "heroicons-solid:chat-alt", "ant-design:clock-circle-filled", "ant-design:dollar-circle-filled",
  "heroicons-solid:rss", "ic:baseline-notifications-active", "mdi:plus", "bx:bxs-flag-checkered",
  // canvas chrome (ghl-icons outline)
  "ghl:BarChart07", "ghl:Copy03", "ghl:Trash03", "ghl:ClipboardCheck", "ghl:DotsHorizontal", "ghl:Plus", "ghl:Minus", "ghl:Hand",
  "ghl:Expand06", "ghl:Keyboard01",
  // Workflow Maps' canvas (advanced-workflow-canvas): controls, run navigation and execution chips
  "ghl:Expand05", "ghl:ZoomOut", "ghl:ZoomIn", "ghl:Download01", "ghl:ArrowLeft", "ghl:ArrowRight", "ghl:LogIn02", "ghl:LogOut02",
  "ghl:AlertTriangle", "ghl:FastForward", "ghl:Signal01", "ghl:ChevronDown",
  // Workflow Maps' 3D map (workflow-grid: get-grid-asset-style.ts, GridPlane.ts, GridErrorIndicatorRenderer.ts, GridBadge.ts)
  "mdi:sitemap", "mdi:form-select", "heroicons-solid:calendar", "mdi:clipboard-list", "mdi:view-column", "mdi:filter",
  "mdi:file-document-multiple", "mdi:package-variant-closed", "mdi:package-variant", "heroicons-solid:users", "mdi:play-circle",
  "mdi:file-document-edit", "mdi:folder", "mdi:alert-circle", "mdi:link-variant", "heroicons-solid:document-text",
  "mdi:ticket-percent",
  // Workflow Maps' Assistant panel (workflow-ai/maps-assistant, workflow-ai/v3/components, workflow-ai/chat)
  "ghl:MessageChatSquare", "ghl:XClose", "ghl:ArrowUp", "ghl:Microphone01", "ghl:Lightbulb02", "ghl:Map01", "ghl:AlertCircle",
  "ghl:Dataflow01", "ghl:Lightning01", "ghl:FolderPlus", "ghl:Eraser", "ghl:Save01", "ghl:ThumbsUp", "ghl:ThumbsDown",
  "ghl:ClockRewind", "ghl:ReverseLeft", "ghl:CheckCircle", "ghl:Clock", "ghl:Loading01", "ghl:Folder",
  // Workflow Maps' error flow (GridErrorSummary, WorkflowDetailPanel, WorkflowFailedExecutionList, WorkflowCanvasModal,
  // ExecutionLogPanel, ExecutionLogDetailPanel)
  "lucide:chevron-down", "lucide:chevron-right", "lucide:x", "heroicons-solid:user", "akar-icons:arrow-up-right",
  "ghl:Folder", "ghl:XClose", "ghl:Stars02", "ghl:ChevronRight", "ghl:LinkExternal01", "ghl:X", "ghl:Share03",
  // the deleted asset's panel (AssetDetailPanel): search prefix; the summary's trigger / action glyphs are mingcute:lightning-fill
  // and mingcute:play-fill in the product, which @iconify/json 1.x lacks, so mdi's filled bolt and play stand in
  "ghl:SearchMd", "mdi:lightning-bolt", "mdi:play",
  // Workflow Maps' right drawer and preview modal (grid-right-sidebar, GridAssetGlyph, AsideSectionLite)
  "ghl:Stars02", "ghl:XClose", "ghl:X", "ghl:SearchMd", "ghl:Folder", "ghl:ChevronRight", "ghl:LinkExternal01", "ghl:DotsVertical",
  "akar-icons:arrow-up-right", "lucide:chevron-down", "heroicons-solid:user", "heroicons-solid:chevron-down", "fa-solid:trash",
  "mingcute:lightning-fill", "mingcute:play-fill",
];

const repo = process.argv[2];
if (!repo) throw new Error("Usage: node scripts/builder-icons.mjs <path to automation-workflows-frontend>");
const nm = join(repo, "node_modules");
const sets = new Map();

/** Iconify icon → { body, size } (body is the SVG's inner markup in its own viewBox). */
const iconify = (prefix, name) => {
  // the product fetches a few sets from the Iconify API at runtime (not in its @iconify/json): their icons are kept in
  // scripts/icon-sets/<prefix>.json, as the API serves them (https://api.iconify.design/<prefix>.json?icons=...)
  const local = new URL(`./icon-sets/${prefix}.json`, import.meta.url);
  if (!sets.has(prefix)) sets.set(prefix, JSON.parse(readFileSync(existsSync(local) ? local : join(nm, "@iconify/json/json", `${prefix}.json`), "utf8")));
  const set = sets.get(prefix);
  const alias = set.aliases?.[name];
  const icon = set.icons[alias ? alias.parent : name];
  if (!icon) throw new Error(`Icon not found: ${prefix}:${name}`);
  return { body: icon.body, w: icon.width ?? set.width ?? 16, h: icon.height ?? set.height ?? 16 };
};

/** ghl-icons ship as compiled Vue render functions; their paths are stroked outlines on a 24 grid. */
const ghl = (name) => {
  const src = readFileSync(join(nm, "@gohighlevel/ghl-icons/24/outline", `${name}Icon.js`), "utf8");
  const width = src.match(/"stroke-width": "([\d.]+)"/)?.[1] ?? "2";
  const paths = [...src.matchAll(/\bd: "([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error(`No paths in ghl icon ${name}`);
  const body = paths.map((d) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  return { body, w: 24, h: 24 };
};

const out = {};
for (const n of NAMES) {
  const [prefix, name] = n.split(":");
  out[n] = prefix === "ghl" ? ghl(name) : iconify(prefix, name);
}
const file = `// Generated by scripts/builder-icons.mjs from the workflow builder's icon packages. Do not edit by hand.
export const BUILDER_ICONS: Record<string, { body: string; w: number; h: number }> = ${JSON.stringify(out, null, 0)};
`;
writeFileSync(new URL("../src/video/builder/icons.ts", import.meta.url), file);
console.log(`Wrote ${NAMES.length} icons`);

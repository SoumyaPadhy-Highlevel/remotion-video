// The workflow builder's design tokens, as the real canvas draws them (automation-workflows-frontend,
// src/components/workflow/WorkflowTreeV2.vue and the node components it renders). Every value is the resolved Highrise /
// Tailwind token, in CSS px at 100 % zoom. Anything in the video that shows the builder draws from here, never from
// hand-picked colours, so it stays consistent with the product. Source file noted per group.

/** Highrise palette (node_modules/@platform-ui/highrise/dist/style.css). `red` is Tailwind 2's default (not in Highrise). */
export const HR = {
  gray: { 50: "#f9fafb", 100: "#f2f4f7", 200: "#eaecf0", 300: "#d0d5dd", 400: "#98a2b3", 500: "#667085", 600: "#475467", 700: "#344054", 800: "#1d2939", 900: "#101828" },
  primary: { 50: "#eff4ff", 100: "#d1e0ff", 200: "#b2ccff", 400: "#528bff", 500: "#2970ff", 600: "#155eef", 700: "#004eeb" },
  green: { 50: "#edfcf2", 400: "#3ccb7f", 500: "#16b364", 600: "#099250", 700: "#087443" },
  purple: { 50: "#f4f3ff", 400: "#9b8afb", 500: "#7a5af8", 600: "#6938ef", 700: "#5925dc" },
  blue: { 50: "#eff8ff", 100: "#d1e9ff", 400: "#53b1fd", 500: "#2e90fa", 600: "#1570ef", 700: "#175cd3" },
  yellow: { 50: "#fefbe8", 400: "#fac515", 600: "#ca8504", 700: "#a15c07" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 500: "#ef4444", 700: "#b91c1c" },
} as const;

/** Icon colour groups used by triggers and actions (utils/trigger.ts, utils/workflows.ts). */
export type Tone = "primary" | "green" | "purple" | "blue" | "yellow" | "red";

/** Inter is the builder's font ("Inter var" in tailwind.config.js); the video loads the same family. */
export const FONT = "Inter, system-ui, sans-serif";

export const CANVAS = {
  // canvas root: bg-gray-50, 1px gray-200 border, rounded-lg (WorkflowTreeV2.vue:15)
  bg: HR.gray[50], border: HR.gray[200], radius: 8,
  // <Background variant="lines" pattern-color="#f3f4f6" gap=20>: 1px lines every 20 px × zoom
  grid: "#f3f4f6", gridGap: 20,
  // Vue Flow default edge stroke (@vue-flow/core style.css)
  edge: "#b1b1b7", edgeRadius: 16,
  // utils/canvas_helper.ts: d3 node size [130, 160]; every node is 240 wide; triggers 300 above the first step, 15 apart
  nodeW: 240, rowGap: 160, laneGap: 260, triggerY: -300, triggerGap: 15, addTriggerDrop: 44,
};

/** Every card's chrome (ActionNode.vue .node-shadow, WorkflowTreeV2.vue:1900-1915). */
export const CARD = {
  border: HR.gray[300], radius: 12, bg: "#fff", shadow: "0px 1px 3px 0px #1018281a",
  selected: HR.primary[600],
  divider: HR.gray[200],
};

export const ACTION = { h: 70, padX: 12, padY: 16, icon: 36, iconGlyph: 20, iconRadius: 6, label: HR.gray[600], menu: HR.gray[400] };
export const TRIGGER = { h: 152, headerH: 60, bodyH: 56, footerH: 32, iconW: 36, iconH: 32, title: 12, sub: HR.gray[600], body: HR.gray[700], stats: HR.primary[700] };
export const ADD_TRIGGER = { h: 70, bg: HR.blue[50], border: HR.blue[600], text: HR.blue[600], radius: 8 };
/** If/Else and router branch cards (branch-custom-nodes/IfElseBranchNode.vue). */
export const BRANCH = { h: 70, accent: HR.purple[500], title: HR.purple[700], text: HR.gray[600], wrapBorder: HR.gray[200] };
/** END pill (EndNode.vue): 48 wide, gray-300. */
export const END = { w: 48, h: 26, bg: HR.gray[300], text: HR.gray[600] };
/** The "+" on an edge (PlusButton.vue): 24 px dashed circle, gray-100. */
export const PLUS = { size: 24, bg: HR.gray[100], border: HR.gray[300], icon: HR.gray[600] };

/** Box and glyph colours of an icon tone (useNodeVisualState.ts: bg-{c}-50, text-{c}-700; triggers use {c}-600). */
export const toneColors = (tone: Tone, trigger = false) => {
  const c = HR[tone] as Record<number, string>;
  return { box: c[50], glyph: trigger ? c[600] : c[700] };
};

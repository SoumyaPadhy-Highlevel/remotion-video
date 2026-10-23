// Phase 1 of the editable video: every piece of on-screen text, the text colours and fonts, and an on/off switch per
// layer, as composition props. Remotion Studio shows them in the Inspector (Default Props); "Save" writes them to
// src/Composition.tsx. Components read them with useCfg(). Defaults are the values the video was cut with (script.ts), so
// with nothing changed the render is identical.
//
// Text markup: *words* = blue gradient, a line break = a line break. Times, motion and effects are not here yet (phase 2/3).
import React, { createContext, useContext } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { BUILD, FEATURE_CARDS, HEADLINES, INTRO_CARDS, LOCKUP, MESSAGE, PANELS, TABS, TITLE_CARDS } from "./script";
import { ZOOMS } from "./zooms";

// ── markup ──
const ACCENT = /<span class="grad-text">(.*?)<\/span>/g;
/** script.ts html → editable markup */
export const toMarkup = (html: string) => html.replace(ACCENT, "*$1*").replace(/<br\s*\/?>/g, "\n");
/** editable markup → the html the components draw */
export const md = (s: string) => s.replace(/\*([^*]+)\*/g, '<span class="grad-text">$1</span>').replace(/\n/g, "<br/>");

// ── names for the cards (order as in script.ts) ──
const INTRO_KEYS = ["startedSimple", "callingEachOther", "oneFormManyWorkflows", "openEveryWorkflow", "whatIf", "reimagine"] as const;
const FEATURE_KEYS = ["selectWorkflow", "clickAsset", "handOff", "interconnected", "findAnything", "moveWorkflows", "keepTidy", "pickContact",
  "everyRun", "openRun", "stepRunToRun", "needsAttention", "failedStep", "deletedAssets", "askYourMap", "answersOnMap"] as const;
const TITLE_CARD_KEYS = ["makeItYours", "traceContact", "fixErrors", "justAsk"] as const;
const FEATURES = FEATURE_CARDS.filter((c) => !c.build);
if (FEATURES.length !== FEATURE_KEYS.length || INTRO_CARDS.length !== INTRO_KEYS.length || TITLE_CARDS.length !== TITLE_CARD_KEYS.length) {
  throw new Error("config.tsx: the card names no longer match script.ts (cards were added or removed)");
}

const str = (d: string) => z.string().describe(d);
const card = z.object({ kicker: str("Small line above (all caps)"), text: str("*words* = gradient") });
const obj = <K extends readonly string[], V extends z.ZodTypeAny>(keys: K, v: V) => z.object(Object.fromEntries(keys.map((k) => [k, v])) as { [k in K[number]]: V });

export const textSchema = z.object({
  opening: z.object({ pill: str("The pill under the logo"), headline: str("Opening headline (*words* = gradient)") }),
  introCards: obj(INTRO_KEYS, str("Intro statement (*words* = gradient)")),
  titleDrop: z.object({ kicker: str("Above the title"), title: str("The title on the drop") }),
  featureCards: obj(FEATURE_KEYS, card),
  panelShots: z.object({ searchLabel: z.string(), filterLabel: z.string(), colourLabel: z.string(), notesLabel: z.string(), renameLabel: z.string(), tidyOutro: str("Line at the end of the organise trio") }),
  titleCards: obj(TITLE_CARD_KEYS, card),
  breaksHeadline: str("Before the errors section"),
  mapBuild: z.object({ kicker: z.string(), headline: str("Left panel headline"), step1: z.string(), step1List: z.string(), step1Count: z.string(), step2: z.string(), step2List: z.string(), step2Count: z.string(), step3: z.string(), step3List: z.string(), step3Count: z.string() }),
  clientMessage: z.object({ from: z.string(), initials: z.string(), text: z.string() }),
  lockup: z.object({ name: z.string(), accent: str("Gradient word"), badge: z.string(), tagline: z.string() }),
  browserTabs: z.array(z.string()).describe("Tab names, in the order they open"),
});
// colours: ink = main text, accent = kickers and accents, pill = opening pill, badge = lockup badge (no .describe on colours:
// it hides Studio's colour picker)
export const styleSchema = z.object({
  ink: zColor(),
  accent: zColor(),
  gradientStart: zColor(), gradientMid: zColor(), gradientEnd: zColor(),
  pill: zColor(),
  badge: zColor(),
  headingFont: z.enum(["Poppins", "Inter"]), bodyFont: z.enum(["Inter", "Poppins"]),
  sizes: z.object({
    introCard: z.number().min(20).max(240), introCardRaised: z.number().min(20).max(240).describe("The raised second 'reimagine' line"),
    titleDrop: z.number().min(20).max(300), featureCard: z.number().min(20).max(240), topLine: z.number().min(12).max(120),
    panelCaption: z.number().min(12).max(120), titleCard: z.number().min(20).max(240), lockup: z.number().min(20).max(240),
  }),
});
export const showSchema = z.object({
  opening: z.boolean(), introCards: z.boolean(), titleDrop: z.boolean(), featureCards: z.boolean().describe("Full-screen statement cards"),
  topLines: z.boolean().describe("Lines above the window"), panelCaptions: z.boolean(), titleCards: z.boolean(), breaksHeadline: z.boolean(),
  mapBuildPanel: z.boolean(), flights: z.boolean().describe("Map build: items flying into the map"), clientMessage: z.boolean(),
  browserTabs: z.boolean(), flashes: z.boolean(), lockup: z.boolean(), mascot: z.boolean(),
  mascotSize: z.number().min(0.2).max(3).step(0.05).describe("1 = as designed"),
});
// ── phase 2: how things move and look (when they happen stays in script.ts until phase 3) ──
const num = (min: number, max: number, step: number, d?: string) => (d ? z.number().min(min).max(max).step(step).describe(d) : z.number().min(min).max(max).step(step));
export const PUSH_KEYS = ["drawers", "search", "cleanup", "contactDrawer", "runDetails", "needsAttention", "errorExecutions", "assistant"] as const;
const pushIn = z.object({ on: z.boolean(), scale: num(1, 1.6, 0.01, "1.2 = 20% closer"), focusX: num(0, 1620, 1, "Point to push toward, window px"), focusY: num(0, 880, 1) });
export const motionSchema = z.object({
  window: z.object({
    riseDistance: num(0, 600, 1, "The window rises in at 0:03.9 from this far below (px)"), riseStartScale: num(0.5, 1, 0.01),
    introPush: num(0, 0.2, 0.001, "Slow push during the intro (0.025 = 2.5%)"),
    firstDropPunch: num(0, 0.2, 0.001), dropPunch: num(0, 0.2, 0.001, "Kick on each later drop"), dropPunchTime: num(0.05, 2, 0.01), hitPunch: num(0, 0.2, 0.001),
    endShrink: num(0, 0.5, 0.01), endBlur: num(0, 40, 0.5),
  }),
  recedeIntro: z.object({ shrink: num(0, 0.5, 0.01, "Behind intro cards and the title"), dim: num(0, 1, 0.01), blur: num(0, 30, 0.5) }),
  recedeCards: z.object({ shrink: num(0, 0.5, 0.01, "Behind the feature statement cards"), dim: num(0, 1, 0.01), blur: num(0, 30, 0.5) }),
  shake: z.object({ x: num(0, 60, 0.5, "Shake on the intro's hits (px)"), y: num(0, 60, 0.5), duration: num(0.05, 1, 0.01) }),
  pushIns: obj(PUSH_KEYS, pushIn),
  pushInEase: z.object({ in: num(0.05, 3, 0.05, "Seconds to push in"), out: num(0.05, 3, 0.05, "Seconds to pull back") }),
  titles: z.object({
    rise: num(0, 3, 0.01, "How far each letter rises in (em)"), tilt: num(0, 45, 0.5, "Degrees"), blur: num(0, 40, 0.5),
    letterDelay: num(0, 0.2, 0.001, "Max delay between letters (s)"), duration: num(0.05, 3, 0.01, "Each letter's entrance (s)"),
    exitLift: num(0, 3, 0.01, "How far letters lift away (em)"), pulse: num(0, 0.3, 0.001, "Pulse on music hits"),
    topLineSlide: num(0, 200, 1, "Top lines slide down from this far (px)"),
  }),
  flights: z.object({ duration: num(0.1, 3, 0.01, "Map build: seconds in the air"), arcHeight: num(0, 600, 1), shrink: num(0, 1, 0.01, "How much the chip shrinks on the way") }),
  mascotBob: num(0, 60, 0.5, "Mascot bob behind statement cards (px)"),
});
export const fxSchema = z.object({
  flash: z.object({ strength: num(0, 1, 0.01, "White flash on drops"), duration: num(0.05, 3, 0.01) }),
  background: z.object({ skyTop: zColor(), skyUpper: zColor(), skyLower: zColor(), skyBottom: zColor(), dots: z.boolean(), floor: z.boolean(),
    floorCentre: zColor(), floorInner: zColor(), floorMid: zColor(), floorEdge: zColor() }),
  windowRadius: num(0, 80, 1, "App window corner radius (px)"),
});
export type MotionCfg = z.infer<typeof motionSchema>;
export type FxCfg = z.infer<typeof fxSchema>;
export type TextCfg = z.infer<typeof textSchema>;
export type StyleCfg = z.infer<typeof styleSchema>;
export type ShowCfg = z.infer<typeof showSchema>;
export type Cfg = { text: TextCfg; style: StyleCfg; show: ShowCfg; motion: MotionCfg; fx: FxCfg };

const cardOf = (c: { kicker: string; html: string }) => ({ kicker: c.kicker, text: toMarkup(c.html) });
export const DEFAULT_CFG: Cfg = {
  text: {
    opening: { pill: "WORKFLOWS", headline: toMarkup(HEADLINES[0].html) },
    introCards: Object.fromEntries(INTRO_KEYS.map((k, i) => [k, toMarkup(INTRO_CARDS[i].html)])) as TextCfg["introCards"],
    titleDrop: { kicker: "INTRODUCING", title: "Workflow *Maps*" },
    featureCards: Object.fromEntries(FEATURE_KEYS.map((k, i) => [k, cardOf(FEATURES[i])])) as TextCfg["featureCards"],
    panelShots: { searchLabel: PANELS.duo.panels[0].label, filterLabel: PANELS.duo.panels[1].label, colourLabel: PANELS.trio.panels[0].label,
      notesLabel: PANELS.trio.panels[1].label, renameLabel: PANELS.trio.panels[2].label, tidyOutro: toMarkup(PANELS.trio.outro!.html) },
    titleCards: Object.fromEntries(TITLE_CARD_KEYS.map((k, i) => [k, cardOf(TITLE_CARDS[i])])) as TextCfg["titleCards"],
    breaksHeadline: toMarkup(HEADLINES[1].html),
    mapBuild: { kicker: "HOW THE MAP WORKS", headline: "Your list,\n*drawn as a map.*",
      step1: BUILD.steps[0].label, step1List: BUILD.steps[0].head, step1Count: BUILD.steps[0].count,
      step2: BUILD.steps[1].label, step2List: BUILD.steps[1].head, step2Count: BUILD.steps[1].count,
      step3: BUILD.steps[2].label, step3List: BUILD.steps[2].head, step3Count: BUILD.steps[2].count },
    clientMessage: { from: MESSAGE.who, initials: MESSAGE.initials, text: MESSAGE.text },
    lockup: { ...LOCKUP },
    browserTabs: [...TABS.names],
  },
  style: {
    ink: "#0B1B3A", accent: "#155EEF", gradientStart: "#155EEF", gradientMid: "#2E90FA", gradientEnd: "#22CCEE", pill: "#4A90F7", badge: "#7F56D9",
    headingFont: "Poppins", bodyFont: "Inter",
    sizes: { introCard: 92, introCardRaised: 64, titleDrop: 168, featureCard: 84, topLine: 42, panelCaption: 56, titleCard: 120, lockup: 132 },
  },
  motion: {
    window: { riseDistance: 160, riseStartScale: 0.94, introPush: 0.025, firstDropPunch: 0.03, dropPunch: 0.04, dropPunchTime: 0.45, hitPunch: 0.02, endShrink: 0.15, endBlur: 10 },
    recedeIntro: { shrink: 0.12, dim: 0.45, blur: 7 },
    recedeCards: { shrink: 0.1, dim: 0.5, blur: 7 },
    shake: { x: 9, y: 5, duration: 0.22 },
    pushIns: Object.fromEntries(PUSH_KEYS.map((k, i) => [k, { on: true, scale: ZOOMS[i][2], focusX: ZOOMS[i][3], focusY: ZOOMS[i][4] }])) as MotionCfg["pushIns"],
    pushInEase: { in: 0.6, out: 0.5 },
    titles: { rise: 0.85, tilt: 7, blur: 8, letterDelay: 0.032, duration: 0.45, exitLift: 0.45, pulse: 0.045, topLineSlide: 24 },
    flights: { duration: 0.55, arcHeight: 70, shrink: 0.45 },
    mascotBob: 8,
  },
  fx: {
    flash: { strength: 0.75, duration: 0.45 },
    background: { skyTop: "#F8FBFF", skyUpper: "#EEF4FF", skyLower: "#DDEBFF", skyBottom: "#C9DFFF", dots: true, floor: true,
      floorCentre: "#FFFFFF", floorInner: "#E3EFFF", floorMid: "#B9D5FF", floorEdge: "#9CC3FF" },
    windowRadius: 18,
  },
  show: {
    opening: true, introCards: true, titleDrop: true, featureCards: true, topLines: true, panelCaptions: true, titleCards: true, breaksHeadline: true,
    mapBuildPanel: true, flights: true, clientMessage: true, browserTabs: true, flashes: true, lockup: true, mascot: true, mascotSize: 1,
  },
};

// ── access from components ──
const Ctx = createContext<Cfg>(DEFAULT_CFG);
export const CfgProvider: React.FC<{ cfg: Cfg; children: React.ReactNode }> = ({ cfg, children }) => <Ctx.Provider value={cfg}>{children}</Ctx.Provider>;
export const useCfg = () => useContext(Ctx);

/** The editable kicker and text (as html) of a script.ts card. */
export const cardText = (cfg: Cfg, c: { kicker: string; html: string }) => {
  const fi = FEATURES.indexOf(c as (typeof FEATURES)[number]);
  if (fi >= 0) { const v = cfg.text.featureCards[FEATURE_KEYS[fi]]; return { kicker: v.kicker, html: md(v.text) }; }
  const ti = TITLE_CARDS.indexOf(c as (typeof TITLE_CARDS)[number]);
  if (ti >= 0) { const v = cfg.text.titleCards[TITLE_CARD_KEYS[ti]]; return { kicker: v.kicker, html: md(v.text) }; }
  return { kicker: c.kicker, html: c.html };
};
export const introCardHtml = (cfg: Cfg, i: number) => md(cfg.text.introCards[INTRO_KEYS[i]]);

/** CSS variables for the colours and fonts (each component falls back to the same values). */
export const styleVars = (s: StyleCfg): React.CSSProperties => ({
  ["--ink" as string]: s.ink, ["--accent" as string]: s.accent, ["--grad-a" as string]: s.gradientStart, ["--grad-b" as string]: s.gradientMid,
  ["--grad-c" as string]: s.gradientEnd, ["--pill" as string]: s.pill, ["--badge" as string]: s.badge,
  ["--font-head" as string]: s.headingFont, ["--font-body" as string]: s.bodyFont,
});

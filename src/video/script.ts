// ─────────────────────────────────────────────────────────────────────────────
// The video's script: music markers, beats (one footage clip each) and every
// piece of on-screen text with its timing. Times are seconds on the edited track.
// Edit this file to change wording or timing; the components read from here.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkflowSpec } from "./builder/layout";

export const FPS = 30;

/** Music markers on public/music-intro2.mp3, a placeholder: the uncut track with 20 bars added to the intro (bars 0–3 four times,
 * 4-5-6-5 twice, then 4–7 into the drop), so everything from the drop on sits 38.75 s later than on music-full.mp3 (one bar = 1.9375 s). */
export const M = {
  BAR: 1.9375,
  D1: 54.27, // first drop: list page → map
  STOP: 82.83, // music stops
  HIT: 83.31, // hit after the stop
  B2: 93.01, // build towards drop 2
  SIL: 100.05, // silence before drop 2
  D2: 100.74, // second drop: value section
  GAP: 144.79, // "one more thing" gap
  D3: 147.19, // third drop: colour
  FIN: 160.76, // finale
  LOGO: 174.05, // logo lockup
  END: 183.8,
};

/**
 * Beats. Each beat plays one clip of the app window, by default public/footage/<id>.mp4
 * (1620×880). To show a screen recording instead, drop it in public/footage/ and set
 * `footage` on the beat:
 *   file      file name in public/footage/ (any size; it is fitted into the window)
 *   from      seconds into the recording to start at (default 0)
 *   speed     playback speed, e.g. 1.25 to fit a slightly long take (default 1)
 * Everything around the window stays the same.
 */
export type Footage = { file: string; from?: number; speed?: number };
/** The app window's footage as the edit shows it: one film frame per video frame (scripts/edited-footage.mjs), so the
 * stretches played slower or faster than the film show fresh frames instead of repeated ones (judder). Built from the film
 * and the timings in this file: rebuild it whenever either changes. null = play APP_FILE per beat, as before. */
export const EDITED_FILE: string | null = "app-edited-v3.mp4";   // v3: v2 with the intro (frames < 1100) re-rendered: the "Workflow Maps · Dallas" account and the mascot logo
export const APP_FILE = "app-motion-v37.mp4";   // v37: the browse shot's rail with the mascot logo and the location pin; v36: the Workflow Maps pop and click after the reimagine line; v35: browse from 0:36 with a slow Workflow Maps click; v34: the Workflow Maps button pops up before the click; v33: shorter Organise notes (orgdoc, from the Organise session) + scene "browse" (the intro's list browsing, from frame 7764); v30: the run cuts back on its close click; v29: Trace any contact re-cut (enrollment → run → timeline); v28: v27 with Trace any contact rebuilt from staging (taylor reynolds, wait for condition user); v27: v26 without the offer lines while highlighting; v26: v25 + scene "act" (the Assistant acting on the map, from frame 7084); v25: v24 + scene "orgdoc" (Organise and document, from frame 6245); v24: v23 + the linked-workflows contact journey (scene "lm" to 22.26 s); v23: v22 without the intro's dark callouts (INTRO_CALLOUTS draws them)
const APP: Footage = { file: APP_FILE }; // one Claude Motion film for the whole app track, from 3.90 s
export const BEATS: { id: string; label: string; start: number; end: number; footage?: Footage }[] = [
  { id: "01-intro", label: "Intro", start: 0, end: 3.9 },
  { id: "02-list", label: "Problem: it grew, they connect, nobody can see it", start: 3.9, end: M.D1, footage: { ...APP, from: 3.9 - 3.9 } },
  { id: "03-drop", label: "Drop: Workflow Maps", start: M.D1, end: 58.14, footage: { ...APP, from: M.D1 - 3.9 } },
  { id: "04-introducing", label: "One map", start: 58.14, end: 62.02, footage: { ...APP, from: 58.14 - 3.9 } },
  { id: "05-assets", label: "Plan: structure", start: 62.02, end: 65.88, footage: { ...APP, from: 62.02 - 3.9 } },
  { id: "06-steps", label: "Plan: inside a workflow", start: 65.88, end: 69.76, footage: { ...APP, from: 65.88 - 3.9 } },
  { id: "07-usage", label: "Plan: asset usage", start: 69.76, end: 73.63, footage: { ...APP, from: 69.76 - 3.9 } },
  { id: "08-folders", label: "Plan: linked workflows", start: 73.63, end: 77.5, footage: { ...APP, from: 73.63 - 3.9 } },
  { id: "09-search", label: "Plan: search", start: 77.5, end: 80.85, footage: { ...APP, from: 77.5 - 3.9 } },
  { id: "10-filter", label: "Plan: filter", start: 80.85, end: M.B2, footage: { ...APP, from: 80.85 - 3.9 } },
  { id: "11-build", label: "Build to drop 2", start: M.B2, end: M.D2, footage: { ...APP, from: M.B2 - 3.9 } },
  { id: "12-linked", label: "Organise: cleanup, drag, nest", start: M.D2, end: 111.21, footage: { ...APP, from: M.D2 - 3.9 } },
  { id: "13-errors", label: "Organise: colour, notes, save, views", start: 111.21, end: 122.04, footage: { ...APP, from: 111.21 - 3.9 } },
  { id: "14-journey", label: "Troubleshoot: pick a contact", start: 122.04, end: 132.54, footage: { ...APP, from: 122.04 - 3.9 } },
  { id: "15-organise", label: "Troubleshoot: the run", start: 132.54, end: M.GAP, footage: { ...APP, from: 132.54 - 3.9 } },
  { id: "16-gap", label: "And when something breaks?", start: M.GAP, end: M.D3, footage: { ...APP, from: M.GAP - 3.9 } },
  { id: "17-colour", label: "Troubleshoot: errors", start: M.D3, end: 153, footage: { ...APP, from: M.D3 - 3.9 } },
  { id: "18-notes", label: "Troubleshoot: failed step, deleted asset", start: 153, end: M.FIN, footage: { ...APP, from: 153 - 3.9 } },
  { id: "19-finale", label: "Finale: the Assistant", start: M.FIN, end: M.END, footage: { ...APP, from: M.FIN - 3.9 } },
];

/** Big headlines. `top`/`size` in px; `center` spans the full width. */
/** One beat of the soundtrack in timeline seconds where the visual plays at 0.85× (124 bpm: a bar is 1.9375 s of output). */
export const BEAT_TL = (1.9375 / 4) * 0.85;
/** `{20|50|100}` in a headline swaps through those values, each popping in at its time in `beats` (timeline s). A headline
 * with a `kicker` is centred like the statement cards, with the kicker above it. */
export const HEADLINES: { a: number; b: number; html: string; top: number; size: number; center?: boolean; kicker?: string; beats?: number[] }[] = [
  { a: 1.75, b: 3.85, html: `Your agency runs on<br/><span class="grad-text">hundreds of workflows.</span>`, top: 440, size: 96 },
  // over the music's gap: 20, 50, 100 on the beats into the drop (M.D3); it has lifted away by the drop, when the map comes forward
  { a: M.D3 - 5.5 * BEAT_TL, b: M.D3 - 0.02, html: `What if something breaks<br/>across {20|50|100} workflows?`, top: 410, size: 64,
    center: true, kicker: "WHEN IT BREAKS", beats: [M.D3 - 5.5 * BEAT_TL, M.D3 - 4 * BEAT_TL, M.D3 - 2 * BEAT_TL] },
];

/** Captions centred above the window. */
export const CAPTIONS: { a: number; b: number; html: string }[] = [
  // the problem is told by INTRO_CARDS (statement first) and by callouts inside the app visuals (then show)
  // one map (after the title explodes and clears on the 17.67 s hit)
  { a: 56.42, b: 58.1, html: `Every workflow. Every asset. <span class="grad-text">One map.</span>` },
  // Plan: the structure, one bar each (19.43, 21.37, 23.31 s)
  { a: 58.25, b: 60.05, html: `Your folders become <span class="grad-text">islands.</span>` },
  { a: 60.2, b: 62, html: `Blue nodes are your <span class="grad-text">workflows.</span>` },
  { a: 62.15, b: 63.9, html: `Smaller nodes are the <span class="grad-text">assets they use.</span>` },
  { a: 64.1, b: 65.85, html: `Colour shows the <span class="grad-text">asset type.</span>` },
  { a: 66.05, b: 67.8, html: `Lines show <span class="grad-text">what uses what.</span>` },
  { a: 68.05, b: 70.15, html: `Select a workflow. <span class="grad-text">See what’s inside.</span>` },
  { a: 70.3, b: 72.15, html: `Down to the <span class="grad-text">exact trigger.</span>` },
  { a: 72.45, b: 76.15, html: `Click any asset. See <span class="grad-text">everywhere it’s used.</span>` },
  { a: 76.55, b: 79.85, html: `Search anything. <span class="grad-text">Fly straight to it.</span>` },
  { a: 80.25, b: 82.75, html: `Filter to <span class="grad-text">what matters.</span>` },
  { a: 84.15, b: 89.35, html: `See how workflows <span class="grad-text">hand off to each other.</span>` },
  // Organise
  { a: 102.66, b: 104.06, html: `Find what you <span class="grad-text">don’t use.</span>` },
  { a: 104.16, b: 105.56, html: `Clean up <span class="grad-text">in bulk.</span>` },
  { a: 105.76, b: 108.06, html: `Drag workflows <span class="grad-text">where they belong.</span>` },
  { a: 108.36, b: 111.06, html: `Drop folders <span class="grad-text">into folders.</span>` },
  { a: 111.46, b: 113.36, html: `Colour-code <span class="grad-text">folders.</span>` },
  { a: 113.56, b: 116.56, html: `Leave notes <span class="grad-text">for your team.</span>` },
  { a: 116.76, b: 118.76, html: `Notes from the builder <span class="grad-text">show up too.</span>` },
  { a: 118.96, b: 120.66, html: `Save once. <span class="grad-text">Everyone sees it.</span>` },
  { a: 120.86, b: 121.96, html: `Save views to <span class="grad-text">come back to.</span>` },
  // Troubleshoot
  { a: 124.16, b: 125.76, html: `Pick any <span class="grad-text">contact.</span>` },
  { a: 125.96, b: 129.06, html: `See every workflow <span class="grad-text">they’ve been in.</span>` },
  { a: 129.26, b: 132.36, html: `Every run, <span class="grad-text">newest first.</span>` },
  { a: 132.86, b: 139.06, html: `Open any run. See exactly <span class="grad-text">where they are.</span>` },
  { a: 140.16, b: 144.46, html: `Click any step. See <span class="grad-text">why it’s waiting.</span>` },
  { a: 148.76, b: 150.86, html: `Spot what needs <span class="grad-text">attention.</span>` },
  { a: 152.06, b: 154.86, html: `See exactly which <span class="grad-text">runs failed.</span>` },
  { a: 155.26, b: 157.86, html: `Jump straight to the <span class="grad-text">failed step.</span>` },
  { a: 158.16, b: 160.66, html: `Catch deleted assets <span class="grad-text">still in use.</span>` },
  // the Assistant (finale)
  { a: 163.25, b: 166.15, html: `Ask your map <span class="grad-text">anything.</span>` },
  { a: 166.35, b: 170.05, html: `It answers, and <span class="grad-text">shows you on the map.</span>` },
  { a: 170.25, b: 173.75, html: `Straight to <span class="grad-text">what to fix first.</span>` },
];

/** Chapter pills top-left of the window. `n` is the badge text. */
export const CHAPTERS: { a: number; b: number; n: string; text: string }[] = [
  { a: 58.18, b: 67.75, n: "1", text: "Plan · Every workflow, with its assets" },
  { a: 67.88, b: 72.15, n: "2", text: "Plan · Down to the exact step" },
  { a: 72.25, b: 76.25, n: "3", text: "Plan · Everywhere an asset is used" },
  { a: 76.35, b: 79.95, n: "4", text: "Plan · Search across your map" },
  { a: 80.05, b: 83.65, n: "5", text: "Plan · Filter to what matters" },
  { a: 83.85, b: 89.65, n: "6", text: "Plan · Linked workflows" },
  { a: M.D2 + 1.3, b: 121.86, n: "★", text: "Organise" },
  { a: 123.36, b: 144.66, n: "★", text: "Troubleshoot · Contact journey" },
  { a: M.D3 + 1.3, b: 160.56, n: "★", text: "Troubleshoot · Errors" },
  { a: 163.2, b: 173.75, n: "★", text: "Assistant" },
];

/** Full-screen title cards (the window recedes behind them). */
export const TITLE_CARDS: { a: number; b: number; kicker: string; html: string }[] = [
  { a: 122.04, b: 123.31, kicker: "TROUBLESHOOT IT", html: `Trace any <span class="grad-text">contact</span>` },
  { a: M.FIN, b: 163.05, kicker: "ONE MORE THING", html: `Just <span class="grad-text">ask</span> your map` },
];

/** The first drop: "Workflow Maps" explodes on the drop (15.55 s, measured onset), kicks again on the wall of
 * sound (15.82 s) and clears in the break (17.14 s) so the map takes over on the 17.67 s hit. */
export const TITLE_DROP = { at: 54.3, wall: 54.57, out: 57.75 };   // held until the map build takes over (58.15)
/** Particle bursts on the other big hits (measured onsets). */
export const BURSTS = [
  { at: 100.86, x: 960, y: 540, n: 44, p: 760 },
  { at: 122.2, x: 960, y: 540, n: 36, p: 660 },
  { at: 147.41, x: 960, y: 540, n: 44, p: 760 },
  { at: 166.32, x: 960, y: 600, n: 54, p: 900 },
  { at: 174.08, x: 960, y: 520, n: 60, p: 980 },
];
/** The problem, "say, then show": a short statement over the receded window, then the visual on its own (its explanation is in
 * callouts inside the app footage). One card per idea; each sits on a bar line of the placeholder track. */
/** From 0:36 (right after "Open every workflow") to the drop the window plays the list-browsing shot (film scene "browse", from
 * frame 7764) instead of the tabs and the map forming: folder after folder, faster and faster, then slowly "Workflow Maps" pops
 * up, a deliberate click, a slow zoom; the drop's flash cuts to the map. Timeline seconds (= output + CUT_LEN here). */
export const INTRO_BROWSE = { a: 42.55, b: 54.27, film: 7764 / 30 };
export const INTRO_CARDS: { a: number; b: number; html: string; depth?: number; y?: number }[] = [
  { a: 3.9, b: 5.75, html: `It started <span class="grad-text">simple.</span>` },
  { a: 11.62, b: 13.35, html: `Then workflows started <span class="grad-text">calling each other.</span>` },
  { a: 25.19, b: 27.0, html: `And one form can start <span class="grad-text">many workflows.</span>` },
  { a: 40.69, b: 42.55, html: `The only way to know? <span class="grad-text">Open every workflow.</span>` },
  // the suspense before the reveal: over the chaos, then high above the map slowly forming in the window (light recede)
  { a: 46.55, b: 48.8, html: `What if we could change <span class="grad-text">all of this…</span>` },
  // ends before "Workflow Maps" pops up beside the list's title, which it would cover (INTRO_BROWSE)
  { a: 49.1, b: 51.2, html: `…and reimagine how you <span class="grad-text">see your workflows?</span>`, depth: 0.3, y: -330 },
];
/** The problem's explanations: white callouts in the app window, next to what they explain (window px). `x, y` is where the
 * pointer's tip touches and `side` the card edge it sits on (`ax`: tip's distance from the card's left, for top/bottom);
 * `side: "none"` places the card's top-left at `x, y`. Shown from `a` to `b` (timeline); the scene holds still at `hold` for
 * `dur` s while the window pushes in toward `focus`. Each hold's time comes out of the rest of its stretch between two intro
 * cards, which plays a little faster (introTime), so the cards stay on the music. The film (v23 on) no longer draws these. */
export type IntroCallout = { a: number; hold: number; dur: number; b: number; html: string; x: number; y: number; side: "top" | "bottom" | "left" | "right" | "none"; ax?: number; focus: [number, number];
  /** keep the window still (no push-in), e.g. while the cursor goes up to the browser tabs */
  noPush?: boolean };
export const INTRO_CALLOUTS: IntroCallout[] = [
  // the list, in staging's Lead Management | Priority Routing folder: points at the Priority Assignment row
  { a: 9.95, hold: 10.75, dur: 1.4, b: 11.45, html: `As you grow, workflows end up<br/>Buried in <span class="grad-text">folders.</span>`, x: 380, y: 690, side: "top", focus: [420, 560] },
  // Priority Assignment: under its High branch's Add to workflow step (the panel on the right picks High Priority Nurture)
  { a: 14.85, hold: 15.6, dur: 0.7, b: 16.95, html: `This step sends the contact to another workflow.<br/>What happens next is <span class="grad-text">in another tab.</span>`, x: 446, y: 672, side: "top", ax: 120, focus: [446, 500] },
  // the hand-off glide (film scene "list"): every hand-off opens another tab; no push-in, so the window stays put while it glides
  { a: 19.0, hold: 19.6, dur: 0, b: 20.6, html: `Every hand-off opens<br/><span class="grad-text">another tab.</span>`, x: 342, y: 6, side: "top", ax: 104, focus: [342, 0], noPush: true },
  { a: 24.3, hold: 24.75, dur: 0.8, b: 25.15, html: `Five tabs for one contact.<br/><span class="grad-text">Which one was it?</span>`, x: 600, y: 6, side: "top", ax: 120, focus: [600, 0], noPush: true },
  // one form, four workflows: under the Coaching Enquiry form, once all four windows have landed (the last settles at 29.25)
  { a: 29.3, hold: 29.6, dur: 0.9, b: 30.95, html: `The same form<br/>Starts <span class="grad-text">four workflows,</span> in four folders.`, x: 810, y: 490, side: "top", ax: 300, focus: [810, 0] },
  { a: 32.3, hold: 33.25, dur: 0.9, b: 34.3, html: `Delete one form, and four workflows break.<br/><span class="grad-text">And the impact stays invisible.</span>`, x: 810, y: 490, side: "top", ax: 300, focus: [810, 0] },
];
/** Window jolts on the scramble's hits. */
export const SHAKES = [43.05, 43.41, 43.89, 44.975, 45.595];

/** The three lines of the build before drop 2, one per bar from 47.05 s. */
export const BUILD_LINES = ["Plan it.", "Organise it.", "Troubleshoot it."];
export const BUILD_LINES_START = 94.91;

/** Client message bubble: shown in the build, then again top-right during the journey. */
export const MESSAGE = { who: "Client · Summit Shield", initials: "SS", text: "Why hasn’t Taylor moved on yet?", answeredAt: 142.65, from: 123.36, to: 123.36 };   // off (user, 24 Oct: only the features)

/** Browser tabs that pile up in the device's tab strip ("tab hell", Browser.tsx). The film scene "list" keeps the same moments
 * by hand: the hand-off glide opens one workflow per tab (its GL.open), then the wall of windows adds the rest (its PT). */
export const TABS = {
  /** the one tab before the first workflow opens (in it, so its title changes) and after the rest close at `b` */
  home: "Workflows",
  times: [13.5, 18.6, 19.9, 21.2, 22.5],
  b: 42.55,   // gone when the list page takes over (INTRO_BROWSE)
  /** [time, tab index]: switch the active tab back to an earlier one (none: the last one opened is active) */
  flips: [] as [number, number][],
  names: ["Lead Management | Priority Assignment", "Lead Management | High Priority Nurture", "Lead Management | Medium Priority Nurture", "Lead Management | Low Priority Nurture", "Lead Management | Consultation Handoff"],
}

/** The workflows the film's builder shots show, redrawn with the product's own canvas (src/video/builder, scenes.tsx).
 * Trigger `title` is the trigger type, `name` the name the user gave it; filters read as the builder writes them. */
const tagTrigger = { id: "contact-tag", title: "Contact Tag", name: "Tag added: follow-up", icon: "heroicons-outline:tag", tone: "primary", filters: [`Tag Added is "follow-up"`] } as const;
export const BUILDER_WORKFLOWS: Record<"tagNewEnquiries" | "continueJourney" | "tagWorkflow" | "formToTag" | "consultationGoal" | "opportunityRouting" | "programApplication" | "priorityAssignment" | "runApplication" | "runTagEnquiries" | "runPayment", WorkflowSpec> = {
  // Tag New Enquiries in Plan it (its preview): the Coaching Enquiry form, the tags, then the follow-up (utils/workflows.ts:
  // wait purple, email and internal notification green)
  tagNewEnquiries: {
    triggers: [{ id: "form-submitted", title: "Form Submitted", name: "Form Submitted", icon: "heroicons-outline:clipboard-list", tone: "green", filters: [`Form is "Coaching Enquiry"`] }],
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "wait", label: "Wait 10 minutes", icon: "ant-design:clock-circle-filled", tone: "purple" },
      { kind: "action", id: "send-email", label: "Thanks for your enquiry", icon: "heroicons-solid:mail-open", tone: "green" },
      { kind: "action", id: "notify", label: "Notify the sales team", icon: "ic:baseline-notifications-active", tone: "green" },
    ],
  },
  continueJourney: {
    triggers: [{ ...tagTrigger, filters: [...tagTrigger.filters] }], addTrigger: true,
    steps: [{ kind: "action", id: "add-to-workflow", label: "Add to Workflow", icon: "entypo:add-to-list", tone: "purple" }],
  },
  tagWorkflow: {
    triggers: [
      { ...tagTrigger, filters: [...tagTrigger.filters] },
      { id: "opportunity-changed", title: "Opportunity Changed", name: "Opportunity changed", icon: "heroicons-outline:switch-horizontal", tone: "primary", filters: [`Pipeline is "Sales Pipeline"`] },
    ],
    addTrigger: true,
    steps: [
      { kind: "action", id: "note", label: "Note", icon: "ic:round-sticky-note-2", tone: "primary" },
      { kind: "ifElse", id: "condition", label: "Condition", branches: [
        { id: "branch", title: "Branch", text: `If "Tags" includes "vip"`, steps: [] },
        { id: "none", title: "None", text: "When none of the conditions are met", steps: [] },
      ] },
    ],
  },
  // the one form that starts four workflows (four-up, film 23.7–39.2 s), and Tag New Enquiries / contact tag - form 7
  formToTag: {
    triggers: [{ id: "form-submitted", title: "Form Submitted", icon: "heroicons-outline:clipboard-list", tone: "green", filters: [`Form is "Coaching Enquiry"`] }],
    addTrigger: true,
    steps: [{ kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" }],
  },
  consultationGoal: {
    triggers: [{ id: "appointment", title: "Appointment Status", icon: "heroicons-outline:calendar", tone: "primary", filters: [`Status is "Booked"`] }],
    addTrigger: true,
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "goal", label: "Goal Event", icon: "bx:bxs-flag-checkered", tone: "purple" },
    ],
  },
  opportunityRouting: {
    triggers: [{ id: "opportunity-status", title: "Opportunity Status Changed", icon: "heroicons-outline:switch-horizontal", tone: "primary", filters: [`Pipeline is "Sales Pipeline"`] }],
    addTrigger: true,
    steps: [
      { kind: "action", id: "update-opportunity", label: "Update Opportunity", icon: "ant-design:dollar-circle-filled", tone: "primary" },
      { kind: "ifElse", id: "if-else", label: "If / Else", branches: [
        { id: "won", title: "Won", text: `If "Status" is "Won"`, steps: [] },
        { id: "none", title: "None", text: "When none of the conditions are met", steps: [] },
      ] },
    ],
  },
  programApplication: {
    triggers: [{ id: "order-submitted", title: "Order Submitted", icon: "heroicons-outline:clipboard-list", tone: "primary", filters: [`Form is "Program Application"`] }],
    addTrigger: true,
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "create-opportunity", label: "Create Opportunity", icon: "ant-design:dollar-circle-filled", tone: "primary" },
      { kind: "action", id: "send-email", label: "Send Email", icon: "heroicons-solid:mail-open", tone: "green" },
    ],
  },
  // Lead Management | Priority Assignment (the linked-workflows story, film 185.9–189.14 s): each lane hands off to another
  priorityAssignment: {
    triggers: [{ id: "contact-changed", title: "Contact Changed", name: "Lead Priority Updated", icon: "heroicons-outline:users", tone: "primary", filters: ["Lead Priority has changed"] }],
    addTrigger: true,
    steps: [{ kind: "ifElse", id: "route", label: "Route leads by priority", branches: [
      { id: "high", title: "High Priority", text: `If "Lead Priority" is "High"`, steps: [{ kind: "action", id: "start-high", label: "Start high-priority nurturing", icon: "entypo:add-to-list", tone: "purple" }] },
      { id: "medium", title: "Medium Priority", text: `If "Lead Priority" is "Medium"`, steps: [{ kind: "action", id: "start-medium", label: "Start medium-priority nurturing", icon: "entypo:add-to-list", tone: "purple" }] },
      { id: "low", title: "Low Priority", text: `If "Lead Priority" is "Low"`, steps: [{ kind: "action", id: "start-low", label: "Start low-priority nurturing", icon: "entypo:add-to-list", tone: "purple" }] },
      { id: "not-set", title: "Priority Not Set | Review", text: "When none of the conditions are met", steps: [{ kind: "action", id: "review", label: "Review lead priority before nurture", icon: "ic:round-sticky-note-2", tone: "primary" }] },
    ] }],
  },
  // Jordan's runs, as Workflow Maps' run view draws them (Troubleshoot, film 128.7–153.5 s)
  runApplication: {
    triggers: [{ id: "order-submitted", title: "Order Submitted", icon: "heroicons-outline:clipboard-list", tone: "primary", filters: [] }],
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "create-opportunity", label: "Create Opportunity", icon: "ant-design:dollar-circle-filled", tone: "primary" },
      { kind: "ifElse", id: "if-else", label: "Qualified applicant?", branches: [
        { id: "yes", title: "Qualified", text: `If "Qualified" is "Yes"`, steps: [{ kind: "action", id: "send-email", label: "Send Email", icon: "heroicons-solid:mail-open", tone: "green" }] },
        { id: "none", title: "None", text: "When none of the conditions are met", steps: [{ kind: "action", id: "add-to-workflow", label: "Add to Workflow", icon: "entypo:add-to-list", tone: "purple" }] },
      ] },
    ],
  },
  runTagEnquiries: {
    triggers: [{ id: "contact-tag", title: "Contact Tag", icon: "heroicons-outline:tag", tone: "primary", filters: [] }],
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "send-sms", label: "Send SMS", icon: "heroicons-solid:chat-alt", tone: "green" },
    ],
  },
  runPayment: {
    triggers: [{ id: "payment-received", title: "Payment Received", icon: "heroicons-outline:clipboard-list", tone: "primary", filters: [] }],
    steps: [
      { kind: "action", id: "add-contact-tag", label: "Add Contact Tag", icon: "heroicons-solid:tag", tone: "primary" },
      { kind: "action", id: "send-email", label: "Send Email", icon: "heroicons-solid:mail-open", tone: "green" },
      { kind: "action", id: "grant-access", label: "Grant Course Access", icon: "entypo:add-to-list", tone: "purple" },
    ],
  },
};

/** Final lockup. */
export const LOCKUP = { name: "Workflow", accent: "Maps", badge: "BETA", tagline: "See every connection.", cta: "Live in Labs · Enable it today" };

/** Drops: the window punches in on the drop, title cards kick on the wall of sound that follows (measured onsets). */
export const DROPS = [54.3, 100.86, 122.2, 147.41, 166.32];
export const WALLS = [101.24, 147.79];

/** Moments that get a white flash. */
export const FLASHES = [M.D1, M.HIT, M.D2, M.D3, M.LOGO];

/** First passage, sourced from the supplied staging location (20 October 2026). */
export const STRUCTURE_OPENING = {
  end: 31.01,
  progress: ["Folders", "Workflows", "Assets", "Exact step"],
  folder: "01 · Lead Capture",
  workflow: "Program Application Submitted",
  workflowNames: ["Program Application Submitted", "New Enquiry Form Submitted", "Program Payment Received", "Tag New Enquiries", "Training Video Engagement"],
  assetNames: ["Program Application", "Coaching Program", "Coaching Program Application", "Coaching Program Enrolment"],
  ui: { back: "Workflows list", title: "Workflow Maps", beta: "BETA", help: "Help", save: "Save", published: "Published", draft: "Draft", tags: "Tags", forms: "Forms", pipelines: "Pipelines", sameFolders: "Same folders.", sameWorkflows: "Same workflows.", connected: "Every connection." },
  folders: [
    "01 · Lead Capture", "02 · Consultation Booking", "03 · Sales Pipeline",
    "04 · Client Onboarding & Learning", "05 · Retention & Feedback",
  ],
  captions: [
    { a: 0, b: 3.2, title: "From your workflows list…", detail: "The folders you already know." },
    { a: 3.2, b: 5.8, title: "…to one connected map.", detail: "Your workflows, folders and assets, together." },
    { a: 5.8, b: 11.2, title: "Your folders become islands.", detail: "The same structure. A new perspective." },
    { a: 11.2, b: 16.2, title: "Blue nodes are your workflows.", detail: "Each workflow lives inside its folder." },
    { a: 16.2, b: 21.3, title: "Smaller nodes are the assets they use.", detail: "Connected to the workflows that depend on them." },
    { a: 21.3, b: 26.5, title: "Select a workflow. See what’s inside.", detail: "Program Application Submitted · 4 assets" },
    { a: 26.5, b: 31.01, title: "Follow an asset to the exact step.", detail: "Program Application → Order Submitted trigger" },
  ],
  labels: {
    folders: "Same folders as your list",
    folderCount: "5 workflows · 9 assets",
    workflows: "Workflow",
    assets: "Assets used in this workflow",
    page: "Program Application",
    product: "Coaching Program",
    funnel: "Coaching Program Application",
    enrolment: "Coaching Program Enrolment",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// After the intro: "say, then show". Each card freezes the scene at `at` (seconds on the timeline above) behind a
// statement; then the visual plays on its own at `speed` until the next card. Everything above keeps its times; the
// renderer maps the output time onto them with editTime(). The music under this part is a placeholder.
// ─────────────────────────────────────────────────────────────────────────────
/** `top`: the line sits above the window (the scene pauses briefly while it lands, then plays under it) instead of a full card. */
/** `end`: play only to this timeline time, then cut to the next card. `panels`: instead of a card, a multi-panel shot
 * (PANELS). `clip`: instead of a card, a stretch of film shown in the window ([from, to] film seconds; film = timeline − 3.9).
 * `atOut`: this shot starts at that output (music) time; the play before it is stretched or squeezed to land there. */
export type FeatureCard = { at: number; kicker: string; html: string; hold?: number; speed?: number;
  /** a plain cut to `at` in the film: nothing shown, no hold */
  cut?: boolean;
  /** clip cards: play the clip at this rate (default 1) */
  clipRate?: number;
  /** top lines: leave after this many output seconds instead of at the next card */
  lineFor?: number;
  /** hold over the previous film clip's last frame (receded, with its callout) instead of the app window */
  over?: boolean; top?: boolean; build?: boolean; end?: number; panels?: keyof typeof PANELS; clip?: [number, number]; atOut?: number;
  /** clip cards: `callout` shows the text in the footage at that window point (by the cursor), line by line, instead of as a
   * top line; `pop` makes it a title that pops in at that clip second instead */
  callout?: [number, number]; pop?: number;
  /** clip cards: hold the clip's first frame instead of playing it (for `hold` s) */
  still?: boolean;
  /** a hold that plays "Plan it" (builder/PlanAssets.tsx) in the app window, from `plan[0]` to `plan[1]` s of that shot */
  plan?: [number, number];
  /** clip cards: a callout whose pointer's tip touches (x, y) in window px, on that card edge (`ax`: tip from the card's left) */
  calloutTip?: { x: number; y: number; side: "top" | "bottom" | "left" | "right"; ax?: number } };
const g = (s: string) => `<span class="grad-text">${s}</span>`;
/** "How the map works" (timeline 58.15–67.65): the window shrinks to the right on a zoomed map while the left panel walks
 * the steps, and each list item flies across and lands where its node appears in the film. Times are seconds from `at` and
 * must match the film's map scene (BL / islAt there). World positions are the map's (shared-body.js). */
export const BUILD = {
  at: 58.15, end: 67.65, speed: 0.6,
  win: { left: 680, top: 214, width: 1180 },
  cams: [{ wx: 5.0, wz: 4.2, sx: 834, sy: 486, z: 0.62 }, { wx: 5.2, wz: 4.3, sx: 900, sy: 470, z: 0.86 }],
  steps: [
    { a: 0.6, label: "Folders become islands", head: "Workflows list · Home", count: "7 folders" },
    { a: 2.95, label: "Workflows become blue nodes", head: "01 · Lead Capture", count: "5 workflows" },
    { a: 5.75, label: "Assets become coloured nodes", head: "What Lead Capture’s workflows use", count: "" },
  ],
  done: 8.7, release: [8.95, 9.5] as [number, number],
  // [step, name, land time, world x, y, z, colour, kind]
  items: [
    ...([["01 · Lead Capture", "#3b82f6", [0, 0, 10, 8]], ["02 · Consultation Booking", "#14b8a6", [11.5, 0, 18, 5.5]], ["03 · Sales Pipeline", "#a855f7", [0, -7.5, 8, -1.5]],
      ["04 · Client Onboarding & Learning", "#22c55e", [9.5, -7, 17.5, -1.5]], ["05 · Retention & Feedback", "#f97316", [-7.5, 0, -1.5, 6]],
      ["07 · Contact Segmentation", "#06b6d4", [0, 9.5, 7, 15]], ["08 · Tag-Based Routing", "#f43f5e", [-7, 7.5, -1.5, 13]]] as [string, string, number[]][])
      .map(([n, c, r], i) => ({ step: 0, name: n, land: 1.25 + 0.28 * i, x: (r[0] + r[2]) / 2, y: 0, z: (r[1] + r[3]) / 2, color: c, kind: "folder" })),
    ...([["Program Application Submitted", 3.95, 5.2, 3.6], ["Tag New Enquiries", 4.25, 8.5, 6.3], ["New Enquiry Form Submitted", 4.55, 1.8, 6.2],
      ["Program Payment Received", 4.85, 8.3, 1.3], ["Training Video Engagement", 5.15, 1.9, 1.4]] as [string, number, number, number][])
      .map(([n, l, x, z]) => ({ step: 1, name: n, land: l, x, y: 0.45, z, color: "#2455d6", kind: "workflow" })),
    // assets, grouped under the workflow that uses them (staging: Tag New Enquiries uses the follow-up tag and the Coaching
    // Enquiry form); tag first, then form, then funnel
    ...([["follow-up", "Tag", "#a855f7", 6.75, 9.3, 4.3, "Tag New Enquiries"], ["Coaching Enquiry", "Form", "#14b8a6", 7.35, 6.2, 5.2, "Tag New Enquiries"],
      ["Coaching Program Application", "Funnel", "#f97316", 7.95, 7.5, 3.9, "Program Application Submitted"]] as [string, string, string, number, number, number, string][])
      .map(([n, k, c, l, x, z, w]) => ({ step: 2, name: n, land: l, x, y: 0.25, z, color: c, kind: k, group: w })),
  ],
};
/** The film's first frame of the Workflow canvas in scene "lm" (frame 5675; at 189.14 the decoder can still return the builder). */
const LM_CANVAS = 5675 / 30;
/** Where the film's "orgdoc" scene starts (film seconds; frame 6245, right after "lm"). */
const ORGDOC = 6245 / 30;
/** The Organise title's hold (s): sized so the picture loses MUSIC_CUT's length (see MUSIC_CUT). */
const HOLD_ORG = 3.727;
/** The Assistant acting on the map (film scene "act", appended after "orgdoc"): its start and length in the film. */
const ACT = 7084 / 30, ACT_LEN = 22.66;
/** "Plan it" (FEATURE_CARDS) is this much longer than the film play it replaced (6 bars): everything after it moves on by
 * this much, the shots landed on the music included. The soundtrack isn't moved yet (it is to be edited separately). */
export const PLAN_INSERT = 6 * 1.9375;
/** The Plan it shot: its length (the replaced play, (72.3 − 67.9) / 0.85 + 0.8 + (73.93 − 72.3) / 1.25, plus PLAN_INSERT), where
 * the asset part starts, and the film frame of the map page it is drawn over. */
export const PLAN_SHOT = { len: (72.3 - 67.9) / 0.85 + 0.8 + (73.93 - 72.3) / 1.25 + PLAN_INSERT, split: 9.5, film: 64.24 };
/** The second drop of the music (output time): the hand-off lines draw in across the whole map on it. */
export const LINKS_DROP = 100.86 + PLAN_INSERT;
/** How fast the visual plays after a card; the errors visual plays calmer (it took over the time of a card). */
/** LOOP_CUT's length (8 bars): declared here because the errors cards above the window use it. */
const LOOP_CUT_LEN = 8 * 1.9375;
const PLAY_SPEED = 0.85, ERRORS_HOLD = 0.5;
/** The errors visual's lines (timeline s: film + 3.9): the run opens (ERRORS_JUMP), the modal closes on the map for the deleted
 * asset (ERRORS_DELETED), and where the visual ends: the old stretch from the drop to "Ask your map anything." (the visual at
 * 0.85 with its 2.6 s, 1.99 s and 2.02 s cards and the deleted-assets shot) minus LOOP_CUT's 8 bars and the opening hold. */
const ERRORS_JUMP = 149.9, ERRORS_DELETED = 151.95;
const ERRORS_END = M.D3 + ((163.15 - M.D3) / PLAY_SPEED + 2.6 + 1.99 + 2.02 - LOOP_CUT_LEN - ERRORS_HOLD) * PLAY_SPEED;
export const FEATURE_CARDS: FeatureCard[] = [
  // how the map works: the list is built into the map beside a shrunk window (BUILD; film scene "map"), no card
  { at: BUILD.at, kicker: "HOW THE MAP WORKS", html: "", build: true, speed: BUILD.speed, end: BUILD.end + 0.25 },
  // Plan it (user, 2026-10-25): the card, then the product's own panels drawn over the map page (builder/PlanAssets.tsx): a
  // workflow's assets searched to a tag, View step into the preview; then a form's workflows, published and draft. It is
  // PLAN_INSERT longer than the film play it replaced; the music is to be edited to match (6 bars inserted before 1:18).
  // The app window itself shows the shot (AppWindow.tsx), so it comes forward out of the card like any other visual.
  { at: 67.9, kicker: "PLAN IT", html: `Select a workflow. See what’s inside, ${g("down to the exact trigger.")}`, end: 67.9 },
  { at: 67.9, kicker: "", html: "", plan: [0, PLAN_SHOT.split], hold: PLAN_SHOT.split, end: 67.9 },
  { at: 73.93, kicker: "PLAN IT", html: `Click any asset. See ${g("everywhere it’s used.")}`, top: true, plan: [PLAN_SHOT.split, PLAN_SHOT.len], hold: PLAN_SHOT.len - PLAN_SHOT.split, end: 73.93 },
  // linked workflows, told as a story (film scene "lm"): on the music's stop (output 1:18) a card, then the builder with an Add to
  // Workflow action, a small push-in and a callout by the cursor (clip A), the "What if" card, then clip B, landed on the soundtrack: the Linked
  // badges pop on the first build-up hit (clip 0.65 s), the hand-off lines draw from the second (4.03 s) and connect on drop 2
  // (8.39 s), where the title pops
  { at: 73.93, kicker: "PLAN IT", html: `Remember having to jump across workflows ${g("to view connections?")}`, hold: 2.32, end: 73.93 },   // hold fixed: the film's clip A is cut to it
  // one frame throughout (user, 2026-10-24): clip B's first frame (the Workflow canvas) held with the callout above Start
  // high-priority nurturing, then held with "What if…" as the top line, then clip B plays on from that same frame
  { at: 73.93, kicker: "PLAN IT", html: `This is an ${g("Add to Workflow")} action.<br/>What happens to the contact ${g("next?")}`, top: true, clip: [LM_CANVAS, LM_CANVAS],
    still: true, hold: 3.28, end: 73.93, calloutTip: { x: 380, y: 701, side: "bottom", ax: 200 } },
  { at: 73.93, kicker: "PLAN IT", html: `What if you could see ${g("all of it in one interface?")}`, top: true, clip: [LM_CANVAS, LM_CANVAS], still: true, hold: 2.47, end: 73.93 },
  { at: 73.93, kicker: "PLAN IT", html: `All your linked workflows. ${g("One canvas.")}`, top: true, clip: [LM_CANVAS, 199.74],
    atOut: LINKS_DROP - 1.6 + 5.5 - 12.41, end: 73.93, pop: 8.51 },
  // straight on (same film, no fade): one contact's journey across the linked workflows. It adds 6.57 s to the video, which
  // puts the "Fix errors fast" title on the soundtrack's loop back to its main drop (output 2:51.99)
  { at: 73.93, kicker: "PLAN IT", html: `Follow one contact ${g("across every workflow.")}`, top: true, clip: [199.74, 208.12], end: 73.93 },
  // search and filter, side by side; then the ORGANISE IT title (timeline 100.6–102.1)
  // Organise, shortened: one main move (drag workflows, then drop a folder into a folder), then the three-panel shot
  // Organise and document (film scene "orgdoc", from ORGDOC): a card; the options as numbered sticky notes on the map (colour,
  // nest, rename); a card held over its last frame; the Lead Management folder documented (its sticky note, then each
  // workflow's note); Jordan through the journey, then Save. Then the TROUBLESHOOT title (timeline 122.05–124.05: from the
  // film's "contact" scene, so the old document scene's Saved canvas views panel never shows behind the fade).
  // the section's title (it replaces the "Make it yours" title card); `hold` also makes the picture lose exactly MUSIC_CUT's
  // length here, with "Find anything, fast." and the Document card gone
  { at: 105.65, kicker: "ORGANISE IT", html: `Organise and document your workflows, ${g("right on the map.")}`, hold: HOLD_ORG, end: 105.65 },
  { at: 105.65, kicker: "ORGANISE IT", html: `Make the map ${g("your own.")}`, top: true, clip: [ORGDOC, ORGDOC + 11.0], end: 105.65 },
  { at: 105.65, kicker: "ORGANISE IT", html: `Notes your whole team reads, ${g("right on the map.")}`, top: true, clip: [ORGDOC + 11.0, ORGDOC + 21.0], end: 105.65 },
  { at: 122.05, kicker: "ORGANISE IT", html: `Notes that tell ${g("the customer journey.")}`, top: true, clip: [ORGDOC + 21.0, ORGDOC + 27.8] },
  { at: 124.05, kicker: "TROUBLESHOOT IT", html: `Pick any contact. See every workflow ${g("they’ve been in.")}` },
  // then it plays (user, 24 Oct: no full-screen cards here, faster): a line over her drawer; clicking her active enrollment cuts
  // to the run (film scene "run", played at full speed, no text); back in the drawer, the Timeline; then a cut to the cleared
  // map for "And when something breaks?". The last cut's `at` puts the drop (M.D3) on the soundtrack's loop back to its main
  // drop (output 2:51.99)
  { at: 126.0, kicker: "TROUBLESHOOT IT", html: `See all their ${g("active and finished workflows.")}`, top: true, hold: 0, end: 128.64 },
  { at: 132.54, kicker: "", html: "", cut: true, end: 140.49, speed: 1 },
  { at: 128.64, kicker: "TROUBLESHOOT IT", html: `Or follow every run ${g("on the timeline.")}`, top: true, hold: 0, end: 132.54, lineFor: 3.1 },
  { at: 144.749, kicker: "", html: "", cut: true },
  // the errors visual (errors/ErrorShots.tsx), its text as lines above the window: on the drop, held 0.5 s, then straight
  // through; the second line as the run opens and the cursor clicks the failed step; the third as the run closes on the same
  // map and the cursor opens a deleted form that workflows still use. It ends at ERRORS_END, 8 bars sooner than the old cut
  // (see LOOP_CUT), straight into "Ask your map anything."
  { at: M.D3, kicker: "WHEN IT BREAKS", html: `Catch it quickly, ${g("right on the map.")}`, top: true, hold: ERRORS_HOLD, speed: PLAY_SPEED, lineFor: 2.4 },
  { at: ERRORS_JUMP, kicker: "WHEN IT BREAKS", html: `Jump straight to the ${g("failed step.")}`, top: true, hold: 0, speed: PLAY_SPEED },
  { at: ERRORS_DELETED, kicker: "WHEN IT BREAKS", html: `Catch deleted assets ${g("still in use.")}`, top: true, hold: 0, speed: PLAY_SPEED, end: ERRORS_END },
  { at: 163.15, kicker: "ASSISTANT", html: `Ask your map ${g("anything.")}` },
  { at: 166.25, kicker: "ASSISTANT", html: `It answers on the map, ${g("down to what to fix first.")}`, speed: 1, end: 173.0 },
  // then it acts (film scene "act"): a card, and three asks applied to the map (find, create a folder, move into it). The clip
  // ends 0.05 s before the lockup (LOGO)
  { at: 173.0, kicker: "ASSISTANT", html: `And it doesn’t just answer. ${g("It does the work.")}`, hold: 2.5, end: 173.0 },
  // played at 0.83 so the lockup (LOGO) lands on the soundtrack's re-entry 36 bars after its drop (file 117.75 s), now that
  // Troubleshoot is shorter (output 4:01.75)
  { at: 174.0, kicker: "ASSISTANT", html: `Ask it to find, create and move, ${g("right on the map.")}`, top: true, clip: [ACT, ACT + ACT_LEN], clipRate: 0.83013, speed: 1 },
];
/** Multi-panel shots: each panel is a crop of the app footage (`src` in film seconds); labels and animations go one after
 * another while all panels stay on screen. `crop` is [x, y, w, h] in window px; `size` is the panel's [w, h]. */
/** `clip`: play that entry of PANEL_CLIPS (cursor-less footage) instead of `src`; `cursor`: one cursor travels the panels in turn. */
export type PanelShot = { dur: number; size: [number, number]; cursor?: boolean; outro?: { at: number; html: string }; panels: { at: number; label: string; src: [number, number]; crop: [number, number, number, number]; clip?: number }[] };
export const PANELS: Record<"trio" | "duo", PanelShot> = {
  // one cursor browses the three panels and does each action in turn (panel footage has no cursor of its own)
  trio: {
    dur: 10.6, size: [600, 469], cursor: true,
    outro: { at: 9.2, html: `All of it, ${g("right on the map.")}` },
    panels: [
      { at: 0.3, label: "Colour-code folders", src: [107.6, 109.5], crop: [560, 250, 620, 485], clip: 0 },
      { at: 2.7, label: "Leave sticky notes", src: [109.5, 112.6], crop: [600, 270, 700, 547], clip: 1 },
      { at: 6.3, label: "Rename workflows", src: [176.5, 178.9], crop: [590, 390, 440, 344], clip: 2 },
    ],
  },
  duo: {
    dur: 7.4, size: [900, 560],
    panels: [
      { at: 0.6, label: "Search anything, fly straight to it", src: [72.5, 76.2], crop: [0, 50, 1240, 772] },
      { at: 2.8, label: "Filter to what matters", src: [76.2, 80.0], crop: [60, 40, 1240, 772] },
    ],
  },
};
/** How long a card holds: enough to read it (≈ 30 ms a character), 1.6–2.6 s, or its `hold`. */
const cardDur = (c: FeatureCard) => (c.hold ?? (c.build || c.cut ? 0 : c.panels ? PANELS[c.panels].dur : c.clip ? (c.clip[1] - c.clip[0]) / (c.clipRate ?? 1) : c.top ? 0.8 : Math.min(2.6, Math.max(1.6, 1.0 + c.html.replace(/<[^>]+>/g, "").length * 0.03))));
type Seg = { n0: number; n1: number; hold: boolean; src: number; speed: number; card?: FeatureCard; until?: number; panels?: keyof typeof PANELS; clip?: [number, number] };
/** The edit, in output time: a hold (card, panel shot or film clip) per entry, then the visual at its speed. */
export const EDIT = (() => {
  const out: Seg[] = [];
  let n = FEATURE_CARDS[0].at;
  FEATURE_CARDS.forEach((c, i) => {
    if (c.atOut != null) {
      // land this shot on its music moment: stretch (or squeeze) the play before it
      const p = out[out.length - 1], span = (p.n1 - p.n0) * p.speed;
      p.n1 = c.atOut; p.speed = span / (c.atOut - p.n0);
      if (out[out.length - 2]?.until) out[out.length - 2].until = c.atOut;
      n = c.atOut;
    }
    const d = cardDur(c);
    out.push({ n0: n, n1: n + d, hold: true, src: c.at, speed: 0, card: c, panels: c.panels, clip: c.clip });
    n += d;
    const next = c.end ?? (i + 1 < FEATURE_CARDS.length ? FEATURE_CARDS[i + 1].at : M.END);
    const sp = c.speed ?? PLAY_SPEED;
    out.push({ n0: n, n1: n + (next - c.at) / sp, hold: false, src: c.at, speed: sp });
    out[out.length - 2].until = c.clip ? n : n + Math.min((next - c.at) / sp, c.lineFor ?? Infinity);   // a top line stays until the next card
    n += (next - c.at) / sp;
  });
  return out;
})();
export const EDIT_END = EDIT[EDIT.length - 1].n1;
/** EDITED_FILE (app-edited-v2) was built before LOOP_CUT. Up to the drop it lines up with the video; through the errors visual
 * (redrawn whole by errors/ErrorShots.tsx, so only the footage's header and left rail show) it holds the frame just after the
 * drop; after the errors visual everything is LOOP_CUT_LEN earlier than when it was built, so it is read that much later.
 * Uncut output time in, uncut output time out. A rebuilt EDITED_FILE makes this the identity. */
const ERRORS_OUT = EDIT.find((s) => s.hold && s.card?.at === M.D3)!.n0, AFTER_ERRORS_OUT = EDIT.find((s) => s.hold && s.src === 163.15)!.n0;
/** Plan it's moment at output time `tn`, or null: its first frame under the card before it, its last under the card after it
 *  (so the window recedes and comes forward on the shot itself), the shot's own time in between. */
const PLAN_P1 = EDIT.find((s) => s.hold && s.card?.plan?.[0] === 0)!, PLAN_CARD_OUT = EDIT[EDIT.indexOf(PLAN_P1) + 4]!;
const PLAN_FROM = EDIT[EDIT.indexOf(PLAN_P1) - 2]!.n0, PLAN_TO = EDIT[EDIT.indexOf(PLAN_CARD_OUT)].n1;
export const planTime = (tn: number) => (tn < PLAN_FROM || tn >= PLAN_TO ? null : Math.min(PLAN_SHOT.len, Math.max(0, tn - PLAN_P1.n0)));
/** …and after Plan it, everything is PLAN_INSERT later than when the footage was built, so it is read that much earlier. */
const PLAN_END_OUT = EDIT.find((s) => s.hold && s.card?.plan?.[1] === PLAN_SHOT.len)!.n1;
const builtTime = (tn: number) => (tn < PLAN_END_OUT ? tn : tn - PLAN_INSERT);
export const editedFootageTime = (tn: number) => {
  const b = builtTime(tn), e0 = builtTime(ERRORS_OUT), e1 = builtTime(AFTER_ERRORS_OUT);
  return b < e0 ? b : b < e1 ? e0 + 0.1 : b + LOOP_CUT_LEN;
};
/** The soundtrack is one file: public/music-workflow-maps.mp3 ("Workflow Maps Audio", 174.4 s): "Percussion Drums" (Infraction,
 * no-copyright) under the intro, then the original track from 32.469 s on, unedited, so its first drop is at 47.989 s.
 * The video is synced to it: the intro cut below ends where the timeline's drop (M.D1) lands exactly on that drop, and
 * since the track after it is the original, every later drop and marker stays on its beat. */
export const MUSIC = {
  file: "music-workflow-maps.mp3",
  originalAt: 32.4692,                // where the original starts in the file (sample-matched)
  drop: 32.4692 + 15.52,              // 47.989 s: the main drop, in the file
  /** the original fades out from ~140 s of itself; 64 bars after the drop (171.99 s in the file) it jumps back to the drop */
  loopAfter: 32.4692 + 15.52 + 64 * 1.9375,
};
/** Cut from the intro (timeline = music-intro2 time here): "Now multiply that by a hundred" and its grid, plus 0.47 s of the
 * still frame before it, so that output time = timeline − CUT_LEN puts M.D1 on the soundtrack's drop. Output time before the
 * cut is unchanged; `tn` everywhere else in the code is the uncut ("music-intro2") output time. */
/** A cut in the soundtrack after the intro, in music-file seconds (= output seconds before it): 5 bars from bar 29 after the drop
 * are skipped, so "Find anything, fast." could go. The picture loses the same 9.6875 s (that card, its play and the Document card
 * gone; the Organise title's hold makes up the rest), so everything after, the loop back to the drop and the lockup on the
 * track's re-entry included, stays on the music. */
export const MUSIC_CUT: [number, number] = [MUSIC.drop + 29 * 1.9375, MUSIC.drop + 34 * 1.9375];
/** A second cut, after the loop back to the drop (bars counted from the drop, music-file s): bars 4–12 of the errors section
 * are skipped, and the errors visual (with deleted assets folded in) is 8 bars shorter to match (ERRORS_END), so everything
 * after stays on the music. */
export const LOOP_CUT: [number, number] = [MUSIC.drop + 4 * 1.9375, MUSIC.drop + 12 * 1.9375];
export const INTRO_CUT: [number, number] = [40.69 - (38.75 - MUSIC.originalAt), 40.69];
export const CUT_LEN = INTRO_CUT[1] - INTRO_CUT[0];
export const uncut = (out: number) => (out < INTRO_CUT[0] ? out : out + CUT_LEN);
export const VIDEO_END = EDIT_END - CUT_LEN;
/** The intro's callout holds, in (uncut) output time. A stretch runs from an intro card's end to the next card (or the intro
 * cut); its holds freeze the scene and the rest of it plays faster by the same amount, so both ends stay where they were.
 * `o0..o1` the callout on screen, `h0..h1` the hold. */
export const INTRO_HOLDS = (() => {
  const ends = [...INTRO_CARDS.map((c) => c.b), 0].sort((x, y) => x - y), starts = [...INTRO_CARDS.map((c) => c.a), INTRO_CUT[0]];
  const groups = new Map<number, IntroCallout[]>();
  INTRO_CALLOUTS.forEach((c) => { const s0 = Math.max(...ends.filter((e) => e <= c.a)); groups.set(s0, [...(groups.get(s0) ?? []), c]); });
  return [...groups].map(([s0, cs]) => {
    const s1 = Math.min(...starts.filter((a) => a > s0)), held = cs.reduce((m, c) => m + c.dur, 0), v = (s1 - s0) / (s1 - s0 - held);
    // output time of a timeline moment in this stretch (before the hold at that moment, if any)
    const out = (T: number) => s0 + (T - s0) / v + cs.filter((c) => c.hold < T).reduce((m, c) => m + c.dur, 0);
    return { s0, s1, v, callouts: cs.map((c) => ({ c, o0: out(c.a), h0: out(c.hold), h1: out(c.hold) + c.dur, o1: out(c.b) })) };
  });
})();
/** Intro output time → timeline time, with the callout holds. */
export const introTime = (tn: number) => {
  const st = INTRO_HOLDS.find((s) => tn >= s.s0 && tn < s.s1);
  if (!st) return tn;
  let o = st.s0, T = st.s0;
  for (const h of st.callouts) {
    if (tn < h.h0) break;
    if (tn < h.h1) return h.c.hold;
    o = h.h1; T = h.c.hold;
  }
  return T + (tn - o) * st.v;
};
/** The intro callout on screen at output time tn, if any. */
export const introCalloutAt = (tn: number) => INTRO_HOLDS.flatMap((s) => s.callouts).find((h) => tn >= h.o0 && tn < h.o1);
/** Output time → timeline time (and the card being held, if any). */
export const editTime = (tn: number): { t: number; seg?: (typeof EDIT)[number] } => {
  if (tn < EDIT[0].n0) return { t: introTime(tn) };
  for (const s of EDIT) if (tn < s.n1) return { t: s.hold ? s.src : s.src + (tn - s.n0) * s.speed, seg: s };
  const last = EDIT[EDIT.length - 1];
  return { t: last.src + (last.n1 - last.n0) * last.speed + (tn - last.n1) };
};
/** Output time of a timeline moment (for things placed on the output, like the music's end). */
export const outTime = (t: number) => {
  for (const s of EDIT) if (!s.hold && t >= s.src && t <= s.src + (s.n1 - s.n0) * s.speed) return s.n0 + (t - s.src) / s.speed;
  return t < EDIT[0].n0 ? t : EDIT_END + (t - M.END);
};

// ─────────────────────────────────────────────────────────────────────────────
// The Assistant (ASSISTANT cards above): what its panel says, in the product's own words where the product supplies them
// (automation-workflows-frontend en.json `workflow.grid.assistant`, master). Replies are written for the film's map.
// `**bold**` marks the reply's bold runs; a block that is an array is a bullet list.
// ─────────────────────────────────────────────────────────────────────────────
export type ChatBlock = string | string[];
export type PlanStep = { label: string; reason?: string };
export type ChatPlan = { steps: PlanStep[]; reasons: string[]; undoable?: boolean; offer?: boolean };
export const ASSISTANT = {
  title: "Chat",
  placeholder: "Summarize, explain, or troubleshoot",
  empty: {
    title: "What should we work on?",
    description: "Ask about your workflows, find issues, or make changes to your map.",
    useCases: "Popular use cases",
    hint: "Questions send right away. Requests to make changes open as an editable prompt first.",
    // MAPS_EMPTY_TILES order (maps-empty-state.ts)
    tiles: [
      { id: "summarize", title: "Map overview", description: "See what's live and what needs attention" },
      { id: "issues", title: "Find what's broken", description: "Find errors and decide what to fix first" },
      { id: "organize", title: "Tidy into folders", description: "Group related workflows in a folder" },
      { id: "cleanup", title: "Clear the clutter", description: "Find unused workflows and empty folders" },
      { id: "views", title: "Save a view", description: "Keep a filtered view for later" },
      { id: "chain", title: "Launch a webinar funnel", description: "Build registration and follow-up workflows" },
      { id: "build", title: "Build a workflow", description: "Start with a welcome email and SMS" },
    ],
  },
  reviewFirst: "Review first",
  editHistory: "Edit History",
  askingAbout: "Asking about",
  clearChat: "Clear chat",
  working: "Working",
  progress: { title: "Processing", stage: "Researching", steps: [["COMPLETE", "Reading your account"], ["RESEARCHING", "Analysing results..."]] as [string, string][] },
  plan: { review: "Review changes", done: "Changes made", hint: "Check the details below before continuing.", cancel: "Cancel", apply: "Apply",
    notNow: "Not now", showOnMap: "Show on map", undo: "Undo", running: "Running" },
  /** "Ask your map anything": the Map overview tile, then the answer and the fix it offers. */
  ask: {
    prompt: "Summarize my map: what's live, what's in draft, and what needs attention.",
    thought: "Thought for 2.4s",
    answer: [
      "**Overview:**\nYou have 20 workflows: 16 published and 4 drafts, across 7 folders.",
      "**Busiest workflows (last 30 days):**",
      ["“Tag New Enquiries” in “01 · Lead Capture”", "“Program Application Submitted” in “01 · Lead Capture”"],
      "**Needs attention:**",
      ["1 workflow with errors: “Program Payment Received”",
        "1 deleted user still used in “wait for tag”", "4 drafts, including “Course Access Removed”"],
      "Fix “Program Payment Received” first: it’s live and its runs are failing.",
    ] as ChatBlock[],
    offer: { steps: [{ label: "Focus on 1 item", reason: "The workflow with errors: Program Payment Received." }],
      reasons: ["Suggested next step"], offer: true, undoable: true } as ChatPlan,
  },
  /** "It does the work": three asks, each reviewed and applied. */
  act: [
    { prompt: "Find all workflows related to the growth foundations course", thought: "Thought for 3.9s",
      reply: "Highlight 5 workflows on the map",
      plan: { steps: [{ label: "Highlight 5 items on the map", reason: "Highlights workflows using the Growth Foundations Access membership offer." }],
        reasons: ["Check the plan first"], undoable: true } as ChatPlan,
      after: "Highlighted 5 workflows using the “Growth Foundations Access” membership offer, across 4 folders." },
    { prompt: "Create a new folder called growth foundations", thought: "Thought for 2.8s",
      reply: "Create folder “growth foundations”",
      plan: { steps: [{ label: "Create folder “growth foundations”", reason: "You asked for a new folder called growth foundations." }],
        reasons: ["Ask before acting is on", "Writes to the server", "Check the plan first", "Needs your review"] } as ChatPlan,
      after: "Created the folder “growth foundations”." },
    { prompt: "Move all these workflows into the folder", thought: "Thought for 4.2s",
      reply: "Move 5 workflows into “growth foundations”",
      plan: { steps: [{ label: "Move 5 workflows to “growth foundations”", reason: "Moves the 5 workflows using the Growth Foundations Access membership offer into growth foundations." }],
        reasons: ["Ask before acting is on"], undoable: true } as ChatPlan,
      after: "The 5 workflows are now in “growth foundations”." },
  ],
  /** the map's own notices (en.json workflow.grid.feedback / edit) */
  toast: {
    folderCreated: "Created a folder",
    folderCreatedNext: "The folder was created and saved immediately. You can rename it or move workflows into it. Creating the folder can’t be undone.",
    moved: "Moved 5 workflows into growth foundations", unsaved: "Your changes aren’t saved yet. Select Save to keep them.",
    saved: "Map changes saved", savedNext: "Saved changes cannot be undone.",
  },
  saveChanges: "Save 1 change",
};

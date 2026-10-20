// ─────────────────────────────────────────────────────────────────────────────
// The video's script: music markers, beats (one footage clip each) and every
// piece of on-screen text with its timing. Times are seconds on the edited track.
// Edit this file to change wording or timing; the components read from here.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;

/** Music markers on public/music.mp3 (123 BPM, one bar = 1.9375 s). */
export const M = {
  BAR: 1.9375,
  D1: 15.52, // first drop: list page → map
  STOP: 44.08, // music stops
  HIT: 44.56, // hit after the stop
  B2: 45.15, // build towards drop 2
  SIL: 52.19, // silence before drop 2
  D2: 52.88, // second drop: value section
  GAP: 96.93, // "one more thing" gap
  D3: 99.33, // third drop: colour
  FIN: 112.9, // finale
  LOGO: 126.19, // logo lockup
  END: 131.9,
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
const APP: Footage = { file: "app-motion-v4.mp4" }; // one Claude Motion film for the whole app track, 3.90–131.90 s
export const BEATS: { id: string; label: string; start: number; end: number; footage?: Footage }[] = [
  { id: "01-intro", label: "Intro", start: 0, end: 3.9 },
  { id: "02-list", label: "Problem: tab after tab", start: 3.9, end: M.D1, footage: { ...APP, from: 3.9 - 3.9 } },
  { id: "03-drop", label: "Drop: Workflow Maps", start: M.D1, end: 19.39, footage: { ...APP, from: M.D1 - 3.9 } },
  { id: "04-introducing", label: "One map", start: 19.39, end: 23.27, footage: { ...APP, from: 19.39 - 3.9 } },
  { id: "05-assets", label: "Plan: structure", start: 23.27, end: 27.13, footage: { ...APP, from: 23.27 - 3.9 } },
  { id: "06-steps", label: "Plan: inside a workflow", start: 27.13, end: 31.01, footage: { ...APP, from: 27.13 - 3.9 } },
  { id: "07-usage", label: "Plan: asset usage", start: 31.01, end: 34.88, footage: { ...APP, from: 31.01 - 3.9 } },
  { id: "08-folders", label: "Plan: linked workflows", start: 34.88, end: 38.75, footage: { ...APP, from: 34.88 - 3.9 } },
  { id: "09-search", label: "Plan: search", start: 38.75, end: 42.1, footage: { ...APP, from: 38.75 - 3.9 } },
  { id: "10-filter", label: "Plan: filter", start: 42.1, end: M.B2, footage: { ...APP, from: 42.1 - 3.9 } },
  { id: "11-build", label: "Build to drop 2", start: M.B2, end: M.D2, footage: { ...APP, from: M.B2 - 3.9 } },
  { id: "12-linked", label: "Organise: cleanup, drag, nest", start: M.D2, end: 63.35, footage: { ...APP, from: M.D2 - 3.9 } },
  { id: "13-errors", label: "Organise: colour, notes, save, views", start: 63.35, end: 74.18, footage: { ...APP, from: 63.35 - 3.9 } },
  { id: "14-journey", label: "Troubleshoot: pick a contact", start: 74.18, end: 84.68, footage: { ...APP, from: 74.18 - 3.9 } },
  { id: "15-organise", label: "Troubleshoot: the run", start: 84.68, end: M.GAP, footage: { ...APP, from: 84.68 - 3.9 } },
  { id: "16-gap", label: "One more thing", start: M.GAP, end: M.D3, footage: { ...APP, from: M.GAP - 3.9 } },
  { id: "17-colour", label: "Troubleshoot: errors", start: M.D3, end: 105.14, footage: { ...APP, from: M.D3 - 3.9 } },
  { id: "18-notes", label: "Troubleshoot: failed step, deleted asset", start: 105.14, end: M.FIN, footage: { ...APP, from: 105.14 - 3.9 } },
  { id: "19-finale", label: "Finale", start: M.FIN, end: M.END, footage: { ...APP, from: M.FIN - 3.9 } },
];

/** Big headlines. `top`/`size` in px; `center` spans the full width. */
export const HEADLINES: { a: number; b: number; html: string; top: number; size: number; center?: boolean }[] = [
  { a: 1.75, b: 3.85, html: `Your agency runs on<br/><span class="grad-text">hundreds of workflows.</span>`, top: 440, size: 96 },
  { a: M.GAP + 0.45, b: M.D3 - 0.02, html: `One more <span class="grad-text">thing…</span>`, top: 440, size: 96 },
  { a: M.FIN + 0.1, b: 116.2, html: `From tab after tab…`, top: 40, size: 64, center: true },
  { a: 118.46, b: 122.4, html: `…to <span class="grad-text">one map.</span>`, top: 40, size: 64, center: true },
  { a: 122.6, b: 126.0, html: `See every <span class="grad-text">connection.</span>`, top: 40, size: 64, center: true },
];

/** Captions centred above the window. */
export const CAPTIONS: { a: number; b: number; html: string }[] = [
  // the problem
  { a: 4.5, b: 7.6, html: `Every answer lives in a <span class="grad-text">different workflow.</span>` },
  { a: 7.8, b: 9.45, html: `Tab after tab <span class="grad-text">after tab.</span>` },
  { a: 13.5, b: M.D1 - 0.05, html: `What if you could <span class="grad-text">see it all?</span>` },
  // one map (after the title explodes and clears on the 17.67 s hit)
  { a: 17.67, b: 21.2, html: `Every workflow. Every asset. <span class="grad-text">One map.</span>` },
  { a: 21.37, b: 23.1, html: `Built from the workflows <span class="grad-text">you already have.</span>` },
  // Plan
  { a: 23.3, b: 24.4, html: `Your folders become <span class="grad-text">islands.</span>` },
  { a: 24.45, b: 25.75, html: `Blue nodes are your <span class="grad-text">workflows.</span>` },
  { a: 25.8, b: 27.05, html: `Smaller nodes are the <span class="grad-text">assets they use.</span>` },
  { a: 27.4, b: 29.2, html: `Select a workflow. <span class="grad-text">See what’s inside.</span>` },
  { a: 29.4, b: 30.9, html: `Down to the <span class="grad-text">exact trigger.</span>` },
  { a: 31.2, b: 34.7, html: `Click any asset. See <span class="grad-text">everywhere it’s used.</span>` },
  { a: 35.0, b: 38.6, html: `See how workflows <span class="grad-text">hand off to each other.</span>` },
  { a: 38.9, b: 41.9, html: `Search anything. <span class="grad-text">Fly straight to it.</span>` },
  { a: 42.2, b: 44.0, html: `Filter to <span class="grad-text">what matters.</span>` },
  // Organise
  { a: 54.8, b: 56.2, html: `Find what you <span class="grad-text">don’t use.</span>` },
  { a: 56.3, b: 57.7, html: `Clean up <span class="grad-text">in bulk.</span>` },
  { a: 57.9, b: 60.2, html: `Drag workflows <span class="grad-text">where they belong.</span>` },
  { a: 60.5, b: 63.2, html: `Drop folders <span class="grad-text">into folders.</span>` },
  { a: 63.6, b: 65.5, html: `Colour-code <span class="grad-text">folders.</span>` },
  { a: 65.7, b: 68.7, html: `Leave notes <span class="grad-text">for your team.</span>` },
  { a: 68.9, b: 70.9, html: `Notes from the builder <span class="grad-text">show up too.</span>` },
  { a: 71.1, b: 72.8, html: `Save once. <span class="grad-text">Everyone sees it.</span>` },
  { a: 73.0, b: 74.1, html: `Save views to <span class="grad-text">come back to.</span>` },
  // Troubleshoot
  { a: 76.3, b: 77.9, html: `Pick any <span class="grad-text">contact.</span>` },
  { a: 78.1, b: 81.2, html: `See every workflow <span class="grad-text">they’ve been in.</span>` },
  { a: 81.4, b: 84.5, html: `Every run, <span class="grad-text">newest first.</span>` },
  { a: 85.0, b: 87.8, html: `Open any run. See the <span class="grad-text">exact path.</span>` },
  { a: 88.1, b: 91.2, html: `There’s the email <span class="grad-text">Jordan got.</span>` },
  { a: 92.3, b: 96.6, html: `Step from <span class="grad-text">run to run.</span>` },
  { a: 100.9, b: 103.0, html: `Spot what needs <span class="grad-text">attention.</span>` },
  { a: 104.2, b: 107.0, html: `See exactly which <span class="grad-text">runs failed.</span>` },
  { a: 107.4, b: 110.0, html: `Jump straight to the <span class="grad-text">failed step.</span>` },
  { a: 110.3, b: 112.8, html: `Catch deleted assets <span class="grad-text">still in use.</span>` },
];

/** Chapter pills top-left of the window. `n` is the badge text. */
export const CHAPTERS: { a: number; b: number; n: string; text: string }[] = [
  { a: 23.27, b: 27.0, n: "1", text: "Plan · Every workflow, with its assets" },
  { a: 27.13, b: 30.9, n: "2", text: "Plan · Down to the exact step" },
  { a: 31.01, b: 34.8, n: "3", text: "Plan · Everywhere an asset is used" },
  { a: 34.88, b: 38.6, n: "4", text: "Plan · Linked workflows" },
  { a: 38.75, b: 42.0, n: "5", text: "Plan · Search across your map" },
  { a: 42.1, b: 44.5, n: "6", text: "Plan · Filter to what matters" },
  { a: M.D2 + 1.3, b: 74.0, n: "★", text: "Organise" },
  { a: 75.5, b: 96.8, n: "★", text: "Troubleshoot · Contact journey" },
  { a: M.D3 + 1.3, b: 112.7, n: "★", text: "Troubleshoot · Errors" },
];

/** Full-screen title cards (the window recedes behind them). */
export const TITLE_CARDS: { a: number; b: number; kicker: string; html: string }[] = [
  { a: M.D2, b: M.D2 + 1.25, kicker: "ORGANISE IT", html: `Make it <span class="grad-text">yours</span>` },
  { a: 74.18, b: 75.45, kicker: "TROUBLESHOOT IT", html: `Trace any <span class="grad-text">contact</span>` },
  { a: M.D3, b: M.D3 + 1.25, kicker: "AND WHEN IT BREAKS", html: `Fix <span class="grad-text">errors</span> fast` },
];

/** The first drop: "Workflow Maps" explodes on the drop (15.55 s, measured onset), kicks again on the wall of
 * sound (15.82 s) and clears in the break (17.14 s) so the map takes over on the 17.67 s hit. */
export const TITLE_DROP = { at: 15.55, wall: 15.82, out: 17.14 };
/** Particle bursts on the other big hits (measured onsets). */
export const BURSTS = [
  { at: 53.0, x: 960, y: 540, n: 44, p: 760 },
  { at: 74.34, x: 960, y: 540, n: 36, p: 660 },
  { at: 99.55, x: 960, y: 540, n: 44, p: 760 },
  { at: 118.46, x: 960, y: 600, n: 54, p: 900 },
  { at: 126.22, x: 960, y: 520, n: 60, p: 980 },
];
/** Intro pain lines, each on a hit; the window recedes behind them. */
export const PAINS = {
  from: 9.6, to: 13.4,
  lines: [
    { at: 9.62, word: "Plan", line: "Which workflow fires first?" },
    { at: 10.72, word: "Organise", line: "Hundreds of workflows. One flat list." },
    { at: 12.05, word: "Troubleshoot", line: "What broke, and why?" },
  ],
};
/** Window jolts on the scramble's hits. */
export const SHAKES = [7.8, 8.17, 8.54, 8.9, 9.26];

/** The three lines of the build before drop 2, one per bar from 47.05 s. */
export const BUILD_LINES = ["Plan it.", "Organise it.", "Troubleshoot it."];
export const BUILD_LINES_START = 47.05;

/** Client message bubble: shown in the build, then again top-right during the journey. */
export const MESSAGE = { who: "Client · Summit Shield", initials: "SS", text: "Why did Jordan get this email?", answeredAt: 91.2, from: 75.5, to: 96.9 };

/** Browser tabs that pile up above the window ("tab hell"). */
export const TABS = {
  // one tab per workflow opened, on the intro's hits; they stay until the implosion at 13.6 s
  times: [5.9, 7.0, 7.8, 8.17, 8.54, 8.9, 9.26, 9.62, 10.1, 10.72, 11.4, 12.05, 12.41, 12.89],
  b: 13.6,
  names: ["Program Application Submitted", "Tag New Enquiries", "Program Payment Received", "Consultation Booking Goal", "Grant Course Access", "contact tag - form 7", "Opportunity Status Routing", "Sales Stage Follow-up", "Client Feedback Submitted", "wait for tag", "Course Progress & Completion", "Tag workflow", "no filter tag", "Consultation Status Routing"],
};

/** Final lockup. */
export const LOCKUP = { name: "Workflow", accent: "Maps", badge: "BETA", tagline: "See every connection." };

/** Drops: the window punches in on the drop, title cards kick on the wall of sound that follows (measured onsets). */
export const DROPS = [15.55, 53.0, 74.34, 99.55, 118.46];
export const WALLS = [53.38, 99.93];

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

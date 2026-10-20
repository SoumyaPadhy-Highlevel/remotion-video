// ─────────────────────────────────────────────────────────────────────────────
// The video's script: music markers, beats (one footage clip each) and every
// piece of on-screen text with its timing. Times are seconds on the edited track.
// Edit this file to change wording or timing; the components read from here.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;

/** Music markers on public/music-long.mp3: the uncut track with 12 bars added to the intro (bars 0–3 three times, then 4-5-6-5,
 * then 4–7 into the drop), so everything from the drop on sits 23.25 s later than on music-full.mp3 (123 BPM, one bar = 1.9375 s). */
export const M = {
  BAR: 1.9375,
  D1: 38.77, // first drop: list page → map
  STOP: 67.33, // music stops
  HIT: 67.81, // hit after the stop
  B2: 77.51, // build towards drop 2
  SIL: 84.55, // silence before drop 2
  D2: 85.24, // second drop: value section
  GAP: 129.29, // "one more thing" gap
  D3: 131.69, // third drop: colour
  FIN: 145.26, // finale
  LOGO: 158.55, // logo lockup
  END: 168.3,
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
const APP: Footage = { file: "app-motion-v8.mp4" }; // one Claude Motion film for the whole app track, from 3.90 s
export const BEATS: { id: string; label: string; start: number; end: number; footage?: Footage }[] = [
  { id: "01-intro", label: "Intro", start: 0, end: 3.9 },
  { id: "02-list", label: "Problem: it grew, they connect, nobody can see it", start: 3.9, end: M.D1, footage: { ...APP, from: 3.9 - 3.9 } },
  { id: "03-drop", label: "Drop: Workflow Maps", start: M.D1, end: 42.64, footage: { ...APP, from: M.D1 - 3.9 } },
  { id: "04-introducing", label: "One map", start: 42.64, end: 46.52, footage: { ...APP, from: 42.64 - 3.9 } },
  { id: "05-assets", label: "Plan: structure", start: 46.52, end: 50.38, footage: { ...APP, from: 46.52 - 3.9 } },
  { id: "06-steps", label: "Plan: inside a workflow", start: 50.38, end: 54.26, footage: { ...APP, from: 50.38 - 3.9 } },
  { id: "07-usage", label: "Plan: asset usage", start: 54.26, end: 58.13, footage: { ...APP, from: 54.26 - 3.9 } },
  { id: "08-folders", label: "Plan: linked workflows", start: 58.13, end: 62, footage: { ...APP, from: 58.13 - 3.9 } },
  { id: "09-search", label: "Plan: search", start: 62, end: 65.35, footage: { ...APP, from: 62 - 3.9 } },
  { id: "10-filter", label: "Plan: filter", start: 65.35, end: M.B2, footage: { ...APP, from: 65.35 - 3.9 } },
  { id: "11-build", label: "Build to drop 2", start: M.B2, end: M.D2, footage: { ...APP, from: M.B2 - 3.9 } },
  { id: "12-linked", label: "Organise: cleanup, drag, nest", start: M.D2, end: 95.71, footage: { ...APP, from: M.D2 - 3.9 } },
  { id: "13-errors", label: "Organise: colour, notes, save, views", start: 95.71, end: 106.54, footage: { ...APP, from: 95.71 - 3.9 } },
  { id: "14-journey", label: "Troubleshoot: pick a contact", start: 106.54, end: 117.04, footage: { ...APP, from: 106.54 - 3.9 } },
  { id: "15-organise", label: "Troubleshoot: the run", start: 117.04, end: M.GAP, footage: { ...APP, from: 117.04 - 3.9 } },
  { id: "16-gap", label: "And when something breaks?", start: M.GAP, end: M.D3, footage: { ...APP, from: M.GAP - 3.9 } },
  { id: "17-colour", label: "Troubleshoot: errors", start: M.D3, end: 137.5, footage: { ...APP, from: M.D3 - 3.9 } },
  { id: "18-notes", label: "Troubleshoot: failed step, deleted asset", start: 137.5, end: M.FIN, footage: { ...APP, from: 137.5 - 3.9 } },
  { id: "19-finale", label: "Finale: the Assistant", start: M.FIN, end: M.END, footage: { ...APP, from: M.FIN - 3.9 } },
];

/** Big headlines. `top`/`size` in px; `center` spans the full width. */
export const HEADLINES: { a: number; b: number; html: string; top: number; size: number; center?: boolean }[] = [
  { a: 1.75, b: 3.85, html: `Your agency runs on<br/><span class="grad-text">hundreds of workflows.</span>`, top: 440, size: 96 },
  { a: M.GAP + 0.45, b: M.D3 - 0.02, html: `And when something <span class="grad-text">breaks?</span>`, top: 440, size: 96 },
];

/** Captions centred above the window. */
export const CAPTIONS: { a: number; b: number; html: string }[] = [
  // the problem (borrowed from the Birds-Eye-View deck): it grew, they start each other, they share assets
  { a: 4.1, b: 7.6, html: `It started simple: <span class="grad-text">three workflows.</span>` },
  { a: 7.8, b: 9.6, html: `Then <span class="grad-text">thirty.</span>` },
  { a: 9.75, b: 11.5, html: `Then <span class="grad-text">a hundred.</span>` },
  { a: 11.75, b: 15.35, html: `And they start <span class="grad-text">each other.</span>` },
  { a: 15.55, b: 17.35, html: `One adds a tag. <span class="grad-text">Another starts because of it.</span>` },
  { a: 17.5, b: 19.25, html: `Nobody drew that line. <span class="grad-text">Nothing shows it.</span>` },
  { a: 19.45, b: 23.1, html: `No workflow works alone. <span class="grad-text">Each one touches your assets.</span>` },
  { a: 23.3, b: 25.0, html: `And one asset sits in <span class="grad-text">many workflows.</span>` },
  { a: 25.15, b: 27.0, html: `Change it, and you’re <span class="grad-text">touching all four.</span>` },
  { a: 27.2, b: 29.0, html: `Now multiply that <span class="grad-text">by a hundred.</span>` },
  { a: 29.1, b: 30.9, html: `The only way to know? <span class="grad-text">Open every workflow.</span>` },
  { a: 31.05, b: 32.7, html: `Tab after tab <span class="grad-text">after tab.</span>` },
  { a: 36.75, b: M.D1 - 0.05, html: `What if you could <span class="grad-text">see it all?</span>` },
  // one map (after the title explodes and clears on the 17.67 s hit)
  { a: 40.92, b: 42.6, html: `Every workflow. Every asset. <span class="grad-text">One map.</span>` },
  // Plan: the structure, one bar each (19.43, 21.37, 23.31 s)
  { a: 42.75, b: 44.55, html: `Your folders become <span class="grad-text">islands.</span>` },
  { a: 44.7, b: 46.5, html: `Blue nodes are your <span class="grad-text">workflows.</span>` },
  { a: 46.65, b: 48.4, html: `Smaller nodes are the <span class="grad-text">assets they use.</span>` },
  { a: 48.6, b: 50.35, html: `Colour shows the <span class="grad-text">asset type.</span>` },
  { a: 50.55, b: 52.3, html: `Lines show <span class="grad-text">what uses what.</span>` },
  { a: 52.55, b: 54.65, html: `Select a workflow. <span class="grad-text">See what’s inside.</span>` },
  { a: 54.8, b: 56.65, html: `Down to the <span class="grad-text">exact trigger.</span>` },
  { a: 56.95, b: 60.65, html: `Click any asset. See <span class="grad-text">everywhere it’s used.</span>` },
  { a: 61.05, b: 64.35, html: `Search anything. <span class="grad-text">Fly straight to it.</span>` },
  { a: 64.75, b: 67.25, html: `Filter to <span class="grad-text">what matters.</span>` },
  { a: 68.65, b: 73.85, html: `See how workflows <span class="grad-text">hand off to each other.</span>` },
  // Organise
  { a: 87.16, b: 88.56, html: `Find what you <span class="grad-text">don’t use.</span>` },
  { a: 88.66, b: 90.06, html: `Clean up <span class="grad-text">in bulk.</span>` },
  { a: 90.26, b: 92.56, html: `Drag workflows <span class="grad-text">where they belong.</span>` },
  { a: 92.86, b: 95.56, html: `Drop folders <span class="grad-text">into folders.</span>` },
  { a: 95.96, b: 97.86, html: `Colour-code <span class="grad-text">folders.</span>` },
  { a: 98.06, b: 101.06, html: `Leave notes <span class="grad-text">for your team.</span>` },
  { a: 101.26, b: 103.26, html: `Notes from the builder <span class="grad-text">show up too.</span>` },
  { a: 103.46, b: 105.16, html: `Save once. <span class="grad-text">Everyone sees it.</span>` },
  { a: 105.36, b: 106.46, html: `Save views to <span class="grad-text">come back to.</span>` },
  // Troubleshoot
  { a: 108.66, b: 110.26, html: `Pick any <span class="grad-text">contact.</span>` },
  { a: 110.46, b: 113.56, html: `See every workflow <span class="grad-text">they’ve been in.</span>` },
  { a: 113.76, b: 116.86, html: `Every run, <span class="grad-text">newest first.</span>` },
  { a: 117.36, b: 120.16, html: `Open any run. See the <span class="grad-text">exact path.</span>` },
  { a: 120.46, b: 123.56, html: `There’s the email <span class="grad-text">Jordan got.</span>` },
  { a: 124.66, b: 128.96, html: `Step from <span class="grad-text">run to run.</span>` },
  { a: 133.26, b: 135.36, html: `Spot what needs <span class="grad-text">attention.</span>` },
  { a: 136.56, b: 139.36, html: `See exactly which <span class="grad-text">runs failed.</span>` },
  { a: 139.76, b: 142.36, html: `Jump straight to the <span class="grad-text">failed step.</span>` },
  { a: 142.66, b: 145.16, html: `Catch deleted assets <span class="grad-text">still in use.</span>` },
  // the Assistant (finale)
  { a: 147.75, b: 150.65, html: `Ask your map <span class="grad-text">anything.</span>` },
  { a: 150.85, b: 154.55, html: `It answers, and <span class="grad-text">shows you on the map.</span>` },
  { a: 154.75, b: 158.25, html: `Straight to <span class="grad-text">what to fix first.</span>` },
];

/** Chapter pills top-left of the window. `n` is the badge text. */
export const CHAPTERS: { a: number; b: number; n: string; text: string }[] = [
  { a: 42.68, b: 52.25, n: "1", text: "Plan · Every workflow, with its assets" },
  { a: 52.38, b: 56.65, n: "2", text: "Plan · Down to the exact step" },
  { a: 56.75, b: 60.75, n: "3", text: "Plan · Everywhere an asset is used" },
  { a: 60.85, b: 64.45, n: "4", text: "Plan · Search across your map" },
  { a: 64.55, b: 68.15, n: "5", text: "Plan · Filter to what matters" },
  { a: 68.35, b: 74.15, n: "6", text: "Plan · Linked workflows" },
  { a: M.D2 + 1.3, b: 106.36, n: "★", text: "Organise" },
  { a: 107.86, b: 129.16, n: "★", text: "Troubleshoot · Contact journey" },
  { a: M.D3 + 1.3, b: 145.06, n: "★", text: "Troubleshoot · Errors" },
  { a: 147.7, b: 158.25, n: "★", text: "Assistant" },
];

/** Full-screen title cards (the window recedes behind them). */
export const TITLE_CARDS: { a: number; b: number; kicker: string; html: string }[] = [
  { a: M.D2, b: M.D2 + 1.25, kicker: "ORGANISE IT", html: `Make it <span class="grad-text">yours</span>` },
  { a: 106.54, b: 107.81, kicker: "TROUBLESHOOT IT", html: `Trace any <span class="grad-text">contact</span>` },
  { a: M.D3, b: M.D3 + 1.25, kicker: "TROUBLESHOOT IT", html: `Fix <span class="grad-text">errors</span> fast` },
  { a: M.FIN, b: 147.55, kicker: "ONE MORE THING", html: `Just <span class="grad-text">ask</span> your map` },
];

/** The first drop: "Workflow Maps" explodes on the drop (15.55 s, measured onset), kicks again on the wall of
 * sound (15.82 s) and clears in the break (17.14 s) so the map takes over on the 17.67 s hit. */
export const TITLE_DROP = { at: 38.8, wall: 39.07, out: 40.39 };
/** Particle bursts on the other big hits (measured onsets). */
export const BURSTS = [
  { at: 85.36, x: 960, y: 540, n: 44, p: 760 },
  { at: 106.7, x: 960, y: 540, n: 36, p: 660 },
  { at: 131.91, x: 960, y: 540, n: 44, p: 760 },
  { at: 150.82, x: 960, y: 600, n: 54, p: 900 },
  { at: 158.58, x: 960, y: 520, n: 60, p: 980 },
];
/** The three questions nobody can answer today (deck slide 7), each on a hit; the window recedes behind them. */
export const QUESTIONS = {
  from: 32.85, to: 36.6, kicker: "THREE QUESTIONS NOBODY CAN ANSWER TODAY",
  lines: [
    { at: 32.87, q: "What’s connected to what?", line: "A tag added in one workflow silently starts another." },
    { at: 33.97, q: "What breaks if I change this?", line: "Edit a form, and nothing tells you which workflows it affects." },
    { at: 35.3, q: "What fires from this one asset?", line: "One form submit can start five workflows." },
  ],
};
/** Window jolts on the scramble's hits. */
export const SHAKES = [31.05, 31.42, 31.79, 32.15, 32.51];

/** The three lines of the build before drop 2, one per bar from 47.05 s. */
export const BUILD_LINES = ["Plan it.", "Organise it.", "Troubleshoot it."];
export const BUILD_LINES_START = 79.41;

/** Client message bubble: shown in the build, then again top-right during the journey. */
export const MESSAGE = { who: "Client · Summit Shield", initials: "SS", text: "Why did Jordan get this email?", answeredAt: 123.56, from: 107.86, to: 129.26 };

/** Browser tabs that pile up above the window ("tab hell"). */
export const TABS = {
  // one tab per workflow opened: the tag hand-off pair, the asset example, then "open every workflow" on the hits; gone at the implosion
  times: [12.0, 13.56, 19.4, 27.55, 27.91, 29.475, 30.095, 31.05, 31.42, 31.79, 32.15, 32.51, 32.87, 33.35],
  b: 36.85,
  names: ["Consultation Booking Goal", "Consultation Status Routing", "Program Application Submitted", "Sales Stage Follow-up", "Client Feedback Submitted", "Course Access Removed", "wait for tag", "Program Payment Received", "Tag New Enquiries", "Grant Course Access", "contact tag - form 7", "Opportunity Status Routing", "Course Progress & Completion", "no filter tag"],
}

/** Final lockup. */
export const LOCKUP = { name: "Workflow", accent: "Maps", badge: "BETA", tagline: "See every connection." };

/** Drops: the window punches in on the drop, title cards kick on the wall of sound that follows (measured onsets). */
export const DROPS = [38.8, 85.36, 106.7, 131.91, 150.82];
export const WALLS = [85.74, 132.29];

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

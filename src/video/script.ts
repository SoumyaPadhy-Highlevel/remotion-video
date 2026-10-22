// ─────────────────────────────────────────────────────────────────────────────
// The video's script: music markers, beats (one footage clip each) and every
// piece of on-screen text with its timing. Times are seconds on the edited track.
// Edit this file to change wording or timing; the components read from here.
// ─────────────────────────────────────────────────────────────────────────────

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
export const APP_FILE = "app-motion-v18.mp4";
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
export const HEADLINES: { a: number; b: number; html: string; top: number; size: number; center?: boolean }[] = [
  { a: 1.75, b: 3.85, html: `Your agency runs on<br/><span class="grad-text">hundreds of workflows.</span>`, top: 440, size: 96 },
  { a: M.GAP + 0.45, b: M.D3 - 0.02, html: `And when something <span class="grad-text">breaks?</span>`, top: 440, size: 96 },
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
  { a: 132.86, b: 135.66, html: `Open any run. See the <span class="grad-text">exact path.</span>` },
  { a: 135.96, b: 139.06, html: `There’s the email <span class="grad-text">Jordan got.</span>` },
  { a: 140.16, b: 144.46, html: `Step from <span class="grad-text">run to run.</span>` },
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
  { a: M.D2, b: M.D2 + 1.25, kicker: "ORGANISE IT", html: `Make it <span class="grad-text">yours</span>` },
  { a: 122.04, b: 123.31, kicker: "TROUBLESHOOT IT", html: `Trace any <span class="grad-text">contact</span>` },
  { a: M.D3, b: M.D3 + 1.25, kicker: "TROUBLESHOOT IT", html: `Fix <span class="grad-text">errors</span> fast` },
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
export const INTRO_CARDS: { a: number; b: number; html: string; depth?: number; y?: number }[] = [
  { a: 3.9, b: 5.75, html: `It started <span class="grad-text">simple.</span>` },
  { a: 11.62, b: 13.35, html: `Then workflows started <span class="grad-text">calling each other.</span>` },
  { a: 25.19, b: 27.0, html: `And one form can start <span class="grad-text">many workflows.</span>` },
  { a: 40.69, b: 42.55, html: `The only way to know? <span class="grad-text">Open every workflow.</span>` },
  // the suspense before the reveal: over the chaos, then high above the map slowly forming in the window (light recede)
  { a: 46.55, b: 48.8, html: `What if we could change <span class="grad-text">all of this…</span>` },
  { a: 49.1, b: 52.65, html: `…and reimagine how you <span class="grad-text">see your workflows?</span>`, depth: 0.3, y: -330 },
];
/** Window jolts on the scramble's hits. */
export const SHAKES = [43.05, 43.41, 43.89, 44.975, 45.595];

/** The three lines of the build before drop 2, one per bar from 47.05 s. */
export const BUILD_LINES = ["Plan it.", "Organise it.", "Troubleshoot it."];
export const BUILD_LINES_START = 94.91;

/** Client message bubble: shown in the build, then again top-right during the journey. */
export const MESSAGE = { who: "Client · Summit Shield", initials: "SS", text: "Why did Jordan get this email?", answeredAt: 139.06, from: 123.36, to: 144.76 };

/** Browser tabs that pile up above the window ("tab hell"). */
export const TABS = {
  // one tab per workflow opened: the hand-off pair, then "open every workflow" on the hits; gone at the implosion
  times: [13.5, 18.7, 43.05, 43.41, 43.89, 44.975, 45.595, 46.55, 46.92, 47.29],
  b: 48.85,
  /** the hand-off: flipping back and forth between the two open workflows ([time, tab index]) */
  flips: [[22.0, 0], [22.75, 1], [23.5, 0], [24.25, 1]] as [number, number][],
  names: ["Continue Client Journey", "Tag workflow", "Tag New Enquiries", "Consultation Booking Goal", "contact tag - form 7", "Opportunity Status Routing", "Program Application Submitted", "Course Progress & Completion", "no filter tag", "Sales Stage Follow-up"],
}

/** Final lockup. */
export const LOCKUP = { name: "Workflow", accent: "Maps", badge: "BETA", tagline: "See every connection." };

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
export type FeatureCard = { at: number; kicker: string; html: string; speed?: number; top?: boolean; build?: boolean; end?: number; panels?: keyof typeof PANELS; clip?: [number, number]; atOut?: number };
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
/** The second drop of the music (output time): the hand-off lines draw in across the whole map on it. */
export const LINKS_DROP = 100.86;
export const FEATURE_CARDS: FeatureCard[] = [
  // how the map works: the list is built into the map beside a shrunk window (BUILD; film scene "map"), no card
  { at: BUILD.at, kicker: "HOW THE MAP WORKS", html: "", build: true, speed: BUILD.speed, end: BUILD.end + 0.25 },
  { at: 67.9, kicker: "PLAN IT", html: `Select a workflow. See what’s inside, ${g("down to the exact trigger.")}` },
  { at: 72.3, kicker: "PLAN IT", html: `Click any asset. See ${g("everywhere it’s used.")}`, top: true, end: 76.3 },
  { at: 83.9, kicker: "PLAN IT", html: `See how workflows ${g("hand off to each other.")}`, end: 89.7 },
  // on the second drop: zoomed out, every hand-off draws in (film scene "links"; its drop is 1.6 s in)
  { at: 89.7, kicker: "PLAN IT", html: `All your interconnected workflows, ${g("visualized.")}`, top: true, clip: [180.36, 185.86], atOut: LINKS_DROP - 1.6, end: 89.7 },
  // search and filter, side by side; then the ORGANISE IT title (timeline 100.6–102.1)
  { at: 100.6, kicker: "PLAN IT", html: `Find anything, ${g("fast.")}`, panels: "duo", end: 102.1 },
  // Organise, shortened: one main move (drag workflows, then drop a folder into a folder), then the three-panel shot
  { at: 105.65, kicker: "ORGANISE IT", html: `Move workflows and folders, ${g("right on the map.")}`, end: 111.25 },
  { at: 121.95, kicker: "ORGANISE IT", html: `And keep it tidy, ${g("right on the map.")}`, panels: "trio" },
  { at: 124.05, kicker: "TROUBLESHOOT IT", html: `Pick any contact. See every workflow ${g("they’ve been in.")}` },
  { at: 129.15, kicker: "TROUBLESHOOT IT", html: `Every run, ${g("newest first.")}` },
  { at: 132.75, kicker: "TROUBLESHOOT IT", html: `Open any run. See the exact path, ${g("and the email Jordan got.")}` },
  { at: 140.05, kicker: "TROUBLESHOOT IT", html: `Step from ${g("run to run.")}` },
  { at: 148.65, kicker: "WHEN IT BREAKS", html: `Spot what needs attention. ${g("See exactly which runs failed.")}` },
  { at: 155.15, kicker: "WHEN IT BREAKS", html: `Jump straight to the ${g("failed step.")}` },
  { at: 158.05, kicker: "WHEN IT BREAKS", html: `Catch deleted assets ${g("still in use.")}` },
  { at: 163.15, kicker: "ASSISTANT", html: `Ask your map ${g("anything.")}` },
  { at: 166.25, kicker: "ASSISTANT", html: `It answers on the map, ${g("down to what to fix first.")}`, speed: 1 },
];
const PLAY_SPEED = 0.85;
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
/** How long a card holds: enough to read it (≈ 30 ms a character), 1.6–2.6 s. */
const cardDur = (c: FeatureCard) => (c.build ? 0 : c.panels ? PANELS[c.panels].dur : c.clip ? c.clip[1] - c.clip[0] : c.top ? 0.8 : Math.min(2.6, Math.max(1.6, 1.0 + c.html.replace(/<[^>]+>/g, "").length * 0.03)));
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
    out[out.length - 2].until = c.clip ? n : n + (next - c.at) / sp;   // a top line stays until the next card
    n += (next - c.at) / sp;
  });
  return out;
})();
export const EDIT_END = EDIT[EDIT.length - 1].n1;
/** Cut from the intro (timeline = music time here): "Now multiply that by a hundred" and its grid, exactly 3 bars, so the
 * music is cut by the same 3 bars and everything after stays on its beat. Output time before the cut is unchanged; after
 * it, output = music time − CUT_LEN. `tn` everywhere else in the code is the uncut ("music") output time. */
export const INTRO_CUT: [number, number] = [34.88, 40.69];
export const CUT_LEN = INTRO_CUT[1] - INTRO_CUT[0];
export const uncut = (out: number) => (out < INTRO_CUT[0] ? out : out + CUT_LEN);
export const VIDEO_END = EDIT_END - CUT_LEN;
/** Output time → timeline time (and the card being held, if any). */
export const editTime = (tn: number): { t: number; seg?: (typeof EDIT)[number] } => {
  if (tn < EDIT[0].n0) return { t: tn };
  for (const s of EDIT) if (tn < s.n1) return { t: s.hold ? s.src : s.src + (tn - s.n0) * s.speed, seg: s };
  const last = EDIT[EDIT.length - 1];
  return { t: last.src + (last.n1 - last.n0) * last.speed + (tn - last.n1) };
};
/** Output time of a timeline moment (for things placed on the output, like the music's end). */
export const outTime = (t: number) => {
  for (const s of EDIT) if (!s.hold && t >= s.src && t <= s.src + (s.n1 - s.n0) * s.speed) return s.n0 + (t - s.src) / s.speed;
  return t < EDIT[0].n0 ? t : EDIT_END + (t - M.END);
};

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
const OPENING: Footage = { file: "opening-motion.mp4" }; // Claude Motion clip, 3.90–31.01 s
export const BEATS: { id: string; label: string; start: number; end: number; footage?: Footage }[] = [
  { id: "01-intro", label: "Intro", start: 0, end: 3.9 },
  { id: "02-list", label: "Workflows list", start: 3.9, end: M.D1, footage: { ...OPENING, from: 3.9 - 3.9 } },
  { id: "03-drop", label: "Drop: list to map", start: M.D1, end: 19.39, footage: { ...OPENING, from: M.D1 - 3.9 } },
  { id: "04-introducing", label: "Introducing", start: 19.39, end: 23.27, footage: { ...OPENING, from: 19.39 - 3.9 } },
  { id: "05-assets", label: "Tour 1: workflows and assets", start: 23.27, end: 27.13, footage: { ...OPENING, from: 23.27 - 3.9 } },
  { id: "06-steps", label: "Tour 2: exact step", start: 27.13, end: 31.01, footage: { ...OPENING, from: 27.13 - 3.9 } },
  { id: "07-usage", label: "Tour 3: asset usage", start: 31.01, end: 34.88 },
  { id: "08-folders", label: "Tour 4: folders", start: 34.88, end: 38.75 },
  { id: "09-search", label: "Tour 5: search", start: 38.75, end: 42.1 },
  { id: "10-filter", label: "Tour 6: filter", start: 42.1, end: M.B2 },
  { id: "11-build", label: "Build to drop 2", start: M.B2, end: M.D2 },
  { id: "12-linked", label: "Linked workflows", start: M.D2, end: 62.57 },
  { id: "13-errors", label: "Errors", start: 62.57, end: 74.18 },
  { id: "14-journey", label: "Contact journey", start: 74.18, end: 87.71 },
  { id: "15-organise", label: "Organise", start: 87.71, end: M.GAP },
  { id: "16-gap", label: "One more thing", start: M.GAP, end: M.D3 },
  { id: "17-colour", label: "Colour", start: M.D3, end: 105.14 },
  { id: "18-notes", label: "Notes", start: 105.14, end: M.FIN },
  { id: "19-finale", label: "Finale", start: M.FIN, end: M.END },
];

/** Big headlines. `top`/`size` in px; `center` spans the full width. */
export const HEADLINES: { a: number; b: number; html: string; top: number; size: number; center?: boolean }[] = [
  { a: 1.75, b: 3.85, html: `Your agency runs on<br/><span class="grad-text">hundreds of workflows.</span>`, top: 440, size: 96 },
  { a: M.GAP + 0.45, b: M.D3 - 0.02, html: `One more <span class="grad-text">thing…</span>`, top: 440, size: 96 },
  { a: M.FIN + 0.1, b: 116.2, html: `From a long list…`, top: 40, size: 64, center: true },
  { a: 118.5, b: 122.4, html: `…to <span class="grad-text">one map.</span>`, top: 40, size: 64, center: true },
  { a: 122.6, b: 126.0, html: `See every <span class="grad-text">connection.</span>`, top: 40, size: 64, center: true },
];

/** Captions centred above the window. */
export const CAPTIONS: { a: number; b: number; html: string }[] = [
  { a: 4.7, b: 7.6, html: `Folders full of workflows. <span class="grad-text">One long list.</span>` },
  { a: 7.95, b: 9.6, html: `Which workflow uses this tag?` },
  { a: 9.85, b: 11.55, html: `What breaks if you change it?` },
  { a: 13.58, b: M.D1 - 0.05, html: `What if you could <span class="grad-text">see it all?</span>` },
  { a: M.D1 + 1.1, b: 19.2, html: `Every workflow. Every asset. <span class="grad-text">One map.</span>` },
  { a: 23.3, b: 24.4, html: `Your folders become <span class="grad-text">islands.</span>` },
  { a: 24.45, b: 25.75, html: `Blue nodes are your <span class="grad-text">workflows.</span>` },
  { a: 25.8, b: 27.05, html: `Smaller nodes are the <span class="grad-text">assets they use.</span>` },
];

/** Chapter pills top-left of the window. `n` is the badge text. */
export const CHAPTERS: { a: number; b: number; n: string; text: string }[] = [
  { a: 23.27, b: 27.0, n: "1", text: "Every workflow, with its assets" },
  { a: 27.13, b: 30.9, n: "2", text: "Down to the exact step" },
  { a: 31.01, b: 34.8, n: "3", text: "See everywhere an asset is used" },
  { a: 34.88, b: 38.6, n: "4", text: "Folders, and folders inside folders" },
  { a: 38.75, b: 42.0, n: "5", text: "Search to the exact trigger" },
  { a: 42.1, b: 44.5, n: "6", text: "Filter to what matters" },
  { a: M.D2 + 1.3, b: 62.4, n: "★", text: "Linked workflows" },
  { a: 63.9, b: 74.0, n: "★", text: "Errors" },
  { a: 75.5, b: 87.5, n: "★", text: "Contact journey" },
  { a: 89.0, b: 96.8, n: "★", text: "Organise" },
  { a: M.D3 + 1.3, b: 105.0, n: "★", text: "Colour" },
  { a: 106.3, b: 112.7, n: "★", text: "Notes" },
];

/** Full-screen title cards (the window recedes behind them). */
export const TITLE_CARDS: { a: number; b: number; kicker: string; html: string }[] = [
  { a: 19.39, b: 23.2, kicker: "INTRODUCING", html: `Workflow <span class="grad-text">Maps</span>` },
  { a: M.D2, b: M.D2 + 1.25, kicker: "SEE THE WHOLE CHAIN", html: `Linked <span class="grad-text">workflows</span>` },
  { a: 62.57, b: 63.85, kicker: "FIND WHAT’S BROKEN", html: `Fix <span class="grad-text">errors</span> fast` },
  { a: 74.18, b: 75.45, kicker: "TRACE ANY CONTACT", html: `Contact <span class="grad-text">journey</span>` },
  { a: 87.71, b: 88.95, kicker: "ORGANISE IN MINUTES", html: `Make it <span class="grad-text">yours</span>` },
  { a: M.D3, b: M.D3 + 1.25, kicker: "READ IT AT A GLANCE", html: `Colour-code <span class="grad-text">folders</span>` },
  { a: 105.14, b: 106.35, kicker: "DOCUMENT AS YOU GO", html: `Leave <span class="grad-text">notes</span>` },
];

/** The three lines of the build before drop 2, one per bar from 47.05 s. */
export const BUILD_LINES = ["Find the chain.", "Find the break.", "Find the why."];
export const BUILD_LINES_START = 47.05;

/** Client message bubble: shown in the build, then again top-right during the journey. */
export const MESSAGE = { who: "Client · Summit Shield", initials: "SS", text: "Why did Jordan get this email?", answeredAt: 86.2 };

/** Browser tabs that pile up above the window ("tab hell"). */
export const TABS = {
  a: 8.1,
  b: 9.71,
  every: 0.15,
  names: ["New Lead Intake", "Sales Handoff", "Lead Warm-up Drip", "Hot Lead Alert", "Quote Follow-up", "Stale Lead Check", "Deal Won, Close Out", "Long-term Nurture", "Speed to Lead SMS", "Pipeline Hygiene"],
};

/** Final lockup. */
export const LOCKUP = { name: "Workflow", accent: "Maps", badge: "BETA", tagline: "See every connection." };

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

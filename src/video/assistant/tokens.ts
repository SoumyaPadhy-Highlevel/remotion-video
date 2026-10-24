// Workflow Maps' Assistant panel, as the product draws it (automation-workflows-frontend, master since #4766:
// src/workflow-ai/maps-assistant/GridMapsChatPanel.vue and what it renders: v3/components/V3Header, MessageBubble,
// ThinkingSummary, WorkingHeader, BuildProgressCard, ZeroStateHero, ZeroStateInput, V3ChatFooter; maps-assistant/
// MapsEmptyState, MapsPlanCard, MapsSelectionPill, MapsSubjectChips, MapsActionModeToggle, MapsChangeHistory; chat/
// ClearChatButton, FeedbackReactions, VoiceRecordButton). Tailwind colours there resolve to HighRise's CSS variables
// (@platform-ui/highrise 4.3.1 style.css), copied here; hex values the components hard-code are kept as written.

/** HighRise `:root` colours (tailwind `gray-500` → `var(--gray-500)`). */
export const HR = {
  white: "#ffffff",
  gray25: "#fcfcfd", gray50: "#f9fafb", gray100: "#f2f4f7", gray200: "#eaecf0", gray300: "#d0d5dd", gray400: "#98a2b3",
  gray500: "#667085", gray600: "#475467", gray700: "#344054", gray800: "#1d2939", gray900: "#101828",
  primary50: "#eff4ff", primary100: "#d1e0ff", primary600: "#155eef", primary700: "#004eeb",
  success100: "#d1fadf", success200: "#a6f4c5", success600: "#039855", success700: "#027a48",
  error200: "#fecdca", error600: "#d92d20",
  purple400: "#9b8afb", purple700: "#5925dc", purple800: "#4a1fb8",
  blue600: "#1570ef", pink500: "#ee46bc", orange500: "#ef6820", teal500: "#15b79e", yellow500: "#eaaa08",
  purple500: "#7a5af8", green500: "#16b364",
  /** workflow chips (get-grid-asset-style.ts: workflow → cobalt; chip bg hue-50, text hue-800) */
  cobalt50: "#f0f5ff", cobalt800: "#1e3581",
};

/** The panel in the 1620×880 app window: GridLeftSidebar's panel (default width 360, rounded-lg, gray-200 border, shadow-lg). */
export const PANEL = { left: 60, top: 76, width: 360, height: 792, radius: 8,
  shadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)" };
/** The map canvas beside the open panel (the film's board, which matches the product's: 12 px gap after the panel). */
export const MAP_CANVAS = { left: 432, top: 76, width: 1176, height: 792, radius: 12 };

export const FONT = "Inter, 'Inter var', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

/** HighRise button heights as the panel shows them (measured on staging at 1:1). */
export const BTN = { "2xs": 28, xs: 32 } as const;
/** Tailwind `shadow` / `shadow-xs`. */
export const SHADOW = { card: "0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0,0,0,.06)", xs: "0 1px 2px rgba(16,24,40,.05)" };
/** v3's purple: user bubble, send button, hero avatar. */
export const V3 = {
  bubble: "linear-gradient(135deg, #9333ea, #7c3aed)", send: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
  tabBg: "#ede9fe", tabText: "#5b21b6", pill: "#f9fafb", headerLine: "#f3f4f6", muted: "#6b7280", sparkle: "#A78BFA",
  text: "#1f2937", stop: "#f87171",
};

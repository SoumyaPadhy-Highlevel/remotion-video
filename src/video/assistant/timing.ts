// The Assistant section's timing and where its controls sit, shared by the redraw (shots.tsx), the review composition
// (AssistantSection.tsx) and the Premiere clip export (scripts/premiere-clips.ts, which maps every moment here onto clip
// timecode). Plain data, no React. Film time unless noted; the act's moments are on its own clock `a` (output seconds).

/** The film's click on the rail's Assistant tab (its panel shows from frame 4747); the ask runs to the card at timeline 173 (film 169.1). */
export const ASK_FROM = 4746.5 / 30, ASK_TO = 169.1 + 0.2;
/** The act clip (script.ts ACT, ACT_LEN, clipRate): `a`, the act's own clock, is output seconds. */
export const ACT_FROM = 7084 / 30, ACT_LEN = 22.66, ACT_RATE = 0.83013;
export const assistantShown = (ft: number) => (ft >= ASK_FROM && ft < ASK_TO) || (ft >= ACT_FROM && ft < ACT_FROM + ACT_LEN + 0.1);

// ── where things are (window px, read off the panel as drawn: out/assistant-stills) ──
export const P = {
  rail: [32, 263], tile: [250, 492], zsInput: [190, 336], zsSend: [376, 380], composer: [190, 777], send: [380, 777],
  showOnMap: [318, 630], applyShort: [318, 495], apply: [318, 538], save: [1531, 32],
} as const;
export type Pt = readonly [number, number];

/** The ask's moments (film time): the tile hovered and clicked, the turn sent, the reply, the offer card, Show on map. */
export const ASK_T = { open: ASK_FROM, hover: 160.0, click: 160.2, sent: 160.3, step1: 161.3, reply: 162.5, streamEnd: 164.3, card: 164.45, toBtn: 164.9,
    atBtn: 165.6, press: 165.75, run: 165.85, applied: 166.0, fly: [166.0, 167.1] };

/** Turn timings: typing starts at `type`, sends at `send`, the reply lands at `reply`, Apply is pressed at `press`, the plan
 * finishes at `applied` (a server write runs longer). */
export const TURNS = [
  { click: 1.0, type: [1.1, 3.0], send: 3.75, step1: 4.5, reply: 5.4, card: 5.7, toApply: 6.1, press: 7.0, applied: 7.4, after: 7.9, apply: P.applyShort },
  { click: 9.3, type: [9.4, 10.9], send: 11.4, step1: 12.0, reply: 12.8, card: 13.1, toApply: 13.5, press: 14.4, applied: 15.2, after: 15.6, apply: P.apply },
  { click: 17.4, type: [17.5, 18.8], send: 19.4, step1: 19.9, reply: 20.6, card: 20.9, toApply: 21.3, press: 22.2, applied: 22.6, after: 23.2, apply: P.apply },
];
export const SAVE = { to: 24.2, at: 25.1, press: 25.25, saved: 25.35 };

/** The review composition's pacing (AssistantSection): [film from, film to, rate]; a rate of 0 holds `from` for `to` s.
 * As the edit plays it (script.ts FEATURE_CARDS): 0.85× into the ask, 1× through the answer, the act clip at its rate. */
export const SECTION_SEGS: [number, number, number][] = [[157.6, 162.35, 0.85], [162.35, 169.1, 1], [169.1, 0.8, 0], [ACT_FROM, ACT_FROM + ACT_LEN, ACT_RATE]];
const segLen = (s: (typeof SECTION_SEGS)[number]) => (s[2] ? (s[1] - s[0]) / s[2] : s[1]);
export const SECTION_LEN = SECTION_SEGS.reduce((m, s) => m + segLen(s), 0);
/** Film time at review-clip time `t`. */
export const sectionFilmAt = (t: number) => {
  for (const s of SECTION_SEGS) {
    const d = segLen(s);
    if (t < d) return s[2] ? s[0] + t * s[2] : s[0];
    t -= d;
  }
  return SECTION_SEGS[SECTION_SEGS.length - 1][1];
};
/** Review-clip time of film time `ft` (the first time the clip shows it), or null. */
export const sectionTimeOf = (ft: number) => {
  let t = 0;
  for (const s of SECTION_SEGS) {
    if (s[2] && ft >= s[0] && ft <= s[1]) return t + (ft - s[0]) / s[2];
    t += segLen(s);
  }
  return null;
};

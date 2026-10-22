// Step 1 of the DaVinci Resolve export (npm run resolve:export): dumps what the timeline needs from script.ts to
// out/resolve/.script.json: the sections (where the base track is cut, named), markers, and every title and panel with its
// approximate output frames and plain text. Step 2 (scripts/resolve_fcpxml.py) finds each one's exact frames in the
// rendered passes and writes the FCPXML.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { BUILD, CUT_LEN, EDIT, FPS, HEADLINES, INTRO_CARDS, INTRO_CUT, LOCKUP, M, MESSAGE, outTime, TITLE_CARDS, TITLE_DROP, VIDEO_END } from "../src/video/script";

const OUT = resolve(process.argv[2] ?? "out/resolve");
const strip = (h: string) => h.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
/** music time (the uncut output) → output seconds */
const out = (mt: number) => (mt < INTRO_CUT[0] ? mt : mt - CUT_LEN);
/** timeline time (what the components draw by) → output seconds */
const tl = (t: number) => out(t < EDIT[0].n0 ? t : outTime(t));
const fr = (s: number) => Math.round(s * FPS);
const END = fr(VIDEO_END);

// ── sections: where the base (and mascot, music) tracks are cut ──
const cuts: [number, string][] = [[0, "Opening · logo"]];
INTRO_CARDS.forEach((c) => cuts.push([fr(out(c.a)), `Intro · ${strip(c.html)}`]));
cuts.push([fr(out(M.D1)), "Drop · Workflow Maps title"]);
EDIT.forEach((s, i) => {
  if (s.n1 - s.n0 < 0.02) return;
  const c = s.card ?? EDIT[i - 1]?.card;
  const label = !c ? "Plays" : c.build ? "How the map works · build" : s.hold
    ? `${c.panels ? "Panels" : c.clip ? "Clip" : c.top ? "Line" : "Card"} · ${c.kicker} · ${strip(c.html)}`
    : `Plays · ${c.kicker}${c.html ? " · " + strip(c.html) : ""}`;
  cuts.push([fr(out(s.n0)), label]);
});
cuts.push([fr(tl(M.LOGO)) - 12, "Logo lockup"]);
cuts.sort((a, b) => a[0] - b[0]);
const sections = cuts.filter((c, i) => c[0] < END && (i === cuts.length - 1 || cuts[i + 1][0] > c[0]))
  .map(([f, name], i, arr) => ({ f0: f, f1: i + 1 < arr.length ? arr[i + 1][0] : END, name }));

// ── markers ──
const MUSIC: [keyof typeof M, string][] = [["D1", "Drop 1"], ["STOP", "Music stops"], ["HIT", "Hit"], ["D2", "Drop 2"], ["GAP", "One more thing (gap)"], ["D3", "Drop 3"], ["FIN", "Finale"], ["LOGO", "Logo"]];
const markers: [number, string][] = [[fr(INTRO_CUT[0]), "Music edit: 3 bars cut (multiply-by-100 removed)"]];
MUSIC.forEach(([k, n]) => markers.push([fr(out(M[k])), `♪ ${n}`]));
markers.splice(0, markers.length, ...markers.filter(([f]) => f >= 0 && f < END));

// ── titles (type), in output seconds; `style` is a hint for the editable text track ──
type T = { name: string; kind: string; kicker: string; text: string; a: number; b: number; size: number };
const titles: T[] = [];
const add = (kind: string, kicker: string, html: string, a: number, b: number, size = 84) => titles.push({ name: `${kind} · ${strip(html)}`, kind, kicker, text: strip(html), a, b, size });
add("Opening", "", `HighLevel · WORKFLOWS · ${HEADLINES[0].html}`, 0, 3.9, 96);
INTRO_CARDS.forEach((c) => { if (c.a < INTRO_CUT[0] || c.a >= INTRO_CUT[1]) add("Intro card", "", c.html, out(c.a), out(c.b) + 0.1, c.y ? 64 : 92); });
add("Title", "INTRODUCING", "Workflow Maps", out(TITLE_DROP.at), out(TITLE_DROP.out) + 0.5, 168);
EDIT.forEach((s) => {
  const c = s.card;
  if (!s.hold || !c || c.build || c.panels || c.clip) return;
  if (c.top) add("Top line", c.kicker, c.html, out(s.n0), out(s.until ?? s.n1), 42);
  else add("Card", c.kicker, c.html, out(s.n0) - 0.05, out(s.n1) + 0.4, 84);
});
TITLE_CARDS.forEach((c) => add("Title card", c.kicker, c.html, tl(c.a), tl(c.b), 120));
add("Headline", "", HEADLINES[1].html, tl(HEADLINES[1].a), tl(HEADLINES[1].b), 96);
// (BUILD_LINES sit in timeline 93–100.6, which the edit skips, so they never show)
add("Lockup", "", `${LOCKUP.name} ${LOCKUP.accent} · ${LOCKUP.tagline}`, tl(M.LOGO), VIDEO_END, 132);
titles.sort((p, q) => p.a - q.a);

// ── the panel track: the map build panel and the client message ──
const panels = [
  { name: "How the map works · panel and flying items", a: tl(BUILD.at), b: tl(BUILD.end) },
  { name: `Client message · ${MESSAGE.text}`, a: tl(MESSAGE.from), b: tl(MESSAGE.to) },
];

writeFileSync(resolve(OUT, ".script.json"), JSON.stringify({ fps: FPS, end: END, sections, markers, titles, panels }, null, 1));
console.log(`script: ${sections.length} sections, ${markers.length} markers, ${titles.length} titles, ${panels.length} panel items`);

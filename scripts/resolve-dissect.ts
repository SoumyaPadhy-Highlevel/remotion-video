// Full breakdown for DaVinci Resolve, step 1 (npm run resolve:dissect): writes out/resolve-dissect/.pieces.json with
//  - motion: the app window's transform on every output frame (centre x/y, uniform scale, opacity, blur), exactly as
//    WorkflowMapsVideo composes it (windowAt → map-build split → recede behind statement cards → panel-shot fade);
//  - the frame ranges each single-piece render covers: panel shots, the map-build panel, every flying item, the message.
// Step 2 (scripts/resolve_dissect.py) renders nothing; it reads the rendered pieces and writes the timeline.
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { win } from "../src/video/anim";
import { WINDOW } from "../src/video/AppWindow";
import { splitAt } from "../src/video/Build";
import { windowAt } from "../src/video/choreography";
import { BUILD, CUT_LEN, EDIT, editTime, FPS, INTRO_CUT, MESSAGE, outTime, uncut, VIDEO_END } from "../src/video/script";

const OUT = resolve(process.argv[2] ?? "out/resolve-dissect");
mkdirSync(OUT, { recursive: true });
const END = Math.round(VIDEO_END * FPS);
const out = (mt: number) => (mt < INTRO_CUT[0] ? mt : mt - CUT_LEN);
const tl = (t: number) => out(t < EDIT[0].n0 ? t : outTime(t));
const strip = (h: string) => h.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

// ── motion, per output frame ──
const S = BUILD.win.width / WINDOW.width;
const motion: number[][] = [];
for (let f = 0; f < END; f++) {
  const tn = uncut(f / FPS), { t, seg } = editTime(tn);
  const trio = seg?.panels ? win(tn, seg.n0, seg.n1, 0.35, 0.35) : seg?.clip ? win(tn, seg.n0, seg.n1, 0.2, 0.25) : 0;
  const k = seg?.hold && !seg.card?.top && !seg.panels && !seg.clip ? win(tn, seg.n0, seg.n1, 0.3, 0.35) : 0;
  const w = windowAt(t), sp = splitAt(t);
  const map = (px: number, py: number): [number, number] => {
    // AppWindow: translate then scale(scale·zoom) about zoomOrigin (window px), placed at WINDOW.left/top
    const S1 = w.scale * w.zoom, [ox, oy] = w.zoomOrigin;
    let x = WINDOW.left + ox + w.translateX + S1 * (px - ox), y = WINDOW.top + oy + w.translateY + S1 * (py - oy);
    // map-build split: about the window's rest top-left
    const ss = 1 - (1 - S) * sp;
    x = WINDOW.left + (BUILD.win.left - WINDOW.left) * sp + ss * (x - WINDOW.left);
    y = WINDOW.top + (BUILD.win.top - WINDOW.top) * sp + ss * (y - WINDOW.top);
    // recede behind a statement card: about (960, 560)
    const c = 1 - 0.1 * k;
    return [960 + c * (x - 960), 560 + c * (y - 560)];
  };
  const [cx, cy] = map(WINDOW.width / 2, WINDOW.height / 2), [rx] = map(WINDOW.width, WINDOW.height / 2);
  const scale = (rx - cx) / (WINDOW.width / 2);
  motion.push([+cx.toFixed(2), +cy.toFixed(2), +scale.toFixed(5), +(w.opacity * (1 - 0.5 * k) * (1 - trio)).toFixed(4), +Math.max(w.blur, 7 * k).toFixed(2)]);
}

// ── single-piece ranges (output seconds) ──
const panels = EDIT.filter((s) => s.hold && (s.panels || s.clip)).map((s) => ({
  name: s.panels ? `${s.card!.kicker} · ${strip(s.card!.html)} (${s.panels} panels)` : `${s.card!.kicker} · ${strip(s.card!.html)} (clip)`,
  a: out(s.n0), b: out(s.n1),
}));
const FLY = 0.55;
const flights = BUILD.items.map((it, i) => ({ i, name: `${["Folder", "Workflow", "Asset"][it.step]} · ${it.name}`, a: tl(BUILD.at + it.land - FLY - 0.05), b: tl(BUILD.at + it.land + 0.5) }));
const build = { a: tl(BUILD.at), b: tl(BUILD.release[1] + BUILD.at) };
const message = { a: tl(MESSAGE.from), b: tl(MESSAGE.to) };

writeFileSync(resolve(OUT, ".pieces.json"), JSON.stringify({ fps: FPS, end: END, motion, panels, flights, build, message }));
console.log(`motion: ${motion.length} frames · ${panels.length} panel shots · ${flights.length} flights · build ${build.a.toFixed(2)}–${build.b.toFixed(2)} · message ${message.a.toFixed(2)}–${message.b.toFixed(2)}`);

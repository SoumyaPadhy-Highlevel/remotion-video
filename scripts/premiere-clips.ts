// Renders the separate clips for the Premiere edit into out/premiere/clips/ and ties each one back to Remotion, so a change
// noted in Premiere can be made here and re-rendered over the same file:
//   · <clip>.remotion.json: the composition, frames and props it was rendered from, the render command, the code version
//     (base commit, uncommitted files, a hash of every source the clip depends on) and every moment in it — each card and
//     each step of the choreography — in clip timecode, with the file, line and constant that sets it;
//   · the same reference in the MP4's own metadata (comment / description);
//   · Assistant clips.xml: import it in Premiere (File → Import) for one sequence per clip with those moments as markers;
//     each marker's comment names the constant to change.
// Run: npm run premiere:clips            (render, then write the references)
//      npm run premiere:clips -- --no-render   (only rewrite the references for the files already there)
//      add --port=3031 if the render port in remotion.config.ts is busy.
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, renameSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";
import { APP_FILE, CUT_LEN, EDIT, outTime } from "../src/video/script";
import { ACT_FROM, ACT_RATE, ASK_FROM, ASK_T, SAVE, SECTION_LEN, sectionTimeOf, TURNS } from "../src/video/assistant/timing";

const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "out/premiere/clips");
const FPS = 30;
const args = process.argv.slice(2);
const render = !args.includes("--no-render");
const port = args.find((a) => a.startsWith("--port="));

// ── where things are set ──
const lineOf = (file: string, needle: string) => {
  const i = readFileSync(join(ROOT, file), "utf8").split("\n").findIndex((l) => l.includes(needle));
  return i < 0 ? file : `${file}:${i + 1}`;
};
const TIMING = "src/video/assistant/timing.ts";
const askRef = (key: string) => `${lineOf(TIMING, "export const ASK_T")} ASK_T.${key}`;
const turnRef = (i: number, key: string) => `${lineOf(TIMING, `{ click: ${TURNS[i].click}`)} TURNS[${i}].${key}`;
const saveRef = (key: string) => `${lineOf(TIMING, "export const SAVE")} SAVE.${key}`;

/** Output (video) time of a film moment, through the edit (timeline = film + 3.9), after the intro cut. */
const outOfFilm = (ft: number) => outTime(ft + 3.9) - CUT_LEN;
const actSeg = EDIT.find((s) => s.clip && Math.abs(s.clip[0] - ACT_FROM) < 0.01)!;
const outOfAct = (a: number) => actSeg.n0 + a - CUT_LEN;

type Moment = { name: string; video?: number; section?: number | null; ref: string };
const T0 = TURNS.map((_, i) => i);
const askMoments: [string, number, string][] = [
  ["Panel opens (the film's click on the rail)", ASK_FROM, `${lineOf(TIMING, "export const ASK_FROM")} ASK_FROM`],
  ["Map overview tile clicked", ASK_T.click, askRef("click")], ["Prompt sent, Working", ASK_T.sent, askRef("sent")],
  ["Answer streams in", ASK_T.reply, askRef("reply")], ["Suggested-fix card (Show on map)", ASK_T.card, askRef("card")],
  ["Show on map clicked", ASK_T.press, askRef("press")], ["Map flies to the failing workflow", ASK_T.applied, askRef("applied")],
];
const actMoments: [string, number, string][] = [
  ...T0.flatMap((i): [string, number, string][] => [
    [`Ask ${i + 1}: typing`, TURNS[i].type[0], turnRef(i, "type")], [`Ask ${i + 1}: sent, Working`, TURNS[i].send, turnRef(i, "send")],
    [`Ask ${i + 1}: reply + review card`, TURNS[i].reply, turnRef(i, "reply")], [`Ask ${i + 1}: Apply clicked`, TURNS[i].press, turnRef(i, "press")],
    [`Ask ${i + 1}: applied (${["5 highlighted", "folder created", "workflows moved"][i]})`, TURNS[i].applied, turnRef(i, "applied")],
  ]),
  ["Save 1 change clicked", SAVE.press, saveRef("press")], ["Map changes saved", SAVE.saved, saveRef("saved")],
];
const scriptLines = readFileSync(join(ROOT, "src/video/script.ts"), "utf8").split("\n");
const cardRef = (html: string) => {
  // the card's text before its gradient run, as written in script.ts
  const lead = html.split("<")[0].slice(0, 20);
  const i = scriptLines.findIndex((l) => l.includes("kicker:") && l.includes(lead));
  return i < 0 ? "src/video/script.ts FEATURE_CARDS" : `src/video/script.ts:${i + 1} FEATURE_CARDS`;
};
const plain = (html: string) => html.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "");

const moments: Moment[] = [
  ...EDIT.filter((s) => s.hold && s.card && s.card.html).map((s) => ({ name: `Card: ${plain(s.card!.html)}`, video: s.n0 - CUT_LEN, ref: cardRef(s.card!.html) })),
  ...askMoments.map(([name, ft, ref]) => ({ name, video: outOfFilm(ft), section: sectionTimeOf(ft), ref })),
  ...actMoments.map(([name, a, ref]) => ({ name, video: outOfAct(a), section: sectionTimeOf(ACT_FROM + a * ACT_RATE), ref })),
];

// ── the clips ──
const lockup = EDIT[EDIT.length - 1].n0 - CUT_LEN;
const inVideo: [number, number] = [Math.round((outOfFilm(ASK_FROM) - 2.5) * FPS), Math.round((lockup + 2) * FPS)];
type Clip = { id: string; file: string; composition: string; frames: [number, number]; size: [number, number]; audio: boolean; clock: "video" | "section"; about: string };
const CLIPS: Clip[] = [
  { id: "assistant-in-video", file: "Assistant - in video 1080p (cards + music).mp4", composition: "WorkflowMaps", frames: inVideo, size: [1920, 1080], audio: true, clock: "video",
    about: "The Assistant section as the video plays it: cards, mascot, soundtrack, to the lockup." },
  { id: "assistant-screen", file: "Assistant - screen only 1620x880 (no cards).mp4", composition: "AssistantSection", frames: [0, Math.round(SECTION_LEN * FPS) - 1], size: [1620, 880], audio: false, clock: "section",
    about: "The app window alone, paced as the edit plays it, without the cards." },
];

const SOURCES = ["src/video/assistant/timing.ts", "src/video/assistant/shots.tsx", "src/video/assistant/Panel.tsx", "src/video/assistant/MapChrome.tsx",
  "src/video/assistant/actWorld.ts", "src/video/assistant/tokens.ts", "src/video/assistant/AssistantSection.tsx", "src/video/script.ts",
  "src/video/builder/scenes.tsx", "src/video/map3d/MapScene.tsx", "src/video/map3d/MapShots.tsx", "src/video/map3d/filmMap.ts", "src/video/builder/icons.ts"];
const git = (...a: string[]) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8" }).replace(/\n+$/, "");
const sha = (f: string) => createHash("sha256").update(readFileSync(join(ROOT, f))).digest("hex").slice(0, 12);
const code = () => {
  const dirty = git("status", "--porcelain", "--", ...SOURCES).split("\n").filter(Boolean).map((l) => l.slice(3));
  return { baseCommit: git("rev-parse", "--short", "HEAD"), baseSubject: git("log", "-1", "--format=%s"), uncommitted: dirty,
    note: dirty.length ? "Rendered from uncommitted changes on top of baseCommit: compare `sources` hashes to tell whether the code still matches." : "Rendered from baseCommit as committed.",
    sources: Object.fromEntries(SOURCES.map((f) => [f, sha(f)])), footage: `public/footage/${APP_FILE}` };
};

const tc = (s: number) => {
  const f = Math.max(0, Math.round(s * FPS));
  return [Math.floor(f / 108000), Math.floor(f / 1800) % 60, Math.floor(f / 30) % 60, f % 30].map((n) => String(n).padStart(2, "0")).join(":");
};
const ffmpeg = (a: string[]) => spawnSync("npx", ["remotion", "ffmpeg", ...a], { cwd: ROOT, stdio: "pipe", encoding: "utf8" });

mkdirSync(OUT, { recursive: true });
const done: { clip: Clip; marks: { at: number; name: string; ref: string }[] }[] = [];
for (const clip of CLIPS) {
  const path = join(OUT, clip.file);
  const cmd = ["remotion", "render", "src/index.ts", clip.composition, "<out>", `--frames=${clip.frames[0]}-${clip.frames[1]}`];
  if (render) {
    const tmp = join(ROOT, `out/.clip-${clip.id}-${Date.now()}.mp4`);
    console.log(`Rendering ${clip.file} (${clip.composition} ${clip.frames.join("–")})…`);
    const r = spawnSync("npx", [...cmd.map((c) => (c === "<out>" ? tmp : c)), ...(port ? [port] : []), "--log=error"], { cwd: ROOT, stdio: "inherit" });
    if (r.status !== 0) throw new Error(`Render failed: ${clip.file}`);
    renameSync(tmp, path);
  }
  if (!existsSync(path)) throw new Error(`${clip.file} is missing: run without --no-render`);
  const start = clip.frames[0] / FPS, len = (clip.frames[1] - clip.frames[0] + 1) / FPS;
  const marks = moments
    .map((m) => ({ at: clip.clock === "video" ? (m.video ?? NaN) - start : m.section ?? NaN, name: m.name, ref: m.ref }))
    .filter((m) => m.at >= 0 && m.at < len && !(clip.clock === "section" && m.name.startsWith("Card:")))
    .sort((a, b) => a.at - b.at);
  const ref = { clip: clip.file, about: clip.about, remotion: { project: ROOT, composition: clip.composition, frames: clip.frames, fps: FPS, size: clip.size, props: {},
    videoTime: clip.clock === "video" ? [tc(start), tc(start + len)] : undefined,
    render: `npx ${cmd.join(" ").replace("<out>", `"out/premiere/clips/${clip.file}"`)}`, rerenderAll: "npm run premiere:clips" },
    code: code(), renderedAt: new Date(statSync(path).mtimeMs).toISOString(),
    markers: marks.map((m) => ({ clipTimecode: tc(m.at), clipSeconds: +m.at.toFixed(3), what: m.name, change: m.ref })) };
  writeFileSync(path.replace(/\.mp4$/, ".remotion.json"), JSON.stringify(ref, null, 2) + "\n");
  // the reference inside the file too (Premiere shows it in the Metadata panel; `ffprobe` prints it)
  const tagged = path.replace(/\.mp4$/, ".tagged.mp4");
  const comment = `Remotion ${clip.composition} frames ${clip.frames.join("-")} · base ${ref.code.baseCommit}${ref.code.uncommitted.length ? " + uncommitted" : ""} · ${basename(path).replace(/\.mp4$/, ".remotion.json")}`;
  const r = ffmpeg(["-loglevel", "error", "-y", "-i", path, "-map", "0", "-c", "copy", "-movflags", "use_metadata_tags",
    "-metadata", `comment=${comment}`, "-metadata", `description=${ref.remotion.render}`, "-metadata", `title=${clip.id}`, tagged]);
  if (r.status === 0) renameSync(tagged, path);
  else console.warn(`Could not tag ${clip.file}: ${r.stderr}`);
  done.push({ clip, marks });
  console.log(`${clip.file}: ${marks.length} markers`);
}

// ── a Premiere sequence per clip, with the moments as markers (FCP 7 XML, which Premiere imports) ──
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rate = "<rate><timebase>30</timebase><ntsc>FALSE</ntsc></rate>";
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
<bin><name>Assistant clips (Remotion)</name><children>
${done.map(({ clip, marks }, k) => {
  const n = clip.frames[1] - clip.frames[0] + 1, url = `file://${encodeURI(join(OUT, clip.file))}`;
  const file = `<file id="file-${k}"><name>${esc(clip.file)}</name><pathurl>${url}</pathurl>${rate}<duration>${n}</duration><media><video><samplecharacteristics><width>${clip.size[0]}</width><height>${clip.size[1]}</height></samplecharacteristics></video>${clip.audio ? "<audio><channelcount>2</channelcount></audio>" : ""}</media></file>`;
  const item = (track: string, f: string) => `<clipitem id="${track}-${k}"><name>${esc(clip.file)}</name>${rate}<duration>${n}</duration><start>0</start><end>${n}</end><in>0</in><out>${n}</out>${f}</clipitem>`;
  return `<sequence id="seq-${k}"><name>${esc(clip.file.replace(/\.mp4$/, ""))}</name>${rate}<duration>${n}</duration>
<media><video><format><samplecharacteristics>${rate}<width>${clip.size[0]}</width><height>${clip.size[1]}</height></samplecharacteristics></format><track>${item("v", file)}</track></video>${clip.audio ? `<audio><track>${item("a", `<file id="file-${k}"/>`)}</track></audio>` : ""}</media>
${marks.map((m) => `<marker><name>${esc(m.name)}</name><comment>${esc(`Change: ${m.ref}`)}</comment><in>${Math.round(m.at * FPS)}</in><out>-1</out></marker>`).join("\n")}
</sequence>`;
}).join("\n")}
</children></bin>
</xmeml>
`;
writeFileSync(join(OUT, "Assistant clips.xml"), xml);

// ── the folder's README ──
const c = code();
writeFileSync(join(OUT, "README.md"), `# Clips for Premiere

Separate renders to drop into the Premiere edit, each tied back to the Remotion project at \`${ROOT}\`.

| File | What it is | From |
|---|---|---|
${done.map(({ clip }) => `| \`${clip.file}\` | ${clip.about} ${clip.size.join("×")}, 30 fps${clip.audio ? ", with the soundtrack" : ", no audio"}. | \`${clip.composition}\` frames ${clip.frames.join("–")}${clip.clock === "video" ? ` (video ${tc(clip.frames[0] / FPS)}–${tc((clip.frames[1] + 1) / FPS)})` : ""} |`).join("\n")}

## Going back to Remotion from Premiere

- **Which clip, which frames:** each clip has a \`.remotion.json\` beside it (also in the MP4's metadata comment): the
  composition, frame range, the exact render command, and the code version it came from (base commit \`${c.baseCommit}\`${c.uncommitted.length ? ", plus uncommitted changes in " + c.uncommitted.map((f) => `\`${basename(f)}\``).join(", ") : ""}; \`sources\` holds a hash of every file
  it depends on, so you can tell whether the code still matches the clip).
- **What happens at a timecode:** import \`Assistant clips.xml\` in Premiere (File → Import). It adds a sequence per clip
  with a marker on every card and every step (sent, Apply, folder created, moved, saved). Each marker's comment says which
  constant to change, e.g. \`src/video/assistant/timing.ts:… TURNS[1].press\`. The same list is in the \`.remotion.json\`
  (\`markers\`) with clip timecodes.
- **Where to change what:** timing and cursor stops: \`src/video/assistant/timing.ts\`; what the panel says:
  \`ASSISTANT\` in \`src/video/script.ts\`; how the panel looks: \`src/video/assistant/Panel.tsx\` (+ \`tokens.ts\`); the map
  (camera, highlight, folder, move): \`src/video/assistant/shots.tsx\` and \`actWorld.ts\`; the cards and their timing:
  \`FEATURE_CARDS\` in \`src/video/script.ts\`.
- **Re-render:** \`npm run premiere:clips\` renders every clip again over the same file names (so Premiere relinks on
  its own) and rewrites these references. Add \`-- --port=3031\` if the render port is busy, or \`-- --no-render\` to only
  refresh the references. The in-video clip's frame range follows the edit: it starts 2.5 s before the panel opens and
  ends 2 s into the lockup.
`);
console.log(`Wrote ${OUT}`);

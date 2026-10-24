// node scripts/edited-footage.mjs <film folder> <out name, e.g. app-edited-v2.mp4> [workers=4]
// Builds the app window's "as edited" footage (script.ts EDITED_FILE): for every frame of the video, the film frame at exactly
// the timeline moment that frame shows, so stretches the edit plays slower or faster than the film (PLAY_SPEED, BUILD, the
// intro's callout holds) get fresh frames instead of repeated ones. Rebuild it whenever the film or the timings change.
// The film folder is the Claude Motion film (harness.html, scenes.json, scene-*.js); it is served on a local port here.
import { build } from "esbuild";
import { openBrowser } from "@remotion/renderer";
import { execFileSync } from "child_process";
import fs from "fs";
import http from "http";
import os from "os";
import path from "path";

const [film, outName, workers = "4"] = process.argv.slice(2);
if (!film || !outName) { console.error("usage: node scripts/edited-footage.mjs <film folder> <out name.mp4> [workers]"); process.exit(1); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "edited-footage-"));

// 1. what the window shows at every video frame (the same editTime the video uses)
await build({ entryPoints: ["src/video/script.ts"], bundle: true, format: "esm", platform: "node", outfile: path.join(tmp, "script.mjs"), logLevel: "error" });
const s = await import(path.join(tmp, "script.mjs"));
const N = Math.round((s.EDIT_END - s.CUT_LEN) * s.FPS);
const ft = Array.from({ length: N }, (_, f) => { const t = s.editTime(s.uncut(f / s.FPS)).t; return t < 3.9 ? null : +(t - 3.9).toFixed(4); });
const uniq = [...new Set(ft.filter((x) => x != null))].sort((a, b) => a - b), idx = new Map(uniq.map((x, i) => [x, i]));
console.log(`${N} video frames, ${uniq.length} film frames to render`);

// 2. serve the film folder
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".woff2": "font/woff2" };
const server = http.createServer((q, r) => {
  const p = path.join(film, decodeURIComponent(q.url.split("?")[0]));
  if (!p.startsWith(path.resolve(film)) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": types[path.extname(p)] ?? "application/octet-stream" }); fs.createReadStream(p).pipe(r);
});
await new Promise((ok) => server.listen(0, ok));
const url = `http://localhost:${server.address().port}/harness.html?t=0&nohud=1`;

// 3. render the unique film frames, one contiguous block per browser
const frames = path.join(tmp, "u");
fs.mkdirSync(frames);
const per = Math.ceil(uniq.length / +workers);
await Promise.all(Array.from({ length: +workers }, async (_, w) => {
  const b = await openBrowser("chrome", { chromiumOptions: {}, logLevel: "error" });
  const page = await b.newPage({ context: () => null, logLevel: "error", indent: false, pageIndex: 0, onBrowserLog: null, onLog: () => {} });
  await page.setViewport({ width: 1620, height: 880, deviceScaleFactor: 1 });
  await page.goto({ url, timeout: 30000 });
  for (let i = 0; i < 300 && !(await page.evaluate(() => window.ready === true)); i++) await new Promise((r) => setTimeout(r, 100));
  const err = await page.evaluate(() => (document.querySelector("pre") || {}).textContent || (window.ready ? "" : "not ready"));
  if (err) throw new Error("film harness: " + err.slice(0, 500));
  await page.evaluate(() => { const h = document.getElementById("hud"); if (h) h.style.display = "none"; });
  const cl = typeof page._client === "function" ? page._client() : page.client;
  for (let i = w * per; i < Math.min(uniq.length, (w + 1) * per); i++) {
    await page.evaluate((T) => window.seek(T), uniq[i]);
    const r = await cl.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1620, height: 880, scale: 1 } });
    fs.writeFileSync(path.join(frames, `u${String(i).padStart(5, "0")}.png`), Buffer.from((r.value || r).data, "base64"));
  }
  await b.close({ silent: true });
}));
server.close();

// 4. one image per video frame (links into the unique frames; before the film starts, its first frame), then encode
const seq = path.join(tmp, "seq");
fs.mkdirSync(seq);
ft.forEach((x, f) => fs.symlinkSync(path.join(frames, `u${String(x == null ? 0 : idx.get(x)).padStart(5, "0")}.png`), path.join(seq, `f${String(f).padStart(5, "0")}.png`)));
const out = path.resolve("public/footage", outName), part = out + ".part.mp4";
execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-framerate", String(s.FPS), "-i", path.join(seq, "f%05d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "medium", part], { stdio: "inherit" });
fs.renameSync(part, out);   // written under a temporary name first (Studio caches half-written files)
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`wrote public/footage/${outName}; set EDITED_FILE = "${outName}" in src/video/script.ts`);

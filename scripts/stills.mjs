// node scripts/stills.mjs <outdir> [composition] : renders reference stills of the video at fixed frames with one bundle,
// for before/after checks (scripts/stills-diff.py compares two folders).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";
const out = process.argv[2], id = process.argv[3] ?? "WorkflowMaps";
fs.mkdirSync(out, { recursive: true });
const FRAMES = [60, 100, 160, 260, 400, 520, 700, 900, 1060, 1180, 1300, 1420, 1460, 1500, 1560, 1700, 1900, 2100, 2300, 2600, 2900, 3000, 3200, 3400, 3600, 3800, 4000, 4300, 4600, 4900, 5200, 5500, 5800, 6100, 6250, 6400];
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, inputProps: {}, port: 3022 });
for (const f of FRAMES.filter((f) => f < composition.durationInFrames)) {
  await renderStill({ serveUrl, composition, frame: f, output: path.join(out, `f${String(f).padStart(5, "0")}.png`), inputProps: {}, port: 3022 });
  process.stdout.write(f + " ");
}
console.log("done");

// Bundle only current source tests into a fresh folder, avoiding stale test artifacts.
import {buildSync} from "esbuild";
import {execFileSync} from "node:child_process";
import {mkdirSync, mkdtempSync, readdirSync, rmSync} from "node:fs";
import {join, relative} from "node:path";
import {fileURLToPath} from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const src = join(root, "src");
const findTests = (dir) => readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
  const path = join(dir, entry.name);
  return entry.isDirectory() ? findTests(path) : entry.name.endsWith(".test.ts") ? [path] : [];
});
const tests = findTests(src).sort();
if (!tests.length) throw new Error("No source tests found");
mkdirSync(join(root, "out"), {recursive: true});
const output = mkdtempSync(join(root, "out", ".tests-"));
try {
  buildSync({entryPoints: tests, outbase: src, outdir: output, bundle: true, platform: "node", logLevel: "warning"});
  const compiled = tests.map((path) => join(output, relative(src, path).replace(/\.ts$/, ".js")));
  execFileSync(process.execPath, ["--test", ...compiled], {cwd: root, stdio: "inherit"});
} finally {
  rmSync(output, {recursive: true, force: true});
}

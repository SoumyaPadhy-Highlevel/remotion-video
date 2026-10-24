"""Render only the clean plates needed for the three Premiere transition examples."""
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "out/premiere-computer-use/current-study")
plan = json.loads((OUT / "plan.json").read_text())
cli = str(ROOT / "node_modules/.bin/remotion")
for scene in plan["scenes"]:
    key = scene["id"]
    plate = OUT / "media" / f"{key}-clean.mp4"
    if not plate.exists():
        print(f"Rendering {key}: clean picture {scene['patchStart']}–{scene['patchEnd'] - 1}", flush=True)
        subprocess.run([cli, "render", "src/index.ts", "WorkflowMaps", str(plate),
                        f"--props={OUT / 'clean-props.json'}", f"--frames={scene['patchStart']}-{scene['patchEnd'] - 1}",
                        "--codec=h264", "--crf=15", "--muted", "--concurrency=4", "--port=3031", "--log=error"], cwd=ROOT, check=True)
    title = OUT / "media" / f"{key}-title.png"
    if not title.exists():
        print(f"Rendering {key}: transparent title plate", flush=True)
        subprocess.run([cli, "still", "scripts/premiere-study-title.tsx", "PremiereStudyTitle", str(title),
                        f"--props={OUT / (key + '-title.json')}", "--image-format=png", "--port=3031", "--log=error"], cwd=ROOT, check=True)
    print(f"Ready: {key}", flush=True)

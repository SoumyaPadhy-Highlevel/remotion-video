# Map film analysis

Reads the film's 3D map shots so `src/video/map3d/MapShots.tsx` can redraw them with the product's renderer. Everything
here reads the film's frames (`MAP_FRAMES`, every frame from 45 s, extracted with
`npx remotion ffmpeg -ss 45 -i public/footage/app-motion-vN.mp4 -q:v 3 <dir>/%05d.jpg`) and writes JSON to a scratch
folder; `export.py` turns that into `src/video/map3d/filmMap.ts`. Python 3 with numpy, scipy, Pillow and opencv-python-headless.

| Step | Script | What it gives |
|---|---|---|
| World | `world_*.json` (by hand, from the film) | folders, workflows (status), assets (type), links, names the film shows |
| Panels | `ui.py t0 t1 out` | side panels and sticky notes per frame |
| Motion | `track_motion.py n out ui…` | frame-to-frame camera motion (panels masked) |
| Camera | `camera2.py motion t0 t1 out world` | camera per frame: global node matches as anchors, motion between them |
| Refine | `refine.py cam out world ui` | fixes frames where a filter leaves only a few nodes coloured (check it with `check_cam.py`) |
| States | `states.py cam out world` | each node (c/g/s/-) and folder colour per frame |
| Overlays | `overlays.py t0 t1 out` | the film cursor, dark tooltips and contact chips per frame |
| Export | `export.py scratch world:key:t0:t1…` | `filmMap.ts` |

`proj.py` is the product's camera (direction (7, 9, 8)), `organise.py` the Organise drags (keep it in step with
`map3d/organise.ts`), `check_cam.py` draws the world over film frames to check a camera track.

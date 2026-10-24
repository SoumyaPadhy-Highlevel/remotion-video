# Workflow Maps demo video (Remotion)

A 3:04 product video for HighLevel Workflow Maps on `public/music-intro2.mp3` ("And Still", uncut, with 20 placeholder bars
added to the intro so the problem gets ~50 s before the drop at 54.27 s). Composition id: `WorkflowMaps` (1920×1080, 30 fps, 5514 frames).
The intro is "say, then show": `INTRO_CARDS` (statements over the receded window), then the visual with callouts inside the footage.
After the intro the output is an edit of that timeline: `FEATURE_CARDS` (script.ts) freeze the scene behind a statement, then the
visual plays at 0.85× with no caption on top. All other times stay on the timeline; `editTime()` maps output time onto it (~4:14).
The app window plays one Claude Motion film (`public/footage/app-motion-vN.mp4`, from 3.9 s); every beat uses `from = start − 3.9`.
Give each re-render a new file name (browsers cache half-written files).
The window actually plays `EDITED_FILE` (script.ts): the film rendered at the exact timeline moment of every video frame, so
slowed or sped-up stretches don't repeat frames (judder). It is built from the film and these timings, so after changing either,
rebuild it: `node scripts/edited-footage.mjs <film folder> app-edited-vN.mp4` and point `EDITED_FILE` at the new name.

## Structure

| File | What it holds |
|---|---|
| `src/video/script.ts` | **Start here.** Music markers, the 19 beats, and every piece of on-screen text with its timing (headlines, captions, chapter pills, title cards, build lines, client message, browser tabs, lockup, flashes). |
| `src/video/choreography.ts` | App-window motion (rise, push-ins `ZOOMS`, receding behind titles `RECEDES`) and the mascot's position and reaction per beat (`mascotAt`). |
| `src/video/AppWindow.tsx` | The 1620×880 app window at (150, 118). Plays one footage clip per beat. |
| `src/video/Browser.tsx` | The intro's device: tablet-style bezel and a desktop browser tab strip around the app window (tabs from `TABS`), gone from the first drop. |
| `src/video/Stage.tsx` | Background, titles, client message bubble, white flash. |
| `src/video/Impact.tsx` | Kinetic type: the "Workflow Maps" title on the drop, title cards, the three intro questions. |
| `src/video/Mascot.tsx` | Mascot artwork with animated SVG eyes (normal, happy, wow, worried, star, squint), sparkles, speed streak, question mark. |
| `src/video/WorkflowMapsVideo.tsx` | Layer order and the music. |
| `public/footage/` | What the app shows during each beat. Defaults to `<beat-id>.mp4` (1620×880, 30 fps, exactly the beat's length). |
| `src/video/builder/` | The workflow builder, drawn as the product draws it. `tokens.ts` (colours, sizes from the real `WorkflowTreeV2.vue` canvas), `layout.ts` (node and edge positions, ported from `canvas_helper.ts`), `Nodes.tsx` / `Canvas.tsx` (trigger card, Add new trigger, action card, If/Else branch, END, "+", grid, controls, minimap), `icons.ts` (generated). Workflow Maps' own canvas (its workflow view and a contact's runs, `AdvancedWorkflowCanvas` in vertical mode): `mapsLayout.ts` / `MapsCanvas.tsx` (240 × 72 cards, handles, arrowed edges, Linked badges, the run's green path, chips). `scenes.tsx` redraws every builder and Maps-canvas shot of the film over it (`introShots`, `linkedShots`, `runShots`); `BuilderShots` composition shows film + redraw on film time. |

## Rules for edits

- Everything is a pure function of time: `t = frame / 30`. Never use `Math.random()`, `Date`, timers or state; use `rand(i)` from `anim.ts` for variety.
- Animate with Motion's pure helpers (`motion` package): `transform(t, [a, b], [from, to], { ease })` for a timed move or fade,
  `transform(t, [a, a + fadeIn, b - fadeOut, b], [0, 1, 1, 0])` for a visibility window, `mix` to blend, `clamp`.
  Multi-step moves are one keyframe list with an ease per segment: `transform(t, [a, b, c, d], [60, 0, 0, -40], { ease: [easeOut, linear, easeIn] })`
  (inputs must ascend).
  Entrances use springs: `springAt(t, start, visualDuration, bounce)` from `anim.ts` (a Motion `spring`) gives 0 → 1 with overshoot, for a `mix`.
  Cascades use Motion's `stagger(gap, { startDelay })(i, count)` for the start time of item `i`.
  Colour changes use `blend(from, to, p)` (Motion's `mixColor`); pass hex colours, e.g. `cfg.style.accent`, not CSS variables.
  Easing curves (`easeOut`, `easeIn`, `easeInOut`, `easeOutBack`, `easeOutExpo`, `linear`) are in `anim.ts`.
  Don't use `<motion.div animate>`, `useAnimate` or motion values: they run on wall-clock time, and Remotion renders each frame separately.
- Times are seconds on the edited music. Beats must stay contiguous and keep their start/end, or the music stops matching.
- Keep text in `script.ts`. Components read from it.
- Positions are in 1920×1080 frame pixels; inside the window they are window pixels (1620×880).
- The footage is the app only. Titles, mascot, tabs and the client message are drawn here, not in the footage.
- Anything that shows the workflow builder (triggers, actions, branches, edges, the canvas) uses `src/video/builder`, never
  hand-picked styles: `<WorkflowCanvas wf={...} view={...} />` with a workflow from `BUILDER_WORKFLOWS` in `script.ts`. Colours and
  sizes come from `builder/tokens.ts`, which mirrors automation-workflows-frontend (`WorkflowTreeV2.vue` and the
  `workflow-canvas/` node components); when the product's builder changes, update the tokens there, not in a scene.
  The film's builder shots carry the film's old styling; `builder/scenes.tsx` redraws each one over it (window px, film time).
  A new film with builder shots needs its shots added there, with cursor paths from `scripts/track_builder_film.py`.
  Workflow Maps' modal canvas is a different component (`AdvancedWorkflowCanvas`, `workflow-canvas-modal/`): draw it with
  `<MapsCanvas>`, not `<WorkflowCanvas>`. Not redrawn: the 2.3 s "open every workflow" montage of half-size windows (film
  42.65–45.1 s) and the multi-workflow linked view (film 193.4–208.1 s, camera moving across frames), which is the film's own
  and close to the product except for square corners where branches fan out.
- The 3D map (Workflow Maps' Three.js scene) is redrawn over the film with the product's own renderer: `src/video/map3d/`.
  `geometry.ts` is ported line for line from the frontend (`workflow-grid/libs/objects/GridBox.ts`, `GridPlaneGeometryCache.ts`);
  `MapScene.tsx` renders it like `SceneManager` (orthographic camera along (7, 9, 8), `public/env-map-3.hdr` lighting, emissive
  nodes, unlit slabs and edge ribbons, label pills); tokens in `builder/mapTokens.ts`. `MapShots.tsx` plays the film's map shots
  from `filmMap.ts`, generated by `scripts/map_film/` from the film itself: the camera per frame, every node's and folder's
  look per frame, where the film's panels, notes, tooltips and contact chips sit (left to the film), and its cursor.
  The worlds (folder rects, node positions, links, names) are `scripts/map_film/world_*.json`; Organise's drags and recolours
  are `map3d/organise.ts` (mirrored in `organise.py`). A new film with map shots: see `scripts/map_film/README.md`.
  Not redrawn: the film's map-forming intro (film 45–49.3 s, dots morphing into the map).
- The Assistant section (film 158.23–169.3 s and the act clip, film 236.13 s + 22.66 s at 0.83×) is redrawn whole by
  `src/video/assistant/`: the chat panel as `GridMapsChatPanel` draws it (master since #4766; `tokens.ts` lists the Vue
  sources and HighRise colours), the map with the product's renderer (`actWorld.ts`: the main map plus the Growth Foundations
  workflows and folder), the map's toasts, the header's Save cluster and the cursor. `shots.tsx` is the choreography on the
  film's clock (cursor stops are window px read off the panel); `BuilderScenes` uses it in place of `MapShots` there. Its
  text is `ASSISTANT` in `script.ts`. Check it alone with the `AssistantSection` composition (paced as the edit plays it) or
  `AssistantStills`.

## Common tasks

- **Change wording or timing of a title, caption or chapter:** edit the matching array in `script.ts`.
- **Replace what the app shows in a beat:** put the recording in `public/footage/` and set `footage` on that beat in `script.ts`, e.g.
  `footage: { file: "errors-take2.mov", from: 2.5, speed: 1.25 }`. It is fitted into the 1620×880 window (white letterbox) and cut at the beat's end. Crop recordings to the app area at a 1620:880 (about 1.84:1) ratio for a full-bleed fit. If a recording is shorter than its beat, raise `speed` or record a longer take.
- **Change a mascot reaction:** edit that beat's branch in `mascotAt` (eyes, sparkle, position).
- **Change a push-in:** edit `ZOOMS` in `choreography.ts`.

## Commands

- Preview: `npm run dev`, then open the `WorkflowMaps` composition.
- Render: `npx remotion render src/index.ts WorkflowMaps out/workflow-maps.mp4` (renders serve on port 3021, set in `remotion.config.ts`, because Studio holds 3000)
- Render one range: `npx remotion render WorkflowMaps out/clip.mp4 --frames=2640-2910`
- Check a builder redraw against the film: `npx remotion still src/index.ts BuilderShots out/check.png --frame=<film s × 30>`
  (pass `--props='{"overlay":false}'` for the bare film).
- Tests (builder layout and shot helpers): `npm test`.
- Builder icons: add the Iconify / ghl-icons name to `scripts/builder-icons.mjs`, then `node scripts/builder-icons.mjs ../automation-workflows-frontend`.

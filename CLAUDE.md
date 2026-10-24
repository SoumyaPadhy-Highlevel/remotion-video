# Workflow Maps demo video (Remotion)

A 3:04 product video for HighLevel Workflow Maps on `public/music-intro2.mp3` ("And Still", uncut, with 20 placeholder bars
added to the intro so the problem gets ~50 s before the drop at 54.27 s). Composition id: `WorkflowMaps` (1920×1080, 30 fps, 5514 frames).
The intro is "say, then show": `INTRO_CARDS` (statements over the receded window), then the visual with callouts inside the footage.
After the intro the output is an edit of that timeline: `FEATURE_CARDS` (script.ts) freeze the scene behind a statement, then the
visual plays at 0.85× with no caption on top. All other times stay on the timeline; `editTime()` maps output time onto it (~4:14).
The app window plays one Claude Motion film (`public/footage/app-motion-vN.mp4`, from 3.9 s); every beat uses `from = start − 3.9`.
Give each re-render a new file name (browsers cache half-written files).

## Structure

| File | What it holds |
|---|---|
| `src/video/script.ts` | **Start here.** Music markers, the 19 beats, and every piece of on-screen text with its timing (headlines, captions, chapter pills, title cards, build lines, client message, browser tabs, lockup, flashes). |
| `src/video/choreography.ts` | App-window motion (rise, push-ins `ZOOMS`, receding behind titles `RECEDES`) and the mascot's position and reaction per beat (`mascotAt`). |
| `src/video/AppWindow.tsx` | The 1620×880 app window at (150, 118). Plays one footage clip per beat. |
| `src/video/Stage.tsx` | Background, browser tabs, titles, client message bubble, white flash. |
| `src/video/Impact.tsx` | Kinetic type: the "Workflow Maps" title on the drop, title cards, the three intro questions. |
| `src/video/Mascot.tsx` | Mascot artwork with animated SVG eyes (normal, happy, wow, worried, star, squint), sparkles, speed streak, question mark. |
| `src/video/WorkflowMapsVideo.tsx` | Layer order and the music. |
| `public/footage/` | What the app shows during each beat. Defaults to `<beat-id>.mp4` (1620×880, 30 fps, exactly the beat's length). |

## Rules for edits

- Everything is a pure function of time: `t = frame / 30`. Never use `Math.random()`, `Date`, timers or state; use `rand(i)` from `anim.ts` for variety.
- Animate with Motion's pure helpers (`motion` package): `transform(t, [a, b], [from, to], { ease })` for a timed move or fade,
  `transform(t, [a, a + fadeIn, b - fadeOut, b], [0, 1, 1, 0])` for a visibility window, `mix` to blend, `clamp`, and `spring({ keyframes: [0, 1], … }).next(ms).value`.
  Easing curves (`easeOut`, `easeIn`, `easeInOut`, `easeOutBack`, `easeOutExpo`) are Motion `cubicBezier`s in `anim.ts`.
  Don't use `<motion.div animate>`, `useAnimate` or motion values: they run on wall-clock time, and Remotion renders each frame separately.
- Times are seconds on the edited music. Beats must stay contiguous and keep their start/end, or the music stops matching.
- Keep text in `script.ts`. Components read from it.
- Positions are in 1920×1080 frame pixels; inside the window they are window pixels (1620×880).
- The footage is the app only. Titles, mascot, tabs and the client message are drawn here, not in the footage.

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

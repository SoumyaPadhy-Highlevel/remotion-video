# Workflow Maps video — agent guide

This is the existing music-cut Workflow Maps video. Work in this repository;
do not confuse it with `../prototypes/workflow-maps-video` (the older LevelUp cut).
Read `CLAUDE.md` for the shared creative conventions and task recipes. Preserve
that file and Claude's plugin/configuration so either agent can use this project.

## Tooling and commands

- npm project, Node `^20.19.0 || ^22.13.0 || >=24`; existing Node 24 works.
- Remotion and all `@remotion/*` packages: 4.0.537; React/React DOM: 19.2.3;
  TypeScript: 5.9.3. Reuse `node_modules` and `package-lock.json`.
- Do not upgrade dependencies or scaffold a new project as part of ordinary edits.
- `npm run dev`: Remotion Studio, with Codex as the configured default agent.
- `npm run dev -- --coding-agent=claude-code`: select Claude for that launch.
  If Studio is already running, stop/restart that instance or use `--force-new`
  with another port to apply different launch settings.
- `npm run lint`: ESLint plus strict TypeScript checking (no emit).
- `npm run build`: bundle the existing video.
- `./node_modules/.bin/remotion compositions src/index.ts`: list compositions.
- Render only when requested; examples in `CLAUDE.md`. Put verification exports
  in ignored `out/` and avoid overwriting an existing export.

## Official Remotion skills

Official skills are installed in `.agents/skills/`. Read
`.agents/skills/remotion-best-practices/SKILL.md` and the relevant referenced
guidance before Remotion work. Use `remotion-studio` for preview,
`remotion-markup` for animation/component edits, and `remotion-render` for exports.
The installation source and pinned revision are in `CODEX_SETUP.md`.
Skills are guidance, not authorization to create a new video or upgrade packages.

## Architecture

- `src/index.ts` registers `RemotionRoot` in `src/Root.tsx`.
- `src/Composition.tsx` registers `WorkflowMaps` (1920×1080, 30 fps,
  3957 frames / 131.9 seconds) and `WorkflowMaps-Opening` (931 frames)
  for reviewing the opening independently.
- `src/video/StructureOpening.tsx`: the first 31.01 seconds, combining the actual
  staging list/detail panel with a geometric reconstruction and continuous motion.
  `StructureMap.tsx` owns the row-to-island morph, orthographic camera, extruded
  nonagon workflows, hexagonal assets, selection and connection pulses.
  `StructureIcons.ts` contains the product's local Iconify MDI paths.
  Its wording/timing is in `STRUCTURE_OPENING` in `script.ts`.
  It is used in the main composition before returning to beat 07. The original
  first six footage clips remain available in `public/footage/`.
- `public/captures/structure/`: real product captures and `provenance.json`
  recording the supplied location, frontend version URL and source PR revision.
  Reconstruction scope: the five verified folder names, Lead Capture's five
  workflows, and the selected workflow's four assets. It is an explanatory map,
  not a complete export of the live layout. Do not invent relationships.
- `src/video/script.ts`: source of truth for the 19 contiguous beats, music
  markers and all displayed wording/timing. Start here for text or timing work.
- `src/video/choreography.ts`: app-window rise, zooms, recedes and mascot reactions.
- `src/video/anim.ts`: deterministic easing, progress, visibility and `rand(i)`.
- `src/video/AppWindow.tsx`: sequences muted `OffthreadVideo` clips into the
  1620×880 window at frame position (150, 118), with `objectFit: contain`.
- `src/video/Stage.tsx`: background, tabs, titles, message and flashes.
- `src/video/Mascot.tsx`: mascot artwork and animated SVG eyes/effects.
- `src/video/WorkflowMapsVideo.tsx`: layer order and music with ending fade.
- `src/video/fonts.ts`: locally loaded Inter/Poppins fonts and shared CSS.
- `public/footage/`: 19 beat clips; default filename is `<beat-id>.mp4`.
  `public/brand/`, `public/fonts/`, and `public/music.mp3` supply local assets.
- `remotion.config.ts`: Rspack, JPEG render frames, overwrite-output behavior,
  two-second default premount, and preferred Studio coding agent.

## Animation and asset conventions

- Animation is a pure function of `t = frame / FPS`. Use `rand(i)` for variation;
  do not introduce `Math.random`, wall-clock time, timers or state-driven motion.
- Keep beats contiguous and preserve their music-aligned boundaries unless the
  user explicitly requests retiming. Derive frames with `Math.round(seconds * FPS)`.
- Keep wording in `script.ts`, not scattered through components.
- Outer coordinates are 1920×1080 frame pixels; inner coordinates are 1620×880
  window pixels. Preserve the existing layer order and locally loaded fonts.
- Footage contains only the app; titles, tabs, mascot and message are separate
  Remotion layers. Preserve scenes and assets unless the user requests changes.
- A beat can override `footage: { file, from, speed }`; `from` is source seconds
  and `speed` is playback rate. Check usable source duration covers the beat at
  that rate; increasing speed makes a short recording end sooner.
- Do not make creative changes during infrastructure/setup work.

## Verification

Run `npm run lint` and a bundle after relevant code changes. Open the existing
composition in Studio and inspect affected frames, including nearby beat
boundaries. Check media loads and timeline playback. Keep existing uncommitted
user edits intact and report verification limitations honestly.

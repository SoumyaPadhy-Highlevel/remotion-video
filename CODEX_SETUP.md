# Codex setup — 20 October 2026

The existing project is ready for Codex and remains compatible with Claude Code.
No new project was created and no animation, asset or dependency was changed.

## Installation

- Installed all 12 official skills from `remotion-dev/skills` into
  `.agents/skills/`: best-practices, captions, create, docs, interactivity, maps,
  markup, multimedia, render, saas, studio and upgrade (all `remotion-` prefixed).
- Source: https://github.com/remotion-dev/skills
- Pinned source revision: `039e8a2fc78b67efc228d5645367838b85818a1c`.
- All skill manifests declare version `4.0.537`, matching the project.
- Installed using Codex's bundled `skill-installer` GitHub installation helper,
  with `--repo remotion-dev/skills`, the pinned `--ref`, all 12 `skills/<name>`
  paths, and `--dest <project>/.agents/skills`. This copies the official files
  without changing npm packages or Claude's skills.
- Codex discovers repository skills when working in this repository or its
  descendants. They are available on the next turn in that project context;
  if discovery has not refreshed, reopen the project/chat. From a parent-folder
  chat, read this project's `AGENTS.md` and skill paths explicitly.
- Remotion downloaded its compatible Chrome Headless Shell for CLI validation.

## Configuration

- Added `AGENTS.md`: architecture, commands, animation constraints, asset
  conventions, verification, and explicit preservation of the Claude setup.
- Added `Config.setDefaultCodingAgent("codex")` to `remotion.config.ts`.
  Existing Rspack, JPEG, overwrite-output and premount settings are unchanged.
- Added links to these instructions in `README.md`.
- `CLAUDE.md` and the user-scoped Claude plugin `remotion@remotion` version
  `4.0.537` remain intact. The plugin was found at
  `~/.claude/plugins/cache/remotion/remotion/4.0.537`.

## Verification results

| Check | Result |
| --- | --- |
| Runtime and dependencies | Node 24.14.0, npm 11.9.0; existing installed dependencies valid |
| Remotion versions | All Remotion packages aligned at 4.0.537 |
| `npm run lint` | Passed: ESLint and strict TypeScript |
| `npm run build` | Passed; verification bundle moved to ignored `out/codex-setup/bundle/` |
| CLI composition enumeration | Passed with `--port=3011`: `WorkflowMaps`, 1920×1080, 30 fps, 3957 frames, 131.90 seconds |
| Studio | Started with Codex selected on port 3001; preview opened in Codex's browser |
| Browser preview | Existing footage, typography and mascot displayed; playback advanced through multiple beats; no warning/error console entries observed |
| Agent integration | Studio's “Generate with agent” dialog offered “Open in ChatGPT”, the installed macOS name used by Remotion for agent ID `codex`; context pointed to `src/video/WorkflowMapsVideo.tsx:14` |
| Source access | Codex read the animation architecture and confirmed all source files are writable |
| Preservation | SHA-256 comparison confirmed all 45 original source/assets/CLAUDE.md/package.json/package-lock.json files unchanged |

Studio was launched with:

```sh
npm run dev -- --no-open --coding-agent=codex --port=3001 --force-new
```

Preview: http://localhost:3001/WorkflowMaps

An existing server occupied port 3000. It was left alone. A separate port was
also needed for headless composition enumeration. Sandbox restrictions on local
server binding and the browser download were resolved with approved tool execution.

No full video export was produced. Verification covered compilation, composition
metadata and interactive preview; it was not an exhaustive visual review of every
frame. The agent handoff dialog was inspected without sending a generation prompt
or making any creative changes.

## Switching agents

Codex can now inspect and edit these same TypeScript/React animation files.
`npm run dev` defaults to Codex. To choose Claude for a subsequent launch, use
`npm run dev -- --coding-agent=claude-code`; this overrides the preference for
that launch. Restart an existing Studio or use `--force-new` and a free port
when changing launch settings. No dependency reinstall or project copy is needed.

## Official references

- Remotion skills: https://www.remotion.dev/docs/ai/skills
- Remotion preferred agent option: https://www.remotion.dev/docs/options/coding-agent
- Codex skill discovery: https://learn.chatgpt.com/docs/build-skills

# unity — WorkBuddy plugin

Unity's official game-development skills for [WorkBuddy](https://www.workbuddy.cn). Build,
monetize, and operate Unity games with guidance grounded in Unity's documented practices.

This plugin ships a **skill collection (31 skills)**, two **slash commands** and an always-on
**rule**. It has no MCP server and needs no API key.

| Component | Path | What it adds |
| --- | --- | --- |
| Skills | `skills/*/SKILL.md` | 31 Unity skills — see the table below |
| Command | `commands/skills.md` | `/unity:skills [what you want to do]` |
| Command | `commands/doctor.md` | `/unity:doctor [project path]` |
| Rule | `rules/unity.md` | Always-on: Unity routing and conventions |

## Install

WorkBuddy's plugin system is CodeBuddy-compatible, so this package also loads in **CodeBuddy
Code**.

**Option 1 — as a local marketplace (recommended).** Adds the plugin to the plugin manager so
you can install, enable and update it:

```bash
codebuddy plugin marketplace add ./for-workbuddy
codebuddy plugin install unity kaying-for-unity-marketplace
```

In the desktop app: **插件 → + → 添加插件市场**, point it at the `for-workbuddy` directory,
then install **unity** from the *个人* section.

**Option 2 — load the plugin directly (no install).** Good for a quick try:

```bash
codebuddy --plugin-dir ./for-workbuddy/plugins/unity
```

**Option 3 — from the packaged zip.** See the [package README](../README.md) for the
`npm run build:workbuddy` command that produces the uploadable zip.

## Use

```
/unity:doctor
/unity:skills set up a tilemap level with rule tiles
```

Or just ask in plain language — the always-on rule routes the request to the right skill:

- "Set up a tilemap level with rule tiles for my 2D game" → `tilemap-ruletile-createfromsegment`
- "Help me implement in-app purchases and set up LevelPlay ad mediation" →
  `implement-in-app-purchases`, `levelplay-unity-integration`
- "My materials turned magenta after switching to URP" → `migrate-birp-to-urp`
- "Set up multiplayer lobbies and networking" → `setup-multiplayer-services`
- "The UI is blurry and the pixels don't line up" → `2d-pixel-perfect`

## The 31 skills

| Area | Skills |
| --- | --- |
| Tooling | `new-unity-project`, `unity-cli`, `unity-package-management`, `generate-editor-search-query` |
| UI | `ui`, `ui-uitk`, `ui-ugui`, `ui-imgui` |
| 2D / Sprites | `2d-pixel-perfect`, `sprite-editor`, `sprite-segment-3x3grid`, `manage-sprite-atlas` |
| Tilemap | `tilemap-palette-create`, `tilemap-ruletile-createempty`, `tilemap-ruletile-createfromsegment` |
| Rendering | `migrate-birp-to-urp`, `urp-postprocessing`, `validate-urp-render-graph-renderer-feature`, `shader-graph-create-custom-node`, `optimize-web` |
| Audio | `audio-setup-mixers`, `optimize-audio` |
| Text | `optimize-text-mesh-pro` |
| Physics | `physics-3d-collision` |
| AI / Pathfinding | `initialize-ai-navigation` |
| Localization | `localization` |
| Multiplayer | `setup-multiplayer-services`, `setup-vivox-voice-chat` |
| Monetization | `implement-in-app-purchases`, `levelplay-unity-integration` |
| Backend / Live-ops | `build-live-game` |

## Behaviour

Two conventions the skills, the commands and the always-on rule all follow:

1. **Read the editor version from the project, never assume it** —
   `ProjectSettings/ProjectVersion.txt` is the source of truth. Render Graph guidance needs
   Unity 6+; URP 14–16 differs from later versions.
2. **Never hand-edit `Packages/manifest.json`.** It breaks dependency resolution; the
   `unity-package-management` skill drives the C# `UnityEditor.PackageManager.Client` API
   instead.

Two things worth knowing before you start:

- **When an Editor is open, drive it live.** `unity-cli` does this through the project's
  `com.unity.pipeline` package — install it first if it is missing. Prefer that over editing
  scene, prefab or asset YAML on disk.
- **Unity is not Tuanjie Engine (团结引擎).** A `cN` version suffix or a `packages.unity.cn`
  registry means the project is on Unity's China edition, which has a different editor binary,
  registry and cloud-service availability. That build lives in the separate
  `kaying-for-tuanjie` plugin.

## Notes

- The skills are plain Agent Skills (`SKILL.md` folders) and are identical to the ones the
  Claude Code, Codex, Pi and ZCode builds of this plugin ship — one source of truth under the
  repository's `skills/`. `npm run build:workbuddy` copies them in; do not edit the copies under
  `skills/` here by hand.
- `npm run build:workbuddy` also rebuilds `for-workbuddy/umbrella/unity/` and zips it to
  `dist/unity.zip`, for the WorkBuddy open platform's 技能 upload. That entry takes **one skill
  per archive, at most two directory levels deep** (`{skill-name}/SKILL.md`) and does not
  recurse, so all 31 skills ship as one umbrella skill: `SKILL.md` routes a request to the
  matching atomic skill, and each atomic skill's instructions and attachments are flattened into
  `references/`, `templates/` and `scripts/` under a `<skill>--` filename prefix. See the
  [package README](../README.md) for the layout and the upload steps.
- The routing tables in `scripts/build-workbuddy.mjs` are ported from the upstream
  `kaying-for-workbuddy` conversion, which packages this same 31-skill set. Keep the two in step
  when a skill is added or renamed.

## Licence

Content derives from Unity's official plugin and is distributed under the
[Unity Companion License](../../LICENSE.md).

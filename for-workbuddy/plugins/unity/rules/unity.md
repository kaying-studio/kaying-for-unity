---
alwaysApply: true
---

## Unity

This plugin bundles Unity's official game-development skills. When a request touches a Unity
project, use the matching skill rather than answering from general Unity knowledge — the skills
carry version constraints, API traps and project conventions that generic answers get wrong.

### Route Unity work to the bundled skills

| Request | Skill |
| --- | --- |
| Start a new game or project from scratch | `new-unity-project` |
| Install/upgrade editors, run builds or tests, drive a live Editor, read logs | `unity-cli` |
| Add / remove / upgrade / discover UPM packages; registry or resolution errors | `unity-package-management` |
| Find assets or scene objects in the editor | `generate-editor-search-query` |
| Any game UI (menus, HUDs, screens, panels) | `ui` (routes to `ui-ugui` / `ui-uitk` / `ui-imgui`) |
| 2D, Tilemap, RuleTile, sprites, atlases | `2d-pixel-perfect`, `tilemap-*`, `sprite-*`, `manage-sprite-atlas` |
| Render pipeline migration, post-processing, Shader Graph, WebGL size | `migrate-birp-to-urp`, `urp-postprocessing`, `validate-urp-render-graph-renderer-feature`, `shader-graph-create-custom-node`, `optimize-web` |
| Pathfinding, collision, physics symptoms | `initialize-ai-navigation`, `physics-3d-collision` |
| Audio, TextMeshPro | `audio-setup-mixers`, `optimize-audio`, `optimize-text-mesh-pro` |
| Multiplayer, voice chat | `setup-multiplayer-services`, `setup-vivox-voice-chat` |
| Monetization, ads, live-ops backend, languages | `implement-in-app-purchases`, `levelplay-unity-integration`, `build-live-game`, `localization` |

### Conventions

- **Read the editor version from the project, never assume it:**
  `ProjectSettings/ProjectVersion.txt`. Render Graph guidance requires Unity 6+; URP 14–16
  behaves differently from later versions. The file is the source of truth.
- **Never hand-edit scene, prefab or asset YAML**, and never hand-edit
  `Packages/manifest.json` — the latter routinely breaks dependency resolution. Drive the Editor
  through `unity-cli` and packages through `unity-package-management` (the C#
  `UnityEditor.PackageManager.Client` API).
- **When an Editor is open, drive it live** rather than editing files on disk — `unity-cli` does
  this through the project's `com.unity.pipeline` package. Install that package first if it is
  missing.
- **Distinguish Unity from Tuanjie Engine (团结引擎)** when it matters. A `cN` version suffix or
  a `packages.unity.cn` registry means the project is on Unity's China edition, which has a
  different editor binary, registry and cloud-service availability — say so instead of applying
  stock-Unity guidance.
- **Do not invent CLI command names.** Verify against `unity --help` / `unity <cmd> --help` on
  the user's machine rather than guessing.
- **Prefer the skill over improvisation** for anything in the table above; if two skills look
  plausible, name them and ask rather than picking one.

---
description: List the Unity skills this plugin ships, or route a request to the right one
argument-hint: "[optional: what you want to do, e.g. 'set up a tilemap level']"
---

# /unity:skills — Unity skill index

The plugin bundles 31 Unity skills under `skills/`. This command either lists them or picks the
one that fits what the user asked for.

## No argument — list the skills

Read the `name` and `description` frontmatter from every `skills/*/SKILL.md` in this plugin and
present them as a table, grouped by area:

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

Then point at the three entry points: `/unity:doctor` to check the project, plain language to
trigger a skill, and `README.md` for the full description of each skill.

## With an argument — route the request

1. Match `$ARGUMENTS` against the skill descriptions in `skills/*/SKILL.md`.
2. If one skill clearly wins, say which one and follow it — read its `SKILL.md` in full and
   execute its workflow.
3. If two or three are plausible, name them with one line each and ask which the user wants;
   never run a skill on a guess.
4. If nothing matches, say so and suggest the closest tooling skill rather than improvising.

For anything about a brand-new project, prefer `new-unity-project` — it owns the setup flow and
delegates the mechanics to `unity-cli` and `unity-package-management`, and hands monetization off
to `implement-in-app-purchases` / `levelplay-unity-integration` / `build-live-game`.

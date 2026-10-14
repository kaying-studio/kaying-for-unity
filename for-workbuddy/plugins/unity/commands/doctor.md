---
description: Check that the current project is a Unity project and report its editor version, package registry and Unity CLI install
argument-hint: "[optional project path; defaults to the current directory]"
---

# /unity:doctor — Unity project check

Inspect the project at `$ARGUMENTS` (or the current working directory when no argument is given)
and report what the Unity skills need to know. Report findings only — do not modify the project.

## 1. Is this a Unity project?

A project has both `Assets/` and `ProjectSettings/`. Check them:

```bash
PROJECT="${ARGUMENTS:-$PWD}"
test -d "$PROJECT/Assets" && test -d "$PROJECT/ProjectSettings" \
  && echo "project: yes" || echo "project: no"
```

If it is not a project, say so and stop.

## 2. Which editor version?

The version file is the source of truth — never assume:

```bash
cat "$PROJECT/ProjectSettings/ProjectVersion.txt"
```

Read `m_EditorVersion` and map it against the capabilities the skills assume:

| Editor | Baseline | Notes |
| --- | --- | --- |
| Unity 6.x | current | Required by `validate-urp-render-graph-renderer-feature` (Render Graph) and the UI Toolkit runtime-binding guidance |
| Unity 2022 LTS / 2023.x | older | URP 14–16; Render Graph is experimental and the review skill does not apply |
| Unity 2021 or earlier | legacy | Several skills assume APIs that do not exist yet — flag it and check the skill before following it |

Report the raw version string **and** the mapped line. If the project looks like a China-edition
(Tuanjie, 团结引擎) build rather than stock Unity — a `cN` suffix such as `2022.3.xxfNcN`, or a
`packages.unity.cn` registry — say so and hand off to the Tuanjie plugin rather than continuing.

## 3. Which package registry?

```bash
cat "$PROJECT/Packages/manifest.json" 2>/dev/null
```

- Expect `packages.unity.com` (stock Unity). A `packages.unity.cn` registry means this is a
  Tuanjie project: stop and hand off.
- Note the URP version (`com.unity.render-pipelines.universal`) — several rendering and 2D
  skills depend on it — and whether `com.unity.pipeline` is present, which is what lets
  `unity-cli` drive a live Editor.
- Do **not** hand-edit `Packages/manifest.json`. It routinely breaks dependency resolution; hand
  off to `unity-package-management`, which drives the C# `UnityEditor.PackageManager.Client` API.

## 4. Is the Unity CLI available?

```bash
command -v unity || echo "unity CLI: not found"
unity editors -i 2>/dev/null || true
```

Report whether the CLI is on `PATH` and, if so, whether the project's editor version is among
the installed editors. When it is missing, say that `unity-cli` can install it and that the
skills which drive a live Editor will need it. Also check whether an Editor is currently open on
this project — that is what `unity-cli` uses for live scene and asset edits.

## 5. Report

```markdown
## Unity doctor
- **Project** — path, and yes/no
- **Editor** — `m_EditorVersion` value, mapped capability line, Unity vs Tuanjie
- **Packages** — registry, URP version, `com.unity.pipeline` present/absent
- **CLI** — `unity` on PATH yes/no, editor version installed yes/no, Editor open yes/no
- **Next step** — the skill to run for whatever is wrong, or "ready"
```

If the project is healthy, say so in one line and stop — do not pad the report.

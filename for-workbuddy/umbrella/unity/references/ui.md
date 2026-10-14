# ui — Unity UI 总入口

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/ui/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `ui--`）。随附：无。
> 适用与触发：Unity UI 专家，负责菜单、HUD、界面、面板、按钮、文本标签等所有可视界面元素：处理场景或预制体中 UI 的现状摸查（有多少元素、有哪些、结构分析）、样式调整（颜色、边框、背景、字体、间距、圆角）、布局调整与 UI 生成，并按工程上下文路由到 UI Toolkit、uGUI 或 IMGUI。凡是「没有点名框架」的 UI 搭建、编辑或理解请求（菜单、HUD、设置页、暂停页）都应先咨询本技能，在写任何 UI 代码前先探测工程使用的是哪套 UI 系统，即使请求看起来简单到可以顺手写掉。关键词：UI、界面、菜单、HUD、设置页、暂停页、按钮、面板、布局、样式、UI 系统选型。

---
> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

Determine the appropriate UI system for the project and route to the correct specialized skill.

## When to Route vs Answer Directly

**Route to a specialized skill when:**
- User wants to understand, edit, or generate specific UI elements
- User references specific files or UI objects
- User asks for UI changes or creation

**Answer directly (without routing) when:**
- User asks comparative/educational questions ("What's the difference between UI Toolkit and uGUI?")
- User asks about UI system capabilities or recommendations ("Should I use UITK or uGUI for mobile?")
- User needs conceptual explanation of Unity UI architecture

## Routing Logic

**Step 1: Check for explicit file references or keywords:**

| User mentions | Route to |
|---------------|----------|
| `.uxml` or `.uss` files (including in `/Editor/`) | `ui-uitk` |
| "UI Toolkit", "UITK", "UIElements", "CreateGUI" | `ui-uitk` |
| Canvas prefabs/objects, `.prefab` with UI | `ui-ugui` |
| "uGUI", "Canvas", "RectTransform", "legacy UI" | `ui-ugui` |
| "IMGUI", "OnGUI", "OnInspectorGUI", "immediate mode" | `ui-imgui` |
| Figma URL (`figma.com/design/...`), "Figma", "import from Figma" | Not available — see below |

**For editor-related requests (EditorWindow, custom inspector, PropertyDrawer):**
- If no explicit UI system mentioned → **Go to Step 2** to detect project's editor UI system
- If no existing pattern is detected, default to `ui-uitk` for new editor UI
- Only use `ui-imgui` if project exclusively uses IMGUI or user explicitly requests it

If explicit file or keywords found, activate the corresponding skill immediately.

**Step 2: If ambiguous, detect from project:**

Search the project to determine which UI system is in use:

| Look for | Indicates |
|----------|-----------|
| `.uxml` or `.uss` files (including in `/Editor/`) | UI Toolkit (runtime or editor) |
| `UIDocument` components in scenes | UI Toolkit (runtime) |
| Editor scripts with `CreateGUI()` method | UI Toolkit (editor) |
| `Canvas` in scenes/prefabs | uGUI |
| `RectTransform` heavy usage | uGUI |
| Editor scripts with `OnGUI()` or `OnInspectorGUI()` | IMGUI (legacy editor) |

**Step 3: If still unclear, ask or default:**

- For existing projects: detect and follow whichever framework is already in use (Step 2)
- For new projects with no UI yet: ask the user which framework they prefer (UI Toolkit vs uGUI), briefly explaining that UI Toolkit is modern/CSS-like while uGUI is Canvas-based/mature
- For new runtime/game UI where the user has no preference: default to uGUI (`ui-ugui`)
- When the user mentions mobile/performance constraints or older Unity versions (pre-6.0): bias toward uGUI (`ui-ugui`)

## Request Types

Specialized skills handle three types of requests:

| Type | Examples |
|------|----------|
| **Understanding** | "What does this button do?", "How is this laid out?", "Explain this UI" |
| **Editing** | "Change this color", "Add a label here", "Fix this layout" |
| **Generation** | "Create a menu", "Make an inventory screen", "Build a settings panel" |

Route all types to the appropriate specialized skill based on the UI system.

## Available Sub-Skills

### UI Toolkit — `ui-uitk`
- For Unity 6.0+ projects using UI Toolkit (runtime game UI and editor tools)
- **Understands**, **edits**, and **generates** `.uxml` and `.uss` files
- Modern, CSS-like styling approach
- Preferred for new editor windows (CreateGUI) and existing UI Toolkit projects

### uGUI — `ui-ugui`
- For projects using Unity's Canvas-based UI system
- **Understands**, **edits**, and **generates** Canvas hierarchies
- Uses Layout Groups for responsive design
- Default for new runtime/game UI when the user has no framework preference

### IMGUI — `ui-imgui`
- For legacy editor tools using OnGUI/immediate mode
- Only use when project has existing IMGUI editor code or user explicitly requests IMGUI
- **Understands**, **edits**, and **generates** EditorWindow, inspectors, PropertyDrawers built with OnGUI
- Not for runtime game UI — for new editor tools, use UI Toolkit unless the project already uses IMGUI exclusively

### Figma design import — not available here

Importing a Figma design requires Unity's Figma integration service, which only exists
inside Unity AI Assistant. There is no client-side equivalent, so do not promise it.

If the user brings a Figma URL, say the automated import is not available here and offer
the alternative: ask them to describe or screenshot the screen, then build it with the
appropriate framework skill above.

## Common Guidelines (All UI Systems)

### Scope Discipline

**Do only what is requested:**
- Question → answer without making changes
- Targeted edit → modify only what's specified
- Generation → create only requested files
- Don't proactively add scripts unless explicitly asked

**These do NOT imply scripts:**
- "proper buttons" → well-styled buttons
- "working UI" → valid UI that renders
- "menu screen" → visual layout only

### Conventions

**Follow project patterns first.** Search existing files before applying defaults.

| Type | Convention |
|------|------------|
| Element names | Follow project patterns, or camelCase |
| File organization | Match existing project structure |

### Workflow

1. **Determine UI system** — Use routing logic above
   - For Figma requests, tell the user the automated import is not available here, then
     work from their description or screenshot and continue with framework detection
2. **Activate specialized skill** — Route to `ui-uitk`, `ui-ugui`, or `ui-imgui`
3. **Skill handles request** — Understanding, editing, or generation as appropriate

## Handling Mixed Projects

Many Unity projects use multiple UI systems simultaneously (e.g., UI Toolkit for runtime game UI plus editor tools). When you detect multiple systems:

- **For runtime UI requests** (menus, HUDs, game screens) → Route to whichever runtime system (UITK or uGUI) is already in use
- **For editor tool requests** (custom inspectors, editor windows):
  - **Prefer UI Toolkit** (CreateGUI) for new editor UI — it's the modern approach
  - Only use IMGUI if the project's existing editor tools use IMGUI exclusively, or user explicitly requests IMGUI
  - Check for existing editor `.uxml` files to confirm UITK usage
- **If creating new runtime UI in a mixed project** → Match the pattern used by similar existing UI; if there is no similar existing UI and the user has no preference, use uGUI

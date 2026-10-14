# ui-imgui — Unity IMGUI（即时模式）编辑器 UI

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/ui-imgui/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `ui-imgui--`）。随附：2 参考。
> 适用与触发：Unity IMGUI（即时模式 GUI）专家，面向使用 OnGUI / 即时模式的遗留编辑器工具。生成并修改 IMGUI 的 EditorWindow、自定义 Inspector、PropertyDrawer 及含 IMGUI 代码（OnGUI、OnInspectorGUI）的脚本。适用于维护现存 IMGUI 编辑器代码，或用户明确要求 IMGUI / OnGUI 的场景。不要用于新建编辑器窗口或工具：新的编辑器 UI 默认走 UI Toolkit（ui-uitk），除非工程本身就只用 IMGUI，或用户点名要求 OnGUI。关键词：IMGUI、OnGUI、即时模式、EditorWindow、Custom Inspector、PropertyDrawer、编辑器扩展、旧版编辑器 UI。

---
> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

**Before proceeding:** If the user is asking about creating a **new** editor window, custom inspector, or PropertyDrawer without explicitly mentioning IMGUI/OnGUI, recommend using UI Toolkit (CreateGUI) instead, as it's the modern approach. Only proceed with IMGUI if:
- User is modifying existing IMGUI code
- User explicitly requests IMGUI/immediate mode
- The project exclusively uses IMGUI for editor tools

When activated, read the reference files:
- [references/ui-imgui--templates.md](references/ui-imgui--templates.md) — EditorWindow, Inspector, PropertyDrawer templates
- [references/ui-imgui--gui-elements.md](references/ui-imgui--gui-elements.md) — GUI elements, layout groups, styling

## When to Use This Skill

**IMPORTANT:** This skill is for **legacy IMGUI code only**. Use this skill when:

- User is maintaining/updating **existing** IMGUI editor code (files with `OnGUI()`, `OnInspectorGUI()`)
- User **explicitly requests** IMGUI/immediate mode GUI
- Project exclusively uses IMGUI for all editor tools

**Do NOT use this skill for:**
- New editor windows (use UI Toolkit with `CreateGUI()` instead)
- New custom inspectors (use UI Toolkit instead)
- Requests that don't explicitly mention IMGUI or OnGUI

**Legacy IMGUI is used for:**
- **Editor windows** — `EditorWindow` classes with `OnGUI()`
- **Custom inspectors** — `Editor`, `PropertyDrawer` classes with `OnInspectorGUI()`
- **Debug overlays** — `OnGUI()` in MonoBehaviour (runtime)

IMGUI is **not** for runtime game UI — use UI Toolkit or uGUI instead.

## Scope

**Generate only what is requested (for legacy IMGUI code):**

| Request | Output | Note |
|---------|--------|------|
| Editor window (IMGUI/OnGUI) | `EditorWindow` with `OnGUI()` | Only if explicitly IMGUI |
| Custom inspector (IMGUI) | `Editor` with `OnInspectorGUI()` | Only if explicitly IMGUI |
| Property drawer (IMGUI) | `PropertyDrawer` with `OnGUI()` | Only if explicitly IMGUI |
| Debug overlay | `MonoBehaviour` with `OnGUI()` | Runtime debugging |
| Update existing IMGUI script | Modify existing OnGUI code | Always appropriate |

**Clarify if ambiguous:**
- "inspector" → Custom Editor for a specific type, or PropertyDrawer? **Also ask:** Should this use UI Toolkit (modern) or IMGUI (legacy)?
- "editor window" → **First ask:** Should this use UI Toolkit (modern/CreateGUI) or IMGUI (legacy/OnGUI)?
- "tool window" → EditorWindow with what functionality? Which UI system?

## Conventions

**Follow project patterns first.** Search existing editor scripts before applying defaults.

| Type | Convention | Good | Bad |
|------|------------|------|-----|
| Script names | PascalCase | `MyToolWindow.cs` | `my-tool-window.cs` |
| EditorWindow | `[Name]Window.cs` | `LevelEditorWindow.cs` | `LevelEditor.cs` |
| Custom Editor | `[Type]Editor.cs` | `EnemyEditor.cs` | `EnemyInspector.cs` |
| PropertyDrawer | `[Type]Drawer.cs` | `RangeDrawer.cs` | `RangePropertyDrawer.cs` |
| Location | `Editor` folder | `Assets/Editor/` | `Assets/Scripts/` |

**Editor folder is required** — Scripts using `UnityEditor` namespace must be in an `Editor` folder or they will fail to build.

## Workflow

1. **Analyze** — Determine script type needed (EditorWindow, Editor, PropertyDrawer, etc.)
2. **Search** — Find existing editor scripts to match patterns
3. **Follow project patterns** — Match folder structure and naming
4. **Create script** — Use appropriate base class and attributes
5. **Implement OnGUI** — Build the interface with layout groups

## Script Structure

### EditorWindow
```
[MenuItem attribute] → adds to menu
ShowWindow() static method → opens window
OnGUI() → draws interface
OnEnable/OnDisable → initialization/cleanup
```

### Custom Editor
```
[CustomEditor attribute] → targets component type
OnInspectorGUI() → draws inspector
OnEnable() → cache SerializedProperties
serializedObject.Update/ApplyModifiedProperties → undo support
```

### PropertyDrawer
```
[CustomPropertyDrawer attribute] → targets type or attribute
OnGUI(Rect, SerializedProperty, GUIContent) → draws property
GetPropertyHeight() → custom height if needed
```

## Key Rules

- **Cache GUIStyle objects** — never create new GUIStyle in OnGUI (causes memory allocation every frame)
- **Use SerializedProperty** — for proper undo/redo support in inspectors
- **Call ApplyModifiedProperties()** — after any serialized object changes
- **Use EditorGUILayout** — for editor scripts (auto-layout)
- **Use GUILayout** — for runtime OnGUI
- **Begin/End pairs** — always match BeginHorizontal with EndHorizontal, etc.
- **Editor folder required** — scripts fail to build if not in Editor folder

## Layout Basics

**Horizontal grouping:**
```csharp
EditorGUILayout.BeginHorizontal();
// elements appear side by side
EditorGUILayout.EndHorizontal();
```

**Vertical grouping:**
```csharp
EditorGUILayout.BeginVertical("box");
// elements appear stacked, with box style
EditorGUILayout.EndVertical();
```

**Scroll view:**
```csharp
scrollPos = EditorGUILayout.BeginScrollView(scrollPos);
// scrollable content
EditorGUILayout.EndScrollView();
```

**Foldout section:**
```csharp
showSection = EditorGUILayout.Foldout(showSection, "Section Name");
if (showSection)
{
    EditorGUI.indentLevel++;
    // section content
    EditorGUI.indentLevel--;
}
```

## Common Patterns

**Button with action:**
```csharp
if (GUILayout.Button("Do Something"))
{
    // action here
}
```

**Property field with label:**
```csharp
EditorGUILayout.PropertyField(myProperty, new GUIContent("Label"));
```

**Object reference field:**
```csharp
myObject = (MyType)EditorGUILayout.ObjectField("Label", myObject, typeof(MyType), true);
```

**Disabled group:**
```csharp
EditorGUI.BeginDisabledGroup(condition);
// disabled elements
EditorGUI.EndDisabledGroup();
```

## Best Practices

- Use `SerializedObject` and `SerializedProperty` for undo support
- Cache property references in `OnEnable()`
- Use `EditorUtility.SetDirty()` only for non-serialized changes
- Use `Undo.RecordObject()` before modifying objects directly
- Use `EditorStyles` for consistent appearance
- Use `GUILayout.FlexibleSpace()` to push elements apart

See `references/ui-imgui--templates.md` for complete script templates.
See `references/ui-imgui--gui-elements.md` for full element reference.

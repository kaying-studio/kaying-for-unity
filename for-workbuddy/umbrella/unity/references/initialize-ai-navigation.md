# initialize-ai-navigation — Unity AI 导航（NavMesh）

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/initialize-ai-navigation/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `initialize-ai-navigation--`）。随附：1 参考。
> 适用与触发：搭建并配置 Unity AI Navigation 系统——NavMesh 表面、NavMesh Agent、障碍物（Obstacle）、链接（Link）、修饰器（Modifier）、区域与代价。适用于创建可行走导航网格、添加寻路 Agent、设置巡逻路线、配置避障与挖洞、用 Link 连接分离的 NavMesh、把导航与动画耦合，或排查寻路异常。关键词：NavMesh、AI 导航、寻路、pathfinding、Agent、巡逻、避障、障碍物、OffMeshLink。

---
> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

Determine what the user needs and guide them through navigation setup. See [navigation-system.md](references/initialize-ai-navigation--navigation-system.md) for expanded component details, API notes, code recipes, and troubleshooting.

### Passing C# to `eval`

`eval` compiles a **statement block, not a file**. Two consequences, both of which cause a
compile error rather than a warning:

- **No `using` directives.** The compiler reads `using UnityEngine;` as a resource-disposal
  statement and rejects it (`CS0210`).
- **Types must be fully qualified.** A bare `AssetDatabase` or `Volume` does not resolve
  (`CS0246` / `CS0103`), and a bare `Object` is ambiguous with `object` (`CS0104`).

Where a snippet below is written as a file — with usings, for readability, or because it is
meant to be saved into the project — qualify the types before passing it to `eval`.

## Routing Logic

| User Says | Interpretation |
|-----------|---------------|
| "add navigation" / "set up nav" | Full setup: NavMeshSurface + bake + NavMeshAgent |
| "make this character navigate" | Add NavMeshAgent, ensure NavMesh exists |
| "add pathfinding" | NavMeshAgent + movement script |
| "agent won't move" / "path not found" | Troubleshoot — see Troubleshooting Decision Tree in reference |
| "avoid obstacles" | NavMeshObstacle with carving or avoidance |
| "connect two areas" / "jump across" | NavMeshLink between areas |
| "patrol between points" | NavMeshAgent + patrol script |
| "click to move" | NavMeshAgent + raycast click-to-move script |
| "animate the character while navigating" | Couple Animator with NavMeshAgent |
| "different agent sizes" | Configure agent types in Navigation window |
| "areas and costs" / "restrict areas" | NavMesh area types, modifiers, and agent area masks |

## Workflow

### 0. Package Installation Check
Before doing anything else, verify that `com.unity.ai.navigation` is installed. If it's missing,
add it to `Packages/manifest.json` under `dependencies` — Unity resolves it when the Editor next
regains focus, and this needs no Editor connection:

```json
"com.unity.ai.navigation": "<current 2.x version>"
```

Don't invent the version string. Read the current one from the Unity registry —
`https://packages.unity.com/com.unity.ai.navigation` lists every published version — or copy the version an
adjacent Unity package in this manifest already uses. A version that doesn't exist makes
Unity fail resolution **silently**, so a wrong guess looks like nothing happened.

Proceed only once it's confirmed installed. If you have a live Editor to run C# in, see
[navigation-system.md](references/initialize-ai-navigation--navigation-system.md) for the `Client.Add` equivalent.

### 1. Pre-Flight: Assess Current Navigation Setup
Before making changes, inspect what already exists:
1. Find the existing navigation components. With a connected Editor, query the live scene for
   `NavMeshSurface`, `NavMeshAgent`, `NavMeshObstacle`, `NavMeshLink` and `NavMeshModifier` — see
   the `unity-cli` skill for driving a running Editor. Without one, search the scene and prefab
   files for those component names.
2. Check configured agent types via **Window > AI > Navigation > Agents tab**.
3. Summarize ALL detected navigation components before proposing changes.

### 2. Gather Missing Information
Before creating components, ensure the user has specified: walkable surfaces, agent type/size, agent behavior, obstacles, links, and area/cost requirements. Ask if anything is unclear. See the Information Gathering Checklist in the reference for full details.

### 3. Planning & Execution
Follow this general order. See the Component Setup Guide in the reference for detailed step-by-step instructions per component:
1. **NavMesh Surface** — create the walkable mesh (bake it)
2. **NavMesh Agent** — add pathfinding characters
3. **NavMesh Obstacle** — add dynamic obstacles
4. **NavMesh Link** — connect disconnected NavMesh areas
5. **NavMesh Modifier / Modifier Volume** — fine-tune area types
6. **Scripts** — movement, patrol, click-to-move, animation coupling (see Common Recipes in reference)

### 4. Validation
After setup, confirm:
- NavMesh is baked and visible (blue overlay)
- NavMeshSurface agent type matches NavMeshAgent agent type
- Agents have a valid path to their destination
- Obstacles carve or obstruct correctly
- Links have both ends connected and Activated is enabled
- Area masks allow the intended movement
- No conflicting components (see Mixing Components Guide in reference)
- If using Rigidbody with NavMeshAgent, Is Kinematic is enabled

### 5. Final Confirmation
Summarize what was created or changed:
- NavMesh Surfaces: which GameObject, agent type, geometry mode, bake status
- NavMesh Agent(s): which GameObject, speed, stopping distance, area mask
- NavMesh Obstacle(s): which GameObject, shape, carve on/off
- NavMesh Link(s): start/end, bidirectional, area type
- Scripts: which scripts attached to which GameObjects
- Any manual steps required (adjust waypoints, re-bake after scene changes, etc.)

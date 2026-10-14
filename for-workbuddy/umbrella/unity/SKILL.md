---
name: unity
display_name: Unity 游戏开发（总入口）
display_name_en: Unity Game Development (Entry Point)
description: Unity 游戏开发的统一入口。凡涉及 Unity 工程的开发任务都先走本技能——它不写代码，只判定领域、加载对应的原子技能，再严格按该技能执行。覆盖：新建工程与 CLI/编辑器自动化、UPM 包管理、UI（UI Toolkit/uGUI/IMGUI）、2D 像素完美与精灵/图集、Tilemap 与 RuleTile、渲染（URP 迁移、后处理、Render Graph 校验、Shader Graph 自定义节点）、WebGL/WebGPU 与音频/TextMeshPro 性能优化、3D 物理碰撞排查、AI 导航、本地化、多人联机与 Vivox 语音、内购 IAP 与 LevelPlay 广告变现、Unity Services 在线运营后端、Unity Search 查询。关键词：Unity、游戏开发、unity-cli、UPM、UI Toolkit、UXML、USS、uGUI、IMGUI、Pixel Perfect、Sprite、SpriteAtlas、Tilemap、RuleTile、URP、Render Graph、Shader Graph、WebGL、TextMeshPro、TMP、NavMesh、Localization、IAP、LevelPlay、Vivox、Multiplayer、Unity Services。
description_zh: Unity 游戏开发的统一入口，负责判定领域并加载对应的原子技能。
description_en: Single entry point for Unity game development. Routes any Unity project request to the right atomic skill — project setup and Unity CLI/Editor automation, UPM packages, UI (UI Toolkit / uGUI / IMGUI), 2D pixel-perfect and sprites/atlases, Tilemap and RuleTile, rendering (URP migration, post-processing, Render Graph validation, Shader Graph custom nodes), WebGL/audio/TextMeshPro optimization, 3D physics diagnostics, AI navigation, localization, multiplayer and Vivox voice, IAP and LevelPlay ad monetization, Unity Services live-ops backend, and Unity Search queries.
category: development
version: 0.1.6-beta
author: Unity Technologies
metadata:
  author: Unity Technologies
  homepage: https://unity.com
  category: development
  source_plugin: kaying-for-unity@0.1.6-beta
  harness: workbuddy
  umbrella: true
  bundles_skills: 31
  layout: flat-two-level
---

> 本技能是 `kaying-for-unity@0.1.6-beta` 的 WorkBuddy **总入口**，内含全部 31 个原子技能。
> WorkBuddy 技能包只支持两级目录（根目录/二级目录/文件），因此原子技能的指令与随附文件被平铺进
> `references/`、`templates/`、`scripts/`，用 `<skill-name>--` 前缀区分归属；正文与资料内容保持原样。

---

# Unity 游戏开发 — 总入口

本技能覆盖 Unity 游戏开发的全部领域，但**它自己几乎不写代码**。
它只做一件事：**判定领域 → 加载对应的原子技能 → 严格按该技能的正文执行**。

判断依据、API 用法、版本约束、检查点、工具调用方式，**一律以原子技能正文为准**，不要用通用 Unity 知识覆盖它。

## 工作方式（三步）

1. **判定领域** —— 对照 `references/ROUTING.md`（需求 → 技能判定表）确定唯一目标技能；命中多个时按 `工程搭建 > 执行底座 > 具体领域` 排序。
2. **加载原子技能** —— 读 `references/<skill-name>.md`。那是该技能的完整指令，优先级高于本文件里的一切概括。
3. **按其执行** —— 原子技能若要求读它自己的参考文档/模板/脚本，用 `<skill-name>--` 前缀在 `references/`、`templates/`、`scripts/` 下按同名查找（正文里的引用已改写为完整路径，直接照用）。

## 硬规则

- **不要跳过原子技能直接作答。** 31 个技能里沉淀了大量版本约束、API 陷阱与工程规范，凭通用知识会答错。
- **先看原子技能正文顶部是否有「WorkBuddy 运行前置」。** 若有 UPM 包约束，先确认工程 `Packages/manifest.json`，缺失则先装包（走 `unity-package-management`）。
- **要改工程就先接上活体 Editor。** 多数技能都写着「由 `unity-cli` 技能负责把你接上去」——照做，不要重推一遍前置步骤。
- **不要手工改场景/资源的 YAML**，走 Editor 与 CLI。
- **不要凭空拼 `templates/` 路径。** 文件名带技能前缀（如 `templates/manage-sprite-atlas--spriteatlasprebuildgenerator.cs`），以正文里的链接为准。

## 委托链（原子技能之间的既定关系，照做不重推）

- **`ui` 是 UI 领域路由** —— 先探测工程使用的 UI 系统，再交给 `ui-uitk`（新编辑器 UI）/ `ui-ugui`（Canvas 运行时 UI）/ `ui-imgui`（遗留 `OnGUI`）。任何没点名的 UI 需求都先过它。
- **`new-unity-project` 是建项主流程** —— 机制委托给 `unity-cli`（CLI/Editor/版本控制）与 `unity-package-management`（UPM 包），收尾把变现移交给 `implement-in-app-purchases` / `levelplay-unity-integration` / `build-live-game`。它自己不生成玩法代码。
- **`unity-cli` 是共用的执行底座** —— 多数需要动工程的技能都写着「由 `unity-cli` 技能负责把你接上去」（装 CLI、确认已连接 Editor、加 `com.unity.pipeline`、区分 Editor 不存在与 Safe Mode、发现命令目录）。**照做，不要重推一遍。**
- **`sprite-segment-3x3grid` → `tilemap-ruletile-createfromsegment`** —— 前者输出的 3×3 文本图案（`X`/`.`/`*`）是后者的输入，`.` 映射 `This`、`X` 映射 `DontCare`，按具体度排序。
- **`tilemap-ruletile-createempty` 有明确的让位条件** —— 只要用户提到已有精灵、地形美术、边缘瓦片或瓦片目录，就改用 `tilemap-ruletile-createfromsegment`。

## 技能目录

完整目录（含随附文件数与指令文件路径）见 `references/INDEX.md`。速查表：

| 领域 | 技能 | 指令文件 | 用途 |
|---|---|---|---|
| 工程搭建 | `new-unity-project` | `references/new-unity-project.md` | 从想法到可运行工程的引导式建项流程 |
| 工程搭建 | `unity-cli` | `references/unity-cli.md` | 从终端驱动 Unity CLI 与活体 Editor，跑构建与测试 |
| 工程搭建 | `unity-package-management` | `references/unity-package-management.md` | 编辑器外程序化增删/升级/校验 UPM 包 |
| UI | `ui` | `references/ui.md` | UI 总路由：探测工程所用 UI 系统后分发 |
| UI | `ui-uitk` | `references/ui-uitk.md` | UI Toolkit / UXML / USS / PanelSettings |
| UI | `ui-ugui` | `references/ui-ugui.md` | Canvas、RectTransform、Layout Group、预制体 UI |
| UI | `ui-imgui` | `references/ui-imgui.md` | 遗留 OnGUI / EditorWindow / Custom Inspector |
| 2D / 精灵 | `2d-pixel-perfect` | `references/2d-pixel-perfect.md` | 像素完美渲染的两套实现（URP 与 Built-in） |
| 2D / 精灵 | `sprite-editor` | `references/sprite-editor.md` | 用 ISpriteEditorDataProvider 改精灵 rect/border/pivot/切图 |
| 2D / 精灵 | `sprite-segment-3x3grid` | `references/sprite-segment-3x3grid.md` | 按颜色把精灵切成 3×3 网格并输出文本图案 |
| 2D / 精灵 | `manage-sprite-atlas` | `references/manage-sprite-atlas.md` | 预构建管线管理 SpriteAtlas 与变体图集 |
| 瓦片地图 | `tilemap-palette-create` | `references/tilemap-palette-create.md` | 创建 Tile Palette 资源 |
| 瓦片地图 | `tilemap-ruletile-createempty` | `references/tilemap-ruletile-createempty.md` | 创建空白 RuleTile（无精灵输入） |
| 瓦片地图 | `tilemap-ruletile-createfromsegment` | `references/tilemap-ruletile-createfromsegment.md` | 由地形/边缘精灵生成自动拼接 RuleTile |
| 渲染 | `migrate-birp-to-urp` | `references/migrate-birp-to-urp.md` | 内置管线迁 URP 的规划、执行与排障 |
| 渲染 | `urp-postprocessing` | `references/urp-postprocessing.md` | Volume 框架下的 URP 后处理配置与调试 |
| 渲染 | `validate-urp-render-graph-renderer-feature` | `references/validate-urp-render-graph-renderer-feature.md` | 审查 Render Graph 版 ScriptableRendererFeature |
| 渲染 | `shader-graph-create-custom-node` | `references/shader-graph-create-custom-node.md` | 把 HLSL 生成 Shader Graph 自定义节点 |
| 渲染 | `optimize-web` | `references/optimize-web.md` | WebGL/WebGPU 包体、首屏与浏览器运行时优化 |
| 音频 | `audio-setup-mixers` | `references/audio-setup-mixers.md` | 盘点音频并路由进正确的 Audio Mixer Group |
| 音频 | `optimize-audio` | `references/optimize-audio.md` | 音频导入设置与混音器层面的内存/CPU 优化 |
| 文本 | `optimize-text-mesh-pro` | `references/optimize-text-mesh-pro.md` | TMP 字体栈、动态图集、SDF 与文本渲染性能 |
| 物理 | `physics-3d-collision` | `references/physics-3d-collision.md` | 3D PhysX 碰撞与触发器不生效的诊断 |
| AI / 寻路 | `initialize-ai-navigation` | `references/initialize-ai-navigation.md` | NavMesh 表面、Agent、障碍物、Link 与区域代价 |
| 本地化 | `localization` | `references/localization.md` | Locale、String/Asset Table、CJK 字体与 Addressables |
| 多人联机 | `setup-multiplayer-services` | `references/setup-multiplayer-services.md` | 联机拓扑、托管、匹配、服务发现与会话玩法 |
| 多人联机 | `setup-vivox-voice-chat` | `references/setup-vivox-voice-chat.md` | Vivox 语音与文字聊天、VAD、空间语音、按键说话 |
| 变现 | `implement-in-app-purchases` | `references/implement-in-app-purchases.md` | IAP 全流程与原生/第三方计费迁移 |
| 变现 | `levelplay-unity-integration` | `references/levelplay-unity-integration.md` | LevelPlay 广告聚合 SDK 接入与排障 |
| 后端 / 在线运营 | `build-live-game` | `references/build-live-game.md` | Unity Services 驱动的后端与在线运营能力 |
| 编辑器工具 | `generate-editor-search-query` | `references/generate-editor-search-query.md` | 生成 Unity Search 查询做只读资产查找 |

## 判定边界（常见误路由）

- 工程概览 / 目录结构总结 / 玩法讲解 / 编程问答 → **不是** `generate-editor-search-query`。
- 2D 物理、Unity Physics(DOTS) 包 → 不在 `physics-3d-collision` 主范围（它只给带范围声明的简要回答）。
- UI Toolkit 布局 → 不走 `optimize-text-mesh-pro`；非 TMP 的 uGUI 也不走。
- 实时联机（连接/分组/匹配/会话）→ `setup-multiplayer-services`；排行榜/云存档/无实时连接的后端 → `build-live-game`。
- 没点名框架的 UI 需求 → 先过 `ui` 路由技能，不要凭直觉直接选 `ui-uitk` / `ui-ugui`。
- 新建编辑器窗口/工具 → 不要走 `ui-imgui`（那是遗留代码维护专用）。
- 审查类技能（`validate-urp-render-graph-renderer-feature`）只出问题清单，不主动改代码。


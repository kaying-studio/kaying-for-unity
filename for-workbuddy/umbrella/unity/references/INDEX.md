# 原子技能索引（31）

本总入口把上游的 31 个原子技能全部平铺在 `references/` 下（WorkBuddy 技能包只支持两级目录，所以不能保留 `skills/<name>/` 的插件层级）。每个技能的指令文件是 `references/<skill-name>.md`，其随附文件以 `<skill-name>--` 为前缀平铺在 `references/` / `templates/` / `scripts/` 里。

| 领域 | `skill-name` | 展示名称 | 用途 | 随附 | 指令文件 |
|---|---|---|---|---|---|
| 工程搭建 | `new-unity-project` | 新建 Unity 项目 | 从想法到可运行工程的引导式建项流程 | — | `references/new-unity-project.md` |
| 工程搭建 | `unity-cli` | Unity CLI 与活体 Editor 控制 | 从终端驱动 Unity CLI 与活体 Editor，跑构建与测试 | 11 参考 | `references/unity-cli.md` |
| 工程搭建 | `unity-package-management` | Unity 包管理（UPM） | 编辑器外程序化增删/升级/校验 UPM 包 | 1 参考 | `references/unity-package-management.md` |
| UI | `ui` | Unity UI 总入口 | UI 总路由：探测工程所用 UI 系统后分发 | — | `references/ui.md` |
| UI | `ui-uitk` | Unity UI Toolkit（UXML/USS） | UI Toolkit / UXML / USS / PanelSettings | 7 参考 | `references/ui-uitk.md` |
| UI | `ui-ugui` | Unity uGUI（Canvas） | Canvas、RectTransform、Layout Group、预制体 UI | 1 参考 | `references/ui-ugui.md` |
| UI | `ui-imgui` | Unity IMGUI（即时模式）编辑器 UI | 遗留 OnGUI / EditorWindow / Custom Inspector | 2 参考 | `references/ui-imgui.md` |
| 2D / 精灵 | `2d-pixel-perfect` | Unity 2D 像素完美渲染 | 像素完美渲染的两套实现（URP 与 Built-in） | 5 参考 | `references/2d-pixel-perfect.md` |
| 2D / 精灵 | `sprite-editor` | Unity 精灵编辑 | 用 ISpriteEditorDataProvider 改精灵 rect/border/pivot/切图 | 3 参考, 9 脚本 | `references/sprite-editor.md` |
| 2D / 精灵 | `sprite-segment-3x3grid` | 精灵 3×3 网格分析 | 按颜色把精灵切成 3×3 网格并输出文本图案 | 1 脚本 | `references/sprite-segment-3x3grid.md` |
| 2D / 精灵 | `manage-sprite-atlas` | Unity 精灵图集（Sprite Atlas） | 预构建管线管理 SpriteAtlas 与变体图集 | 6 参考, 38 模板 | `references/manage-sprite-atlas.md` |
| 瓦片地图 | `tilemap-palette-create` | Tile 调色板创建 | 创建 Tile Palette 资源 | 1 脚本 | `references/tilemap-palette-create.md` |
| 瓦片地图 | `tilemap-ruletile-createempty` | 空 RuleTile 创建 | 创建空白 RuleTile（无精灵输入） | 2 参考 | `references/tilemap-ruletile-createempty.md` |
| 瓦片地图 | `tilemap-ruletile-createfromsegment` | 从精灵生成 RuleTile | 由地形/边缘精灵生成自动拼接 RuleTile | 3 脚本 | `references/tilemap-ruletile-createfromsegment.md` |
| 渲染 | `migrate-birp-to-urp` | Unity 内置管线迁移 URP | 内置管线迁 URP 的规划、执行与排障 | 6 参考 | `references/migrate-birp-to-urp.md` |
| 渲染 | `urp-postprocessing` | Unity URP 后处理 | Volume 框架下的 URP 后处理配置与调试 | 2 参考 | `references/urp-postprocessing.md` |
| 渲染 | `validate-urp-render-graph-renderer-feature` | URP Render Graph 特性校验 | 审查 Render Graph 版 ScriptableRendererFeature | — | `references/validate-urp-render-graph-renderer-feature.md` |
| 渲染 | `shader-graph-create-custom-node` | Shader Graph 自定义节点 | 把 HLSL 生成 Shader Graph 自定义节点 | 1 模板 | `references/shader-graph-create-custom-node.md` |
| 渲染 | `optimize-web` | Unity WebGL/WebGPU 优化 | WebGL/WebGPU 包体、首屏与浏览器运行时优化 | 2 模板 | `references/optimize-web.md` |
| 音频 | `audio-setup-mixers` | Unity 音频混音器路由 | 盘点音频并路由进正确的 Audio Mixer Group | 1 参考 | `references/audio-setup-mixers.md` |
| 音频 | `optimize-audio` | Unity 音频性能优化 | 音频导入设置与混音器层面的内存/CPU 优化 | 2 参考 | `references/optimize-audio.md` |
| 文本 | `optimize-text-mesh-pro` | Unity TextMeshPro 优化 | TMP 字体栈、动态图集、SDF 与文本渲染性能 | — | `references/optimize-text-mesh-pro.md` |
| 物理 | `physics-3d-collision` | Unity 3D 物理碰撞诊断 | 3D PhysX 碰撞与触发器不生效的诊断 | 1 参考, 1 模板 | `references/physics-3d-collision.md` |
| AI / 寻路 | `initialize-ai-navigation` | Unity AI 导航（NavMesh） | NavMesh 表面、Agent、障碍物、Link 与区域代价 | 1 参考 | `references/initialize-ai-navigation.md` |
| 本地化 | `localization` | Unity 本地化 | Locale、String/Asset Table、CJK 字体与 Addressables | 1 参考, 2 模板 | `references/localization.md` |
| 多人联机 | `setup-multiplayer-services` | Unity 多人服务 | 联机拓扑、托管、匹配、服务发现与会话玩法 | 6 参考 | `references/setup-multiplayer-services.md` |
| 多人联机 | `setup-vivox-voice-chat` | Unity Vivox 语音聊天 | Vivox 语音与文字聊天、VAD、空间语音、按键说话 | 5 参考 | `references/setup-vivox-voice-chat.md` |
| 变现 | `implement-in-app-purchases` | Unity 内购 IAP | IAP 全流程与原生/第三方计费迁移 | 13 参考 | `references/implement-in-app-purchases.md` |
| 变现 | `levelplay-unity-integration` | Unity LevelPlay 广告聚合 | LevelPlay 广告聚合 SDK 接入与排障 | 12 参考 | `references/levelplay-unity-integration.md` |
| 后端 / 在线运营 | `build-live-game` | Unity 在线运营游戏（Unity Services） | Unity Services 驱动的后端与在线运营能力 | 10 参考 | `references/build-live-game.md` |
| 编辑器工具 | `generate-editor-search-query` | Unity Search 查询生成 | 生成 Unity Search 查询做只读资产查找 | 2 参考 | `references/generate-editor-search-query.md` |

合计 31 个原子技能 · 100 份参考文档 · 44 个模板 · 14 个脚本。

上游技能的 `resources/` 目录已被拆开：其中的 `.md` 进 `references/`，`.cs`/`.hlsl`/`.sh` 进 `templates/`。


# 需求 → 技能 判定表

先按用户原话在下表定位技能；命中多条时按 `工程搭建 > 执行底座 > 具体领域` 的顺序处理。

「走这个技能」列给出的是技能名；对应的指令文件是 `references/<技能名>.md`。

| 用户这么说 | 走这个技能 | 备注 |
|---|---|---|
| 「做一个 XX 类型的游戏」「开新坑」「搭原型」「Unity 工程初始化」 | `new-unity-project` | 流程主入口，会后台装 Editor 并委托 unity-cli / unity-package-management |
| 安装/升级 Unity Editor、管理与模块、许可证与登录、看日志、跑构建、跑测试、为 AI 配 Unity MCP | `unity-cli` | CLI 与活体 Editor 的执行底座 |
| 在编辑器外增删/升级/查询 UPM 包、无头或 CI 装包、按品类选包、校验包版本 | `unity-package-management` | CLI 不管理 UPM 包，本技能补这个缺口 |
| 任何没说框架的 UI 需求（菜单、HUD、设置页、暂停页、样式与布局调整、UI 现状摸查） | `ui` | 路由技能：先探测工程用的哪套 UI 系统 |
| 新建编辑器 UI/工具、改 .uxml/.uss、UIElements/UIDocument/PanelSettings、运行时数据绑定 | `ui-uitk` | 新 UI 默认走 UI Toolkit |
| 运行时 Canvas UI、RectTransform/锚点适配、Layout Group、预制体 UI、.prefab 里的 UI | `ui-ugui` | — |
| 维护老 OnGUI 代码、改 EditorWindow/Custom Inspector/PropertyDrawer，或用户点名 OnGUI/IMGUI | `ui-imgui` | 不要用它新建编辑器 UI |
| 像素美术/复古风画面模糊、像素抖动、缩放后像素不齐、参考分辨率与上采样 | `2d-pixel-perfect` | 先探测 URP 还是 Built-in，两套实现不兼容 |
| 改精灵的 rect/border/pivot/outline、自动/网格/等距切图、精灵表与图集 | `sprite-editor` | 通过 ISpriteEditorDataProvider 生成 C# 编辑器脚本 |
| 分析精灵图案、输出 3×3 网格色块图、描述精灵颜色分布 | `sprite-segment-3x3grid` | 常作为 RuleTile 生成的上游输入 |
| 创建/优化 SpriteAtlas、主图集与变体图集、打包设置、运行时访问图集、图集自动化 | `manage-sprite-atlas` | 默认走预构建管线，除非明确要求手工制作 |
| 新建 Tile Palette、按网格类型（矩形/六边形/等距）组织瓦片 | `tilemap-palette-create` | — |
| 自动拼接（autotile）的瓦片、用已有地形/边缘精灵做 RuleTile、把 3×3 色块图转成邻居规则 | `tilemap-ruletile-createfromsegment` | 必须提供精灵输入 |
| 要一个空白 RuleTile/HexagonalRuleTile/IsometricRuleTile 自行配规则，且没有提供任何精灵 | `tilemap-ruletile-createempty` | 一旦提到已有精灵就改用上面那条 |
| 把工程/场景/材质/Shader 迁到 URP、URP 后材质变粉、2D 工程迁 URP、迁移后光照与后处理复查 | `migrate-birp-to-urp` | — |
| URP 的 bloom/色调映射/颜色调整/景深/暗角/运动模糊等 Volume 效果 | `urp-postprocessing` | — |
| 审查 Unity 6+ 基于 Render Graph 的 ScriptableRendererFeature、查资源连线与执行结构问题 | `validate-urp-render-graph-renderer-feature` | 审查类，不主动改代码 |
| 把 HLSL 代码做成 Shader Graph 自定义节点（Custom Function Node） | `shader-graph-create-custom-node` | — |
| WebGL/WebGPU 包体过大、首屏慢、特定浏览器卡顿、需要资源裁剪与 Shader 变体削减 | `optimize-web` | — |
| AudioMixer 分配混乱、判断某个音该进哪个组、要把音频路由进混音组 | `audio-setup-mixers` | 只盘点现状，创建混音器与设音量不自动化 |
| 音频内存/CPU 占用高、选 Load Type、采样率与压缩格式、3D 音频强制单声道 | `optimize-audio` | — |
| TextMeshPro/TMP 字体资源、动态图集、SDF、中西文混排、CJK 字体回退、文本渲染性能与内存 | `optimize-text-mesh-pro` | 不覆盖 UI Toolkit 布局与非 TMP 的 uGUI |
| OnCollisionEnter/OnTriggerEnter 不触发、物体互相穿透、Raycast 打不中、布娃娃爆炸、AddForce 失效 | `physics-3d-collision` | 2D 物理与 Unity Physics 包只给带范围声明的简要回答 |
| 创建 NavMesh、加寻路 Agent、巡逻路线、避障与挖洞、用 Link 连接分离 NavMesh、寻路异常排查 | `initialize-ai-navigation` | — |
| 给工程加多语言、翻译 UI 文案、CJK 字体支持、i18n/l10n、Addressables 与本地化配合 | `localization` | — |
| 联机拓扑选型、主机托管、匹配、服务发现、房间/队伍/大厅等基于会话的玩法 | `setup-multiplayer-services` | 不负责排行榜与云存档 |
| 加语音聊天、麦克风权限、VAD 调参、静音按钮、空间语音、按键说话、队伍语音、游戏内文字聊天 | `setup-vivox-voice-chat` | 提到 Vivox / VivoxService / JoinGroupChannelAsync 直接命中 |
| 内购 IAP、微交易、订阅、收据校验、恢复交易、从原生计费或 RevenueCat/Adapty 迁移 | `implement-in-app-purchases` | — |
| 给游戏加广告、激励视频/插屏/横幅、广告中介与广告网络、ATT 与隐私合规、ILRD、Unity Ads 迁移 | `levelplay-unity-integration` | — |
| 战斗通行证、成就、云存档、排行榜、虚拟经济、服务端权威逻辑、反作弊、账号鉴权、远程配置、A/B、数据分析 | `build-live-game` | 实时联机部分让位给 setup-multiplayer-services |
| 查找/搜索/定位/列出工程里的资产或场景对象（材质、预制体、脚本、GameObject、组件…） | `generate-editor-search-query` | 只读查询；不用于工程概览或代码文本搜索 |

## 判定边界（常见误路由）

- 工程概览 / 目录结构总结 / 玩法讲解 / 编程问答 → **不是** `generate-editor-search-query`。
- 2D 物理、Unity Physics(DOTS) 包 → 不在 `physics-3d-collision` 主范围（它只给带范围声明的简要回答）。
- UI Toolkit 布局 → 不走 `optimize-text-mesh-pro`；非 TMP 的 uGUI 也不走。
- 实时联机（连接/分组/匹配/会话）→ `setup-multiplayer-services`；排行榜/云存档/无实时连接的后端 → `build-live-game`。
- 没点名框架的 UI 需求 → 先过 `ui` 路由技能，不要凭直觉直接选 `ui-uitk` / `ui-ugui`。
- 新建编辑器窗口/工具 → 不要走 `ui-imgui`（那是遗留代码维护专用）。
- 审查类技能（`validate-urp-render-graph-renderer-feature`）只出问题清单，不主动改代码。


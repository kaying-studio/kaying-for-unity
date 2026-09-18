# Unity

[English](README.md) | [简体中文](README.zh-CN.md)

Unity 官方游戏开发插件。基于 Unity 的官方实践文档，帮助你构建、变现和运营
Unity 游戏。

支持 **Claude Code**、**Codex** 和 **Pi**。

## 安装

**Claude Code** —— 下面两条是斜杠命令，请在 Claude Code 会话中输入，而不是在
终端里：

```
/plugin marketplace add kaying-studio/kaying-for-unity
```

```
/plugin install unity@kaying-for-unity
```

也可以改用终端里的 `claude` CLI。通过这种方式安装的插件会在下次启动 Claude
Code 时加载，或者在打开的会话中运行 `/reload-plugins` 后加载：

```bash
claude plugin marketplace add kaying-studio/kaying-for-unity
claude plugin install unity@kaying-for-unity
```

**Codex**

```bash
codex plugin marketplace add kaying-studio/kaying-for-unity
```

```bash
codex plugin add unity@kaying-for-unity
```

**Pi** —— Pi 会加载在 `package.json` 中声明了 `pi` 清单并带有 `pi-package`
关键字的包。可以从本地目录、npm 或 git 安装：

```bash
pi install /absolute/path/to/kaying-for-unity
# 或：  pi install ./kaying-for-unity            （相对于你的项目目录）
# 或：  pi install npm:kaying-for-unity
# 或：  pi install git:github.com/kaying-studio/kaying-for-unity
```

`install` 会写入用户设置（`~/.pi/agent/settings.json`）；加 `-l` 参数可写入项目
设置（`.pi/settings.json`），这样整个团队可以共享。如果只想临时试用一次而不安装：

```bash
pi -e ./kaying-for-unity
```

Pi 移植版在三处接入了插件（参见 `extensions/unity.ts` 和 `.pi-plugin/plugin.json`）：

- **`package.json`** —— Pi 包清单：`keywords: ["pi-package"]` 用于可发现性，
  `pi.skills` / `pi.extensions` 声明了 31 个技能和扩展入口。
- **`extensions/unity.ts`** —— Pi 扩展入口：通过 Pi 的 `resources_discover`
  事件贡献 `skills/`，在 Unity 项目内显示页脚状态，并注册 `/unity` 命令
  （`info | skills | docs | doctor`）。
- **`.pi-plugin/`** —— Pi 端清单，对应已有的 `.claude-plugin/`（Claude Code）
  和 `.codex-plugin/`（Codex）清单。

### 验证安装是否成功

不同 agent 展示已安装插件的方式不同。

**Claude Code** —— 输入 `/unity:`，技能会出现在命令列表中。`/plugin` 也会显示
`unity` 已安装并启用。

**Codex** —— 运行 `codex plugin list`：

```
PLUGIN                    STATUS              VERSION
unity@kaying-for-unity  installed, enabled  0.1.6-beta
```

**Pi** —— 运行 `pi list` 查看包，然后在会话中输入 `/unity skills` 列出内置技能。
`/unity doctor` 会报告当前目录是否是 Unity 项目，以及 `unity` CLI 是否在 `PATH`
中。

### 手动安装

如果无法使用 marketplace/install 命令，可以把代码链接到你的个人技能目录。

**Claude Code:**

```bash
git clone https://github.com/kaying-studio/kaying-for-unity.git
ln -s "$(pwd)/kaying-for-unity" ~/.claude/skills/unity
```

**Pi** —— 链接到 Pi 的全局技能目录，或者把路径加入 `settings.json`：

```bash
ln -s "$(pwd)/kaying-for-unity" ~/.pi/agent/skills/unity
```

```json
{
  "skills": ["/path/to/kaying-for-unity/skills"]
}
```

从下一次会话开始，它会在每个项目中自动加载。

## 使用方法

安装完成后，当你让 agent 在你的 Unity 项目中做相关事情时，它会自动使用对应的
技能。例如：

> "加入内购功能，让玩家可以购买金币礼包"
>
> "我想做一个设置界面"
>
> "我的像素画看起来很糊，而且相机移动时会抖动"
>
> "显示激励视频广告，让玩家可以赚取金币"
>
> "为我的关卡创建六边形瓦片调色板"
>
> "我的 TextMeshPro 标签里的中文字符显示为方框"
>
> "帮我审查一下 ScriptableRendererFeature 的 Render Graph 问题"

在 Claude Code 中，技能也会出现在斜杠菜单里；在 **Pi** 中它们注册为
`/skill:<name>` 命令，因此你可以显式选择技能，而不必用文字描述任务。

## 适用环境

Unity 6+。

## 问题与反馈

发现 Bug 或有建议？请发布到
[Unity 官方论坛](https://discussions.unity.com/)。

## 品牌指南

如需展示本仓库中包含的 Unity 标志或图标，请参阅
[Unity 品牌与商标指南](https://unity.com/legal/branding-trademarks)。

## 许可证

[Unity Companion License](LICENSE.md)。
# tilemap-ruletile-createempty — 空 RuleTile 创建

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/tilemap-ruletile-createempty/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `tilemap-ruletile-createempty--`）。随附：2 参考。
> 适用与触发：创建一个不含 Sprite 或精灵表输入的空白 RuleTile 资源。仅在用户想要空白 RuleTile、HexagonalRuleTile 或 IsometricRuleTile 以自行配置规则，且没有提供或引用任何精灵时使用。若用户提到已有精灵、地形美术、边缘瓦片或瓦片目录，请改用 tilemap-ruletile-createfromsegment，绝不用本技能。关键词：RuleTile、空规则瓦片、自动瓦片、HexagonalRuleTile、IsometricRuleTile、Tilemap、空白资源。

---
> **WorkBuddy 运行前置**：原始技能清单声明的 UPM 前置包为 `com.unity.2d.tilemap: ">=1.0.0"`、`com.unity.2d.tilemap.extras: ">=4.0.0"`。WorkBuddy 不做强制校验，执行前请自行确认工程 `Packages/manifest.json` 已包含上述包，缺失时先安装（可参考 `unity-package-management` 技能）。

> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

# Tilemap RuleTile Create Empty

## Workflow

### Step 1: Verify No Sprite Inputs
**WAIT** - Confirm that no Sprites or Spritesheets were specified by the user. This skill is only for empty RuleTiles. If there are Sprites or Spritesheets specified by the user, use the tilemap-ruletile-createfromsegment skill instead.

### Step 2: Determine RuleTile Type
Identify which RuleTile type to create based on user request:
- **RuleTile**: Standard rectangular grid
- **HexagonalRuleTile**: Hexagonal grid layout
- **IsometricRuleTile**: Isometric grid layout

### Step 3: Create Empty TilingRules
For each TilingRule, ensure the Sprite array has one `null` entry.

## Branching Logic (RuleTile Types)

### Path A: RuleTile
- Use template from `references/tilemap-ruletile-createempty--ruletile.md`.

### Path B: HexagonalRuleTile
- Use template from `references/tilemap-ruletile-createempty--hexagonalruletile.md`.

### Path C: IsometricRuleTile
- Create empty rules with appropriate neighbor positions for isometric layout.

## Important Notes

- **TilingRuleOutput.Neighbor.This**: Use to identify RuleTiles that are the same (matching neighbors).
- **TilingRuleOutput.Neighbor.NotThis**: Do NOT use unless explicitly specified by the user to ignore a Tile at a certain position.
# shader-graph-create-custom-node — Shader Graph 自定义节点

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/shader-graph-create-custom-node/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `shader-graph-create-custom-node--`）。随附：1 模板。
> 适用与触发：从 HLSL 代码生成 Shader Graph 自定义节点。适用于用户想新建 Shader Graph 节点，或想把手头已有的 HLSL 代码包装成 reflected function 节点（Custom Function Node）。关键词：Shader Graph、自定义节点、Custom Function Node、HLSL、反射节点、着色器节点、ShaderGraph。

---
> **WorkBuddy 运行前置**：原始技能清单声明的 UPM 前置包为 `com.unity.shadergraph: ">=17.5.0"`。WorkBuddy 不做强制校验，执行前请自行确认工程 `Packages/manifest.json` 已包含上述包，缺失时先安装（可参考 `unity-package-management` 技能）。

> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

# Generating a custom Shader Graph node

## Step 1: Generate an HLSL function definition
- The function must be preceded by the preprocessor define `UNITY_EXPORT_REFLECTION`

## Step 2: Decorate with Shader Graph hint tags
- See `templates/shader-graph-create-custom-node--all_hints.hlsl` for all valid hint tags and usage patterns
- C#-style documentation tags are supported outside of `funchints` or `paramhints` blocks
- Required function hints:
  - `sg:ProviderKey`
  - `sg:SearchCategory`
  - `sg:SearchTerms`
  - `sg:DisplayName`

## Step 3: Write the code to an asset
- Search the project for a `ShaderInclude` asset (`.hlsl`) that already contains custom Shader Graph nodes
- If a matching asset exists, show the user its current contents and ask for confirmation before appending the new code
- If no matching asset exists, create a new `.hlsl` asset
- Ensure the file begins with `#include "ShaderApiReflectionSupport.hlsl"`

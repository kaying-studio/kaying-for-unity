# Manual Authoring (Advanced - Not Default)

> ⚠️ **WARNING**: Manual authoring is NOT the default approach. Only use these patterns when the user EXPLICITLY requests manual control or editor preview during development.

> 🚨 **DEFAULT APPROACH**: Use prebuild generation with `IPreprocessBuildWithReport` instead. See the main SKILL.md Quick Start section.

## When to Use Manual Authoring

**Manual authoring is appropriate ONLY for:**
- Hand-optimized sprite layouts where exact positioning matters
- Custom sprite ordering requirements
- Editor preview during authoring workflow
- Explicitly requested by user

**DO NOT use manual authoring when:**
- User asks to "create sprite atlas" (use prebuild)
- User asks to "optimize sprites" (use prebuild)
- User asks for automated workflow (use prebuild)
- No specific manual control requirement mentioned

## Create and Configure Master Atlas (Manual Pattern)

> 🚨 **REMINDER**: Only use this if explicitly requested. Default is prebuild with `IPreprocessBuildWithReport`.

See [templates/manage-sprite-atlas--createandconfiguremasteratlas.cs](../templates/manage-sprite-atlas--createandconfiguremasteratlas.cs).

## Create Variant Atlas (Manual Pattern)

> 🚨 **REMINDER**: Only use this if explicitly requested. Default is prebuild with `IPreprocessBuildWithReport`.

See [templates/manage-sprite-atlas--variantatlas.cs](../templates/manage-sprite-atlas--variantatlas.cs).

## Runtime Dynamic Loading

See [templates/manage-sprite-atlas--runtimeatlasloader.cs](../templates/manage-sprite-atlas--runtimeatlasloader.cs).

## Runtime Sprite Access

See [templates/manage-sprite-atlas--runtimespriteaccess.cs](../templates/manage-sprite-atlas--runtimespriteaccess.cs).

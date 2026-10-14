# SpriteAtlas V2 Best Practices

Optimization tips, common pitfalls, and recommended patterns for SpriteAtlas V2.

## Table of Contents

- [V2 Architecture Rules (Critical)](#v2-architecture-rules-critical)
- [Editor Code Best Practices](#editor-code-best-practices)
  - [Always Use SpriteAtlasImporter for Configuration](#always-use-spriteatlasimporter-for-configuration)
  - [Save SpriteAtlasAsset Properly](#save-spriteatlasasset-properly)
  - [Clean Up After Batch Operations](#clean-up-after-batch-operations)
  - [Handle Null Cases](#handle-null-cases)
  - [Use Correct Platform Names](#use-correct-platform-names)
- [Runtime Code Best Practices](#runtime-code-best-practices)
  - [Register Callbacks Early](#register-callbacks-early)
  - [Cache Loaded Atlases](#cache-loaded-atlases)
  - [Handle Late Binding Properly](#handle-late-binding-properly)
  - [Validate Sprite Binding](#validate-sprite-binding)
  - [Query Sprites Efficiently](#query-sprites-efficiently)
- [Performance Best Practices](#performance-best-practices)
  - [Optimize Texture Settings](#optimize-texture-settings)
  - [Enable Tight Packing](#enable-tight-packing)
  - [Use Variants Wisely](#use-variants-wisely)
  - [Batch Pack Operations](#batch-pack-operations)
  - [Enable Alpha Dilation](#enable-alpha-dilation)
  - [Set includeInBuild Appropriately](#set-includeinbuild-appropriately)
- [Common Pitfalls](#common-pitfalls)
  - [Don't Script SpriteAtlas in Editor](#dont-script-spriteatlas-in-editor)
  - [Don't Use Deprecated SpriteAtlasAsset Methods](#dont-use-deprecated-spriteatlasasset-methods)
  - [Don't Forget to Reimport](#dont-forget-to-reimport)
  - [Don't Pack in Runtime Builds](#dont-pack-in-runtime-builds)
  - [Don't Modify Importer Without Saving](#dont-modify-importer-without-saving)
  - [Don't Confuse Authoring vs Runtime](#dont-confuse-authoring-vs-runtime)
- [Migration from V1 to V2](#migration-from-v1-to-v2)
  - [Replace Direct SpriteAtlas Scripting](#replace-direct-spriteatlas-scripting)
  - [Update Settings Configuration](#update-settings-configuration)
  - [Update Build Scripts](#update-build-scripts)
- [Checklist](#checklist)
  - [Before Creating an Atlas](#before-creating-an-atlas)
  - [When Creating an Atlas](#when-creating-an-atlas)
  - [When Packing Atlases](#when-packing-atlases)
  - [Runtime Loading](#runtime-loading)

## V2 Architecture Rules (Critical)

1. **NEVER script against SpriteAtlas in editor code** - SpriteAtlas is runtime-only in V2
2. **Use SpriteAtlasAsset for content authoring** - Add/remove sprites and folders
3. **Use SpriteAtlasImporter for all settings** - Texture, packing, platform, and variant configuration
4. **Follow the two-step pattern** - Create asset with SpriteAtlasAsset, configure with SpriteAtlasImporter
5. **Always call SaveAndReimport()** - Required after modifying importer settings

## Editor Code Best Practices

### Always Use SpriteAtlasImporter for Configuration

See [templates/manage-sprite-atlas--editorconfiguration.cs](../templates/manage-sprite-atlas--editorconfiguration.cs).

### Save SpriteAtlasAsset Properly

See [templates/manage-sprite-atlas--savespriteatlasasset.cs](../templates/manage-sprite-atlas--savespriteatlasasset.cs).

### Clean Up After Batch Operations

See [templates/manage-sprite-atlas--cleanupbatchoperations.cs](../templates/manage-sprite-atlas--cleanupbatchoperations.cs).

### Handle Null Cases

See [templates/manage-sprite-atlas--handlenullcases.cs](../templates/manage-sprite-atlas--handlenullcases.cs).

### Use Correct Platform Names

See [templates/manage-sprite-atlas--platformnames.cs](../templates/manage-sprite-atlas--platformnames.cs).

## Runtime Code Best Practices

### Register Callbacks Early

See [templates/manage-sprite-atlas--registercallbacks.cs](../templates/manage-sprite-atlas--registercallbacks.cs).

### Cache Loaded Atlases

See [templates/manage-sprite-atlas--cacheloadedatlases.cs](../templates/manage-sprite-atlas--cacheloadedatlases.cs).

### Handle Late Binding Properly

See [templates/manage-sprite-atlas--handlelatebinding.cs](../templates/manage-sprite-atlas--handlelatebinding.cs).

### Query Sprites Efficiently

See [templates/manage-sprite-atlas--queryspritesefficiently.cs](../templates/manage-sprite-atlas--queryspritesefficiently.cs).

## Performance Best Practices

### Optimize Texture Settings

See [templates/manage-sprite-atlas--optimizetexturesettings.cs](../templates/manage-sprite-atlas--optimizetexturesettings.cs).

### Enable Tight Packing

See [templates/manage-sprite-atlas--enablespritepacking.cs](../templates/manage-sprite-atlas--enablespritepacking.cs).

### Use Variants Wisely

See [templates/manage-sprite-atlas--usevariantswisely.cs](../templates/manage-sprite-atlas--usevariantswisely.cs).

### Set includeInBuild Appropriately

See [templates/manage-sprite-atlas--setincludeinbuild.cs](../templates/manage-sprite-atlas--setincludeinbuild.cs).

## Common Pitfalls

### Don't Script SpriteAtlas in Editor

See [templates/manage-sprite-atlas--dontscriptspriteatlasineditor.cs](../templates/manage-sprite-atlas--dontscriptspriteatlasineditor.cs).

### Don't Use Deprecated SpriteAtlasAsset Methods

See [templates/manage-sprite-atlas--deprecatedmethods.cs](../templates/manage-sprite-atlas--deprecatedmethods.cs).

### Don't Pack in Runtime Builds

See [templates/manage-sprite-atlas--dontpackinruntimebuilds.cs](../templates/manage-sprite-atlas--dontpackinruntimebuilds.cs).

### Don't Modify Importer Without Saving

See [templates/manage-sprite-atlas--dontmodifywithoutsaving.cs](../templates/manage-sprite-atlas--dontmodifywithoutsaving.cs).

### Don't Confuse Authoring vs Runtime

See [templates/manage-sprite-atlas--authoringvsruntime.cs](../templates/manage-sprite-atlas--authoringvsruntime.cs).

## Migration from V1 to V2

If migrating from V1 code:

### Replace Direct SpriteAtlas Scripting

See [templates/manage-sprite-atlas--migratev1tov2.cs](../templates/manage-sprite-atlas--migratev1tov2.cs).

### Update Settings Configuration

See [templates/manage-sprite-atlas--updatesettingsconfiguration.cs](../templates/manage-sprite-atlas--updatesettingsconfiguration.cs).

### Update Build Scripts

See [templates/manage-sprite-atlas--updatebuildscripts.cs](../templates/manage-sprite-atlas--updatebuildscripts.cs).

## Checklist

### Before Creating an Atlas

- [ ] Know what sprites to include
- [ ] Determine target platforms and formats
- [ ] Decide on texture quality settings
- [ ] Plan for variants if needed

### When Creating an Atlas

- [ ] Create SpriteAtlasAsset
- [ ] Add sprites or folders
- [ ] Save to disk with SpriteAtlasAsset.Save()
- [ ] Import with AssetDatabase.ImportAsset()
- [ ] Get SpriteAtlasImporter
- [ ] Configure texture settings
- [ ] Configure packing settings
- [ ] Configure platform settings
- [ ] Set includeInBuild
- [ ] Call SaveAndReimport()

### When Packing Atlases

- [ ] Use appropriate BuildTarget
- [ ] Wrap in try/finally block
- [ ] Call CleanupAtlasPacking() in finally
- [ ] Validate packing results

### Runtime Loading

- [ ] Register callbacks early (Awake/OnEnable)
- [ ] Unregister callbacks (OnDestroy/OnDisable)
- [ ] Cache loaded atlases
- [ ] Handle load failures gracefully
- [ ] Use async loading when possible

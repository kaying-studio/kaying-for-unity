#!/usr/bin/env node
/**
 * Build the WorkBuddy package: the plugin-marketplace tree, and the single zip that the
 * WorkBuddy open platform's 技能 upload accepts.
 *
 *   node scripts/build-workbuddy.mjs                # sync the package + rebuild the umbrella zip
 *   node scripts/build-workbuddy.mjs --check        # verify everything is in sync; write nothing
 *   node scripts/build-workbuddy.mjs --no-zip       # sync sources only, write no archive
 *   node scripts/build-workbuddy.mjs --marketplace  # also write the plugin-marketplace zip
 *   node scripts/build-workbuddy.mjs --out DIR      # write archives to DIR instead of dist/
 *
 * What "sync" means:
 *   - copy the repository's `skills/` into `for-workbuddy/plugins/unity/skills/`
 *   - copy `LICENSE.md` to `for-workbuddy/LICENSE.md`
 *   - push the `package.json` version into both `.codebuddy-plugin/*.json` manifests
 *
 * ---------------------------------------------------------------------------
 * The uploadable artifact: ONE umbrella skill, TWO directory levels
 * ---------------------------------------------------------------------------
 *
 * The open platform accepts exactly one *skill* per archive, laid out as
 *
 *     {skill-name}/SKILL.md
 *     {skill-name}/{references,templates,scripts}/…
 *
 * and rejects anything deeper with 「目录层级超限 — Skill 包仅支持两级目录结构」, and
 * anything whose SKILL.md is not at that one path with
 * 「解析失败：未找到 SKILL.md，请确保该路径文件存在」. It does not recurse.
 *
 * So a 31-skill plugin cannot be published as 31 folders in one zip, nor as a
 * `plugins/<name>/skills/<skill>/SKILL.md` tree. It has to become a *single* skill —
 * an umbrella entry point — with every atomic skill flattened into the three sanctioned
 * buckets and kept apart by a `<skill>--` filename prefix:
 *
 *     unity/SKILL.md
 *     unity/references/INDEX.md              the catalogue
 *     unity/references/ROUTING.md            request -> skill decision table
 *     unity/references/<skill>.md            the atomic skill's instructions
 *     unity/references/<skill>--<file>       its reference documents
 *     unity/templates/<skill>--<file>        its C# / HLSL / shader templates
 *     unity/scripts/<skill>--<file>          its helper scripts
 *
 * `references/`, `templates/` and `scripts/` are the complete set of recognised second-level
 * directories. The upstream `resources/` folder is not one of them, so it is split by file
 * type — `.md` into `references/`, everything else into `templates/` — and every path string
 * that pointed at a moved file is rewritten to the new, prefixed location.
 *
 * Output: `dist/unity.zip`, one top-level folder, max depth 3.
 *
 * The five platform builds of this plugin (Claude Code, Codex, Pi, ZCode, WorkBuddy) all
 * share the one `skills/` tree at the repository root. This script is what keeps the WorkBuddy
 * copies of it honest — never hand-edit anything under `for-workbuddy/plugins/unity/skills/`
 * or `for-workbuddy/umbrella/`.
 *
 * The authored tables below (skill groups, display names, routing rows, delegation chains)
 * are ported from the upstream WorkBuddy conversion in `kaying-for-workbuddy`, which packages
 * this same 31-skill set. Keep the two in step when a skill is added or renamed.
 *
 * The zip archives are written by the dependency-free writer at the bottom of this file, so
 * the build needs no `zip`, no `python` and no npm package, and produces the same bytes for
 * the same inputs. Set SOURCE_DATE_EPOCH to pin entry timestamps for reproducible output.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_SKILLS = path.join(ROOT, "skills");
const PACKAGE_DIR = path.join(ROOT, "for-workbuddy");
const PLUGIN_DIR = path.join(PACKAGE_DIR, "plugins", "unity");
const PLUGIN_SKILLS = path.join(PLUGIN_DIR, "skills");
const LICENSE = path.join(ROOT, "LICENSE.md");
const PACKAGE_LICENSE = path.join(PACKAGE_DIR, "LICENSE.md");
const MARKETPLACE_MANIFEST = path.join(PACKAGE_DIR, ".codebuddy-plugin", "marketplace.json");
const PLUGIN_MANIFEST = path.join(PLUGIN_DIR, ".codebuddy-plugin", "plugin.json");
const ZH_META = path.join(PACKAGE_DIR, "open-platform", "skills.zh.json");

const UMBRELLA_ROOT = path.join(PACKAGE_DIR, "umbrella");
const UMBRELLA_SKILL = "unity";
const UMBRELLA_DIR = path.join(UMBRELLA_ROOT, UMBRELLA_SKILL);

const PLUGIN_NAME = "unity";
const MARKETPLACE_NAME = "kaying-for-unity-marketplace";
const HOMEPAGE = "https://unity.com";
const AUTHOR = "Unity Technologies";

/** Second-level directories the platform recognises. */
const BUCKETS = ["references", "templates", "scripts"];

/** Directories a source skill may ship, including the one that has to be split. */
const SRC_BUCKETS = ["references", "templates", "scripts", "resources"];

/** Namespace separator between a flattened file and its owning skill. */
const SEP = "--";

/** Junk that must never reach the package or a zip. */
const SKIP = new Set([".DS_Store", "Thumbs.db", "node_modules", ".git"]);

// ---------------------------------------------------------------- args

const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  if (i === -1) return null;
  const value = args[i + 1];
  if (!value || value.startsWith("--")) {
    console.error(`build-workbuddy: ${flag} needs a value`);
    process.exit(2);
  }
  return value;
};

const CHECK = hasFlag("--check");
const NO_ZIP = hasFlag("--no-zip");
const MARKETPLACE = hasFlag("--marketplace");
const OUT_DIR = path.resolve(ROOT, valueOf("--out") ?? "dist");

const log = (...parts) => console.log("[build-workbuddy]", ...parts);

// ---------------------------------------------------------------- generic helpers

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

/** Recursively list files under `dir` as paths relative to `dir`, skipping junk. */
function walk(dir, base = dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(path.relative(base, full));
  }
  return out;
}

/**
 * Bring `dest` in line with `source` in place: copy new and changed files, delete only the files
 * that no longer exist upstream. Cheaper than a wipe-and-recopy, and it never issues a bulk
 * delete — which keeps it working under sandboxes that guard against recursive removal.
 */
function syncTree(source, dest) {
  const rel = (dir) => walk(dir).map((r) => r.split(path.sep).join("/"));
  const srcFiles = rel(source);
  const destFiles = fs.existsSync(dest) ? rel(dest) : [];
  const srcSet = new Set(srcFiles);
  const copied = [];
  const removed = [];

  for (const name of srcFiles) {
    const from = path.join(source, name);
    const to = path.join(dest, name);
    if (fs.existsSync(to) && sha256File(from) === sha256File(to)) continue;
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
    copied.push(name);
  }

  for (const name of destFiles) {
    if (srcSet.has(name)) continue;
    fs.rmSync(path.join(dest, name)); // one file at a time
    removed.push(name);
  }

  return { copied, removed };
}

/** Remove a directory tree by unlinking one file at a time, then pruning the empty directories. */
function removeTree(dir) {
  if (!fs.existsSync(dir)) return 0;
  let removed = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) removed += removeTree(full);
    else {
      fs.rmSync(full);
      removed += 1;
    }
  }
  fs.rmdirSync(dir);
  return removed;
}

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const sha256File = (file) => sha256(fs.readFileSync(file));

/** Every skill directory, sorted. */
function skillNames() {
  return fs.readdirSync(SRC_SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !SKIP.has(e.name))
    .map((e) => e.name)
    .sort();
}

/** Compare two trees by relative path and content hash. Returns a list of differences. */
function diffTrees(source, packaged) {
  const problems = [];
  const list = (dir) => (fs.existsSync(dir) ? walk(dir).map((rel) => rel.split(path.sep).join("/")) : []);
  const srcFiles = list(source);
  const pkgFiles = list(packaged);
  const pkgSet = new Set(pkgFiles);
  const srcSet = new Set(srcFiles);

  for (const rel of srcFiles) {
    if (!pkgSet.has(rel)) problems.push(`missing from package: ${rel}`);
    else if (sha256File(path.join(source, rel)) !== sha256File(path.join(packaged, rel))) {
      problems.push(`differs from source: ${rel}`);
    }
  }
  for (const rel of pkgFiles) if (!srcSet.has(rel)) problems.push(`stale in package: ${rel}`);
  return problems;
}

// ---------------------------------------------------------------- frontmatter

/** Line indices of the YAML frontmatter block, or null when there is none. */
function frontmatterRange(lines) {
  if (!/^---[ \t]*$/.test(lines[0] ?? "")) return null;
  for (let i = 1; i < lines.length; i += 1) {
    if (/^---[ \t]*$/.test(lines[i])) return { open: 0, close: i };
  }
  return null;
}

/** Split a SKILL.md into its frontmatter block and the body that follows. */
function splitFrontmatter(text) {
  const m = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/.exec(text);
  if (!m) return { frontmatter: "", body: text };
  return { frontmatter: m[1], body: text.slice(m[0].length) };
}

/**
 * Read a top-level frontmatter scalar. Handles plain scalars, single/double-quoted scalars and
 * the `|` / `>` block scalars the skills use for long descriptions.
 */
function readFrontmatterValue(lines, key) {
  const re = new RegExp(`^${key}:[ \\t]*(.*)$`);
  let start = -1;
  let rest = "";
  for (let i = 0; i < lines.length; i += 1) {
    const match = re.exec(lines[i]);
    if (match) {
      start = i;
      rest = match[1].trim();
      break;
    }
  }
  if (start === -1) return null;

  const block = /^([|>])([-+]?)(\d*)$/.exec(rest);
  if (block) {
    const folded = block[1] === ">";
    const body = [];
    for (let i = start + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (line.trim() === "") {
        body.push("");
        continue;
      }
      if (!/^[ \t]/.test(line)) break;
      body.push(line);
    }
    const indents = body.filter((l) => l.trim() !== "").map((l) => /^[ \t]*/.exec(l)[0].length);
    const min = indents.length > 0 ? Math.min(...indents) : 0;
    const dedented = body.map((l) => l.slice(min));
    if (!folded) return dedented.join("\n").trim();
    let out = "";
    for (const line of dedented) {
      if (line.trim() === "") {
        out += "\n";
        continue;
      }
      out = out === "" || out.endsWith("\n") ? out + line : `${out} ${line}`;
    }
    return out.trim();
  }

  if (/^".*"$/s.test(rest)) {
    try {
      return JSON.parse(rest);
    } catch {
      return rest.slice(1, -1);
    }
  }
  if (/^'.*'$/s.test(rest)) return rest.slice(1, -1).replace(/''/g, "'");
  return rest;
}

/**
 * `required_packages:` is a nested map. The open platform has no place for it, so the umbrella
 * lifts it into the body as a pre-flight note; this reads the `pkg: "range"` pairs back out.
 * Works whether the key sits at the top level or nested under `metadata`.
 */
function readRequiredPackages(lines) {
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    const header = /^([ \t]*)required_packages:[ \t]*$/.exec(lines[i]);
    if (!header) continue;
    const base = header[1].length;
    for (let j = i + 1; j < lines.length; j += 1) {
      const line = lines[j];
      if (line.trim() === "") continue;
      if (/^[ \t]*/.exec(line)[0].length <= base) break;
      const pair = /^[ \t]+([A-Za-z0-9._-]+):[ \t]*(.*)$/.exec(line);
      if (pair) out.push(`${pair[1]}: ${pair[2].trim()}`);
    }
    break;
  }
  return out;
}

/**
 * A plain YAML scalar breaks on ": " and " #", so a `description:` written as a bare plain
 * scalar containing either is not valid YAML — a strict parser rejects the whole frontmatter
 * block. Nothing this build emits depends on those blocks (the umbrella strips frontmatter and
 * writes its own), but the plugin-marketplace copy carries them verbatim, so the build reports
 * them rather than silently shipping them.
 */
function invalidDescriptionScalar(text) {
  const lines = text.split("\n");
  const range = frontmatterRange(lines);
  if (!range) return false;
  for (const line of lines.slice(range.open + 1, range.close)) {
    const m = /^description:[ \t]*(.*)$/.exec(line);
    if (!m) continue;
    const rest = m[1];
    // Block scalars and quoted scalars are always safe; only a bare plain scalar can break.
    if (rest === "" || /^[|>]/.test(rest) || /^["']/.test(rest)) return false;
    return /:[ \t]/.test(rest) || / #/.test(rest);
  }
  return false;
}

// ---------------------------------------------------------------- path rewriting

// A reference must not be preceded by a word character (so `projects/templates/x` is not a hit),
// and may carry a run of `./` / `../` segments.
const REF_RE = /(?<![A-Za-z0-9])(?<lead>(?:\.{1,2}\/)*)(?<dir>references|templates|resources|scripts)\/(?<name>[A-Za-z0-9._-][A-Za-z0-9._/-]*)/g;

// A CLI option immediately before the path means it is an argument to a tool, not a link.
const CLI_GUARD_RE = /(?:--[A-Za-z][A-Za-z-]*|-{1,2}[op])\s+$/;

// Trailing punctuation that belongs to the sentence, not the filename.
const TRAILING_CHARS = ".,);:`'\"*_";

// A bare `resources/` prose mention with no filename after it.
const BARE_RESOURCES_RE = /(?<![A-Za-z0-9])(?<lead>(?:\.{1,2}\/)*)resources\/(?![A-Za-z0-9._-])/g;

const TEXT_EXT = /\.(md|markdown|txt)$/i;

const rstrip = (text, chars) => {
  let end = text.length;
  while (end > 0 && chars.includes(text[end - 1])) end -= 1;
  return text.slice(0, end);
};

/** {dir: {lowercase name: real on-disk name}} for one skill directory. */
function buildIndex(skillDir) {
  const index = {};
  for (const bucket of SRC_BUCKETS) {
    const dir = path.join(skillDir, bucket);
    index[bucket] = {};
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      if (!fs.statSync(path.join(dir, file)).isFile()) continue;
      index[bucket][file.toLowerCase()] = file;
    }
  }
  return index;
}

/** Which sanctioned bucket a source directory's file lands in. */
function destinationBucket(sourceBucket, file) {
  if (sourceBucket !== "resources") return sourceBucket;
  return TEXT_EXT.test(file) ? "references" : "templates";
}

/** Resolve a reference to its (bucket, real filename), or null when it is dangling. */
function resolveRef(index, dir, clean) {
  const key = clean.toLowerCase();
  if (dir === "resources") {
    // `resources/` was split, so a link may now live in either bucket.
    for (const candidate of ["resources", "templates", "references"]) {
      const real = index[candidate]?.[key];
      if (real) return { bucket: destinationBucket(candidate, real), real };
    }
    return null;
  }
  const real = index[dir]?.[key];
  return real ? { bucket: dir, real } : null;
}

/**
 * Rewrite every resolvable reference to its flattened, prefixed location.
 * Returns { text, count }.
 */
function rewriteRefs(text, index, prefix) {
  let count = 0;

  const out = text.replace(REF_RE, (match, lead, dir, name, offset, whole) => {
    const before = whole.slice(Math.max(0, offset - 32), offset);
    if (CLI_GUARD_RE.test(before)) return match;

    const clean = rstrip(name, TRAILING_CHARS);
    if (!clean) return match;
    const trail = name.slice(clean.length);

    const found = resolveRef(index, dir, clean);
    if (!found) return match;

    count += 1;
    return `${lead}${found.bucket}/${prefix}${found.real}${trail}`;
  });

  // Bare `resources/` prose mentions: the directory no longer exists, so point at whichever
  // bucket actually received this skill's contents.
  const bareBucket = indexHasTemplates(index) ? "templates" : "references";
  const bare = out.replace(BARE_RESOURCES_RE, (_m, lead) => {
    count += 1;
    return `${lead}${bareBucket}/`;
  });

  return { text: bare, count };
}

const indexHasTemplates = (index) =>
  Object.values(index.templates ?? {}).some((f) => !TEXT_EXT.test(f)) ||
  Object.values(index.resources ?? {}).some((f) => !TEXT_EXT.test(f));

// ---------------------------------------------------------------- authored umbrella content

/** Domain groups, in the order they appear in the catalogue. Must cover every skill. */
const SKILL_GROUPS = [
  ["工程搭建", ["new-unity-project", "unity-cli", "unity-package-management"]],
  ["UI", ["ui", "ui-uitk", "ui-ugui", "ui-imgui"]],
  ["2D / 精灵", ["2d-pixel-perfect", "sprite-editor", "sprite-segment-3x3grid", "manage-sprite-atlas"]],
  ["瓦片地图", ["tilemap-palette-create", "tilemap-ruletile-createempty", "tilemap-ruletile-createfromsegment"]],
  ["渲染", ["migrate-birp-to-urp", "urp-postprocessing", "validate-urp-render-graph-renderer-feature", "shader-graph-create-custom-node", "optimize-web"]],
  ["音频", ["audio-setup-mixers", "optimize-audio"]],
  ["文本", ["optimize-text-mesh-pro"]],
  ["物理", ["physics-3d-collision"]],
  ["AI / 寻路", ["initialize-ai-navigation"]],
  ["本地化", ["localization"]],
  ["多人联机", ["setup-multiplayer-services", "setup-vivox-voice-chat"]],
  ["变现", ["implement-in-app-purchases", "levelplay-unity-integration"]],
  ["后端 / 在线运营", ["build-live-game"]],
  ["编辑器工具", ["generate-editor-search-query"]],
]

/** Display name and one-line purpose, per skill. */
const SKILL_META = {
  "2d-pixel-perfect": ["Unity 2D 像素完美渲染", "像素完美渲染的两套实现（URP 与 Built-in）"],
  "audio-setup-mixers": ["Unity 音频混音器路由", "盘点音频并路由进正确的 Audio Mixer Group"],
  "build-live-game": ["Unity 在线运营游戏（Unity Services）", "Unity Services 驱动的后端与在线运营能力"],
  "generate-editor-search-query": ["Unity Search 查询生成", "生成 Unity Search 查询做只读资产查找"],
  "implement-in-app-purchases": ["Unity 内购 IAP", "IAP 全流程与原生/第三方计费迁移"],
  "initialize-ai-navigation": ["Unity AI 导航（NavMesh）", "NavMesh 表面、Agent、障碍物、Link 与区域代价"],
  "levelplay-unity-integration": ["Unity LevelPlay 广告聚合", "LevelPlay 广告聚合 SDK 接入与排障"],
  "localization": ["Unity 本地化", "Locale、String/Asset Table、CJK 字体与 Addressables"],
  "manage-sprite-atlas": ["Unity 精灵图集（Sprite Atlas）", "预构建管线管理 SpriteAtlas 与变体图集"],
  "migrate-birp-to-urp": ["Unity 内置管线迁移 URP", "内置管线迁 URP 的规划、执行与排障"],
  "new-unity-project": ["新建 Unity 项目", "从想法到可运行工程的引导式建项流程"],
  "optimize-audio": ["Unity 音频性能优化", "音频导入设置与混音器层面的内存/CPU 优化"],
  "optimize-text-mesh-pro": ["Unity TextMeshPro 优化", "TMP 字体栈、动态图集、SDF 与文本渲染性能"],
  "optimize-web": ["Unity WebGL/WebGPU 优化", "WebGL/WebGPU 包体、首屏与浏览器运行时优化"],
  "physics-3d-collision": ["Unity 3D 物理碰撞诊断", "3D PhysX 碰撞与触发器不生效的诊断"],
  "setup-multiplayer-services": ["Unity 多人服务", "联机拓扑、托管、匹配、服务发现与会话玩法"],
  "setup-vivox-voice-chat": ["Unity Vivox 语音聊天", "Vivox 语音与文字聊天、VAD、空间语音、按键说话"],
  "shader-graph-create-custom-node": ["Shader Graph 自定义节点", "把 HLSL 生成 Shader Graph 自定义节点"],
  "sprite-editor": ["Unity 精灵编辑", "用 ISpriteEditorDataProvider 改精灵 rect/border/pivot/切图"],
  "sprite-segment-3x3grid": ["精灵 3×3 网格分析", "按颜色把精灵切成 3×3 网格并输出文本图案"],
  "tilemap-palette-create": ["Tile 调色板创建", "创建 Tile Palette 资源"],
  "tilemap-ruletile-createempty": ["空 RuleTile 创建", "创建空白 RuleTile（无精灵输入）"],
  "tilemap-ruletile-createfromsegment": ["从精灵生成 RuleTile", "由地形/边缘精灵生成自动拼接 RuleTile"],
  "ui": ["Unity UI 总入口", "UI 总路由：探测工程所用 UI 系统后分发"],
  "ui-imgui": ["Unity IMGUI（即时模式）编辑器 UI", "遗留 OnGUI / EditorWindow / Custom Inspector"],
  "ui-ugui": ["Unity uGUI（Canvas）", "Canvas、RectTransform、Layout Group、预制体 UI"],
  "ui-uitk": ["Unity UI Toolkit（UXML/USS）", "UI Toolkit / UXML / USS / PanelSettings"],
  "unity-cli": ["Unity CLI 与活体 Editor 控制", "从终端驱动 Unity CLI 与活体 Editor，跑构建与测试"],
  "unity-package-management": ["Unity 包管理（UPM）", "编辑器外程序化增删/升级/校验 UPM 包"],
  "urp-postprocessing": ["Unity URP 后处理", "Volume 框架下的 URP 后处理配置与调试"],
  "validate-urp-render-graph-renderer-feature": ["URP Render Graph 特性校验", "审查 Render Graph 版 ScriptableRendererFeature"],
}

/** Request -> skill decision table. */
const ROUTING_ROWS = [
  ["「做一个 XX 类型的游戏」「开新坑」「搭原型」「Unity 工程初始化」", "new-unity-project", "流程主入口，会后台装 Editor 并委托 unity-cli / unity-package-management"],
  ["安装/升级 Unity Editor、管理与模块、许可证与登录、看日志、跑构建、跑测试、为 AI 配 Unity MCP", "unity-cli", "CLI 与活体 Editor 的执行底座"],
  ["在编辑器外增删/升级/查询 UPM 包、无头或 CI 装包、按品类选包、校验包版本", "unity-package-management", "CLI 不管理 UPM 包，本技能补这个缺口"],
  ["任何没说框架的 UI 需求（菜单、HUD、设置页、暂停页、样式与布局调整、UI 现状摸查）", "ui", "路由技能：先探测工程用的哪套 UI 系统"],
  ["新建编辑器 UI/工具、改 .uxml/.uss、UIElements/UIDocument/PanelSettings、运行时数据绑定", "ui-uitk", "新 UI 默认走 UI Toolkit"],
  ["运行时 Canvas UI、RectTransform/锚点适配、Layout Group、预制体 UI、.prefab 里的 UI", "ui-ugui", ""],
  ["维护老 OnGUI 代码、改 EditorWindow/Custom Inspector/PropertyDrawer，或用户点名 OnGUI/IMGUI", "ui-imgui", "不要用它新建编辑器 UI"],
  ["像素美术/复古风画面模糊、像素抖动、缩放后像素不齐、参考分辨率与上采样", "2d-pixel-perfect", "先探测 URP 还是 Built-in，两套实现不兼容"],
  ["改精灵的 rect/border/pivot/outline、自动/网格/等距切图、精灵表与图集", "sprite-editor", "通过 ISpriteEditorDataProvider 生成 C# 编辑器脚本"],
  ["分析精灵图案、输出 3×3 网格色块图、描述精灵颜色分布", "sprite-segment-3x3grid", "常作为 RuleTile 生成的上游输入"],
  ["创建/优化 SpriteAtlas、主图集与变体图集、打包设置、运行时访问图集、图集自动化", "manage-sprite-atlas", "默认走预构建管线，除非明确要求手工制作"],
  ["新建 Tile Palette、按网格类型（矩形/六边形/等距）组织瓦片", "tilemap-palette-create", ""],
  ["自动拼接（autotile）的瓦片、用已有地形/边缘精灵做 RuleTile、把 3×3 色块图转成邻居规则", "tilemap-ruletile-createfromsegment", "必须提供精灵输入"],
  ["要一个空白 RuleTile/HexagonalRuleTile/IsometricRuleTile 自行配规则，且没有提供任何精灵", "tilemap-ruletile-createempty", "一旦提到已有精灵就改用上面那条"],
  ["把工程/场景/材质/Shader 迁到 URP、URP 后材质变粉、2D 工程迁 URP、迁移后光照与后处理复查", "migrate-birp-to-urp", ""],
  ["URP 的 bloom/色调映射/颜色调整/景深/暗角/运动模糊等 Volume 效果", "urp-postprocessing", ""],
  ["审查 Unity 6+ 基于 Render Graph 的 ScriptableRendererFeature、查资源连线与执行结构问题", "validate-urp-render-graph-renderer-feature", "审查类，不主动改代码"],
  ["把 HLSL 代码做成 Shader Graph 自定义节点（Custom Function Node）", "shader-graph-create-custom-node", ""],
  ["WebGL/WebGPU 包体过大、首屏慢、特定浏览器卡顿、需要资源裁剪与 Shader 变体削减", "optimize-web", ""],
  ["AudioMixer 分配混乱、判断某个音该进哪个组、要把音频路由进混音组", "audio-setup-mixers", "只盘点现状，创建混音器与设音量不自动化"],
  ["音频内存/CPU 占用高、选 Load Type、采样率与压缩格式、3D 音频强制单声道", "optimize-audio", ""],
  ["TextMeshPro/TMP 字体资源、动态图集、SDF、中西文混排、CJK 字体回退、文本渲染性能与内存", "optimize-text-mesh-pro", "不覆盖 UI Toolkit 布局与非 TMP 的 uGUI"],
  ["OnCollisionEnter/OnTriggerEnter 不触发、物体互相穿透、Raycast 打不中、布娃娃爆炸、AddForce 失效", "physics-3d-collision", "2D 物理与 Unity Physics 包只给带范围声明的简要回答"],
  ["创建 NavMesh、加寻路 Agent、巡逻路线、避障与挖洞、用 Link 连接分离 NavMesh、寻路异常排查", "initialize-ai-navigation", ""],
  ["给工程加多语言、翻译 UI 文案、CJK 字体支持、i18n/l10n、Addressables 与本地化配合", "localization", ""],
  ["联机拓扑选型、主机托管、匹配、服务发现、房间/队伍/大厅等基于会话的玩法", "setup-multiplayer-services", "不负责排行榜与云存档"],
  ["加语音聊天、麦克风权限、VAD 调参、静音按钮、空间语音、按键说话、队伍语音、游戏内文字聊天", "setup-vivox-voice-chat", "提到 Vivox / VivoxService / JoinGroupChannelAsync 直接命中"],
  ["内购 IAP、微交易、订阅、收据校验、恢复交易、从原生计费或 RevenueCat/Adapty 迁移", "implement-in-app-purchases", ""],
  ["给游戏加广告、激励视频/插屏/横幅、广告中介与广告网络、ATT 与隐私合规、ILRD、Unity Ads 迁移", "levelplay-unity-integration", ""],
  ["战斗通行证、成就、云存档、排行榜、虚拟经济、服务端权威逻辑、反作弊、账号鉴权、远程配置、A/B、数据分析", "build-live-game", "实时联机部分让位给 setup-multiplayer-services"],
  ["查找/搜索/定位/列出工程里的资产或场景对象（材质、预制体、脚本、GameObject、组件…）", "generate-editor-search-query", "只读查询；不用于工程概览或代码文本搜索"],
]

/** Standing relationships between atomic skills. */
const DELEGATION = [
  ["`ui` 是 UI 领域路由", "先探测工程使用的 UI 系统，再交给 `ui-uitk`（新编辑器 UI）/ `ui-ugui`（Canvas 运行时 UI）/ `ui-imgui`（遗留 `OnGUI`）。任何没点名的 UI 需求都先过它。"],
  ["`new-unity-project` 是建项主流程", "机制委托给 `unity-cli`（CLI/Editor/版本控制）与 `unity-package-management`（UPM 包），收尾把变现移交给 `implement-in-app-purchases` / `levelplay-unity-integration` / `build-live-game`。它自己不生成玩法代码。"],
  ["`unity-cli` 是共用的执行底座", "多数需要动工程的技能都写着「由 `unity-cli` 技能负责把你接上去」（装 CLI、确认已连接 Editor、加 `com.unity.pipeline`、区分 Editor 不存在与 Safe Mode、发现命令目录）。**照做，不要重推一遍。**"],
  ["`sprite-segment-3x3grid` → `tilemap-ruletile-createfromsegment`", "前者输出的 3×3 文本图案（`X`/`.`/`*`）是后者的输入，`.` 映射 `This`、`X` 映射 `DontCare`，按具体度排序。"],
  ["`tilemap-ruletile-createempty` 有明确的让位条件", "只要用户提到已有精灵、地形美术、边缘瓦片或瓦片目录，就改用 `tilemap-ruletile-createfromsegment`。"],
]

/** Common mis-routings worth calling out. */
const BOUNDARIES = [
  "工程概览 / 目录结构总结 / 玩法讲解 / 编程问答 → **不是** `generate-editor-search-query`。",
  "2D 物理、Unity Physics(DOTS) 包 → 不在 `physics-3d-collision` 主范围（它只给带范围声明的简要回答）。",
  "UI Toolkit 布局 → 不走 `optimize-text-mesh-pro`；非 TMP 的 uGUI 也不走。",
  "实时联机（连接/分组/匹配/会话）→ `setup-multiplayer-services`；排行榜/云存档/无实时连接的后端 → `build-live-game`。",
  "没点名框架的 UI 需求 → 先过 `ui` 路由技能，不要凭直觉直接选 `ui-uitk` / `ui-ugui`。",
  "新建编辑器窗口/工具 → 不要走 `ui-imgui`（那是遗留代码维护专用）。",
  "审查类技能（`validate-urp-render-graph-renderer-feature`）只出问题清单，不主动改代码。",
];

const UMBRELLA_ZH_NAME = "Unity 游戏开发（总入口）";
const UMBRELLA_EN_NAME = "Unity Game Development (Entry Point)";
const UMBRELLA_SHORT_ZH = "Unity 游戏开发的统一入口，负责判定领域并加载对应的原子技能。";
const UMBRELLA_DESC_ZH =
  "Unity 游戏开发的统一入口。凡涉及 Unity 工程的开发任务都先走本技能——它不写代码，只判定领域、" +
  "加载对应的原子技能，再严格按该技能执行。覆盖：新建工程与 CLI/编辑器自动化、UPM 包管理、" +
  "UI（UI Toolkit/uGUI/IMGUI）、2D 像素完美与精灵/图集、Tilemap 与 RuleTile、渲染（URP 迁移、后处理、" +
  "Render Graph 校验、Shader Graph 自定义节点）、WebGL/WebGPU 与音频/TextMeshPro 性能优化、3D 物理碰撞排查、" +
  "AI 导航、本地化、多人联机与 Vivox 语音、内购 IAP 与 LevelPlay 广告变现、Unity Services 在线运营后端、" +
  "Unity Search 查询。关键词：Unity、游戏开发、unity-cli、UPM、UI Toolkit、UXML、USS、uGUI、IMGUI、" +
  "Pixel Perfect、Sprite、SpriteAtlas、Tilemap、RuleTile、URP、Render Graph、Shader Graph、WebGL、" +
  "TextMeshPro、TMP、NavMesh、Localization、IAP、LevelPlay、Vivox、Multiplayer、Unity Services。";
const UMBRELLA_DESC_EN =
  "Single entry point for Unity game development. Routes any Unity project request to the right " +
  "atomic skill — project setup and Unity CLI/Editor automation, UPM packages, UI (UI Toolkit / uGUI / IMGUI), " +
  "2D pixel-perfect and sprites/atlases, Tilemap and RuleTile, rendering (URP migration, post-processing, " +
  "Render Graph validation, Shader Graph custom nodes), WebGL/audio/TextMeshPro optimization, 3D physics " +
  "diagnostics, AI navigation, localization, multiplayer and Vivox voice, IAP and LevelPlay ad monetization, " +
  "Unity Services live-ops backend, and Unity Search queries.";

// ---------------------------------------------------------------- stage 1: the plugin package

function syncPackage({ write }) {
  const pkg = readJson(path.join(ROOT, "package.json"));
  const version = pkg.version;
  const problems = [];
  const names = skillNames();

  if (!fs.existsSync(SRC_SKILLS)) {
    console.error(`build-workbuddy: no skills directory at ${SRC_SKILLS}`);
    process.exit(1);
  }

  // 1. Skills --------------------------------------------------------------
  if (write) {
    const { copied, removed } = syncTree(SRC_SKILLS, PLUGIN_SKILLS);
    log(`skills: ${names.length} skills -> plugins/${PLUGIN_NAME}/skills/ ` +
      `(${copied.length} written, ${removed.length} removed)`);
  } else {
    problems.push(...diffTrees(SRC_SKILLS, PLUGIN_SKILLS));
  }

  // 2. LICENSE -------------------------------------------------------------
  if (write) {
    if (fs.existsSync(LICENSE)) {
      fs.copyFileSync(LICENSE, PACKAGE_LICENSE);
      log("license: copied LICENSE.md");
    }
  } else if (fs.existsSync(LICENSE)) {
    if (!fs.existsSync(PACKAGE_LICENSE)) problems.push("missing from package: LICENSE.md");
    else if (sha256File(LICENSE) !== sha256File(PACKAGE_LICENSE)) problems.push("LICENSE.md differs from source");
  }

  // 3. Versions ------------------------------------------------------------
  for (const file of [MARKETPLACE_MANIFEST, PLUGIN_MANIFEST]) {
    const json = readJson(file);
    if (json.version === version) continue;
    if (write) {
      json.version = version;
      for (const plugin of json.plugins ?? []) {
        if (plugin.name === PLUGIN_NAME) plugin.version = version;
      }
      writeJson(file, json);
      log(`version: ${path.relative(ROOT, file)} -> ${version}`);
    } else {
      problems.push(`${path.relative(ROOT, file)} is at ${json.version}, package.json is at ${version}`);
    }
  }

  return { version, problems, skillCount: names.length };
}

// ---------------------------------------------------------------- stage 2: the umbrella skill

/**
 * Flatten every atomic skill into one two-level WorkBuddy skill package.
 *
 * Returns `{ problems, entries, stats }` where `entries` is the full file map of the package
 * (path relative to the umbrella root -> Buffer), so `--check` can diff it without writing.
 */
function buildUmbrella({ version }) {
  const problems = [];
  const names = skillNames();
  const stats = { skills: 0, refs: 0, templates: 0, scripts: 0, rewrites: 0 };

  if (!fs.existsSync(ZH_META)) {
    problems.push(`missing open-platform metadata: ${path.relative(ROOT, ZH_META)}`);
    return { problems, entries: new Map(), stats };
  }

  const meta = readJson(ZH_META);
  const zh = meta.descriptions_zh ?? {};

  // --- invariants --------------------------------------------------------
  for (const name of names) {
    if (!String(zh[name] ?? "").trim()) problems.push(`no Chinese description for skill: ${name}`);
    if (!SKILL_META[name]) problems.push(`no umbrella metadata (display name / purpose) for skill: ${name}`);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      problems.push(`${name}: skill name must be lowercase kebab-case for the open platform`);
    }
  }
  for (const key of Object.keys(zh)) {
    if (!names.includes(key)) problems.push(`Chinese description for unknown skill: ${key}`);
  }
  const grouped = SKILL_GROUPS.flatMap(([, ns]) => ns);
  for (const name of names) if (!grouped.includes(name)) problems.push(`skill missing from SKILL_GROUPS: ${name}`);
  for (const name of grouped) if (!names.includes(name)) problems.push(`SKILL_GROUPS lists unknown skill: ${name}`);
  for (const [said, skill] of ROUTING_ROWS) {
    if (!names.includes(skill)) problems.push(`ROUTING_ROWS row "${said}" points at unknown skill: ${skill}`);
  }

  /** path (relative to the umbrella root) -> Buffer */
  const entries = new Map();
  const put = (rel, data) => {
    const full = `${UMBRELLA_SKILL}/${rel}`;
    if (entries.has(full)) problems.push(`duplicate umbrella path: ${full}`);
    entries.set(full, Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8"));
  };

  // --- per skill ---------------------------------------------------------
  for (const name of names) {
    const skillDir = path.join(SRC_SKILLS, name);
    const prefix = `${name}${SEP}`;
    const index = buildIndex(skillDir);
    const contributed = { references: 0, templates: 0, scripts: 0 };

    // Loose files at the skill root — `unity-cli` ships CHANGELOG.md and SECURITY.md — are
    // reference documents, and have to be indexed before anything is rewritten so links to them
    // resolve. The reference port relocates them into `references/` the same way.
    const rootFiles = fs.readdirSync(skillDir, { withFileTypes: true })
      .filter((e) => e.isFile() && e.name !== "SKILL.md" && !SKIP.has(e.name))
      .map((e) => e.name)
      .sort();

    const payload = [];
    for (const bucket of SRC_BUCKETS) {
      for (const file of Object.values(index[bucket])) {
        payload.push({ source: path.join(skillDir, bucket, file), file, dest: destinationBucket(bucket, file) });
      }
    }
    for (const file of rootFiles) {
      index.references[file.toLowerCase()] = file;
      payload.push({ source: path.join(skillDir, file), file, dest: "references" });
    }

    // 1. Payload files, rewritten in place so their own cross-references stay valid.
    for (const { source, file, dest } of payload) {
      let data = fs.readFileSync(source);

      if (TEXT_EXT.test(file)) {
        const { text, count } = rewriteRefs(data.toString("utf8"), index, prefix);
        stats.rewrites += count;
        data = Buffer.from(text, "utf8");
      }

      put(`${dest}/${prefix}${file}`, data);
      contributed[dest] += 1;
      stats[{ references: "refs", templates: "templates", scripts: "scripts" }[dest]] += 1;
    }

    // 2. The atomic SKILL.md body becomes references/<skill>.md, frontmatter stripped and
    //    replaced by a provenance header the umbrella can act on.
    const raw = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
    const { frontmatter, body } = splitFrontmatter(raw);
    const fmLines = frontmatter.split("\n");
    const required = readRequiredPackages(fmLines);

    if (invalidDescriptionScalar(raw)) {
      log(`note: skills/${name}/SKILL.md has a plain 'description:' scalar containing ': ' ` +
        `(not strict YAML) — the umbrella strips frontmatter, so it is harmless here`);
    }

    const rewritten = rewriteRefs(body, index, prefix);
    stats.rewrites += rewritten.count;

    const bundled = [];
    if (contributed.references) bundled.push(`${contributed.references} 参考`);
    if (contributed.templates) bundled.push(`${contributed.templates} 模板`);
    if (contributed.scripts) bundled.push(`${contributed.scripts} 脚本`);

    const head = [
      `# ${name} — ${SKILL_META[name][0]}`,
      "",
      `> 源：Unity 官方技能包 \`kaying-for-unity@${version}\` 的 \`skills/${name}/SKILL.md\`。`,
      `> 本技能的随附文件已平铺到本技能包的 \`references/\`、\`templates/\`、\`scripts/\` 下，文件名统一带 ` +
        `\`<skill-name>--\` 前缀（本技能为 \`${prefix}\`）。随附：${bundled.join(", ") || "无"}。`,
      `> 适用与触发：${zh[name]}`,
      "",
      "---",
    ];
    if (required.length > 0) {
      head.push(
        `> **WorkBuddy 运行前置**：原始技能清单声明的 UPM 前置包为 ` +
          `${required.map((r) => `\`${r}\``).join("、")}。WorkBuddy 不做强制校验，执行前请自行确认工程 ` +
          "`Packages/manifest.json` 已包含上述包，缺失时先安装（可参考 `unity-package-management` 技能）。",
        "",
      );
    }
    head.push(
      "> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，" +
        "仅对清单字段与子目录命名做了适配。",
      "",
      "---",
      "",
    );

    put(`references/${name}.md`, `${head.join("\n")}\n${rewritten.text.replace(/^\n+/, "")}`);
    stats.skills += 1;
  }

  // --- references/INDEX.md ----------------------------------------------
  const idxLines = [
    `# 原子技能索引（${stats.skills}）`,
    "",
    `本总入口把上游的 ${stats.skills} 个原子技能全部平铺在 \`references/\` 下（WorkBuddy 技能包只支持两级目录，` +
      "所以不能保留 `skills/<name>/` 的插件层级）。每个技能的指令文件是 `references/<skill-name>.md`，" +
      "其随附文件以 `<skill-name>--` 为前缀平铺在 `references/` / `templates/` / `scripts/` 里。",
    "",
    "| 领域 | `skill-name` | 展示名称 | 用途 | 随附 | 指令文件 |",
    "|---|---|---|---|---|---|",
  ];
  const bundledOf = new Map();
  for (const [rel] of entries) {
    const m = /^unity\/(references|templates|scripts)\/([a-z0-9-]+)--/.exec(rel);
    if (!m) continue;
    const counts = bundledOf.get(m[2]) ?? { references: 0, templates: 0, scripts: 0 };
    counts[m[1]] += 1;
    bundledOf.set(m[2], counts);
  }
  for (const [group, groupNames] of SKILL_GROUPS) {
    for (const n of groupNames) {
      const c = bundledOf.get(n) ?? { references: 0, templates: 0, scripts: 0 };
      const bundled = [];
      if (c.references) bundled.push(`${c.references} 参考`);
      if (c.templates) bundled.push(`${c.templates} 模板`);
      if (c.scripts) bundled.push(`${c.scripts} 脚本`);
      idxLines.push(
        `| ${group} | \`${n}\` | ${SKILL_META[n][0]} | ${SKILL_META[n][1]} | ` +
          `${bundled.join(", ") || "—"} | \`references/${n}.md\` |`,
      );
    }
  }
  idxLines.push(
    "",
    `合计 ${stats.skills} 个原子技能 · ${stats.refs} 份参考文档 · ${stats.templates} 个模板 · ` +
      `${stats.scripts} 个脚本。`,
    "",
    "上游技能的 `resources/` 目录已被拆开：其中的 `.md` 进 `references/`，`.cs`/`.hlsl`/`.sh` 进 `templates/`。",
    "",
  );
  put("references/INDEX.md", `${idxLines.join("\n")}\n`);

  // --- references/ROUTING.md --------------------------------------------
  const rtLines = [
    "# 需求 → 技能 判定表",
    "",
    "先按用户原话在下表定位技能；命中多条时按 `工程搭建 > 执行底座 > 具体领域` 的顺序处理。",
    "",
    "「走这个技能」列给出的是技能名；对应的指令文件是 `references/<技能名>.md`。",
    "",
    "| 用户这么说 | 走这个技能 | 备注 |",
    "|---|---|---|",
  ];
  for (const [said, skill, note] of ROUTING_ROWS) {
    rtLines.push(`| ${said} | \`${skill}\` | ${note || "—"} |`);
  }
  rtLines.push("", "## 判定边界（常见误路由）", "");
  for (const line of BOUNDARIES) rtLines.push(`- ${line}`);
  rtLines.push("");
  put("references/ROUTING.md", `${rtLines.join("\n")}\n`);

  // --- SKILL.md ---------------------------------------------------------
  const s = [];
  s.push("---");
  s.push(`name: ${UMBRELLA_SKILL}`);
  s.push(`display_name: ${UMBRELLA_ZH_NAME}`);
  s.push(`display_name_en: ${UMBRELLA_EN_NAME}`);
  s.push(`description: ${UMBRELLA_DESC_ZH}`);
  s.push(`description_zh: ${UMBRELLA_SHORT_ZH}`);
  s.push(`description_en: ${UMBRELLA_DESC_EN}`);
  s.push("category: development");
  s.push(`version: ${version}`);
  s.push(`author: ${AUTHOR}`);
  s.push("metadata:");
  s.push(`  author: ${AUTHOR}`);
  s.push(`  homepage: ${HOMEPAGE}`);
  s.push("  category: development");
  s.push(`  source_plugin: kaying-for-unity@${version}`);
  s.push("  harness: workbuddy");
  s.push("  umbrella: true");
  s.push(`  bundles_skills: ${stats.skills}`);
  s.push("  layout: flat-two-level");
  s.push("---");
  s.push("");
  s.push(`> 本技能是 \`kaying-for-unity@${version}\` 的 WorkBuddy **总入口**，内含全部 ${stats.skills} 个原子技能。`);
  s.push("> WorkBuddy 技能包只支持两级目录（根目录/二级目录/文件），因此原子技能的指令与随附文件被平铺进");
  s.push("> `references/`、`templates/`、`scripts/`，用 `<skill-name>--` 前缀区分归属；正文与资料内容保持原样。");
  s.push("");
  s.push("---");
  s.push("");
  s.push("# Unity 游戏开发 — 总入口");
  s.push("");
  s.push("本技能覆盖 Unity 游戏开发的全部领域，但**它自己几乎不写代码**。");
  s.push("它只做一件事：**判定领域 → 加载对应的原子技能 → 严格按该技能的正文执行**。");
  s.push("");
  s.push("判断依据、API 用法、版本约束、检查点、工具调用方式，**一律以原子技能正文为准**，不要用通用 Unity 知识覆盖它。");
  s.push("");
  s.push("## 工作方式（三步）");
  s.push("");
  s.push("1. **判定领域** —— 对照 `references/ROUTING.md`（需求 → 技能判定表）确定唯一目标技能；命中多个时按 " +
    "`工程搭建 > 执行底座 > 具体领域` 排序。");
  s.push("2. **加载原子技能** —— 读 `references/<skill-name>.md`。那是该技能的完整指令，优先级高于本文件里的一切概括。");
  s.push("3. **按其执行** —— 原子技能若要求读它自己的参考文档/模板/脚本，用 `<skill-name>--` 前缀在 " +
    "`references/`、`templates/`、`scripts/` 下按同名查找（正文里的引用已改写为完整路径，直接照用）。");
  s.push("");
  s.push("## 硬规则");
  s.push("");
  s.push(`- **不要跳过原子技能直接作答。** ${stats.skills} 个技能里沉淀了大量版本约束、API 陷阱与工程规范，凭通用知识会答错。`);
  s.push("- **先看原子技能正文顶部是否有「WorkBuddy 运行前置」。** 若有 UPM 包约束，先确认工程 " +
    "`Packages/manifest.json`，缺失则先装包（走 `unity-package-management`）。");
  s.push("- **要改工程就先接上活体 Editor。** 多数技能都写着「由 `unity-cli` 技能负责把你接上去」——照做，" +
    "不要重推一遍前置步骤。");
  s.push("- **不要手工改场景/资源的 YAML**，走 Editor 与 CLI。");
  s.push("- **不要凭空拼 `templates/` 路径。** 文件名带技能前缀（如 " +
    "`templates/manage-sprite-atlas--spriteatlasprebuildgenerator.cs`），以正文里的链接为准。");
  s.push("");
  s.push("## 委托链（原子技能之间的既定关系，照做不重推）");
  s.push("");
  for (const [title, desc] of DELEGATION) s.push(`- **${title}** —— ${desc}`);
  s.push("");
  s.push("## 技能目录");
  s.push("");
  s.push("完整目录（含随附文件数与指令文件路径）见 `references/INDEX.md`。速查表：");
  s.push("");
  s.push("| 领域 | 技能 | 指令文件 | 用途 |");
  s.push("|---|---|---|---|");
  for (const [group, groupNames] of SKILL_GROUPS) {
    for (const n of groupNames) s.push(`| ${group} | \`${n}\` | \`references/${n}.md\` | ${SKILL_META[n][1]} |`);
  }
  s.push("");
  s.push("## 判定边界（常见误路由）");
  s.push("");
  for (const line of BOUNDARIES) s.push(`- ${line}`);
  s.push("");
  put("SKILL.md", `${s.join("\n")}\n`);

  // --- depth guard -------------------------------------------------------
  for (const rel of entries.keys()) {
    const depth = rel.split("/").filter(Boolean).length;
    if (depth > 3) problems.push(`umbrella path deeper than two levels: ${rel}`);
  }

  return { problems, entries, stats };
}

/** Write the umbrella to disk (or diff it against what is committed, for --check). */
function syncUmbrella({ write, entries }) {
  const problems = [];

  if (write) {
    let written = 0;
    for (const [rel, data] of entries) {
      const full = path.join(UMBRELLA_ROOT, rel);
      if (fs.existsSync(full) && sha256File(full) === sha256(data)) continue;
      fs.mkdirSync(path.dirname(full), { recursive: true });
      fs.writeFileSync(full, data);
      written += 1;
    }

    // Drop anything left behind by an earlier layout, one file at a time.
    let removed = 0;
    if (fs.existsSync(UMBRELLA_DIR)) {
      for (const rel of walk(UMBRELLA_DIR)) {
        const key = `${UMBRELLA_SKILL}/${rel.split(path.sep).join("/")}`;
        if (entries.has(key)) continue;
        fs.rmSync(path.join(UMBRELLA_DIR, rel));
        removed += 1;
      }
    }

    return { problems, wrote: true, written, removed };
  }

  const onDisk = new Map();
  if (fs.existsSync(UMBRELLA_DIR)) {
    for (const rel of walk(UMBRELLA_DIR)) {
      const key = `${UMBRELLA_SKILL}/${rel.split(path.sep).join("/")}`;
      onDisk.set(key, sha256File(path.join(UMBRELLA_DIR, rel)));
    }
  }

  for (const [rel, data] of entries) {
    if (!onDisk.has(rel)) problems.push(`missing from umbrella: ${rel}`);
    else if (onDisk.get(rel) !== sha256(data)) problems.push(`umbrella file differs from source: ${rel}`);
  }
  for (const rel of onDisk.keys()) if (!entries.has(rel)) problems.push(`stale in umbrella: ${rel}`);

  return { problems, wrote: false };
}

// ---------------------------------------------------------------- zip writer

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

const u16 = (n) => {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n & 0xffff);
  return b;
};
const u32 = (n) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
};

/** MS-DOS packed date + time, as the ZIP format wants it. */
function dosStamp(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

const FLAG_UTF8 = 0x0800;
const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;

/**
 * Build a ZIP archive from `{name, data, mtime}` entries. Paths are used verbatim, so callers
 * decide whether the archive gets a wrapper folder. With `includeDirs`, an explicit entry is
 * emitted for every ancestor directory, which is what `zip -r` does and what the platform's
 * own tooling produces.
 */
function zipArchive(entries, { includeDirs = true } = {}) {
  const epoch = process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : null;
  const fallback = new Date(epoch ?? 0);

  const files = [...entries].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const all = [];
  if (includeDirs) {
    const seen = new Set();
    for (const entry of files) {
      const parts = entry.name.split("/");
      for (let i = 1; i < parts.length; i += 1) {
        const dir = `${parts.slice(0, i).join("/")}/`;
        if (seen.has(dir)) continue;
        seen.add(dir);
        all.push({ name: dir, data: Buffer.alloc(0), mtime: fallback, dir: true });
      }
    }
  }
  all.push(...files);
  all.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  const local = [];
  const central = [];
  let offset = 0;

  for (const entry of all) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const data = entry.data;
    const stamp = dosStamp(epoch ? new Date(epoch) : (entry.mtime ?? fallback));

    const crc = crc32(data);
    const deflated = entry.dir ? data : deflateRawSync(data, { level: 9 });
    const useDeflate = !entry.dir && deflated.length < data.length;
    const payload = useDeflate ? deflated : data;
    const method = useDeflate ? METHOD_DEFLATE : METHOD_STORE;

    const header = Buffer.concat([
      u32(0x04034b50),
      u16(20), // version needed to extract
      u16(FLAG_UTF8),
      u16(method),
      u16(stamp.time),
      u16(stamp.date),
      u32(crc),
      u32(payload.length),
      u32(data.length),
      u16(nameBuf.length),
      u16(0), // extra field length
      nameBuf,
    ]);

    local.push(header, payload);

    central.push(
      Buffer.concat([
        u32(0x02014b50),
        u16(20), // version made by
        u16(20), // version needed to extract
        u16(FLAG_UTF8),
        u16(method),
        u16(stamp.time),
        u16(stamp.date),
        u32(crc),
        u32(payload.length),
        u32(data.length),
        u16(nameBuf.length),
        u16(0), // extra field length
        u16(0), // comment length
        u16(0), // disk number start
        u16(0), // internal attributes
        u32((entry.dir ? 0o040755 : 0o100644) << 16), // external attributes
        u32(offset),
        nameBuf,
      ]),
    );

    offset += header.length + payload.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.concat([
    u32(0x06054b50),
    u16(0), // this disk
    u16(0), // disk with central directory
    u16(all.length),
    u16(all.length),
    u32(centralBuf.length),
    u32(offset),
    u16(0), // comment length
  ]);

  return { buffer: Buffer.concat([...local, centralBuf, end]), files: all.length };
}

/** Zip the umbrella directory, laying entries out under its own name (the wrapper folder). */
function zipUmbrella(entries) {
  const mtimes = new Map();
  for (const rel of walk(UMBRELLA_DIR)) {
    mtimes.set(`${UMBRELLA_SKILL}/${rel.split(path.sep).join("/")}`, fs.statSync(path.join(UMBRELLA_DIR, rel)).mtime);
  }
  return zipArchive(
    [...entries].map(([name, data]) => ({ name, data, mtime: mtimes.get(name) ?? new Date(0) })),
  );
}

/** Zip a directory, laying entries out relative to it (no wrapper folder). */
function zipDirectory(dir) {
  return zipArchive(
    walk(dir).map((rel) => {
      const full = path.join(dir, rel);
      return { name: rel.split(path.sep).join("/"), data: fs.readFileSync(full), mtime: fs.statSync(full).mtime };
    }),
    { includeDirs: false },
  );
}

// ---------------------------------------------------------------- main

const synced = syncPackage({ write: !CHECK });
const umbrella = buildUmbrella({ version: synced.version });
const syncedUmbrella = syncUmbrella({ write: !CHECK, entries: umbrella.entries });
const problems = [...synced.problems, ...umbrella.problems, ...syncedUmbrella.problems];

const stats = umbrella.stats;

if (CHECK) {
  if (problems.length > 0) {
    console.error("\n[build-workbuddy] the WorkBuddy build is out of sync:\n");
    for (const problem of problems) console.error(`  - ${problem}`);
    console.error("\nRun `npm run build:workbuddy` and commit the result.\n");
    process.exit(1);
  }
  log(`ok — ${stats.skills} skills, ${synced.skillCount} in the plugin package, version ${synced.version}`);
  log(`ok — umbrella holds ${umbrella.entries.size} files, max depth 3`);
  process.exit(0);
}

if (problems.length > 0) {
  console.error("\n[build-workbuddy] refusing to write archives:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("");
  process.exit(1);
}

log(
  `umbrella: ${stats.skills} skills · ${stats.refs} refs · ${stats.templates} templates · ` +
    `${stats.scripts} scripts · ${stats.rewrites} path rewrites -> ${path.relative(ROOT, UMBRELLA_DIR)}/`,
);

if (NO_ZIP) {
  log("skipping the archives (--no-zip)");
  process.exit(0);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// The pre-umbrella layouts must not linger: 27 per-skill zips in two shapes, plus a combined
// multi-skill zip, were all rejected by the platform's parser.
const stale = path.join(OUT_DIR, "open-platform");
if (fs.existsSync(stale)) {
  const n = removeTree(stale);
  log(`removed stale ${path.relative(ROOT, stale)}/ (${n} files; superseded by the umbrella zip)`);
}

const zipPath = path.join(OUT_DIR, `${UMBRELLA_SKILL}.zip`);
const { buffer, files } = zipUmbrella(umbrella.entries);
fs.writeFileSync(zipPath, buffer);
log(
  `skill zip: ${path.relative(ROOT, zipPath)} — ${files} entries, ` +
    `${(buffer.length / 1024).toFixed(1)} KiB — upload this to 开放平台 → 发布管理 → 技能`,
);

if (MARKETPLACE) {
  const marketplacePath = path.join(OUT_DIR, `kaying-for-unity-workbuddy-${synced.version}.zip`);
  const zipped = zipDirectory(PACKAGE_DIR);
  fs.writeFileSync(marketplacePath, zipped.buffer);
  log(
    `marketplace zip: ${path.relative(ROOT, marketplacePath)} — ${zipped.files} entries, ` +
      `${(zipped.buffer.length / 1024).toFixed(1)} KiB`,
  );
  log(`marketplace: ${MARKETPLACE_NAME}   plugin: ${PLUGIN_NAME}@${synced.version}`);
} else {
  log("marketplace zip: skipped (pass --marketplace to write it)");
}

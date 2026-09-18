# Unity

[English](README.md) | [简体中文](README.zh-CN.md)

Unity's official game development plugin. Build, monetize, and operate Unity games
with guidance grounded in Unity's documented practices.

Available for **Claude Code**, **Codex**, and **Pi**.

## Install

**Claude Code** — these two are slash commands, so type them inside a Claude Code
session rather than in a terminal:

```
/plugin marketplace add kaying-studio/kaying-for-unity
```

```
/plugin install unity@kaying-for-unity
```

From a terminal instead, use the `claude` CLI. Installs done this way load the next
time you start Claude Code, or when you run `/reload-plugins` in an open session:

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

**Pi** — Pi loads packages that declare a `pi` manifest in `package.json` plus the
`pi-package` keyword. Install from a local checkout, npm, or git:

```bash
pi install /absolute/path/to/kaying-for-unity
# or:  pi install ./kaying-for-unity           (relative to your project)
# or:  pi install npm:kaying-for-unity
# or:  pi install git:github.com/kaying-studio/kaying-for-unity
```

`install` writes to user settings (`~/.pi/agent/settings.json`); pass `-l` to write to
project settings (`.pi/settings.json`) so the whole team shares it. To try it for a
single run without installing:

```bash
pi -e ./kaying-for-unity
```

The Pi port wires the plugin in three places (see `extensions/unity.ts` and
`.pi-plugin/plugin.json`):

- **`package.json`** — the Pi package manifest: `keywords: ["pi-package"]` for
  discoverability and `pi.skills` / `pi.extensions` declaring the 31 skills and the
  extension entry point.
- **`extensions/unity.ts`** — the Pi extension entry: contributes `skills/` through
  Pi's `resources_discover` event, sets a footer status inside Unity projects, and
  registers a `/unity` command (`info | skills | docs | doctor`).
- **`.pi-plugin/`** — the Pi-side manifest, mirroring the existing `.claude-plugin/`
  (Claude Code) and `.codex-plugin/` (Codex) manifests.

### Verify it worked

Each agent surfaces an installed plugin differently.

**Claude Code** — type `/unity:` and the skills appear in the command list. `/plugin`
also shows `unity` as installed and enabled.

**Codex** — run `codex plugin list`:

```
PLUGIN                    STATUS              VERSION
unity@kaying-for-unity  installed, enabled  0.1.6-beta
```

**Pi** — run `pi list` to see the package, then inside a session type `/unity skills`
to enumerate the bundled skills. `/unity doctor` reports whether the current directory
is a Unity project and whether the `unity` CLI is on `PATH`.

### Manual install

If you can't use the marketplace/install commands, link the checkout into your personal
skills directory instead.

**Claude Code:**

```bash
git clone https://github.com/kaying-studio/kaying-for-unity.git
ln -s "$(pwd)/kaying-for-unity" ~/.claude/skills/unity
```

**Pi** — link it into Pi's global skills directory, or add the path to `settings.json`:

```bash
ln -s "$(pwd)/kaying-for-unity" ~/.pi/agent/skills/unity
```

```json
{
  "skills": ["/path/to/kaying-for-unity/skills"]
}
```

It loads automatically in every project from your next session onward.

## Usage

Once installed, your agent uses the relevant skill automatically when you ask it to
do something in your Unity project. For example:

> "Add in-app purchases so players can buy a coin pack"
>
> "I want to build a settings screen"
>
> "My pixel art looks blurry and jitters when the camera moves"
>
> "Show rewarded video ads so players can earn coins"
>
> "Create a hexagonal tile palette for my level"
>
> "Chinese characters show up as empty boxes in my TextMeshPro labels"
>
> "Review my ScriptableRendererFeature for Render Graph problems"

In Claude Code the skills also appear in the slash menu, and in **Pi** they register as
`/skill:<name>` commands, so you can pick one explicitly instead of describing the task.

## Works with

Unity 6+.

## Issues and feedback

Found a bug or have a suggestion? Post in the
[Unity Discussions forum](https://discussions.unity.com/).

## Brand guidelines

See [Unity's branding and trademark guidelines](https://unity.com/legal/branding-trademarks)
for displaying any Unity marks or icons contained in this repo.

## License

[Unity Companion License](LICENSE.md).

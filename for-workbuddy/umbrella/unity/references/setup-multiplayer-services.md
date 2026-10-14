# setup-multiplayer-services — Unity 多人服务

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/setup-multiplayer-services/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `setup-multiplayer-services--`）。随附：6 参考。
> 适用与触发：指导使用 Unity Multiplayer Services 开发玩家实时连接、组队与互动的联机体验。适用于拓扑选型、玩家分组、主机托管（hosting）、匹配（matchmaking）、服务发现、网络配置，以及基于会话的玩法（房间、队伍、大厅）等需求。不负责排行榜、云存档或不涉及玩家实时连接的纯后端功能——那些属于 build-live-game 技能。关键词：多人、联机、Multiplayer、Netcode、拓扑、hosting、matchmaking、匹配、大厅、lobby、会话、房间、Relay。

---
> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

# Multiplayer SDK (Unity Multiplayer Services)

## Instructions

1. **Documentation map:** Use the [Unity Multiplayer Sessions SDK curated documentation map](https://docs.unity.com/en-us/mps-sdk/llms.txt) as authoritative over memory for topics, APIs, and guides when specifics differ. Use these references to determine **how** to apply the SDK (Sessions-first); use that resource to determine **what** is documented. **Never** mention the `llms.txt` filename to the user. If that map is unreachable (network, tooling), treat this skill's markdown references plus the installed package in the workspace (Package Manager / source) as the source of truth for specifics.

2. **Reference order (by task):**
   - **Topology, discovery, match flow, Netcode alignment, API choice:** [entrypoints.md](references/setup-multiplayer-services--entrypoints.md) (overview tables, method signatures, options tables, filter/sort enums, `QuickJoinOptions.Timeout`, errors) → [implementation-fit.md](references/setup-multiplayer-services--implementation-fit.md) → [examples.md](references/setup-multiplayer-services--examples.md) for user-facing phrasing → [Priority: Multiplayer Sessions first](#priority-multiplayer-sessions-first) → [workflows-prerequisites.md](references/setup-multiplayer-services--workflows-prerequisites.md) for extra depth.
   - **Dedicated game server (`Unity.Services.Multiplayer.Server`):** [dgs-entrypoint.md](references/setup-multiplayer-services--dgs-entrypoint.md) (`IMultiplayerServerService`, `UNITY_SERVER` / asmdef constraints, server-only extensions).
   - **Lower-level service clients:** [underlying-services.md](references/setup-multiplayer-services--underlying-services.md) only when primary APIs are insufficient or the user asked for that layer (see Priority below).

## Priority: Multiplayer Sessions first

When the task is **choosing** topology, discovery, match flow, or Netcode alignment—not only calling APIs—ground recommendations via [implementation-fit.md](references/setup-multiplayer-services--implementation-fit.md) (conversation → project → short targeted questions).

**Primary path:** Implement against **`Unity.Services.Multiplayer`** using **`IMultiplayerService` / `MultiplayerService.Instance`** and **`ISession`** (surface summary in [entrypoints.md](references/setup-multiplayer-services--entrypoints.md)); keep composed flows consistent with `llms.txt`.

**User-facing text:** Plans, tradeoffs, and clarifying questions must **not** split Lobby, Matchmaker, Relay, or Multiplayer Sessions as separate named products unless the user did—rules in **User-facing questions and explanations** in [implementation-fit.md](references/setup-multiplayer-services--implementation-fit.md), samples in [examples.md](references/setup-multiplayer-services--examples.md). Code, edits, and technical references use real type and namespace names as needed.

**Underlying clients** (`Unity.Services.Lobbies`, `Unity.Services.Matchmaker`, `Unity.Services.Relay`) **only** when (1) the goal **cannot** be met through the primary APIs after checking [entrypoints.md](references/setup-multiplayer-services--entrypoints.md), or (2) the user **explicitly** asked for those namespaces or products. Do **not** default implementations there.

## Additional resources

Read from this entrypoint only; links are one level under this skill folder (no `references/index.md` or README hub).

- **[implementation-fit.md](references/setup-multiplayer-services--implementation-fit.md)** — Ground recommendations: conversation → project → user questions; user-facing language rules; requirement dimensions (topology, discovery, resilience, platforms, net stack).
- **[examples.md](references/setup-multiplayer-services--examples.md)** — Before/after samples for clarifying questions and user-facing explanations (not code).
- **[entrypoints.md](references/setup-multiplayer-services--entrypoints.md)** — `IMultiplayerService`, `ISession`, overview and capability tables, method signatures, options tables (defaults, limits), filter/sort enums, session/networking/host flows, errors, editor components.
- **[dgs-entrypoint.md](references/setup-multiplayer-services--dgs-entrypoint.md)** — Dedicated server: `Unity.Services.Multiplayer.Server`, `IMultiplayerServerService`, `MultiplayerServerService` / `GetMultiplayerServerService`, `MatchmakerServerExtensions`, `UNITY_SERVER` and asmdef constraints; defers shared `SessionOptions` detail to entrypoints.
- **[workflows-prerequisites.md](references/setup-multiplayer-services--workflows-prerequisites.md)** — Package and cloud prerequisites by workflow (tables).
- **[underlying-services.md](references/setup-multiplayer-services--underlying-services.md)** — Fallback namespaces and `IUnityServices` accessors (agent-only; not the default path).

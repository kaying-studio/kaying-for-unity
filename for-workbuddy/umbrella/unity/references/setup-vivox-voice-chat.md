# setup-vivox-voice-chat — Unity Vivox 语音聊天

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/setup-vivox-voice-chat/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `setup-vivox-voice-chat--`）。随附：5 参考。
> 适用与触发：使用 Unity Vivox 为 Unity 联机游戏添加并配置语音聊天与文字聊天。覆盖 Android/iOS 麦克风设置与权限、语音活动检测（VAD）调参、设置界面里的音量与静音控制（VoiceVadMinimumVolume、麦克风滑条、静音按钮、说话指示）、FPS/合作游戏的距离感/3D 空间语音、队伍/派对/大厅/公会语音频道、按键说话（push-to-talk）、自己与其它玩家的静音、私聊/直接消息、游戏内文字聊天，以及 Vivox SDK 初始化与 Unity Authentication 登录。关键词：语音聊天、voice chat、麦克风、Vivox、VAD、push-to-talk、空间语音、组队语音、聊天、LoginAsync、JoinGroupChannelAsync。

---
> **WorkBuddy 运行前置**：原始技能清单声明的 UPM 前置包为 `com.unity.services.vivox: ">=16.4.0"`。WorkBuddy 不做强制校验，执行前请自行确认工程 `Packages/manifest.json` 已包含上述包，缺失时先安装（可参考 `unity-package-management` 技能）。

> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

# Unity Vivox — Voice & Text Chat

Namespace: `Unity.Services.Vivox` | Package: `com.unity.services.vivox`
Companion packages: `Unity.Services.Core`, `Unity.Services.Authentication`

Vivox v16+ replaced the v4 `Client` / `ILoginSession` / `IChannelSession` model with a single static entry point: **`VivoxService.Instance`**. All operations — init, login, channel join, messaging, muting — go through it. Do **not** use v4 patterns (`Client.Instance`, `AccountId`, `ChannelId`, `ILoginSession`, `UnityPurchasing.*`, etc.); those are gone in v16.

## Documentation Map

Use the [Unity Vivox curated documentation map](https://docs.unity.com/en-us/vivox-unity/llms.txt) as authoritative over memory for topics, APIs, and error codes when specifics differ. This skill and its references define **how** to apply the SDK; that resource defines **what** is documented. **Never** mention the `llms.txt` filename to the user. If it's unreachable, treat this skill's references plus the installed package in the workspace (Package Manager / source) as the source of truth.

## Detailed References

Read on demand — only when you need signatures, event details, or platform gotchas beyond what's in this file.

- **Init, sign-in, and access tokens:** [references/setup-vivox-voice-chat--init-and-login.md](references/setup-vivox-voice-chat--init-and-login.md)
- **Voice channels (positional and non-positional):** [references/setup-vivox-voice-chat--voice-channels.md](references/setup-vivox-voice-chat--voice-channels.md)
- **Text chat (channel messages and directed messages):** [references/setup-vivox-voice-chat--text-chat.md](references/setup-vivox-voice-chat--text-chat.md)
- **Events, participants, and cleanup:** [references/setup-vivox-voice-chat--events-and-participants.md](references/setup-vivox-voice-chat--events-and-participants.md)
- **Troubleshooting and platform notes:** [references/setup-vivox-voice-chat--troubleshooting.md](references/setup-vivox-voice-chat--troubleshooting.md)

## Initialization Order (Do Not Skip Steps)

The correct order is **UGS Core → Authentication sign-in → Vivox init → Vivox login**. Skipping or reordering these fails silently or throws obscure errors.

```csharp
using Unity.Services.Core;
using Unity.Services.Authentication;
using Unity.Services.Vivox;

async void Start()
{
    await UnityServices.InitializeAsync();
    await AuthenticationService.Instance.SignInAnonymouslyAsync();
    await VivoxService.Instance.InitializeAsync();
    // subscribe to events (see table below) BEFORE calling LoginAsync
    await VivoxService.Instance.LoginAsync(new LoginOptions { DisplayName = "Bob" });
}
```

- Calling `VivoxService.Instance.InitializeAsync()` twice throws `5041 VxErrorAlreadyInitialized`. Guard against re-init on scene reload.
- If Unity Authentication (`AuthenticationService`) is not used, the player identity falls back to a per-session GUID — display names still work but you lose cross-session identity. See [references/setup-vivox-voice-chat--init-and-login.md](references/setup-vivox-voice-chat--init-and-login.md) for the Vivox Access Token (VAT) alternative.

## Joining Channels

Vivox has three join methods, one per channel type. All are async but the join **completes via the `ChannelJoined` event, not by awaiting the call** — subscribe first, then call.

| Method | Purpose |
|---|---|
| `VivoxService.Instance.JoinGroupChannelAsync(name, ChatCapability, ChannelOptions?)` | Non-positional (party, team, lobby, guild) |
| `VivoxService.Instance.JoinEchoChannelAsync(name, ChatCapability, ChannelOptions?)` | Test channel that echoes your own audio back |
| `VivoxService.Instance.JoinPositionalChannelAsync(name, ChatCapability, Channel3DProperties, ChannelOptions?)` | 3D spatial audio driven by transform position |

`ChatCapability` values: `TextOnly`, `AudioOnly`, `TextAndAudio`.

**Limits:** max 10 non-positional channels per user; max 200 participants per channel. Exceeding either fails with `20502 VxXmppServerErrorServiceUnavailable`. For >200 in a positional channel, use the Large 3D channels enterprise setting.

Leave with `VivoxService.Instance.LeaveChannelAsync(channelName)` or `LeaveAllChannelsAsync()`. See [references/setup-vivox-voice-chat--voice-channels.md](references/setup-vivox-voice-chat--voice-channels.md) for `Channel3DProperties` fields and mic-permission handling on Android/iOS.

## Text Messaging

**Channel messages** (broadcast to all participants of a channel with `TextOnly` or `TextAndAudio`):

- Send: `VivoxService.Instance.SendChannelTextMessageAsync(string channelName, string message)`
- Receive: subscribe to `VivoxService.Instance.ChannelMessageReceived` (`Action<VivoxMessage>`)

**Directed messages** (peer-to-peer, no channel required):

- Send: `VivoxService.Instance.SendDirectTextMessageAsync(string playerId, string message)`
- Receive: subscribe to `VivoxService.Instance.DirectedMessageReceived` (`Action<VivoxMessage>`)

**Common hallucination:** the send method is `SendDirectTextMessageAsync` — **not** `SendDirectedTextMessageAsync`. The event, however, **is** `DirectedMessageReceived`. Note the asymmetry.

`VivoxMessage` fields: `ChannelName` (null for directed), `SenderDisplayName`, `SenderPlayerId`, `MessageText`, `ReceivedTime`, `Language`, `FromSelf`, `MessageId`.

Edit/delete APIs (`EditChannelTextMessageAsync`, `DeleteChannelTextMessageAsync`, `EditDirectTextMessageAsync`, `DeleteDirectTextMessageAsync`) and history (`GetChannelTextMessageHistoryAsync`, `GetDirectTextMessageHistoryAsync`) are covered in [references/setup-vivox-voice-chat--text-chat.md](references/setup-vivox-voice-chat--text-chat.md). Chat history retention is 7 days by default.

## Required Event Subscriptions

Subscribe to events **before** the corresponding async call. `LoggedIn` may fire immediately for reconnects; `ChannelJoined` fires as the join completes.

| Call | Success Event | Failure / Counterpart |
|---|---|---|
| `LoginAsync()` | `LoggedIn` | `LoggedOut` |
| `JoinGroupChannelAsync()` / `JoinEchoChannelAsync()` / `JoinPositionalChannelAsync()` | `ChannelJoined(string channelName)` | `ChannelLeft(string channelName)` |
| — (any joined channel) | `ParticipantAddedToChannel(VivoxParticipant)` | `ParticipantRemovedFromChannel(VivoxParticipant)` |
| `SendChannelTextMessageAsync()` (remote receive) | `ChannelMessageReceived(VivoxMessage)` | — |
| `SendDirectTextMessageAsync()` (remote receive) | `DirectedMessageReceived(VivoxMessage)` | — |

**Always unsubscribe in `OnDestroy` / `OnDisable`.** `VivoxService.Instance` is a persistent singleton — event handlers on destroyed MonoBehaviours will double-fire and NRE on scene reload.

Per-participant events (`ParticipantMuteStateChanged`, `ParticipantSpeechDetected`, `ParticipantAudioEnergyChanged`) live on the `VivoxParticipant` instance you receive from `ParticipantAddedToChannel` — not on `VivoxService.Instance`. See [references/setup-vivox-voice-chat--events-and-participants.md](references/setup-vivox-voice-chat--events-and-participants.md).

## Access Tokens (Brief)

The default path uses **UGS Authentication** — Vivox mints access tokens automatically from your UGS project once `AuthenticationService.Instance.SignInAnonymouslyAsync()` (or another sign-in method) has completed. **No manual token code is required** for standard flows.

Server-side Vivox Access Token (VAT) minting is only needed when you use a non-UGS identity system or when you need channel-scoped privileged tokens (kick, mute-all, transcription). See the "Access Token Developer Guide" section of the documentation map for language-specific server examples. Do not embed HMAC signing keys in the client.

## Validation

After writing code that uses this package:

1. Verify the project compiles without errors and that `using Unity.Services.Vivox;` resolves.
2. Confirm init order: `UnityServices.InitializeAsync` → `AuthenticationService.Instance.SignInAnonymouslyAsync` → `VivoxService.Instance.InitializeAsync` → `VivoxService.Instance.LoginAsync`.
3. No v4 legacy patterns: no `Client.Instance`, no `AccountId`, no `ChannelId`, no `ILoginSession`, no `IChannelSession`. All access goes through `VivoxService.Instance`.
4. All events consumed by the code are subscribed **before** the async call that triggers them, and are unsubscribed in `OnDestroy`.
5. Channel join code does not `await` the join call as if it completes join — it subscribes to `ChannelJoined` and reacts there.
6. Directed message send uses `SendDirectTextMessageAsync` (NOT `SendDirectedTextMessageAsync`). Directed message receive uses `DirectedMessageReceived`.
7. Android builds request `RECORD_AUDIO` at runtime before joining an audio channel; iOS builds have `NSMicrophoneUsageDescription` in the plist.
8. No HMAC signing keys or Vivox `SECRET`/`APP_ID` are embedded in client code — VAT-based flows are documented but delegated to a server.

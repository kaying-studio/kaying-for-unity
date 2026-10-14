# implement-in-app-purchases — Unity 内购 IAP

> 源：Unity 官方技能包 `kaying-for-unity@0.1.6-beta` 的 `skills/implement-in-app-purchases/SKILL.md`。
> 本技能的随附文件已平铺到本技能包的 `references/`、`templates/`、`scripts/` 下，文件名统一带 `<skill-name>--` 前缀（本技能为 `implement-in-app-purchases--`）。随附：13 参考。
> 适用与触发：实现、配置并调试 Unity 内购（IAP）——商店连接、商品目录、消耗型/非消耗型/订阅购买、两步待确认流程、收据校验、权益校验、恢复交易，以及 Apple 扩展（促销购买、Ask-to-Buy、兑换码）与 Google Play 扩展（订阅升降级）、D2C 直连客户能力、通过 Unity IAP / Unity Cloud 接入第三方支付（Stripe、Coda）。适用于从原生 Android/iOS 计费或第三方包（RevenueCat、Adapty、Essential Kit、Unipay）迁移到 IAP。关键词：内购、IAP、微交易、MTX、变现、订阅、收据校验、StoreKit、BillingClient、RevenueCat。

---
> 本技能由 Unity 官方插件移植并适配为 WorkBuddy 总入口技能包，正文与随附资料保持原样，仅对清单字段与子目录命名做了适配。

---

# Unity In-App Purchasing

Namespace: `UnityEngine.Purchasing` | Security: `UnityEngine.Purchasing.Security`
Package: `com.unity.purchasing`

**Unity IAP has its own initialization path** via `UnityIAPServices.StoreController()` → `store.Connect()`. It does not require `UnityServices.InitializeAsync()`, but they can coexist if your project uses other UGS services. If Analytics is present and `InitializeAsync()` is called, IAP will automatically send transaction events.

## Before You Start

**Always read [references/implement-in-app-purchases--pre-check.md](references/implement-in-app-purchases--pre-check.md) first.** It scans the project for third-party IAP packages, native Google Billing, and existing Unity IAP versions, then routes to the correct path. Do not read any other reference file or make any changes until routing is resolved.

## Detailed References

- **Project scan and path routing (read first):** See [references/implement-in-app-purchases--pre-check.md](references/implement-in-app-purchases--pre-check.md)
- **API signatures & code examples:** See [references/implement-in-app-purchases--api-notes.md](references/implement-in-app-purchases--api-notes.md)
- **Platform extensions (Apple, Google):** See [references/implement-in-app-purchases--platform-notes.md](references/implement-in-app-purchases--platform-notes.md)
- **Editing `IAPProductCatalog.json` (schema, decimal serialization, refresh):** See [references/implement-in-app-purchases--codeless-catalog.md](references/implement-in-app-purchases--codeless-catalog.md)
- **v4 → v5 migration:** See [references/implement-in-app-purchases--migration-v4-to-v5.md](references/implement-in-app-purchases--migration-v4-to-v5.md)
- **Convert native Google BillingClient to Unity IAP 5:** See [references/implement-in-app-purchases--path-convert-native-google-billing.md](references/implement-in-app-purchases--path-convert-native-google-billing.md)
- **Convert native iOS StoreKit plugin to Unity IAP 5:** See [references/implement-in-app-purchases--path-convert-native-storekit.md](references/implement-in-app-purchases--path-convert-native-storekit.md)
- **Convert Essential Kit billing to Unity IAP 5:** See [references/implement-in-app-purchases--convert-essentialkit.md](references/implement-in-app-purchases--convert-essentialkit.md)
- **UniPay (FLOBUK) — assessment and guidance:** See [references/implement-in-app-purchases--convert-unipay.md](references/implement-in-app-purchases--convert-unipay.md)
- **RevenueCat — conversion assessment and guidance:** See [references/implement-in-app-purchases--convert-revenuecat.md](references/implement-in-app-purchases--convert-revenuecat.md)
- **Adapty — conversion assessment and guidance:** See [references/implement-in-app-purchases--convert-adapty.md](references/implement-in-app-purchases--convert-adapty.md)
- **Add Unity IAP 5 to a project with no existing IAP:** See [references/implement-in-app-purchases--path-add-iap-to-new-project.md](references/implement-in-app-purchases--path-add-iap-to-new-project.md)
- **Implement IAP D2C Capabilities (third-party payment provider — Stripe/Coda, requires v5.4+):** See [references/implement-in-app-purchases--path-implement-iap-d2c.md](references/implement-in-app-purchases--path-implement-iap-d2c.md)

Read reference files on demand — only when you need specific API signatures, platform extension details, or migration mappings.

## Initialization Flow

1. Obtain `StoreController` via `UnityIAPServices.StoreController()` (or individual services via `DefaultStore()`, `DefaultProduct()`, `DefaultPurchase()`)
2. Subscribe to **all** required events (see Required Event Subscriptions below) **before** calling `Connect()`
3. `await store.Connect()` to connect to the platform store
4. On `OnStoreConnected`, call `store.FetchProducts(List<ProductDefinition>)` to load the catalog
5. On `OnProductsFetched`, products are ready for display and purchase

Use `Awake()` for initialization — ensures IAP is ready before other `Start()` methods.

Product types: `ProductType.Consumable`, `ProductType.NonConsumable`, `ProductType.Subscription`.

## Fetching Products

Define products as `List<ProductDefinition>` and pass to `store.FetchProducts()`. Use `StoreSpecificIds` when product IDs differ across Apple/Google stores. For complex catalogs, use `CatalogProvider` to manage product sets and store-specific IDs.

| Method | Behavior |
|---|---|
| `GetProducts()` | Returns the **cached** product list (synchronous, stale if `FetchProducts` not called) |
| `FetchProducts()` | Queries the **store** for fresh pricing/availability and updates the cache |
| `GetProductById(id)` | Returns a single cached product by ID |

These are NOT interchangeable. Always call `FetchProducts()` first before relying on `GetProducts()`.

## Two-Step Purchase Flow

IAP v5 uses a mandatory two-step flow: **Pending → Confirm**.

1. `store.PurchaseProduct(product)` — initiates the platform purchase dialog
2. `OnPurchasePending` fires — you receive a `PendingOrder`
3. Validate the receipt, grant content to the player
4. `store.ConfirmPurchase(pendingOrder)` — finalizes the transaction
5. `OnPurchaseConfirmed` fires — receives `Order` base type; pattern-match `ConfirmedOrder` (success) vs `FailedOrder` (confirmation failed)

**You MUST call `ConfirmPurchase(pendingOrder)` after granting content.** Unconfirmed purchases are re-delivered on next app launch to prevent lost purchases.

**De-duplication:** `OnPurchasePending` may fire multiple times for the same purchase (e.g., app restart before confirmation). Always check if content was already granted.

**Consumables:** Confirmed consumable purchases are NOT returned by `FetchPurchases`. Track consumable grants yourself (e.g., in Cloud Save or Economy).

**Deferred purchases:** `OnPurchaseDeferred` fires for Ask-to-Buy (iOS) and Google Play deferred purchases. Do NOT grant content — wait for `OnPurchasePending` when approved.

## Restore Transactions

`store.RestoreTransactions(callback)` re-delivers non-consumable and subscription purchases. Each restored purchase triggers `OnPurchasePending`.

Required on iOS for Apple App Store compliance — add a "Restore Purchases" button.

Apple non-renewable subscriptions **cannot be restored** via `RestoreTransactions`. Track these server-side.

## Receipt Validation

| Platform | Approach |
|---|---|
| **Google Play** | `CrossPlatformValidator` with `GooglePlayTangle.Data()` — local validation supported |
| **Apple (StoreKit 2)** | Local validation is a **no-op**. Use `order.Info.Apple?.jwsRepresentation` for server-side validation |

Generate tangle data via **Services > In-App Purchasing > Receipt Validation Obfuscator** in the Unity Editor.

## Entitlement Checking

Use when you don't have the `Order` and want to know the status of a specific product (replaces v4's `product.hasReceipt`). If you already have the `Order`, check its type instead: `PendingOrder` maps to `EntitledUntilConsumed` (consumables) or `EntitledButNotFinished` (non-consumables/subscriptions), `ConfirmedOrder` maps to `FullyEntitled`.

Call `store.CheckEntitlement(product)` and handle `store.OnCheckEntitlement`. Check `entitlement.Status == EntitlementStatus.FullyEntitled`.

`EntitlementStatus` values: `FullyEntitled`, `EntitledUntilConsumed`, `EntitledButNotFinished`, `NotEntitled`, `Unknown`.

## Fetch Existing Purchases

`store.FetchPurchases()` retrieves all current purchases from the store. Useful at app startup.

| Method | Behavior |
|---|---|
| `GetPurchases()` | Returns the **cached** purchase list |
| `FetchPurchases()` | Queries the **store** for current purchases and **overwrites** the cached list |

`FetchPurchases()` replaces the entire cached list on each call. Only non-consumables and subscriptions are re-fetched — confirmed consumables are not returned (see Two-Step Purchase Flow above).

## Subscription Info

Subscription info is on `IPurchasedProductInfo`, accessed via `order.Info.PurchasedProductInfo` — **NOT on `CartItem`** (`CartItem` only has `Product` and `Quantity`).

`IsSubscribed()` returns `Result` enum (`True`/`False`/`Unsupported`), NOT `bool`. Use `== Result.True` for null-safe comparison.

## Required Event Subscriptions

**Always subscribe to BOTH success and failure events.** Not subscribing to failure events generates runtime warnings.

| Call | Success Event | Failure Event (REQUIRED) |
|---|---|---|
| `FetchProducts()` | `OnProductsFetched` | `OnProductsFetchFailed` |
| `FetchPurchases()` | `OnPurchasesFetched` | `OnPurchasesFetchFailed` |
| `Connect()` | `OnStoreConnected` | `OnStoreDisconnected` |
| `PurchaseProduct()` | `OnPurchasePending` | `OnPurchaseFailed` |
| `CheckEntitlement()` | `OnCheckEntitlement` | — |

**Always subscribe to `OnPurchaseDeferred`** — fires for Ask-to-Buy (iOS) and Google Play deferred purchases. Not subscribing silently drops deferred purchases.

Subscribe to events **BEFORE** calling `Connect()` — pending purchases from a previous session may fire immediately.

## Failure Description Property Names

These property names are NOT interchangeable — using the wrong one causes CS1061:

| Type | Field | Property | NOT |
|---|---|---|---|
| `StoreConnectionFailureDescription` | `.message` | `.Message` | ~~`.reason`~~ |
| `ProductFetchFailed` | — | `.FailureReason`, `.FailedFetchProducts` | ~~`.Message`~~ |
| `FailedOrder` | — | `.FailureReason`, `.Details` | — |
| `PurchasesFetchFailureDescription` | `.message`, `.failureReason` | `.Message`, `.FailureReason` | — |

## Validation

After writing code that uses this package:
1. Verify the project compiles without errors.
2. Confirm all API calls match the v5 signatures in [api-notes.md](references/implement-in-app-purchases--api-notes.md) — do NOT use v4 legacy patterns (`IStoreListener`, `UnityPurchasing.Initialize`, `ConfigurationBuilder`).
3. Check the "Anti-Hallucination: Common v5 Mistakes" table in api-notes.md — do NOT use `OnStoreConnectionFailed` (use `OnStoreDisconnected`), do NOT pass callbacks to `FetchProducts`/`FetchPurchases` (use events), do NOT use `product.receipt` (use `order.Info.Receipt`).
4. Check that all required events are subscribed **before** calling `Connect()` (see Required Event Subscriptions table above).
5. Verify the two-step purchase flow: `OnPurchasePending` → grant content → `ConfirmPurchase(pendingOrder)`.
6. Confirm both success and failure events are subscribed for every async operation (`OnProductsFetched`/`OnProductsFetchFailed`, `OnStoreConnected`/`OnStoreDisconnected`, etc.).
7. If handling subscriptions, verify `IsSubscribed()` is compared with `== Result.True`, not cast to `bool`.
8. If updated files coexist with legacy versions in the same project, use a unique namespace (e.g., add `.Updated` suffix) to avoid CS0101/CS0111 compilation errors.
9. If the project subscribes to `OnAuthAccountChanged` (v5.4+): verify the handler re-fetches products and purchases from scratch — Unity IAP clears both caches before raising this event. Do not read `GetProducts()` or `GetPurchases()` inside the handler.

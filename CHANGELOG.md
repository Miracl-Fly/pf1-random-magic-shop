# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-10-29

### Added

- **Item Piles integration.** Generated shops can now become Item Piles merchants.
  - New `scripts/item-piles-bridge.js` with `isItemPilesAvailable()`,
    `buildMerchantData()`, `convertShopToItemPile()`, `isMerchantPile()`,
    `openShop()` and `placeShopToken()`.
  - Each shop that received items gets `flags.item-piles.data` with
    `type: "merchant"`, `enabled: true`, finite stock, infinite merchant currency,
    100 % buy / 50 % sell price modifiers, base price only, and
    `deleteWhenEmpty: false` so re-generating refills the same actor.
  - `flags.item-piles.version` is written alongside the data so Item Piles can
    migrate it correctly.
  - Chat summary now shows a **🛒 Open shop** link per shop, wired through
    `renderChatMessageHTML` (v13) with a `renderChatMessage` fallback.
- Two new world settings: **Turn generated shops into Item Piles merchants**
  (default on) and **Also place on the current scene** (default off).
- `test/item-piles-bridge.test.mjs` — 10 dependency-free assertions covering
  flag construction, the inactive-Item-Piles no-op path, and version stamping.
- Bilingual documentation: `README.md` (English), `README.zh-CN.md` (Chinese),
  `CHANGELOG.md`, `docs/PUBLISHING.md`, `docs/release-notes-v1.1.0.md`.

### Changed

- `generateShops()` now keeps an actor reference on each result entry so the
  bridge can convert it after generation.
- `module.json` version bumped to `1.1.0`; description mentions the Item Piles
  integration.

### Fixed

- Nothing user-facing in this release.

---

## [1.0.0] — 2026-10-28

### Added

- Initial release.
- Seven shop types: general store, weapon smith, armoury, potion shop,
  scroll shop, wand stall, wonderous item dealer.
- Eight settlement tiers (Thorp → Metropolis) driving minor / medium / major
  item counts.
- Core Rulebook treasure tables: weapon and armour enhancement bonuses,
  specific weapons and armours, melee / armour / shield special abilities,
  random item category table.
- Core Rulebook pricing formulas for magic weapons, armour, potions, scrolls
  and wands.
- Potion legality filter (skips `personal` range and `self` targets).
- Per-source-book spell whitelist with a checkbox configuration window.
- Token controls button and progress feedback in the generator window.

---

[1.1.0]: https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/tag/v1.0.0

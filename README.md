# PF1 Random Magic Shop

A Foundry VTT module that generates Pathfinder 1e magic shops — weapon smiths, armouries, potion and scroll shops, wand stalls, and wonderous item dealers — stocked according to the settlement size and the treasure tables from the Core Rulebook.

Optionally turns every generated shop into a fully functional **[Item Piles](https://foundryvtt.com/packages/item-piles)** merchant, so players can buy and sell right from the chat log.

> 中文说明见 [README.zh-CN.md](README.zh-CN.md)

---

## Features

- **7 shop types** — general store, weapon smith, armoury, potion shop, scroll shop, wand stall, wonderous item dealer.
- **8 settlement tiers** — Thorp → Hamlet → Village → Small town → Large town → Small city → Large city → Metropolis. The tier decides how many minor / medium / major items each shop rolls.
- **Core Rulebook treasure tables** — weapon and armour enhancement bonuses, specific weapons and armours, melee / armour / shield special abilities, and the random item category table.
- **Correct PF1 pricing** — magic weapons use `(enhancement + abilities)² × 2,000 gp + 300 gp + base price`; armour and shields use `× 1,000 gp + 150 gp + base price`.
- **Consumables with proper caster levels** — potions cap at spell level 3, scrolls at 9, wands at 4. Caster level starts at `max(1, level × 2 − 1)` with a configurable chance of a higher CL.
- **Potion legality check** — spells with a `personal` range or `self` target are skipped when rolling potions.
- **Source book whitelist** — restrict which PF1 source books (PZO codes) may contribute spells.
- **Item Piles integration** — one click turns a generated shop into a merchant that buys and sells.

## Requirements

| | |
|---|---|
| Foundry VTT | **13** (verified on 13, minimum 13) |
| Pathfinder 1e system (`pf1`) | 11 or newer |
| [`pf-content`](https://foundryvtt.com/packages/pf-content) | required — supplies the magic item and wonderous item compendiums |
| [`item-piles`](https://foundryvtt.com/packages/item-piles) | optional — needed only for the merchant feature |
| [`item-piles-pf1e`](https://foundryvtt.com/packages/item-piles-pf1e) | optional but strongly recommended with item-piles — teaches Item Piles how to read PF1 prices and currency |

## Installation

### From the Foundry module browser (recommended)

1. Open **Add-on Modules → Install Module**.
2. Paste this manifest URL into the *Manifest URL* field:

   ```
   https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
   ```

3. Click **Install**.

### Manual

Download `pf1-random-magic-shop-1.1.0.zip` from the [latest release](../../releases/latest), extract it into your `Data/modules/` folder, and make sure the result is `Data/modules/pf1-random-magic-shop/module.json`.

### After installing

Enable the module in **Settings → Manage Modules**, then reload the world (`F5`).

## Usage

1. Open the **Token Controls** toolbar and click the 🏪 **Magic Shop Generator** button.
2. Pick a settlement size, then click **Generate**.
3. The module creates one actor per shop type inside a folder named `<settlement> - Shops`, fills it with rolled items, and posts a summary to the chat log.

Re-running the generator on the same settlement **clears and re-rolls** the contents of the existing shop actors instead of creating duplicates.

### Item Piles merchants

With Item Piles active and the **Turn generated shops into Item Piles merchants** setting enabled (default), every shop that received items is flagged as an Item Piles merchant:

- sells its stock, **finite quantity** — once an item is bought out, it is gone;
- **infinite currency** — the merchant can always pay when a player sells to them;
- buys at 100 %, sells at 50 %, base price only;
- **is not deleted when emptied**, so re-generating refills the same actor.

Each chat line gets a **🛒 Open shop** link that opens the Item Piles trade interface directly.

## Settings

| Setting | Default | Description |
|---|---|---|
| **High CL chance** | `0.05` | Chance that a potion / scroll / wand is created at a caster level above the minimum (adds 1–5 levels). |
| **Allowed source books** | Core Rulebook | Which PF1 source books may contribute spells. Opens a checkbox list. |
| **Turn generated shops into Item Piles merchants** | on | Writes the Item Piles merchant flags onto each generated shop actor. Turn off to get plain actors. |
| **Also place on the current scene** | off | Drops a shop token at the centre of the current scene (skips shops that already have one). |

## How items are rolled

| Table | Used for |
|---|---|
| Weapon enhancement bonus | `+1` … `+5`, with special / specific results and re-rolls |
| Armour & shield enhancement bonus | `+1` … `+5`, with special / specific results |
| Specific weapons | Named weapons with fixed prices (e.g. *Flame Tongue*, 20,715 gp) |
| Specific armours | Named armours with fixed prices (e.g. *Celestial Armor*, 22,400 gp) |
| Melee / armour / shield special abilities | Rolled as bonus-equivalent abilities, capped at a total of +10 |
| Random item category | Decides whether a wonderous slot becomes armour, weapon, potion, scroll, wand, staff, ring or rod |

Consumable pricing follows the Core Rulebook formulas:

```
potion  = 50 gp × spell level × caster level
scroll  = 25 gp × spell level × caster level
wand    = 15 gp × spell level × caster level × 50 charges
```

## Compendiums used

The generator pulls base items and spells from these compendiums. Missing packs degrade gracefully — the affected shop simply produces fewer items.

| Pack ID | Used for |
|---|---|
| `pf1.items` | generic items, wonderous items (fallback) |
| `pf1.spells` | spell pool for potions, scrolls and wands |
| `pf1.weapons-and-ammo` | base weapons |
| `pf1.armors-and-shields` | base armour and shields |
| `pf-content.pf-magic-items` | staves and magic item fallbacks |
| `pf-content.pf-wondrous` | rings and rods |

## Compatibility

- Foundry VTT **13**.
- Pathfinder 1e **11.11** (declared minimum: 11).
- Uses `ApplicationV2` + `HandlebarsApplicationMixin` and the v13 `getSceneControlButtons` hook.
- Item Piles integration targets **item-piles 3.x** (`flags.item-piles.data` with `type: "merchant"`).

## Development

The Item Piles bridge has a dependency-free test suite that runs on plain Node:

```bash
node test/item-piles-bridge.test.mjs
```

It stubs the Foundry globals and asserts that merchant flags are written correctly — and, importantly, that **nothing is written when Item Piles is inactive**.

Release packaging and publishing steps are documented in [docs/PUBLISHING.md](docs/PUBLISHING.md).

## Known limitations

- Magic items are created with `quantity: 1`; a merchant sells each item once unless `infiniteQuantity` is enabled.
- Items priced at 0 gp are hidden in the merchant UI (`hideItemsWithZeroCost`).
- The generator does not roll cursed items, intelligent items, or artifacts.
- Shop actors are plain `npc` actors, so their sheets show PF1 NPC stat blocks rather than a dedicated shop sheet.
- Only the GM can run the generator; the chat link respects Item Piles' own permission checks.

## Credits

- Treasure tables and pricing follow the Pathfinder RPG Core Rulebook (PZO1110).
- Item Piles integration built against [item-piles](https://github.com/fantasycalendar/FoundryVTT-ItemPiles) 3.3.4 and [item-piles-pf1e](https://github.com/Alediran/item-piles-pf1e).

## License

[MIT](LICENSE)

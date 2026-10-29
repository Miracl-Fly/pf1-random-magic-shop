# Release v1.1.0 — Item Piles integration

> 本文件可直接粘贴到 GitHub Release 的说明框（Description）里。
> This file can be pasted straight into the GitHub Release description.

---

## English

### Highlights

**Random Magic Shop can now populate a real Item Piles merchant.** With Item Piles
active, every shop the generator fills with stock is flagged as a merchant — players
buy and sell from the chat log instead of copying items out of an NPC sheet.

- Each generated shop becomes an Item Piles merchant with **finite stock**,
  **infinite merchant currency**, 100 % buy / 50 % sell pricing, and base-price-only
  valuation.
- Emptied shops are **not deleted**, so re-running the generator refills the same actor
  instead of leaving a trail of duplicates.
- The chat summary gains a **🛒 Open shop** link per shop that opens the trade UI
  directly.
- Two new settings let you turn the behaviour off, or additionally drop shop tokens on
  the current scene.

### Upgrade notes

- No data migration required. Shops generated with 1.0.0 are plain NPC actors; running
  the generator once with 1.1.0 converts them in place.
- The Item Piles integration is **optional**. Without `item-piles`, the module behaves
  exactly as 1.0.0 and never touches actor flags.
- `item-piles-pf1e` is strongly recommended alongside `item-piles`; it teaches Item
  Piles how to read PF1 `system.price` and `system.currency`.

### Installation

Manifest URL:

```
https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
```

Or download `pf1-random-magic-shop-1.1.0.zip` below and extract it into `Data/modules/`.

### Requirements

- Foundry VTT 13
- Pathfinder 1e system 11+
- `pf-content` (required)
- `item-piles` + `item-piles-pf1e` (optional, for merchants)

### Full changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## 中文

### 重点

**随机魔法商店现在能直接变成真正的 Item Piles 商店了。** 装了 Item Piles 之后，
生成器填好货的每家店都会被标记成商人——玩家在聊天记录里点一下就能买卖，
不用再从 NPC 卡里往外拖物品。

- 每家店铺变成 Item Piles 商人：**库存有限**、**商人钱无限**、买入 100% / 卖出 50%、
  只按基础价估值。
- 卖空的店铺**不会被删除**，重新生成时补货到同一张卡，不会越生成越多。
- 聊天汇总里每家店后面多了 **🛒 打开商店**，点开就是交易界面。
- 两个新设置：可以关掉这个行为，也可以顺手把店铺 token 放到当前场景。

### 升级说明

- 不需要做数据迁移。1.0.0 生成的店铺是普通 NPC Actor，用 1.1.0 再生成一次就会原地转换。
- Item Piles 集成是**可选**的。没装 `item-piles` 时，模块行为和 1.0.0 完全一致，
  一个 flag 都不会写。
- 强烈建议 `item-piles` 搭配 `item-piles-pf1e` 一起装——后者负责让它读懂 PF1 的
  `system.price` 和 `system.currency`。

### 安装

Manifest 地址：

```
https://github.com/YOUR_GITHUB_USER/pf1-random-magic-shop/releases/latest/download/module.json
```

或者下载下面的 `pf1-random-magic-shop-1.1.0.zip`，解压到 `Data/modules/`。

### 依赖

- Foundry VTT 13
- Pathfinder 1e 系统 11+
- `pf-content`（必需）
- `item-piles` + `item-piles-pf1e`（可选，商店功能需要）

### 完整更新日志

见 [CHANGELOG.md](CHANGELOG.md)。
